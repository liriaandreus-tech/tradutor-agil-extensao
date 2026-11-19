const MENU_ID = "translate-agile";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Traduzir com Tradução Ágil",
    contexts: ["selection"],
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText || tab?.id == null) return;
  try {
    // The top document can also display selections made inside embedded frames.
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
    if (info.pageUrl && injection.result !== info.pageUrl) return;
    await chrome.tabs.sendMessage(tab.id, {
      action: "showPopup",
      text: info.selectionText,
      inFrame: Boolean(info.frameId)
    }, { documentId: injection.documentId });
  } catch {
    // Chrome protects some documents, and the tab may close during injection.
    console.warn("Tradução Ágil: não foi possível abrir o cartão nesta página.");
  }
});

async function translate(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Selecione um texto em português.");
  if (new TextEncoder().encode(text).length > 4500) {
    throw new Error("Selecione um trecho menor (até 4.500 bytes em UTF-8).");
  }
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.search = new URLSearchParams({ client: "gtx", sl: "pt", tl: "en", dt: "t", q: text });
  let response;
  let data;
  try {
    response = await fetch(url, {
      credentials: "omit", cache: "no-store", redirect: "error",
      referrerPolicy: "no-referrer", signal: AbortSignal.timeout(12000)
    });
    if (response.ok) data = await response.json();
  } catch {
    throw new Error("Não foi possível concluir a tradução. Verifique a conexão e tente novamente.");
  }
  if (response.status === 429) throw new Error("Limite do serviço atingido. Tente novamente mais tarde.");
  if (!response.ok || !Array.isArray(data?.[0]) || !data[0].length ||
      !data[0].every(segment => Array.isArray(segment) && typeof segment[0] === "string")) {
    throw new Error("O serviço de tradução retornou uma resposta inválida. Tente novamente.");
  }
  const result = data[0].map(segment => segment[0]).join("");
  if (!result.trim()) throw new Error("O serviço retornou uma tradução vazia.");
  return result;
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || message.action !== "translate") return;
  translate(message.text).then(translation => reply({ translation }), error => reply({ error: error.message }));
  return true;
});
