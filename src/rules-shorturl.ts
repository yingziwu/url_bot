import { parse } from "./lib.ts";

async function get(
  url: string,
  headers: Record<string, string> = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language":
      "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4495.0 Safari/537.36",
    "Upgrade-Insecure-Requests": "1",
  },
  redirect: RequestRedirect = "follow",
) {
  const controller = new AbortController();
  const signal = controller.signal;
  const tid = setTimeout(() => {
    controller.abort("Timeout!");
  }, 10000);
  console.debug(`[GET] ${url}`);
  try {
    const response = await fetch(url, {
      headers,
      redirect,
      signal,
    });
    clearTimeout(tid);
    return response;
  } catch (error) {
    clearTimeout(tid);
    throw error;
  }
}

async function followA(url: string, getFunc = get) {
  const resp = await getFunc(url);
  await resp.body?.cancel();
  return resp.url;
}

async function followM(url: string) {
  while (true) {
    try {
      const resp = await get(url, undefined, "manual");
      if (resp.status >= 300 && resp.status < 400) {
        await resp.body?.cancel();
        const location = resp.headers.get("location");
        if (location) {
          url = location;
        } else {
          return url;
        }
      } else {
        await resp.body?.cancel();
        return resp.url;
      }
    } catch (error) {
      console.error(error);
      return url;
    }
  }
}

async function follow(url: string) {
  try {
    const result = await followA(url);
    return result;
  } catch (error) {
    return await followM(url);
  }
}

async function extractFromHTML(url: string, selector: string) {
  const resp = await get(url);
  if (new URL(resp.url).hostname === new URL(url).hostname) {
    const elem = parse(await resp.text());
    const out = elem.querySelector(selector)?.getAttribute("href")?.trim();
    if (out) {
      return out;
    } else {
      throw new Error(`展开短网址时出错：${url}`);
    }
  } else {
    await resp.body?.cancel();
    return resp.url;
  }
}

async function AdFly(url: string) {
  const resp = await get(url);
  // https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt
  const domainList = [
    "activeation.com",
    "activetect.net",
    "adf.ly",
    "atabencot.net",
    "atharori.net",
    "atomcurve.com",
    "atominik.com",
    "auto-login-xxx.com",
    "ay.gy",
    "babblecase.com",
    "baymaleti.net",
    "bitigee.com",
    "bluenik.com",
    "brightvar.bid",
    "briskgram.net",
    "brisktopia.com",
    "casualient.com",
    "chinnica.net",
    "cinebo.net",
    "clearload.bid",
    "coginator.com",
    "cogismith.com",
    "cowner.net",
    "dl.android-zone.org",
    "dl.underclassblog.com",
    "dataurbia.com",
    "download.replaymod.com",
    "fiaharam.net",
    "gatustox.net",
    "gdanstum.net",
    "gloyah.net",
    "gusimp.net",
    "j.gs",
    "kaitect.com",
    "kializer.com",
    "kibuilder.com",
    "kimechanic.com",
    "larati.net",
    "meriabub.net",
    "microify.com",
    "mmoity.com",
    "picocurl.com",
    "pintient.com",
    "q.gs",
    "quainator.com",
    "quamiller.com",
    "queuecosm.bid",
    "rd.consoletarget.com",
    "riffhold.com",
    "scuseami.net",
    "simizer.com",
    "skamaker.com",
    "skamason.com",
    "sostieni.ilwebmaster21.com",
    "swiftviz.net",
    "thouth.net",
    "threadsphere.bid",
    "tinyical.com",
    "tinyium.com",
    "twineer.com",
    "uclaut.net",
    "usfinf.net",
    "viahold.com",
    "vializer.com",
    "viwright.com",
    "xterca.net",
    "yabuilder.com",
    "yamechanic.com",
    "yoalizer.com",
    "yobuilder.com",
    "yoineer.com",
    "yoitect.com",
    "zo.ee",
    "zoee.xyz",
    "bee.anime-loads.org",
    "out.underhentai.net",
    "gdanstum.net",
    "taraa.xyz",
    "mineiroloko.co",
    "aporasal.net",
    "onizatop.net",
    "hurirk.net,regecish.net",
    "zeybui.net",
    "download.cracksurl.com",
    "darenjarvis.pro",
    "xervoo.net",
  ];
  const { hostname } = new URL(resp.url);
  if (domainList.includes(hostname)) {
    const text = await resp.text();
    const ysmm = text.split("\n").filter((l) => l.includes("var ysmm = '")).map(
      (l) => l.trim().replace("var ysmm = '", "").replace("';", ""),
    )?.[0];
    if (!ysmm) {
      throw new Error(`展开链接时出错！ ${url}`);
    }
    // https://github.com/gorhill/uBlock/blob/a94df7f3b27080ae2dcb3b914ace39c0c294d2f6/assets/resources/scriptlets.js#L805
    // Based on AdsBypasser
    // License:
    //   https://github.com/adsbypasser/adsbypasser/blob/master/LICENSE
    const isDigit = /^\d$/;
    const handler = (encodedURL: string) => {
      let var1 = "", var2 = "", i;
      for (i = 0; i < encodedURL.length; i++) {
        if (i % 2 === 0) {
          var1 = var1 + encodedURL.charAt(i);
        } else {
          var2 = encodedURL.charAt(i) + var2;
        }
      }
      let data = (var1 + var2).split("");
      for (i = 0; i < data.length; i++) {
        if (isDigit.test(data[i])) {
          for (let ii: number = i + 1; ii < data.length; ii++) {
            if (isDigit.test(data[ii])) {
              const temp = parseInt(data[i], 10) ^ parseInt(data[ii], 10);
              if (temp < 10) {
                data[i] = temp.toString();
              }
              i = ii;
              break;
            }
          }
        }
      }
      const s = data.join("");
      const decodedURL = window.atob(s).slice(16, -16);
      return decodedURL;
    };
    const _durl = handler(ysmm);
    const durl = new URL(_durl);
    const dest = durl.searchParams.get("dest");
    if (dest) {
      return dest;
    } else {
      return follow(_durl);
    }
  } else {
    await resp.body?.cancel();
    return resp.url;
  }
}

export const shortURL: Map<string, (url: string) => Promise<string>> = new Map([
  ["we.tl", follow],
  ["b23.tv", follow],
  ["t.ly", follow],
  ["youtu.be", follow],
  ["is.gd", follow],
  ["dwz.cn", follow],
  ["sourl.cn", follow],
  ["url.cn", follow],
  ["w.url.cn", follow],
  ["tinyurl.com", follow],
  ["goo.gl", follow],
  ["urlzs.com", follow],
  ["forms.gle", follow],
  ["apple.co", follow],
  ["suo.yt", follow],
  ["go.microsoft.com", follow],
  [
    "t.co",
    (url) => {
      const nGet = (url: string) => get(url, {});
      return followA(url, nGet);
    },
  ],
  [
    "t.cn",
    async (url) => {
      const resp = await get(url);
      if (new URL(resp.url).hostname === "t.cn") {
        const elem = parse(await resp.text());
        const out = elem
          .querySelector(".open-url > a")
          ?.getAttribute("href")
          ?.trim();
        if (out) {
          return out;
        } else {
          throw new Error(`展开短网址时出错：${url}`);
        }
      } else {
        await resp.body?.cancel();
        if (resp.url.startsWith("https://passport.weibo.com/visitor/")) {
          const resp2 = await get(url, undefined, "manual");
          if (resp2.status === 302) {
            await resp2.body?.cancel();
            const location = resp2.headers.get("location");
            if (location) {
              return location;
            }
          }
          await resp2.body?.cancel();
          throw new Error(`展开短网址时出错：${url}`);
        } else {
          return resp.url;
        }
      }
    },
  ],
  [
    "douc.cc",
    async (url) => {
      const resp = await get(url);
      if (resp.url.startsWith("https://www.douban.com/link2/")) {
        await resp.body?.cancel();
        const out = new URL(resp.url).searchParams.get("url");
        if (out) {
          return out;
        } else {
          throw new Error(`获取长链接失败！${url}`);
        }
      } else {
        await resp.body?.cancel();
        return resp.url;
      }
    },
  ],
  [
    "t.tl",
    (url) =>
      extractFromHTML(url, ".panel-body > p:nth-child(1) > a:nth-child(1)"),
  ],
  // bitly.com
  ["j.mp", follow],
  ["bit.ly", follow],
  // reddit
  ["redd.it", follow],
  ["v.redd.it", follow],
  // suolink.cn
  ["mtw.so", follow],
  ["u6v.cn", follow],
  ["m6z.cn", follow],
  // adf.ly
  [
    "fumacrom.com",
    AdFly,
  ],
  // 6du.in
  ["t-t.ink", follow],
  ["dw-z.ink", (url) =>
    extractFromHTML(
      url,
      "div.main-hint > div.main-hint-text > span > a",
    )],
  // tyson.cool
  ["ddl.ink", follow],
  ["tsd.ink", follow],
  // www.shrunken.com
  ["www.shrunken.com", follow],
  ["p.asia", follow],
  ["g.asia", follow],
  ["3.ly", follow],
  ["0.gp", follow],
  ["2.ly", follow],
  ["4.gp", follow],
  ["4.ly", follow],
  ["6.ly", follow],
  ["7.ly", follow],
  ["8.ly", follow],
  ["9.ly", follow],
  ["2.gp", follow],
  ["6.gp", follow],
  ["5.gp", follow],
  ["ur3.us", follow],
]);
