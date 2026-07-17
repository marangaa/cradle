const VISITOR_KEY_PREFIX = "cradle:visitor:";

/** Portable, framework-free website representative. */
class CradleResident extends HTMLElement {
  private readonly shadow = this.attachShadow({ mode: "open" });
  private open = false;

  connectedCallback() {
    const installationId = this.getAttribute("installation-id");
    const apiBase = this.getAttribute("api-base");
    if (!installationId || !apiBase) throw new Error("CradleResident requires installation-id and api-base attributes.");
    const visitorId = this.getVisitorId(installationId);
    const conversationId = this.getConversationId(installationId);
    this.shadow.innerHTML = `<style>:host{all:initial;font-family:ui-rounded,system-ui,sans-serif;color:#1b1a17}.shell{position:fixed;right:24px;bottom:24px;z-index:2147483647}.pet{width:64px;height:64px;border:0;border-radius:50% 46% 52% 44%;background:#e87845;box-shadow:5px 6px 0 #37291d;font-size:28px;cursor:pointer}.panel{width:min(360px,calc(100vw - 32px));margin-bottom:16px;overflow:hidden;border:2px solid #37291d;border-radius:18px;background:#fffaf1;box-shadow:8px 9px 0 #37291d}.head{padding:15px 18px;background:#f2d8ae;font-weight:700}.messages{min-height:160px;max-height:320px;overflow:auto;padding:16px;white-space:pre-wrap;line-height:1.5}form{display:flex;gap:8px;padding:12px;border-top:1px solid #d7c8b6}input{min-width:0;flex:1;border:1px solid #9f8f7e;border-radius:9px;padding:10px;font:inherit}.send{border:0;border-radius:9px;background:#37291d;color:#fffaf1;padding:10px 13px;cursor:pointer}</style><div class="shell"><section class="panel" hidden><div class="head">Your company representative</div><div class="messages">Hi — what can I help with?</div><form><input aria-label="Message" placeholder="Ask a question"><button class="send">Send</button></form></section><button class="pet" aria-label="Open company representative">◕</button></div>`;
    const panel = this.shadow.querySelector(".panel") as HTMLElement;
    const pet = this.shadow.querySelector(".pet") as HTMLButtonElement;
    const form = this.shadow.querySelector("form") as HTMLFormElement;
    const input = this.shadow.querySelector("input") as HTMLInputElement;
    const messages = this.shadow.querySelector(".messages") as HTMLElement;
    pet.addEventListener("click", () => { this.open = !this.open; panel.hidden = !this.open; });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = input.value.trim(); if (!message) return;
      input.value = ""; messages.textContent += `\n\nYou: ${message}\nRepresentative: `;
      const response = await fetch(`${apiBase}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ installationId, visitorId, conversationId, message }) });
      if (!response.ok || !response.body) { messages.textContent += "I could not respond just now."; return; }
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      while (true) { const { done, value } = await reader.read(); if (done) break; messages.textContent += decoder.decode(value, { stream: true }); messages.scrollTop = messages.scrollHeight; }
    });
  }

  private getVisitorId(installationId: string) {
    const key = `${VISITOR_KEY_PREFIX}${installationId}`; const existing = localStorage.getItem(key);
    if (existing) return existing; const created = crypto.randomUUID(); localStorage.setItem(key, created); return created;
  }

  /** Keeps a visitor's transcript continuous while they return to a site. */
  private getConversationId(installationId: string) {
    const key = `cradle:conversation:${installationId}`; const existing = localStorage.getItem(key);
    if (existing) return existing; const created = crypto.randomUUID(); localStorage.setItem(key, created); return created;
  }
}

if (!customElements.get("cradle-resident")) customElements.define("cradle-resident", CradleResident);
