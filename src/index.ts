import { AccessToken, InstanceUrl } from "./http.ts";
import { compareUrl, getTexts, parse, sleep } from "./lib.ts";
import { clean } from "./removeTrackParam.ts";
import {
  deleteStatus,
  follow,
  getFollowings,
  getFollows,
  getStatus,
  getStatusContext,
  postStatus,
  postStatusWithExpire,
  unfollow,
  verifyToken,
} from "./mastodon.ts";

import { Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

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

/** 同步关注关系 */
async function syncFollowRelations(id: string) {
  const follows = await getFollows(id);
  const followings = await getFollowings(id);

  try {
    const syncUnfollowStatus = await syncUnfollow(follows, followings);
    console.info(
      "syncUnfollow",
      follows.length,
      followings.length,
      syncUnfollowStatus,
    );
  } catch (error) {
    console.error(error);
  }
}

/** 打开 WebSocket */
function openStream(id: string, acct: string) {
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
  socket.addEventListener("message", async (ev) => {
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
          } else if (await deleteCommandTest(data.status)) {
            handleDelete(data.status);
          } else {
            handleStatus(data.status);
          }
        }
      }
    } else if (["delete", "filters_changed"].includes(event)) {
      // console.info(event, JSON.parse(payload));
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
        visibility,
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
          visibility: visibility === "direct" ? "direct" : "unlisted",
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
        const _ms = mentions.map((m) => m.acct);
        const ms = new Set(_ms);
        ms.add(account.acct);
        ms.delete(acct);
        return Array.from(ms);
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
       * 发贴时间差大于2分钟，检查子嘟文，以防重复发嘟
       */
      async function descendantsCheck() {
        if (Date.now() - new Date(created_at).getTime() > 1000 * 60 * 2) {
          const context = (await getStatusContext(statusId));
          if (!context) {
            return true;
          }
          const descendants = context.descendants;
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
          "当您删除含有追踪参数的链接或短链接的嘟文后，可使用 delete 指令删除本条回复嘟文。\n更多信息可参见：https://bgme.me/@url/107733097656542346" +
          "\n\n" + _mentions.map((m) => `@${m}`).join(" ");
        return text;
      }
    }

    function handleFollow(data: Notification) {
      console.info(`[streaming][notification] follow ${data.account.id}`);
      follow(data.account.id).catch((err) => console.error(err));
    }

    function pingCommandTest(data: Status) {
      const elem = parse(data.content);
      return getTexts(elem).some((text) =>
        /(^|\s+)!ping(\s+|$)/.test(text.trim())
      );
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

    async function deleteCommandTest(data: Status) {
      const {
        id: statusId,
        in_reply_to_id,
        in_reply_to_account_id,
        account,
        content,
      } = data;
      if (!isIncludeDelete(content)) {
        return false;
      }

      if (in_reply_to_account_id !== id || !in_reply_to_id) {
        postNotification(statusId, account.acct).catch((error) =>
          console.error(error)
        );
        return false;
      }
      const parentStatus = await getStatus(in_reply_to_id) as Status;
      if (
        parentStatus.mentions.map((m) => m.acct).includes(account.acct) &&
        parentStatus.in_reply_to_id === null
      ) {
        return true;
      } else {
        postNotification(statusId, account.acct).catch((error) =>
          console.error(error)
        );
        return false;
      }

      function isIncludeDelete(_content: string) {
        const elem = parse(_content);
        return getTexts(elem).some((text) =>
          /(^|\s+)!delete(\s+|$)/.test(text.trim())
        );
      }

      function postNotification(
        in_reply_to_id: string,
        in_reply_to_account_acct: string,
      ) {
        const text =
          `接收到删除指令，但未执行删除操作。\n\n以下删除指令执行条件至少有一条未满足：\n- 删除指令嘟文无父嘟文或父嘟文非本BOT发送\n- 需删除嘟文提及（@）了您\n- 需删除嘟文的父嘟文已被删除\n\n本条通知嘟文将在3分钟后自动删除，如有更多疑问请联系 https://bgme.me/@bgme \n\n@${in_reply_to_account_acct}`;
        return postStatusWithExpire(text, {
          in_reply_to_id,
          visibility: "direct",
        }, 180);
      }
    }
    async function handleDelete(data: Status) {
      const {
        id: statusId,
        in_reply_to_id,
        account,
      } = data;
      try {
        await deleteStatus(in_reply_to_id as string);
        const text =
          `接收到删除指令，执行删除操作成功！\n\n本条通知嘟文将在3分钟后自动删除，如有更多疑问请联系 https://bgme.me/@bgme \n\n@${account.acct}`;
        await postStatusWithExpire(text, {
          in_reply_to_id: statusId,
          visibility: "direct",
        }, 180);
      } catch (error) {
        console.error(error);
      }
    }
  });

  console.debug('socket.addEventListener("error")');
  socket.addEventListener("error", async (ev) => {
    console.error(ev);
    setTimeout(() => {
      Deno.removeSignalListener("SIGINT", sigIntHandler);
      console.info("[websocket] Try to reopen websocket……");
      openStream(id, acct);
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

let socketExist = false;
async function main() {
  const { id, acct } = await verifyToken();
  syncFollowRelations(id);
  setInterval(() => {
    syncFollowRelations(id);
  }, 1000 * 3600 * 3);
  openStream(id, acct);
}

if (import.meta.main) {
  main();
}
