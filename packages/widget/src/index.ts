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
    this.shadow.innerHTML = `<style>:host{all:initial;font-family:ui-rounded,system-ui,sans-serif;color:#1b1a17}.shell{position:fixed;right:24px;bottom:24px;z-index:2147483647}.pet{display:grid;place-items:center;width:68px;height:68px;border:1px solid #3b2f26;border-radius:44% 56% 50% 50%;background:var(--familiar-main,#e87845);box-shadow:5px 6px 0 #37291d;font-size:25px;cursor:pointer}.pet::after{content:"";width:12px;height:12px;border-radius:50%;background:var(--familiar-accent,#f2d8ae);box-shadow:18px 2px 0 var(--familiar-accent,#f2d8ae)}.panel{width:min(380px,calc(100vw - 32px));margin-bottom:16px;overflow:hidden;border:1px solid #37291d;border-radius:24px 24px 7px 24px;background:#fffaf1;box-shadow:8px 9px 0 #37291d}.head{display:flex;align-items:center;gap:10px;padding:15px 18px;background:var(--familiar-wash,#f2d8ae);font-weight:700}.mark{width:14px;height:14px;border-radius:45% 55% 50% 50%;background:var(--familiar-main,#e87845)}.messages{min-height:160px;max-height:320px;overflow:auto;padding:16px;white-space:pre-wrap;line-height:1.5}form{display:flex;gap:8px;padding:12px;border-top:1px solid #d7c8b6}input{min-width:0;flex:1;border:1px solid #9f8f7e;border-radius:9px;padding:10px;font:inherit}.send{border:0;border-radius:9px;background:#37291d;color:#fffaf1;padding:10px 13px;cursor:pointer}</style><div class="shell"><section class="panel" hidden><div class="head"><span class="mark"></span><span class="title">A familiar is arriving</span></div><div class="messages">I’m getting to know this place.</div><form><input aria-label="Message" placeholder="Ask something"><button class="send">Send</button></form></section><button class="pet" aria-label="Open familiar"></button></div>`;
    const panel = this.shadow.querySelector(".panel") as HTMLElement;
    const pet = this.shadow.querySelector(".pet") as HTMLButtonElement;
    const form = this.shadow.querySelector("form") as HTMLFormElement;
    const input = this.shadow.querySelector("input") as HTMLInputElement;
    const messages = this.shadow.querySelector(".messages") as HTMLElement;
    void this.loadFamiliar(apiBase, installationId, messages, pet);
    pet.addEventListener("click", () => { this.open = !this.open; panel.hidden = !this.open; this.setState(pet, this.open ? "welcome" : "idle"); });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = input.value.trim(); if (!message) return;
      input.value = ""; this.setState(pet, "thinking"); messages.textContent += `\n\nYou: ${message}\nRepresentative: `;
      const response = await fetch(`${apiBase}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ installationId, visitorId, conversationId, message }) });
      if (!response.ok || !response.body) { this.setState(pet, "away"); messages.textContent += "I could not respond just now."; return; }
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      while (true) { const { done, value } = await reader.read(); if (done) break; messages.textContent += decoder.decode(value, { stream: true }); messages.scrollTop = messages.scrollHeight; }
      this.setState(pet, "resolved");
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

  /** Hydrates the visual and opening voice from the published Familiar manifest. */
  private setState(pet: HTMLButtonElement, state: string) {
    const states = JSON.parse(pet.dataset.cradleStates ?? "{}") as Record<string, string>;
    const image = states[state] ?? states.idle ?? states.canonical;
    if (image) pet.style.backgroundImage = `url(${image})`;
  }

  private async loadFamiliar(apiBase: string, installationId: string, messages: HTMLElement, pet: HTMLButtonElement) {
    const response = await fetch(`${apiBase}/api/installations/${installationId}`);
    if (!response.ok) return;
    const payload = await response.json() as { familiar: { name: string; greeting: string; palette: [string, string, string] } | null; assets: { states: Record<string, { url: string }> } | null };
    if (!payload.familiar) return;
    const [main, accent, wash] = payload.familiar.palette;
    this.style.setProperty("--familiar-main", main); this.style.setProperty("--familiar-accent", accent); this.style.setProperty("--familiar-wash", wash);
    const title = this.shadow.querySelector(".title");
    if (title) title.textContent = payload.familiar.name;
    messages.textContent = payload.familiar.greeting;
    if (payload.assets?.states) { pet.dataset.cradleStates = JSON.stringify(Object.fromEntries(Object.entries(payload.assets.states).map(([state, asset]) => [state, `${apiBase}${asset.url}`]))); pet.style.backgroundSize = "cover"; pet.style.backgroundPosition = "center"; this.setState(pet, "idle"); }
  }
}

if (!customElements.get("cradle-resident")) customElements.define("cradle-resident", CradleResident);
