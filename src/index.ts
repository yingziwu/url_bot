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
async function doFollow(follows: Account[], followings: Account[]) {
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
async function doUnfollow(follows: Account[], followings: Account[]) {
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
      //@ts-ignore
      poll: null,
      //@ts-ignore
      sensitive: false,
      //@ts-ignore
      spoiler_text: "",
      //@ts-ignore
      media_ids: [],
      //@ts-ignore
      in_reply_to_id: null,
      //@ts-ignore
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
  _follow();
  _streaming();

  async function _follow() {
    const follows = await getFollows(id);
    const followings = await getFollowings(id);

    // 启动时不再发起关注请求
    // const doFollowStatus = await doFollow(follows, followings);
    // console.info("doFollow", follows.length, followings.length, doFollowStatus);

    const doUnFollowStatus = await doUnfollow(follows, followings);
    console.info(
      "doUnfollow",
      follows.length,
      followings.length,
      doUnFollowStatus,
    );

    // 每隔6小时检测关注情况
    await sleep(1000 * 3600 * 6);
    _follow();
  }

  function _streaming() {
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
      Deno.addSignalListener("SIGINT", sigIntHandler);
      console.info("[websocket] open websocket");
      socketExist = true;
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
        handlerStatus(data);
      } else if (event === "notification") {
        const data = JSON.parse(payload) as Notification;
        if (data.type === "follow") {
          followNotification(data);
        }
        if (data.type === "mention") {
          if (data.status) {
            handlerStatus(data.status);
          }
        }
      } else if (["delete", "filters_changed"].includes(event)) {
        // pass
      } else {
        console.info(event, JSON.parse(payload));
      }

      async function handlerStatus(data: Status) {
        const {
          content,
          account,
          mentions,
          id: statusId,
          language,
          created_at,
        } = data;
        if (sessionStorage.getItem(statusId)) {
          return;
        }
        sessionStorage.setItem(statusId, JSON.stringify(true));
        if (account.id === id) {
          return;
        }
        // 发贴时间差大于1小时，检查子结点，以防重复发嘟
        if (Date.now() - new Date(created_at).getTime() > 1000 * 60 * 60) {
          const descendants = await getChildStatus(statusId);
          if (
            descendants.filter(
              (s) => s.in_reply_to_id === statusId && s.account.id === id,
            ).length !== 0
          ) {
            return;
          }
        }
        let _mentions = mentions.map((m) => m.acct);
        _mentions.push(account.acct);
        _mentions = Array.from(new Set(_mentions));

        const doc = parse(content);
        const aList = doc?.querySelectorAll(
          'a[rel="nofollow noopener noreferrer"]',
        );
        if (!aList) {
          return;
        }
        let urlList = Array.from(aList)
          .map((a) => (a as Element).getAttribute("href")?.trim())
          .filter((u) => u !== undefined) as string[];
        urlList = Array.from(new Set(urlList));
        if (urlList.length === 0) {
          return;
        }
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
          return;
        }
        const text = "发现含有追踪参数的链接或短链接，详情如下：\n\n" +
          texts.join("\n\n") +
          "\n\n" +
          _mentions.map((m) => `@${m}`).join(" ");
        postStatus(text, {
          in_reply_to_id: statusId,
          language: language ?? undefined,
          visibility: "unlisted",
        });
      }

      function followNotification(data: Notification) {
        console.info(`[streaming][notification] follow ${data.account.id}`);
        follow(data.account.id);
      }
    });

    console.debug('socket.addEventListener("error")');
    socket.addEventListener("error", async (ev) => {
      console.error(ev);
    });

    console.debug('socket.addEventListener("close")');
    socket.addEventListener("close", (ev) => {
      console.info("[websocket] closed!");
      socketExist = false;
    });

    async function sigIntHandler() {
      console.log("interrupted!");
      socket.close();
      await sleep(500);
      Deno.exit();
    }
  }
}

if (import.meta.main) {
  main();
}
