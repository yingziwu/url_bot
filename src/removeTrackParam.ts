import {
  specific,
  whitelist,
  general,
  shortURL,
  asterisk,
  ValueOf,
} from "./rules.ts";

function find(host: string, list: typeof specific | typeof whitelist) {
  const aster = list["*"] as asterisk;
  for (const [k, v] of [...aster.entries()]) {
    if (k.test(host)) {
      return v;
    }
  }

  let lastPos = 0;
  let domain = host;
  while (lastPos >= 0) {
    if (list[domain]) {
      return list[domain] as Exclude<ValueOf<typeof list>, asterisk>;
    }
    lastPos = host.indexOf(".", lastPos + 1);
    domain = host.slice(lastPos + 1);
  }
}

function removeTrackParm(_url: string) {
  const url = new URL(_url);
  const host = url.hostname;
  const search = url.searchParams;

  const keep: Map<string, string> = new Map();
  const white = find(host, whitelist);
  if (white) {
    if (typeof white === "boolean") {
      return url.href;
    } else {
      for (const w of white) {
        if (typeof w === "string") {
          const s = search.get(w);
          if (s) {
            keep.set(w, s);
          }
        } else if (w instanceof RegExp) {
          reKeep(w);
        } else {
          // Rule Object
          if (url.pathname.startsWith(w.pathname)) {
            if (typeof w.search === "string") {
              const s = search.get(w.search);
              if (s) {
                keep.set(w.search, s);
              }
            } else if (w.search instanceof RegExp) {
              reKeep(w.search);
            } else {
              // boolen
              return url.href;
            }
          }
        }
      }
    }
  }

  general.forEach((s) => search.delete(s));

  const special = find(host, specific);
  if (Array.isArray(special)) {
    special.forEach((s) => {
      if (typeof s === "string") {
        search.delete(s);
      } else if (s instanceof RegExp) {
        reRemove(s);
      } else {
        // Rule Object
        if (url.pathname.startsWith(s.pathname)) {
          if (typeof s.search === "string") {
            search.delete(s.search);
          } else if (s.search instanceof RegExp) {
            reRemove(s.search);
          }
        }
      }
    });
  }
  url.hash = "";

  [...keep.entries()].forEach(([k, v]) => search.set(k, v));
  return url.href;

  function reKeep(re: RegExp) {
    for (const [k, v] of [...search.entries()]) {
      if (re.test(k)) {
        keep.set(k, v);
      }
    }
  }

  function reRemove(re: RegExp) {
    for (const [k, v] of [...search.entries()]) {
      if (re.test(k)) {
        search.delete(k);
      }
    }
  }
}

async function expandUrl(_url: string, depth?: number): Promise<string> {
  if (depth === undefined) {
    depth = 0;
  } else {
    if (depth > 10) {
      throw new Error(`Too many redirct! ${_url}`);
    }
    depth = depth + 1;
  }
  const url = new URL(_url);
  const host = url.hostname;
  const handler = shortURL.get(host);
  if (handler) {
    const out = await handler(url.href);
    return expandUrl(out, depth);
  } else {
    return url.href;
  }
}

export async function clean(url: string) {
  url = await expandUrl(url);
  return removeTrackParm(url);
}

if (import.meta.main) {
  (async () => {
    const { parse } = await import("https://deno.land/std/flags/mod.ts");
    const args = parse(Deno.args);
    args._.forEach(async (url) => {
      console.info(
        `原URL：${url}\n处理后URL：${await clean(url as string)}\n\n`
      );
    });
  })();
}
