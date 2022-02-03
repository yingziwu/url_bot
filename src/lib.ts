import {DOMParser, Element, Node, Text,} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export function parse(input: string) {
    const doc = new DOMParser().parseFromString("", "text/html");
    if (doc) {
        const div = doc.createElement("div");
        div.innerHTML = input;
        return div;
    } else {
        throw new Error("parse input string error!");
    }
}

export function getTexts(elem: Element) {
    return [...findTextNode(elem)].filter((t) => t !== null).map((
        t,
    ) => (t as Text).textContent.trim());

    function* findTextNode(elem: Node): Generator<Text | null> {
        if (elem instanceof Text) {
            yield elem;
        }
        if (elem.childNodes.length !== 0) {
            for (const node of Array.from(elem.childNodes)) {
                yield* findTextNode(node);
            }
        } else {
            yield null;
        }
    }
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function compareUrl(url1: string, url2: string) {
    const u1 = new URL(url1);
    const u2 = new URL(url2);
    if (u1.origin !== u2.origin || u1.pathname !== u2.pathname) {
        return false;
    }
    const u1kvs = [...u1.searchParams.entries()];
    const u2kvs = [...u2.searchParams.entries()];
    if (u1kvs.length !== u2kvs.length) {
        return false;
    }
    const u2map = new Map(u2kvs);
    for (const [k, v] of u1kvs) {
        if (
            u2map.get(k) === undefined ||
            unescape(v) !== unescape(u2map.get(k) as string)
        ) {
            return false;
        }
    }
    return true;
}

export async function sha1sum(input: string) {
    const enc = new TextEncoder();
    const arrayBuffer = enc.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // noinspection UnnecessaryLocalVariableJS
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
}
