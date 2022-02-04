///  <reference types="./mastodon.d.ts" />
import { deteleTaskList } from "./deteleTaskList.ts";
import { Delete, get, post } from "./http.ts";
import { sha1sum } from "./lib.ts";

/** 验证 Access Token */
export async function verifyToken(): Promise<Account> {
  const resp = await get("/api/v1/accounts/verify_credentials");
  const json = (await resp.json()) as Account;
  if (resp.ok) {
    return json;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

interface link {
  type: "next" | "prev";
  url: string;
}

async function getList<T>(
  url: string,
  breakTest?: (list: T[], next: link) => boolean,
): Promise<T[]> {
  const list: T[] = [];
  while (true) {
    const resp = await get(url);
    const json = (await resp.json()) as T[];
    if (resp.ok) {
      list.push(...json);
    } else {
      throw new Error(JSON.stringify(json));
    }
    const _link = resp.headers.get("link");

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
      if (typeof breakTest === "function") {
        if (breakTest(list, next)) {
          console.info("[getList] break");
          break;
        }
      }
      url = next.url;
    } else {
      break;
    }
  }
  return list;
}

/** 获取关注者列表 */
export function getFollows(id: string): Promise<Account[]> {
  return getList<Account>(`/api/v1/accounts/${id}/followers`);
}

/** 获取正在关注列表 */
export function getFollowings(id: string): Promise<Account[]> {
  return getList<Account>(`/api/v1/accounts/${id}/following`);
}

/** 关注用户 */
export async function follow(id: string) {
  const resp = await post(`/api/v1/accounts/${id}/follow`, { reblogs: true });
  const json = await resp.json();
  if (resp.ok) {
    return json as FollowResponse;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

/** 取关用户 */
export async function unfollow(id: string) {
  const resp = await post(`/api/v1/accounts/${id}/unfollow`);
  const json = await resp.json();
  if (resp.ok) {
    return json as FollowResponse;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

/** 获取特定嘟文 */
export async function getStatus(id: string) {
  const url = `/api/v1/statuses/${id}`;
  const resp = await get(url);
  const json = await resp.json();
  if (resp.ok) {
    return json as Status;
  } else if (resp.status === 404) {
    return null;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

/** 获取特定嘟文父子嘟文 */
export async function getStatusContext(id: string) {
  const url = `/api/v1/statuses/${id}/context`;
  const resp = await get(url);
  const json = await resp.json();
  if (resp.ok) {
    return json as {
      ancestors: Status[];
      descendants: Status[];
    };
  } else if (resp.status === 404) {
    return null;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

interface postStatusOptions {
  media_ids?: string[];
  poll?: Poll | null;
  in_reply_to_id?: string;
  sensitive?: boolean;
  spoiler_text?: string;
  visibility?: "public" | "unlisted" | "private" | "direct";
  scheduled_at?: string;
  language?: string;
  "Idempotency-Key"?: string;
}

/** 发送嘟文 */
export async function postStatus(
  status: string,
  options: postStatusOptions,
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

/** 删除嘟文 */
export async function deleteStatus(id: string) {
  const url = `/api/v1/statuses/${id}`;
  const resp = await Delete(url);
  const json = await resp.json();
  if (resp.ok) {
    return json as Status;
  } else {
    throw new Error(JSON.stringify(json));
  }
}

/** 发送过期自动删除嘟文 */
export async function postStatusWithExpire(
  status: string,
  options: postStatusOptions,
  seconds: number,
) {
  if (options.scheduled_at) {
    throw new Error("不支持发送 schedule status");
  }
  const ps = await postStatus(status, options) as Status;
  const timeoutID = setTimeout(async () => {
    try {
      await deleteStatus(ps.id);
      deteleTaskList.delete(ps.id);
    } catch (error) {
      console.error(error);
    }
  }, 1000 * seconds);
  deteleTaskList.set(ps.id, {
    id: ps.id,
    expired: Date.now() + 1000 * seconds,
    timeoutID,
  });
  return ps;
}

/** 获取特定帐户的嘟文数据 */
export function getAccoutStatus(
  accoutId: string,
  exclude_replies: boolean,
  timelimitSeconds?: number,
) {
  let limit = 0;
  if (timelimitSeconds) {
    limit = Date.now() - (timelimitSeconds * 1000);
  }
  const breakTest = (list: Status[], _next: link) => {
    const matchs = list.map((s) => s.created_at).filter((created_at) => {
      return new Date(created_at).getTime() - limit > 0;
    });
    return matchs.length === 0;
  };
  return getList<Status>(
    `/api/v1/accounts/${accoutId}/statuses${
      exclude_replies ? "" : "?exclude_replies=false"
    }`,
    breakTest,
  );
}
