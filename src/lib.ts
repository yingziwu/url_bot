import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export const AccessToken = Deno.env.get("AccessToken");
export const InstanceUrl = Deno.env.get("InstanceUrl");

if (!(AccessToken && InstanceUrl)) {
  throw new Error("获取 InstanceUrl、AccessToken 失败，请设置相应的环境变量。");
}

const baseUrl = `https://${InstanceUrl}`;
const baseHeaders = {
  Authorization: `Bearer ${AccessToken as string}`,
  Accept: "application/json, text/plain, */*",
};

export function get(input: string) {
  let url;
  if (input.startsWith("https://")) {
    url = input;
  } else {
    url = baseUrl + input;
  }
  console.debug(`[GET] ${url}`);
  return fetch(url, {
    headers: {
      ...baseHeaders,
    },
  });
}

export function post(
  input: string,
  body?: object,
  headers?: Record<string, string>
) {
  let url;
  if (input.startsWith("https://")) {
    url = input;
  } else {
    url = baseUrl + input;
  }
  console.debug(
    `[POST] ${url} ${JSON.stringify(body)} ${JSON.stringify(headers)}`
  );
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
}

export function parse(input: string) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function compareUrl(url1: string, url2: string) {
  const u1 = new URL(url1);
  const u2 = new URL(url2);
  if (u1.origin !== u2.origin || u1.pathname !== u2.pathname) {
    return false;
  }
  const u1kvs = [...u1.searchParams.entries()];
  const u2kvs = [...u2.searchParams.entries()];
  if (u1kvs.length !== u2kvs.length) {
    return false;
  }
  const u2map = new Map(u2kvs);
  for (const [k, v] of u1kvs) {
    if (
      u2map.get(k) === undefined ||
      unescape(v) !== unescape(u2map.get(k) as string)
    ) {
      return false;
    }
  }
  return true;
}

export async function sha1sum(input: string) {
  const enc = new TextEncoder();
  const arrayBuffer = enc.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
