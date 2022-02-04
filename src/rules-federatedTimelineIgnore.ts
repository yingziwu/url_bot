interface allowRule {
  domain: string;
  search: string[];
}
const allowRules: allowRule[] = [
  { domain: "youtu.be", search: ["t"] },
  { domain: "redd.it", search: [] },
  { domain: "twitter.com", search: ["s"] },
];

export function test(url: string): boolean {
  const _url = new URL(url);
  const rule = allowRules.find((r) => r.domain === _url.hostname);
  if (!rule) {
    return false;
  }
  for (const param of [..._url.searchParams.keys()]) {
    if (!rule.search.includes(param)) {
      return false;
    }
  }
  return true;
}
