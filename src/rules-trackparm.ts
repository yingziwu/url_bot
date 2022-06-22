export type ValueOf<T> = T[keyof T];

// Base on
// https://github.com/AdguardTeam/AdguardFilters/blob/b670b623fa3264dcb6130f087758b04431cc3a6a/TrackParamFilter/sections/
// https://github.com/yingziwu/ublock-rules/blob/5fa34ca18ccc13fb7ed1d2a1aad7161b46015d97/src/trackparam.txt
export const general: (string | RegExp)[] = [
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
  "gps_adid",
  "unicorn_click_id",
  "adjust_creative",
  "adjust_tracker_limit",
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
  "ebisAdID",
  "irgwc",
  "dclid",
  // bgme
  "utm_bccid",
  "dt_dapp",
  "dt_platform",
  "spm",
  "scm",
  "refer_uri_app",
  "wechatShare",
  // bbc
  "at_medium",
  "at_campaign",
  /^at_custom/,
];

interface rule {
  pathname: string | RegExp;
  search: string | RegExp | true;
}

const specific: Record<string, (string | RegExp | rule)[]> = {
  // *
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
    /^sr/,
    "geniuslink",
    "th",
    "ref",
    "qsid",
    "keywords",
    { pathname: "/dp/", search: "tag" },
    { pathname: "/aa", search: "bitCampaignCode" },
    { pathname: "/hz/contact-us/csp", search: /entries/ },
    { pathname: "/hz/contact-us/csp", search: /Version/ },
    { pathname: "/hz/contact-us/csp", search: "source" },
    { pathname: "/hz/contact-us/csp", search: "from" },
    { pathname: "/message-us", search: "muClientName" },
  ],
  "www.ebay.*": ["_trkparms", "_trksid", "amdata", "mkrid", "campid"],
  "aliexpress.*": [
    "spm",
    "scm",
    "scm_id",
    "scm-url",
    "utparam",
    "aff_fcid",
    "terminal_id",
    "aff_trace_key",
    "aff_fsk",
    "pvid",
    "dp",
    "sk",
  ],
  "daraz.*": [
    "spm",
    "scm",
    "from",
    "keyori",
    "sugg",
    "search",
    "mp",
    "c",
    /^abtest/,
    /^abbucket/,
    "pos",
    "themeID",
    "algArgs",
    "clickTrackInfo",
    "acm",
    "item_id",
    "version",
    "up_id",
    "pvid",
  ],
  "hog.*": ["ad"],
  "play.google.*": ["referrer", { pathname: "/store/", search: "pcampaignid" }],
  "google.*": [
    { pathname: "/websearch", search: "visit_id" },
    { pathname: "/search", search: "biw" },
    { pathname: "/search", search: "bih" },
    { pathname: "/search", search: "sa" },
    { pathname: "/search", search: "source" },
    { pathname: "/search", search: "aqs" },
    { pathname: "/search", search: "sourceid" },
    { pathname: "/search", search: "ei" },
    { pathname: "/search", search: "gs_lcp" },
    "shorturl",
  ],
  "lotto.gmx.*": ["partnerId", "advertisementId"],
  "shopping.gmx.*": ["origin"],
  "gmx.*": [{ pathname: "/logoutlounge", search: "p" }, "mc"],
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
  // bgme
  "weibo.*": ["pagetype", "from", "weibo_id"],
  // none *
  "approach.yahoo.co.jp": ["code", "src"],
  "taobao.com": [
    "scm",
    "pvid",
    "utparam",
  ],
  "agoda.com": ["tag"],
  "editor.flixier.com": ["fx_source", "fx_medium", "fx_campaign"],
  "github.com": [
    { pathname: "/signup", search: "source" },
    { pathname: "/signup", search: /^ref_/ },
  ],
  "tradingview.com": ["source"],
  "api.cxense.com": [/^cx_/, /^pickup_list_click/],
  "nikki.ne.jp": ["l-id"],
  "rakuten.co.jp": ["l-id", "scid", "trflg"],
  "websearch.rakuten.co.jp": [{ pathname: "/Web", search: "ref" }],
  "rebates.jp": ["l-id"],
  "azby.fmworld.net": [
    "mc_pc",
    { pathname: "/cgi-bin/common/rd.cgi", search: "affitest" },
  ],
  "toku.yahoo.co.jp": ["fr"],
  "nikkei.com": ["i_cid", "n_cid"],
  "nikkeibp.co.jp": ["i_cid"],
  "cyberlink.com": ["affid"],
  "zestradar.com": ["adclid"],
  "hit.gemius.pl": [
    { pathname: "/hitredir", search: "id" },
    { pathname: "/hitredir", search: "extra" },
  ],
  "adorama.com": ["obem", "bc_pid"],
  "adjust.com": ["adgroup"],
  "tiktok.com": ["share_app_id", "share_author_id", "tt_from"],
  "reddit.app.link": [
    "adblock",
    "compact_view",
    "dnt",
    "geoip_country",
    "referrer_domain",
    "referrer_url",
  ],
  "dmkt-sp.jp": ["impressionId"],
  "dmm.co.jp": ["dmmref", "i3_ord", "i3_ref"],
  "imdb.com": ["ref_"],
  "livedoor.biz": ["ref"],
  "reddit.com": [
    "_branch_referrer",
    "post_fullname",
    "correlation_id",
    "ref_campaign",
    "ref_source",
    "ref",
    "$deep_link",
    "post_index",
    "$3p",
  ],
  "adj.st": ["CollectionId", "adjust_deeplink"],
  "data.alexa.com": [
    { pathname: "/data/", search: "cdt" },
    { pathname: "/data/", search: "ref" },
  ],
  "comodo.com": ["track", "af"],
  "coupang.com": ["wRef", "traceid", "wTime", "wPcid"],
  "link.coupang.com": ["lptag"],
  "wuzhuiso.com": ["src"],
  "nordvpn.com": ["data1"],
  "upgrad.com": ["UTM_MEDIUM"],
  "adweek.com": ["traffic_source"],
  "adguard-vpn.com": ["aid"],
  "adguard-dns.com": ["aid"],
  "adguard.com": ["aid"],
  "kitbag.com": ["_ref", "ab"],
  "web.vstat.info": ["guid", "user_agent"],
  "start.pm.by": ["adtag"],
  "mail.ru": ["oprtrack"],
  "redhotpawn.com": ["cbqsid"],
  "trendyol.com": [
    "tyutm_source",
    "tyutm_medium",
    "tyutm_campaign",
    "_ga",
    "utm_subaff",
  ],
  "cc.loginfra.com": [
    { pathname: "/cc", search: "a" },
    { pathname: "/cc", search: "bw" },
    { pathname: "/cc", search: "px" },
    { pathname: "/cc", search: "py" },
    { pathname: "/cc", search: "sx" },
    { pathname: "/cc", search: "sy" },
    { pathname: "/cc", search: "nsc" },
  ],
  "mein.onlinekonto.de": ["ref"],
  "dengekionline.com": ["osusume_banner"],
  "listelerim.hepsiburada.com": [
    "af_ad",
    "af_adset",
    "af_force_deeplink",
    "pid",
    "c",
    "is_retargeting",
    "shortlink",
  ],
  "cyber-ad01.cc": ["ip"],
  "d-markets.net": ["ref"],
  "weidian.com": ["distributorid", "wfr", "ifr", "share_relation", "source"],
  "jasonsavard.com": ["cUrl", "ref"],
  "expressvpn.com": ["a_aid"],
  "vpnarea.com": ["a_aid"],
  "lcs.naver.com": [
    { pathname: "/m", search: "os" },
    { pathname: "/m", search: "ln" },
    { pathname: "/m", search: "sr" },
    { pathname: "/m", search: "bw" },
    { pathname: "/m", search: "bh" },
    { pathname: "/m", search: "ls" },
    { pathname: "/m", search: "navigationStart" },
    { pathname: "/m", search: "requestStart" },
    { pathname: "/m", search: "responseStart" },
    { pathname: "/m", search: "responseEnd" },
    { pathname: "/m", search: "domLoading" },
    { pathname: "/m", search: "domInteractive" },
    { pathname: "/m", search: "domContentLoadedEventStart" },
    { pathname: "/m", search: "domContentLoadedEventEnd" },
    { pathname: "/m", search: "domComplete" },
    { pathname: "/m", search: "loadEventStart" },
    { pathname: "/m", search: "loadEventEnd" },
    { pathname: "/m", search: "pid" },
    { pathname: "/m", search: "ts" },
  ],
  "edx.org": ["source"],
  "infoq.com": ["topicPageSponsorship", /^itm_/],
  "coupondunia.in": ["itm_source"],
  "adshares.net": ["cid"],
  "get.adobe.com": [
    "browser_type",
    "browser_dist",
    "type",
    "workflow",
    "promoid",
    "TRILIBIS_EMULATOR_UA",
  ],
  "app.5-delivery.ru": ["c", "pid"],
  "voyeur-house.tv": ["clickid"],
  "cht.com.tw": ["Source", "Identifier"],
  "aufast.co": [/^utm_/, "clickid"],
  "iqbroker.com": ["afftrack", "clickid", "aff_model"],
  "dailymotion.com": [
    { pathname: "/embed/video/", search: "ads_params" },
    { pathname: "/embed/video/", search: "origin" },
  ],
  "wired.co.uk": ["mbid"],
  "wikihow.com": ["?utm_source"],
  "kohls.com": ["CID"],
  "instagram.com": ["igshid"],
  "euronews.com": ["_ope"],
  "steampowered.com": ["curator_clanid"],
  "steamcommunity.com": ["curator_clanid"],
  "mediamarkt.com.tr": ["rbtc"],
  "t.myvisualiq.net": ["~red"],
  "uspoloassn.com": ["ref"],
  "arcelik.com.tr": ["ref"],
  "express.de": ["cb"],
  "ksta.de": ["cb"],
  "linkedin.com": [
    { pathname: "/authwall", search: "trkInfo" },
    { pathname: "/authwall", search: "originalReferer" },
  ],
  "digikey.com": [/^mkt_tok/, /^utm_cid/],
  "nicovideo.jp": ["cmnhd_ref", "ref"],
  "search.naver.com": [
    { pathname: "/search.naver", search: "tqi" },
  ],
  "cc.naver.com": [
    { pathname: "/cc", search: "bw" },
    { pathname: "/cc", search: "px" },
    { pathname: "/cc", search: "py" },
    { pathname: "/cc", search: "sx" },
    { pathname: "/cc", search: "sy" },
  ],
  "www.baidu.com": ["rsv_pq", "rsv_t", { pathname: "/link", search: "eqid" }],
  "cod.bitrec.com": [
    { pathname: "/topocentras-services/js/recs", search: "visitorId" },
    { pathname: "/topocentras-services/js/recs", search: "externalVisitorId" },
    { pathname: "/topocentras-services/js/recs", search: "r" },
  ],
  "app.mi.com": [
    { pathname: "/download/", search: "ref" },
    { pathname: "/download/", search: "nonce" },
    { pathname: "/download/", search: "appClientId" },
    { pathname: "/download/", search: "appSignature" },
  ],
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
    // bgme
    "from",
    "subscene",
    "clicktime",
    "enterid",
    "sharer_sharetime",
    "sharer_shareid",
    "sessionid",
    "v_p",
    "WBAPIAnalysisOriUICodes",
    "launchid",
    "wm",
    "aid",
    "isappinstalled",
    "forceh5",
  ],
  "pixel.adsafeprotected.com": [
    { pathname: "/services/pub", search: "slot" },
    { pathname: "/services/pub", search: "sessionId" },
    { pathname: "/services/pub", search: "anId" },
    { pathname: "/services/pub", search: "wr" },
    { pathname: "/services/pub", search: "sr" },
    { pathname: "/services/pub", search: "url" },
  ],
  "cam4.com": ["act", "suid", "showSignupPopup"],
  "office.com": ["ocid"],
  "twitter.com": ["ref_src", "ref_url", "s", "t"],
  "zerkalo.io": ["tg", "vk"],
  "microsoft.com": [
    "tduid",
    "irclickid",
    "ranEAID",
    "ranSiteID",
    "ocid",
    "epi",
  ],
  "xbox.com": ["epi"],
  "duda.co": ["irclickid"],
  "marktjagd.de": ["client"],
  "kaspersky.com": ["icid"],
  "coursera.org": ["siteID"],
  "mag2.com": ["trflg"],
  "dailymail.co.uk": ["ito"],
  "hepsiburada.com": ["wt_af"],
  "mioga.de": ["pl", "idealoid"],
  "ejoker.de": ["sPartner", "idealoid"],
  "lotto.web.de": ["partnerId", "advertisementId"],
  "shopping.web.de": ["origin"],
  "web.de": [{ pathname: "/logoutlounge", search: "p" }, "mc"],
  "ad.doubleclick.net": [{ pathname: "/ddm/trackclk/", search: /^dc_trk_/ }],
  "alza.de": [{ pathname: /.*\.htm/, search: "kampan" }],
  "cosse.de": ["referer", "sPartner"],
  "idealo.de": [
    { pathname: /.*\.html/, search: "offerKey" },
    { pathname: /.*\.html/, search: "offerListId" },
  ],
  "marketing.net.idealo-partner.com": [
    "smc2",
    "smc5",
    "amc",
    "etcc_cmp",
    "etcc_med",
    "etcc_produkt",
  ],
  "media01.eu": [{ pathname: "/set.aspx", search: "trackid" }],
  "netgames.de": ["refID", "idealoid"],
  "www.alternate.de": ["partner", "campaign", "idealoid"],
  "www.galaxus.de": ["pcscpId"],
  "www.lidl.de": ["msktc"],
  "www.otto.de": ["ActionID", "AffiliateID", "campid"],
  "www.pricezilla.de": ["bid"],
  "boomstore.de": [{ pathname: /.*\.html/, search: "campaign" }],
  "www.technikdirekt.de": ["sPartner", "idealoid"],
  "www.hitseller.de": [
    "sPartner",
    "idealoid",
    "etcc_cmp",
    "etcc_med",
    "etcc_produkt",
  ],
  "galaxus.de": ["idealoid"],
  "www.electronic4you.de": ["idealoid"],
  "visit.digidip.net": ["ppref", "ref", "pid"],
  "ad.admitad.com": [/^subid/],
  "mvideo.ru": ["_requestid", "reff"],
  "nytimes.com": ["impression_id"],
  "search.yahoo.co.jp": ["fr"],
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
    "refer_from",
    "bbid",
    "ts",
    "-Arouter",
    "broadcast_type",
    "is_room_feed",
  ],
  "search.bilibili.com": ["from_source"],
  // bgme
  "bbc.com": ["ocid", /^pinned_/, /^ns_/],
  "bbc.co.uk": ["ocid", /^pinned_/, /^ns_/],
  "youtube.com": ["feature"],
  "douban.com": ["_i", "_dtcc", "from"],
  "v.youku.com": ["sharefrom", "sharekey"],
  "www.xiaoyuzhoufm.com": ["s"],
  "m.baidu.com": [
    { pathname: "/sf", search: "frsrcid" },
    { pathname: "/sf", search: "openapi" },
    { pathname: "/sf", search: "cambrian_id" },
    { pathname: "/sf", search: "baijiahao_id" },
    { pathname: "/sf", search: "ext" },
    { pathname: "/sf", search: "top" },
    { pathname: "/sf", search: "_t" },
  ],
  "sohu.com": ["pvid"],
  "dw.com": ["maca"],
  "open.spotify.com": ["si", "context"],
  "podcasts.apple.com": ["i", "mt", "itscg", "itsct"],
  "zhihu.com": [
    { pathname: "/search", search: "search_source" },
    { pathname: "/search", search: "hybrid_search_source" },
    { pathname: "/search", search: "hybrid_search_extra" },
  ],
  "bbs.jjwxc.net": ["boardpagemsg"],
  "reuters.com": ["taid"],
  "caixin.com": ["cxw", "Sfrom", "originReferrer"],
  "tieba.baidu.com": [
    "share",
    "fr",
    "sfc",
    "client_type",
    "client_version",
    "st",
    "unique",
  ],
  "itunes.apple.com": ["pt", "ct", "mt"],
  "rfi.fr": ["ref"],
  "xiaohongshu.com": [
    "share_from_user_hidden",
    "xhsshare",
    "appuid",
    "apptime",
  ],
  "shuidichou.com": [
    "channel",
    "source",
    "forwardFrom",
    "userSourceId",
    /^share/,
  ],
  "item.taobao.com": [
    "price",
    "sourceType",
    "suid",
    "ut_sk",
    "un",
    /^share/,
    "un_site",
    "spm",
    /^sp_/,
    "tbSocialPopKey",
    "cpp",
    "short_name",
    "bxsign",
    "tk",
    "app",
    "iconType",
    "detailSharePosition",
  ],
  "h5.m.goofish.com": [
    "ut_sk",
    "forceFlush",
    "ownerId",
    "un",
    "share_crt_v",
    "un_site",
    "sp_abtk",
    "sp_tk",
    "cpp",
    "shareurl",
    "short_name",
    "bxsign",
    "tk",
    "app",
  ],
  "baijiahao.baidu.com": [
    "wfr",
    "for",
    "searchword",
  ],
  "3g.163.com": [
    "referFrom",
    "spss",
  ],
};
const whitelist: Record<string, (string | RegExp | rule)[] | true> = {
  "tix.axs.com": true,
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
  "img*.nga": ["cmpid"],
  "mywot.com": [{ pathname: /\/.*\/confirmNewEmail\//, search: true }],
  "plex.tv": [{ pathname: /\/api\/v.*\/users\/.*/, search: "utm_source" }],
  "urldefense.com": true,
  "cdn.privatehost.com": [{ pathname: "/videos", search: true }],
};

export type asterisk = Map<RegExp, ValueOf<typeof specific | typeof whitelist>>;

export function getAsteriskRegExp(input: string) {
  const reText = input
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replaceAll("\\*", ".*");
  return new RegExp(reText);
}

function converAsterisk(rules: typeof specific | typeof whitelist) {
  const asterisk: asterisk = new Map();
  Object.entries(rules)
    .filter(([k, _v]) => k.includes("*"))
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
