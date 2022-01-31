import { clean } from "./removeTrackParam.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Remove Track Param", async () => {
  console.info("开始测试短链接……");
  assertEquals(
    await clean("https://b23.tv/d3BTHVL"),
    "https://www.bilibili.com/video/BV1uP4y1n7Zf?p=1"
  );
  assertEquals(
    await clean("https://youtu.be/SM-7GT6mYeQ"),
    "https://www.youtube.com/watch?v=SM-7GT6mYeQ"
  );
  assertEquals(
    await clean("https://redd.it/sgt7hh"),
    "https://www.reddit.com/comments/sgt7hh"
  );
  assertEquals(
    await clean("https://v.redd.it/n54nilefa3b61I"),
    "https://www.reddit.com/r/BeAmazed/comments/kwf2uj/when_it_snows_for_an_hour_in_finland/"
  );
  assertEquals(
    await clean("https://we.tl/t-SLdvGw6i3k"),
    "https://wetransfer.com/downloads/f243e28dab7a5d83b5c337c5e8a4a3fa20220131012118/b209cf"
  );
  assertEquals(
    await clean("https://bit.ly/3G9VSFJ"),
    "https://greasyfork.org/zh-CN/scripts/439276-%E7%9C%9F%E7%99%BD%E8%90%8C%E6%96%B0%E7%AB%99%E6%B7%BB%E5%8A%A0%E5%85%A8%E9%83%A8%E8%AE%A2%E9%98%85%E6%8C%89%E9%92%AE"
  );
  assertEquals(
    await clean("https://is.gd/gttnnn"),
    "https://www.blogger.com/profile/17337526690110916908"
  );
  assertEquals(
    await clean("https://dwz.cn/97V19jTh?u=29e599a4f323c598"),
    "https://m.baidu.com/sf?pd=video_page&nid=&sign=8007857985042630614&word=s%E5%BD%A2%E4%BB%BB%E6%84%8F%E7%90%83&oword=s%E5%BD%A2%E4%BB%BB%E6%84%8F%E7%90%83&title=%E5%84%92%E5%B0%BC%E5%B0%BC%E5%A5%A5%E7%BB%9D%E4%B8%96%E7%BB%8F%E5%85%B8S%E5%9E%8B%E4%BB%BB%E6%84%8F%E7%90%83&atn=index&alr=1&resource_id=5052&sp=0"
  );
  assertEquals(
    await clean("http://sourl.cn/JsCiTu"),
    "https://pan.baidu.com/s/1laBXTbzkx3MaS87KShyhXg"
  );
  assertEquals(
    await clean("https://w.url.cn/s/AcByUwk"),
    "https://weixin.qq.com/qremoticonstore?productid=aL2PCfwK%2F89qO7sF6%2F+I+UDhfwEjhec2ZNvdnLLJRd%2FPR670iiGeTeB5N6I%2FvHrCl+9yXngJ5P39syGEIlB9f%2FI9F4onxcXgHAmuzCLduZZo%3D"
  );
  assertEquals(
    await clean("https://tinyurl.com/hft63djj"),
    "https://www.douban.com/group/topic/258977811/"
  );
  assertEquals(
    await clean("https://goo.gl/SXYcFm"),
    "https://www.youtube.com/playlist?list=PLsw2iU9xmpfZKOcZbKn7tbAPAi6hdM72w&disable_polymer=true"
  );
  assertEquals(
    await clean("http://mtw.so/6mz6iq"),
    "https://app3smw8f5b1177.h5.xiaoeknow.com/v2/course/alive/l_61e273ace4b0f67a4d486d61?app_id=app3smw8f5b1177&alive_mode=0&pro_id=term_61e3b6352eff0_5WDTNK&type=2"
  );

  assertEquals(
    await clean("https://t.co/KODJKyanrb"),
    "https://harrydenley.com/faking-twitter-unfurling/"
  );
  assertEquals(
    await clean("https://t.cn/A6MRtZVJ"),
    "https://techxplore.com/news/2021-08-lg-6g-transmission-meters.html"
  );
  assertEquals(
    await clean("https://t.cn/A6xC9mPC"),
    "http://www.zj.gov.cn/art/2020/8/25/art_1229277996_42332.html"
  );
  // assertEquals(
  //   await clean("http://fumacrom.com/3ctzC"),
  //   "https://cxybb.com/article/qq_43342406/84451337"
  // );

  console.info("开始测试黑名单……");
  assertEquals(
    await clean(
      "https://www.bbc.com/zhongwen/simp/world-60194505?at_medium=RSS&at_campaign=KARANGA"
    ),
    "https://www.bbc.com/zhongwen/simp/world-60194505"
  );
  assertEquals(
    await clean(
      "https://www.amazon.com/s?k=house+cleaning+supplies&language=zh&pf_rd_i=23641713011&pf_rd_i=23641713011&pf_rd_m=ATVPDKIKX0DER&pf_rd_m=ATVPDKIKX0DER&pf_rd_p=58b06124-efbc-4cfb-bb92-953e4e169518&pf_rd_p=9293d121-93cf-401c-9213-08f5d464f092&pf_rd_r=62EF4F29BD124AS57RAY&pf_rd_r=T9K6XWDA48DPT1A6PWZG&pf_rd_s=merchandised-search-3&pf_rd_s=merchandised-search-3&pf_rd_t=101&pf_rd_t=101&sprefix=house+cle%2Caps%2C162&ref=nb_sb_ss_ts-doa-p_1_9"
    ),
    "https://www.amazon.com/s?k=house+cleaning+supplies&language=zh&sprefix=house+cle%2Caps%2C162&ref=nb_sb_ss_ts-doa-p_1_9"
  );
  assertEquals(
    await clean(
      "https://www.infoq.com/articles/kotlin-ten-years-qa/?topicPageSponsorship=9df7746f-b196-415b-964e-bc8483319fd9&itm_source=articles_about_development&itm_medium=link&itm_campaign=development"
    ),
    "https://www.infoq.com/articles/kotlin-ten-years-qa/"
  );

  console.info("开始测试白名单……");
  assertEquals(
    await clean("https://www.sendgb.com/upload/?utm_source=Tg7xBrzswYZ"),
    "https://www.sendgb.com/upload/?utm_source=Tg7xBrzswYZ"
  );
  assertEquals(
    await clean(
      "https://www.dodge.com/mediaserver/iris?COSY-EU-100-1713uLDEMTV1r9s%25WBXaBKFmfKSLC9gIQALMc6UhVkmGBfM9IW2VRkr72kVQd9pivwXGXQpMTV1rUp3g6OQCckPquBhS1U%25jzbTllxA0zmil%253QFmwpDkpd2dTBoM&&pov=fronthero&width=332&height=230&bkgnd=white&resp=jpg&cut=&utm_source=Tg7xBrzswYZ"
    ),
    "https://www.dodge.com/mediaserver/iris?COSY-EU-100-1713uLDEMTV1r9s%25WBXaBKFmfKSLC9gIQALMc6UhVkmGBfM9IW2VRkr72kVQd9pivwXGXQpMTV1rUp3g6OQCckPquBhS1U%25jzbTllxA0zmil%253QFmwpDkpd2dTBoM&&pov=fronthero&width=332&height=230&bkgnd=white&resp=jpg&cut=&utm_source=Tg7xBrzswYZ"
  );
});
