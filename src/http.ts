import "https://deno.land/x/dotenv/load.ts";

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

async function request(
  url: string,
  method: string,
  body?: BodyInit | null,
  headers?: Record<string, string>,
  timeout: number = 1000 * 10,
) {
  const controller = new AbortController();
  const signal = controller.signal;
  const tid = setTimeout(() => {
    controller.abort("Timeout!");
  }, 10000);
  try {
    const response = await fetch(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...baseHeaders,
          ...headers,
        },
        body,
        keepalive: true,
        signal,
      },
    );
    clearTimeout(tid);
    return response;
  } catch (error) {
    clearTimeout(tid);
    throw error;
  }
}

export function get(input: string) {
  let url;
  if (input.startsWith("https://")) {
    url = input;
  } else {
    url = baseUrl + input;
  }
  console.debug(`[GET] ${url}`);
  return request(url, "GET");
}

export function post(
  input: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  let url;
  if (input.startsWith("https://")) {
    url = input;
  } else {
    url = baseUrl + input;
  }
  const logObj = ["[POST]", url];
  if (body) {
    logObj.push(JSON.stringify(body));
  }
  if (headers) {
    logObj.push(JSON.stringify(headers));
  }
  console.debug(
    logObj.join(" "),
  );
  return request(url, "POST", body ? JSON.stringify(body) : null, headers);
}

export function Delete(
  input: string,
) {
  let url;
  if (input.startsWith("https://")) {
    url = input;
  } else {
    url = baseUrl + input;
  }
  console.debug(`[DELETE] ${url}`);
  return request(url, "DELETE");
}
