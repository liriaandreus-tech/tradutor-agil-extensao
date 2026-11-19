const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../tradutor-agil/background.js"), "utf8");
function translator(fetch) {
  let receive;
  const unused = { addListener() {} };
  const chrome = {
    runtime: { id: "test", onInstalled: unused, onMessage: { addListener(fn) { receive = fn; } } },
    contextMenus: { onClicked: unused }
  };
  vm.runInNewContext(source, { fetch, chrome, URL, URLSearchParams, TextEncoder, AbortSignal });
  return text => new Promise(resolve => {
    assert.equal(receive({ action: "translate", text }, { id: "test" }, resolve), true);
  });
}

test("envia PT → EN, preserva caracteres e reúne segmentos", async () => {
  const text = "Aço & café + 2?";
  const run = translator(async (url, options) => {
    assert.equal(url.origin, "https://translate.googleapis.com");
    assert.equal(url.searchParams.get("q"), text);
    assert.equal(url.searchParams.get("sl"), "pt");
    assert.equal(url.searchParams.get("tl"), "en");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.equal(options.referrerPolicy, "no-referrer");
    return { ok: true, json: async () => [[["Steel "], ["and coffee"]]] };
  });
  assert.equal((await run(text)).translation, "Steel and coffee");
});

for (const [name, fetch, expected] of [
  ["HTTP 429", async () => ({ status: 429 }), /Limite/],
  ["HTTP 503", async () => ({ status: 503 }), /serviço/],
  ["rede indisponível", async () => { throw new Error(); }, /conexão/],
  ["estrutura inválida", async () => ({ ok: true, json: async () => [[null]] }), /inválida/],
  ["tradução vazia", async () => ({ ok: true, json: async () => [[[" "]]] }), /vazia/]
]) {
  test(name, async () => assert.match((await translator(fetch)("Bom dia")).error, expected));
}

test("valida seleção e limite em bytes antes do envio", async () => {
  let calls = 0;
  const run = translator(() => { calls++; });
  assert.match((await run(" ")).error, /Selecione/);
  assert.match((await run("á".repeat(2251))).error, /4.500 bytes/);
  assert.equal(calls, 0);
});
