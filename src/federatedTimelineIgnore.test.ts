// noinspection HttpUrlsUsage

import { test } from "./rules-federatedTimelineIgnore.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test(
  "Federated Timeline Ignore",
  () => {
    assertEquals(test("https://redd.it/sk5q61"), true);
    assertEquals(
      test(
        "https://twitter.com/MoiChi26987483/status/1489077103525982211?s=09",
      ),
      true,
    );
    assertEquals(
      test(
        "https://twitter.com/poooo_chu/status/1488202767399546880?t=HWBddyskaqyd430F0cW9_A&s=19",
      ),
      false,
    );
    assertEquals(test("https://youtu.be/W-vGo14LGEI"), true);
    assertEquals(test("https://youtu.be/W-vGo14LGEI?t=33"), true);
    assertEquals(test("http://t.cn/A6iKg8lX"), false);
    assertEquals(
      test(
        "https://www.bbc.co.uk/sport/winter-olympics/60256132?at_medium=RSS&at_campaign=KARANGA",
      ),
      false,
    );
  },
);
