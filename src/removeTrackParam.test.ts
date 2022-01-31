import { clean } from "./removeTrackParam.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Remove Track Param Test", async () => {
  assertEquals(
    await clean("https://b23.tv/d3BTHVL"),
    "https://www.bilibili.com/video/BV1uP4y1n7Zf?p=1"
  );
  assertEquals(
    await clean("https://youtu.be/SM-7GT6mYeQ"),
    "https://www.youtube.com/watch?v=SM-7GT6mYeQ"
  );
  assertEquals(
    await clean("https://v.redd.it/n54nilefa3b61"),
    "https://www.reddit.com/r/BeAmazed/comments/kwf2uj/when_it_snows_for_an_hour_in_finland/"
  );
  assertEquals(
    await clean("https://we.tl/t-SLdvGw6i3k"),
    "https://wetransfer.com/downloads/f243e28dab7a5d83b5c337c5e8a4a3fa20220131012118/b209cf"
  );
  assertEquals(
    await clean("https://t.co/KODJKyanrb"),
    "https://harrydenley.com/faking-twitter-unfurling/"
  );

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
