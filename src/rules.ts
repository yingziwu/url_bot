import { parse } from "./lib.ts";

export type ValueOf<T> = T[keyof T];

// https://github.com/AdguardTeam/AdguardFilters/tree/master/TrackParamFilter/sections
export const general = [
  "nx_source",
  "_zucks_suid",
  "cmpid",
  "asgtbndr",
  "guccounter",
  "guce_referrer",
  "guce_referrer_sig",
  "_openstat",
  "action_object_map",
  "action_ref_map",
  "action_type_map",
  "fb_action_ids",
  "fb_action_types",
  "fb_comment_id",
  "fb_ref",
  "fb_source",
  "fbclid",
  "xtor",
  "utm_campaign",
  "utm_channel",
  "utm_cid",
  "utm_content",
  "utm_id",
  "utm_medium",
  "utm_name",
  "utm_place",
  "utm_pubreferrer",
  "utm_reader",
  "utm_referrer",
  "utm_serial",
  "utm_social",
  "utm_social-type",
  "utm_source",
  "utm_swu",
  "utm_term",
  "utm_userid",
  "utm_viz_id",
  "utm_product",
  "utm_campaignid",
  "utm_ad",
  "utm_brand",
  "utm_emcid",
  "utm_emmid",
  "utm_umguk",
  "gbraid",
  "wbraid",
  "gclsrc",
  "gclid",
  "yclid",
  "dpg_source",
  "dpg_campaign",
  "dpg_medium",
  "dpg_content",
  "admitad_uid",
  "adjust_tracker",
  "adjust_adgroup",
  "adjust_campaign",
  "bsft_clkid",
  "bsft_eid",
  "bsft_mid",
  "bsft_uid",
  "bsft_aaid",
  "bsft_ek",
  "mtm_campaign",
  "mtm_cid",
  "mtm_content",
  "mtm_group",
  "mtm_keyword",
  "mtm_medium",
  "mtm_placement",
  "mtm_source",
  "pk_campaign",
  "pk_medium",
  "pk_source",
  "_branch_match_id",
  "vc_lpp",
  "ml_subscriber",
  "ml_subscriber_hash",
  "rb_clickid",
  "oly_anon_id",
  "oly_enc_id",
  "dt_dapp",
  "dt_platform",
  "spm",
  "scm",
];
interface rule {
  pathname: string;
  search: string | RegExp | true;
}
const specific: Record<string, (string | RegExp | rule)[]> = {
  "bilibili.com": [
    "from",
    "seid",
    "share_source",
    "spm_id_from",
    "from_spm_id",
    "share_medium",
    "share_plat",
    "share_session_id",
    "share_source",
    "share_tag",
    "timestamp",
    "unique_k",
    "from_source",
    "refer_from",
  ],
  "douban.com": ["_i", "_dtcc"],
  "share.api.weibo.cn": ["weibo_id"],
  "weibo.com": ["pagetype", "from"],
  "mp.weixin.qq.com": [
    "chksm",
    "key",
    "uin",
    "devicetype",
    "exportkey",
    "mpshare",
    "scene",
    "srcid",
    "nettype",
  ],
  "twitter.com": ["ref_src", "ref_url", "s", "t"],
  "reddit.com": [
    "_branch_referrer",
    "post_fullname",
    "correlation_id",
    "ref_campaign",
    "ref_source",
    "ref",
  ],
  "reddit.app.link": [
    "adblock",
    "compact_view",
    "dnt",
    "geoip_country",
    "referrer_domain",
    "referrer_url",
  ],
  "weidian.com": ["distributorid", "wfr", "ifr", "share_relation", "source"],
  "instagram.com": ["igshid"],
  "steampowered.com": ["curator_clanid"],
  "steamcommunity.com": ["curator_clanid"],
  "linkedin.com": ["trkInfo", "originalReferer"],
  "nicovideo.jp": ["cmnhd_ref", "ref"],
  "www.baidu.com": ["rsv_pq", "rsv_t"],
  "nytimes.com": ["impression_id"],
  "www.youtube.com": ["feature"],
  "bbc.com": ["ocid", "at_medium", "at_campaign"],
  "bbc.co.uk": ["ocid", "at_medium", "at_campaign"],
  "microsoft.com": [
    "tduid",
    "irclickid",
    "ranEAID",
    "ranSiteID",
    "ocid",
    "epi",
  ],
  "xbox.com": ["epi"],
  "office.com": ["ocid"],
  "cht.com.tw": ["Source", "Identifier"],
  "voyeur-house.tv": ["clickid"],
  "infoq.com": ["topicPageSponsorship", /^itm_/],
  "mail.ru": ["oprtrack"],
  "dmm.co.jp": ["dmmref", "i3_ord", "i3_ref"],
  "imdb.com": ["ref_"],
  "tiktok.com": ["share_app_id", "share_author_id", "tt_from"],
  "get.adobe.com": [
    "browser_type",
    "browser_dist",
    "type",
    "workflow",
    "promoid",
    "TRILIBIS_EMULATOR_UA",
  ],
  "play.google.com": [{ pathname: "/store/", search: "pcampaignid" }],
  "play.google.*": ["referrer"],
  "www.xiaoyuzhoufm.com": ["s"],
  "amazon.*": [
    "tag",
    "creative",
    "creativeASIN",
    "camp",
    "ascsubtag",
    "vt",
    "refRID",
    "pd_rd_i",
    "pd_rd_r",
    "pd_rd_wg",
    "pd_rd_w",
    "pf_rd_i",
    "pf_rd_m",
    "pf_rd_p",
    "pf_rd_r",
    "pf_rd_s",
    "pf_rd_t",
    "pf_rd_w",
    "initialIssue",
    "smid",
    "plattr",
    "field-lbr_brands_browse-bin",
    "ingress",
    "visitId",
    "rdc",
    "qid",
    "dchild",
    "c",
    "ts_id",
    { pathname: "/dp/", search: "tag" },
    { pathname: "/aa", search: "bitCampaignCode" },
    { pathname: "/hz/contact-us/csp", search: /entries/ },
    { pathname: "/hz/contact-us/csp", search: /Version/ },
    { pathname: "/hz/contact-us/csp", search: "source" },
    { pathname: "/hz/contact-us/csp", search: "from" },
    { pathname: "/message-us", search: "muClientName" },
  ],
  "nikkei.com": ["i_cid", "n_cid"],
  "nikkeibp.co.jp": ["i_cid"],
  "yandex.*": [
    "clid",
    "source",
    { pathname: "/news/", search: "tag" },
    { pathname: "/news/", search: "persistent_id" },
    { pathname: "/news/", search: "msid" },
    { pathname: "/news/", search: "mlid" },
    { pathname: "/news/", search: "stid" },
    { pathname: "/sport/", search: "persistent_id" },
    { pathname: "/sport/", search: "msid" },
    { pathname: "/sport/", search: "mlid" },
    { pathname: "/sport/", search: "stid" },
    { pathname: "/images/", search: "source-serpid" },
  ],
  "m.baidu.com": [
    { pathname: "/sf", search: "frsrcid" },
    { pathname: "/sf", search: "openapi" },
    { pathname: "/sf", search: "cambrian_id" },
    { pathname: "/sf", search: "baijiahao_id" },
    { pathname: "/sf", search: "ext" },
    { pathname: "/sf", search: "top" },
    { pathname: "/sf", search: "_t" },
  ],
  "m.sohu.com": ["pvid"],
  "www.dw.com": ["maca"],
};
const whitelist: Record<string, (string | RegExp | rule)[] | true> = {
  "ramtrucks.com": [{ pathname: "/mediaserver/", search: true }],
  "chrysler.com": [{ pathname: "/mediaserver/", search: true }],
  "fiatusa.com": [{ pathname: "/mediaserver/", search: true }],
  "alfaromeousa.com": [{ pathname: "/mediaserver/", search: true }],
  "jeep.com": [{ pathname: "/mediaserver/", search: true }],
  "dodge.com": [{ pathname: "/mediaserver/", search: true }],
  "dkbs.sabio.de": [
    {
      pathname: "/sabio/services/",
      search: true,
    },
  ],
  "sendgb.com": ["utm_source"],
};

export type asterisk = Map<RegExp, ValueOf<typeof specific | typeof whitelist>>;
export function getAsteriskRegExp(input: string) {
  const reText = input
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace("\\*", ".*");
  const re = new RegExp(reText);
  return re;
}
function converAsterisk(rules: typeof specific | typeof whitelist) {
  const asterisk: asterisk = new Map();
  Object.entries(rules)
    .filter(([k, v]) => k.includes("*"))
    .forEach(([k, v]) => {
      const re = getAsteriskRegExp(k);
      asterisk.set(re, v);
    });
  const out = Object.assign({}, rules) as Record<
    string,
    ValueOf<typeof rules> | typeof asterisk
  >;
  out["*"] = asterisk;
  return out;
}
const specificExport = converAsterisk(specific);
const whitelistExport = converAsterisk(whitelist);
export { specificExport as specific, whitelistExport as whitelist };

async function get(
  url: string,
  headers?: Record<string, string>,
  redirect: RequestRedirect = "follow",
) {
  if (headers === undefined) {
    headers = {
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
    };
  }
  const controller = new AbortController();
  const signal = controller.signal;
  const tid = setTimeout(() => {
    controller.abort("Timeout!");
  }, 10000);
  console.debug(`[GET] ${url}`);
  const response = await fetch(url, {
    headers,
    redirect,
    signal,
  });
  clearTimeout(tid);
  return response;
}

async function follow(url: string, getFunc = get) {
  try {
    const resp = await getFunc(url);
    await resp.body?.cancel();
    return resp.url;
  } catch (error) {
    console.error(error);
    return url;
  }
}

export const shortURL: Map<string, (url: string) => Promise<string>> = new Map([
  ["we.tl", follow],
  ["b23.tv", follow],
  ["redd.it", follow],
  ["v.redd.it", follow],
  ["youtu.be", follow],
  ["bit.ly", follow],
  ["is.gd", follow],
  ["dwz.cn", follow],
  ["sourl.cn", follow],
  ["w.url.cn", follow],
  ["tinyurl.com", follow],
  ["goo.gl", follow],
  ["mtw.so", follow],
  ["u6v.cn", follow],
  ["m6z.cn", follow],
  ["t.ly", follow],
  [
    "t.co",
    (url) => {
      const nGet = (url: string) => get(url, {});
      return follow(url, nGet);
    },
  ],
  [
    "t.cn",
    async (url) => {
      const resp = await get(url);
      if (new URL(resp.url).hostname === "t.cn") {
        const doc = parse(await resp.text());
        const out = doc
          ?.querySelector(".open-url > a")
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
]);
