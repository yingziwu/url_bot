///  <reference types="./mastodon.d.ts" />
import { deleteTask, deteleTaskList } from "./deteleTaskList.ts";
import { AccessToken, InstanceUrl } from "./http.ts";
import { compareUrl, getTexts, parse, sleep } from "./lib.ts";
import { clean } from "./removeTrackParam.ts";
import { test as federatedTimelineIgnoreTest } from "./rules-federatedTimelineIgnore.ts";
import {
  deleteStatus,
  follow,
  getAccoutStatus,
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

// noinspection JSUnusedLocalSymbols
/** 自动回关
 *
 * 回关所有关注自己的用户
 */
async function _syncFollow(follows: Account[], followings: Account[]) {
  const followingIds = followings.map((f) => f.id);

  const tasks = follows
    .map((f) => f.id)
    .filter((id) => !followingIds.includes(id))
    .map((id) => follow(id));
  return await Promise.all(tasks);
}

/** 自动取关
 *
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
  followsGlobal = follows;
  followingsGlobal = followings;

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
  socket.addEventListener("open", (_ev) => {
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
            handleMentionStatus(data.status);
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
      if (visibilityCheck()) {
        return;
      }
      if (nobotCheck()) {
        return;
      }
      if (duplicateCheck()) {
        return;
      }
      const _mentions = getMentions();
      const urlItems = await getUrlItems();
      if (urlItems.length === 0) {
        return;
      }
      if (await descendantsCheck()) {
        return;
      }
      const statusText = getStatusText();
      followOnlyWarning();
      return postStatus(statusText, {
        in_reply_to_id: statusId,
        language: language ?? undefined,
        visibility: visibility === "direct" ? "direct" : "unlisted",
      }).catch((error) => {
        console.error("发送嘟文失败！");
        console.error(error);
      });

      /** 是否为普通用户
       *
       * 特殊用户检测
       * - 发出的嘟文的用户为正在关注以及关注者
       * - 提及了自己的嘟文的用户
       *
       * 符合任一条件返回 false
       */
      function isNormalUser() {
        if (
          followingsGlobal.map((f) => f.acct).includes(account.acct) ||
          followsGlobal.map((f) => f.acct).includes(account.acct)
        ) {
          // 正在关注以及关注者发出的嘟文
          return false;
        } else {
          // 提及了自己的嘟文
          return !mentions.map((f) => f.acct).includes(acct);
        }
      }

      /** 可见度检测
       *
       * 通过条件：
       * - 属性为 public 的嘟文
       * - 正在关注用户发出的嘟文
       * - 提及了自己的嘟文
       */
      function visibilityCheck() {
        if (visibility === "public") {
          // 属性为 public 的嘟文
          return false;
        } else {
          return isNormalUser();
        }
      }

      /** #nobot 标签检测 */
      function nobotCheck() {
        if (isNormalUser()) {
          // 是否包含 #nobot
          return account.note.toLowerCase().includes("#<span>nobot</span>") ||
            account.note.toLowerCase().includes("#nobot");
        } else {
          return false;
        }
      }

      /** 重复发嘟检测，防止重复发嘟 */
      function duplicateCheck() {
        if (sessionStorage.getItem(statusId)) {
          return true;
        }
        sessionStorage.setItem(statusId, JSON.stringify(true));
        return account.id === id;
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
      async function getUrlItems() {
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

        const urlList = Array.from(new Set(ul)).filter((u) => {
          if (isNormalUser()) {
            return !federatedTimelineIgnoreTest(u);
          } else {
            return true;
          }
        });
        const urlItems = await Promise.all(
          urlList.map(async (u) => ({
            before: u,
            after: await clean(u),
          })),
        );
        return urlItems.filter((item) => !compareUrl(item.before, item.after));
      }

      /** 转发贴检测
       *
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
      function getStatusText() {
        const texts = urlItems
          .map((item) => {
            console.info(item);
            return `原链接：${item.before}\n净化后链接：${item.after}`;
          });
        return "发现含有追踪参数的链接或短链接，详情如下：\n\n" +
          texts.join("\n\n") +
          "\n\n" +
          "当您删除含有追踪参数的链接或短链接的嘟文后，可使用 delete 指令删除本条回复嘟文。\n更多信息可参见：https://bgme.me/@url/107733097656542346" +
          "\n\n" + _mentions.map((m) => `@${m}`).join(" ");
      }

      function followOnlyWarning() {
        if (visibility === "private") {
          const warningText =
            `注意到您这条嘟文的可见度为 Followers-only，出于让查看当前嘟串的所有嘟友均可见，以避免其点击追踪链接的考量，回复嘟文的可见度为 unlisted。\n这可能泄露您隐私信息，敬请特别注意。\n您可以通过 delete 指令删除相应回复嘟文，具体可参见： https://bgme.me/@url/107733097656542346 \n\n本条通知嘟文将在10分钟后自动删除。\n@${account.acct}`;
          postStatusWithExpire(warningText, {
            in_reply_to_id: statusId,
            language: language ?? undefined,
            visibility: "direct",
          }, 600).catch((error) => {
            console.error("发送嘟文失败！");
            console.error(error);
          });
        }
      }
    }

    function handleFollow(data: Notification) {
      console.info(`[streaming][notification] follow ${data.account.id}`);
      followsGlobal.push(data.account);
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
        parentStatus.mentions.map((m) => m.acct).includes(account.acct)
      ) {
        if (parentStatus.in_reply_to_id === null) {
          return true;
        } else {
          const ppStatus = await getStatus(parentStatus.in_reply_to_id);
          if (ppStatus === null) {
            return true;
          }
        }
      }
      postNotification(statusId, account.acct).catch((error) =>
        console.error(error)
      );
      return false;

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
          `接收到删除指令，但未执行删除操作。\n\n以下删除指令执行条件至少有一项未满足：\n- 删除指令嘟文父嘟文必须为本BOT发送\n- 需删除嘟文提及（@）了您\n- 需删除嘟文的父嘟文已被删除\n\n本条通知嘟文将在3分钟后自动删除，如有更多疑问请联系 https://bgme.me/@bgme \n\n@${in_reply_to_account_acct}`;
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
          `接收到删除指令，执行删除操作成功！\n您现在可以移除删除指令嘟文了。\n\n本条通知嘟文将在3分钟后自动删除，如有更多疑问请联系 https://bgme.me/@bgme \n\n@${account.acct}`;
        await postStatusWithExpire(text, {
          in_reply_to_id: statusId,
          visibility: "direct",
        }, 180);
      } catch (error) {
        console.error(error);
      }
    }

    async function handleMentionStatus(data: Status) {
      const s = await handleStatus(data);
      if (!s) {
        const text =
          `已收到您的嘟文，但未在您的嘟文中发现指令、含有追踪参数的链接或短链接。\n如查您尝试使用指令，请确保单词前已包含 ! 。\n如您尝试过滤链接，这可能由于过滤规则不完善造成。\n您可以联系 https://bgme.me/@bgme 寻求进一步帮助。\n\n本条通知嘟文将在3分钟后自动删除。\n\n@${data.account.acct}`;
        postStatusWithExpire(text, {
          in_reply_to_id: data.id,
          visibility: "direct",
          language: data.language ?? undefined,
        }, 180).catch((error) => {
          console.error("发送嘟文失败！");
          console.error(error);
        });
      }
    }
  });

  console.debug('socket.addEventListener("error")');
  socket.addEventListener("error", (ev) => {
    console.error(ev);
    setTimeout(() => {
      Deno.removeSignalListener("SIGINT", sigIntHandler);
      console.info("[websocket] Try to reopen websocket……");
      openStream(id, acct);
    }, 1000 * 30);
  });

  console.debug('socket.addEventListener("close")');
  socket.addEventListener("close", (_ev) => {
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

/** 清理未完成的删除任务 */
function clearDeleteTasks() {
  const tasks = deteleTaskList.getAll();
  console.info(`[clearDeleteTasks] Task list length: ${tasks.length}`);
  tasks.forEach((task) => handler(task));

  function handler(task: deleteTask) {
    let diff = task.expired - Date.now();
    if (diff < 0) {
      diff = 0;
    }
    clearTimeout(task.timeoutID);
    // noinspection UnnecessaryLocalVariableJS
    const timeoutID = setTimeout(async () => {
      try {
        await deleteStatus(task.id);
        deteleTaskList.delete(task.id);
      } catch (error) {
        console.error(error);
      }
    }, diff);
    task.timeoutID = timeoutID;
    deteleTaskList.set(task.id, task);
  }
}

/** 清理失去父嘟文的回复嘟文 */
async function deleteOrphanStatus(id: string, timeLimitSeconds?: number) {
  const statusList = await getAccoutStatus(id, false, timeLimitSeconds);
  const orphanList = statusList.filter((s) =>
    s.content.includes("发现含有追踪参数的链接或短链接，详情如下：") && s.in_reply_to_id === null
  );
  const taskIds = orphanList.map((s) => s.id);
  const timeCost = (taskIds.length / 60) * 3600 * 1000;
  console.info(
    `[deleteOrphanStatus] Delete Task list length: ${taskIds.length}, expect time cost: ${timeCost} ms`,
  );
  taskIds.forEach((tid) => handler(tid));

  function handler(taskId: string) {
    const delay = Math.floor(timeCost * 2 * Math.random());
    const timeoutID = setTimeout(async () => {
      try {
        await deleteStatus(taskId);
        deteleTaskList.delete(taskId);
      } catch (error) {
        console.error(error);
      }
    }, delay);
    deteleTaskList.set(taskId, {
      id: taskId,
      expired: Date.now() + delay,
      timeoutID,
    });
  }
}

let socketExist = false;
let followsGlobal: Account[], followingsGlobal: Account[];

async function main() {
  const { id, acct } = await verifyToken();
  await syncFollowRelations(id);
  setInterval(() => {
    syncFollowRelations(id);
  }, 1000 * 3600);
  await clearDeleteTasks();
  setInterval(() => {
    clearDeleteTasks();
  }, 1000 * 3600);
  openStream(id, acct);
  deleteOrphanStatus(id);
  setInterval(() => {
    deleteOrphanStatus(id);
  }, 1000 * 3600 * 8);
}

if (import.meta.main) {
  main();
}
