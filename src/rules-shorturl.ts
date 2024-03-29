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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.61 Safari/537.36",
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
    return await followA(url);
  } catch (_error) {
    return await followM(url);
  }
}

async function extractFromHTML(
  url: string,
  selector: string,
  attribute = "href",
  postHook?: (url: string) => string,
) {
  const resp = await get(url);
  if (new URL(resp.url).hostname === new URL(url).hostname) {
    const elem = parse(await resp.text());
    let out: string | undefined;
    if (attribute === "") {
      out = elem.querySelector(selector)?.innerHTML?.trim();
    } else {
      out = elem.querySelector(selector)?.getAttribute(attribute)?.trim();
    }
    if (out) {
      if (typeof postHook === "function") {
        return postHook(out);
      } else {
        return out;
      }
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
    "magybu.net",
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
      const data = (var1 + var2).split("");
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
      // noinspection UnnecessaryLocalVariableJS
      const decodedURL = atob(s).slice(16, -16);
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

async function shrunken(url: string) {
  const resp = await get(url);
  const text = await resp.text();
  const lf = text.split("\n").filter((l) => l.includes('window.location = "'));
  if (lf.length !== 0) {
    return lf[0].replace('window.location = "', "").replace('";', "").trim();
  } else {
    return url;
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
  ["ift.tt", follow],
  ["reut.rs", follow],
  ["g.co", follow],
  ["dlvr.it", follow],
  ["wp.me", follow],
  ["steam.pm", follow],
  ["rxau.pse.is", follow],
  ["navo.top", follow],
  ["rfi.my", follow],
  ["0rz.tw", follow],
  ["lxi.me", follow],
  ["kutt.appinn.net", follow],
  ["xczs.vip", follow],
  ["nyti.ms", follow],
  ["lat.ms", follow],
  ["bbc.in", follow],
  ["trib.al", follow],
  ["gg.gg", follow],
  ["lmg.gg", follow],
  ["geni.us", follow],
  ["mzl.la", follow],
  ["p.dw.com", follow],
  [
    "t.co",
    (url) => {
      const nGet = (url: string) => get(url, {});
      return followA(url, nGet);
    },
  ],
  ["xhslink.com", async (url) => {
    const resp = await get(url, undefined, "manual");
    if (resp.status === 302 || resp.status === 307) {
      const location = resp.headers.get("location");
      if (location && (new URL(location).hostname === "www.xiaohongshu.com")) {
        await resp.body?.cancel();
        return location;
      }
    }
    await resp.body?.cancel();
    throw new Error(`展开短网址时出错：${url}`);
  }],
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
          if (resp2.status === 302 || resp2.status === 307) {
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
  ["reurl.cc", (url) => extractFromHTML(url, "#url", "value")],
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
  // www.shrunken.com
  ["www.shrunken.com", shrunken],
  ["p.asia", shrunken],
  ["g.asia", shrunken],
  ["3.ly", shrunken],
  ["0.gp", shrunken],
  ["2.ly", shrunken],
  ["4.gp", shrunken],
  ["4.ly", shrunken],
  ["6.ly", shrunken],
  ["7.ly", shrunken],
  ["8.ly", shrunken],
  ["9.ly", shrunken],
  ["2.gp", shrunken],
  ["6.gp", shrunken],
  ["5.gp", shrunken],
  ["ur3.us", shrunken],
  // AMP
  ["www.google.com", (url) => {
    if ((new URL(url)).pathname.startsWith("/amp/")) {
      return follow(url);
    } else {
      return Promise.resolve(url);
    }
  }],
  //Weibo
  ["share.api.weibo.cn", (url) => {
    let weibo_id = new URL(url).searchParams.get("weibo_id");

    if (weibo_id === null) {
      const pattern = new URLPattern({ pathname: "/share/:uid,:id.html" });
      const patternResult = pattern.exec(url);
      if (patternResult) {
        weibo_id = patternResult.pathname.groups.id;
      }
    }

    if (weibo_id) {
      return Promise.resolve(`https://m.weibo.cn/status/${weibo_id}`);
    } else {
      return Promise.resolve(url);
    }
  }],
  // Taobao
  [
    "m.tb.cn",
    async (url) => {
      const resp = await get(url);
      const text = await resp.text();
      const lineAfterFilter = text.split("\n").filter((l) =>
        l.includes("var url = 'http")
      );
      if (lineAfterFilter.length === 1) {
        const jumpUrl = lineAfterFilter[0].trim().replace(
          "var url = '",
          "",
        )
          .replace("';", "");
        if (
          new URL(jumpUrl).hostname === "h5.m.goofish.com" ||
          new URL(jumpUrl).hostname === "item.taobao.com"
        ) {
          return jumpUrl;
        }
        const resp2 = await get(jumpUrl, undefined, "manual");
        if (resp2.status >= 300 && resp2.status < 400) {
          const location = resp2.headers.get("location");
          if (
            location &&
            ((new URL(location).hostname === "item.taobao.com") ||
              (new URL(location).hostname === "h5.m.goofish.com"))
          ) {
            await resp2.body?.cancel();
            return location;
          }
        }
        await resp2.body?.cancel();
        throw new Error(`展开短网址时出错：${url}`);
      } else {
        throw new Error(`展开短网址时出错：${url}`);
      }
    },
  ],
  // grabify.link
  [
    "grabify.link",
    (url) => extractFromHTML(url, 'meta[name="url"]', "content"),
  ],
  ["screenshare.pics", follow],
  ["myprivate.pics", follow],
  ["noodshare.pics", follow],
  ["cheapcinema.club", follow],
  ["shhh.lol", follow],
  ["partpicker.shop", follow],
  ["sportshub.bar", follow],
  ["locations.quest", follow],
  ["lovebird.guru", follow],
  ["trulove.guru", follow],
  ["dateing.club", follow],
  ["shrekis.life", follow],
  ["headshot.monster", follow],
  ["gaming-at-my.best", follow],
  ["progaming.monster", follow],
  ["yourmy.monster", follow],
  ["imageshare.best", follow],
  ["screenshot.best", follow],
  ["gamingfun.me", follow],
  ["catsnthing.com", follow],
  ["catsnthings.fun", follow],
  ["joinmy.site", follow],
  ["fortnitechat.site", follow],
  ["fortnight.space", follow],
  ["freegiftcards.co", follow],
  ["stopify.co", follow],
  ["leancoding.co", follow],
  // https://www.ft12.com/
  ["985.so", (url) => extractFromHTML(url, ".url > a", "")],
  // Facebook
  ["l.facebook.com", (url) => {
    const _url = new URL(url);
    const target = _url.searchParams.get("u");
    return Promise.resolve(target ?? url);
  }],
  ["www.facebook.com", (url) => {
    const _url = new URL(url);
    if (_url.pathname.startsWith("/login/")) {
      return Promise.resolve(_url.searchParams.get("next") ?? url);
    } else if (_url.pathname.startsWith("/flx/warn/")) {
      return Promise.resolve(_url.searchParams.get("u") ?? url);
    } else {
      return Promise.resolve(url);
    }
  }],
]);
