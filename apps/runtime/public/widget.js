"use strict";
(() => {
  // src/telemetry.ts
  var UserEventJournal = class {
    events;
    capacity;
    pointer = 0;
    count = 0;
    constructor(capacity = 50) {
      this.capacity = capacity;
      this.events = new Array(capacity).fill(null);
    }
    record(event) {
      this.events[this.pointer] = event;
      this.pointer = (this.pointer + 1) % this.capacity;
      if (this.count < this.capacity) {
        this.count++;
      }
    }
    getEvents() {
      if (this.count === 0) return [];
      const result = [];
      const startIndex = this.count < this.capacity ? 0 : this.pointer;
      for (let i2 = 0; i2 < this.count; i2++) {
        const idx = (startIndex + i2) % this.capacity;
        const item = this.events[idx];
        if (item) result.push(item);
      }
      return result;
    }
    toTimeline() {
      const list = this.getEvents();
      if (list.length === 0) return "No recorded user actions on this page.";
      const now = Date.now();
      return list.map((e2) => {
        const elapsedSec = Math.max(0, Math.round((now - e2.timestamp) / 1e3));
        const timeLabel = elapsedSec === 0 ? "just now" : `${elapsedSec}s ago`;
        switch (e2.type) {
          case "click":
            return `\u2022 [${timeLabel}] Clicked ${e2.target || "element"} (${e2.text ? '"' + e2.text + '"' : ""}) on ${e2.url}`;
          case "input":
            return `\u2022 [${timeLabel}] Input on ${e2.target || "input"} on ${e2.url}`;
          case "navigation":
            return `\u2022 [${timeLabel}] Navigated to ${e2.url}`;
          case "error":
            return `\u2022 [${timeLabel}] Error on ${e2.url}: ${e2.text || "unknown"}`;
        }
      }).join("\n");
    }
    clear() {
      this.events.fill(null);
      this.pointer = 0;
      this.count = 0;
    }
  };
  var WidgetTelemetry = class {
    journal = new UserEventJournal(50);
    cleanupFns = [];
    isRunning = false;
    init() {
      if (this.isRunning || typeof window === "undefined") return;
      this.isRunning = true;
      const handleClick = (e2) => {
        const el = e2.target;
        if (!el || el.closest("cradle-character") || el.closest("[data-cradle-widget]")) {
          return;
        }
        const targetSelector = this.getElementSelector(el);
        const label = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").slice(0, 50).trim();
        this.journal.record({
          type: "click",
          timestamp: Date.now(),
          url: window.location.pathname + window.location.search,
          target: targetSelector,
          text: label || void 0
        });
      };
      window.addEventListener("click", handleClick, true);
      this.cleanupFns.push(() => window.removeEventListener("click", handleClick, true));
      const handleInput = (e2) => {
        const el = e2.target;
        if (!el || el.closest("cradle-character") || el.closest("[data-cradle-widget]")) {
          return;
        }
        const isPassword = el.getAttribute("type") === "password";
        const targetSelector = this.getElementSelector(el);
        this.journal.record({
          type: "input",
          timestamp: Date.now(),
          url: window.location.pathname + window.location.search,
          target: targetSelector,
          text: isPassword ? "[masked]" : void 0
        });
      };
      window.addEventListener("change", handleInput, true);
      this.cleanupFns.push(() => window.removeEventListener("change", handleInput, true));
      const handleNav = () => {
        this.journal.record({
          type: "navigation",
          timestamp: Date.now(),
          url: window.location.pathname + window.location.search
        });
      };
      window.addEventListener("popstate", handleNav);
      window.addEventListener("hashchange", handleNav);
      this.cleanupFns.push(() => {
        window.removeEventListener("popstate", handleNav);
        window.removeEventListener("hashchange", handleNav);
      });
      const handleError = (e2) => {
        this.journal.record({
          type: "error",
          timestamp: Date.now(),
          url: window.location.pathname + window.location.search,
          text: (e2.message || "Script error").slice(0, 100)
        });
      };
      window.addEventListener("error", handleError);
      this.cleanupFns.push(() => window.removeEventListener("error", handleError));
    }
    getTimeline() {
      return this.journal.toTimeline();
    }
    getEvents() {
      return this.journal.getEvents();
    }
    destroy() {
      for (const fn of this.cleanupFns) fn();
      this.cleanupFns = [];
      this.journal.clear();
      this.isRunning = false;
    }
    getElementSelector(el) {
      if (el.id) return `#${el.id}`;
      const testId = el.getAttribute("data-testid") || el.getAttribute("data-cy");
      if (testId) return `[data-testid="${testId}"]`;
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      if (role) return `${tag}[role="${role}"]`;
      const name = el.getAttribute("name");
      if (name) return `${tag}[name="${name}"]`;
      const firstClass = Array.from(el.classList).find(
        (c2) => !c2.startsWith("cradle") && !c2.includes(":") && c2.length < 30
      );
      return firstClass ? `${tag}.${firstClass}` : tag;
    }
  };
  var globalTelemetry = new WidgetTelemetry();

  // ../../node_modules/.pnpm/driver.js@1.8.0/node_modules/driver.js/dist/driver.js.mjs
  var e = [`pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`];
  var t = /* @__PURE__ */ new WeakMap();
  function n(n2, i2, a2) {
    r(n2);
    let o2 = (e2) => {
      let t2 = e2.target;
      n2.contains(t2) && ((!a2 || a2(t2)) && (e2.preventDefault(), e2.stopPropagation(), e2.stopImmediatePropagation()), e2.type === `click` && i2?.(e2));
    };
    for (let t2 of e) document.addEventListener(t2, o2, true);
    t.set(n2, o2);
  }
  function r(n2) {
    let r2 = t.get(n2);
    if (r2) {
      for (let t2 of e) document.removeEventListener(t2, r2, true);
      t.delete(n2);
    }
  }
  function i(e2, t2) {
    let n2 = e2.wrapper.getBoundingClientRect();
    return { width: n2.width + t2, height: n2.height + t2, realWidth: n2.width, realHeight: n2.height };
  }
  function a(e2, t2) {
    let { elementDimensions: n2, popoverDimensions: r2, popoverPadding: i2, popoverArrowDimensions: a2 } = t2;
    return e2 === `start` ? Math.max(Math.min(n2.top - i2, window.innerHeight - r2.realHeight - a2.width), a2.width) : e2 === `end` ? Math.max(Math.min(n2.top - r2?.realHeight + n2.height + i2, window.innerHeight - r2?.realHeight - a2.width), a2.width) : e2 === `center` ? Math.max(Math.min(n2.top + n2.height / 2 - r2?.realHeight / 2, window.innerHeight - r2?.realHeight - a2.width), a2.width) : 0;
  }
  function o(e2, t2) {
    let { elementDimensions: n2, popoverDimensions: r2, popoverPadding: i2, popoverArrowDimensions: a2 } = t2;
    return e2 === `start` ? Math.max(Math.min(n2.left - i2, window.innerWidth - r2.realWidth - a2.width), a2.width) : e2 === `end` ? Math.max(Math.min(n2.left - r2?.realWidth + n2.width + i2, window.innerWidth - r2?.realWidth - a2.width), a2.width) : e2 === `center` ? Math.max(Math.min(n2.left + n2.width / 2 - r2?.realWidth / 2, window.innerWidth - r2?.realWidth - a2.width), a2.width) : 0;
  }
  function s(e2, t2, n2) {
    let { align: r2, side: s2 } = n2, c2 = n2.centered ? `over` : s2, l2 = n2.padding, u2 = i(e2, n2.offset), f2 = e2.arrow.getBoundingClientRect(), p2 = t2.getBoundingClientRect(), m2 = p2.top - u2.height, h2 = m2 >= 0, g2 = window.innerHeight - (p2.bottom + u2.height), _2 = g2 >= 0, v2 = p2.left - u2.width, y2 = v2 >= 0, b2 = window.innerWidth - (p2.right + u2.width), x2 = b2 >= 0, S2 = !h2 && !_2 && !y2 && !x2, C2 = c2;
    if (c2 === `top` && h2 ? x2 = y2 = _2 = false : c2 === `bottom` && _2 ? x2 = y2 = h2 = false : c2 === `left` && y2 ? x2 = h2 = _2 = false : c2 === `right` && x2 && (y2 = h2 = _2 = false), c2 === `over`) {
      let t3 = window.innerWidth / 2 - u2.realWidth / 2, n3 = window.innerHeight / 2 - u2.realHeight / 2;
      e2.wrapper.style.left = `${t3}px`, e2.wrapper.style.right = `auto`, e2.wrapper.style.top = `${n3}px`, e2.wrapper.style.bottom = `auto`;
    } else if (S2) {
      let t3 = window.innerWidth / 2 - u2?.realWidth / 2;
      e2.wrapper.style.left = `${t3}px`, e2.wrapper.style.right = `auto`, e2.wrapper.style.bottom = `10px`, e2.wrapper.style.top = `auto`;
    } else if (y2) {
      let t3 = Math.min(v2, window.innerWidth - u2?.realWidth - f2.width), n3 = a(r2, { elementDimensions: p2, popoverDimensions: u2, popoverPadding: l2, popoverArrowDimensions: f2 });
      e2.wrapper.style.left = `${t3}px`, e2.wrapper.style.top = `${n3}px`, e2.wrapper.style.bottom = `auto`, e2.wrapper.style.right = `auto`, C2 = `left`;
    } else if (x2) {
      let t3 = Math.min(b2, window.innerWidth - u2?.realWidth - f2.width), n3 = a(r2, { elementDimensions: p2, popoverDimensions: u2, popoverPadding: l2, popoverArrowDimensions: f2 });
      e2.wrapper.style.right = `${t3}px`, e2.wrapper.style.top = `${n3}px`, e2.wrapper.style.bottom = `auto`, e2.wrapper.style.left = `auto`, C2 = `right`;
    } else if (h2) {
      let t3 = Math.min(m2, window.innerHeight - u2.realHeight - f2.width), n3 = o(r2, { elementDimensions: p2, popoverDimensions: u2, popoverPadding: l2, popoverArrowDimensions: f2 });
      e2.wrapper.style.top = `${t3}px`, e2.wrapper.style.left = `${n3}px`, e2.wrapper.style.bottom = `auto`, e2.wrapper.style.right = `auto`, C2 = `top`;
    } else if (_2) {
      let t3 = Math.min(g2, window.innerHeight - u2?.realHeight - f2.width), n3 = o(r2, { elementDimensions: p2, popoverDimensions: u2, popoverPadding: l2, popoverArrowDimensions: f2 });
      e2.wrapper.style.left = `${n3}px`, e2.wrapper.style.bottom = `${t3}px`, e2.wrapper.style.top = `auto`, e2.wrapper.style.right = `auto`, C2 = `bottom`;
    }
    d(e2, S2 ? `over` : C2, r2, t2), [...e2.wrapper.classList].filter((e3) => e3.startsWith(`driver-popover-side-`) || e3.startsWith(`driver-popover-align-`)).forEach((t3) => e2.wrapper.classList.remove(t3)), e2.wrapper.classList.add(`driver-popover-side-${C2}`), e2.wrapper.classList.add(`driver-popover-align-${r2}`);
  }
  function c(e2, t2, n2, r2, i2, a2 = 10) {
    let o2 = r2 - n2;
    return e2 <= n2 && t2 >= r2 ? i2 === `start` ? 15 + a2 / 2 : i2 === `end` ? o2 - 15 - a2 / 2 : o2 / 2 : (Math.min(Math.max(e2, n2), r2) + Math.min(Math.max(t2, n2), r2)) / 2 - n2;
  }
  function l(e2, t2, n2 = 10) {
    let r2 = t2 - 15 - n2;
    if (r2 < 15) return Math.max(0, (t2 - n2) / 2);
    let i2 = e2 - n2 / 2;
    return Math.min(Math.max(i2, 15), r2);
  }
  function u(e2, t2, n2) {
    return e2 === `left` || e2 === `right` ? t2.bottom > n2.top && t2.top < n2.bottom ? e2 : t2.bottom <= n2.top ? `bottom` : `top` : t2.right > n2.left && t2.left < n2.right ? e2 : t2.right <= n2.left ? `right` : `left`;
  }
  function d(e2, t2, n2, r2) {
    let i2 = e2.arrow;
    if (i2.className = `driver-popover-arrow`, i2.style.top = ``, i2.style.right = ``, i2.style.bottom = ``, i2.style.left = ``, t2 === `over`) {
      i2.classList.add(`driver-popover-arrow-none`);
      return;
    }
    let a2 = r2.getBoundingClientRect(), o2 = e2.wrapper.getBoundingClientRect(), s2 = u(t2, a2, o2);
    i2.classList.add(`driver-popover-arrow-side-${s2}`);
    let d2 = i2.getBoundingClientRect().width || 10;
    if (s2 === `left` || s2 === `right`) {
      let e3 = c(a2.top, a2.bottom, o2.top, o2.bottom, n2, d2);
      i2.style.top = `${l(e3, o2.height, d2)}px`;
    } else {
      let e3 = c(a2.left, a2.right, o2.left, o2.right, n2, d2);
      i2.style.left = `${l(e3, o2.width, d2)}px`;
    }
  }
  function f(e2) {
    return typeof e2 == `function` ? e2() : typeof e2 == `string` ? document.querySelector(e2) : e2;
  }
  function p(e2) {
    let t2 = window.getComputedStyle(e2);
    return [t2.overflow, t2.overflowX, t2.overflowY].some((e3) => e3 === `auto` || e3 === `scroll`);
  }
  function m(e2, t2, n2, r2) {
    return (e2 /= r2 / 2) < 1 ? n2 / 2 * e2 * e2 + t2 : -n2 / 2 * (--e2 * (e2 - 2) - 1) + t2;
  }
  function h(e2) {
    let t2 = `a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])`;
    return e2.flatMap((e3) => {
      let n2 = e3.matches(t2), r2 = Array.from(e3.querySelectorAll(t2));
      return [...n2 ? [e3] : [], ...r2];
    }).filter((e3) => getComputedStyle(e3).pointerEvents !== `none` && y(e3));
  }
  function g(e2, t2) {
    if (!e2 || v(e2)) return;
    let n2 = e2.offsetHeight > window.innerHeight;
    e2.scrollIntoView({ behavior: !t2 || _(e2) ? `auto` : `smooth`, inline: `center`, block: n2 ? `start` : `center` });
  }
  function _(e2) {
    if (!e2 || !e2.parentElement) return;
    let t2 = e2.parentElement;
    return t2.scrollHeight > t2.clientHeight;
  }
  function v(e2) {
    let t2 = e2.getBoundingClientRect();
    return t2.top >= 0 && t2.left >= 0 && t2.bottom <= (window.innerHeight || document.documentElement.clientHeight) && t2.right <= (window.innerWidth || document.documentElement.clientWidth);
  }
  function y(e2) {
    return !!(e2.offsetWidth || e2.offsetHeight || e2.getClientRects().length);
  }
  function b(e2) {
    e2 && (e2.wrapper.style.display = `none`);
  }
  function x(e2, t2) {
    let r2 = C();
    document.body.appendChild(r2.wrapper);
    let { title: i2, description: a2, showButtons: o2, disableButtons: c2, showProgress: l2, nextBtnText: u2, prevBtnText: d2, progressText: f2 } = t2;
    r2.nextButton.innerHTML = u2, r2.previousButton.innerHTML = d2, r2.progress.innerHTML = f2, t2.doneButton && r2.nextButton.classList.add(`driver-popover-done-btn`), i2 ? (r2.title.innerHTML = i2, r2.title.style.display = `block`) : r2.title.style.display = `none`, a2 ? (r2.description.innerHTML = a2, r2.description.style.display = `block`) : r2.description.style.display = `none`;
    let p2 = o2.includes(`next`) || o2.includes(`previous`) || l2;
    r2.closeButton.style.display = o2.includes(`close`) ? `block` : `none`, p2 ? (r2.footer.style.display = `flex`, r2.progress.style.display = l2 ? `block` : `none`, r2.nextButton.style.display = o2.includes(`next`) ? `block` : `none`, r2.previousButton.style.display = o2.includes(`previous`) ? `block` : `none`) : r2.footer.style.display = `none`, c2.includes(`next`) && (r2.nextButton.disabled = true, r2.nextButton.classList.add(`driver-popover-btn-disabled`)), c2.includes(`previous`) && (r2.previousButton.disabled = true, r2.previousButton.classList.add(`driver-popover-btn-disabled`)), c2.includes(`close`) && (r2.closeButton.disabled = true, r2.closeButton.classList.add(`driver-popover-btn-disabled`));
    let m2 = r2.wrapper;
    m2.style.display = `block`, m2.style.left = ``, m2.style.top = ``, m2.style.bottom = ``, m2.style.right = ``, m2.id = `driver-popover-content`, m2.setAttribute(`role`, `dialog`), m2.setAttribute(`aria-labelledby`, `driver-popover-title`), m2.setAttribute(`aria-describedby`, `driver-popover-description`);
    let _2 = r2.arrow;
    _2.className = `driver-popover-arrow`, m2.className = `driver-popover ${t2.popoverClass || ``}`.trim(), n(r2.wrapper, (e3) => {
      let n2 = e3.target;
      if (n2.closest(`.driver-popover-next-btn`)) return t2.onNextClick?.();
      if (n2.closest(`.driver-popover-prev-btn`)) return t2.onPrevClick?.();
      if (n2.closest(`.driver-popover-close-btn`)) return t2.onCloseClick?.();
    }, (e3) => r2.description.contains(e3) || r2.title.contains(e3) ? false : !!e3.closest(`.driver-popover-prev-btn, .driver-popover-next-btn, .driver-popover-close-btn`)), t2.onRender?.(r2), s(r2, e2, t2.position), S(r2, e2, t2.position), g(m2, t2.smoothScroll);
    let v2 = h([m2, e2]);
    return v2.length > 0 && v2[0].focus(), r2;
  }
  function S(e2, t2, n2) {
    e2.wrapper.querySelectorAll(`img`).forEach((r2) => {
      if (r2.complete) return;
      let i2 = () => s(e2, t2, n2);
      r2.addEventListener(`load`, i2, { once: true }), r2.addEventListener(`error`, i2, { once: true });
    });
  }
  function C() {
    let e2 = document.createElement(`div`);
    e2.classList.add(`driver-popover`);
    let t2 = document.createElement(`div`);
    t2.classList.add(`driver-popover-arrow`);
    let n2 = document.createElement(`header`);
    n2.id = `driver-popover-title`, n2.classList.add(`driver-popover-title`), n2.style.display = `none`, n2.innerText = `Popover Title`;
    let r2 = document.createElement(`div`);
    r2.id = `driver-popover-description`, r2.classList.add(`driver-popover-description`), r2.style.display = `none`, r2.innerText = `Popover description is here`;
    let i2 = document.createElement(`button`);
    i2.type = `button`, i2.classList.add(`driver-popover-close-btn`), i2.setAttribute(`aria-label`, `Close`), i2.innerHTML = `&times;`;
    let a2 = document.createElement(`footer`);
    a2.classList.add(`driver-popover-footer`);
    let o2 = document.createElement(`span`);
    o2.classList.add(`driver-popover-progress-text`), o2.innerText = ``;
    let s2 = document.createElement(`span`);
    s2.classList.add(`driver-popover-navigation-btns`);
    let c2 = document.createElement(`button`);
    c2.type = `button`, c2.classList.add(`driver-popover-prev-btn`, `driver-popover-footer-btn`), c2.innerHTML = `Previous`;
    let l2 = document.createElement(`button`);
    return l2.type = `button`, l2.classList.add(`driver-popover-next-btn`, `driver-popover-footer-btn`), l2.innerHTML = `Next`, s2.appendChild(c2), s2.appendChild(l2), a2.appendChild(o2), a2.appendChild(s2), e2.appendChild(i2), e2.appendChild(t2), e2.appendChild(n2), e2.appendChild(r2), e2.appendChild(a2), { wrapper: e2, arrow: t2, title: n2, description: r2, footer: a2, previousButton: c2, nextButton: l2, closeButton: i2, footerButtons: s2, progress: o2 };
  }
  function w(e2) {
    e2 && (r(e2.wrapper), e2.wrapper.parentElement?.removeChild(e2.wrapper));
  }
  function T(e2, t2) {
    let n2 = window.innerWidth, r2 = window.innerHeight, i2 = t2.padding, a2 = t2.radius, o2 = e2.width + i2 * 2, s2 = e2.height + i2 * 2, c2 = Math.min(a2, o2 / 2, s2 / 2), l2 = Math.floor(Math.max(c2, 0)), u2 = e2.x - i2 + l2, d2 = e2.y - i2, f2 = o2 - l2 * 2, p2 = s2 - l2 * 2;
    return `M${n2},0L0,0L0,${r2}L${n2},${r2}L${n2},0Z
    M${u2},${d2} h${f2} a${l2},${l2} 0 0 1 ${l2},${l2} v${p2} a${l2},${l2} 0 0 1 -${l2},${l2} h-${f2} a${l2},${l2} 0 0 1 -${l2},-${l2} v-${p2} a${l2},${l2} 0 0 1 ${l2},-${l2} z`;
  }
  function E(e2, t2, n2, r2, i2) {
    let a2 = e2.getState(`__activeStagePosition`), o2 = a2 || r2.getBoundingClientRect(), s2 = i2.getBoundingClientRect();
    a2 = { x: m(t2, o2.x, s2.x - o2.x, n2), y: m(t2, o2.y, s2.y - o2.y, n2), width: m(t2, o2.width, s2.width - o2.width, n2), height: m(t2, o2.height, s2.height - o2.height, n2) }, A(e2, a2), e2.setState(`__activeStagePosition`, a2);
  }
  function D(e2, t2) {
    if (!t2) return;
    let n2 = t2.getBoundingClientRect(), r2 = { x: n2.x, y: n2.y, width: n2.width, height: n2.height };
    e2.setState(`__activeStagePosition`, r2), A(e2, r2);
  }
  function O(e2) {
    let t2 = e2.getState(`__activeStagePosition`), n2 = e2.getState(`__overlaySvg`);
    if (!t2) return;
    if (!n2) {
      console.warn(`No stage svg found.`);
      return;
    }
    let r2 = window.innerWidth, i2 = window.innerHeight;
    n2.setAttribute(`viewBox`, `0 0 ${r2} ${i2}`);
  }
  function k(e2, t2) {
    let r2 = M(e2, t2);
    document.body.appendChild(r2), n(r2, (t3) => {
      t3.target.tagName === `path` && e2.emit(`overlayClick`);
    }), e2.setState(`__overlaySvg`, r2);
  }
  function A(e2, t2) {
    let n2 = e2.getState(`__overlaySvg`);
    if (!n2) {
      k(e2, t2);
      return;
    }
    let r2 = n2.firstElementChild;
    if (r2?.tagName !== `path`) throw Error(`no path element found in stage svg`);
    r2.setAttribute(`d`, T(t2, j(e2)));
  }
  function j(e2) {
    return { padding: e2.getConfig(`stagePadding`) || 0, radius: e2.getConfig(`stageRadius`) || 0 };
  }
  function M(e2, t2) {
    let n2 = window.innerWidth, r2 = window.innerHeight, i2 = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
    i2.classList.add(`driver-overlay`, `driver-overlay-animated`), i2.setAttribute(`viewBox`, `0 0 ${n2} ${r2}`), i2.setAttribute(`xmlSpace`, `preserve`), i2.setAttribute(`xmlnsXlink`, `http://www.w3.org/1999/xlink`), i2.setAttribute(`version`, `1.1`), i2.setAttribute(`preserveAspectRatio`, `xMinYMin slice`), i2.style.fillRule = `evenodd`, i2.style.clipRule = `evenodd`, i2.style.strokeLinejoin = `round`, i2.style.strokeMiterlimit = `2`, i2.style.zIndex = `10000`, i2.style.position = `fixed`, i2.style.top = `0`, i2.style.left = `0`, i2.style.width = `100%`, i2.style.height = `100%`;
    let a2 = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
    return a2.setAttribute(`d`, T(t2, j(e2))), a2.style.fill = e2.getConfig(`overlayColor`) || `rgb(0,0,0)`, a2.style.opacity = `${e2.getConfig(`overlayOpacity`)}`, a2.style.pointerEvents = `auto`, a2.style.cursor = `auto`, i2.appendChild(a2), i2;
  }
  function N(e2) {
    let t2 = e2.getState(`__overlaySvg`);
    t2 && (r(t2), t2.remove());
  }
  var P = `{{current}} of {{total}}`;
  function F(e2, t2) {
    return !(t2.skipMissingElement ?? e2.getConfig(`skipMissingElement`)) || !t2.element ? false : !f(t2.element);
  }
  function I(e2, t2, n2) {
    let r2 = e2.getConfig(`steps`) || [];
    for (let i2 = t2; i2 >= 0 && i2 < r2.length; i2 += n2) if (!F(e2, r2[i2])) return i2;
  }
  function L(e2, t2) {
    let n2 = e2.getState(`activeIndex`), r2 = n2 !== void 0 && I(e2, n2 + 1, 1) === void 0, i2 = t2?.popover?.onDoneClick || e2.getConfig(`onDoneClick`);
    return r2 && i2 ? i2 : t2?.popover?.onNextClick || e2.getConfig(`onNextClick`);
  }
  function R(e2, t2) {
    return t2?.popover?.onPrevClick || e2.getConfig(`onPrevClick`);
  }
  function z(e2, t2) {
    return t2?.popover?.onCloseClick || e2.getConfig(`onCloseClick`);
  }
  function B(e2, t2, n2) {
    let r2 = e2.getConfig(`steps`) || [], i2 = r2[t2], a2 = i2.popover || {}, o2 = I(e2, t2 + 1, 1) !== void 0, s2 = I(e2, t2 - 1, -1) !== void 0, c2 = a2.doneBtnText || e2.getConfig(`doneBtnText`) || `Done`, l2 = e2.getConfig(`allowClose`), u2 = a2.showProgress === void 0 ? e2.getConfig(`showProgress`) : a2.showProgress, d2 = (a2.progressText || e2.getConfig(`progressText`) || P).replace(`{{current}}`, `${t2 + 1}`).replace(`{{total}}`, `${r2.length}`), f2 = a2.showButtons || e2.getConfig(`showButtons`), p2 = [`next`, `previous`, ...l2 ? [`close`] : []].filter((e3) => !f2?.length || f2.includes(e3)), m2 = a2.onNextClick || e2.getConfig(`onNextClick`), h2 = a2.onPrevClick || e2.getConfig(`onPrevClick`), g2 = a2.onCloseClick || e2.getConfig(`onCloseClick`);
    return { ...i2, popover: { showButtons: p2, nextBtnText: o2 ? void 0 : c2, disableButtons: [...s2 ? [] : [`previous`]], showProgress: u2, onNextClick: m2 || n2.onNextClick, onPrevClick: h2 || n2.onPrevClick, onCloseClick: g2 || n2.onCloseClick, ...a2, progressText: d2 } };
  }
  function V(e2, t2, n2) {
    let r2 = e2.getConfig(`stagePadding`) || 0;
    return { side: n2.popover?.side || `bottom`, align: n2.popover?.align || `start`, offset: r2 + (e2.getConfig(`popoverOffset`) || 0), padding: r2, centered: t2.id === `driver-dummy-element` };
  }
  function H(e2, t2, n2) {
    let r2 = n2.popover || {}, i2 = e2.getState(`activeIndex`), a2 = i2 !== void 0 && I(e2, i2 + 1, 1) === void 0;
    return { title: r2.title, description: r2.description, showButtons: r2.showButtons || e2.getConfig(`showButtons`), disableButtons: r2.disableButtons || e2.getConfig(`disableButtons`) || [], showProgress: r2.showProgress || e2.getConfig(`showProgress`) || false, progressText: r2.progressText ?? (e2.getConfig(`progressText`) || P), nextBtnText: r2.nextBtnText ?? (e2.getConfig(`nextBtnText`) || `Next`), prevBtnText: r2.prevBtnText ?? (e2.getConfig(`prevBtnText`) || `Previous`), doneButton: a2, popoverClass: r2.popoverClass || e2.getConfig(`popoverClass`) || ``, smoothScroll: e2.getConfig(`smoothScroll`), onNextClick: () => {
      let r3 = L(e2, n2);
      return r3 ? r3(t2, n2, e2.getHookOpts()) : e2.emit(`nextClick`);
    }, onPrevClick: () => {
      let r3 = R(e2, n2);
      return r3 ? r3(t2, n2, e2.getHookOpts()) : e2.emit(`prevClick`);
    }, onCloseClick: () => {
      let r3 = z(e2, n2);
      return r3 ? r3(t2, n2, e2.getHookOpts()) : e2.emit(`closeClick`);
    }, onRender: (t3) => {
      e2.setState(`popover`, t3), (r2.onPopoverRender || e2.getConfig(`onPopoverRender`))?.(t3, e2.getHookOpts());
    }, position: V(e2, t2, n2) };
  }
  function U(e2, t2, n2) {
    w(e2.getState(`popover`)), x(t2, H(e2, t2, n2));
  }
  function W(e2, t2, n2) {
    let r2 = e2.getState(`popover`);
    r2 && s(r2, t2, V(e2, t2, n2));
  }
  function G() {
    let e2 = document.getElementById(`driver-dummy-element`);
    if (e2) return e2;
    let t2 = document.createElement(`div`);
    return t2.id = `driver-dummy-element`, t2.style.width = `0`, t2.style.height = `0`, t2.style.pointerEvents = `none`, t2.style.opacity = `0`, t2.style.position = `fixed`, t2.style.top = `50%`, t2.style.left = `50%`, document.body.appendChild(t2), t2;
  }
  function K(e2, t2) {
    let n2 = f(t2.element);
    n2 || (n2 = G()), J(e2, n2, t2);
  }
  function q(e2) {
    let t2 = e2.getState(`__activeElement`), n2 = e2.getState(`__activeStep`);
    t2 && (D(e2, t2), O(e2), W(e2, t2, n2));
  }
  function J(e2, t2, n2) {
    let r2 = e2.getConfig(`duration`) || 400, i2 = Date.now(), a2 = e2.getState(`__activeStep`), o2 = e2.getState(`__activeElement`) || t2, s2 = !o2 || o2 === t2, c2 = t2.id === `driver-dummy-element`, l2 = o2.id === `driver-dummy-element`, u2 = e2.getConfig(`animate`), d2 = n2.onHighlightStarted || e2.getConfig(`onHighlightStarted`), f2 = n2?.onHighlighted || e2.getConfig(`onHighlighted`), m2 = a2?.onDeselected || e2.getConfig(`onDeselected`), h2 = e2.getHookOpts();
    !s2 && m2 && m2(l2 ? void 0 : o2, a2, h2), d2 && d2(c2 ? void 0 : t2, n2, h2);
    let _2 = !s2 && u2, v2 = false;
    b(e2.getState(`popover`)), e2.setState(`previousStep`, a2), e2.setState(`previousElement`, o2), e2.setState(`activeStep`, n2), e2.setState(`activeElement`, t2);
    let y2 = () => {
      if (e2.getState(`__transitionCallback`) !== y2) return;
      let s3 = Date.now() - i2, l3 = r2 - s3 <= r2 / 2;
      n2.popover && l3 && !v2 && _2 && (U(e2, t2, n2), v2 = true), e2.getConfig(`animate`) && s3 < r2 ? E(e2, s3, r2, o2, t2) : (D(e2, t2), f2 && f2(c2 ? void 0 : t2, n2, e2.getHookOpts()), e2.setState(`__transitionCallback`, void 0), e2.setState(`__previousStep`, a2), e2.setState(`__previousElement`, o2), e2.setState(`__activeStep`, n2), e2.setState(`__activeElement`, t2)), window.requestAnimationFrame(y2);
    };
    e2.setState(`__transitionCallback`, y2), window.requestAnimationFrame(y2), g(t2, e2.getConfig(`smoothScroll`)), !_2 && n2.popover && U(e2, t2, n2), document.querySelectorAll(`.driver-active-element-parent`).forEach((e3) => {
      e3.classList.remove(`driver-active-element-parent`, `driver-active-element-parent-no-scroll`);
    }), o2.classList.remove(`driver-active-element`, `driver-no-interaction`), o2.removeAttribute(`aria-haspopup`), o2.removeAttribute(`aria-expanded`), o2.removeAttribute(`aria-controls`), (n2.disableActiveInteraction ?? e2.getConfig(`disableActiveInteraction`)) && t2.classList.add(`driver-no-interaction`);
    let x2 = t2.parentElement;
    x2 && x2 !== document.body && (x2.classList.add(`driver-active-element-parent`), p(x2) && x2.classList.add(`driver-active-element-parent-no-scroll`)), t2.classList.add(`driver-active-element`), t2.setAttribute(`aria-haspopup`, `dialog`), t2.setAttribute(`aria-expanded`, `true`), t2.setAttribute(`aria-controls`, `driver-popover-content`);
  }
  function Y() {
    document.getElementById(`driver-dummy-element`)?.remove(), document.querySelectorAll(`.driver-active-element`).forEach((e2) => {
      let t2 = e2.parentElement;
      t2 && t2 !== document.body && t2.classList.remove(`driver-active-element-parent`, `driver-active-element-parent-no-scroll`), e2.classList.remove(`driver-active-element`, `driver-no-interaction`), e2.removeAttribute(`aria-haspopup`), e2.removeAttribute(`aria-expanded`), e2.removeAttribute(`aria-controls`);
    });
  }
  function X(e2) {
    let t2 = e2.getState(`__resizeTimeout`);
    t2 && window.cancelAnimationFrame(t2), e2.setState(`__resizeTimeout`, window.requestAnimationFrame(() => q(e2)));
  }
  function Z(e2, t2) {
    if (!e2.getState(`isInitialized`) || !(t2.key === `Tab` || t2.keyCode === 9)) return;
    let n2 = e2.getState(`__activeElement`), r2 = e2.getState(`popover`)?.wrapper, i2 = h([...r2 ? [r2] : [], ...n2 ? [n2] : []]), a2 = i2[0], o2 = i2[i2.length - 1];
    t2.preventDefault(), t2.shiftKey ? (i2[i2.indexOf(document.activeElement) - 1] || o2)?.focus() : (i2[i2.indexOf(document.activeElement) + 1] || a2)?.focus();
  }
  function Q(e2, t2) {
    (e2.getConfig(`allowKeyboardControl`) ?? true) && (t2.key === `Escape` ? e2.emit(`escapePress`) : t2.key === `ArrowRight` ? e2.emit(`arrowRightPress`) : t2.key === `ArrowLeft` && e2.emit(`arrowLeftPress`));
  }
  function $(e2, t2) {
    let n2 = e2.getState(`__activeElement`), r2 = t2.target;
    !n2 || !r2 || !n2.contains(r2) || e2.emit(`activeElementClick`);
  }
  function ee(e2) {
    let t2 = (t3) => Q(e2, t3), n2 = (t3) => Z(e2, t3), r2 = () => X(e2), i2 = () => X(e2), a2 = (t3) => $(e2, t3);
    e2.setState(`__events`, { onKeyup: t2, onKeydown: n2, onResize: r2, onScroll: i2, onClick: a2 }), window.addEventListener(`keyup`, t2, false), window.addEventListener(`keydown`, n2, false), window.addEventListener(`resize`, r2), window.addEventListener(`scroll`, i2), document.addEventListener(`click`, a2, false);
  }
  function te(e2) {
    let t2 = e2.getState(`__events`);
    t2 && (window.removeEventListener(`keyup`, t2.onKeyup), window.removeEventListener(`keydown`, t2.onKeydown), window.removeEventListener(`resize`, t2.onResize), window.removeEventListener(`scroll`, t2.onScroll), document.removeEventListener(`click`, t2.onClick, false));
  }
  function ne() {
    let e2 = {};
    function t2(t3 = {}) {
      e2 = { animate: true, duration: 400, allowClose: true, allowScroll: true, overlayClickBehavior: `close`, overlayOpacity: 0.7, smoothScroll: false, disableActiveInteraction: false, advanceOnClick: false, skipMissingElement: false, waitForElement: 0, showProgress: false, stagePadding: 10, stageRadius: 5, popoverOffset: 10, showButtons: [`next`, `previous`, `close`], disableButtons: [], overlayColor: `#000`, ...t3 };
    }
    return t2(), { getConfig: ((t3) => t3 ? e2[t3] : e2), configure: t2 };
  }
  function re() {
    let e2 = {}, t2 = ((t3) => t3 ? e2[t3] : e2), n2 = (t3, n3) => {
      e2[t3] = n3;
    };
    function r2() {
      e2 = {};
    }
    return { getState: t2, setState: n2, resetState: r2 };
  }
  function ie() {
    let e2 = {};
    function t2(t3, n3) {
      e2[t3] = n3;
    }
    function n2(t3) {
      e2[t3]?.();
    }
    function r2() {
      e2 = {};
    }
    return { listen: t2, emit: n2, reset: r2 };
  }
  function ae(e2 = {}) {
    let t2 = ne();
    t2.configure(e2);
    let n2 = re(), r2 = ie(), i2;
    return { getConfig: t2.getConfig, setConfig: t2.configure, getState: n2.getState, setState: n2.setState, resetState: n2.resetState, listen: r2.listen, emit: r2.emit, resetEmitter: r2.reset, getDriver: () => i2, setDriver: (e3) => {
      i2 = e3;
    }, getHookOpts: (e3) => {
      let r3 = e3 || n2.getState();
      return { config: t2.getConfig(), state: r3, driver: i2, index: r3.activeIndex };
    } };
  }
  function oe(e2 = {}) {
    let t2 = ae(e2);
    function n2() {
      t2.getConfig(`allowClose`) && h2();
    }
    function r2() {
      let e3 = t2.getConfig(`overlayClickBehavior`);
      if (t2.getConfig(`allowClose`) && e3 === `close`) {
        h2();
        return;
      }
      if (typeof e3 == `function`) {
        let n3 = t2.getState(`__activeStep`);
        e3(t2.getState(`__activeElement`), n3, t2.getHookOpts());
        return;
      }
      if (e3 === `nextStep`) {
        let e4 = t2.getState(`activeStep`), n3 = t2.getState(`activeElement`), r3 = L(t2, e4);
        if (r3) {
          r3(n3, e4, t2.getHookOpts());
          return;
        }
        i2();
      }
    }
    function i2() {
      let e3 = t2.getState(`activeIndex`), n3 = t2.getConfig(`steps`) || [];
      if (e3 === void 0) return;
      let r3 = e3 + 1;
      n3[r3] ? m2(r3) : h2();
    }
    function a2() {
      let e3 = t2.getState(`activeIndex`), n3 = t2.getConfig(`steps`) || [];
      if (e3 === void 0) return;
      let r3 = e3 - 1;
      n3[r3] ? m2(r3) : h2();
    }
    function o2(e3) {
      (t2.getConfig(`steps`) || [])[e3] ? m2(e3) : h2();
    }
    function s2() {
      if (t2.getState(`__transitionCallback`)) return;
      let e3 = t2.getState(`__activeStep`);
      if (!e3 || !(e3.advanceOnClick ?? t2.getConfig(`advanceOnClick`))) return;
      let n3 = t2.getState(`__activeElement`), r3 = L(t2, e3);
      if (r3) {
        r3(n3, e3, t2.getHookOpts());
        return;
      }
      i2();
    }
    function c2() {
      if (t2.getState(`__transitionCallback`)) return;
      let e3 = t2.getState(`activeIndex`), n3 = t2.getState(`__activeStep`), r3 = t2.getState(`__activeElement`);
      if (e3 === void 0 || n3 === void 0 || !(t2.getConfig(`steps`) || [])[e3 - 1]) return;
      let i3 = R(t2, n3);
      if (i3) return i3(r3, n3, t2.getHookOpts());
      a2();
    }
    function l2() {
      if (t2.getState(`__transitionCallback`)) return;
      let e3 = t2.getState(`activeIndex`), n3 = t2.getState(`__activeStep`), r3 = t2.getState(`__activeElement`);
      if (e3 === void 0 || n3 === void 0) return;
      let a3 = L(t2, n3);
      if (a3) return a3(r3, n3, t2.getHookOpts());
      i2();
    }
    function u2() {
      t2.getState(`isInitialized`) || (t2.setState(`isInitialized`, true), document.body.classList.add(`driver-active`, t2.getConfig(`animate`) ? `driver-fade` : `driver-simple`), t2.getConfig(`allowScroll`) || document.body.classList.add(`driver-no-scroll`), document.body.style.setProperty(`--driver-animation-duration`, `${t2.getConfig(`duration`) || 400}ms`), ee(t2), t2.listen(`overlayClick`, r2), t2.listen(`activeElementClick`, s2), t2.listen(`escapePress`, n2), t2.listen(`closeClick`, n2), t2.listen(`arrowLeftPress`, c2), t2.listen(`arrowRightPress`, l2));
    }
    function d2() {
      let e3 = t2.getState(`__pendingWaitCancel`);
      e3 && (t2.setState(`__pendingWaitCancel`, void 0), e3());
    }
    function p2(e3, n3, r3) {
      let i3 = () => {
        a3.disconnect(), window.clearTimeout(o3), t2.setState(`__pendingWaitCancel`, void 0), r3();
      }, a3 = new MutationObserver(() => {
        f(e3.element) && i3();
      }), o3 = window.setTimeout(i3, n3);
      t2.setState(`__pendingWaitCancel`, () => {
        a3.disconnect(), window.clearTimeout(o3);
      }), a3.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }
    function m2(e3 = 0, n3 = false) {
      d2();
      let r3 = t2.getConfig(`steps`);
      if (!r3) {
        console.error(`No steps to drive through`), h2();
        return;
      }
      if (!r3[e3]) {
        h2();
        return;
      }
      let i3 = r3[e3], a3 = i3.waitForElement ?? t2.getConfig(`waitForElement`) ?? 0;
      if (!n3 && a3 > 0 && i3.element && !f(i3.element)) {
        p2(i3, a3, () => m2(e3, true));
        return;
      }
      if (F(t2, i3)) {
        let n4 = t2.getState(`activeIndex`), i4 = typeof n4 == `number` && e3 < n4 ? -1 : 1;
        r3[e3 + i4] ? m2(e3 + i4) : i4 === 1 && h2();
        return;
      }
      t2.setState(`__activeOnDestroyed`, document.activeElement), t2.setState(`activeIndex`, e3);
      let o3 = r3[e3 + 1];
      K(t2, B(t2, e3, { onNextClick: () => {
        o3 ? m2(e3 + 1) : h2();
      }, onPrevClick: () => {
        m2(e3 - 1);
      }, onCloseClick: () => {
        h2();
      } }));
    }
    function h2(e3 = true) {
      let n3 = t2.getState(`__activeElement`), r3 = t2.getState(`__activeStep`), i3 = t2.getState(`__activeOnDestroyed`), a3 = t2.getConfig(`onDestroyStarted`);
      if (e3 && a3) {
        a3(!n3 || n3?.id === `driver-dummy-element` ? void 0 : n3, r3, t2.getHookOpts());
        return;
      }
      let o3 = r3?.onDeselected || t2.getConfig(`onDeselected`), s3 = t2.getConfig(`onDestroyed`);
      document.body.classList.remove(`driver-active`, `driver-fade`, `driver-simple`, `driver-no-scroll`), document.body.style.removeProperty(`--driver-animation-duration`), d2(), te(t2), w(t2.getState(`popover`)), Y(), N(t2), t2.resetEmitter();
      let c3 = t2.getState();
      if (t2.resetState(), n3 && r3) {
        let e4 = n3.id === `driver-dummy-element`;
        o3 && o3(e4 ? void 0 : n3, r3, t2.getHookOpts(c3)), s3 && s3(e4 ? void 0 : n3, r3, t2.getHookOpts(c3));
      }
      i3 && i3.focus();
    }
    let g2 = { isActive: () => t2.getState(`isInitialized`) || false, refresh: () => X(t2), drive: (e3 = 0) => {
      u2(), m2(e3);
    }, setConfig: t2.setConfig, setSteps: (e3) => {
      d2(), t2.resetState(), t2.setConfig({ ...t2.getConfig(), steps: e3 });
    }, getConfig: t2.getConfig, getState: t2.getState, getActiveIndex: () => t2.getState(`activeIndex`), isFirstStep: () => {
      let e3 = t2.getState(`activeIndex`);
      return e3 !== void 0 && I(t2, e3 - 1, -1) === void 0;
    }, isLastStep: () => {
      let e3 = t2.getState(`activeIndex`);
      return e3 !== void 0 && I(t2, e3 + 1, 1) === void 0;
    }, getActiveStep: () => t2.getState(`activeStep`), getActiveElement: () => t2.getState(`activeElement`), getPreviousElement: () => t2.getState(`previousElement`), getPreviousStep: () => t2.getState(`previousStep`), getNextStep: () => {
      let e3 = t2.getConfig(`steps`) || [], n3 = t2.getState(`activeIndex`);
      if (n3 === void 0) return;
      let r3 = I(t2, n3 + 1, 1);
      return r3 === void 0 ? void 0 : e3[r3];
    }, moveNext: i2, movePrevious: a2, moveTo: o2, hasNextStep: () => {
      let e3 = t2.getState(`activeIndex`);
      return e3 !== void 0 && I(t2, e3 + 1, 1) !== void 0;
    }, hasPreviousStep: () => {
      let e3 = t2.getState(`activeIndex`);
      return e3 !== void 0 && I(t2, e3 - 1, -1) !== void 0;
    }, highlight: (e3) => {
      u2(), K(t2, { ...e3, popover: e3.popover ? { showButtons: [], showProgress: false, progressText: ``, ...e3.popover } : void 0 });
    }, destroy: () => {
      h2(false);
    } };
    return t2.setDriver(g2), g2;
  }

  // src/spotlight.ts
  function resolveElement(selectorOrQuery) {
    if (!selectorOrQuery || typeof document === "undefined") return null;
    try {
      const el = document.querySelector(selectorOrQuery);
      if (el) return el;
    } catch {
    }
    try {
      const byId = document.getElementById(selectorOrQuery.replace(/^#/, ""));
      if (byId) return byId;
      const byTestId = document.querySelector(`[data-testid="${selectorOrQuery}"]`);
      if (byTestId) return byTestId;
    } catch {
    }
    const cleanText = selectorOrQuery.toLowerCase().trim();
    const candidates = Array.from(
      document.querySelectorAll("button, a, input, [role='button'], label, h1, h2, h3, h4")
    );
    for (const cand of candidates) {
      const text = (cand.textContent || cand.getAttribute("aria-label") || cand.getAttribute("placeholder") || "").toLowerCase().trim();
      if (text === cleanText || cleanText.length > 3 && text.includes(cleanText)) {
        return cand;
      }
    }
    try {
      const xpathResult = document.evaluate(
        `.//*[contains(text(), '${selectorOrQuery}')]`,
        document.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      if (xpathResult.singleNodeValue instanceof Element) {
        return xpathResult.singleNodeValue;
      }
    } catch {
    }
    return null;
  }
  function ensureSpotlightStyles() {
    if (typeof document === "undefined" || document.getElementById("cradle-spotlight-styles")) return;
    const style = document.createElement("style");
    style.id = "cradle-spotlight-styles";
    style.textContent = `
		.driver-popover.cradle-driver-theme {
			background: #ffffff;
			color: #0f172a;
			border: 2px solid #0f172a;
			border-radius: 12px;
			box-shadow: 5px 5px 0px 0px #0f172a;
			padding: 16px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			max-width: 320px;
			z-index: 2147483647;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme {
				background: #0f172a;
				color: #f8fafc;
				border: 2px solid #e2e8f0;
				box-shadow: 5px 5px 0px 0px #e2e8f0;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-title {
			font-size: 14px;
			font-weight: 800;
			margin-bottom: 6px;
			letter-spacing: -0.02em;
		}
		.driver-popover.cradle-driver-theme .driver-popover-description {
			font-size: 12px;
			line-height: 1.5;
			color: #475569;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme .driver-popover-description {
				color: #94a3b8;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-footer {
			margin-top: 14px;
			display: flex;
			gap: 8px;
			justify-content: flex-end;
		}
		.driver-popover.cradle-driver-theme button {
			font-size: 11px;
			font-weight: 700;
			padding: 6px 12px;
			border-radius: 6px;
			cursor: pointer;
			transition: all 0.15s;
		}
		.driver-popover.cradle-driver-theme .driver-popover-next-btn {
			background: #0f172a;
			color: #ffffff;
			border: 1.5px solid #0f172a;
		}
		@media (prefers-color-scheme: dark) {
			.driver-popover.cradle-driver-theme .driver-popover-next-btn {
				background: #f8fafc;
				color: #0f172a;
				border: 1.5px solid #f8fafc;
			}
		}
		.driver-popover.cradle-driver-theme .driver-popover-close-btn {
			color: #64748b;
			border: none;
			background: transparent;
		}
	`;
    document.head.appendChild(style);
  }
  var activeDriverInstance = null;
  function startSpotlightGuide(steps, onFinish) {
    if (typeof window === "undefined" || !steps.length) return;
    ensureSpotlightStyles();
    if (activeDriverInstance) {
      activeDriverInstance.destroy();
      activeDriverInstance = null;
    }
    const driveSteps = [];
    for (const s2 of steps) {
      const resolved = resolveElement(s2.element);
      if (resolved) {
        driveSteps.push({
          element: resolved,
          popover: {
            title: s2.title,
            description: s2.description,
            side: s2.side || "bottom",
            align: s2.align || "center",
            popoverClass: "cradle-driver-theme"
          }
        });
      } else {
        console.warn(`[cradle-spotlight] Element not found: "${s2.element}"`);
      }
    }
    if (!driveSteps.length) {
      console.warn("[cradle-spotlight] No valid elements found to spotlight");
      onFinish?.();
      return;
    }
    activeDriverInstance = oe({
      showProgress: driveSteps.length > 1,
      animate: true,
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "cradle-driver-theme",
      onDestroyStarted: () => {
        activeDriverInstance?.destroy();
        activeDriverInstance = null;
        onFinish?.();
      },
      steps: driveSteps
    });
    activeDriverInstance.drive();
  }
  function dismissSpotlight() {
    if (activeDriverInstance) {
      activeDriverInstance.destroy();
      activeDriverInstance = null;
    }
  }

  // src/index.ts
  var STATE_ROWS = {
    idle: 0,
    "running-right": 1,
    "running-left": 2,
    waving: 3,
    jumping: 4,
    failed: 5,
    waiting: 6,
    running: 7,
    review: 8
  };
  var STATE_ORDER = Object.keys(STATE_ROWS);
  var MS_PER_FRAME = 140;
  var MIN_STATE_DURATION_MS = 400;
  var ALPHA_THRESHOLD = 12;
  var INFERRED_API_BASE = typeof document === "undefined" ? null : (() => {
    try {
      const src = document.currentScript?.src;
      return src ? new URL(src).origin : null;
    } catch {
      return null;
    }
  })();
  function detectRowFrameCounts(image, columns, rows) {
    const counts = new Array(rows).fill(columns);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || canvas.width === 0 || canvas.height === 0) return counts;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;
    for (let row = 0; row < rows; row += 1) {
      let lastNonEmptyColumn = -1;
      for (let column = 0; column < columns; column += 1) {
        const x2 = Math.round(column * cellWidth);
        const y2 = Math.round(row * cellHeight);
        const w2 = Math.max(1, Math.round(cellWidth));
        const h2 = Math.max(1, Math.round(cellHeight));
        let hasContent = false;
        try {
          const { data } = ctx.getImageData(x2, y2, w2, h2);
          for (let i2 = 3; i2 < data.length; i2 += 4) {
            if ((data[i2] ?? 0) > ALPHA_THRESHOLD) {
              hasContent = true;
              break;
            }
          }
        } catch {
          hasContent = true;
        }
        if (hasContent) lastNonEmptyColumn = column;
      }
      counts[row] = lastNonEmptyColumn >= 0 ? lastNonEmptyColumn + 1 : columns;
    }
    return counts;
  }
  var HTMLElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
  };
  var CradleCharacter = class extends HTMLElementBase {
    shadow = this.attachShadow({ mode: "open" });
    petAnimations = [];
    atlas = null;
    rowFrameCounts = [];
    open = false;
    apiBase = "";
    siteId = "";
    visitorId = "";
    placement = "floating";
    theme = "neobrutalist";
    pageContext = {};
    dragStart = null;
    dragged = false;
    ignoreNextClick = false;
    stateTimer = null;
    cycleTimer = null;
    cycling = false;
    autoCycle = true;
    explicitState = false;
    cycleStep = 0;
    currentState = "idle";
    localMessages = [];
    isBusy = false;
    characterName = "Assistant";
    isLoaded = false;
    static get observedAttributes() {
      return ["sprite-url", "preview-url", "theme"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if ((name === "sprite-url" || name === "preview-url") && newValue) {
        void this.setSpriteUrl(newValue);
      } else if (name === "theme" && newValue) {
        this.theme = newValue;
        const shell = this.shadow?.querySelector(".shell");
        if (shell) shell.dataset.theme = newValue;
      }
    }
    async setSpriteUrl(url) {
      if (!url) return;
      await this.configureAtlas({
        url,
        columns: 8,
        rows: 9,
        stateRows: STATE_ROWS
      });
      this.startCycle();
    }
    connectedCallback() {
      this.siteId = this.getAttribute("site-id") ?? this.getAttribute("installation-id") ?? "";
      this.apiBase = this.getAttribute("api-base") ?? INFERRED_API_BASE ?? "";
      this.autoCycle = !this.hasAttribute("no-cycle");
      this.placement = this.getAttribute("placement") ?? "floating";
      this.theme = this.getAttribute("theme") ?? "neobrutalist";
      if (!this.siteId || !this.apiBase) {
        throw new Error(
          "CradleCharacter requires a site-id attribute, and an api-base attribute unless the widget was loaded via a <script src> tag."
        );
      }
      this.visitorId = this.getOrCreateVisitorId();
      this.loadStoredMessages();
      globalTelemetry.init();
      this.render();
      this.setupChatListeners();
      void this.loadManifest();
    }
    disconnectedCallback() {
      this.petAnimations.forEach((animation) => animation.cancel());
      this.petAnimations = [];
      this.stopCycle();
      globalTelemetry.destroy();
      dismissSpotlight();
    }
    getOrCreateVisitorId() {
      try {
        const existing = localStorage.getItem("cradle_visitor_id");
        if (existing) return existing;
        const id = crypto.randomUUID();
        localStorage.setItem("cradle_visitor_id", id);
        return id;
      } catch {
        return crypto.randomUUID();
      }
    }
    loadStoredMessages() {
      try {
        const stored = localStorage.getItem(`cradle_chat_${this.siteId}`);
        if (stored) {
          this.localMessages = JSON.parse(stored);
        }
      } catch {
        this.localMessages = [];
      }
    }
    saveStoredMessages() {
      try {
        localStorage.setItem(`cradle_chat_${this.siteId}`, JSON.stringify(this.localMessages));
      } catch {
      }
    }
    /** Opens the character and emits an activation event for the host experience. */
    openPanel() {
      if (!this.isLoaded) return;
      this.open = true;
      const panel = this.shadow.querySelector(".panel");
      const trigger = this.shadow.querySelector(".trigger");
      if (panel) panel.hidden = false;
      trigger?.setAttribute("aria-expanded", "true");
      this.explicitState = true;
      this.setVisualState("waving");
      this.emit("cradle:open", this.eventContext());
      if (this.stateTimer) clearTimeout(this.stateTimer);
      this.stateTimer = setTimeout(() => {
        if (this.open && this.currentState === "waving") {
          this.releaseToCycle();
        }
      }, 2500);
    }
    /** Closes the character without discarding the host-owned visitor context. */
    closePanel() {
      this.open = false;
      if (this.stateTimer) clearTimeout(this.stateTimer);
      const panel = this.shadow.querySelector(".panel");
      const trigger = this.shadow.querySelector(".trigger");
      if (panel) panel.hidden = true;
      trigger?.setAttribute("aria-expanded", "false");
      this.releaseToCycle();
      this.emit("cradle:close", this.eventContext());
    }
    togglePanel() {
      if (this.open) this.closePanel();
      else this.openPanel();
    }
    /** Emits an intent for the host site to handle in its own interface or runtime. */
    trigger(action) {
      const normalized = typeof action === "string" ? { type: "action", value: action } : action;
      this.explicitState = true;
      this.setVisualState("review");
      this.emit("cradle:action", { ...this.eventContext(), action: normalized });
      if (this.stateTimer) clearTimeout(this.stateTimer);
      this.stateTimer = setTimeout(() => {
        if (this.currentState === "review") {
          this.setVisualState("running");
        }
      }, 1e3);
    }
    /** Finishes an ongoing action with a celebration jump or error fallback. */
    resolveAction(success = true) {
      this.explicitState = true;
      this.setVisualState(success ? "jumping" : "failed");
      if (this.stateTimer) clearTimeout(this.stateTimer);
      this.stateTimer = setTimeout(() => {
        this.releaseToCycle();
      }, 2200);
    }
    releaseToCycle() {
      this.explicitState = false;
      this.setVisualState("idle");
      this.scheduleNextCycleFrame();
    }
    startCycle() {
      if (this.cycling || !this.autoCycle) return;
      this.cycling = true;
      this.scheduleNextCycleFrame();
    }
    stopCycle() {
      this.cycling = false;
      if (this.cycleTimer) clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
    scheduleNextCycleFrame() {
      if (this.cycleTimer) clearTimeout(this.cycleTimer);
      if (!this.cycling || this.explicitState || !this.atlas) return;
      const ambientSequence = ["idle", "waving", "idle", "jumping", "idle", "running-right", "idle", "running-left", "idle"];
      const state = ambientSequence[this.cycleStep % ambientSequence.length] ?? "idle";
      this.cycleStep += 1;
      const durationMs = this.setVisualState(state);
      const pauseMs = state === "idle" ? 3500 : Math.max(durationMs, 2e3);
      this.cycleTimer = setTimeout(() => this.scheduleNextCycleFrame(), pauseMs);
    }
    setVisualState(state) {
      this.currentState = state;
      const atlas = this.atlas;
      if (!atlas) return MIN_STATE_DURATION_MS;
      const stateRowMap = atlas.stateRows ?? STATE_ROWS;
      const row = stateRowMap[state] ?? STATE_ROWS[state] ?? 0;
      const duration = this.animateCompanions(atlas, row);
      this.emit("cradle:state", { ...this.eventContext(), state });
      return duration;
    }
    setContext(context) {
      this.pageContext = { ...this.pageContext, ...context };
      this.emit("cradle:context", this.eventContext());
    }
    render() {
      const accentColor = this.getAttribute("accent-color") || this.getAttribute("primary-color");
      const bgColor = this.getAttribute("bg-color");
      const textColor = this.getAttribute("text-color");
      const customVars = [
        accentColor ? `--cradle-accent:${accentColor};` : "",
        bgColor ? `--cradle-bg:${bgColor};` : "",
        textColor ? `--cradle-text:${textColor};` : ""
      ].join("");
      this.shadow.innerHTML = [
        "<style>",
        `:host{all:initial;position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;pointer-events:none;color:var(--cradle-text,#09090b);font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.4;${customVars}}`,
        ".shell{position:fixed;right:22px;bottom:22px;z-index:2147483647;pointer-events:auto;opacity:0.2;transition:opacity 0.3s ease}",
        ".shell.is-ready{opacity:1}",
        '.shell[data-placement="inline"]{position:relative;right:auto;bottom:auto;width:100%;max-width:380px}',
        ".panel{position:absolute;bottom:100%;right:0;margin-bottom:12px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:visible;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-end;gap:10px;background:transparent;box-shadow:none;border:0;padding:0}",
        ".panel[hidden]{display:none}",
        ".panel ::slotted(*){align-self:stretch;width:100%;box-sizing:border-box}",
        /* Floating Unbound Chat Surface */
        ".built-in-chat{width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;background:transparent;overflow:visible}",
        /* Messages Stream */
        ".chat-messages{display:flex;flex-direction:column;gap:10px;padding:8px 4px;max-height:calc(100vh - 160px);min-height:40px;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}",
        ".chat-messages::-webkit-scrollbar{display:none}",
        ".msg{max-width:85%;padding:10px 14px;font-size:0.86rem;line-height:1.45;word-break:break-word;white-space:pre-wrap;box-sizing:border-box}",
        /* User Message Bubble */
        ".msg.user-msg{align-self:flex-end;background:var(--cradle-accent,#09090b);color:#ffffff}",
        '.shell[data-theme="neobrutalist"] .msg.user-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 4px 18px}',
        '.shell[data-theme="modern"] .msg.user-msg,.shell[data-theme="glass"] .msg.user-msg{border-radius:20px 20px 4px 20px;box-shadow:0 8px 24px rgba(0,0,0,0.1)}',
        '.shell[data-theme="cyberpunk"] .msg.user-msg{background:#a855f7;color:#0f172a;border:2px solid #06b6d4;box-shadow:0 0 12px rgba(6,182,212,0.5);border-radius:16px 16px 2px 16px;font-weight:700}',
        '.shell[data-theme="terminal"] .msg.user-msg{background:#15803d;color:#ffffff;border:1px solid #22c55e;font-family:monospace;border-radius:4px}',
        '.shell[data-theme="minimal"] .msg.user-msg{border-radius:16px 16px 2px 16px;border:1px solid #09090b}',
        '.shell[data-theme="synthwave"] .msg.user-msg{background:#ec4899;color:#ffffff;border:2px solid #fde047;box-shadow:0 0 14px rgba(236,72,153,0.6);border-radius:16px 16px 2px 16px;font-weight:700}',
        '.shell[data-theme="paper"] .msg.user-msg{background:#2c2825;color:#fdfbf7;border:1px solid #736b63;border-radius:14px 14px 2px 14px;font-family:Georgia,serif}',
        /* Assistant Message Bubble */
        ".msg.assistant-msg{align-self:flex-start;background:var(--cradle-bg,#ffffff);color:var(--cradle-text,#09090b)}",
        '.shell[data-theme="neobrutalist"] .msg.assistant-msg{border:2px solid #09090b;box-shadow:3px 3px 0px #09090b;border-radius:18px 18px 18px 4px}',
        '.shell[data-theme="modern"] .msg.assistant-msg,.shell[data-theme="glass"] .msg.assistant-msg{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.6);box-shadow:0 8px 24px rgba(0,0,0,0.08);border-radius:20px 20px 20px 4px}',
        '.shell[data-theme="cyberpunk"] .msg.assistant-msg{background:#0f172a;color:#38bdf8;border:2px solid #a855f7;box-shadow:0 0 14px rgba(168,85,247,0.5);border-radius:16px 16px 16px 2px;font-weight:600}',
        '.shell[data-theme="terminal"] .msg.assistant-msg{background:#09090b;color:#22c55e;border:1px solid #22c55e;font-family:monospace;border-radius:4px;box-shadow:0 0 10px rgba(34,197,94,0.2)}',
        '.shell[data-theme="minimal"] .msg.assistant-msg{border-radius:16px 16px 16px 2px;border:1px solid #e4e4e7;background:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.04)}',
        '.shell[data-theme="synthwave"] .msg.assistant-msg{background:#1e1b4b;color:#fde047;border:2px solid #ec4899;box-shadow:0 0 16px rgba(236,72,153,0.5);border-radius:16px 16px 16px 2px}',
        '.shell[data-theme="paper"] .msg.assistant-msg{background:#fdfbf7;color:#2c2825;border:1px solid #d6cebf;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-radius:14px 14px 14px 2px;font-family:Georgia,serif}',
        /* Floating Input Pill Bar */
        ".chat-form{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 6px 6px 16px;background:var(--cradle-bg,#ffffff);border-radius:9999px;transition:all 0.15s ease}",
        '.shell[data-theme="neobrutalist"] .chat-form{border:2.5px solid #09090b;box-shadow:3.5px 3.5px 0px #09090b}',
        '.shell[data-theme="modern"] .chat-form,.shell[data-theme="glass"] .chat-form{background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.7);box-shadow:0 10px 28px rgba(0,0,0,0.1)}',
        '.shell[data-theme="cyberpunk"] .chat-form{background:#0f172a;border:2px solid #a855f7;box-shadow:0 0 16px rgba(168,85,247,0.6);border-radius:16px}',
        '.shell[data-theme="terminal"] .chat-form{background:#09090b;border:1.5px solid #22c55e;box-shadow:0 0 12px rgba(34,197,94,0.3);border-radius:4px;font-family:monospace}',
        '.shell[data-theme="minimal"] .chat-form{border:1px solid #e4e4e7;box-shadow:0 2px 10px rgba(0,0,0,0.05)}',
        '.shell[data-theme="synthwave"] .chat-form{background:#1e1b4b;border:2px solid #fde047;box-shadow:0 0 18px rgba(253,224,71,0.4);border-radius:16px}',
        '.shell[data-theme="paper"] .chat-form{background:#fdfbf7;border:1px solid #d6cebf;box-shadow:0 2px 10px rgba(0,0,0,0.05);border-radius:12px;font-family:Georgia,serif}',
        ".chat-input{flex:1;border:0;outline:none;background:transparent;font-size:0.86rem;color:var(--cradle-text,#09090b);padding:4px 0}",
        '.shell[data-theme="cyberpunk"] .chat-input{color:#38bdf8}',
        '.shell[data-theme="cyberpunk"] .chat-input::placeholder{color:rgba(56,189,248,0.5)}',
        '.shell[data-theme="terminal"] .chat-input{color:#22c55e;font-family:monospace}',
        '.shell[data-theme="terminal"] .chat-input::placeholder{color:rgba(34,197,94,0.5)}',
        '.shell[data-theme="synthwave"] .chat-input{color:#fde047}',
        '.shell[data-theme="synthwave"] .chat-input::placeholder{color:rgba(253,224,71,0.5)}',
        '.shell[data-theme="paper"] .chat-input{color:#2c2825;font-family:Georgia,serif}',
        '.shell[data-theme="paper"] .chat-input::placeholder{color:rgba(44,40,37,0.5)}',
        ".chat-input::placeholder{color:rgba(9,9,11,0.4)}",
        ".send-btn{display:flex;align-items:center;justify-content:center;padding:6px 14px;border:0;background:transparent;color:var(--cradle-accent,#09090b);font-weight:800;font-size:0.84rem;cursor:pointer;transition:transform 0.1s, opacity 0.15s}",
        '.shell[data-theme="neobrutalist"] .send-btn{background:#09090b;color:#ffffff;border-radius:9999px;padding:6px 16px;font-size:0.78rem}',
        '.shell[data-theme="cyberpunk"] .send-btn{background:#a855f7;color:#0f172a;border-radius:10px;padding:6px 14px;font-weight:900}',
        '.shell[data-theme="terminal"] .send-btn{background:#22c55e;color:#09090b;font-family:monospace;border-radius:2px;padding:4px 10px;font-weight:800}',
        '.shell[data-theme="synthwave"] .send-btn{background:#ec4899;color:#ffffff;border-radius:10px;padding:6px 14px;font-weight:900}',
        '.shell[data-theme="paper"] .send-btn{background:#2c2825;color:#fdfbf7;border-radius:8px;padding:6px 12px;font-family:Georgia,serif;font-weight:700}',
        ".send-btn:active{transform:scale(0.94)}",
        ".send-btn:disabled{opacity:0.3;cursor:not-allowed}",
        /* Trigger Companion */
        ".trigger{display:grid;width:94px;height:102px;place-items:center;border:0;background:transparent;box-shadow:none;cursor:grab;touch-action:none;margin-left:auto}",
        ".trigger:active{cursor:grabbing}",
        ".trigger:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}",
        ".trigger .companion{width:88px;height:96px;background-repeat:no-repeat;background-size:800% 900%}",
        "@media (prefers-reduced-motion:reduce){.companion{animation:none!important}}",
        "</style>",
        `<div class="shell" data-theme="${this.theme}"><section class="panel" hidden aria-label="Website character"><slot><div class="built-in-chat"><div class="chat-messages" tabindex="0"><div class="msg assistant-msg greeting-msg"><p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything.</p></div></div><form class="chat-form"><input type="text" class="chat-input" placeholder="Ask something..." aria-label="Ask a question" /><button type="submit" class="send-btn" aria-label="Send message">Send</button></form></div></slot></section><button class="trigger" type="button" aria-label="Open website character" aria-expanded="false"><span class="companion" aria-hidden="true"></span></button></div>`
      ].join("");
      const trigger = this.shadow.querySelector(".trigger");
      trigger.addEventListener("click", (event) => {
        if (this.ignoreNextClick) {
          event.preventDefault();
          this.ignoreNextClick = false;
          return;
        }
        this.togglePanel();
      });
      trigger.addEventListener("pointerdown", (event) => this.startDrag(event));
      trigger.addEventListener("pointermove", (event) => this.moveDrag(event));
      trigger.addEventListener("pointerup", (event) => this.endDrag(event));
      trigger.addEventListener("pointercancel", () => {
        this.dragStart = null;
        this.dragged = false;
      });
      this.renderStoredMessages();
    }
    setupChatListeners() {
      const form = this.shadow.querySelector(".chat-form");
      if (form) {
        const input = form.querySelector(".chat-input");
        if (input) {
          input.addEventListener("input", () => {
            if (!this.isBusy && input.value.trim() && this.currentState === "idle") {
              this.setVisualState("waiting");
            } else if (!this.isBusy && !input.value.trim() && this.currentState === "waiting") {
              this.setVisualState("idle");
            }
          });
        }
        form.addEventListener("submit", (e2) => {
          e2.preventDefault();
          if (!input) return;
          const text = input.value.trim();
          if (!text || this.isBusy) return;
          input.value = "";
          void this.sendChatMessage(text);
        });
      }
    }
    renderStoredMessages() {
      const msgContainer = this.shadow.querySelector(".chat-messages");
      if (!msgContainer) return;
      if (this.localMessages.length === 0) {
        msgContainer.innerHTML = [
          '<div class="msg assistant-msg greeting-msg">',
          '<p class="greeting" style="margin:0">Hi there! \u{1F44B} Ask me anything.</p>',
          "</div>"
        ].join("");
        return;
      }
      msgContainer.innerHTML = "";
      for (const m2 of this.localMessages) {
        const bubble = document.createElement("div");
        bubble.className = `msg ${m2.role === "user" ? "user-msg" : "assistant-msg"}`;
        bubble.textContent = m2.content;
        msgContainer.appendChild(bubble);
      }
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    async fetchInitialGreeting(baseUrl) {
      console.log(`[CradleWidget] Fetching initial greeting from ${baseUrl}/api/chat/init`);
      try {
        const res = await fetch(`${baseUrl}/api/chat/init`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cradle-installation-id": this.siteId,
            "x-cradle-visitor-id": this.visitorId
          },
          body: JSON.stringify({ installationId: this.siteId, visitorId: this.visitorId })
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[CradleWidget] Initial greeting response:`, data);
          if (data.greeting) {
            const greetingEl = this.shadow.querySelector(".greeting");
            if (greetingEl) greetingEl.textContent = data.greeting;
          }
        } else {
          console.warn(`[CradleWidget] Initial greeting fetch failed status: ${res.status}`);
        }
      } catch (err) {
        console.warn(`[CradleWidget] Initial greeting fetch error:`, err);
      }
    }
    async sendChatMessage(text) {
      console.log(`[CradleWidget] Sending chat message: "${text}"`);
      this.isBusy = true;
      const sendBtn = this.shadow.querySelector(".send-btn");
      if (sendBtn) sendBtn.disabled = true;
      const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
      this.localMessages.push(userMsg);
      this.renderStoredMessages();
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg = { id: assistantMsgId, role: "assistant", content: "\u2026" };
      this.localMessages.push(assistantMsg);
      this.renderStoredMessages();
      this.explicitState = true;
      this.setVisualState("review");
      try {
        const baseUrl = (this.apiBase || "").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cradle-installation-id": this.siteId,
            "x-cradle-visitor-id": this.visitorId
          },
          body: JSON.stringify({
            messages: this.localMessages.slice(0, -1).map((m2) => ({
              id: m2.id,
              role: m2.role,
              content: m2.content,
              parts: [{ type: "text", text: m2.content }]
            })),
            installationId: this.siteId,
            visitorId: this.visitorId,
            clientContext: {
              telemetry: globalTelemetry.getTimeline(),
              currentUrl: typeof window !== "undefined" ? window.location.href : void 0
            }
          })
        });
        if (!res.ok) {
          let errText = `Chat request failed with status ${res.status}`;
          try {
            const json = await res.json();
            if (json.message || json.error) errText = json.message || json.error;
          } catch {
          }
          console.error(`[CradleWidget] HTTP ${res.status} error:`, errText);
          throw new Error(errText);
        }
        if (!res.body) throw new Error("No response body received.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let streamedRaw = "";
        const handleSsePayload = (payload) => {
          if (!payload || payload === "[DONE]") return;
          try {
            const event = JSON.parse(payload);
            if (event.type === "text-delta" && typeof event.delta === "string") {
              streamedRaw += event.delta;
            } else if (event.type === "data-emote") {
              const emote = event.data?.emote;
              if (emote && STATE_ORDER.includes(emote)) {
                console.log(`[CradleWidget] data-emote received: "${emote}"`);
                this.explicitState = true;
                this.setVisualState(emote);
              }
            } else if (event.type === "tool-call" || event.toolName === "widget_guide" || event.type === "data-guide") {
              const guideData = event.args || event.data;
              if (guideData?.steps && Array.isArray(guideData.steps)) {
                console.log("[CradleWidget] Executing Driver.js spotlight guide:", guideData.steps);
                startSpotlightGuide(guideData.steps);
              }
            }
          } catch {
            streamedRaw += payload;
          }
        };
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk.includes("data:")) {
            sseBuffer += chunk;
            const lines = sseBuffer.split("\n");
            sseBuffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data:")) {
                handleSsePayload(trimmed.slice(5).trim());
              }
            }
          } else {
            streamedRaw += chunk;
          }
          const emoteMatch = chunk.match(/\[cradle:emote:([a-z-]+)\]/i);
          if (emoteMatch?.[1] && STATE_ORDER.includes(emoteMatch[1])) {
            const emote = emoteMatch[1];
            console.log(`[CradleWidget] setEmote triggered from stream: "${emote}"`);
            this.explicitState = true;
            this.setVisualState(emote);
          }
          const cleanedText = streamedRaw.replace(/\[cradle:emote:[a-z-]+\]/gi, "");
          const target = this.localMessages.find((m2) => m2.id === assistantMsgId);
          if (target) {
            target.content = cleanedText || "\u2026";
            this.renderStoredMessages();
          }
        }
        if (sseBuffer.trim().startsWith("data:")) {
          handleSsePayload(sseBuffer.trim().slice(5).trim());
        }
        const finalCleanText = streamedRaw.replace(/\[cradle:emote:[a-z-]+\]/gi, "");
        console.log(`[CradleWidget] Stream finished cleanly. Total length: ${finalCleanText.length} chars`);
        this.saveStoredMessages();
        this.resolveAction(true);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.";
        console.error(`[CradleWidget] sendChatMessage caught error:`, errMsg);
        const target = this.localMessages.find((m2) => m2.id === assistantMsgId);
        if (target) {
          target.content = errMsg;
          this.renderStoredMessages();
        }
        this.resolveAction(false);
      } finally {
        this.isBusy = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    }
    async loadManifest() {
      try {
        const baseUrl = (this.apiBase || "").replace(/\/$/, "");
        const response = await fetch(baseUrl + "/api/installations/" + this.siteId);
        if (!response.ok) throw new Error("The character manifest could not be loaded.");
        const manifest = await response.json();
        const shell = this.shadow.querySelector(".shell");
        const greeting = this.shadow.querySelector(".greeting");
        shell.dataset.placement = this.placement;
        this.characterName = manifest.character.displayName || "Assistant";
        const resolvedTheme = this.getAttribute("theme") || manifest.character.theme || "neobrutalist";
        this.theme = resolvedTheme;
        shell.dataset.theme = resolvedTheme;
        if (greeting && manifest.character.greeting) {
          greeting.textContent = manifest.character.greeting;
        }
        if (this.localMessages.length === 0) {
          void this.fetchInitialGreeting(baseUrl);
        }
        const overrideUrl = this.getAttribute("sprite-url") || this.getAttribute("preview-url");
        if (overrideUrl) {
          await this.setSpriteUrl(overrideUrl);
        } else if (manifest.assets?.atlas) {
          await this.configureAtlas(manifest.assets.atlas);
          this.startCycle();
        } else {
          this.isLoaded = true;
          shell.classList.add("is-ready");
          this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
          return;
        }
        this.isLoaded = true;
        shell.classList.add("is-ready");
        this.emit("cradle:ready", { ...this.eventContext(), character: manifest.character });
      } catch (error) {
        this.setVisualState("failed");
        this.emit("cradle:error", { ...this.eventContext(), error: error instanceof Error ? error.message : "Manifest loading failed" });
      }
    }
    async configureAtlas(atlas) {
      const baseUrl = (this.apiBase || "").replace(/\/$/, "");
      const url = atlas.url.startsWith("http://") || atlas.url.startsWith("https://") ? atlas.url : baseUrl + atlas.url;
      this.atlas = { ...atlas, url };
      let imageUrl = url;
      let blobForDetection = null;
      try {
        const res = await fetch(url, { referrerPolicy: "no-referrer" });
        if (res.ok) {
          const blob = await res.blob();
          blobForDetection = blob;
          imageUrl = URL.createObjectURL(blob);
        }
      } catch {
      }
      this.shadow.querySelectorAll(".companion").forEach((companion) => {
        companion.style.backgroundImage = 'url("' + imageUrl + '")';
        companion.style.backgroundSize = (this.atlas?.columns ?? 8) * 100 + "% " + (this.atlas?.rows ?? 9) * 100 + "%";
      });
      this.rowFrameCounts = await this.detectFrameCounts(imageUrl, blobForDetection, atlas.columns, atlas.rows);
    }
    async detectFrameCounts(imageUrl, blob, columns, rows) {
      try {
        const image = new Image();
        if (!blob) image.crossOrigin = "anonymous";
        const decoded = await new Promise((resolve, reject) => {
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Spritesheet failed to decode."));
          image.src = imageUrl;
        });
        return detectRowFrameCounts(decoded, columns, rows);
      } catch {
        return new Array(rows).fill(columns);
      }
    }
    animateCompanions(atlas, row) {
      const yPosition = row / Math.max(atlas.rows - 1, 1) * 100;
      const detected = this.rowFrameCounts[row];
      const numFrames = Math.max(detected ?? atlas.columns, 1);
      const colDenom = Math.max(atlas.columns - 1, 1);
      const endXPosition = numFrames / colDenom * 100;
      const durationMs = Math.max(numFrames * MS_PER_FRAME, MIN_STATE_DURATION_MS);
      this.petAnimations.forEach((animation) => animation.cancel());
      this.petAnimations = [];
      this.shadow.querySelectorAll(".companion").forEach((companion) => {
        companion.style.backgroundPosition = "0% " + yPosition + "%";
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        this.petAnimations.push(companion.animate(
          [{ backgroundPosition: "0% " + yPosition + "%" }, { backgroundPosition: endXPosition + "% " + yPosition + "%" }],
          { duration: durationMs, iterations: Infinity, easing: "steps(" + numFrames + ", end)" }
        ));
      });
      return durationMs;
    }
    startDrag(event) {
      if (event.button !== 0 || this.placement === "inline") return;
      const shell = this.shadow.querySelector(".shell");
      const bounds = shell.getBoundingClientRect();
      this.dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top };
      this.dragged = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    moveDrag(event) {
      if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
      const deltaX = event.clientX - this.dragStart.x;
      const deltaY = event.clientY - this.dragStart.y;
      if (!this.dragged && Math.hypot(deltaX, deltaY) < 6) return;
      this.dragged = true;
      event.preventDefault();
      const shell = this.shadow.querySelector(".shell");
      const left = Math.min(Math.max(0, this.dragStart.left + deltaX), window.innerWidth - shell.offsetWidth);
      const top = Math.min(Math.max(0, this.dragStart.top + deltaY), window.innerHeight - shell.offsetHeight);
      shell.style.left = left + "px";
      shell.style.top = top + "px";
      shell.style.right = "auto";
      shell.style.bottom = "auto";
    }
    endDrag(event) {
      if (!this.dragStart || event.pointerId !== this.dragStart.pointerId) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (this.dragged) {
        this.ignoreNextClick = true;
      }
      this.dragStart = null;
      this.dragged = false;
    }
    eventContext() {
      return {
        siteId: this.siteId,
        visitorId: this.visitorId,
        state: this.currentState,
        open: this.open,
        context: { ...this.pageContext }
      };
    }
    emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
  };
  if (typeof customElements !== "undefined" && !customElements.get("cradle-character")) {
    customElements.define("cradle-character", CradleCharacter);
  }
  function getCharacter(siteId) {
    if (typeof document === "undefined") return null;
    if (siteId) {
      const selector = 'cradle-character[site-id="' + CSS.escape(siteId) + '"]';
      return document.querySelector(selector);
    }
    return document.querySelector("cradle-character");
  }
  var Cradle;
  if (typeof window !== "undefined" && typeof customElements !== "undefined") {
    const script = document.currentScript;
    const siteId = script?.dataset.siteId;
    if (siteId && !document.querySelector("cradle-character")) {
      const mount = () => {
        if (document.querySelector("cradle-character")) return;
        const element = document.createElement("cradle-character");
        element.setAttribute("site-id", siteId);
        if (script?.dataset.placement) element.setAttribute("placement", script.dataset.placement);
        if (script?.dataset.theme) element.setAttribute("theme", script.dataset.theme);
        document.body.appendChild(element);
      };
      if (document.body) mount();
      else document.addEventListener("DOMContentLoaded", mount, { once: true });
    }
    Cradle = window.Cradle = {
      open: (siteId2) => getCharacter(siteId2)?.openPanel(),
      close: (siteId2) => getCharacter(siteId2)?.closePanel(),
      toggle: (siteId2) => getCharacter(siteId2)?.togglePanel(),
      trigger: (action, siteId2) => getCharacter(siteId2)?.trigger(action),
      resolveAction: (success, siteId2) => getCharacter(siteId2)?.resolveAction(success),
      setState: (state, siteId2) => getCharacter(siteId2)?.setVisualState(state),
      setContext: (context, siteId2) => getCharacter(siteId2)?.setContext(context),
      setSprite: (url, siteId2) => getCharacter(siteId2)?.setSpriteUrl(url)
    };
  }
})();
