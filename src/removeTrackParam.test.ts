// noinspection HttpUrlsUsage

import { clean } from "./removeTrackParam.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Remove Track Param", async () => {
  console.info("开始测试短链接……");
  console.info("测试简单短网址规则");
  assertEquals(
    await clean("https://b23.tv/d3BTHVL"),
    "https://www.bilibili.com/video/BV1uP4y1n7Zf?p=1",
  );
  assertEquals(
    await clean("https://youtu.be/SM-7GT6mYeQ"),
    "https://www.youtube.com/watch?v=SM-7GT6mYeQ",
  );
  assertEquals(
    await clean("https://redd.it/sgt7hh"),
    "https://www.reddit.com/comments/sgt7hh",
  );
  assertEquals(
    await clean("https://v.redd.it/j6b86qlkhw761"),
    "https://www.reddit.com/video/j6b86qlkhw761",
  );
  assertEquals(
    await clean("https://we.tl/t-SLdvGw6i3k"),
    "https://wetransfer.com/downloads/f243e28dab7a5d83b5c337c5e8a4a3fa20220131012118/b209cf",
  );
  assertEquals(
    await clean("https://bit.ly/3G9VSFJ"),
    "https://greasyfork.org/zh-CN/scripts/439276-%E7%9C%9F%E7%99%BD%E8%90%8C%E6%96%B0%E7%AB%99%E6%B7%BB%E5%8A%A0%E5%85%A8%E9%83%A8%E8%AE%A2%E9%98%85%E6%8C%89%E9%92%AE",
  );
  assertEquals(
    await clean("https://is.gd/gttnnn"),
    "https://www.blogger.com/profile/17337526690110916908",
  );
  assertEquals(
    await clean("https://dwz.cn/97V19jTh?u=29e599a4f323c598"),
    "https://m.baidu.com/sf?pd=video_page&nid=&sign=8007857985042630614&word=s%E5%BD%A2%E4%BB%BB%E6%84%8F%E7%90%83&oword=s%E5%BD%A2%E4%BB%BB%E6%84%8F%E7%90%83&title=%E5%84%92%E5%B0%BC%E5%B0%BC%E5%A5%A5%E7%BB%9D%E4%B8%96%E7%BB%8F%E5%85%B8S%E5%9E%8B%E4%BB%BB%E6%84%8F%E7%90%83&atn=index&alr=1&resource_id=5052&sp=0",
  );
  assertEquals(
    await clean("http://sourl.cn/JsCiTu"),
    "https://pan.baidu.com/s/1laBXTbzkx3MaS87KShyhXg",
  );
  assertEquals(
    await clean("https://w.url.cn/s/AcByUwk"),
    "https://weixin.qq.com/qremoticonstore?productid=aL2PCfwK%2F89qO7sF6%2F+I+UDhfwEjhec2ZNvdnLLJRd%2FPR670iiGeTeB5N6I%2FvHrCl+9yXngJ5P39syGEIlB9f%2FI9F4onxcXgHAmuzCLduZZo%3D",
  );
  assertEquals(
    await clean("https://tinyurl.com/hft63djj"),
    "https://www.douban.com/group/topic/258977811/",
  );
  assertEquals(
    await clean("https://goo.gl/SXYcFm"),
    "https://www.youtube.com/playlist?list=PLsw2iU9xmpfZKOcZbKn7tbAPAi6hdM72w&disable_polymer=true",
  );
  assertEquals(
    await clean("http://mtw.so/6mz6iq"),
    "https://app3smw8f5b1177.h5.xiaoeknow.com/v2/course/alive/l_61e273ace4b0f67a4d486d61?app_id=app3smw8f5b1177&alive_mode=0&pro_id=term_61e3b6352eff0_5WDTNK&type=2",
  );
  assertEquals(
    await clean("https://t.ly/C9Jn"),
    "https://greasyfork.org/zh-CN/scripts/406070-%E5%B0%8F%E8%AF%B4%E4%B8%8B%E8%BD%BD%E5%99%A8",
  );
  assertEquals(
    await clean("https://urlzs.com/DDYin"),
    "https://example.com/",
  );
  assertEquals(
    await clean("http://t-t.ink/0i5e_"),
    "https://example.com/",
  );
  assertEquals(
    await clean("https://ddl.ink/9yI4"),
    "https://www.bilibili.com/video/BV1r34y1277o?p=1",
  );
  assertEquals(
    await clean("https://tsd.ink/tsywd"),
    "https://weidian.com/item.html?itemID=4296908918&spider_token=e9dd",
  );
  assertEquals(
    await clean("https://3.ly/aeHld"),
    "https://mastodon.social/@Mastodon/107718287079955422",
  );
  assertEquals(
    await clean("https://forms.gle/wU11nYMy73EiDFk76"),
    "https://docs.google.com/forms/d/e/1FAIpQLSeEK07O4FO6zyztfHN4mTkZ8yNV8NRBaPIOuZnZlqKUhqQVZg/viewform?usp=send_form",
  );
  assertEquals(
    await clean("http://apple.co/WeCanDoHardThings"),
    "https://podcasts.apple.com/us/podcast/we-can-do-hard-things-with-glennon-doyle/id1564530722",
  );
  assertEquals(
    await clean("https://suo.yt/dY4FN5p"),
    "https://www.mediafire.com/file/0kurb7mt4v8tgg2/%25E6%2596%25B0%25E5%2586%25A0%25E7%2597%2585%25E6%25AF%2592%25E7%25A0%2594%25E7%25A9%25B6%25E6%258A%25A5%25E5%2591%258A.pdf/file",
  );
  assertEquals(
    await clean("https://bit.ly/35KookQ"),
    "https://404.example.com/",
  );
  assertEquals(
    await clean("https://go.microsoft.com/fwlink/?linkid=2061461"),
    "https://support.microsoft.com/windows/core-isolation-e30ed737-17d8-42f3-a2a9-87521df09b78",
  );
  assertEquals(
    await clean("https://ift.tt/3fMM9uf"),
    "https://www.iyouport.org/%E8%8B%8F%E8%81%94%E4%BD%9C%E5%AE%B6%E8%81%94%E7%9B%9F%E7%B1%BB%E4%BC%BC%E4%BA%8E%E4%B8%AD%E5%9B%BD%E4%BD%9C%E5%8D%8F%EF%BC%9A%E4%B8%80%E4%B8%AA%E8%AD%A6%E7%A4%BA%E6%95%85%E4%BA%8B%EF%BC%8C%E4%B8%80/",
  );
  assertEquals(
    await clean("http://reut.rs/3LfDnU8"),
    "https://www.reuters.com/world/asia-pacific/indonesia-bans-foreign-tourist-arrivals-jakarta-airport-covid-19-spikes-2022-02-07/",
  );
  assertEquals(
    await clean("http://r6d.cn/bxeag"),
    "https://xboxeer.github.io/NScrapy/",
  );
  assertEquals(
    await clean(" https://g.co/kgs/sAADQR"),
    "https://www.google.com/search?hl=en-US&si=ANhW_NqMq05hm_NHatki2oB83qRn9HU6YTauVAJv82wgMbWR1YYV-flD0q2rG5jqbvVrnIn68dDs0MGW5Hd1VTR2N9x0pws0hw%3D%3D&kgs=838f00c858aa68hndl=18&entrypoint=sh%2Fx%2Fkp%2Fee",
  );
  assertEquals(
    await clean("http://dlvr.it/SJsD6Z"),
    "https://www.williamlong.info/archives/6706.html",
  );
  assertEquals(
    await clean("https://wp.me/pbKqHZ-16I"),
    "https://jiangshanghan.art.blog/2022/02/14/%e6%99%a8%e5%85%89%e6%92%a9%e4%ba%ba/",
  );
  assertEquals(
    await clean("https://steam.pm/1b0g8w"),
    "https://steamcommunity.com/id/sovetskiysoyuz/",
  );
  assertEquals(
    await clean("https://rxau.pse.is/3w82ac"),
    "https://technews.tw/2022/02/14/spacex-falcon-9-rocket-we0913a-change-5-t1-spacecraft-long-march-3c/",
  );
  assertEquals(
    await clean("http://navo.top/UN7ZFv"),
    "https://live.polyv.cn/watch/2838045",
  );
  assertEquals(
    await clean("https://rfi.my/8Cmh.t"),
    "https://www.rfi.fr/cn/%E4%B8%AD%E5%9B%BD/20220226-%E5%8E%86%E5%8F%B2%E6%83%8A%E4%BA%BA%E5%9C%B0%E9%87%8D%E6%BC%94-%E6%99%AE%E4%BA%AC%E7%AE%97%E5%87%86%E4%BA%86%E8%A5%BF%E6%96%B9",
  );
  assertEquals(
    await clean("https://0rz.tw/WKtEG"),
    "https://www.youtube.com/watch?v=z67BZ1T0ehU",
  );
  assertEquals(
    await clean("http://lxi.me/xmooh"),
    "https://donate.bangbangwang.cn/p/ca4x83g5ep9wn0rr4oml20mlo1qyzv27",
  );
  assertEquals(
    await clean("https://kutt.appinn.net/uq9vp4"),
    "https://greasyfork.org/zh-CN/scripts/442187-open-the-link-directly",
  );
  assertEquals(
    await clean("https://xczs.vip/f/60451f"),
    "http://h5.quicktour.cn/village/%E9%9D%99%E5%AE%89%E5%8C%BA",
  );
  assertEquals(
    await clean("https://nyti.ms/3EJyP5G"),
    "https://www.nytimes.com/zh-hans/2022/04/21/world/asia/covid-shanghai-ukraine-great-firewall.html?smid=tw-nytimes&smtyp=cur",
  );
  assertEquals(
    await clean("https://lat.ms/3wvGBwe"),
    "https://www.latimes.com/california/story/2022-05-16/laguna-woods-gunman-worked-methodically-but-motive-a-mystery",
  );
  assertEquals(
    await clean("https://bbc.in/39fffmk"),
    "https://www.youtube.com/watch?v=I0DJlSqlmEw",
  );

  console.info("测试复杂短网址规则");
  assertEquals(
    await clean("https://t.co/KODJKyanrb"),
    "https://harrydenley.com/faking-twitter-unfurling/",
  );
  assertEquals(
    await clean("https://xhslink.com/sc2AZg"),
    "https://www.xiaohongshu.com/discovery/item/626a84bb000000000102b3eb",
  );
  assertEquals(
    await clean("https://douc.cc/0cdUDB"),
    "https://ukiyo1220.blogspot.com/2021/05/blog-post.html?m=1",
  );
  assertEquals(
    await clean("https://t.cn/A6MRtZVJ"),
    "https://techxplore.com/news/2021-08-lg-6g-transmission-meters.html",
  );
  assertEquals(
    await clean("https://t.cn/A6xC9mPC"),
    "http://www.zj.gov.cn/art/2020/8/25/art_1229277996_42332.html",
  );
  assertEquals(
    await clean("http://t.cn/A6iXJDSr"),
    "https://video.weibo.com/show?fid=1034%3A4731764124614744",
  );
  assertEquals(
    await clean("http://fumacrom.com/3ctzC"),
    "https://cxybb.com/article/qq_43342406/84451337",
  );
  assertEquals(
    await clean("http://dw-z.ink/0i1eI"),
    "https://example.com/",
  );
  assertEquals(
    await clean("https://t.tl/5pqk"),
    "https://segmentfault.com/q/1010000014169010",
  );
  assertEquals(
    await clean("https://reurl.cc/5qRvv7"),
    "https://www.youtube.com/watch?v=xESa_v32HGU",
  );
  assertEquals(
    await clean(
      "https://www.google.com/amp/s/www.pbs.org/newshour/amp/show/why-a-russian-evasion-of-ukraine-appears-imminent-despite-intense-diplomatic-efforts",
    ),
    "https://www.pbs.org/newshour/show/why-a-russian-evasion-of-ukraine-appears-imminent-despite-intense-diplomatic-efforts",
  );

  console.info("开始测试其他域名规则");
  assertEquals(
    await clean(
      "https://share.api.weibo.cn/share/298799668,4759038422680085.html",
    ),
    "https://m.weibo.cn/status/4759038422680085",
  );
  assertEquals(
    await clean(
      "https://share.api.weibo.cn/share/297687435,4757578406169966.html?weibo_id=4757578406169966&wx=1",
    ),
    "https://m.weibo.cn/status/4757578406169966",
  );
  assertEquals(
    await clean(
      "https://share.api.weibo.cn/share/297687435.html?weibo_id=4757578406169966",
    ),
    "https://m.weibo.cn/status/4757578406169966",
  );

  console.info("开始测试黑名单……");
  assertEquals(
    await clean(
      "https://www.bbc.com/zhongwen/simp/world-60194505?at_medium=RSS&at_campaign=KARANGA",
    ),
    "https://www.bbc.com/zhongwen/simp/world-60194505",
  );
  assertEquals(
    await clean(
      "https://www.amazon.com/s?k=house+cleaning+supplies&language=zh&pf_rd_i=23641713011&pf_rd_i=23641713011&pf_rd_m=ATVPDKIKX0DER&pf_rd_m=ATVPDKIKX0DER&pf_rd_p=58b06124-efbc-4cfb-bb92-953e4e169518&pf_rd_p=9293d121-93cf-401c-9213-08f5d464f092&pf_rd_r=62EF4F29BD124AS57RAY&pf_rd_r=T9K6XWDA48DPT1A6PWZG&pf_rd_s=merchandised-search-3&pf_rd_s=merchandised-search-3&pf_rd_t=101&pf_rd_t=101&sprefix=house+cle%2Caps%2C162&ref=nb_sb_ss_ts-doa-p_1_9",
    ),
    "https://www.amazon.com/s?k=house+cleaning+supplies&language=zh&sprefix=house+cle%2Caps%2C162&ref=nb_sb_ss_ts-doa-p_1_9",
  );
  assertEquals(
    await clean(
      "https://www.infoq.com/articles/kotlin-ten-years-qa/?topicPageSponsorship=9df7746f-b196-415b-964e-bc8483319fd9&itm_source=articles_about_development&itm_medium=link&itm_campaign=development",
    ),
    "https://www.infoq.com/articles/kotlin-ten-years-qa/",
  );
  assertEquals(
    await clean(
      "https://open.spotify.com/track/7HRrG09z9d5qCAbT3R3qJ9?si=lcTEeS6MQfGJEfXA7G3Ehg",
    ),
    "https://open.spotify.com/track/7HRrG09z9d5qCAbT3R3qJ9",
  );
  assertEquals(
    await clean(
      "https://podcasts.apple.com/us/podcast/%E5%AF%BB%E8%B8%AA%E8%A7%85%E5%BD%B1-her-unfolding-stories/id1600854959?i=1000549119908",
    ),
    "https://podcasts.apple.com/us/podcast/%E5%AF%BB%E8%B8%AA%E8%A7%85%E5%BD%B1-her-unfolding-stories/id1600854959",
  );
  assertEquals(
    await clean(
      "https://www.alza.de/gaming/lego-harry-potter-collection-years-1-8-ps4-d4526446.htm?kampan=test",
    ),
    "https://www.alza.de/gaming/lego-harry-potter-collection-years-1-8-ps4-d4526446.htm",
  );

  console.info("开始测试白名单……");
  assertEquals(
    await clean("https://www.sendgb.com/upload/?utm_source=Tg7xBrzswYZ"),
    "https://www.sendgb.com/upload/?utm_source=Tg7xBrzswYZ",
  );
  assertEquals(
    await clean(
      "https://www.dodge.com/mediaserver/iris?COSY-EU-100-1713uLDEMTV1r9s%25WBXaBKFmfKSLC9gIQALMc6UhVkmGBfM9IW2VRkr72kVQd9pivwXGXQpMTV1rUp3g6OQCckPquBhS1U%25jzbTllxA0zmil%253QFmwpDkpd2dTBoM&&pov=fronthero&width=332&height=230&bkgnd=white&resp=jpg&cut=&utm_source=Tg7xBrzswYZ",
    ),
    "https://www.dodge.com/mediaserver/iris?COSY-EU-100-1713uLDEMTV1r9s%25WBXaBKFmfKSLC9gIQALMc6UhVkmGBfM9IW2VRkr72kVQd9pivwXGXQpMTV1rUp3g6OQCckPquBhS1U%25jzbTllxA0zmil%253QFmwpDkpd2dTBoM&&pov=fronthero&width=332&height=230&bkgnd=white&resp=jpg&cut=&utm_source=Tg7xBrzswYZ",
  );

  console.info("开始测试其它情况……");
  assertEquals(
    await clean(
      "magnet:?xt=urn:btih:dc718539145bde27dddb5e94c67949e6d1c8513c&dn=integdev_gpu_drv.rar&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce",
    ),
    "magnet:?xt=urn:btih:dc718539145bde27dddb5e94c67949e6d1c8513c&dn=integdev_gpu_drv.rar&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce",
  );
});
