///  <reference types="./mastodon.d.ts" />
import { AccessToken, get, InstanceUrl, post } from "./http.ts";
import { compareUrl, parse, sha1sum, sleep } from "./lib.ts";
import { clean } from "./removeTrackParam.ts";

import { Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

async function verifyToken(): Promise<Account> {
  const resp = await get("/api/v1/accounts/verify_credentials");
  const json = (await resp.json()) as Account;
  if (resp.ok) {
    return json;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

async function getFollows(id: string): Promise<Account[]> {
  const follows: Account[] = [];
  let url = `/api/v1/accounts/${id}/followers`;

  while (true) {
    const resp = await get(url);
    const json = (await resp.json()) as Account[];
    if (resp.ok) {
      follows.push(...json);
    } else {
      throw new Error(JSON.stringify(json));
    }
    const _link = resp.headers.get("link");
    interface link {
      type: "next" | "prev";
      url: string;
    }
    const links = _link
      ?.split(",")
      .map((s) => s.split(";").map((ss) => ss.trim()))
      .map((item) => {
        const [u, t] = item;
        const url = u.substring(u.indexOf("<") + 1, u.lastIndexOf(">"));
        const type = t.substring(t.indexOf('rel="') + 5, t.lastIndexOf('"'));
        return {
          type,
          url,
        } as link;
      }) ?? [];
    const next = links.filter((item) => item.type === "next")[0];
    if (next) {
      url = next.url;
    } else {
      break;
    }
  }

  return follows;
}

async function getFollowings(id: string): Promise<Account[]> {
  const followings: Account[] = [];
  let url = `/api/v1/accounts/${id}/following`;

  while (true) {
    const resp = await get(url);
    const json = (await resp.json()) as Account[];
    if (resp.ok) {
      followings.push(...json);
    } else {
      throw new Error(JSON.stringify(json));
    }
    const _link = resp.headers.get("link");
    interface link {
      type: "next" | "prev";
      url: string;
    }
    const links = _link
      ?.split(",")
      .map((s) => s.split(";").map((ss) => ss.trim()))
      .map((item) => {
        const [u, t] = item;
        const url = u.substring(u.indexOf("<") + 1, u.lastIndexOf(">"));
        const type = t.substring(t.indexOf('rel="') + 5, t.lastIndexOf('"'));
        return {
          type,
          url,
        } as link;
      }) ?? [];
    const next = links.filter((item) => item.type === "next")[0];
    if (next) {
      url = next.url;
    } else {
      break;
    }
  }

  return followings;
}

async function follow(id: string) {
  const resp = await post(`/api/v1/accounts/${id}/follow`, { reblogs: true });
  const json = await resp.json();
  if (resp.ok) {
    return json as FollowResponse;
  } else {
    throw new Error(JSON.stringify(json));
  }
}
/** 自动回关
 * 回关所有关注自己的用户
 */
async function syncFollow(follows: Account[], followings: Account[]) {
  const followingIds = followings.map((f) => f.id);

  const tasks = follows
    .map((f) => f.id)
    .filter((id) => !followingIds.includes(id))
    .map((id) => follow(id));
  return await Promise.all(tasks);
}

async function unfollow(id: string) {
  const resp = await post(`/api/v1/accounts/${id}/unfollow`);
  const json = await resp.json();
  if (resp.ok) {
    return json as FollowResponse;
  } else {
    throw new Error(JSON.stringify(json));
  }
}
/** 自动取关
 * 自动取关不再关注自己的用户
 */
async function syncUnfollow(follows: Account[], followings: Account[]) {
  const followIds = follows.map((f) => f.id);

  const tasks = followings
    .map((f) => f.id)
    .filter((id) => !followIds.includes(id))
    .map((id) => unfollow(id));
  return await Promise.all(tasks);
}

async function getChildStatus(id: string) {
  const url = `/api/v1/statuses/${id}/context`;
  const resp = await get(url);
  const json = (await resp.json()) as {
    ancestors: Status[];
    descendants: Status[];
  };
  return json.descendants;
}

async function postStatus(
  status: string,
  options: {
    media_ids?: string[];
    poll?: Poll | null;
    in_reply_to_id?: string;
    sensitive?: boolean;
    spoiler_text?: string;
    visibility?: "public" | "unlisted" | "private" | "direct";
    scheduled_at?: string;
    language?: string;
    "Idempotency-Key"?: string;
  },
) {
  const resp = await post(
    "/api/v1/statuses",
    {
      status,
      poll: null,
      sensitive: false,
      spoiler_text: "",
      media_ids: [],
      in_reply_to_id: null,
      visibility: "public",
      ...options,
    },
    {
      "Idempotency-Key": options["Idempotency-Key"]
        ? options["Idempotency-Key"]
        : await sha1sum(status + JSON.stringify(options)),
    },
  );
  const json = await resp.json();
  if (resp.ok) {
    return json as Status | ScheduledStatus;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

let socketExist = false;
async function main() {
  const { id } = await verifyToken();
  syncFollowRelations();
  openStream();

  async function syncFollowRelations() {
    const follows = await getFollows(id);
    const followings = await getFollowings(id);

    const syncUnfollowStatus = await syncUnfollow(follows, followings);
    console.info(
      "syncUnfollow",
      follows.length,
      followings.length,
      syncUnfollowStatus,
    );

    // 每隔6小时检测关注情况
    await sleep(1000 * 3600 * 6);
    syncFollowRelations();
  }

  function openStream() {
    console.info(`socketExist: ${socketExist}`);
    if (socketExist) {
      return;
    }
    const socket = new WebSocket(
      `wss://${InstanceUrl}/api/v1/streaming/?access_token=${AccessToken}`,
    );

    console.debug('socket.addEventListener("open")');
    socket.addEventListener("open", (ev) => {
      socket.send('{"type":"subscribe","stream":"user"}');
      socket.send('{"type":"subscribe","stream":"public"}');
      socketExist = true;
      Deno.addSignalListener("SIGINT", sigIntHandler);
      console.info("[websocket] open websocket");
    });

    console.debug('socket.addEventListener("message")');
    socket.addEventListener("message", (ev) => {
      const { event, payload } = JSON.parse(ev.data) as {
        stream: string[];
        event: "update" | "notification" | "delete" | "filters_changed";
        payload: string;
      };
      if (event === "update") {
        const data = JSON.parse(payload) as Status;
        handleStatus(data);
      } else if (event === "notification") {
        const data = JSON.parse(payload) as Notification;
        if (data.type === "follow") {
          handleFollow(data);
        }
        if (data.type === "mention") {
          if (data.status) {
            if (pingCommandTest(data.status)) {
              handlePing(data.status);
            } else {
              handleStatus(data.status);
            }
          }
        }
      } else if (["delete", "filters_changed"].includes(event)) {
        // pass
      } else {
        console.info(event, JSON.parse(payload));
      }

      async function handleStatus(data: Status) {
        if (data.reblog) {
          data = data.reblog;
        }
        const {
          content,
          account,
          mentions,
          id: statusId,
          language,
          created_at,
        } = data;
        if (duplicateCheck()) {
          return;
        }
        const _mentions = getMentions();
        const urlList = getUrlList();
        if (urlList.length === 0) {
          return;
        }
        if (await descendantsCheck()) {
          return;
        }
        const statusText = await getStatusText();
        if (statusText) {
          postStatus(statusText, {
            in_reply_to_id: statusId,
            language: language ?? undefined,
            visibility: "unlisted",
          }).catch((error) => {
            console.error("发送嘟文失败！");
            console.error(error);
          });
        }

        /** 重复发嘟检测，防止重复发嘟 */
        function duplicateCheck() {
          if (sessionStorage.getItem(statusId)) {
            return true;
          }
          sessionStorage.setItem(statusId, JSON.stringify(true));
          if (account.id === id) {
            return true;
          }
          return false;
        }
        /** 获取 mention 列表 */
        function getMentions() {
          const ms = mentions.map((m) => m.acct);
          ms.push(account.acct);
          return Array.from(new Set(ms));
        }
        /** 获取 URL 列表 */
        function getUrlList() {
          const elem = parse(content);
          const aList = elem.querySelectorAll(
            'a[rel="nofollow noopener noreferrer"]',
          );
          if (!aList) {
            return [];
          }
          const ul = Array.from(aList)
            .map((a) => (a as Element).getAttribute("href")?.trim())
            .filter((u) => u !== undefined) as string[];
          return Array.from(new Set(ul));
        }
        /** 转发贴检测
         * 发贴时间差大于2分钟，检查子嘟文，以防重复发嘟 */
        async function descendantsCheck() {
          if (Date.now() - new Date(created_at).getTime() > 1000 * 60 * 2) {
            const descendants = await getChildStatus(statusId);
            return descendants.filter(
              (s) => s.in_reply_to_id === statusId && s.account.id === id,
            ).length !== 0;
          }
          return false;
        }
        /** 获取嘟文文本 */
        async function getStatusText() {
          const urlItems = await Promise.all(
            urlList.map(async (u) => ({
              before: u,
              after: await clean(u),
            })),
          );
          const texts = urlItems
            .filter((item) => compareUrl(item.before, item.after) === false)
            .map((item) => {
              console.info(item);
              return `原链接：${item.before}\n净化后链接：${item.after}`;
            });
          if (texts.length === 0) {
            return null;
          }
          const text = "发现含有追踪参数的链接或短链接，详情如下：\n\n" +
            texts.join("\n\n") +
            "\n\n" +
            _mentions.map((m) => `@${m}`).join(" ");
          return text;
        }
      }

      function handleFollow(data: Notification) {
        console.info(`[streaming][notification] follow ${data.account.id}`);
        follow(data.account.id);
      }

      function pingCommandTest(data: Status) {
        const elem = parse(data.content);
        return /(^|\s+)!ping(\s+|$)/.test(elem.innerText);
      }
      function handlePing(data: Status) {
        const {
          id: statusId,
          account,
          created_at,
          visibility,
        } = data;
        const statusText = `pong!\nping at ${created_at}\npong at ${
          new Date().toISOString()
        }\ntook ${
          Date.now() - new Date(created_at).getTime()
        } ms\n\n@${account.acct}`;
        postStatus(statusText, {
          in_reply_to_id: statusId,
          visibility,
        }).catch((error) => {
          console.error("发送嘟文失败！");
          console.error(error);
        });
      }
    });

    console.debug('socket.addEventListener("error")');
    socket.addEventListener("error", async (ev) => {
      console.error(ev);
      setTimeout(() => {
        Deno.removeSignalListener("SIGINT", sigIntHandler);
        console.info("[websocket] Try to reopen websocket……");
        openStream();
      }, 1000 * 30);
    });

    console.debug('socket.addEventListener("close")');
    socket.addEventListener("close", (ev) => {
      socketExist = false;
      console.info("[websocket] closed!");
    });

    async function sigIntHandler() {
      console.log("interrupted!");
      if (socketExist) {
        socket.close();
      }
      await sleep(300);
      Deno.exit();
    }
  }
}

if (import.meta.main) {
  main();
}
