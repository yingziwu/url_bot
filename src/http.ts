
export const AccessToken = Deno.env.get("AccessToken");
export const InstanceUrl = Deno.env.get("InstanceUrl");
if(!(AccessToken && InstanceUrl)) {
  throw new Error("获取 InstanceUrl、AccessToken 失败，请设置相应的环境变量。");
}
const baseUrl = `https://${InstanceUrl}`;
const baseHeaders = {
  Authorization: `Bearer ${AccessToken as string}`,
  Accept: "application/json, text/plain, */*",
};

export function get(input: string) {
  let url;
  if(input.startsWith("https://")) {
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
  if(input.startsWith("https://")) {
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
