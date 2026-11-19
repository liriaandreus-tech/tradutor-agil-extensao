(() => {
  if (globalThis.traducaoAgilAtiva) return location.href;
  globalThis.traducaoAgilAtiva = true;
  let popup;

  function close() {
    popup?.remove();
    popup = undefined;
  }

  document.addEventListener("mousedown", event => {
    if (popup && !event.composedPath().includes(popup)) close();
  }, true);
  document.addEventListener("keydown", event => {
    if (popup && event.key === "Escape") close();
  }, true);

  async function show({ text, inFrame }) {
    close();
    const selection = window.getSelection();
    const anchor = !inFrame && selection?.rangeCount
      ? selection.getRangeAt(0).getBoundingClientRect() : null;
    const host = document.createElement("div");
    host.style.cssText = "all: initial; position: fixed; z-index: 2147483647; left: 8px; top: 8px";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      [hidden] { display: none !important; }
      .card {
        box-sizing: border-box;
        width: min(360px, calc(100vw - 16px));
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        background: #101c1b;
        border-left: 7px solid #b7f26c;
        border-radius: 18px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, .3);
        color: #f3f8e9;
        font-family: Inter, "Segoe UI", sans-serif;
      }
      .header { padding: 24px 25px 0; position: relative; }
      .header-title {
        display: block;
        color: #b7f26c;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        padding-right: 30px;
      }
      .subtitle { color: #b0c3bb; font-size: 13px; margin: 18px 0 0; }
      .close {
        position: absolute;
        top: 14px;
        right: 16px;
        border: 0;
        background: transparent;
        color: #acc3bb;
        font-size: 25px;
        line-height: 1;
        cursor: pointer;
        padding: 6px;
      }
      .close:hover { color: #fff; }
      .content { padding: 0 25px 22px; }
      .divider { height: 1px; background: #40534d; margin: 22px 0 18px; }
      .section-label {
        color: #a9beb5;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .text-box {
        font-size: 14px;
        line-height: 1.5;
        max-height: 110px;
        overflow-y: auto;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
        color: #c5d4cc;
      }
      .translation-label { color: #b7f26c; margin-top: 30px; }
      .translation-box {
        color: #f3f8e9;
        font-family: Georgia, serif;
        font-size: 23px;
        line-height: 1.25;
        max-height: 150px;
      }
      .btn-copy {
        background: #b7f26c;
        color: #172416;
        border: 0;
        border-radius: 10px;
        cursor: pointer;
        width: 100%;
        min-height: 52px;
        padding: 10px 16px;
        margin-top: 32px;
        font: 600 15px Inter, "Segoe UI", sans-serif;
      }
      .btn-copy:hover { background: #c7fb85; }
      button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
      .hint { color: #a5b8af; font-size: 11px; margin-top: 18px; }
    `;
    const card = document.createElement("section");
    card.className = "card";
    card.setAttribute("aria-label", "Tradução Ágil");
    card.innerHTML = `
      <div class="header">
        <span class="header-title">Tradução Ágil</span>
        <button class="close" aria-label="Fechar">×</button>
        <p class="subtitle">De português para inglês</p>
      </div>
      <div class="content">
        <div class="divider"></div>
        <div class="section-label">Original</div>
        <div class="text-box source"></div>
        <div class="section-label translation-label">Tradução</div>
        <div class="text-box translation-box" role="status"></div>
        <button class="btn-copy" hidden>Copiar tradução ↗</button>
        <div class="hint">Esc para fechar</div>
      </div>`;
    const result = card.querySelector(".translation-box");
    const button = card.querySelector(".btn-copy");
    card.querySelector(".close").addEventListener("click", close);
    card.querySelector(".source").textContent = text;
    result.textContent = "Traduzindo…";
    shadow.append(style, card);
    document.documentElement.append(host);
    popup = host;

    function position() {
      const box = card.getBoundingClientRect();
      host.style.left = Math.max(8, Math.min(anchor?.left ?? 8, innerWidth - box.width - 8)) + "px";
      host.style.top = Math.max(8, Math.min(anchor?.bottom ?? 8, innerHeight - box.height - 8)) + "px";
    }
    position();
    try {
      const response = await chrome.runtime.sendMessage({ action: "translate", text });
      if (popup !== host) return;
      if (response.error) {
        result.textContent = response.error;
      } else {
        result.textContent = response.translation;
        button.hidden = false;
        button.onclick = async () => {
          try {
            await navigator.clipboard.writeText(response.translation);
            button.textContent = "✅ Copiado!";
          } catch {
            button.textContent = "Selecione a tradução e copie manualmente";
          }
          position();
        };
      }
    } catch {
      result.textContent = "Recarregue a página e tente novamente.";
    }
    if (popup === host) position();
  }

  chrome.runtime.onMessage.addListener(message => {
    if (message.action === "showPopup") void show(message);
  });
  return location.href;
})();
