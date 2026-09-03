"use strict";
(() => {
  // ../../node_modules/.pnpm/posthog-js@1.425.1_@types+react@19.2.2_react@19.2.0/node_modules/posthog-js/dist/module.js
  var t = "undefined" != typeof window ? window : void 0;
  var i = "undefined" != typeof globalThis ? globalThis : t;
  var e = null == i ? void 0 : i.navigator;
  var r = null == i ? void 0 : i.document;
  var s = null == i ? void 0 : i.location;
  var n = null == i ? void 0 : i.fetch;
  var o = null != i && i.XMLHttpRequest && "withCredentials" in new i.XMLHttpRequest() ? i.XMLHttpRequest : void 0;
  var a = null == i ? void 0 : i.AbortController;
  var l = null == i ? void 0 : i.CompressionStream;
  var h = null == e ? void 0 : e.userAgent;
  function u() {
    return !(!t || false === t.navigator.onLine);
  }
  var d = "undefined" != typeof globalThis ? globalThis : t;
  d && "undefined" == typeof self && (d.self = d), d && "undefined" == typeof File && (d.File = function() {
  });
  var v = null != t ? t : {};
  var c = { DEBUG: false, LIB_VERSION: "0.7.1", LIB_NAME: "browser-common" };
  function f(t3, i3, e3, r3, s3, n3, o3) {
    try {
      var a3 = t3[n3](o3), l3 = a3.value;
    } catch (t4) {
      return void e3(t4);
    }
    a3.done ? i3(l3) : Promise.resolve(l3).then(r3, s3);
  }
  function p(t3) {
    return function() {
      var i3 = this, e3 = arguments;
      return new Promise((function(r3, s3) {
        var n3 = t3.apply(i3, e3);
        function o3(t4) {
          f(n3, r3, s3, o3, a3, "next", t4);
        }
        function a3(t4) {
          f(n3, r3, s3, o3, a3, "throw", t4);
        }
        o3(void 0);
      }));
    };
  }
  function _() {
    return _ = Object.assign ? Object.assign.bind() : function(t3) {
      for (var i3 = 1; arguments.length > i3; i3++) {
        var e3 = arguments[i3];
        for (var r3 in e3) ({}).hasOwnProperty.call(e3, r3) && (t3[r3] = e3[r3]);
      }
      return t3;
    }, _.apply(null, arguments);
  }
  function g(t3, i3) {
    if (null == t3) return {};
    var e3 = {};
    for (var r3 in t3) if ({}.hasOwnProperty.call(t3, r3)) {
      if (-1 !== i3.indexOf(r3)) continue;
      e3[r3] = t3[r3];
    }
    return e3;
  }
  var m = (t3) => {
    if ("string" != typeof t3) return t3;
    try {
      return JSON.parse(t3);
    } catch (i3) {
      return t3;
    }
  };
  function y(t3) {
    return "string" == typeof t3 || t3;
  }
  function b(t3) {
    return "string" == typeof t3 ? t3 : void 0;
  }
  var w = ["$feature_flag", "$feature_flag_response", "$feature_flag_has_experiment", "$feature_flag_id", "$feature_flag_version", "$feature_flag_reason", "$feature_flag_request_id", "$feature_flag_evaluated_at", "$feature_flag_error", "locally_evaluated", "$groups", "$process_person_profile", "$geoip_disable", "$current_url", "$pathname", "$referring_domain", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gad_source", "mc_cid", "gclid", "gclsrc", "dclid", "gbraid", "wbraid", "fbclid", "msclkid", "twclid", "li_fat_id", "igshid", "ttclid", "rdt_cid", "epik", "qclid", "sccid", "irclid", "_kx", "$session_id", "$window_id", "$lib", "$lib_version", "$device_id", "$is_server"];
  var S = (function(t3) {
    return t3.AnonymousId = "anonymous_id", t3.DistinctId = "distinct_id", t3.Props = "props", t3.EnablePersonProcessing = "enable_person_processing", t3.PersonMode = "person_mode", t3.FeatureFlagDetails = "feature_flag_details", t3.FeatureFlags = "feature_flags", t3.FeatureFlagPayloads = "feature_flag_payloads", t3.BootstrapFeatureFlagDetails = "bootstrap_feature_flag_details", t3.BootstrapFeatureFlags = "bootstrap_feature_flags", t3.BootstrapFeatureFlagPayloads = "bootstrap_feature_flag_payloads", t3.OverrideFeatureFlags = "override_feature_flags", t3.Queue = "queue", t3.AiQueue = "ai_queue", t3.AiCaptureQueue = "ai_capture_queue", t3.LogsQueue = "logs_queue", t3.OptedOut = "opted_out", t3.SessionId = "session_id", t3.SessionStartTimestamp = "session_start_timestamp", t3.SessionLastTimestamp = "session_timestamp", t3.PersonProperties = "person_properties", t3.GroupProperties = "group_properties", t3.InstalledAppBuild = "installed_app_build", t3.InstalledAppVersion = "installed_app_version", t3.SessionReplay = "session_replay", t3.PushRegistered = "push_registered", t3.SessionReplayEventTriggerActivatedSession = "session_replay_event_trigger_activated_session", t3.SurveyLastSeenDate = "survey_last_seen_date", t3.SurveysSeen = "surveys_seen", t3.Surveys = "surveys", t3.RemoteConfig = "remote_config", t3.FlagsEndpointWasHit = "flags_endpoint_was_hit", t3.DeviceId = "device_id", t3;
  })({});
  var x = (function(t3) {
    return t3.GZipJS = "gzip-js", t3.Base64 = "base64", t3;
  })({});
  var E = ["$snapshot", "$pageview", "$pageleave", "$set", "survey dismissed", "survey sent", "survey shown", "$identify", "$groupidentify", "$create_alias", "$$client_ingestion_warning", "$web_experiment_applied", "$feature_enrollment_update", "$feature_flag_called"];
  var k = ["token"];
  var T = 20;
  var P = 1e3;
  var R = 1e4;
  var C = "[Circular]";
  var O = "[Truncated]";
  var I = "[Unserializable]";
  var F = "[Function]";
  function A(t3) {
    for (var i3 = "", e3 = 0; t3.length > e3; e3++) {
      var r3 = t3.charCodeAt(e3);
      if (55296 > r3 || r3 > 56319) i3 += 56320 > r3 || r3 > 57343 ? t3[e3] : "\uFFFD";
      else {
        var s3 = t3.charCodeAt(e3 + 1);
        56320 > s3 || s3 > 57343 ? i3 += "\uFFFD" : (i3 += t3[e3] + t3[e3 + 1], e3++);
      }
    }
    return i3;
  }
  var M = ["amazonbot", "amazonproductbot", "app.hypefactors.com", "applebot", "archive.org_bot", "awariobot", "backlinksextendedbot", "baiduspider", "bingbot", "bingpreview", "chrome-lighthouse", "dataforseobot", "deepscan", "duckduckbot", "facebookexternal", "facebookcatalog", "http://yandex.com/bots", "hubspot", "ia_archiver", "leikibot", "linkedinbot", "meta-externalagent", "mj12bot", "msnbot", "nessus", "petalbot", "pinterestbot", "prerender", "rogerbot", "screaming frog", "sebot-wa", "sitebulb", "slackbot", "slurp", "trendictionbot", "turnitin", "twitterbot", "vercel-screenshot", "vercelbot", "yahoo! slurp", "yandexbot", "zoombot", "bot.htm", "bot.php", "(bot;", "bot/", "crawler", "ahrefsbot", "ahrefssiteaudit", "semrushbot", "siteauditbot", "splitsignalbot", "gptbot", "oai-searchbot", "chatgpt-user", "perplexitybot", "better uptime bot", "sentryuptimebot", "uptimerobot", "headlesschrome", "cypress", "google-hoteladsverifier", "adsbot-google", "apis-google", "duplexweb-google", "feedfetcher-google", "google favicon", "google web preview", "google-read-aloud", "googlebot", "googleother", "google-cloudvertexbot", "googleweblight", "mediapartners-google", "storebot-google", "google-inspectiontool", "bytespider"];
  var D = function(t3, i3) {
    if (void 0 === i3 && (i3 = []), !t3) return false;
    var e3 = t3.toLowerCase();
    return M.concat(i3).some(((t4) => {
      var i4 = t4.toLowerCase();
      return -1 !== e3.indexOf(i4);
    }));
  };
  function N(t3, i3) {
    return -1 !== t3.indexOf(i3);
  }
  var L = function(t3) {
    return t3.trim();
  };
  var j = function(t3) {
    return t3.replace(/^\$/, "");
  };
  function U(t3) {
    var i3, e3 = [];
    return null !== (i3 = JSON.stringify(t3, (function(t4, i4) {
      if ("bigint" == typeof i4) return i4.toString();
      if ("function" != typeof i4 && "symbol" != typeof i4) {
        if (i4 instanceof Error) return { name: i4.name, message: i4.message, stack: i4.stack };
        if (i4 && "object" == typeof i4) {
          for (; e3.length > 0 && e3[e3.length - 1] !== this; ) e3.pop();
          if (e3.includes(i4)) return "[Circular]";
          e3.push(i4);
        }
        return i4;
      }
    }))) && void 0 !== i3 ? i3 : "null";
  }
  var B = Object.prototype;
  var z = B.hasOwnProperty;
  var H = B.toString;
  var q = Array.isArray || function(t3) {
    return "[object Array]" === H.call(t3);
  };
  var V = (t3) => "function" == typeof t3;
  var W = (t3) => t3 === Object(t3) && !q(t3);
  var G = (t3) => {
    if (W(t3)) {
      for (var i3 in t3) if (z.call(t3, i3)) return false;
      return true;
    }
    return false;
  };
  var K = (t3) => void 0 === t3;
  var J = (t3) => "[object String]" == H.call(t3);
  var Y = (t3) => J(t3) && 0 === t3.trim().length;
  var Q = (t3) => null === t3;
  var X = (t3) => K(t3) || Q(t3);
  var Z = (t3) => "[object Number]" == H.call(t3) && t3 == t3;
  var tt = (t3) => Z(t3) && t3 > 0;
  var it = (t3) => "[object Boolean]" === H.call(t3);
  var et = (t3) => t3 instanceof FormData;
  var rt = (t3) => N(E, t3);
  var st = (t3) => N(k, t3);
  function nt(t3) {
    return null === t3 || "object" != typeof t3;
  }
  function ot(t3, i3) {
    return {}.toString.call(t3) === "[object " + i3 + "]";
  }
  function at(t3) {
    switch ({}.toString.call(t3)) {
      case "[object Error]":
      case "[object Exception]":
      case "[object DOMException]":
      case "[object DOMError]":
      case "[object WebAssembly.Exception]":
        return true;
      default:
        return ht(t3, Error);
    }
  }
  function lt(t3) {
    return "undefined" != typeof Event && ht(t3, Event);
  }
  function ht(t3, i3) {
    try {
      return t3 instanceof i3;
    } catch (t4) {
      return false;
    }
  }
  var ut = [true, "true", 1, "1", "yes"];
  var dt = (t3) => N(ut, t3);
  var vt = [false, "false", 0, "0", "no"];
  function ct(t3, i3, e3, r3, s3) {
    return i3 > e3 && (r3.warn("min cannot be greater than max."), i3 = e3), Z(t3) ? t3 > e3 ? (r3.warn(" cannot be  greater than max: " + e3 + ". Using max value instead."), e3) : i3 > t3 ? (r3.warn(" cannot be less than min: " + i3 + ". Using min value instead."), i3) : t3 : (r3.warn(" must be a number. using max or fallback. max: " + e3 + ", fallback: " + s3), ct(s3 || e3, i3, e3, r3));
  }
  var ft = class {
    constructor(t3) {
      this.C = {}, this.I = t3.I, this.R = ct(t3.bucketSize, 0, 100, t3.A), this.O = ct(t3.refillRate, 0, this.R, t3.A), this.N = ct(t3.refillInterval, 0, 864e5, t3.A);
    }
    F(t3, i3) {
      var e3 = Math.floor((i3 - t3.lastAccess) / this.N);
      e3 > 0 && (t3.tokens = Math.min(t3.tokens + e3 * this.O, this.R), t3.lastAccess = t3.lastAccess + e3 * this.N);
    }
    consumeRateLimit(t3) {
      var i3, e3 = Date.now(), r3 = String(t3), s3 = this.C[r3];
      return s3 ? this.F(s3, e3) : this.C[r3] = s3 = { tokens: this.R, lastAccess: e3 }, 0 === s3.tokens || (s3.tokens--, 0 === s3.tokens && (null == (i3 = this.I) || i3.call(this, t3)), 0 === s3.tokens);
    }
    stop() {
      this.C = {};
    }
  };
  var pt = "Mobile";
  var _t = "iOS";
  var gt = "Android";
  var mt = "Tablet";
  var yt = gt + " " + mt;
  var bt = "iPad";
  var wt = "Apple";
  var St = wt + " Watch";
  var xt = "Safari";
  var Et = "BlackBerry";
  var kt = "Samsung";
  var Tt = kt + "Browser";
  var $t = kt + " Internet";
  var Pt = "Chrome";
  var Rt = Pt + " OS";
  var Ct = Pt + " " + _t;
  var Ot = "Internet Explorer";
  var It = Ot + " " + pt;
  var Ft = "Opera";
  var At = Ft + " Mini";
  var Mt = "Edge";
  var Dt = "Microsoft " + Mt;
  var Nt = "Firefox";
  var Lt = Nt + " " + _t;
  var jt = "Nintendo";
  var Ut = "PlayStation";
  var Bt = "Xbox";
  var zt = gt + " " + pt;
  var Ht = pt + " " + xt;
  var qt = "Windows";
  var Vt = qt + " Phone";
  var Wt = "Nokia";
  var Gt = "Ouya";
  var Kt = "Generic";
  var Jt = Kt + " " + pt.toLowerCase();
  var Yt = Kt + " " + mt.toLowerCase();
  var Qt = "Konqueror";
  var Xt = "Oculus Browser";
  var Zt = "Vivaldi";
  var ti = "Yandex";
  var ii = "Whale";
  var ei = "DuckDuckGo";
  var ri = "Pale Moon";
  var si = "Waterfox";
  var ni = "Brave";
  var oi = "Claude";
  var ai = "Codex";
  var li = "ChatGPT";
  var hi = "Google Search App";
  var ui = "(\\d+(\\.\\d+)?)";
  var di = new RegExp("Version/" + ui);
  var vi = new RegExp("(" + oi + "|" + ai + "|" + li + ")\\/" + ui);
  var ci = new RegExp(Bt, "i");
  var fi = new RegExp(Ut + " \\w+", "i");
  var pi = new RegExp(jt + " \\w+", "i");
  var _i = new RegExp(Et + "|PlayBook|BB10", "i");
  var gi = { "NT3.51": "NT 3.11", "NT4.0": "NT 4.0", "5.0": "2000", 5.1: "XP", 5.2: "XP", "6.0": "Vista", 6.1: "7", 6.2: "8", 6.3: "8.1", 6.4: "10", "10.0": "10" };
  var mi = function(t3, i3, e3, r3) {
    i3 = i3 || "";
    var s3 = (function(t4) {
      return null != t4 && t4.brave ? ni : null;
    })(e3);
    return s3 || (null != r3 && r3.detectGoogleSearchApp && N(t3, "GSA/") ? hi : N(t3, " OPR/") && N(t3, "Mini") ? At : N(t3, " OPR/") ? Ft : _i.test(t3) ? Et : N(t3, "IE" + pt) || N(t3, "WPDesktop") ? It : N(t3, "OculusBrowser") ? Xt : N(t3, Tt) ? $t : N(t3, Mt) || N(t3, "Edg/") ? Dt : N(t3, Zt + "/") ? Zt : N(t3, "YaBrowser/") ? ti : N(t3, ii + "/") ? ii : N(t3, ei + "/") || N(t3, "Ddg/") ? ei : N(t3, oi + "/") ? oi : N(t3, ai + "/") ? ai : N(t3, li + "/") ? li : N(t3, "FBIOS") ? "Facebook " + pt : N(t3, "UCWEB") || N(t3, "UCBrowser") ? "UC Browser" : N(t3, "CriOS") ? Ct : N(t3, "CrMo") || N(t3, Pt) ? Pt : N(t3, gt) && N(t3, xt) ? zt : N(t3, "FxiOS") ? Lt : N(t3.toLowerCase(), Qt.toLowerCase()) ? Qt : N(t3, ni + "/") ? ni : ((t4, i4) => i4 && N(i4, wt) || (function(t5) {
      return N(t5, xt) && !N(t5, Pt) && !N(t5, gt);
    })(t4))(t3, i3) ? N(t3, pt) ? Ht : xt : N(t3, "PaleMoon/") ? ri : N(t3, si + "/") ? si : N(t3, Nt) ? Nt : N(t3, "MSIE") || N(t3, "Trident/") ? Ot : N(t3, "Gecko") ? Nt : "");
  };
  var yi = { [It]: [new RegExp("rv:" + ui)], [Dt]: [new RegExp(Mt + "?\\/" + ui)], [Pt]: [new RegExp("(" + Pt + "|CrMo)\\/" + ui)], [Ct]: [new RegExp("CriOS\\/" + ui)], "UC Browser": [new RegExp("(UCBrowser|UCWEB)\\/" + ui)], [xt]: [di], [Ht]: [di], [Ft]: [new RegExp("(Opera|OPR)\\/" + ui)], [Nt]: [new RegExp(Nt + "\\/" + ui)], [Lt]: [new RegExp("FxiOS\\/" + ui)], [Qt]: [new RegExp("Konqueror[:/]?" + ui, "i")], [Et]: [new RegExp(Et + " " + ui), di], [zt]: [new RegExp("android\\s" + ui, "i")], [$t]: [new RegExp(Tt + "\\/" + ui)], [Xt]: [new RegExp("OculusBrowser\\/" + ui)], [Zt]: [new RegExp(Zt + "\\/" + ui)], [ti]: [new RegExp("YaBrowser\\/" + ui)], [ii]: [new RegExp(ii + "\\/" + ui)], [ni]: [new RegExp(ni + "\\/" + ui)], [oi]: [vi], [ai]: [vi], [li]: [vi], [ei]: [new RegExp("(DuckDuckGo|Ddg)\\/" + ui)], [ri]: [new RegExp("PaleMoon\\/" + ui)], [si]: [new RegExp(si + "\\/" + ui)], [hi]: [new RegExp("GSA\\/" + ui)], [Ot]: [new RegExp("(rv:|MSIE )" + ui)], Mozilla: [new RegExp("rv:" + ui)] };
  var bi = function(t3, i3, e3, r3) {
    var s3 = mi(t3, i3, e3, r3), n3 = yi[s3];
    if (K(n3)) return null;
    for (var o3 = 0; n3.length > o3; o3++) {
      var a3 = t3.match(n3[o3]);
      if (a3) return parseFloat(a3[a3.length - 2]);
    }
    return null;
  };
  var wi = [[new RegExp(Bt + "; " + Bt + " (.*?)[);]", "i"), (t3) => [Bt, t3 && t3[1] || ""]], [new RegExp(jt, "i"), [jt, ""]], [new RegExp(Ut, "i"), [Ut, ""]], [_i, [Et, ""]], [new RegExp(qt, "i"), (t3, i3) => {
    if (/Phone/.test(i3) || /WPDesktop/.test(i3)) return [Vt, ""];
    if (new RegExp(pt).test(i3) && !/IEMobile\b/.test(i3)) return [qt + " " + pt, ""];
    var e3 = /Windows NT ([0-9.]+)/i.exec(i3);
    if (e3 && e3[1]) {
      var r3 = gi[e3[1]] || "";
      return /arm/i.test(i3) && (r3 = "RT"), [qt, r3];
    }
    return [qt, ""];
  }], [/((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/, (t3) => t3 && t3[3] ? [_t, [t3[3], t3[4], t3[5] || "0"].join(".")] : [_t, ""]], [/(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i, (t3) => {
    var i3 = "";
    return t3 && t3.length >= 3 && (i3 = K(t3[2]) ? t3[3] : t3[2]), ["watchOS", i3];
  }], [new RegExp("(" + gt + " (\\d+)\\.(\\d+)\\.?(\\d+)?|" + gt + ")", "i"), (t3) => t3 && t3[2] ? [gt, [t3[2], t3[3], t3[4] || "0"].join(".")] : [gt, ""]], [/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i, (t3) => {
    var i3 = ["Mac OS X", ""];
    return t3 && t3[1] && (i3[1] = [t3[1], t3[2], t3[3] || "0"].join(".")), i3;
  }], [/Mac/i, ["Mac OS X", ""]], [/CrOS/, [Rt, ""]], [/Linux|debian/i, ["Linux", ""]]];
  var Si = function(t3) {
    for (var i3 = 0; wi.length > i3; i3++) {
      var e3 = wi[i3], r3 = e3[1], s3 = e3[0].exec(t3), n3 = s3 && (V(r3) ? r3(s3, t3) : r3);
      if (n3) return n3;
    }
    return ["", ""];
  };
  var xi = function(t3) {
    return pi.test(t3) ? jt : fi.test(t3) ? Ut : ci.test(t3) ? Bt : new RegExp(Gt, "i").test(t3) ? Gt : new RegExp("(" + Vt + "|WPDesktop)", "i").test(t3) ? Vt : /iPad/.test(t3) ? bt : /iPod/.test(t3) ? "iPod Touch" : /iPhone/.test(t3) ? "iPhone" : /(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(t3) ? St : _i.test(t3) ? Et : /(kobo)\s(ereader|touch)/i.test(t3) ? "Kobo" : new RegExp(Wt, "i").test(t3) ? Wt : /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(t3) || /(kf[a-z]+)( bui|\)).+silk\//i.test(t3) ? "Kindle Fire" : /(Android|ZTE)/i.test(t3) ? new RegExp(pt).test(t3) && !/(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(t3) || /pixel[\daxl ]{1,6}/i.test(t3) && !/pixel c/i.test(t3) || /(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(t3) || /lmy47v/i.test(t3) && !/QTAQZ3/i.test(t3) ? gt : yt : new RegExp("(pda|" + pt + ")", "i").test(t3) ? Jt : new RegExp(mt, "i").test(t3) && !new RegExp(mt + " pc", "i").test(t3) ? Yt : "";
  };
  var Ei = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function ki(t3, i3) {
    return "string" == typeof (e3 = t3) && Ei.test(e3) ? t3 : i3();
    var e3;
  }
  function Ti(t3, i3) {
    var e3 = new Error(i3);
    try {
      Object.defineProperty(e3, "name", { value: t3, writable: true, enumerable: true, configurable: true });
    } catch (t4) {
    }
    return e3;
  }
  function $i(t3) {
    return t3 ? t3.split("#")[0] : t3;
  }
  function Pi(t3, i3) {
    var e3 = setTimeout(t3, i3);
    return (null == e3 ? void 0 : e3.unref) && (null == e3 || e3.unref()), e3;
  }
  function Ri(t3, i3, e3) {
    return Ci.apply(this, arguments);
  }
  function Ci() {
    return (Ci = p((function* (t3, i3, e3) {
      var r3;
      try {
        return yield Promise.race([t3, new Promise(((t4, s3) => {
          r3 = Pi((() => {
            try {
              null == e3 || e3(), t4();
            } catch (t5) {
              s3(t5);
            }
          }), i3);
        }))]);
      } finally {
        clearTimeout(r3);
      }
    }))).apply(this, arguments);
  }
  var Oi;
  var Ii = "NativeGzipValidationError";
  var Fi = (t3) => t3.length >= 2 && 31 === t3[0] && 139 === t3[1];
  var Ai = (t3, i3) => t3 === x.GZipJS || i3 === x.GZipJS || "gzip" === i3;
  var Mi = (t3) => !(!t3 || "object" != typeof t3) && "NotReadableError" === ("name" in t3 ? String(t3.name) : "");
  var Di = (t3) => {
    throw Ti(Ii, "Native gzip produced invalid output: " + t3);
  };
  var Ni = (function() {
    var t3 = p((function* (t4, i3) {
      18 > t4.size && Di("too-short");
      var e3 = new Uint8Array(yield t4.slice(0, 10).arrayBuffer());
      Fi(e3) && 8 === e3[2] || Di("invalid-header");
      var r3 = new DataView(yield t4.slice(t4.size - 8).arrayBuffer());
      r3.getUint32(0, true) !== ((t5) => {
        for (var i4 = (() => {
          if (Oi) return Oi;
          Oi = [];
          for (var t6 = 0; 256 > t6; t6++) {
            for (var i5 = t6, e5 = 0; 8 > e5; e5++) i5 = 1 & i5 ? 3988292384 ^ i5 >>> 1 : i5 >>> 1;
            Oi[t6] = i5 >>> 0;
          }
          return Oi;
        })(), e4 = 4294967295, r4 = 0; t5.length > r4; r4++) e4 = i4[255 & (e4 ^ t5[r4])] ^ e4 >>> 8;
        return (4294967295 ^ e4) >>> 0;
      })(i3) && Di("invalid-crc");
      var s3 = i3.length >>> 0;
      r3.getUint32(4, true) !== s3 && Di("invalid-size");
    }));
    return function(i3, e3) {
      return t3.apply(this, arguments);
    };
  })();
  function Li() {
    return Li = p((function* (t3, i3, e3) {
      void 0 === i3 && (i3 = true);
      try {
        var r3 = new TextEncoder().encode(t3), s3 = new globalThis.CompressionStream("gzip"), n3 = s3.writable.getWriter(), o3 = n3.write(r3).then((() => n3.close())).catch((function() {
          var t4 = p((function* (t5) {
            try {
              yield n3.abort(t5);
            } catch (t6) {
            }
            throw t5;
          }));
          return function(i4) {
            return t4.apply(this, arguments);
          };
        })()), a3 = new Response(s3.readable).blob(), l3 = (yield Promise.all([a3, o3]))[0];
        return yield Ni(l3, r3), l3;
      } catch (t4) {
        if (null != e3 && e3.rethrow) throw t4;
        return i3 && console.error("Failed to gzip compress data", t4), null;
      }
    })), Li.apply(this, arguments);
  }
  var ji = 9223372036854776e3;
  var Ui = "9223372036854775808";
  var Bi = {}.propertyIsEnumerable;
  function zi(t3, i3) {
    try {
      return Vi(t3, i3, { ancestors: /* @__PURE__ */ new WeakSet(), remainingNodes: R }, 0);
    } catch (t4) {
      return [];
    }
  }
  function Hi(t3, i3, e3, r3) {
    if (0 >= e3.remainingNodes) return { stringValue: O };
    if (e3.remainingNodes--, it(t3)) return { boolValue: t3 };
    if ("bigint" == typeof t3) return (function(t4, i4) {
      var e4 = t4.toString(), r4 = BigInt(Ui);
      return t4 >= r4 || -r4 > t4 ? (null == i4 || i4.debug("Attribute " + e4 + " is outside the int64 range; encoding it as a string"), { stringValue: e4 }) : { intValue: e4 };
    })(t3, i3);
    if ("number" == typeof t3) {
      if (!Number.isFinite(t3)) return { stringValue: String(t3) };
      if (Number.isInteger(t3)) {
        if (Number.isSafeInteger(t3)) return { intValue: String(t3) };
        if ("undefined" == typeof BigInt) return { stringValue: String(t3) };
        var s3 = BigInt(t3).toString();
        return t3 >= ji || -ji > t3 ? (null == i3 || i3.debug("Attribute " + s3 + " is outside the int64 range; encoding it as a string"), { stringValue: s3 }) : { intValue: s3 };
      }
      return { doubleValue: t3 };
    }
    if ("string" == typeof t3) return { stringValue: A(t3) };
    if ("function" == typeof t3) return { stringValue: F };
    if ("symbol" == typeof t3) return { stringValue: String(t3) };
    if ("object" == typeof t3 && null !== t3) {
      if (e3.ancestors.has(t3)) return { stringValue: C };
      if (r3 >= T) return { stringValue: O };
      if (t3 instanceof Date) {
        var n3 = t3.getTime(), o3 = Number.isFinite(n3) ? t3.toISOString() : String(t3);
        return { stringValue: "string" == typeof o3 ? A(o3) : String(o3) };
      }
      e3.ancestors.add(t3);
      try {
        try {
          var a3 = t3.toJSON;
          if ("function" == typeof a3) return Hi(a3.call(t3), i3, e3, r3 + 1);
        } catch (t4) {
        }
        return q(t3) ? { arrayValue: { values: qi(t3, i3, e3, r3 + 1) } } : { kvlistValue: { values: Vi(t3, i3, e3, r3 + 1) } };
      } finally {
        e3.ancestors.delete(t3);
      }
    }
    return { stringValue: A(String(t3)) };
  }
  function qi(t3, i3, e3, r3) {
    for (var s3 = [], n3 = Math.min(t3.length, P), o3 = 0; n3 > o3 && e3.remainingNodes > 0; o3++) try {
      var a3 = o3 in t3 ? t3[o3] : void 0;
      if (X(a3)) continue;
      s3.push(Hi(a3, i3, e3, r3));
    } catch (t4) {
      s3.push({ stringValue: I });
    }
    return t3.length > o3 && s3.push({ stringValue: O }), s3;
  }
  function Vi(t3, i3, e3, r3) {
    var s3 = [];
    for (var n3 in t3) if (Bi.call(t3, n3)) {
      if (!n3) {
        null == i3 || i3.debug("Dropping an attribute with an empty key");
        continue;
      }
      if (s3.length >= P || 0 >= e3.remainingNodes) {
        null == i3 || i3.debug("Attributes truncated: the value exceeds the OTLP encoder budget");
        break;
      }
      try {
        var o3 = t3[n3];
        if (Q(o3) || K(o3)) continue;
        s3.push({ key: A(n3), value: Hi(o3, i3, e3, r3) });
      } catch (t4) {
        s3.push({ key: A(n3), value: { stringValue: I } });
      }
    }
    return s3;
  }
  function Wi(t3, i3, e3) {
    return _({}, t3.resourceAttributes, { "service.name": t3.serviceName || "unknown_service" }, t3.environment && { "deployment.environment": t3.environment }, t3.serviceVersion && { "service.version": t3.serviceVersion }, { "telemetry.sdk.name": i3, "telemetry.sdk.version": e3 });
  }
  var Gi = { darwin: "macOS", win32: "Windows", linux: "Linux", android: "Android", freebsd: "FreeBSD", openbsd: "OpenBSD", sunos: "SunOS", aix: "AIX", "Mac OS X": "macOS" };
  var Ki = { trace: { text: "TRACE", number: 1 }, debug: { text: "DEBUG", number: 5 }, info: { text: "INFO", number: 9 }, warn: { text: "WARN", number: 13 }, error: { text: "ERROR", number: 17 }, fatal: { text: "FATAL", number: 21 } };
  var Ji = Ki.info;
  function Yi(t3) {
    try {
      return A(String(t3));
    } catch (t4) {
      return I;
    }
  }
  function Qi(t3, i3, e3, r3) {
    var s3, n3 = Ki[t3.level || "info"] || Ji, o3 = n3.text, a3 = n3.number, l3 = (void 0 === (s3 = Z(r3) ? r3 : void 0) && (s3 = Date.now()), String(s3) + "000000"), h3 = {};
    i3.distinctId && (h3.posthogDistinctId = i3.distinctId), i3.sessionId && (h3.sessionId = i3.sessionId), i3.windowId && (h3["window.id"] = i3.windowId), X(i3.sessionStartTimestamp) || (h3.sessionStartTimestamp = String(i3.sessionStartTimestamp)), X(i3.lastActivityTimestamp) || (h3.lastActivityTimestamp = String(i3.lastActivityTimestamp)), i3.currentUrl && (h3["url.full"] = i3.currentUrl), i3.screenName && (h3["screen.name"] = i3.screenName), i3.appState && (h3["app.state"] = i3.appState), i3.activeFeatureFlags && i3.activeFeatureFlags.length > 0 && (h3.feature_flags = i3.activeFeatureFlags);
    var u3 = _({}, h3), d3 = t3.attributes;
    if (d3) {
      var v3 = [];
      try {
        v3 = Object.keys(d3);
      } catch (t4) {
        v3 = [];
      }
      for (var c3 of v3) {
        var f3 = void 0;
        try {
          f3 = d3[c3];
        } catch (t4) {
          f3 = I;
        }
        Object.defineProperty(u3, c3, { value: f3, enumerable: true, writable: true, configurable: true });
      }
    }
    var p3 = { timeUnixNano: l3, observedTimeUnixNano: l3, severityNumber: a3, severityText: o3, body: { stringValue: Yi(t3.body) }, attributes: zi(u3, e3) };
    return t3.trace_id && (p3.traceId = t3.trace_id), t3.span_id && (p3.spanId = t3.span_id), K(t3.trace_flags) || (p3.flags = t3.trace_flags), p3;
  }
  function Xi(t3, i3, e3) {
    return Wi(t3, i3, e3);
  }
  function Zi(t3, i3, e3, r3) {
    return { resourceLogs: [{ resource: { attributes: zi(i3) }, scopeLogs: [{ scope: { name: e3, version: r3 }, logRecords: t3 }] }] };
  }
  var te = class {
    constructor(t3, i3, e3, r3, s3, n3, o3) {
      var a3;
      void 0 === n3 && (n3 = () => Promise.resolve()), this._instance = t3, this.mn = i3, this.A = e3, this.Pn = r3, this.Fn = s3, this.$n = n3, this.Nn = o3, this.qn = null, this.jn = 0, this.Bn = 0, this.Hn = 0, this.zn = 0, this.Un = 0, this.Wn = false, this.Vn = i3.maxBufferSize, this.Gn = Math.max(null !== (a3 = i3.maxQueueSize) && void 0 !== a3 ? a3 : i3.maxBufferSize, i3.maxBufferSize), this.Zn = i3.flushIntervalMs, this.Qn = i3.maxBatchRecordsPerPost, this.Jn = i3.rateCapWindowMs, this.Kn = i3.maxLogsPerInterval;
    }
    clearQueue() {
      this.Bn++, this._instance.setPersistedProperty(S.LogsQueue, []);
    }
    reset() {
      this.Yn(), this.zn = 0, this.Un = 0, this.Wn = false, this.Hn = 0, this.Qn = this.mn.maxBatchRecordsPerPost;
    }
    onReconnect() {
      this.Hn = 0, this.Xn();
    }
    captureLog(t3, i3) {
      var e3;
      if (!this._instance.isDisabled && !this._instance.optedOut && null != t3 && t3.body) {
        var r3 = this.ts(t3);
        if (null !== r3) if (r3.body) {
          if (this.es()) {
            var s3 = { record: Qi(r3, null !== (e3 = null == i3 ? void 0 : i3.context) && void 0 !== e3 ? e3 : this.Pn(), this.A, null == i3 ? void 0 : i3.occurredAtMs) };
            this.Fn((() => this.rs(s3)));
          }
        } else this.A.info("Log was rejected in beforeSend function");
      }
    }
    ts(t3) {
      var i3 = this.mn.beforeSend;
      if (!i3) return t3;
      var e3 = q(i3) ? i3 : [i3], r3 = t3;
      for (var s3 of e3) try {
        var n3 = s3(r3);
        if (!n3) return this.A.info("Log was rejected in beforeSend function"), null;
        r3 = n3;
      } catch (t4) {
        return this.A.error("Error in beforeSend function for log:", t4), null;
      }
      return r3;
    }
    es() {
      if (void 0 === this.Kn) return true;
      var t3 = Date.now(), i3 = t3 - this.zn;
      return this.Jn > i3 && i3 >= 0 || (this.zn = t3, this.Un = 0, this.Wn = false), this.Kn > this.Un ? (this.Un++, true) : (this.Wn || (this.A.warn("captureLog dropping logs: exceeded " + this.Kn + " logs per " + this.Jn + "ms"), this.Wn = true), false);
    }
    flush() {
      var t3 = this;
      return p((function* () {
        if (!t3._instance.isDisabled) return t3.qn || (t3.qn = t3.ns().finally((() => {
          t3.qn = null;
        }))), t3.qn;
      }))();
    }
    ns() {
      var t3 = this;
      return p((function* () {
        var i3;
        t3.Yn();
        var e3 = null !== (i3 = t3._instance.getPersistedProperty(S.LogsQueue)) && void 0 !== i3 ? i3 : [];
        if (0 !== e3.length) for (var r3 = e3.length, s3 = 0; e3.length > 0 && r3 > s3; ) {
          var n3, o3, a3 = t3.Bn;
          t3.jn = 0;
          var l3 = Math.min(e3.length, t3.Qn), h3 = e3.slice(0, l3), u3 = Zi(h3.map(((t4) => t4.record)), t3.ss(), null !== (n3 = t3.Nn) && void 0 !== n3 ? n3 : t3._instance.getLibraryId(), t3._instance.getLibraryVersion()), d3 = yield t3._instance.os(u3);
          if (t3.Bn !== a3) return;
          if ("too-large" === d3.kind && h3.length > 1) t3.Qn = Math.max(1, Math.floor(h3.length / 2)), t3.A.warn("Received 413 when sending logs batch of size " + h3.length + ", reducing batch size to " + t3.Qn);
          else {
            if ("retry-later" === d3.kind) throw d3.error;
            if ("too-large" === d3.kind ? t3.A.warn("Dropping a single log record after 413 with batch size 1 \u2014 the record is larger than the server cap and cannot be split further.") : "ok" === d3.kind && t3.mn.maxBatchRecordsPerPost > t3.Qn && (t3.Qn = Math.min(t3.mn.maxBatchRecordsPerPost, t3.Qn + 1)), yield t3.ls(h3.length), e3 = null !== (o3 = t3._instance.getPersistedProperty(S.LogsQueue)) && void 0 !== o3 ? o3 : [], s3 += h3.length, "fatal" === d3.kind) throw d3.error;
          }
        }
      }))();
    }
    ls(t3) {
      var i3 = this;
      return p((function* () {
        var e3, r3 = Math.max(0, t3 - i3.jn), s3 = null !== (e3 = i3._instance.getPersistedProperty(S.LogsQueue)) && void 0 !== e3 ? e3 : [];
        i3._instance.setPersistedProperty(S.LogsQueue, s3.slice(r3)), yield i3.$n();
      }))();
    }
    ss() {
      return Xi(this.mn, this._instance.getLibraryId(), this._instance.getLibraryVersion());
    }
    rs(t3) {
      var i3;
      if (!this._instance.optedOut) {
        var e3 = null !== (i3 = this._instance.getPersistedProperty(S.LogsQueue)) && void 0 !== i3 ? i3 : [];
        this.Gn > e3.length || (e3.shift(), this.jn++, this.A.info("Logs queue is full, dropping oldest record.")), e3.push(t3), this._instance.setPersistedProperty(S.LogsQueue, e3), this.Vn > e3.length ? this.us() : this.Xn();
      }
    }
    us(t3) {
      void 0 === t3 && (t3 = this.Zn), this.hs || (this.hs = Pi((() => {
        this.hs = void 0, this.Xn();
      }), t3));
    }
    ds() {
      var t3 = Math.min(Math.max(0, this.Hn - 1), 6);
      return this.Zn * Math.pow(2, t3);
    }
    vs() {
      var t3 = this._instance.getPersistedProperty(S.LogsQueue);
      return !!t3 && t3.length > 0;
    }
    shutdown(t3) {
      var i3 = this;
      return p((function* () {
        i3.Yn();
        var e3 = i3.flush().catch((() => {
        }));
        void 0 !== t3 ? yield Ri(e3, t3) : yield e3;
      }))();
    }
    flushWithTimeout(t3) {
      var i3 = this;
      return p((function* () {
        var e3 = i3.flush();
        yield Ri(e3, t3, (() => {
          e3.catch((() => {
          }));
        }));
      }))();
    }
    Xn() {
      this.flush().then((() => {
        this.Hn = 0;
      }), ((t3) => {
        this.Hn++, this.A.error("PostHog logs flush failed:", t3);
      })).finally((() => {
        !this._instance.isDisabled && this.vs() && this.us(this.ds());
      }));
    }
    Yn() {
      this.hs && (clearTimeout(this.hs), this.hs = void 0);
    }
  };
  var ie = [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1e3, 2500, 5e3, 7500, 1e4];
  function ee(t3) {
    return String(t3) + "000000";
  }
  function re(t3, i3, e3, r3) {
    var s3 = "";
    return r3 && (s3 = Object.keys(r3).sort().map(((t4) => JSON.stringify(t4) + ":" + JSON.stringify(r3[t4]))).join(",")), t3 + "\0" + i3 + "\0" + (null != e3 ? e3 : "") + "\0" + s3;
  }
  var se = class {
    constructor(t3, i3, e3) {
      this._instance = t3, this.mn = i3, this.A = e3, this.cs = /* @__PURE__ */ new Map(), this.qn = null, this.fs = false, this.ps = /* @__PURE__ */ new Map(), this.gs = /* @__PURE__ */ new Set(), this.ys = 0;
    }
    count(t3, i3, e3) {
      void 0 === i3 && (i3 = 1), this.bs({ name: t3, type: "count", value: i3, unit: null == e3 ? void 0 : e3.unit, attributes: null == e3 ? void 0 : e3.attributes });
    }
    gauge(t3, i3, e3) {
      this.bs({ name: t3, type: "gauge", value: i3, unit: null == e3 ? void 0 : e3.unit, attributes: null == e3 ? void 0 : e3.attributes });
    }
    histogram(t3, i3, e3) {
      this.bs({ name: t3, type: "histogram", value: i3, unit: null == e3 ? void 0 : e3.unit, attributes: null == e3 ? void 0 : e3.attributes });
    }
    flush() {
      var t3 = this, i3 = this.qn, e3 = (function() {
        var e4 = p((function* () {
          i3 && (yield i3.catch((() => {
          }))), yield t3._s();
        }));
        return function() {
          return e4.apply(this, arguments);
        };
      })(), r3 = e3().finally((() => {
        this.qn === r3 && (this.qn = null);
      }));
      return this.qn = r3, r3;
    }
    drainWindow() {
      if (0 === this.cs.size) return null;
      var t3 = this.cs;
      return this.cs = /* @__PURE__ */ new Map(), this.fs = false, this.ps = /* @__PURE__ */ new Map(), this.gs = /* @__PURE__ */ new Set(), this.ws(t3);
    }
    reset() {
      this.ys++, this.Yn(), this.cs = /* @__PURE__ */ new Map(), this.qn = null, this.fs = false, this.ps = /* @__PURE__ */ new Map(), this.gs = /* @__PURE__ */ new Set();
    }
    bs(t3) {
      if (!this._instance.isDisabled && !this._instance.optedOut) {
        var i3 = this.ts(t3);
        if (null !== i3) if (i3.name && "string" == typeof i3.name) if ("number" == typeof i3.value && Number.isFinite(i3.value)) if ("count" === i3.type && 0 > i3.value) this.A.warn("Dropping count '" + i3.name + "': counters are monotonic, value must be >= 0");
        else {
          var e3, r3;
          try {
            e3 = i3.attributes ? _({}, i3.attributes) : void 0, r3 = re(i3.type, i3.name, i3.unit, e3);
          } catch (t4) {
            return void this.A.warn("Dropping metric '" + i3.name + "': attributes could not be serialized", t4);
          }
          var s3 = this.cs.get(r3);
          if (!s3) {
            if (!this.ks()) return;
            s3 = { name: i3.name, type: i3.type, unit: i3.unit, attributes: e3, windowStartMs: Date.now() }, this.cs.set(r3, s3);
          }
          var n3 = this.ps.get(i3.name);
          void 0 === n3 ? this.ps.set(i3.name, i3.type) : n3 === i3.type || this.gs.has(i3.name) || (this.gs.add(i3.name), this.A.warn("Metric name '" + i3.name + "' is already used as a " + n3 + "; recording it as a " + i3.type + " too will blend both series in charts. Use a distinct name.")), this.Ss(s3, i3.value), this.us();
        }
        else this.A.warn("Dropping metric '" + i3.name + "': value must be a finite number");
        else this.A.warn("Dropping metric with empty name");
      }
    }
    ks() {
      return this.mn.maxSeriesPerFlush > this.cs.size || (this.fs || (this.fs = true, this.A.warn("Metric series cap reached (" + this.mn.maxSeriesPerFlush + " per flush window); dropping new series until the next flush. Reduce attribute cardinality.")), false);
    }
    Ss(t3, i3) {
      var e3;
      switch (t3.type) {
        case "count":
          t3.total = (null !== (e3 = t3.total) && void 0 !== e3 ? e3 : 0) + i3;
          break;
        case "gauge":
          t3.last = i3;
          break;
        case "histogram":
          t3.hist || (t3.hist = { count: 0, sum: 0, min: i3, max: i3, bucketCounts: new Array(ie.length + 1).fill(0) });
          var r3 = t3.hist;
          r3.count += 1, r3.sum += i3, r3.min = Math.min(r3.min, i3), r3.max = Math.max(r3.max, i3), r3.bucketCounts[(function(t4, i4) {
            for (var e4 = 0; i4.length > e4; e4++) if (i4[e4] >= t4) return e4;
            return i4.length;
          })(i3, ie)] += 1;
      }
    }
    ts(t3) {
      var i3 = this.mn.beforeSend;
      if (!i3) return t3;
      var e3 = q(i3) ? i3 : [i3], r3 = t3;
      for (var s3 of e3) try {
        var n3 = s3(r3);
        if (!n3) return this.A.info("Metric was rejected in beforeSend function"), null;
        r3 = n3;
      } catch (t4) {
        return this.A.error("Error in beforeSend function for metric:", t4), null;
      }
      return r3;
    }
    us() {
      this.hs || (this.hs = Pi((() => {
        this.hs = void 0, this.flush().catch(((t3) => {
          this.A.error("Metrics flush failed:", t3);
        }));
      }), this.mn.flushIntervalMs));
    }
    Yn() {
      this.hs && (clearTimeout(this.hs), this.hs = void 0);
    }
    _s() {
      var t3 = this;
      return p((function* () {
        if (0 !== t3.cs.size) {
          var i3 = t3.cs;
          t3.cs = /* @__PURE__ */ new Map(), t3.fs = false, t3.ps = /* @__PURE__ */ new Map(), t3.gs = /* @__PURE__ */ new Set();
          var e3 = t3.ys, r3 = yield t3._instance.xs(t3.ws(i3));
          if (e3 === t3.ys) switch (r3.kind) {
            case "ok":
              return;
            case "retry-later":
              return t3.Cs(i3), void t3.us();
            case "too-large":
              return void t3.A.warn("Metrics batch exceeded the server size limit and was dropped");
            case "fatal":
              return void t3.A.error("Failed to send metrics batch:", r3.error);
          }
        }
      }))();
    }
    ws(t3) {
      return i3 = this.Ts(t3), e3 = (function(t4, i4, e4) {
        return Wi(t4, i4, e4);
      })(this.mn, this._instance.getLibraryId(), this._instance.getLibraryVersion()), r3 = this._instance.getLibraryId(), s3 = this._instance.getLibraryVersion(), { resourceMetrics: [{ resource: { attributes: zi(e3) }, scopeMetrics: [{ scope: { name: r3, version: s3 }, metrics: i3 }] }] };
      var i3, e3, r3, s3;
    }
    Ts(t3) {
      var i3 = ee(Date.now()), e3 = /* @__PURE__ */ new Map();
      for (var r3 of t3.values()) {
        var s3, n3 = re(r3.type, r3.name, r3.unit, void 0), o3 = e3.get(n3);
        o3 || (o3 = _({ name: r3.name }, r3.unit && { unit: r3.unit }), "count" === r3.type ? o3.sum = { aggregationTemporality: 1, isMonotonic: true, dataPoints: [] } : "gauge" === r3.type ? o3.gauge = { dataPoints: [] } : o3.histogram = { aggregationTemporality: 1, dataPoints: [] }, e3.set(n3, o3));
        var a3 = zi(null !== (s3 = r3.attributes) && void 0 !== s3 ? s3 : {}, this.A), l3 = ee(r3.windowStartMs);
        if ("count" === r3.type) {
          var h3, u3 = { attributes: a3, startTimeUnixNano: l3, timeUnixNano: i3, asDouble: null !== (h3 = r3.total) && void 0 !== h3 ? h3 : 0 };
          o3.sum.dataPoints.push(u3);
        } else if ("gauge" === r3.type) {
          var d3, v3 = { attributes: a3, timeUnixNano: i3, asDouble: null !== (d3 = r3.last) && void 0 !== d3 ? d3 : 0 };
          o3.gauge.dataPoints.push(v3);
        } else r3.hist && o3.histogram.dataPoints.push({ attributes: a3, startTimeUnixNano: l3, timeUnixNano: i3, count: r3.hist.count, sum: r3.hist.sum, min: r3.hist.min, max: r3.hist.max, bucketCounts: r3.hist.bucketCounts, explicitBounds: ie });
      }
      return Array.from(e3.values());
    }
    Cs(t3) {
      var i3, e3;
      for (var r3 of t3) {
        var s3 = r3[0], n3 = r3[1], o3 = this.cs.get(s3);
        if (o3) switch (o3.windowStartMs = Math.min(o3.windowStartMs, n3.windowStartMs), o3.type) {
          case "count":
            o3.total = (null !== (i3 = o3.total) && void 0 !== i3 ? i3 : 0) + (null !== (e3 = n3.total) && void 0 !== e3 ? e3 : 0);
            break;
          case "gauge":
            break;
          case "histogram":
            if (n3.hist) if (o3.hist) {
              o3.hist.count += n3.hist.count, o3.hist.sum += n3.hist.sum, o3.hist.min = Math.min(o3.hist.min, n3.hist.min), o3.hist.max = Math.max(o3.hist.max, n3.hist.max);
              for (var a3 = 0; o3.hist.bucketCounts.length > a3; a3++) o3.hist.bucketCounts[a3] += n3.hist.bucketCounts[a3];
            } else o3.hist = n3.hist;
        }
        else this.ks() && this.cs.set(s3, n3);
      }
    }
  };
  var ne;
  var oe;
  var ae;
  function le(t3) {
    var i3 = globalThis._posthogChunkIds;
    if (i3) {
      var e3 = Object.keys(i3);
      return ae && e3.length === oe || (oe = e3.length, ae = e3.reduce(((e4, r3) => {
        ne || (ne = {});
        var s3 = ne[r3];
        if (s3) e4[s3[0]] = s3[1];
        else for (var n3 = t3(r3), o3 = n3.length - 1; o3 >= 0; o3--) {
          var a3 = n3[o3], l3 = null == a3 ? void 0 : a3.filename, h3 = i3[r3];
          if (l3 && h3) {
            e4[l3] = h3, ne[r3] = [l3, h3];
            break;
          }
        }
        return e4;
      }), {})), ae;
    }
  }
  var he = class {
    constructor(t3, i3, e3) {
      void 0 === e3 && (e3 = []), this.coercers = t3, this.stackParser = i3, this.modifiers = e3;
    }
    buildFromUnknown(t3, i3) {
      void 0 === i3 && (i3 = {});
      var e3 = i3 && i3.mechanism || { handled: true, type: "generic" }, r3 = this.buildCoercingContext(e3, i3, 0).apply(t3), s3 = this.buildParsingContext(i3), n3 = this.parseStacktrace(r3, s3);
      return { $exception_list: this.convertToExceptionList(n3, e3), $exception_level: "error" };
    }
    modifyFrames(t3) {
      var i3 = this;
      return p((function* () {
        for (var e3 of t3) e3.stacktrace && e3.stacktrace.frames && q(e3.stacktrace.frames) && (e3.stacktrace.frames = yield i3.applyModifiers(e3.stacktrace.frames));
        return t3;
      }))();
    }
    coerceFallback(t3) {
      var i3;
      return { type: "Error", value: "Unknown error", stack: null == (i3 = t3.syntheticException) ? void 0 : i3.stack, synthetic: true };
    }
    parseStacktrace(t3, i3) {
      var e3, r3;
      return null != t3.cause && (e3 = this.parseStacktrace(t3.cause, i3)), "" != t3.stack && null != t3.stack && (r3 = this.applyChunkIds(this.stackParser(t3.stack, t3.synthetic ? i3.skipFirstLines : 0), i3.chunkIdMap)), _({}, t3, { cause: e3, stack: r3 });
    }
    applyChunkIds(t3, i3) {
      return t3.map(((t4) => (t4.filename && i3 && (t4.chunk_id = i3[t4.filename]), t4)));
    }
    applyCoercers(t3, i3) {
      for (var e3 of this.coercers) if (e3.match(t3)) return e3.coerce(t3, i3);
      return this.coerceFallback(i3);
    }
    applyModifiers(t3) {
      var i3 = this;
      return p((function* () {
        var e3 = t3;
        for (var r3 of i3.modifiers) e3 = yield r3(e3);
        return e3;
      }))();
    }
    convertToExceptionList(t3, i3) {
      var e3, r3, s3, n3 = { type: t3.type, value: t3.value, mechanism: { type: null !== (e3 = i3.type) && void 0 !== e3 ? e3 : "generic", handled: null === (r3 = i3.handled) || void 0 === r3 || r3, synthetic: null !== (s3 = t3.synthetic) && void 0 !== s3 && s3 } };
      t3.stack && (n3.stacktrace = { type: "raw", frames: t3.stack });
      var o3 = [n3];
      return null != t3.cause && o3.push(...this.convertToExceptionList(t3.cause, _({}, i3, { handled: true }))), o3;
    }
    buildParsingContext(t3) {
      var i3;
      return { chunkIdMap: le(this.stackParser), skipFirstLines: null !== (i3 = t3.skipFirstLines) && void 0 !== i3 ? i3 : 1 };
    }
    buildCoercingContext(t3, i3, e3) {
      void 0 === e3 && (e3 = 0);
      var r3 = (e4, r4) => {
        if (4 >= r4) {
          var s3 = this.buildCoercingContext(t3, i3, r4);
          return this.applyCoercers(e4, s3);
        }
      };
      return _({}, i3, { syntheticException: 0 == e3 ? i3.syntheticException : void 0, mechanism: t3, apply: (t4) => r3(t4, e3), next: (t4) => r3(t4, e3 + 1) });
    }
  };
  var ue = "?";
  function de(t3, i3, e3, r3, s3) {
    var n3 = { platform: t3, filename: i3, function: "<anonymous>" === e3 ? ue : e3, in_app: !(null != i3 && i3.startsWith("webkit-masked-url://")) && "<anonymous>" !== i3 };
    return K(r3) || (n3.lineno = r3), K(s3) || (n3.colno = s3), n3;
  }
  var ve = (t3, i3) => {
    var e3 = -1 !== t3.indexOf("safari-extension"), r3 = -1 !== t3.indexOf("safari-web-extension");
    return e3 || r3 ? [-1 !== t3.indexOf("@") ? t3.split("@")[0] : ue, e3 ? "safari-extension:" + i3 : "safari-web-extension:" + i3] : [t3, i3];
  };
  var ce = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
  var fe = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  var pe = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  var _e = (t3, i3) => {
    var e3 = ce.exec(t3);
    if (e3) return de(i3, e3[1], ue, +e3[2], +e3[3]);
    var r3 = fe.exec(t3);
    if (r3) {
      if (r3[2] && 0 === r3[2].indexOf("eval")) {
        var s3 = pe.exec(r3[2]);
        s3 && (r3[2] = s3[1], r3[3] = s3[2], r3[4] = s3[3]);
      }
      var n3 = ve(r3[1] || ue, r3[2]);
      return de(i3, n3[1], n3[0], r3[3] ? +r3[3] : void 0, r3[4] ? +r3[4] : void 0);
    }
  };
  var ge = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
  var me = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  var ye = (t3, i3) => {
    var e3 = ge.exec(t3);
    if (e3) {
      if (e3[3] && e3[3].indexOf(" > eval") > -1) {
        var r3 = me.exec(e3[3]);
        r3 && (e3[1] = e3[1] || "eval", e3[3] = r3[1], e3[4] = r3[2], e3[5] = "");
      }
      var s3 = e3[3], n3 = e3[1] || ue, o3 = ve(n3, s3);
      return de(i3, s3 = o3[1], n3 = o3[0], e3[4] ? +e3[4] : void 0, e3[5] ? +e3[5] : void 0);
    }
  };
  var be = /\(error: (.*)\)/;
  var we = class {
    match(t3) {
      return this.isDOMException(t3) || this.isDOMError(t3);
    }
    coerce(t3, i3) {
      var e3 = J(t3.stack);
      return { type: this.getType(t3), value: this.getValue(t3), stack: e3 ? t3.stack : void 0, cause: t3.cause ? i3.next(t3.cause) : void 0, synthetic: false };
    }
    getType(t3) {
      return this.isDOMError(t3) ? "DOMError" : "DOMException";
    }
    getValue(t3) {
      var i3 = t3.name || (this.isDOMError(t3) ? "DOMError" : "DOMException");
      return t3.message ? i3 + ": " + t3.message : i3;
    }
    isDOMException(t3) {
      return ot(t3, "DOMException");
    }
    isDOMError(t3) {
      return ot(t3, "DOMError");
    }
  };
  var Se = class {
    match(t3) {
      return at(t3);
    }
    coerce(t3, i3) {
      var e3, r3 = this.getStack(t3), s3 = void 0 === r3;
      return { type: this.getType(t3), value: this.getMessage(t3, i3), stack: null != r3 ? r3 : null == (e3 = i3.syntheticException) ? void 0 : e3.stack, cause: t3.cause ? i3.next(t3.cause) : void 0, synthetic: s3 };
    }
    getType(t3) {
      return t3.name || t3.constructor.name;
    }
    getMessage(t3, i3) {
      var e3 = t3.message;
      return String(e3.error && "string" == typeof e3.error.message ? e3.error.message : e3);
    }
    getStack(t3) {
      return t3.stacktrace || t3.stack || void 0;
    }
  };
  var xe = class {
    constructor() {
    }
    match(t3) {
      return !!ot(t3, "ErrorEvent") && (null != t3.error || this.Vi(t3));
    }
    coerce(t3, i3) {
      var e3;
      if (null != t3.error) return i3.apply(t3.error);
      var r3 = i3.apply(t3.message);
      return _({}, r3, { stack: null !== (e3 = this.Zi(t3)) && void 0 !== e3 ? e3 : r3.stack, synthetic: true });
    }
    Vi(t3) {
      return J(t3.message) && t3.message.length > 0;
    }
    Zi(t3) {
      var i3, e3, r3 = t3, s3 = null !== (i3 = r3.lineno) && void 0 !== i3 ? i3 : 0, n3 = null !== (e3 = r3.colno) && void 0 !== e3 ? e3 : 0;
      if (J(r3.filename) && 0 !== r3.filename.length && 0 !== s3) return "Error\n    at " + r3.filename + ":" + s3 + ":" + n3;
    }
  };
  var Ee = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
  var ke = class {
    match(t3) {
      return "string" == typeof t3;
    }
    coerce(t3, i3) {
      var e3, r3 = this.getInfos(t3), s3 = r3[0], n3 = r3[1];
      return { type: null != s3 ? s3 : "Error", value: null != n3 ? n3 : t3, stack: null == (e3 = i3.syntheticException) ? void 0 : e3.stack, synthetic: true };
    }
    getInfos(t3) {
      var i3 = "Error", e3 = t3, r3 = t3.match(Ee);
      return r3 && (i3 = r3[1], e3 = r3[2]), [i3, e3];
    }
  };
  var Te = ["fatal", "error", "warning", "log", "info", "debug"];
  function $e(t3, i3) {
    void 0 === i3 && (i3 = 40);
    var e3 = Object.keys(t3);
    if (e3.sort(), !e3.length) return "[object has no keys]";
    for (var r3 = e3.length; r3 > 0; r3--) {
      var s3 = e3.slice(0, r3).join(", ");
      if (i3 >= s3.length) return r3 === e3.length ? s3 : s3.length > i3 ? s3.slice(0, i3) + "..." : s3;
    }
    return "";
  }
  var Pe = class {
    match(t3) {
      return "object" == typeof t3 && null !== t3;
    }
    coerce(t3, i3) {
      var e3, r3, s3 = this.getErrorPropertyFromObject(t3);
      return s3 ? i3.apply(s3) : { type: this.getType(t3), value: this.getValue(t3), stack: null !== (e3 = this.getStack(t3)) && void 0 !== e3 ? e3 : null == (r3 = i3.syntheticException) ? void 0 : r3.stack, level: this.isSeverityLevel(t3.level) ? t3.level : "error", synthetic: true };
    }
    getType(t3) {
      if (lt(t3)) return t3.constructor.name;
      var i3 = "name" in t3 ? t3.name : void 0;
      return J(i3) && !Y(i3) ? i3 : "Error";
    }
    getValue(t3) {
      if ("name" in t3 && "string" == typeof t3.name) {
        var i3 = "'" + t3.name + "' captured as exception";
        return "message" in t3 && "string" == typeof t3.message && (i3 += " with message: '" + t3.message + "'"), i3;
      }
      if ("message" in t3 && "string" == typeof t3.message) return t3.message;
      var e3 = this.getObjectClassName(t3);
      return (e3 && "Object" !== e3 ? "'" + e3 + "'" : "Object") + " captured as exception with keys: " + $e(t3);
    }
    isSeverityLevel(t3) {
      return J(t3) && !Y(t3) && Te.indexOf(t3) >= 0;
    }
    getStack(t3) {
      try {
        return J(t3.stacktrace) && t3.stacktrace.length > 0 ? t3.stacktrace : J(t3.stack) && t3.stack.length > 0 ? t3.stack : void 0;
      } catch (t4) {
        return;
      }
    }
    getErrorPropertyFromObject(t3) {
      for (var i3 in t3) if ({}.hasOwnProperty.call(t3, i3)) {
        var e3 = t3[i3];
        if (at(e3)) return e3;
      }
    }
    getObjectClassName(t3) {
      try {
        var i3 = Object.getPrototypeOf(t3);
        return i3 ? i3.constructor.name : void 0;
      } catch (t4) {
        return;
      }
    }
  };
  var Re = class {
    match(t3) {
      return lt(t3);
    }
    coerce(t3, i3) {
      var e3, r3 = t3.constructor.name;
      return { type: r3, value: r3 + " captured as exception with keys: " + $e(t3), stack: null == (e3 = i3.syntheticException) ? void 0 : e3.stack, synthetic: true };
    }
  };
  var Ce = class {
    match(t3) {
      return nt(t3);
    }
    coerce(t3, i3) {
      var e3;
      return { type: "Error", value: "Primitive value captured as exception: " + String(t3), stack: null == (e3 = i3.syntheticException) ? void 0 : e3.stack, synthetic: true };
    }
  };
  var Oe = class {
    match(t3) {
      return ot(t3, "PromiseRejectionEvent") || this.isCustomEventWrappingRejection(t3);
    }
    isCustomEventWrappingRejection(t3) {
      if (!lt(t3)) return false;
      try {
        var i3 = t3.detail;
        return null != i3 && "object" == typeof i3 && "reason" in i3;
      } catch (t4) {
        return false;
      }
    }
    coerce(t3, i3) {
      var e3, r3 = this.getUnhandledRejectionReason(t3);
      return nt(r3) ? { type: "UnhandledRejection", value: "Non-Error promise rejection captured with value: " + String(r3), stack: null == (e3 = i3.syntheticException) ? void 0 : e3.stack, synthetic: true } : i3.apply(r3);
    }
    getUnhandledRejectionReason(t3) {
      try {
        if ("reason" in t3) return t3.reason;
        if ("detail" in t3 && null != t3.detail && "object" == typeof t3.detail && "reason" in t3.detail) return t3.detail.reason;
      } catch (t4) {
      }
      return t3;
    }
  };
  var Ie = "$message";
  var Fe = "$timestamp";
  var Ae = /* @__PURE__ */ new Set([Ie, Fe]);
  var Me = { enabled: true, max_bytes: 32768 };
  function De(t3) {
    var i3;
    return t3 ? { enabled: null !== (i3 = t3.enabled) && void 0 !== i3 ? i3 : Me.enabled, max_bytes: Le(t3.max_bytes, Me.max_bytes) } : _({}, Me);
  }
  var Ne = class {
    constructor(t3) {
      this.Ms = [], this.Es = 0, this.mn = De(t3);
    }
    setConfig(t3) {
      this.mn = De(t3), this.Is();
    }
    add(t3) {
      var i3 = (function(t4) {
        var i4;
        try {
          i4 = U(t4);
        } catch (t5) {
          return;
        }
        try {
          var e4 = JSON.parse(i4);
          if (!W(e4)) return;
          var r3 = e4, s3 = r3[Ie], n3 = r3[Fe];
          if (!J(s3) || 0 === s3.trim().length) return;
          if (!J(n3) && !Z(n3)) return;
          return { step: r3, json: i4 };
        } catch (t5) {
          return;
        }
      })(t3);
      if (i3) {
        var e3 = (function(t4) {
          if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(t4).length;
          for (var i4 = encodeURIComponent(t4), e4 = 0, r3 = 0; i4.length > r3; r3++) "%" === i4[r3] ? (e4 += 1, r3 += 2) : e4 += 1;
          return e4;
        })(i3.json);
        e3 > this.mn.max_bytes || (this.Ms.push({ step: i3.step, bytes: e3 }), this.Es += e3, this.Is());
      }
    }
    getAttachable() {
      return this.Ms.map(((t3) => t3.step));
    }
    clear() {
      this.Ms = [], this.Es = 0;
    }
    size() {
      return this.Ms.length;
    }
    Is() {
      for (; this.Es > this.mn.max_bytes && this.Ms.length > 0; ) {
        var t3 = this.Ms.shift();
        t3 && (this.Es -= t3.bytes);
      }
    }
  };
  function Le(t3, i3) {
    if (!Z(t3) || t3 === 1 / 0 || t3 === -1 / 0) return i3;
    var e3 = Math.floor(t3);
    return 0 > e3 ? i3 : e3;
  }
  var je = function(i3, e3) {
    var r3 = (void 0 === e3 ? {} : e3).debugEnabled, s3 = { q(e4) {
      if (t && (c.DEBUG || t.POSTHOG_DEBUG || r3) && !K(t.console) && t.console) {
        for (var s4 = ("__rrweb_original__" in t.console[e4]) ? t.console[e4].__rrweb_original__ : t.console[e4], n3 = arguments.length, o3 = new Array(n3 > 1 ? n3 - 1 : 0), a3 = 1; n3 > a3; a3++) o3[a3 - 1] = arguments[a3];
        s4(i3, ...o3);
      }
    }, debug() {
      for (var t3 = arguments.length, i4 = new Array(t3), e4 = 0; t3 > e4; e4++) i4[e4] = arguments[e4];
      s3.q("debug", ...i4);
    }, info() {
      for (var t3 = arguments.length, i4 = new Array(t3), e4 = 0; t3 > e4; e4++) i4[e4] = arguments[e4];
      s3.q("log", ...i4);
    }, warn() {
      for (var t3 = arguments.length, i4 = new Array(t3), e4 = 0; t3 > e4; e4++) i4[e4] = arguments[e4];
      s3.q("warn", ...i4);
    }, error() {
      for (var t3 = arguments.length, i4 = new Array(t3), e4 = 0; t3 > e4; e4++) i4[e4] = arguments[e4];
      s3.q("error", ...i4);
    }, critical() {
      for (var t3 = arguments.length, e4 = new Array(t3), r4 = 0; t3 > r4; r4++) e4[r4] = arguments[r4];
      console.error(i3, ...e4);
    }, uninitializedWarning(t3) {
      s3.error("You must initialize PostHog before calling " + t3);
    }, createLogger: (t3, e4) => je(i3 + " " + t3, e4) };
    return s3;
  };
  var Ue = je("[PostHog.js]");
  var Be = Ue.createLogger;
  var ze = Be("[ExternalScriptsLoader]");
  var He = (t3) => {
    var i3 = null == r ? void 0 : r.querySelectorAll("script");
    if (i3) {
      for (var e3 = 0; i3.length > e3; e3++) if (i3[e3].src === t3 || i3[e3].getAttribute("src") === t3) return i3[e3];
    }
  };
  var qe = (t3, i3, e3) => {
    if (t3.config.disable_external_dependency_loading) return ze.warn(i3 + " was requested but loading of external scripts is disabled."), e3("Loading of external scripts is disabled");
    var s3 = He(i3);
    if (s3) {
      if (s3.__posthog_loading_callback_fired) return e3();
      var n3 = s3.__posthog_loading_error;
      return n3 ? e3(n3) : (s3.addEventListener("load", ((t4) => {
        s3.__posthog_loading_callback_fired = true, e3(void 0, t4);
      })), void s3.addEventListener("error", ((t4) => {
        s3.__posthog_loading_error = t4, e3(t4);
      })));
    }
    var o3 = () => {
      if (!r) return e3("document not found");
      if (He(i3)) return qe(t3, i3, e3);
      var s4 = r.createElement("script");
      if (s4.type = "text/javascript", s4.crossOrigin = "anonymous", s4.src = i3, s4.onload = (t4) => {
        s4.__posthog_loading_callback_fired = true, e3(void 0, t4);
      }, s4.onerror = (t4) => {
        s4.__posthog_loading_error = t4, e3(t4);
      }, t3.config.prepare_external_dependency_script && (s4 = t3.config.prepare_external_dependency_script(s4)), !s4) return e3("prepare_external_dependency_script returned null");
      if ("head" === t3.config.external_scripts_inject_target) r.head.appendChild(s4);
      else {
        var n4, o4 = r.querySelectorAll("body > script");
        o4.length > 0 ? null == (n4 = o4[0].parentNode) || n4.insertBefore(s4, o4[0]) : r.body.appendChild(s4);
      }
    };
    null != r && r.body ? o3() : null == r || r.addEventListener("DOMContentLoaded", o3);
  };
  var Ve = {};
  var We = (t3, i3) => {
    var e3 = "/static/" + i3 + ".js?v=" + t3.version;
    if ("toolbar" === i3) {
      var r3 = 3e5;
      e3 = e3 + "&t=" + Math.floor(Date.now() / r3) * r3;
    }
    return t3.requestRouter.endpointFor("assets", e3);
  };
  v.__PosthogExtensions__ = v.__PosthogExtensions__ || {}, v.__PosthogExtensions__.loadExternalDependency = (t3, i3, e3) => {
    if ("remote-config" !== i3) {
      var r3 = t3.config.strict_script_versioning;
      if (r3) {
        var s3 = t3.requestRouter.endpointFor("assets", "/static/" + t3.version + "/" + i3 + ".js"), n3 = Ve[s3];
        if ("fallback" === r3 && n3) {
          if (He(n3)) return void qe(t3, n3, e3);
          delete Ve[s3];
        }
        qe(t3, s3, "fallback" === r3 ? (r4, n4) => {
          if (r4) if ("string" == typeof r4) e3(r4);
          else {
            var o4, a3 = We(t3, i3);
            Ve[s3] = a3;
            var l3 = He(s3);
            null == l3 || null == (o4 = l3.parentNode) || o4.removeChild(l3), qe(t3, a3, e3);
          }
          else e3(void 0, n4);
        } : e3);
      } else qe(t3, We(t3, i3), e3);
    } else {
      var o3 = t3.requestRouter.endpointFor("assets", "/array/" + t3.config.token + "/config.js");
      qe(t3, o3, e3);
    }
  }, v.__PosthogExtensions__.loadSiteApp = (t3, i3, e3) => {
    var r3 = t3.requestRouter.endpointFor("api", i3);
    qe(t3, r3, e3);
  };
  c.DEBUG = false, c.LIB_VERSION = "1.425.1", c.LIB_NAME = "web";
  var Ge = "$people_distinct_id";
  var Ke = "distinct_id";
  var Je = "$device_id";
  var Ye = "$device_model";
  var Qe = "__alias";
  var Xe = "__timers";
  var Ze = "$autocapture_disabled_server_side";
  var tr = "$heatmaps_enabled_server_side";
  var ir = "$exception_capture_enabled_server_side";
  var er = "$error_tracking_suppression_rules";
  var rr = "$error_tracking_capture_extension_exceptions";
  var sr = "$web_vitals_enabled_server_side";
  var nr = "$dead_clicks_enabled_server_side";
  var or = "$product_tours_enabled_server_side";
  var ar = "$logs_capture_enabled_server_side";
  var lr = "$web_vitals_allowed_metrics";
  var hr = "$session_recording_remote_config";
  var ur = "$replay_sample_rate";
  var dr = "$replay_override_sampling";
  var vr = "$replay_override_linked_flag";
  var cr = "$replay_override_url_trigger";
  var fr = "$replay_override_event_trigger";
  var pr = "$sesid";
  var _r = "$session_is_sampled";
  var gr = "$enabled_feature_flags";
  var mr = "$active_feature_flags";
  var yr = "$early_access_features";
  var br = "$feature_flag_details";
  var wr = "$feature_flag_payloads";
  var Sr = "$feature_flag_request_id";
  var xr = "$minimal_flag_called_events";
  var Er = "$override_feature_flags";
  var kr = "$override_feature_flag_payloads";
  var Tr = "$stored_person_properties";
  var $r = "$stored_group_properties";
  var Pr = "$groups";
  var Rr = "$surveys";
  var Cr = "$surveys_loaded_at";
  var Or = "$surveys_activated";
  var Ir = "$surveys_activated_session";
  var Fr = "$surveys_activated_timestamps";
  var Ar = "ph_product_tours";
  var Mr = "$flag_call_reported";
  var Dr = "$flag_call_reported_session_id";
  var Nr = "$feature_flag_errors";
  var Lr = "$feature_flag_evaluated_at";
  var jr = "$user_state";
  var Ur = "$client_session_props";
  var Br = "$capture_rate_limit";
  var zr = "$initial_campaign_params";
  var Hr = "$initial_referrer_info";
  var qr = "$initial_person_info";
  var Vr = "$epp";
  var Wr = "$posthog_cookieless";
  var Gr = "$cookieless_mode";
  var Kr = "$sdk_debug_extensions_init_method";
  var Jr = "$sdk_debug_extensions_init_time_ms";
  var Yr = "$sdk_debug_recording_script_not_loaded";
  var Qr = "PostHog loadExternalDependency extension not found.";
  var Xr = "on_reject";
  var Zr = "always";
  var ts = "anonymous";
  var is = "identified";
  var es = "identified_only";
  var rs = "visibilitychange";
  var ss = "beforeunload";
  var ns = "$pageview";
  var os = "$pageleave";
  var as = "$identify";
  var ls = "$groupidentify";
  function hs(t3, i3) {
    q(t3) && t3.forEach(i3);
  }
  function us(t3, i3) {
    if (!X(t3)) if (q(t3)) t3.forEach(i3);
    else if (et(t3)) t3.forEach(((t4, e4) => i3(t4, e4)));
    else for (var e3 in t3) z.call(t3, e3) && i3(t3[e3], e3);
  }
  var ds = function(t3) {
    for (var i3 = arguments.length, e3 = new Array(i3 > 1 ? i3 - 1 : 0), r3 = 1; i3 > r3; r3++) e3[r3 - 1] = arguments[r3];
    for (var s3 of e3) for (var n3 in s3) void 0 !== s3[n3] && (t3[n3] = s3[n3]);
    return t3;
  };
  function vs(t3) {
    for (var i3 = Object.keys(t3), e3 = i3.length, r3 = new Array(e3); e3--; ) r3[e3] = [i3[e3], t3[i3[e3]]];
    return r3;
  }
  var cs = function(t3) {
    try {
      return t3();
    } catch (t4) {
      return;
    }
  };
  var fs = function(t3) {
    return function() {
      try {
        for (var i3 = arguments.length, e3 = new Array(i3), r3 = 0; i3 > r3; r3++) e3[r3] = arguments[r3];
        return t3.apply(this, e3);
      } catch (t4) {
        Ue.critical("Implementation error. Please turn on debug mode and open a ticket on https://app.posthog.com/home#panel=support%3Asupport%3A."), Ue.critical(t4);
      }
    };
  };
  var ps = function(t3) {
    var i3 = {};
    return us(t3, (function(t4, e3) {
      (J(t4) && t4.length > 0 || Z(t4)) && (i3[e3] = t4);
    })), i3;
  };
  var _s = ["herokuapp.com", "vercel.app", "netlify.app"];
  function gs(t3) {
    var i3 = null == t3 ? void 0 : t3.hostname;
    if (!J(i3)) return false;
    var e3 = i3.split(".").slice(-2).join(".");
    for (var r3 of _s) if (e3 === r3) return false;
    return true;
  }
  function ms(t3, i3, e3, r3) {
    var s3 = null != r3 ? r3 : {}, n3 = s3.capture, o3 = s3.passive;
    null == t3 || t3.addEventListener(i3, e3, { capture: void 0 !== n3 && n3, passive: void 0 === o3 || o3 });
  }
  function ys(t3) {
    return "ph_toolbar_internal" === t3.name;
  }
  var bs = (t3) => {
    if (r) {
      try {
        for (var i3 = t3 + "=", e3 = r.cookie.split(";").filter(((t4) => t4.length)), s3 = 0; e3.length > s3; s3++) {
          for (var n3 = e3[s3]; " " == n3.charAt(0); ) n3 = n3.substring(1, n3.length);
          if (0 === n3.indexOf(i3)) return decodeURIComponent(n3.substring(i3.length, n3.length));
        }
      } catch (t4) {
      }
      return null;
    }
  };
  Math.trunc || (Math.trunc = function(t3) {
    return 0 > t3 ? Math.ceil(t3) : Math.floor(t3);
  }), Number.isInteger || (Number.isInteger = function(t3) {
    return Z(t3) && isFinite(t3) && Math.floor(t3) === t3;
  });
  var ws = class _ws {
    constructor(t3) {
      if (this.bytes = t3, 16 !== t3.length) throw new TypeError("not 128-bit length");
    }
    static fromFieldsV7(t3, i3, e3, r3) {
      if (!Number.isInteger(t3) || !Number.isInteger(i3) || !Number.isInteger(e3) || !Number.isInteger(r3) || 0 > t3 || 0 > i3 || 0 > e3 || 0 > r3 || t3 > 281474976710655 || i3 > 4095 || e3 > 1073741823 || r3 > 4294967295) throw new RangeError("invalid field value");
      var s3 = new Uint8Array(16);
      return s3[0] = t3 / Math.pow(2, 40), s3[1] = t3 / Math.pow(2, 32), s3[2] = t3 / Math.pow(2, 24), s3[3] = t3 / Math.pow(2, 16), s3[4] = t3 / 256, s3[5] = t3, s3[6] = 112 | i3 >>> 8, s3[7] = i3, s3[8] = 128 | e3 >>> 24, s3[9] = e3 >>> 16, s3[10] = e3 >>> 8, s3[11] = e3, s3[12] = r3 >>> 24, s3[13] = r3 >>> 16, s3[14] = r3 >>> 8, s3[15] = r3, new _ws(s3);
    }
    toString() {
      for (var t3 = "", i3 = 0; this.bytes.length > i3; i3++) t3 = t3 + (this.bytes[i3] >>> 4).toString(16) + (15 & this.bytes[i3]).toString(16), 3 !== i3 && 5 !== i3 && 7 !== i3 && 9 !== i3 || (t3 += "-");
      if (36 !== t3.length) throw new Error("Invalid UUIDv7 was generated");
      return t3;
    }
    clone() {
      return new _ws(this.bytes.slice(0));
    }
    equals(t3) {
      return 0 === this.compareTo(t3);
    }
    compareTo(t3) {
      for (var i3 = 0; 16 > i3; i3++) {
        var e3 = this.bytes[i3] - t3.bytes[i3];
        if (0 !== e3) return Math.sign(e3);
      }
      return 0;
    }
  };
  var Ss = class {
    generate() {
      var t3 = this.generateOrAbort();
      if (!K(t3)) return t3;
      this.Kr = 0;
      var i3 = this.generateOrAbort();
      if (K(i3)) throw new Error("Could not generate UUID after timestamp reset");
      return i3;
    }
    generateOrAbort() {
      var t3 = Date.now();
      if (t3 > this.Kr) this.Kr = t3, this.Xr();
      else {
        if (this.Kr >= t3 + 1e4) return;
        this.ei++, this.ei > 4398046511103 && (this.Kr++, this.Xr());
      }
      return ws.fromFieldsV7(this.Kr, Math.trunc(this.ei / Math.pow(2, 30)), this.ei & Math.pow(2, 30) - 1, this.ti.nextUint32());
    }
    Xr() {
      this.ei = 1024 * this.ti.nextUint32() + (1023 & this.ti.nextUint32());
    }
    constructor() {
      this.Kr = 0, this.ei = 0, this.ti = new ks();
    }
  };
  var xs;
  var Es = (t3) => {
    if ("undefined" != typeof UUIDV7_DENY_WEAK_RNG && UUIDV7_DENY_WEAK_RNG) throw new Error("no cryptographically strong RNG available");
    for (var i3 = 0; t3.length > i3; i3++) t3[i3] = 65536 * Math.trunc(65536 * Math.random()) + Math.trunc(65536 * Math.random());
    return t3;
  };
  t && !K(t.crypto) && crypto.getRandomValues && (Es = (t3) => crypto.getRandomValues(t3));
  var ks = class {
    nextUint32() {
      return this.Pt.length > this.ri || (Es(this.Pt), this.ri = 0), this.Pt[this.ri++];
    }
    constructor() {
      this.Pt = new Uint32Array(8), this.ri = 1 / 0;
    }
  };
  var Ts = () => $s().toString();
  var $s = () => (xs || (xs = new Ss())).generate();
  var Ps = "";
  var Rs = /[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i;
  var Cs = null;
  var Os = { ii() {
    if (!Q(Cs)) return Cs;
    if (Cs = false, r) try {
      var t3 = "__ph_cookie_support_" + Ts();
      Os.ni(t3, "xyz"), Cs = '"xyz"' === bs(t3), Os.oi(t3);
    } catch (t4) {
      Cs = false;
    }
    return Cs;
  }, si(t3) {
    Ue.error("cookieStore error: " + t3);
  }, ai: bs, ui(t3) {
    var i3;
    try {
      i3 = JSON.parse(Os.ai(t3)) || {};
    } catch (t4) {
    }
    return i3;
  }, ni(t3, i3, e3, s3, n3) {
    if (!r) return false;
    try {
      var o3 = "", a3 = "", l3 = (function(t4, i4) {
        if (i4) {
          var e4 = (function(t5, i5) {
            if (void 0 === i5 && (i5 = r), Ps) return Ps;
            if (!i5) return "";
            if (["localhost", "127.0.0.1"].includes(t5)) return "";
            for (var e5 = t5.split("."), s5 = Math.min(e5.length, 8), n4 = "dmn_chk_" + Ts(); !Ps && s5--; ) {
              var o4 = e5.slice(s5).join("."), a4 = n4 + "=1;domain=." + o4 + ";path=/";
              i5.cookie = a4 + ";max-age=3", i5.cookie.includes(n4) && (i5.cookie = a4 + ";max-age=0", Ps = o4);
            }
            return Ps;
          })(t4);
          if (!e4) {
            var s4 = ((t5) => {
              var i5 = t5.match(Rs);
              return i5 ? i5[0] : "";
            })(t4);
            s4 !== e4 && Ue.info("Warning: cookie subdomain discovery mismatch", s4, e4), e4 = s4;
          }
          return e4 ? "; domain=." + e4 : "";
        }
        return "";
      })(r.location.hostname, s3);
      if (e3) {
        var h3 = /* @__PURE__ */ new Date();
        h3.setTime(h3.getTime() + 864e5 * e3), o3 = "; expires=" + h3.toUTCString();
      }
      n3 && (a3 = "; secure");
      var u3 = t3 + "=" + encodeURIComponent(JSON.stringify(i3)) + o3 + "; SameSite=Lax; path=/" + l3 + a3;
      return u3.length > 3686.4 && Ue.warn("cookieStore warning: large cookie, len=" + u3.length), r.cookie = u3, true;
    } catch (t4) {
      return false;
    }
  }, oi(t3, i3) {
    if (null != r && r.cookie) try {
      Os.ni(t3, "", -1, i3);
    } catch (t4) {
      return;
    }
  } };
  var Is = null;
  var Fs = { ii() {
    if (!Q(Is)) return Is;
    var i3 = true;
    if (K(t)) i3 = false;
    else try {
      var e3 = "__mplssupport__";
      Fs.ni(e3, "xyz"), '"xyz"' !== Fs.ai(e3) && (i3 = false), Fs.oi(e3);
    } catch (t3) {
      i3 = false;
    }
    return i3 || Ue.error("localStorage unsupported; falling back to cookie store"), Is = i3, i3;
  }, si(t3) {
    Ue.error("localStorage error: " + t3);
  }, ai(i3) {
    try {
      return null == t ? void 0 : t.localStorage.getItem(i3);
    } catch (t3) {
      Fs.si(t3);
    }
    return null;
  }, ui(t3) {
    try {
      return JSON.parse(Fs.ai(t3)) || {};
    } catch (t4) {
    }
    return null;
  }, ni(i3, e3) {
    try {
      return null == t || t.localStorage.setItem(i3, JSON.stringify(e3)), true;
    } catch (t3) {
      Fs.si(t3);
    }
    return false;
  }, oi(i3) {
    try {
      null == t || t.localStorage.removeItem(i3);
    } catch (t3) {
      Fs.si(t3);
    }
  } };
  var As = [Tr, mr, gr, br, wr, Sr, Lr, Nr, Mr];
  var Ms = [Je, Ke, pr, _r, Vr, qr, jr];
  var Ds = (t3) => t3 + "_cpm";
  var Ns = ["__proto__", "constructor", "prototype"];
  var Ls = (t3) => {
    if (!W(t3)) return {};
    var i3 = {};
    return Object.keys(t3).forEach(((e3) => {
      -1 === Ns.indexOf(e3) && (i3[e3] = t3[e3]);
    })), i3;
  };
  var js = function(t3, i3) {
    void 0 === i3 && (i3 = []);
    var e3 = {};
    return [...Ms, ...i3].forEach(((i4) => {
      var r3 = t3[i4];
      K(r3) || Q(r3) || "" === r3 || (e3[i4] = r3);
    })), e3;
  };
  var Us = (t3) => {
    for (var i3 = 5381, e3 = 2166136261, r3 = 0; t3.length > r3; r3++) {
      var s3 = t3.charCodeAt(r3);
      i3 = 33 * i3 ^ s3, e3 = Math.imul(e3 ^ s3, 16777619);
    }
    return t3.length.toString(36) + "." + (i3 >>> 0).toString(36) + "." + (e3 >>> 0).toString(36);
  };
  var Bs = (t3, i3) => ({ p: i3, f: Us(JSON.stringify(t3)) });
  var zs = (t3, i3) => {
    if (!i3) return { properties: [], isValid: false };
    try {
      var e3 = Os.ui(Ds(t3)), r3 = (null == e3 ? void 0 : e3.f) === Us(i3) && q(e3.p);
      return { properties: r3 ? e3.p : [], isValid: r3 };
    } catch (t4) {
      return { properties: [], isValid: false };
    }
  };
  var Hs = (t3, i3) => i3 + "|" + (Os.ai(Ds(t3)) || "");
  var qs = {};
  var Vs = { ii: () => true, si(t3) {
    Ue.error("memoryStorage error: " + t3);
  }, ai: (t3) => t3 in qs ? qs[t3] : null, ui: (t3) => t3 in qs ? qs[t3] : null, ni: (t3, i3) => (qs[t3] = i3, true), oi(t3) {
    delete qs[t3];
  } };
  var Ws = null;
  var Gs = { ii() {
    if (!Q(Ws)) return Ws;
    if (Ws = true, K(t)) Ws = false;
    else try {
      var i3 = "__support__";
      Gs.ni(i3, "xyz"), '"xyz"' !== Gs.ai(i3) && (Ws = false), Gs.oi(i3);
    } catch (t3) {
      Ws = false;
    }
    return Ws;
  }, si(t3) {
    Ue.error("sessionStorage error: ", t3);
  }, ai(i3) {
    try {
      return null == t ? void 0 : t.sessionStorage.getItem(i3);
    } catch (t3) {
      Gs.si(t3);
    }
    return null;
  }, ui(t3) {
    try {
      return JSON.parse(Gs.ai(t3)) || null;
    } catch (t4) {
    }
    return null;
  }, ni(i3, e3) {
    try {
      return null == t || t.sessionStorage.setItem(i3, JSON.stringify(e3)), true;
    } catch (t3) {
      Gs.si(t3);
    }
    return false;
  }, oi(i3) {
    try {
      null == t || t.sessionStorage.removeItem(i3);
    } catch (t3) {
      Gs.si(t3);
    }
  } };
  var Ks = class {
    constructor(t3) {
      this._instance = t3;
    }
    get mn() {
      return this._instance.config;
    }
    get consent() {
      return this.Vs() ? 0 : this.Gs;
    }
    isOptedOut() {
      return this.mn.cookieless_mode === Zr || this.isRejected() || -1 === this.consent && this.mn.cookieless_mode === Xr;
    }
    isOptedIn() {
      return !this.isOptedOut();
    }
    isExplicitlyOptedOut() {
      return 0 === this.consent;
    }
    isRejected() {
      return 0 === this.consent || -1 === this.consent && this.mn.opt_out_capturing_by_default;
    }
    optInOut(t3) {
      this.Zs.ni(this.Qs, t3 ? 1 : 0, this.mn.cookie_expiration, this.mn.cross_subdomain_cookie, this.mn.secure_cookie);
    }
    reset() {
      this.Zs.oi(this.Qs, this.mn.cross_subdomain_cookie);
    }
    get Qs() {
      var t3 = this._instance.config, i3 = t3.token, e3 = t3.opt_out_capturing_cookie_prefix;
      return t3.consent_persistence_name || (e3 ? e3 + i3 : "__ph_opt_in_out_" + i3);
    }
    get Gs() {
      var t3 = this.Zs.ai(this.Qs);
      return dt(t3) ? 1 : N(vt, t3) ? 0 : -1;
    }
    get Zs() {
      var t3 = this.mn.opt_out_capturing_persistence_type, i3 = "localStorage" === t3 ? Fs : Os, e3 = i3.ii() ? i3 : Vs;
      if (!this.Js || this.Js !== e3) {
        this.Js = e3;
        var r3 = "localStorage" === t3 ? Os : Fs;
        r3.ai(this.Qs) && (this.Js.ai(this.Qs) || this.optInOut(dt(r3.ai(this.Qs))), r3.oi(this.Qs, this.mn.cross_subdomain_cookie));
      }
      return this.Js;
    }
    Vs() {
      return !!this.mn.respect_dnt && [null == e ? void 0 : e.doNotTrack, null == e ? void 0 : e.msDoNotTrack, v.doNotTrack, null == e ? void 0 : e.globalPrivacyControl].some(((t3) => dt(t3)));
    }
  };
  function Js(t3, i3) {
    var e3, r3 = null == t3 || null == (e3 = t3.config) ? void 0 : e3.get_current_url;
    if (!V(r3)) return i3;
    try {
      var s3 = r3(i3);
      return J(s3) && s3 ? s3 : i3;
    } catch (t4) {
      return Ue.error("Error in get_current_url, falling back to window.location.href", t4), i3;
    }
  }
  var Ys = "__POSTHOG_TOOLBAR__";
  var Qs = 1;
  var Xs = 3;
  var Zs = 11;
  function tn(t3) {
    return t3 instanceof Element && (t3.id === Ys || !(null == t3.closest || !t3.closest(".toolbar-global-fade-container")));
  }
  function en(t3) {
    return !!t3 && t3.nodeType === Qs;
  }
  function rn(t3, i3) {
    return !!t3 && !!t3.tagName && t3.tagName.toLowerCase() === i3.toLowerCase();
  }
  function sn(t3) {
    return !!t3 && t3.nodeType === Xs;
  }
  function nn(t3) {
    return !!t3 && t3.nodeType === Zs && en(t3.host);
  }
  var on = 1e3;
  function an(t3) {
    return t3 ? L(t3).split(/\s+/) : [];
  }
  function ln(i3, e3) {
    var r3 = (function(i4) {
      var e4, r4 = null == t || null == (e4 = t.location) ? void 0 : e4.href;
      return K(r4) ? void 0 : Js(i4, r4);
    })(e3);
    return !!(r3 && i3 && i3.some(((t3) => r3.match(t3))));
  }
  function hn(t3) {
    var i3 = "";
    switch (typeof t3.className) {
      case "string":
        i3 = t3.className;
        break;
      case "object":
        i3 = (t3.className && "baseVal" in t3.className ? t3.className.baseVal : null) || t3.getAttribute("class") || "";
        break;
      default:
        i3 = "";
    }
    return an(i3);
  }
  function un(t3) {
    return X(t3) ? null : L(t3).split(/(\s+)/).filter(((t4) => An(t4))).join("").replace(/[\r\n]/g, " ").replace(/[ ]+/g, " ").substring(0, 255);
  }
  function dn(t3) {
    var i3 = "";
    return kn(t3) && !Tn(t3) && t3.childNodes && t3.childNodes.length && us(t3.childNodes, (function(t4) {
      var e3;
      sn(t4) && t4.textContent && (i3 += null !== (e3 = un(t4.textContent)) && void 0 !== e3 ? e3 : "");
    })), L(i3);
  }
  function vn(t3) {
    var i3;
    return K(t3.target) ? t3.srcElement || null : null != (i3 = t3.target) && i3.shadowRoot ? t3.composedPath()[0] || null : t3.target || null;
  }
  var cn = ["a", "button", "form", "input", "select", "textarea", "label"];
  function fn(t3, i3) {
    if (K(i3)) return true;
    var e3, r3 = function(t4) {
      if (i3.some(((i4) => (function(t5, i5) {
        var e4 = t5.matches || t5.matchesSelector || t5.msMatchesSelector || t5.mozMatchesSelector || t5.webkitMatchesSelector || t5.oMatchesSelector;
        try {
          return !!e4 && e4.call(t5, i5);
        } catch (t6) {
          return false;
        }
      })(t4, i4)))) return { v: true };
    };
    for (var s3 of t3) if (e3 = r3(s3)) return e3.v;
    return false;
  }
  function pn(t3) {
    var i3 = t3.parentNode;
    return !(!i3 || !en(i3)) && i3;
  }
  var _n = [".ph-no-autocapture", "[data-ph-no-autocapture]"];
  var gn = ["next", "previous", "prev", ">", "<"];
  var mn = [...gn, "+", "-", "\u2212", "\u2013"];
  var yn = (t3, i3) => /[a-z0-9]/i.test(i3) ? t3.includes(i3) : t3 === i3;
  var bn = [".ph-no-rageclick", ".ph-no-capture"];
  var wn = ["", "text", "search", "email", "password", "url", "tel", "number"];
  function Sn(i3, e3) {
    if (!t || xn(i3)) return false;
    var r3, s3, n3, o3, a3;
    if (it(e3) ? (r3 = !!e3 && bn, s3 = void 0, n3 = false) : (r3 = null !== (o3 = null == e3 ? void 0 : e3.css_selector_ignorelist) && void 0 !== o3 ? o3 : bn, s3 = null == e3 ? void 0 : e3.content_ignorelist, n3 = null !== (a3 = null == e3 ? void 0 : e3.ignore_text_selection) && void 0 !== a3 && a3), false === r3) return false;
    if (n3 && (function(t3) {
      return !(!t3 || !en(t3)) && (!!rn(t3, "textarea") || (rn(t3, "input") ? N(wn, (t3.getAttribute("type") || "").toLowerCase()) : (function(t4) {
        if (t4.isContentEditable) return true;
        var i4 = null == t4.getAttribute ? void 0 : t4.getAttribute("contenteditable");
        return "true" === i4 || "" === i4;
      })(t3)));
    })(i3)) return false;
    var l3 = En(i3, false).targetElementList;
    return !(function(t3, i4) {
      if (false === t3 || K(t3)) return false;
      var e4;
      if (true === t3) e4 = gn;
      else {
        if (!q(t3)) return false;
        if (t3.length > 10) return Ue.error("[PostHog] content_ignorelist array cannot exceed 10 items. Use css_selector_ignorelist for more complex matching."), false;
        e4 = t3.map(((t4) => t4.toLowerCase()));
      }
      return i4.some(((t4) => {
        var i5 = t4.safeText, r4 = t4.ariaLabel;
        return e4.some(((t5) => yn(i5, t5) || yn(r4, t5)));
      }));
    })(s3, l3.map(((t3) => {
      var i4;
      return { safeText: dn(t3).toLowerCase(), ariaLabel: (null == (i4 = t3.getAttribute("aria-label")) ? void 0 : i4.toLowerCase().trim()) || "" };
    }))) && !fn(l3, r3);
  }
  var xn = (t3) => !t3 || rn(t3, "html") || !en(t3);
  var En = (i3, e3) => {
    if (!t || xn(i3)) return { parentIsUsefulElement: false, targetElementList: [] };
    for (var r3 = false, s3 = [i3], n3 = i3; n3.parentNode && !rn(n3, "body"); ) if (nn(n3.parentNode)) s3.push(n3.parentNode.host), n3 = n3.parentNode.host;
    else {
      var o3 = pn(n3);
      if (!o3) break;
      if (e3 || cn.indexOf(o3.tagName.toLowerCase()) > -1) r3 = true;
      else try {
        var a3 = t.getComputedStyle(o3);
        a3 && "pointer" === a3.getPropertyValue("cursor") && (r3 = true);
      } catch (t3) {
      }
      s3.push(o3), n3 = o3;
    }
    return { parentIsUsefulElement: r3, targetElementList: s3 };
  };
  function kn(t3) {
    for (var i3 = /* @__PURE__ */ new Set(), e3 = 0, r3 = t3; r3.parentNode && !rn(r3, "body"); r3 = r3.parentNode) {
      if (e3++ >= on || i3.has(r3)) return false;
      i3.add(r3);
      var s3 = hn(r3);
      if (N(s3, "ph-sensitive") || N(s3, "ph-no-capture")) return false;
    }
    if (N(hn(t3), "ph-include")) return true;
    var n3 = t3.type || "";
    if (J(n3)) switch (n3.toLowerCase()) {
      case "hidden":
      case "password":
        return false;
    }
    var o3 = t3.name || t3.id || "";
    return !J(o3) || !/^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i.test(o3.replace(/[^a-zA-Z0-9]/g, ""));
  }
  function Tn(t3) {
    return !!(rn(t3, "input") && !["button", "checkbox", "submit", "reset"].includes(t3.type) || rn(t3, "select") || rn(t3, "textarea") || "true" === t3.getAttribute("contenteditable"));
  }
  var $n = new RegExp("^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$");
  var Pn = /(^|[^0-9A-Za-z_])([0-9][0-9 -]*[0-9])(?=$|[^0-9A-Za-z_])/g;
  var Rn = [16, 15, 14, 13];
  var Cn = new RegExp("^(\\d{3}-?\\d{2}-?\\d{4})$");
  var On = new RegExp("(^|[^0-9])((?!000|666)[0-9]{3}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4})(?=$|([^0-9]))", "g");
  var In = /[0-9A-Za-z_]/;
  function Fn(t3) {
    for (var i3 = 0, e3 = false, r3 = t3.length - 1; r3 >= 0; r3--) {
      var s3 = t3.charCodeAt(r3) - 48;
      e3 && (s3 *= 2) > 9 && (s3 -= 9), i3 += s3, e3 = !e3;
    }
    return i3 % 10 == 0;
  }
  function An(t3, i3) {
    if (void 0 === i3 && (i3 = true), X(t3)) return false;
    if (J(t3)) {
      t3 = L(t3);
      var e3 = i3 ? $n.test((t3 || "").replace(/[- ]/g, "")) : (function(t4) {
        var i4;
        for (Pn.lastIndex = 0; i4 = Pn.exec(t4); ) {
          var e4 = i4[2];
          if (e4) for (var r4 = e4.replace(/[- ]/g, ""), s3 = 0; r4.length > s3; s3++) for (var n3 of Rn) {
            var o3 = s3 + n3;
            if (r4.length >= o3) {
              var a3 = r4.slice(s3, o3);
              if ($n.test(a3) && Fn(a3)) return true;
            }
          }
        }
        return false;
      })(t3);
      if (e3) return false;
      var r3 = i3 ? Cn.test(t3) : (function(t4) {
        var i4;
        for (On.lastIndex = 0; i4 = On.exec(t4); ) {
          var e4 = i4[1], r4 = i4[3];
          if (!(e4 && r4 && In.test(e4) && In.test(r4))) return true;
        }
        return false;
      })(t3);
      if (r3) return false;
    }
    return true;
  }
  function Mn(t3) {
    var i3 = dn(t3);
    return An(i3 = (i3 + " " + Dn(t3)).trim()) ? i3 : "";
  }
  function Dn(t3) {
    var i3 = "";
    return t3 && t3.childNodes && t3.childNodes.length && us(t3.childNodes, (function(t4) {
      var e3;
      if (t4 && "span" === (null == (e3 = t4.tagName) ? void 0 : e3.toLowerCase())) try {
        var r3 = dn(t4);
        i3 = (i3 + " " + r3).trim(), t4.childNodes && t4.childNodes.length && (i3 = (i3 + " " + Dn(t4)).trim());
      } catch (t5) {
        Ue.error("[AutoCapture]", t5);
      }
    })), i3;
  }
  function Nn(t3) {
    return t3.replace(/"|\\"/g, '\\"');
  }
  function Ln(t3) {
    var i3 = t3.attr__class;
    if (i3) return q(i3) ? i3 : an(i3);
  }
  var jn = Be("[Dead Clicks]");
  var Un = () => true;
  var Bn = (t3) => {
    var i3, e3 = !(null == (i3 = t3.instance.persistence) || !i3.get_property(nr)), r3 = t3.instance.config.capture_dead_clicks;
    return it(r3) ? r3 : !!W(r3) || e3;
  };
  var zn = class {
    get lazyLoadedDeadClicksAutocapture() {
      return this.Ks;
    }
    constructor(t3, i3, e3) {
      this.instance = t3, this.isEnabled = i3, this.onCapture = e3, this.startIfEnabledOrStop();
    }
    onRemoteConfig(t3) {
      if (t3.ok) {
        var i3 = t3.config;
        "captureDeadClicks" in i3 && (this.instance.persistence && this.instance.persistence.register({ [nr]: i3.captureDeadClicks }), this.startIfEnabledOrStop());
      }
    }
    startIfEnabledOrStop() {
      this.isEnabled(this) ? this.Ys((() => {
        this.Xs();
      })) : this.stop();
    }
    Ys(t3) {
      var i3, e3;
      null != (i3 = v.__PosthogExtensions__) && i3.initDeadClicksAutocapture ? t3() : null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this.instance, "dead-clicks-autocapture", ((i4) => {
        i4 ? jn.error("failed to load script", i4) : t3();
      }));
    }
    Xs() {
      var t3;
      if (r) {
        if (!this.Ks && null != (t3 = v.__PosthogExtensions__) && t3.initDeadClicksAutocapture) {
          var i3 = W(this.instance.config.capture_dead_clicks) ? _({}, this.instance.config.capture_dead_clicks) : {};
          i3.__onCapture = this.onCapture, this.onCapture && (i3.capture_dead_swipes = false), this.Ks = v.__PosthogExtensions__.initDeadClicksAutocapture(this.instance, i3), this.Ks.start(r), jn.info("starting...");
        }
      } else jn.error("`document` not found. Cannot start.");
    }
    stop() {
      this.Ks && (this.Ks.stop(), this.Ks = void 0, jn.info("stopping..."));
    }
  };
  var Hn = Be("[SegmentIntegration]");
  var qn = "posthog-js";
  function Vn(t3, i3) {
    var e3 = void 0 === i3 ? {} : i3, r3 = e3.organization, s3 = e3.projectId, n3 = e3.prefix, o3 = e3.severityAllowList, a3 = void 0 === o3 ? ["error"] : o3, l3 = e3.sendExceptionsToPostHog, h3 = void 0 === l3 || l3;
    return (i4) => {
      var e4, o4, l4, u3, d3;
      if ("*" !== a3 && !a3.includes(i4.level) || !t3.__loaded) return i4;
      i4.tags || (i4.tags = {});
      var v3 = t3.requestRouter.endpointFor("ui", "/project/" + t3.config.token + "/person/" + t3.get_distinct_id());
      i4.tags["PostHog Person URL"] = v3, t3.sessionRecordingStarted() && (i4.tags["PostHog Recording URL"] = t3.get_session_replay_url({ withTimestamp: true }));
      var c3, f3 = (null == (e4 = i4.exception) ? void 0 : e4.values) || [], p3 = f3.map(((t4) => _({}, t4, { stacktrace: t4.stacktrace ? _({}, t4.stacktrace, { type: "raw", frames: (t4.stacktrace.frames || []).map(((t5) => _({}, t5, { platform: "web:javascript" }))) }) : void 0 }))), g3 = { $exception_message: (null == (o4 = f3[0]) ? void 0 : o4.value) || i4.message, $exception_type: null == (l4 = f3[0]) ? void 0 : l4.type, $exception_level: i4.level, $exception_list: p3, $sentry_event_id: i4.event_id, $sentry_exception: i4.exception, $sentry_exception_message: (null == (u3 = f3[0]) ? void 0 : u3.value) || i4.message, $sentry_exception_type: null == (d3 = f3[0]) ? void 0 : d3.type, $sentry_tags: i4.tags };
      return r3 && s3 && (g3.$sentry_url = (n3 || "https://sentry.io/organizations/") + r3 + "/issues/?project=" + s3 + "&query=" + i4.event_id), h3 && (null == (c3 = t3.exceptions) || c3.sendExceptionEvent(g3)), i4;
    };
  }
  var Wn = class {
    constructor(t3, i3, e3, r3, s3, n3) {
      this.name = qn, this.setupOnce = function(o3) {
        o3(Vn(t3, { organization: i3, projectId: e3, prefix: r3, severityAllowList: s3, sendExceptionsToPostHog: null == n3 || n3 }));
      };
    }
  };
  var Gn = class {
    constructor(t3) {
      this.ta = (t4, i3, e3) => {
        e3 && (e3.noSessionId || e3.activityTimeout || e3.sessionPastMaximumLength || e3.crossTabAdoption) && (Ue.info("[PageViewManager] Session rotated, clearing pageview state", { sessionId: t4, changeReason: e3 }), this.ea = void 0, this._instance.scrollManager.resetContext());
      }, this._instance = t3, this.ia();
    }
    ia() {
      var t3;
      this.ra = null == (t3 = this._instance.sessionManager) ? void 0 : t3.onSessionId(this.ta);
    }
    destroy() {
      var t3;
      null == (t3 = this.ra) || t3.call(this), this.ra = void 0;
    }
    doPageView(i3, e3) {
      var r3, s3 = this.na(i3, e3);
      return this.ea = { pathname: null !== (r3 = null == t ? void 0 : t.location.pathname) && void 0 !== r3 ? r3 : "", pageViewId: e3, timestamp: i3 }, this._instance.scrollManager.resetContext(), s3;
    }
    doPageLeave(t3) {
      var i3;
      return this.na(t3, null == (i3 = this.ea) ? void 0 : i3.pageViewId);
    }
    doEvent() {
      var t3;
      return { $pageview_id: null == (t3 = this.ea) ? void 0 : t3.pageViewId };
    }
    na(t3, i3) {
      var e3 = this.ea;
      if (!e3) return { $pageview_id: i3 };
      var r3 = { $pageview_id: i3, $prev_pageview_id: e3.pageViewId }, s3 = this._instance.scrollManager.getContext();
      if (s3 && !this._instance.config.disable_scroll_properties) {
        var n3 = s3.maxScrollHeight, o3 = s3.lastScrollY, a3 = s3.maxScrollY, l3 = s3.maxContentHeight, h3 = s3.lastContentY, u3 = s3.maxContentY;
        if (!(K(n3) || K(o3) || K(a3) || K(l3) || K(h3) || K(u3))) {
          n3 = Math.ceil(n3), o3 = Math.ceil(o3), a3 = Math.ceil(a3), l3 = Math.ceil(l3), h3 = Math.ceil(h3), u3 = Math.ceil(u3);
          var d3 = n3 > 1 ? ct(o3 / n3, 0, 1, Ue) : 1, v3 = n3 > 1 ? ct(a3 / n3, 0, 1, Ue) : 1, c3 = l3 > 1 ? ct(h3 / l3, 0, 1, Ue) : 1, f3 = l3 > 1 ? ct(u3 / l3, 0, 1, Ue) : 1;
          r3 = ds(r3, { $prev_pageview_last_scroll: o3, $prev_pageview_last_scroll_percentage: d3, $prev_pageview_max_scroll: a3, $prev_pageview_max_scroll_percentage: v3, $prev_pageview_last_content: h3, $prev_pageview_last_content_percentage: c3, $prev_pageview_max_content: u3, $prev_pageview_max_content_percentage: f3 });
        }
      }
      return e3.pathname && (r3.$prev_pageview_pathname = e3.pathname), e3.timestamp && (r3.$prev_pageview_duration = (t3.getTime() - e3.timestamp.getTime()) / 1e3), r3;
    }
  };
  var Kn = ["flags", "surveys"];
  var Jn = { [Ge]: { exposure: "hidden" }, [Qe]: { exposure: "hidden" }, __cmpns: { exposure: "hidden" }, [Xe]: { exposure: "hidden" }, [Ze]: { exposure: "event" }, [tr]: { exposure: "hidden" }, [ar]: { exposure: "hidden" }, [ir]: { exposure: "event" }, [er]: { exposure: "hidden" }, [rr]: { exposure: "event" }, [sr]: { exposure: "event" }, [nr]: { exposure: "event" }, [or]: { exposure: "hidden" }, [lr]: { exposure: "event" }, [hr]: { exposure: "hidden" }, $session_recording_enabled_server_side: { exposure: "hidden" }, [pr]: { exposure: "hidden" }, [_r]: { exposure: "event" }, [ur]: { exposure: "event", shouldSkipFromEventProperties: (t3) => Q(t3) }, $session_past_minimum_duration: { exposure: "event" }, $session_recording_url_trigger_activated_session: { exposure: "event" }, $session_recording_event_trigger_activated_session: { exposure: "event" }, $debug_first_full_snapshot_timestamp: { exposure: "event" }, $sess_rec_flush_size: { exposure: "hidden" }, [gr]: { exposure: "hidden", storageGroup: "flags" }, [mr]: { exposure: "hidden", storageGroup: "flags" }, [yr]: { exposure: "hidden" }, [br]: { exposure: "hidden", storageGroup: "flags" }, [wr]: { exposure: "hidden", storageGroup: "flags" }, [Sr]: { exposure: "hidden", storageGroup: "flags", volatile: true }, [xr]: { exposure: "hidden", storageGroup: "flags" }, [Er]: { exposure: "hidden" }, [kr]: { exposure: "hidden" }, [Tr]: { exposure: "hidden" }, [$r]: { exposure: "hidden" }, [Rr]: { exposure: "hidden", storageGroup: "surveys" }, [Cr]: { exposure: "hidden", storageGroup: "surveys", volatile: true }, [Or]: { exposure: "event" }, [Ir]: { exposure: "hidden" }, [Fr]: { exposure: "hidden" }, [Ar]: { exposure: "hidden" }, $product_tours_activated: { exposure: "hidden" }, $product_tours_activated_session: { exposure: "hidden" }, $conversations_widget_session_id: { exposure: "event" }, $conversations_ticket_id: { exposure: "event" }, $conversations_widget_state: { exposure: "event" }, $conversations_user_traits: { exposure: "event" }, [Mr]: { exposure: "hidden" }, [Dr]: { exposure: "hidden" }, [Pr]: { exposure: "event" }, [Nr]: { exposure: "hidden" }, [Lr]: { exposure: "hidden", storageGroup: "flags", volatile: true }, [jr]: { exposure: "hidden" }, [Ur]: { exposure: "hidden" }, [Br]: { exposure: "hidden" }, [zr]: { exposure: "hidden" }, [Hr]: { exposure: "hidden" }, [qr]: { exposure: "hidden" }, [Vr]: { exposure: "hidden" }, [dr]: { exposure: "event" }, [vr]: { exposure: "event" }, [cr]: { exposure: "event" }, [fr]: { exposure: "event" }, [Kr]: { exposure: "event" }, [Jr]: { exposure: "event" }, [Yr]: { exposure: "event" }, $sdk_debug_replay_event_trigger_status: { exposure: "event" }, $sdk_debug_replay_linked_flag_trigger_status: { exposure: "event" }, $sdk_debug_replay_matched_recording_trigger_groups: { exposure: "event" }, $sdk_debug_replay_pending_trigger_conditions: { exposure: "event" }, $sdk_debug_replay_remote_trigger_matching_config: { exposure: "event" }, $sdk_debug_replay_trigger_groups_count: { exposure: "event" }, $sdk_debug_replay_url_trigger_status: { exposure: "event" }, $session_recording_start_reason: { exposure: "event" } };
  var Yn = [["$posthog_sr_group_event_trigger_", { exposure: "hidden" }], ["$posthog_sr_group_url_trigger_", { exposure: "hidden" }], ["$posthog_sr_group_sampling_", { exposure: "hidden" }]];
  var Qn = (t3) => {
    var i3 = Jn[t3];
    if (i3) return i3;
    for (var e3 of Yn) {
      var r3 = e3[1];
      if (0 === t3.indexOf(e3[0])) return r3;
    }
  };
  var Xn = (t3, i3) => {
    try {
      return JSON.stringify(t3, ((t4, i4) => "bigint" == typeof i4 ? i4.toString() : i4), i3);
    } catch (i4) {
      return U(t3);
    }
  };
  var Zn = (t3) => {
    var i3 = null == r ? void 0 : r.createElement("a");
    return K(i3) ? null : (i3.href = t3, i3);
  };
  var to = function(t3, i3) {
    for (var e3, r3 = ((t3.split("#")[0] || "").split(/\?(.*)/)[1] || "").replace(/^\?+/g, "").split("&"), s3 = 0; r3.length > s3; s3++) {
      var n3 = r3[s3].split("=");
      if (n3[0] === i3) {
        e3 = n3;
        break;
      }
    }
    if (!q(e3) || 2 > e3.length) return "";
    var o3 = e3[1];
    try {
      o3 = decodeURIComponent(o3);
    } catch (t4) {
      Ue.error("Skipping decoding for malformed query param: " + o3);
    }
    return o3.replace(/\+/g, " ");
  };
  var io = function(t3, i3, e3) {
    if (!t3 || !i3 || !i3.length) return t3;
    for (var r3 = t3.split("#"), s3 = r3[1], n3 = (r3[0] || "").split("?"), o3 = n3[1], a3 = n3[0], l3 = (o3 || "").split("&"), h3 = [], u3 = 0; l3.length > u3; u3++) {
      var d3 = l3[u3].split("=");
      q(d3) && (i3.includes(d3[0]) ? h3.push(d3[0] + "=" + e3) : h3.push(l3[u3]));
    }
    var v3 = a3;
    return null != o3 && (v3 += "?" + h3.join("&")), null != s3 && (v3 += "#" + s3), v3;
  };
  var eo = function(t3, i3) {
    var e3 = t3.match(new RegExp(i3 + "=([^&]*)"));
    return e3 ? e3[1] : null;
  };
  var ro = (t3, i3) => t3 >= i3 && u();
  var so = (t3, i3, e3, r3) => {
    if (0 === t3) {
      if (u()) {
        var s3 = i3 + 1;
        return s3 === e3 && r3(), s3;
      }
      return i3;
    }
    return 0;
  };
  var no = "https?://(.*)";
  var oo = ["gclid", "gclsrc", "dclid", "gbraid", "wbraid", "fbclid", "msclkid", "twclid", "li_fat_id", "igshid", "ttclid", "rdt_cid", "epik", "qclid", "sccid", "irclid", "_kx"];
  var ao = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gad_source", "mc_cid", ...oo];
  var lo = "<masked>";
  var ho = ["li_fat_id"];
  function uo(t3, i3, e3) {
    if (!r) return {};
    var s3, n3 = i3 ? [...oo, ...e3 || []] : [], o3 = vo(io(r.URL, n3, lo), t3), a3 = (s3 = {}, us(ho, (function(t4) {
      var i4 = bs(t4);
      s3[t4] = i4 || null;
    })), s3);
    return ds(a3, o3);
  }
  function vo(t3, i3) {
    var e3 = ao.concat(i3 || []), r3 = {};
    return us(e3, (function(i4) {
      var e4 = to(t3, i4);
      r3[i4] = e4 || null;
    })), r3;
  }
  function co(t3) {
    var i3 = (function(t4) {
      return t4 ? 0 === t4.search(no + "google.([^/?]*)") ? "google" : 0 === t4.search(no + "bing.com") ? "bing" : 0 === t4.search(no + "yahoo.com") ? "yahoo" : 0 === t4.search(no + "duckduckgo.com") ? "duckduckgo" : null : null;
    })(t3), e3 = "yahoo" != i3 ? "q" : "p", s3 = {};
    if (!Q(i3)) {
      s3.$search_engine = i3;
      var n3 = r ? to(r.referrer, e3) : "";
      n3.length && (s3.ph_keyword = n3);
    }
    return s3;
  }
  function fo() {
    return navigator.language || navigator.userLanguage;
  }
  var po = "$direct";
  function _o() {
    return (null == r ? void 0 : r.referrer) || po;
  }
  function go(t3, i3, e3) {
    void 0 === e3 && (e3 = false);
    var r3 = t3 ? [...oo, ...i3 || []] : [], n3 = e3 ? $i(null == s ? void 0 : s.href) : null == s ? void 0 : s.href, o3 = null == n3 ? void 0 : n3.substring(0, 1e3);
    return { r: _o().substring(0, 1e3), u: o3 ? io(o3, r3, lo) : void 0 };
  }
  function mo(t3, i3) {
    var e3;
    void 0 === i3 && (i3 = false);
    var r3 = t3.r, s3 = t3.u, n3 = i3 ? $i(s3) : s3, o3 = { $referrer: r3, $referring_domain: null == r3 ? void 0 : r3 == po ? po : null == (e3 = Zn(r3)) ? void 0 : e3.host };
    if (n3) {
      o3.$current_url = n3;
      var a3 = Zn(n3);
      o3.$host = null == a3 ? void 0 : a3.host, o3.$pathname = null == a3 ? void 0 : a3.pathname;
      var l3 = vo(n3);
      ds(o3, l3);
    }
    if (r3) {
      var h3 = co(r3);
      ds(o3, h3);
    }
    return o3;
  }
  function yo() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (t3) {
      return;
    }
  }
  function bo() {
    try {
      return (/* @__PURE__ */ new Date()).getTimezoneOffset();
    } catch (t3) {
      return;
    }
  }
  var wo = { flags: Lr, surveys: Cr };
  var So = ["cookie", "localstorage", "localstorage+cookie", "sessionstorage", "memory"];
  var xo = (t3) => t3 + "_cookie_identity_change_pending";
  var Eo = "main";
  var ko = [gr, mr, br, wr, Sr, Lr, xr, Tr];
  var To = (t3) => -1 !== ko.indexOf(t3);
  var $o = (t3, i3) => {
    try {
      return JSON.stringify(t3) === JSON.stringify(i3);
    } catch (e3) {
      return t3 === i3;
    }
  };
  var Po = (t3) => {
    if (!t3) return {};
    var i3 = JSON.parse(t3);
    return W(i3) ? i3 : {};
  };
  var Ro = (t3, i3) => {
    us(t3, ((e3, r3) => {
      var s3 = Qn(r3);
      s3 && "event" !== s3.exposure || {}.hasOwnProperty.call(i3, r3) || delete t3[r3];
    }));
  };
  var Co = class {
    constructor(i3, e3, r3) {
      if (void 0 === r3 && (r3 = true), this.sa = {}, this.aa = false, this.oa = false, this.la = false, this.ua = false, this.ha = /* @__PURE__ */ new Map(), this.da = false, this.va = false, this.ca = false, this.fa = /* @__PURE__ */ new Set(), this.mn = i3, this.pa = r3, this.props = {}, this.ga = void 0, this.ma = ((t3) => {
        var i4 = "";
        return t3.token && (i4 = t3.token.replace(/\+/g, "PL").replace(/\//g, "SL").replace(/=/g, "EQ")), t3.persistence_name ? "ph_" + t3.persistence_name : "ph_" + i4 + "_posthog";
      })(i3), this.Zs = this.ya(i3), this.oa = this.ba(i3), this.load(), this._a(), i3.debug && Ue.info("Persistence loaded", i3.persistence, _({}, this.props)), this.update_config(i3, i3, e3), this.save(), t) {
        var s3 = () => this.flush();
        ms(t, "beforeunload", s3, { capture: false }), ms(t, "pagehide", s3, { capture: false }), this.wa = (i4) => {
          if (this.aa && (!i4.storageArea || i4.storageArea === (null == t ? void 0 : t.localStorage)) && i4.key) if (i4.key !== this.ma) {
            if (this.oa) {
              var e4 = Kn.find(((t3) => i4.key === this.ka(t3)));
              e4 && this.Sa(i4.key, e4);
            }
          } else this.Sa(i4.key, Eo);
        }, ms(t, "storage", this.wa);
      }
    }
    markCrossTabFeatureFlagChanges(t3) {
      Object.entries(t3).forEach(((t4) => {
        var i3 = t4[0], e3 = t4[1], r3 = this.ha.get(i3);
        if (To(i3) && true !== r3) if (true !== e3) {
          var s3 = new Set(r3 || []);
          e3.forEach(((t5) => s3.add(t5))), s3.size && this.xa(i3, s3);
        } else this.xa(i3, true);
      }));
    }
    onCrossTabFeatureFlagChange(t3) {
      return this.fa.add(t3), () => this.fa.delete(t3);
    }
    destroy() {
      this.wa && t && (t.removeEventListener("storage", this.wa), this.wa = void 0), this.fa.clear();
    }
    Sa(t3, i3, e3) {
      if (void 0 === e3 && (e3 = true), this.Ca) return false;
      var r3, s3;
      try {
        if (s3 = Fs.ai(t3), Q(s3)) {
          var n3 = this.Ta(i3);
          return n3.storageValue = null, i3 !== Eo && (n3.persisted = false), false;
        }
        r3 = Po(s3);
      } catch (t4) {
        return false;
      }
      var o3 = i3 === Eo ? r3 : Fs.ui(this.ma);
      if (o3 && this.Ma(o3)) return false;
      var a3 = this.Ea(r3, i3, e3);
      return i3 === Eo && this.oa && !$o(this.Ia().main, r3) || this.Ra(r3, i3, true, s3), a3;
    }
    Ma(t3) {
      var i3 = this.props[Ke], e3 = t3[Ke];
      return !K(i3) && !K(e3) && i3 !== e3;
    }
    Ra(t3, i3, e3, r3) {
      var s3 = this.Ta(i3);
      s3.storageValue = r3, i3 !== Eo && (s3.persisted = e3);
      try {
        s3.fingerprint = this.Pa(t3, i3);
      } catch (t4) {
        s3.fingerprint = void 0;
      }
    }
    Ea(t3, i3, e3) {
      var r3 = false;
      return ko.forEach(((e4) => {
        var s3, n3 = null == (s3 = Qn(e4)) ? void 0 : s3.storageGroup;
        if (!(i3 === Eo && this.oa && n3 || i3 !== Eo && n3 !== i3)) {
          var o3 = e4 in t3, a3 = this.Aa(e4, o3 ? t3[e4] : void 0), l3 = this.ha.has(e4) ? e4 in this.props : o3;
          l3 === e4 in this.props && $o(a3, this.props[e4]) || (l3 ? this.Fa(e4, a3, false) : this.Oa(e4, false), r3 = true);
        }
      })), r3 && e3 && this.fa.forEach(((t4) => t4())), r3;
    }
    La() {
      if (!this.aa) return false;
      try {
        this.ca = false;
        var t3, i3 = Fs.ai(this.ma), e3 = this.Ta(Eo), r3 = false, s3 = false;
        if (i3 !== e3.storageValue) if (Q(i3)) e3.storageValue = null;
        else {
          if (t3 = Po(i3), this.ca = !this.va && this.Ma(t3), this.ca) return false;
          s3 = this.Ea(t3, Eo, false), !this.oa || $o(this.Ia().main, t3) ? this.Ra(t3, Eo, true, i3) : e3.storageValue = i3, r3 = true;
        }
        return this.oa && Kn.forEach(((i4) => {
          var e4 = Fs.ai(this.ka(i4)), n3 = this.Ta(i4), o3 = t3 || {}, a3 = r3 && ko.some(((t4) => {
            var e5;
            return (null == (e5 = Qn(t4)) ? void 0 : e5.storageGroup) === i4 && t4 in o3;
          }));
          if (e4 !== n3.storageValue || a3) {
            if (Q(e4)) return n3.storageValue = null, n3.persisted = false, void (a3 && (s3 = this.Ea(o3, i4, false) || s3));
            var l3 = Po(e4);
            s3 = this.Ea(l3, i4, false) || s3, this.Ra(l3, i4, true, e4);
          }
        })), s3;
      } catch (t4) {
        return false;
      }
    }
    xa(t3, i3) {
      this.ha.set(t3, i3);
      var e3 = Qn(t3);
      null != e3 && e3.volatile || (this.Ta((this.oa ? null == e3 ? void 0 : e3.storageGroup : void 0) || Eo).fingerprint = void 0, this.Da(t3));
    }
    $a() {
      ko.forEach(((t3) => this.ha.set(t3, true)));
    }
    _a() {
      if (this.aa) try {
        var t3 = Fs.ai(this.ma), i3 = Po(t3);
        this.Ta(Eo).storageValue = t3, ko.forEach(((t4) => {
          var e3, r3 = this.oa ? null == (e3 = Qn(t4)) ? void 0 : e3.storageGroup : void 0, s3 = r3 ? Fs.ai(this.ka(r3)) : null;
          if (r3) {
            var n3 = this.Ta(r3);
            n3.storageValue = s3, n3.persisted = !Q(s3);
          }
          var o3 = r3 && !Q(s3) ? Po(s3) : i3;
          t4 in this.props ? this.Na(t4, o3[t4], this.props[t4]) : t4 in o3 && this.xa(t4, true);
        }));
      } catch (t4) {
      }
    }
    Aa(t3, i3) {
      var e3 = this.ha.get(t3);
      if (!e3) return i3;
      if (true === e3) return this.props[t3];
      if (t3 === mr) {
        var r3 = new Set(q(i3) ? i3 : []), s3 = new Set(q(this.props[t3]) ? this.props[t3] : []);
        return e3.forEach(((t4) => s3.has(t4) ? r3.add(t4) : r3.delete(t4))), Array.from(r3);
      }
      var n3 = W(i3) ? _({}, i3) : {}, o3 = W(this.props[t3]) ? this.props[t3] : {};
      return e3.forEach(((t4) => {
        t4 in o3 ? n3[t4] = o3[t4] : delete n3[t4];
      })), n3;
    }
    Na(t3, i3, e3) {
      if (To(t3)) {
        var r3 = this.ha.get(t3);
        if (true !== r3) {
          var s3 = i3;
          if (this.aa) try {
            var n3, o3 = this.oa ? null == (n3 = Qn(t3)) ? void 0 : n3.storageGroup : void 0, a3 = o3 ? this.ka(o3) : this.ma;
            s3 = Po(Fs.ai(a3))[t3];
          } catch (t4) {
          }
          var l3 = new Set(r3 || []);
          if (t3 === mr) {
            if (!K(i3) && !q(i3) || !K(s3) && !q(s3) || !q(e3)) return void this.xa(t3, true);
            var h3 = new Set(i3 || []), u3 = new Set(s3 || []), d3 = new Set(e3);
            (/* @__PURE__ */ new Set([...h3, ...d3])).forEach(((t4) => {
              h3.has(t4) !== d3.has(t4) && l3.add(t4);
            })), l3.forEach(((t4) => {
              u3.has(t4) === d3.has(t4) && l3.delete(t4);
            }));
          } else {
            if (!W(e3)) return void ($o(s3, e3) ? this.ha.delete(t3) : this.xa(t3, true));
            if (!K(i3) && !W(i3) || K(i3) && G(e3) && K(s3)) return void this.xa(t3, true);
            var v3 = W(i3) ? i3 : {}, c3 = W(s3) ? s3 : {};
            (/* @__PURE__ */ new Set([...Object.keys(v3), ...Object.keys(e3)])).forEach(((t4) => {
              t4 in v3 == t4 in e3 && $o(v3[t4], e3[t4]) || l3.add(t4);
            })), l3.forEach(((t4) => {
              t4 in c3 == t4 in e3 && $o(c3[t4], e3[t4]) && l3.delete(t4);
            }));
          }
          l3.size ? this.xa(t3, l3) : this.ha.delete(t3);
        }
      }
    }
    qa() {
      var t3, i3 = null == (t3 = this.mn) ? void 0 : t3.persistence_save_debounce_ms;
      return Z(i3) && i3 > 0 ? i3 : 0;
    }
    ja(t3) {
      if (this.mn.cookieWinsOnConflict && "localstorage+cookie" === this.mn.persistence.toLowerCase()) if (t3) try {
        var i3 = js(t3, this.mn.cookie_persisted_properties || []), e3 = Bs(i3, this.mn.cookie_persisted_properties || []), r3 = JSON.stringify(i3) + "|" + JSON.stringify(e3), s3 = Os.ai(this.ma) || void 0;
        s3 && Hs(this.ma, s3) === r3 && (this.Ba = r3, this.Ha = s3);
      } catch (t4) {
      }
      else try {
        var n3 = Os.ai(this.ma) || void 0;
        this.Ba = n3 ? Hs(this.ma, n3) : void 0, this.Ha = n3;
      } catch (t4) {
      }
    }
    syncCookieProperties() {
      return this.za(this.mn);
    }
    za(t3, i3) {
      if (void 0 === i3 && (i3 = false), this.Ca && !i3 || this.ua || !t3.cookieWinsOnConflict || "localstorage+cookie" !== t3.persistence.toLowerCase()) return false;
      var e3;
      try {
        e3 = Os.ai(this.ma) || void 0;
      } catch (t4) {
      }
      if (!e3 || e3 === this.Ha) return false;
      var r3, s3 = Hs(this.ma, e3);
      try {
        r3 = Ls(JSON.parse(e3));
      } catch (t4) {
        return false;
      }
      if ((Os.ai(this.ma) || void 0) !== e3) return false;
      this.Ba = s3, this.Ha = e3;
      var n3 = zs(this.ma, e3), o3 = [...Ms, ...n3.properties], a3 = {};
      if (Object.keys(r3).forEach(((t4) => {
        var i4 = r3[t4];
        (K(i4) || Q(i4) || "" === i4 || t4 === jr && i4 !== ts && i4 !== is) && (a3[t4] = true, delete r3[t4]);
      })), G(r3)) return false;
      var l3 = Ke in r3 || r3[jr] === ts || r3[jr] === is, h3 = this.props, u3 = h3[Ke], d3 = h3[jr], v3 = ds({}, h3);
      [...Ms, ...t3.cookie_persisted_properties || []].forEach(((t4) => {
        if (-1 !== o3.indexOf(t4) && !(t4 in r3) && !a3[t4] && (l3 || t4 !== Ke && t4 !== jr)) {
          var i4 = v3[t4];
          !n3.isValid && -1 !== Ms.indexOf(t4) && (false === i4 || 0 === i4) || delete v3[t4];
        }
      })), this.props = ds(v3, r3), ko.forEach(((t4) => {
        var i4 = t4 in this.props;
        t4 in h3 === i4 && $o(h3[t4], this.props[t4]) || (i4 ? this.Na(t4, h3[t4], this.props[t4]) : this.xa(t4, true));
      })), !l3 || jr in r3 || jr in this.props || this.Fa(jr, ts);
      var c3 = this.props[Ke], f3 = this.props[jr];
      return !l3 || c3 === u3 && f3 === d3 || (this.va = true, this.la = true, Gs.ni(xo(this.ma), true), this.Oa(Tr), this.Oa(mr), this.Oa(gr), this.Oa(br), this.Oa(wr), this.Oa(Sr), this.Oa(Lr), this.Oa(Nr), this.Oa(Mr), f3 === ts && (d3 === is || r3[jr] === ts || !K(u3) && c3 !== u3) && (Ro(this.props, r3), this.Oa($r)), f3 === is ? this.props.$user_id = c3 : delete this.props.$user_id, this.Oa(Qe)), true;
    }
    consumeCookieIdentityChange() {
      var t3 = xo(this.ma), i3 = this.la || !!Gs.ai(t3);
      return this.la = false, i3 && Gs.oi(t3), i3;
    }
    Ua(t3) {
      return void 0 === t3 && (t3 = false), !(this.ua || this.Ca && !t3 || !this.mn.cookieWinsOnConflict || "localstorage+cookie" !== this.mn.persistence.toLowerCase() || (this.ua = true, 0));
    }
    Wa() {
      this.ua && (K(this.Va) || (clearTimeout(this.Va), this.Va = void 0), delete this.sa[Eo], this.Ga(true));
    }
    Za(t3) {
      if (void 0 === t3 && (t3 = true), this.ua) try {
        t3 ? this.Wa() : K(this.Va) || (clearTimeout(this.Va), this.Va = void 0);
      } finally {
        this.ua = false;
      }
    }
    isDisabled() {
      return !!this.Ca;
    }
    ya(i3) {
      -1 === So.indexOf(i3.persistence.toLowerCase()) && (Ue.critical("Unknown persistence type " + i3.persistence + "; falling back to localStorage+cookie"), i3.persistence = "localStorage+cookie");
      var e3, r3 = (function(i4, e4) {
        void 0 === i4 && (i4 = []), void 0 === e4 && (e4 = false);
        var r4 = [...Ms, ...i4];
        return _({}, Fs, { ui(t3) {
          try {
            var i5, s4 = {};
            try {
              i5 = Os.ai(t3) || void 0, s4 = i5 ? Ls(JSON.parse(i5)) : {};
            } catch (t4) {
            }
            var n4, o3 = JSON.parse(Fs.ai(t3) || "{}");
            if (e4) {
              var a3 = zs(t3, i5), l3 = [...Ms, ...a3.properties], h3 = {};
              Object.keys(s4).forEach(((t4) => {
                var i6 = s4[t4];
                Q(i6) || "" === i6 || t4 === jr && i6 !== ts && i6 !== is || (h3[t4] = i6);
              }));
              var u3 = Ke in h3 || h3[jr] === ts || h3[jr] === is;
              if (Object.keys(h3).length > 0) {
                var d3, v3 = o3[Ke], c3 = null !== (d3 = o3[jr]) && void 0 !== d3 ? d3 : ts;
                r4.forEach(((t4) => {
                  if (-1 !== l3.indexOf(t4) && !(t4 in s4) && (u3 || t4 !== Ke && t4 !== jr)) {
                    var i6 = o3[t4];
                    !a3.isValid && -1 !== Ms.indexOf(t4) && (false === i6 || 0 === i6) || delete o3[t4];
                  }
                })), !u3 || jr in s4 || jr in o3 || (o3[jr] = ts), !u3 || (Ke in h3 ? h3[Ke] : o3[Ke]) === v3 && (jr in h3 ? h3[jr] : o3[jr]) === c3 || (As.forEach(((t4) => delete o3[t4])), h3[jr] === is && Ke in h3 ? o3.$user_id = h3[Ke] : delete o3.$user_id, h3[jr] !== is && (delete o3[Pr], delete o3[$r]), delete o3.__alias);
              }
              n4 = ds(o3, h3);
            } else n4 = ds(s4, o3);
            return Fs.ni(t3, n4), n4;
          } catch (t4) {
          }
          return null;
        }, ni(t3, r5, s4, n4, o3, a3) {
          var l3 = Fs.ni(t3, r5, void 0, void 0, a3);
          try {
            var h3 = js(r5, i4);
            if (Object.keys(h3).length) {
              if (e4) {
                var u3 = Ds(t3), d3 = Bs(h3, i4);
                if (Os.ni(u3, d3, s4, n4, o3, a3), Os.ai(u3) !== JSON.stringify(d3)) {
                  Os.oi(u3, n4);
                  var v3 = js(r5);
                  return Os.ni(t3, v3, s4, n4, o3, a3), l3;
                }
              }
              Os.ni(t3, h3, s4, n4, o3, a3);
            }
          } catch (t4) {
            Fs.si(t4);
          }
          return l3;
        }, oi(i5, e5) {
          try {
            null == t || t.localStorage.removeItem(i5), Os.oi(i5, e5), Os.oi(Ds(i5), e5);
          } catch (t3) {
            Fs.si(t3);
          }
        } });
      })(i3.cookie_persisted_properties || [], i3.cookieWinsOnConflict), s3 = false, n3 = i3.persistence.toLowerCase();
      return "localstorage" === n3 && Fs.ii() ? (e3 = Fs, s3 = true) : "localstorage+cookie" === n3 && r3.ii() ? (e3 = r3, s3 = true) : "sessionstorage" === n3 && Gs.ii() ? e3 = Gs : "memory" === n3 ? e3 = Vs : "cookie" === n3 && Os.ii() ? e3 = Os : r3.ii() ? (e3 = r3, s3 = true) : e3 = Os.ii() ? Os : Vs, this.aa = s3, e3;
    }
    ka(t3) {
      return this.ma + "__" + t3;
    }
    ba(t3) {
      return this.aa && !!t3.split_storage;
    }
    properties() {
      var t3 = {};
      return us(this.props, ((i3, e3) => {
        var r3 = Qn(e3);
        if (!r3 || "event" === r3.exposure) {
          if (null != r3 && null != r3.shouldSkipFromEventProperties && r3.shouldSkipFromEventProperties(i3)) return;
          t3[e3] = i3;
        }
      })), t3;
    }
    load(t3) {
      if (void 0 === t3 && (t3 = false), !this.Ca || t3) {
        var i3 = this.mn.cookieWinsOnConflict && "localstorage+cookie" === this.mn.persistence.toLowerCase(), e3 = i3 ? Fs.ui(this.ma) : null, r3 = {};
        if (i3) try {
          us(r3 = Ls(Os.ui(this.ma)), ((t4, i4) => {
            (K(t4) || Q(t4) || "" === t4) && delete r3[i4];
          }));
        } catch (t4) {
        }
        var s3 = this.Zs.ui(this.ma);
        if (s3 && (this.props = ds({}, s3)), this.oa && this.Qa(), i3 && s3) {
          var n3, o3, a3 = null == e3 ? void 0 : e3[Ke], l3 = null !== (n3 = null == e3 ? void 0 : e3[jr]) && void 0 !== n3 ? n3 : ts, h3 = s3[Ke], u3 = null !== (o3 = s3[jr]) && void 0 !== o3 ? o3 : ts;
          if (h3 !== a3 || u3 !== l3) {
            this.la = true, Gs.ni(xo(this.ma), true);
            var d3 = ds({}, this.props);
            As.forEach(((t4) => delete d3[t4])), u3 === ts && (l3 === is || r3[jr] === ts || !K(a3) && h3 !== a3) && (Ro(d3, r3), delete d3[$r]), this.props = d3;
            var v3 = /* @__PURE__ */ new Set();
            As.forEach(((t4) => {
              var i4, e4 = null == (i4 = Qn(t4)) ? void 0 : i4.storageGroup;
              e4 && v3.add(e4);
            })), v3.forEach(((t4) => {
              var i4 = {};
              us(this.props, ((e4, r4) => {
                var s4;
                (null == (s4 = Qn(r4)) ? void 0 : s4.storageGroup) === t4 && (i4[r4] = e4);
              })), G(i4) ? (Fs.oi(this.ka(t4)), this.sa[t4] = {}) : Fs.ni(this.ka(t4), i4) && (this.sa[t4] = { persisted: true, fingerprint: this.Pa(i4, t4) });
            }));
          }
        }
        Gs.ai(xo(this.ma)) && (this.la = true);
      }
    }
    Qa() {
      for (var t3 of Kn) {
        var i3 = Fs.ui(this.ka(t3));
        if (i3 && !G(i3)) {
          var e3 = this.Ta(t3);
          e3.persisted = true, this.Ja(t3) || (e3.fingerprint = this.Pa(i3, t3)), this.Ka(t3, i3) || ds(this.props, i3);
        }
      }
    }
    Ja(t3) {
      return Object.keys(this.props).some(((i3) => {
        var e3;
        return (null == (e3 = Qn(i3)) ? void 0 : e3.storageGroup) === t3;
      }));
    }
    Ka(t3, i3) {
      var e3 = wo[t3];
      if (!e3) return false;
      var r3 = i3[e3], s3 = this.props[e3];
      return Z(r3) && Z(s3) && s3 > r3;
    }
    refreshKey(t3) {
      var i3;
      if (!this.Ca) {
        var e3 = this.oa ? null == (i3 = Qn(t3)) ? void 0 : i3.storageGroup : void 0, r3 = e3 ? Fs.ui(this.ka(e3)) : this.Zs.ui(this.ma);
        if (r3 && t3 in r3) this.Fa(t3, r3[t3]);
        else {
          if (e3) {
            var s3 = this.Zs.ui(this.ma);
            if (s3 && t3 in s3) return void this.Fa(t3, s3[t3]);
          }
          this.Oa(t3);
        }
      }
    }
    save() {
      if (!this.Ca) {
        var t3 = this.qa();
        t3 > 0 ? K(this.Va) && (this.Va = setTimeout((() => {
          this.Va = void 0, this.Ga();
        }), t3)) : this.Ga();
      }
    }
    flush() {
      K(this.Va) || (clearTimeout(this.Va), this.Va = void 0, this.Ga());
    }
    Ga(t3) {
      if (void 0 === t3 && (t3 = false), !(this.Ca || this.ua && !t3)) {
        t3 || this.syncCookieProperties();
        var i3 = !t3 && !this.da;
        i3 || (this.ca = false);
        var e3 = !!i3 && this.La();
        if (this.ca) this.mn.debug && Ue.warn("skipping persistence write because storage belongs to a different distinct ID");
        else {
          if (this.oa) return this.Ya(), void (e3 && this.fa.forEach(((t4) => t4())));
          var r3 = this.Xa(this.Zs, this.ma, this.props, Eo);
          "written" === r3 && this.ja(this.props), "failed" !== r3 && (this.ha.clear(), this.va = false), e3 && this.fa.forEach(((t4) => t4()));
        }
      }
    }
    Ya() {
      var t3 = this, i3 = this.Ia(), e3 = i3.main, r3 = i3.groups, s3 = this.Xa(this.Zs, this.ma, e3, Eo);
      "written" === s3 && this.ja(e3), "failed" !== s3 && (this.va = false, ko.forEach(((t4) => {
        var i4;
        null != (i4 = Qn(t4)) && i4.storageGroup || this.ha.delete(t4);
      })));
      var n3 = function(i4) {
        var e4, s4 = r3[i4];
        if (G(s4) && (null == (e4 = t3.sa[i4]) || !e4.persisted)) return ko.forEach(((e5) => {
          var r4;
          (null == (r4 = Qn(e5)) ? void 0 : r4.storageGroup) === i4 && t3.ha.delete(e5);
        })), 1;
        var n4 = t3.Xa(Fs, t3.ka(i4), s4, i4);
        "failed" !== n4 && ko.forEach(((e5) => {
          var r4 = Qn(e5);
          (null == r4 ? void 0 : r4.storageGroup) !== i4 || "written" !== n4 && r4.volatile || t3.ha.delete(e5);
        }));
      };
      for (var o3 of Kn) n3(o3);
    }
    Ia() {
      var t3 = {}, i3 = { flags: {}, surveys: {} };
      return us(this.props, ((e3, r3) => {
        var s3, n3 = null == (s3 = Qn(r3)) ? void 0 : s3.storageGroup;
        n3 ? i3[n3][r3] = e3 : t3[r3] = e3;
      })), { main: t3, groups: i3 };
    }
    Pa(t3, i3) {
      if (i3 === Eo) return JSON.stringify(t3) + "|" + this.eo + "|" + this.io + "|" + this.ro;
      var e3 = {};
      return us(t3, ((t4, i4) => {
        var r3;
        e3[i4] = null != (r3 = Qn(i4)) && r3.volatile ? "__volatile__" : t4;
      })), JSON.stringify(e3);
    }
    Xa(t3, i3, e3, r3) {
      var s3, n3 = this.Ta(r3);
      if (r3 !== Eo && !n3.dirty && !K(n3.fingerprint)) return "skipped";
      try {
        if ((s3 = this.Pa(e3, r3)) === n3.fingerprint) return n3.dirty = false, "skipped";
      } catch (t4) {
        s3 = void 0;
      }
      return t3.ni(i3, e3, this.eo, this.io, this.ro, this.mn.debug) ? (n3.dirty = false, r3 !== Eo && (n3.persisted = true), K(s3) || (n3.fingerprint = s3), this.aa && (n3.storageValue = Fs.ai(i3)), "written") : (this.mn.debug && Ue.warn('failed to persist storage entry "' + i3 + '"; will retry on next save'), "failed");
    }
    remove(t3) {
      var i3 = (void 0 === t3 ? {} : t3).keepGroupEntries, e3 = void 0 !== i3 && i3;
      if (this.$a(), K(this.Va) || (clearTimeout(this.Va), this.Va = void 0), this.Zs.oi(this.ma, false), this.Zs.oi(this.ma, true), !e3 && this.pa) for (var r3 of Kn) Fs.oi(this.ka(r3));
      e3 ? delete this.sa[Eo] : this.sa = {}, this.Ba = void 0, this.Ha = void 0;
    }
    clear() {
      this.remove(), this.props = {};
    }
    register_once(t3, i3, e3) {
      if (W(t3)) {
        this.syncCookieProperties(), K(i3) && (i3 = "None"), this.eo = K(e3) ? this.no : e3;
        var r3 = false;
        if (us(t3, ((t4, e4) => {
          this.props.hasOwnProperty(e4) && this.props[e4] !== i3 || (this.Fa(e4, t4), r3 = true);
        })), r3) return this.save(), true;
      }
      return false;
    }
    register(t3, i3) {
      if (W(t3)) {
        this.syncCookieProperties(), this.eo = K(i3) ? this.no : i3;
        var e3 = false;
        if (us(t3, ((i4, r3) => {
          t3.hasOwnProperty(r3) && (this.props[r3] !== i4 || W(i4) || q(i4)) && (this.Fa(r3, i4), e3 = true);
        })), e3) return this.save(), true;
      }
      return false;
    }
    unregister(t3) {
      this.syncCookieProperties();
      var i3 = "string" == typeof t3 ? [t3] : t3, e3 = false;
      for (var r3 of i3) r3 in this.props && (this.Oa(r3), e3 = true);
      e3 && this.save();
    }
    update_campaign_params() {
      var t3 = null == r ? void 0 : r.URL;
      if (t3 !== this.ga) {
        var i3 = uo(this.mn.custom_campaign_params, this.mn.mask_personal_data_properties, this.mn.custom_personal_data_properties);
        G(ps(i3)) || this.register(i3), this.ga = t3;
      }
    }
    update_search_keyword() {
      var t3;
      this.register((t3 = null == r ? void 0 : r.referrer) ? co(t3) : {});
    }
    update_referrer_info() {
      var t3;
      this.register_once({ $referrer: _o(), $referring_domain: null != r && r.referrer && (null == (t3 = Zn(r.referrer)) ? void 0 : t3.host) || po }, void 0);
    }
    set_initial_person_info() {
      this.props[zr] || this.props[Hr] || this.register_once({ [qr]: go(this.mn.mask_personal_data_properties, this.mn.custom_personal_data_properties, this.mn.disable_capture_url_hashes) }, void 0);
    }
    get_initial_props() {
      var t3 = {};
      us([Hr, zr], ((i4) => {
        var e4 = this.props[i4];
        e4 && us(e4, (function(i5, e5) {
          t3["$initial_" + j(e5)] = i5;
        }));
      }));
      var i3 = this.props[qr];
      if (i3) {
        var e3 = (function(t4, i4) {
          void 0 === i4 && (i4 = false);
          var e4 = mo(t4, i4), r3 = {};
          return us(e4, (function(t5, i5) {
            r3["$initial_" + j(i5)] = t5;
          })), r3;
        })(i3, this.mn.disable_capture_url_hashes);
        ds(t3, e3);
      }
      return t3;
    }
    safe_merge(t3) {
      return us(this.props, (function(i3, e3) {
        e3 in t3 || (t3[e3] = i3);
      })), t3;
    }
    update_config(t3, i3, e3) {
      var r3 = t3.persistence !== i3.persistence, s3 = !((t4, i4) => {
        if (t4.length !== i4.length) return false;
        var e4 = [...t4].sort(), r4 = [...i4].sort();
        return e4.every(((t5, i5) => t5 === r4[i5]));
      })(t3.cookie_persisted_properties || [], i3.cookie_persisted_properties || []), n3 = r3 || s3, o3 = t3.cookieWinsOnConflict !== i3.cookieWinsOnConflict, a3 = t3.disable_persistence || !!e3, l3 = !!this.Ca && !a3;
      a3 || this.za(i3, l3), this.mn = t3, !a3 && (r3 || s3 || o3) && (this.Ba = void 0, this.Ha = void 0, this.za(_({}, t3, { cookie_persisted_properties: i3.cookie_persisted_properties }), l3));
      var h3 = n3 || o3 ? this.ya(t3) : this.Zs, u3 = this.ba(t3), d3 = n3 || u3 !== this.oa, v3 = !a3 && (d3 || t3.cross_subdomain_cookie !== this.io || t3.secure_cookie !== this.ro) && this.Ua(l3);
      this.da = d3;
      try {
        if (this.no = this.eo = t3.cookie_expiration, this.set_disabled(a3), this.set_cross_subdomain(t3.cross_subdomain_cookie), this.set_secure(t3.secure_cookie), d3) {
          var c3 = this.props;
          this.clear(), this.Zs = h3, this.oa = u3, this.props = c3, this.save();
        } else o3 && (this.Zs = h3, a3 || (delete this.sa[Eo], this.Ga()));
      } finally {
        this.da = false, v3 && this.Za();
      }
    }
    set_disabled(t3) {
      this.Ca = t3, this.Ca ? this.remove() : this.save();
    }
    set_cross_subdomain(t3) {
      t3 !== this.io && (this.io = t3, this.remove({ keepGroupEntries: true }), this.save());
    }
    set_secure(t3) {
      t3 !== this.ro && (this.ro = t3, this.remove({ keepGroupEntries: true }), this.save());
    }
    set_event_timer(t3, i3) {
      var e3 = this.props[Xe] || {};
      e3[t3] = i3, this.Fa(Xe, e3), this.save();
    }
    remove_event_timer(t3) {
      var i3 = this.props[Xe] || {}, e3 = i3[t3];
      return K(e3) || (delete i3[t3], this.Fa(Xe, i3), this.save()), e3;
    }
    get_property(t3) {
      return this.props[t3];
    }
    set_property(t3, i3) {
      this.Fa(t3, i3), this.save();
    }
    Fa(t3, i3, e3) {
      var r3;
      void 0 === e3 && (e3 = true);
      var s3 = this.props[t3];
      this.props[t3] = i3, e3 && (t3 !== Ke && t3 !== jr || s3 === i3 || (this.va = true), this.Na(t3, s3, i3), null != (r3 = Qn(t3)) && r3.volatile || this.Da(t3));
    }
    Oa(t3, i3) {
      void 0 === i3 && (i3 = true), delete this.props[t3], i3 && (To(t3) && this.xa(t3, true), this.Da(t3));
    }
    Da(t3) {
      var i3, e3 = null == (i3 = Qn(t3)) ? void 0 : i3.storageGroup;
      e3 && (this.Ta(e3).dirty = true);
    }
    Ta(t3) {
      return this.sa[t3] || (this.sa[t3] = {});
    }
  };
  function Oo(t3) {
    var i3 = true;
    return { dispose() {
      if (i3) {
        i3 = false;
        var e3 = t3();
        e3 && V(e3.then) && e3.then(void 0, (() => {
        }));
      }
    } };
  }
  var Io = { GZipJS: "gzip-js", Base64: "base64" };
  var Fo = { Activation: "events", Cancellation: "cancelEvents" };
  var No = { Popover: "popover", API: "api", Widget: "widget", ExternalSurvey: "external_survey" };
  var Bo = { SHOWN: "survey shown", DISMISSED: "survey dismissed", SENT: "survey sent", ABANDONED: "survey abandoned" };
  var zo = { SURVEY_ID: "$survey_id", SURVEY_NAME: "$survey_name", SURVEY_RESPONSE: "$survey_response", SURVEY_ITERATION: "$survey_iteration", SURVEY_ITERATION_START_DATE: "$survey_iteration_start_date", SURVEY_PARTIALLY_COMPLETED: "$survey_partially_completed", SURVEY_SUBMISSION_ID: "$survey_submission_id", SURVEY_QUESTIONS: "$survey_questions", SURVEY_COMPLETED: "$survey_completed", PRODUCT_TOUR_ID: "$product_tour_id", SURVEY_LAST_SEEN_DATE: "$survey_last_seen_date", SURVEY_LANGUAGE: "$survey_language" };
  var Ho = { Popover: "popover", Inline: "inline" };
  var Vo = { SHOWN: "product tour shown", DISMISSED: "product tour dismissed", COMPLETED: "product tour completed", STEP_SHOWN: "product tour step shown", STEP_COMPLETED: "product tour step completed", BUTTON_CLICKED: "product tour button clicked", STEP_SELECTOR_FAILED: "product tour step selector failed", BANNER_CONTAINER_SELECTOR_FAILED: "product tour banner container selector failed", BANNER_ACTION_CLICKED: "product tour banner action clicked" };
  var Wo = { TOUR_ID: "$product_tour_id", TOUR_NAME: "$product_tour_name", TOUR_ITERATION: "$product_tour_iteration", TOUR_RENDER_REASON: "$product_tour_render_reason", TOUR_STEP_ID: "$product_tour_step_id", TOUR_STEP_ORDER: "$product_tour_step_order", TOUR_STEP_TYPE: "$product_tour_step_type", TOUR_DISMISS_REASON: "$product_tour_dismiss_reason", TOUR_BUTTON_TEXT: "$product_tour_button_text", TOUR_BUTTON_ACTION: "$product_tour_button_action", TOUR_BUTTON_LINK: "$product_tour_button_link", TOUR_BUTTON_TOUR_ID: "$product_tour_button_tour_id", TOUR_STEPS_COUNT: "$product_tour_steps_count", TOUR_STEP_SELECTOR: "$product_tour_step_selector", TOUR_STEP_SELECTOR_FOUND: "$product_tour_step_selector_found", TOUR_STEP_ELEMENT_TAG: "$product_tour_step_element_tag", TOUR_STEP_ELEMENT_ID: "$product_tour_step_element_id", TOUR_STEP_ELEMENT_CLASSES: "$product_tour_step_element_classes", TOUR_STEP_ELEMENT_TEXT: "$product_tour_step_element_text", TOUR_ERROR: "$product_tour_error", TOUR_MATCHES_COUNT: "$product_tour_matches_count", TOUR_FAILURE_PHASE: "$product_tour_failure_phase", TOUR_WAITED_FOR_ELEMENT: "$product_tour_waited_for_element", TOUR_WAIT_DURATION_MS: "$product_tour_wait_duration_ms", TOUR_BANNER_SELECTOR: "$product_tour_banner_selector", TOUR_LINKED_SURVEY_ID: "$product_tour_linked_survey_id", USE_MANUAL_SELECTOR: "$use_manual_selector", INFERENCE_DATA_PRESENT: "$inference_data_present", TOUR_LAST_SEEN_DATE: "$product_tour_last_seen_date", TOUR_TYPE: "$product_tour_type" };
  var Go = Be("[RateLimiter]");
  var Ko = class {
    constructor(t3) {
      this.serverLimits = {}, this.lastEventRateLimited = false, this.checkForLimiting = (t4) => {
        var i3 = t4.text;
        if (i3 && i3.length) try {
          (JSON.parse(i3).quota_limited || []).forEach(((t5) => {
            Go.info((t5 || "events") + " is quota limited."), this.serverLimits[t5] = (/* @__PURE__ */ new Date()).getTime() + 6e4;
          }));
        } catch (t5) {
          return void Go.warn('could not rate limit - continuing. Error: "' + (null == t5 ? void 0 : t5.message) + '"', { text: i3 });
        }
      }, this.instance = t3, this.lastEventRateLimited = this.clientRateLimitContext(true).isRateLimited;
    }
    get captureEventsPerSecond() {
      var t3;
      return (null == (t3 = this.instance.config.rate_limiting) ? void 0 : t3.events_per_second) || 10;
    }
    get captureEventsBurstLimit() {
      var t3;
      return Math.max((null == (t3 = this.instance.config.rate_limiting) ? void 0 : t3.events_burst_limit) || 10 * this.captureEventsPerSecond, this.captureEventsPerSecond);
    }
    clientRateLimitContext(t3) {
      var i3, e3, r3;
      void 0 === t3 && (t3 = false);
      var s3 = this.captureEventsBurstLimit, n3 = this.captureEventsPerSecond, o3 = (/* @__PURE__ */ new Date()).getTime(), a3 = null !== (i3 = null == (e3 = this.instance.persistence) ? void 0 : e3.get_property(Br)) && void 0 !== i3 ? i3 : { tokens: s3, last: o3 };
      a3.tokens += (o3 - a3.last) / 1e3 * n3, a3.last = o3, a3.tokens > s3 && (a3.tokens = s3);
      var l3 = 1 > a3.tokens;
      if (l3 || t3 || (a3.tokens = Math.max(0, a3.tokens - 1)), l3 && !t3) {
        var h3 = (Z(a3.dropped) ? a3.dropped : 0) + 1;
        a3.dropped = h3, !this.lastEventRateLimited && this.so(h3) && (a3.dropped = 0);
      }
      return this.lastEventRateLimited = l3, null == (r3 = this.instance.persistence) || r3.set_property(Br, a3), { isRateLimited: l3, remainingTokens: a3.tokens };
    }
    ao(t3) {
      var i3 = this.instance.config.property_denylist;
      return !q(i3) || !i3.includes(t3);
    }
    oo() {
      var t3;
      if (this.ao("$current_url") && this.ao("$pathname") && null != s && s.pathname) return "" + (null !== (t3 = s.origin) && void 0 !== t3 ? t3 : "") + s.pathname;
    }
    so(t3) {
      var i3, e3, r3 = this.captureEventsBurstLimit, s3 = this.captureEventsPerSecond, n3 = this.oo(), o3 = this.ao("$session_id") ? null == (i3 = (e3 = this.instance).get_session_id) ? void 0 : i3.call(e3) : void 0, a3 = [t3 + " event(s) dropped since the last warning", n3 ? "triggered on " + n3 : void 0, o3 ? "session " + o3 : void 0].filter(Boolean).join(", ");
      return !!this.instance.capture("$$client_ingestion_warning", { $$client_ingestion_warning_message: "posthog-js client rate limited: " + a3 + ". Config is set to " + s3 + " events per second and " + r3 + " events burst limit." }, { skip_client_rate_limiting: true });
    }
    isServerRateLimited(t3) {
      var i3 = this.serverLimits[t3 || "events"] || false;
      return false !== i3 && (/* @__PURE__ */ new Date()).getTime() < i3;
    }
  };
  var Jo = Be("[RemoteConfig]");
  var Yo = class {
    constructor(t3) {
      this._instance = t3;
    }
    get remoteConfig() {
      var t3;
      return null == (t3 = v._POSTHOG_REMOTE_CONFIG) || null == (t3 = t3[this._instance.config.token]) ? void 0 : t3.config;
    }
    lo(t3) {
      var i3, e3;
      null != (i3 = v.__PosthogExtensions__) && i3.loadExternalDependency ? null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this._instance, "remote-config", (() => t3(this.remoteConfig))) : t3();
    }
    uo(t3) {
      this._instance._send_request({ method: "GET", url: this._instance.requestRouter.endpointFor("assets", "/array/" + this._instance.config.token + "/config"), callback: t3 });
    }
    load() {
      try {
        if (this.remoteConfig) return Jo.info("Using preloaded remote config", this.remoteConfig), void this.ho(this.remoteConfig);
        if (this._instance.do()) return void Jo.warn("Remote config is disabled. Falling back to local config.");
        this.lo(((t3) => {
          if (!t3) return Jo.info("No config found after loading remote JS config. Falling back to JSON."), void this.uo(((t4) => {
            this.ho(t4.json, t4);
          }));
          this.ho(t3);
        }));
      } catch (t3) {
        Jo.error("Error loading remote config", t3), this.ho();
      }
    }
    ho(t3, i3) {
      !t3 && i3 && (0 === i3.statusCode ? i3.error || Jo.warn("Failed to fetch remote config from PostHog.") : Jo.error("Failed to fetch remote config from PostHog."));
      try {
        this._instance.ho(t3 ? { ok: true, config: t3 } : { ok: false });
      } catch (t4) {
        Jo.error("Error applying remote config", t4);
      }
      if (false !== (null == t3 ? void 0 : t3.hasFeatureFlags) && !this._instance.config.advanced_disable_feature_flags_on_first_load) try {
        var e3;
        null == (e3 = this._instance.featureFlags) || e3.ensureFlagsLoaded();
      } catch (t4) {
        Jo.error("Error loading feature flags", t4);
      }
    }
  };
  var Xo = Uint8Array;
  var Zo = Uint16Array;
  var ta = Uint32Array;
  var ia = new Xo([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
  var ea = new Xo([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
  var ra = new Xo([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var sa = function(t3, i3) {
    for (var e3 = new Zo(31), r3 = 0; 31 > r3; ++r3) e3[r3] = i3 += 1 << t3[r3 - 1];
    var s3 = new ta(e3[30]);
    for (r3 = 1; 30 > r3; ++r3) for (var n3 = e3[r3]; e3[r3 + 1] > n3; ++n3) s3[n3] = n3 - e3[r3] << 5 | r3;
    return [e3, s3];
  };
  var na = sa(ia, 2);
  var oa = na[1];
  na[0][28] = 258, oa[258] = 28;
  for (aa = sa(ea, 0)[1], la = new Zo(32768), ha = 0; 32768 > ha; ++ha) {
    ua = (43690 & ha) >>> 1 | (21845 & ha) << 1;
    la[ha] = ((65280 & (ua = (61680 & (ua = (52428 & ua) >>> 2 | (13107 & ua) << 2)) >>> 4 | (3855 & ua) << 4)) >>> 8 | (255 & ua) << 8) >>> 1;
  }
  var ua;
  var aa;
  var la;
  var ha;
  var da = function(t3, i3, e3) {
    for (var r3 = t3.length, s3 = 0, n3 = new Zo(i3); r3 > s3; ++s3) ++n3[t3[s3] - 1];
    var o3, a3 = new Zo(i3);
    for (s3 = 0; i3 > s3; ++s3) a3[s3] = a3[s3 - 1] + n3[s3 - 1] << 1;
    if (e3) {
      o3 = new Zo(1 << i3);
      var l3 = 15 - i3;
      for (s3 = 0; r3 > s3; ++s3) if (t3[s3]) for (var h3 = s3 << 4 | t3[s3], u3 = i3 - t3[s3], d3 = a3[t3[s3] - 1]++ << u3, v3 = d3 | (1 << u3) - 1; v3 >= d3; ++d3) o3[la[d3] >>> l3] = h3;
    } else for (o3 = new Zo(r3), s3 = 0; r3 > s3; ++s3) o3[s3] = la[a3[t3[s3] - 1]++] >>> 15 - t3[s3];
    return o3;
  };
  var va = new Xo(288);
  for (ha = 0; 144 > ha; ++ha) va[ha] = 8;
  for (ha = 144; 256 > ha; ++ha) va[ha] = 9;
  for (ha = 256; 280 > ha; ++ha) va[ha] = 7;
  for (ha = 280; 288 > ha; ++ha) va[ha] = 8;
  var ca = new Xo(32);
  for (ha = 0; 32 > ha; ++ha) ca[ha] = 5;
  var fa = da(va, 9, 0);
  var pa = da(ca, 5, 0);
  var _a = function(t3) {
    return (t3 / 8 >> 0) + (7 & t3 && 1);
  };
  var ga = function(t3, i3, e3) {
    (null == e3 || e3 > t3.length) && (e3 = t3.length);
    var r3 = new (t3 instanceof Zo ? Zo : t3 instanceof ta ? ta : Xo)(e3 - i3);
    return r3.set(t3.subarray(i3, e3)), r3;
  };
  var ma = function(t3, i3, e3) {
    var r3 = i3 / 8 >> 0;
    t3[r3] |= e3 <<= 7 & i3, t3[r3 + 1] |= e3 >>> 8;
  };
  var ya = function(t3, i3, e3) {
    var r3 = i3 / 8 >> 0;
    t3[r3] |= e3 <<= 7 & i3, t3[r3 + 1] |= e3 >>> 8, t3[r3 + 2] |= e3 >>> 16;
  };
  var ba = function(t3, i3) {
    for (var e3 = [], r3 = 0; t3.length > r3; ++r3) t3[r3] && e3.push({ s: r3, f: t3[r3] });
    var s3 = e3.length, n3 = e3.slice();
    if (!s3) return [new Xo(0), 0];
    if (1 == s3) {
      var o3 = new Xo(e3[0].s + 1);
      return o3[e3[0].s] = 1, [o3, 1];
    }
    e3.sort((function(t4, i4) {
      return t4.f - i4.f;
    })), e3.push({ s: -1, f: 25001 });
    var a3 = e3[0], l3 = e3[1], h3 = 0, u3 = 1, d3 = 2;
    for (e3[0] = { s: -1, f: a3.f + l3.f, l: a3, r: l3 }; u3 != s3 - 1; ) a3 = e3[e3[d3].f > e3[h3].f ? h3++ : d3++], l3 = e3[h3 != u3 && e3[d3].f > e3[h3].f ? h3++ : d3++], e3[u3++] = { s: -1, f: a3.f + l3.f, l: a3, r: l3 };
    var v3 = n3[0].s;
    for (r3 = 1; s3 > r3; ++r3) n3[r3].s > v3 && (v3 = n3[r3].s);
    var c3 = new Zo(v3 + 1), f3 = wa(e3[u3 - 1], c3, 0);
    if (f3 > i3) {
      r3 = 0;
      var p3 = 0, _3 = f3 - i3, g3 = 1 << _3;
      for (n3.sort((function(t4, i4) {
        return c3[i4.s] - c3[t4.s] || t4.f - i4.f;
      })); s3 > r3; ++r3) {
        var m3 = n3[r3].s;
        if (i3 >= c3[m3]) break;
        p3 += g3 - (1 << f3 - c3[m3]), c3[m3] = i3;
      }
      for (p3 >>>= _3; p3 > 0; ) {
        var y3 = n3[r3].s;
        i3 > c3[y3] ? p3 -= 1 << i3 - c3[y3]++ - 1 : ++r3;
      }
      for (; r3 >= 0 && p3; --r3) {
        var b3 = n3[r3].s;
        c3[b3] == i3 && (--c3[b3], ++p3);
      }
      f3 = i3;
    }
    return [new Xo(c3), f3];
  };
  var wa = function(t3, i3, e3) {
    return -1 == t3.s ? Math.max(wa(t3.l, i3, e3 + 1), wa(t3.r, i3, e3 + 1)) : i3[t3.s] = e3;
  };
  var Sa = function(t3) {
    for (var i3 = t3.length; i3 && !t3[--i3]; ) ;
    for (var e3 = new Zo(++i3), r3 = 0, s3 = t3[0], n3 = 1, o3 = function(t4) {
      e3[r3++] = t4;
    }, a3 = 1; i3 >= a3; ++a3) if (t3[a3] == s3 && a3 != i3) ++n3;
    else {
      if (!s3 && n3 > 2) {
        for (; n3 > 138; n3 -= 138) o3(32754);
        n3 > 2 && (o3(n3 > 10 ? n3 - 11 << 5 | 28690 : n3 - 3 << 5 | 12305), n3 = 0);
      } else if (n3 > 3) {
        for (o3(s3), --n3; n3 > 6; n3 -= 6) o3(8304);
        n3 > 2 && (o3(n3 - 3 << 5 | 8208), n3 = 0);
      }
      for (; n3--; ) o3(s3);
      n3 = 1, s3 = t3[a3];
    }
    return [e3.subarray(0, r3), i3];
  };
  var xa = function(t3, i3) {
    for (var e3 = 0, r3 = 0; i3.length > r3; ++r3) e3 += t3[r3] * i3[r3];
    return e3;
  };
  var Ea = function(t3, i3, e3) {
    var r3 = e3.length, s3 = _a(i3 + 2);
    t3[s3] = 255 & r3, t3[s3 + 1] = r3 >>> 8, t3[s3 + 2] = 255 ^ t3[s3], t3[s3 + 3] = 255 ^ t3[s3 + 1];
    for (var n3 = 0; r3 > n3; ++n3) t3[s3 + n3 + 4] = e3[n3];
    return 8 * (s3 + 4 + r3);
  };
  var ka = function(t3, i3, e3, r3, s3, n3, o3, a3, l3, h3, u3) {
    ma(i3, u3++, e3), ++s3[256];
    for (var d3 = ba(s3, 15), v3 = d3[0], c3 = d3[1], f3 = ba(n3, 15), p3 = f3[0], _3 = f3[1], g3 = Sa(v3), m3 = g3[0], y3 = g3[1], b3 = Sa(p3), w3 = b3[0], S3 = b3[1], x3 = new Zo(19), E3 = 0; m3.length > E3; ++E3) x3[31 & m3[E3]]++;
    for (E3 = 0; w3.length > E3; ++E3) x3[31 & w3[E3]]++;
    for (var k3 = ba(x3, 7), T3 = k3[0], P3 = k3[1], R3 = 19; R3 > 4 && !T3[ra[R3 - 1]]; --R3) ;
    var C3, O3, I3, F3, A3 = h3 + 5 << 3, M3 = xa(s3, va) + xa(n3, ca) + o3, D3 = xa(s3, v3) + xa(n3, p3) + o3 + 14 + 3 * R3 + xa(x3, T3) + (2 * x3[16] + 3 * x3[17] + 7 * x3[18]);
    if (M3 >= A3 && D3 >= A3) return Ea(i3, u3, t3.subarray(l3, l3 + h3));
    if (ma(i3, u3, 1 + (M3 > D3)), u3 += 2, M3 > D3) {
      C3 = da(v3, c3, 0), O3 = v3, I3 = da(p3, _3, 0), F3 = p3;
      var N3 = da(T3, P3, 0);
      for (ma(i3, u3, y3 - 257), ma(i3, u3 + 5, S3 - 1), ma(i3, u3 + 10, R3 - 4), u3 += 14, E3 = 0; R3 > E3; ++E3) ma(i3, u3 + 3 * E3, T3[ra[E3]]);
      u3 += 3 * R3;
      for (var L3 = [m3, w3], j3 = 0; 2 > j3; ++j3) {
        var U3 = L3[j3];
        for (E3 = 0; U3.length > E3; ++E3) ma(i3, u3, N3[B3 = 31 & U3[E3]]), u3 += T3[B3], B3 > 15 && (ma(i3, u3, U3[E3] >>> 5 & 127), u3 += U3[E3] >>> 12);
      }
    } else C3 = fa, O3 = va, I3 = pa, F3 = ca;
    for (E3 = 0; a3 > E3; ++E3) if (r3[E3] > 255) {
      var B3;
      ya(i3, u3, C3[257 + (B3 = r3[E3] >>> 18 & 31)]), u3 += O3[B3 + 257], B3 > 7 && (ma(i3, u3, r3[E3] >>> 23 & 31), u3 += ia[B3]);
      var z3 = 31 & r3[E3];
      ya(i3, u3, I3[z3]), u3 += F3[z3], z3 > 3 && (ya(i3, u3, r3[E3] >>> 5 & 8191), u3 += ea[z3]);
    } else ya(i3, u3, C3[r3[E3]]), u3 += O3[r3[E3]];
    return ya(i3, u3, C3[256]), u3 + O3[256];
  };
  var Ta = new ta([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
  var $a = (function() {
    for (var t3 = new ta(256), i3 = 0; 256 > i3; ++i3) {
      for (var e3 = i3, r3 = 9; --r3; ) e3 = (1 & e3 && 3988292384) ^ e3 >>> 1;
      t3[i3] = e3;
    }
    return t3;
  })();
  var Pa = function(t3, i3, e3) {
    for (; e3; ++i3) t3[i3] = e3, e3 >>>= 8;
  };
  function Ra(t3, i3) {
    void 0 === i3 && (i3 = {});
    var e3 = /* @__PURE__ */ (function() {
      var t4 = 4294967295;
      return { p(i4) {
        for (var e4 = t4, r4 = 0; i4.length > r4; ++r4) e4 = $a[255 & e4 ^ i4[r4]] ^ e4 >>> 8;
        t4 = e4;
      }, d() {
        return 4294967295 ^ t4;
      } };
    })(), r3 = t3.length;
    e3.p(t3);
    var s3, n3, o3, a3, l3, h3 = (a3 = 10 + ((s3 = i3).filename && s3.filename.length + 1 || 0), l3 = 8, (function(t4, i4, e4, r4, s4, n4) {
      var o4 = t4.length, a4 = new Xo(r4 + o4 + 5 * (1 + Math.floor(o4 / 7e3)) + s4), l4 = a4.subarray(r4, a4.length - s4), h4 = 0;
      if (!i4 || 8 > o4) for (var u4 = 0; o4 >= u4; u4 += 65535) {
        var d3 = u4 + 65535;
        o4 > d3 ? h4 = Ea(l4, h4, t4.subarray(u4, d3)) : (l4[u4] = true, h4 = Ea(l4, h4, t4.subarray(u4, o4)));
      }
      else {
        for (var v3 = Ta[i4 - 1], c3 = v3 >>> 13, f3 = 8191 & v3, p3 = (1 << e4) - 1, _3 = new Zo(32768), g3 = new Zo(p3 + 1), m3 = Math.ceil(e4 / 3), y3 = 2 * m3, b3 = function(i5) {
          return (t4[i5] ^ t4[i5 + 1] << m3 ^ t4[i5 + 2] << y3) & p3;
        }, w3 = new ta(25e3), S3 = new Zo(288), x3 = new Zo(32), E3 = 0, k3 = 0, T3 = (u4 = 0, 0), P3 = 0, R3 = 0; o4 > u4; ++u4) {
          var C3 = b3(u4), O3 = 32767 & u4, I3 = g3[C3];
          if (_3[O3] = I3, g3[C3] = O3, u4 >= P3) {
            var F3 = o4 - u4;
            if ((E3 > 7e3 || T3 > 24576) && F3 > 423) {
              h4 = ka(t4, l4, 0, w3, S3, x3, k3, T3, R3, u4 - R3, h4), T3 = E3 = k3 = 0, R3 = u4;
              for (var A3 = 0; 286 > A3; ++A3) S3[A3] = 0;
              for (A3 = 0; 30 > A3; ++A3) x3[A3] = 0;
            }
            var M3 = 2, D3 = 0, N3 = f3, L3 = O3 - I3 & 32767;
            if (F3 > 2 && C3 == b3(u4 - L3)) for (var j3 = Math.min(c3, F3) - 1, U3 = Math.min(32767, u4), B3 = Math.min(258, F3); U3 >= L3 && --N3 && O3 != I3; ) {
              if (t4[u4 + M3] == t4[u4 + M3 - L3]) {
                for (var z3 = 0; B3 > z3 && t4[u4 + z3] == t4[u4 + z3 - L3]; ++z3) ;
                if (z3 > M3) {
                  if (M3 = z3, D3 = L3, z3 > j3) break;
                  var H3 = Math.min(L3, z3 - 2), q3 = 0;
                  for (A3 = 0; H3 > A3; ++A3) {
                    var V3 = u4 - L3 + A3 + 32768 & 32767, W3 = V3 - _3[V3] + 32768 & 32767;
                    W3 > q3 && (q3 = W3, I3 = V3);
                  }
                }
              }
              L3 += (O3 = I3) - (I3 = _3[O3]) + 32768 & 32767;
            }
            if (D3) {
              w3[T3++] = 268435456 | oa[M3] << 18 | aa[D3];
              var G3 = 31 & oa[M3], K3 = 31 & aa[D3];
              k3 += ia[G3] + ea[K3], ++S3[257 + G3], ++x3[K3], P3 = u4 + M3, ++E3;
            } else w3[T3++] = t4[u4], ++S3[t4[u4]];
          }
        }
        h4 = ka(t4, l4, true, w3, S3, x3, k3, T3, R3, u4 - R3, h4);
      }
      return ga(a4, 0, r4 + _a(h4) + s4);
    })(n3 = t3, null == (o3 = i3).level ? 6 : o3.level, null == o3.mem ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(n3.length)))) : 12 + o3.mem, a3, l3)), u3 = h3.length;
    return (function(t4, i4) {
      var e4 = i4.filename;
      if (t4[0] = 31, t4[1] = 139, t4[2] = 8, t4[8] = 2 > i4.level ? 4 : 9 == i4.level ? 2 : 0, t4[9] = 3, 0 != i4.mtime && Pa(t4, 4, Math.floor(new Date(i4.mtime || Date.now()) / 1e3)), e4) {
        t4[3] = 8;
        for (var r4 = 0; e4.length >= r4; ++r4) t4[r4 + 10] = e4.charCodeAt(r4);
      }
    })(h3, i3), Pa(h3, u3 - 8, e3.d()), Pa(h3, u3 - 4, r3), h3;
  }
  var Ca = !!o || !!n;
  var Oa = "text/plain";
  var Ia = false;
  var Fa = (t3, i3) => {
    var e3 = t3.split("#"), r3 = e3[1], s3 = e3[0].split("?"), n3 = s3[0], o3 = s3[1];
    if (!o3) return t3;
    var a3 = o3.split("&").filter(((t4) => t4.split("=")[0] !== i3)).join("&");
    return n3 + (a3 ? "?" + a3 : "") + (r3 ? "#" + r3 : "");
  };
  var Aa = function(t3, i3, e3) {
    var r3;
    void 0 === e3 && (e3 = true);
    var s3 = t3.split("?"), n3 = s3[0], o3 = s3[1], a3 = _({}, i3), l3 = null !== (r3 = null == o3 ? void 0 : o3.split("&").map(((t4) => {
      var i4, r4 = t4.split("="), s4 = r4[0], n4 = e3 && null !== (i4 = a3[s4]) && void 0 !== i4 ? i4 : r4[1];
      return delete a3[s4], s4 + "=" + n4;
    }))) && void 0 !== r3 ? r3 : [], h3 = (function(t4, i4) {
      var e4, r4;
      void 0 === i4 && (i4 = "&");
      var s4 = [];
      return us(t4, (function(t5, i5) {
        K(t5) || K(i5) || "undefined" === i5 || (e4 = encodeURIComponent(((t6) => t6 instanceof File)(t5) ? t5.name : t5.toString()), r4 = encodeURIComponent(i5), s4[s4.length] = r4 + "=" + e4);
      })), s4.join(i4);
    })(a3);
    return h3 && l3.push(h3), l3.length > 0 ? n3 + "?" + l3.join("&") : n3;
  };
  var Ma = (t3) => {
    if (t3.vo) return t3.vo;
    var i3 = t3.data, e3 = t3.compression;
    if (i3) {
      if (e3 === Io.GZipJS) {
        var r3 = Ra((function(t4, i4) {
          var e4 = t4.length;
          if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(t4);
          for (var r4 = new Xo(t4.length + (t4.length >>> 1)), s4 = 0, n4 = function(t5) {
            r4[s4++] = t5;
          }, o4 = 0; e4 > o4; ++o4) {
            if (s4 + 5 > r4.length) {
              var a3 = new Xo(s4 + 8 + (e4 - o4 << 1));
              a3.set(r4), r4 = a3;
            }
            var l3 = t4.charCodeAt(o4);
            128 > l3 ? n4(l3) : 2048 > l3 ? (n4(192 | l3 >>> 6), n4(128 | 63 & l3)) : l3 > 55295 && 57344 > l3 ? (n4(240 | (l3 = 65536 + (1047552 & l3) | 1023 & t4.charCodeAt(++o4)) >>> 18), n4(128 | l3 >>> 12 & 63), n4(128 | l3 >>> 6 & 63), n4(128 | 63 & l3)) : (n4(224 | l3 >>> 12), n4(128 | l3 >>> 6 & 63), n4(128 | 63 & l3));
          }
          return ga(r4, 0, s4);
        })(Xn(i3)), { mtime: 0 });
        return { contentType: Oa, body: r3.buffer.slice(r3.byteOffset, r3.byteOffset + r3.byteLength), estimatedSize: r3.byteLength };
      }
      if (e3 === Io.Base64) {
        var s3 = (function(t4) {
          return t4 ? btoa(encodeURIComponent(t4).replace(/%([0-9A-F]{2})/g, ((t5, i4) => String.fromCharCode(parseInt(i4, 16))))) : t4;
        })(Xn(i3)), n3 = ((t4) => "data=" + encodeURIComponent("string" == typeof t4 ? t4 : Xn(t4)))(s3);
        return { contentType: "application/x-www-form-urlencoded", body: n3, estimatedSize: new Blob([n3]).size };
      }
      var o3 = Xn(i3);
      return { contentType: "application/json", body: o3, estimatedSize: new Blob([o3]).size };
    }
  };
  var Da = (t3) => {
    var i3, e3, r3 = () => "sendBeacon" === t3.transport ? { url: Aa(t3.url, { compression: Io.Base64 }), encodedBody: Ma(_({}, t3, { compression: Io.Base64, vo: void 0 })) } : { url: Fa(t3.url, "compression"), encodedBody: Ma(_({}, t3, { compression: void 0, vo: void 0 })) };
    try {
      i3 = Ma(t3);
    } catch (i4) {
      if (Ai(t3.compression, to(t3.url, "compression"))) return Ue.error("Failed to gzip request body, sending uncompressed payload", i4), r3();
      throw i4;
    }
    return i3 && Ai(t3.compression, to(t3.url, "compression")) && !((e3 = i3.body) instanceof ArrayBuffer ? Fi(new Uint8Array(e3)) : ArrayBuffer.isView(e3) && Fi(new Uint8Array(e3.buffer, e3.byteOffset, e3.byteLength))) ? (Ia = true, r3()) : { url: t3.url, encodedBody: i3 };
  };
  var Na = (t3) => {
    try {
      return Da(t3);
    } catch (i3) {
      return Ue.error(i3), void (null == t3.callback || t3.callback({ statusCode: 0, error: i3 }));
    }
  };
  var La = (function() {
    var t3 = p((function* (t4) {
      var i3 = Xn(t4.data), e3 = yield (function(t5, i4, e4) {
        return Li.apply(this, arguments);
      })(i3, c.DEBUG, { rethrow: true });
      if (!e3) return t4;
      var r3 = yield e3.arrayBuffer();
      return _({}, t4, { vo: { contentType: Oa, body: r3, estimatedSize: r3.byteLength } });
    }));
    return function(i3) {
      return t3.apply(this, arguments);
    };
  })();
  var ja = /Failed to fetch|NetworkError|Load failed/i;
  var Ua = (t3) => "TypeError" === (null == t3 ? void 0 : t3.name) && ja.test((null == t3 ? void 0 : t3.message) || "");
  var Ba = (t3) => {
    var i3 = Na(t3);
    if (i3) {
      var e3 = i3.url, r3 = i3.encodedBody, s3 = null != r3 ? r3 : {}, o3 = s3.contentType, l3 = s3.body, h3 = s3.estimatedSize, u3 = new Headers();
      us(t3.headers, (function(t4, i4) {
        u3.append(i4, t4);
      })), o3 && u3.append("Content-Type", o3);
      var d3 = null, v3 = false;
      if (a) {
        var c3 = new a();
        d3 = { signal: c3.signal, timeout: setTimeout((() => {
          var i4;
          v3 = true, c3.abort(Ti("AbortError", "PostHog request timed out" + ((i4 = t3.timeout) ? " after " + i4 + "ms" : "")));
        }), t3.timeout) };
      }
      var f3 = (i4) => {
        v3 && "AbortError" === (null == i4 ? void 0 : i4.name) || Ua(i4) ? Ue.warn(i4) : Ue.error(i4), null == t3.callback || t3.callback({ statusCode: 0, error: i4 });
      };
      try {
        var p3;
        n(e3, _({ method: (null == t3 ? void 0 : t3.method) || "GET", headers: u3, keepalive: "POST" === t3.method && !t3.co && 52428.8 > (h3 || 0), body: l3, signal: null == (p3 = d3) ? void 0 : p3.signal }, t3.fetchOptions)).then(((i4) => i4.text().then(((e4) => {
          var r4 = { statusCode: i4.status, text: e4 };
          if (200 === i4.status) try {
            r4.json = JSON.parse(e4);
          } catch (t4) {
            Ue.error(t4);
          }
          null == t3.callback || t3.callback(r4);
        })))).catch(f3).finally((() => d3 ? clearTimeout(d3.timeout) : null));
      } catch (t4) {
        d3 && clearTimeout(d3.timeout), f3(t4);
      }
    }
  };
  var za = (t3) => {
    try {
      var i3, r3 = Da(t3), s3 = r3.url, n3 = r3.encodedBody, o3 = null != n3 ? n3 : {}, a3 = o3.body, l3 = o3.estimatedSize;
      if (!a3) return;
      var h3 = a3 instanceof Blob ? a3 : new Blob([a3], { type: o3.contentType });
      if (e.sendBeacon(s3, h3)) return;
      var u3 = q(t3.data) ? t3.data : null == (i3 = t3.data) ? void 0 : i3.batch;
      if (q(u3) && u3.length > 1 && (null != l3 ? l3 : 0) > 16384) {
        var d3 = Math.ceil(u3.length / 2), v3 = (i4) => q(t3.data) ? i4 : _({}, t3.data, { batch: i4 });
        return za(_({}, t3, { data: v3(u3.slice(0, d3)) })), void za(_({}, t3, { data: v3(u3.slice(d3)) }));
      }
      Ue.warn("Beacon of ~" + (null != l3 ? l3 : 0) + " bytes was rejected by the browser, falling back to fetch"), Ba(_({}, t3, { co: true }));
    } catch (t4) {
      Ue.warn("Beacon send failed", t4);
    }
  };
  var Ha = (t3, i3, e3, r3) => {
    var s3 = "query" === r3 ? "POST" === i3 ? "sent_at" : "_" : void 0;
    return Aa(e3 === Io.GZipJS ? Fa(t3, "compression") : t3, _({}, s3 ? { [s3]: Date.now().toString() } : {}, e3 === Io.GZipJS ? {} : { compression: e3 }));
  };
  var qa = [];
  n && qa.push({ transport: "fetch", method: Ba }), o && qa.push({ transport: "XHR", method(t3) {
    var i3 = Na(t3);
    if (i3) {
      var e3 = new o(), r3 = i3.encodedBody;
      e3.open(t3.method || "GET", i3.url, true);
      var s3 = null != r3 ? r3 : {}, n3 = s3.contentType, a3 = s3.body;
      us(t3.headers, (function(t4, i4) {
        e3.setRequestHeader(i4, t4);
      })), n3 && e3.setRequestHeader("Content-Type", n3), t3.timeout && (e3.timeout = t3.timeout), e3.onreadystatechange = () => {
        if (4 === e3.readyState) {
          var i4 = { statusCode: e3.status, text: e3.responseText };
          if (200 === e3.status) try {
            i4.json = JSON.parse(e3.responseText);
          } catch (t4) {
          }
          null == t3.callback || t3.callback(i4);
        }
      }, e3.send(a3);
    }
  } }), null != e && e.sendBeacon && qa.push({ transport: "sendBeacon", method: za });
  var Va = 3e3;
  var Wa = class {
    constructor(t3, i3) {
      this.fo = true, this.po = [], this.mo = ct((null == i3 ? void 0 : i3.flush_interval_ms) || Va, 250, 5e3, Ue.createLogger("flush interval"), Va), this.yo = t3;
    }
    enqueue(t3) {
      this.po.push(t3), this.bo || this._o();
    }
    unload() {
      this.wo();
      var t3 = this.po.length > 0 ? this.ko() : {}, i3 = Object.values(t3);
      [...i3.filter(((t4) => 0 === t4.url.indexOf("/e"))), ...i3.filter(((t4) => 0 !== t4.url.indexOf("/e")))].map(((t4) => {
        this.So(_({}, t4, { transport: "sendBeacon" }));
      }));
    }
    enable() {
      this.fo = false, this._o();
    }
    _o() {
      var t3 = this;
      this.fo || (this.bo = setTimeout((() => {
        if (this.wo(), this.po.length > 0) {
          var i3 = this.ko(), e3 = function() {
            var e4 = i3[r3], s3 = (/* @__PURE__ */ new Date()).getTime();
            e4.data && q(e4.data) && us(e4.data, ((t4) => {
              t4.offset = Math.abs(t4.timestamp - s3), delete t4.timestamp;
            })), t3.So(e4);
          };
          for (var r3 in i3) e3();
        }
      }), this.mo));
    }
    So(t3) {
      try {
        this.yo(t3);
      } catch (t4) {
        Ue.error(t4);
      }
    }
    wo() {
      clearTimeout(this.bo), this.bo = void 0;
    }
    ko() {
      var t3 = {};
      return us(this.po, ((i3) => {
        var e3, r3 = i3, s3 = (r3 ? r3.batchKey : null) || r3.url;
        K(t3[s3]) && (t3[s3] = _({}, r3, { data: [] })), null == (e3 = t3[s3].data) || e3.push(r3.data);
      })), this.po = [], t3;
    }
  };
  var Ga = ["retriesPerformedSoFar"];
  var Ka = class {
    constructor(i3) {
      this.xo = false, this.Co = 3e3, this.po = [], this._instance = i3, this.po = [], this.To = true, !K(t) && "onLine" in t.navigator && (this.To = t.navigator.onLine, this.Mo = () => {
        this.To = true, this.Eo();
      }, this.Io = () => {
        this.To = false;
      }, ms(t, "online", this.Mo), ms(t, "offline", this.Io));
    }
    get length() {
      return this.po.length;
    }
    retriableRequest(t3) {
      var i3 = t3.retriesPerformedSoFar, e3 = g(t3, Ga);
      tt(i3) && (e3.url = Aa(e3.url, { retry_count: i3 })), this._instance._send_request(_({}, e3, { callback: (t4) => {
        if (200 !== t4.statusCode && (400 > t4.statusCode || t4.statusCode >= 500)) {
          if ((0 === t4.statusCode ? 3 : 10) > (null != i3 ? i3 : 0)) return void this.rs(_({ retriesPerformedSoFar: i3 }, e3));
          0 === t4.statusCode && Ue.warn("Request failed before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped retrying after " + (null != i3 ? i3 : 0) + " retries.");
        }
        null == e3.callback || e3.callback(t4);
      } }));
    }
    rs(t3) {
      var i3 = t3.retriesPerformedSoFar || 0;
      t3.retriesPerformedSoFar = i3 + 1;
      var e3 = (function(t4) {
        var i4 = 3e3 * Math.pow(2, t4), e4 = i4 / 2, r4 = Math.min(18e5, i4), s4 = Math.random() - 0.5;
        return Math.ceil(r4 + s4 * (r4 - e4));
      })(i3), r3 = Date.now() + e3;
      this.po.push({ retryAt: r3, requestOptions: t3 });
      var s3 = "Enqueued failed request for retry in " + e3;
      navigator.onLine || (s3 += " (Browser is offline)"), Ue.warn(s3), this.xo || (this.xo = true, this.Ro());
    }
    Ro() {
      if (this.Po && clearTimeout(this.Po), 0 === this.po.length) return this.xo = false, void (this.Po = void 0);
      this.Po = setTimeout((() => {
        this.To && this.po.length > 0 && this.Eo(), this.Ro();
      }), this.Co);
    }
    Eo() {
      var t3 = Date.now(), i3 = [], e3 = this.po.filter(((e4) => t3 > e4.retryAt || (i3.push(e4), false)));
      if (this.po = i3, e3.length > 0) for (var r3 of e3) this.retriableRequest(r3.requestOptions);
    }
    unload() {
      for (var i3 of (this.Po && (clearTimeout(this.Po), this.Po = void 0), this.xo = false, K(t) || (this.Mo && (t.removeEventListener("online", this.Mo), this.Mo = void 0), this.Io && (t.removeEventListener("offline", this.Io), this.Io = void 0)), this.po)) {
        var e3 = i3.requestOptions;
        try {
          this._instance._send_request(_({}, e3, { transport: "sendBeacon" }));
        } catch (t3) {
          Ue.error(t3);
        }
      }
      this.po = [];
    }
  };
  var Ja = class {
    constructor(t3) {
      this.Ao = () => {
        var t4, i3, e3, r3;
        this.Fo || (this.Fo = {});
        var s3 = this.scrollElement(), n3 = this.scrollY(), o3 = s3 ? Math.max(0, s3.scrollHeight - s3.clientHeight) : 0, a3 = n3 + ((null == s3 ? void 0 : s3.clientHeight) || 0), l3 = (null == s3 ? void 0 : s3.scrollHeight) || 0;
        this.Fo.lastScrollY = Math.ceil(n3), this.Fo.maxScrollY = Math.max(n3, null !== (t4 = this.Fo.maxScrollY) && void 0 !== t4 ? t4 : 0), this.Fo.maxScrollHeight = Math.max(o3, null !== (i3 = this.Fo.maxScrollHeight) && void 0 !== i3 ? i3 : 0), this.Fo.lastContentY = a3, this.Fo.maxContentY = Math.max(a3, null !== (e3 = this.Fo.maxContentY) && void 0 !== e3 ? e3 : 0), this.Fo.maxContentHeight = Math.max(l3, null !== (r3 = this.Fo.maxContentHeight) && void 0 !== r3 ? r3 : 0);
      }, this._instance = t3;
    }
    get Oo() {
      return this._instance.config.scroll_root_selector;
    }
    getContext() {
      return this.Fo;
    }
    resetContext() {
      var t3 = this.Fo;
      return setTimeout(this.Ao, 0), t3;
    }
    startMeasuringScrollPosition() {
      ms(t, "scroll", this.Ao, { capture: true }), ms(t, "scrollend", this.Ao, { capture: true }), ms(t, "resize", this.Ao);
    }
    scrollElement() {
      if (!this.Oo) return null == t ? void 0 : t.document.documentElement;
      var i3 = q(this.Oo) ? this.Oo : [this.Oo];
      for (var e3 of i3) {
        var r3 = null == t ? void 0 : t.document.querySelector(e3);
        if (r3) return r3;
      }
    }
    Lo(i3) {
      var e3 = "y" === i3 ? "scrollTop" : "scrollLeft";
      if (this.Oo) {
        var r3 = this.scrollElement();
        return r3 && r3[e3] || 0;
      }
      return t ? "y" === i3 ? t.scrollY || t.pageYOffset || t.document.documentElement.scrollTop || 0 : t.scrollX || t.pageXOffset || t.document.documentElement.scrollLeft || 0 : 0;
    }
    scrollY() {
      return this.Lo("y");
    }
    scrollX() {
      return this.Lo("x");
    }
  };
  var Ya = (t3) => go(null == t3 ? void 0 : t3.config.mask_personal_data_properties, null == t3 ? void 0 : t3.config.custom_personal_data_properties, null == t3 ? void 0 : t3.config.disable_capture_url_hashes);
  var Qa = class {
    constructor(t3, i3, e3, r3) {
      this.Tt = (t4) => {
        var i4 = this.Do();
        if (!i4 || i4.sessionId !== t4) {
          var e4 = { sessionId: t4, props: this.$o(this._instance) };
          this.No.register({ [Ur]: e4 });
        }
      }, this._instance = t3, this.qo = i3, this.No = e3, this.$o = r3 || Ya, this.qo.onSessionId(this.Tt);
    }
    Do() {
      return this.No.props[Ur];
    }
    getSetOnceProps() {
      var t3, i3 = null == (t3 = this.Do()) ? void 0 : t3.props;
      return i3 ? "r" in i3 ? mo(i3, this._instance.config.disable_capture_url_hashes) : { $referring_domain: i3.referringDomain, $pathname: i3.initialPathName, utm_source: i3.utm_source, utm_campaign: i3.utm_campaign, utm_medium: i3.utm_medium, utm_content: i3.utm_content, utm_term: i3.utm_term } : {};
    }
    getSessionProps() {
      var t3 = {};
      return us(ps(this.getSetOnceProps()), ((i3, e3) => {
        "$current_url" === e3 && (e3 = "url"), t3["$session_entry_" + j(e3)] = i3;
      })), t3;
    }
  };
  var Xa = class {
    on(t3, i3) {
      return this.jo[t3] || (this.jo[t3] = []), this.jo[t3].push(i3), () => {
        this.jo[t3] = this.jo[t3].filter(((t4) => t4 !== i3));
      };
    }
    emit(t3, i3) {
      for (var e3 of this.jo[t3] || []) e3(i3);
      for (var r3 of this.jo["*"] || []) r3(t3, i3);
    }
    constructor() {
      this.jo = {};
    }
  };
  var Za = Be("[SessionId]");
  var tl = 864e5;
  var il = class {
    on(t3, i3) {
      return this.Bo.on(t3, i3);
    }
    constructor(t3, i3, e3) {
      var r3;
      if (this.Ho = null, this.zo = null, this.Uo = [], this.Wo = void 0, this.Vo = false, this.Bo = new Xa(), this.Go = (t4, i4) => !(!tt(t4) || !tt(i4)) && Math.abs(t4 - i4) > this.sessionTimeoutMs, !t3.persistence) throw new Error("SessionIdManager requires a PostHogPersistence instance");
      if (t3.config.cookieless_mode === Zr) throw new Error('SessionIdManager cannot be used with cookieless_mode="always"');
      this.mn = t3.config, this.No = t3.persistence, this.It = void 0, this.Pe = void 0, this._sessionStartTimestamp = null, this.Zo = void 0, this._sessionActivityTimestamp = null, this.Qo = i3 || Ts, this.Jo = e3 || Ts;
      var s3 = this.mn.persistence_name || this.mn.token;
      if (this._sessionTimeoutMs = 1e3 * ct(this.mn.session_idle_timeout_seconds || 1800, 60, 36e3, Za.createLogger("session_idle_timeout_seconds"), 1800), t3.register({ $configured_session_timeout_ms: this._sessionTimeoutMs }), this.Ko(), this.Yo = "ph_" + s3 + "_window_id", this.Xo = "ph_" + s3 + "_primary_window_exists", this.tl()) {
        var n3 = Gs.ui(this.Yo), o3 = Gs.ui(this.Xo);
        n3 && !o3 ? this.It = n3 : Gs.oi(this.Yo), Gs.ni(this.Xo, true);
      }
      null != (r3 = this.mn.bootstrap) && r3.sessionID && this.setBootstrapSessionId(this.mn.bootstrap.sessionID), this.el();
    }
    get sessionTimeoutMs() {
      return this._sessionTimeoutMs;
    }
    onSessionId(t3) {
      return K(this.Uo) && (this.Uo = []), this.Uo.push(t3), this.Pe && t3(this.Pe, this.It), () => {
        this.Uo = this.Uo.filter(((i3) => i3 !== t3));
      };
    }
    tl() {
      return "memory" !== this.mn.persistence && !this.No.Ca && Gs.ii();
    }
    il(t3) {
      t3 !== this.It && (this.It = t3, this.tl() && Gs.ni(this.Yo, t3));
    }
    rl() {
      return this.It ? this.It : this.tl() ? Gs.ui(this.Yo) : null;
    }
    nl(t3) {
      var i3 = this.Ho;
      return !Q(i3) && !Q(t3) && 5e3 > Math.abs(t3 - i3);
    }
    sl(t3, i3, e3) {
      var r3 = i3 !== this._sessionActivityTimestamp, s3 = !(t3 !== this.Pe || e3 !== this._sessionStartTimestamp);
      this._sessionStartTimestamp = e3, this._sessionActivityTimestamp = i3, this.Pe = t3, s3 && !r3 || s3 && this.nl(i3) || (this.Ho = i3, this.No.register({ [pr]: [i3, t3, e3] }));
    }
    al() {
      var t3, i3 = null == (t3 = this.mn) ? void 0 : t3.persistence_save_debounce_ms;
      return tt(i3) && i3 > 0;
    }
    ol() {
      this.al() ? this.No.refreshKey(pr) : (this.No.flush(), this.No.load());
    }
    ll() {
      var t3;
      if (!Q(this._sessionActivityTimestamp) && this._sessionActivityTimestamp !== this.Ho) {
        this.ol();
        var i3 = this.ul();
        i3[1] === this.Pe && i3[2] === this._sessionStartTimestamp && (this.Ho = this._sessionActivityTimestamp, this.No.register({ [pr]: [this._sessionActivityTimestamp, null !== (t3 = this.Pe) && void 0 !== t3 ? t3 : null, this._sessionStartTimestamp] }), this.No.flush());
      }
    }
    hl() {
      var t3 = this.ul()[0], i3 = tt(t3) ? t3 : 0, e3 = tt(this._sessionActivityTimestamp) ? this._sessionActivityTimestamp : 0;
      return Math.max(i3, e3);
    }
    dl(t3) {
      return this.ol(), this.Go(t3, this.hl());
    }
    ul() {
      var t3 = this.No.props[pr];
      return q(t3) && 2 === t3.length && t3.push(t3[0]), t3 || [0, null, 0];
    }
    resetSessionId() {
      this.Ho = null, this.Zo = void 0, clearTimeout(this.vl), this.vl = void 0, this.sl(null, null, null);
    }
    setBootstrapSessionId(t3, i3) {
      void 0 === i3 && (i3 = false);
      var e3 = (function(t4, i4) {
        void 0 === i4 && (i4 = (/* @__PURE__ */ new Date()).getTime());
        try {
          var e4 = ((t5) => {
            var i5 = t5.replace(/-/g, "");
            if (32 !== i5.length) throw new Error("Not a valid UUID");
            if ("7" !== i5[12]) throw new Error("Not a UUIDv7");
            return parseInt(i5.substring(0, 12), 16);
          })(t4);
          return e4 > i4 + 6e4 ? void Za.error("Bootstrap sessionID cannot be in the future") : e4;
        } catch (t5) {
          return void Za.error("Invalid sessionID in bootstrap", t5);
        }
      })(t3);
      return !K(e3) && (i3 ? this.Zo = { sessionId: t3, sessionStartTimestamp: e3 } : this.sl(t3, (/* @__PURE__ */ new Date()).getTime(), e3), true);
    }
    destroy() {
      this.Vo = true, this.ll(), clearTimeout(this.vl), this.vl = void 0, this.Wo && t && (t.removeEventListener(ss, this.Wo, { capture: false }), this.Wo = void 0), this.Uo = [];
    }
    el() {
      this.Wo = () => {
        this.ll(), this.tl() && Gs.oi(this.Xo);
      }, ms(t, ss, this.Wo, { capture: false });
    }
    checkAndGetSessionAndWindowId(t3, i3, e3) {
      if (void 0 === t3 && (t3 = false), void 0 === i3 && (i3 = null), void 0 === e3 && (e3 = false), this.mn.cookieless_mode === Zr) throw new Error('checkAndGetSessionAndWindowId should not be called with cookieless_mode="always"');
      var r3 = i3 || (/* @__PURE__ */ new Date()).getTime(), s3 = this.Pe;
      if (e3) this.zo = r3;
      else if (Q(this.zo) || this.zo > r3 || r3 - this.zo >= 1e3) {
        var n3, o3;
        null == (n3 = (o3 = this.No).syncCookieProperties) || n3.call(o3), this.zo = r3;
      }
      var a3 = this.ul(), l3 = a3[1], h3 = a3[2], u3 = !K(s3) && l3 !== s3, d3 = this.hl(), v3 = this.rl(), c3 = this.Zo, f3 = !!c3 && (c3.sessionStartTimestamp > r3 + 6e4 || r3 - c3.sessionStartTimestamp > tl), p3 = c3 ? f3 : tt(h3) && Math.abs(r3 - h3) > tl, _3 = false, g3 = u3, m3 = !l3 || !!c3, y3 = l3, b3 = !m3 && !t3 && this.Go(r3, d3);
      if (b3) {
        (b3 = this.dl(r3)) || Za.info("cross-tab refresh kept the session alive", { sessionId: l3 });
        var w3 = this.ul();
        l3 = w3[1], h3 = w3[2];
      }
      if (m3 || b3 || p3) {
        g3 = false;
        var S3 = c3 && !f3;
        l3 = S3 ? c3.sessionId : this.Qo(), v3 = this.Jo(), Za.info("new session ID assigned", { sessionId: l3, windowId: v3, bootstrapped: !!S3, changeReason: { noSessionId: m3, activityTimeout: b3, sessionPastMaximumLength: p3 } }), h3 = S3 ? c3.sessionStartTimestamp : r3, this.Zo = void 0, _3 = true;
      } else v3 || (v3 = this.Jo(), _3 = true), (g3 = g3 || l3 !== y3) && (Za.info("adopted cross-tab session id", { sessionId: l3, windowId: v3 }), _3 = true);
      var x3 = tt(d3) && t3 && !p3 ? d3 : r3, E3 = tt(h3) ? h3 : (/* @__PURE__ */ new Date()).getTime();
      this.il(v3), this.sl(l3, x3, E3), t3 || this.Ko();
      var k3 = { noSessionId: m3, activityTimeout: b3, sessionPastMaximumLength: p3, crossTabAdoption: g3 };
      return _3 && this.Uo.forEach(((t4) => t4(l3, v3, k3))), { sessionId: l3, windowId: v3, sessionStartTimestamp: E3, changeReason: _3 ? k3 : void 0, lastActivityTimestamp: d3 };
    }
    Ko() {
      this.Vo || (clearTimeout(this.vl), this.vl = setTimeout((() => {
        if (!this.Vo) if (this.dl((/* @__PURE__ */ new Date()).getTime())) {
          var t3 = this.Pe;
          this.resetSessionId(), this.Bo.emit("forcedIdleReset", { idleSessionId: t3 });
        } else this.Ko();
      }), 1.1 * this.sessionTimeoutMs));
    }
  };
  var el = function(t3, i3) {
    if (!t3) return false;
    var e3 = t3.userAgent;
    if (e3 && D(e3, i3)) return true;
    try {
      var r3 = null == t3 ? void 0 : t3.userAgentData;
      if (null != r3 && r3.brands && r3.brands.some(((t4) => D(null == t4 ? void 0 : t4.brand, i3)))) return true;
    } catch (t4) {
    }
    return !!t3.webdriver;
  };
  function rl() {
    return (rl = p((function* () {
      var t3 = null == e ? void 0 : e.userAgentData;
      if (null != t3 && t3.getHighEntropyValues) try {
        var i3 = yield t3.getHighEntropyValues(["model"]), r3 = null == i3 ? void 0 : i3.model;
        return J(r3) && r3.length > 0 ? r3 : void 0;
      } catch (t4) {
        return void Ue.info("Unable to resolve $device_model from userAgentData.getHighEntropyValues", t4);
      }
    }))).apply(this, arguments);
  }
  function sl(t3) {
    var i3;
    return !(null == (i3 = t3.conditions) || null == (i3 = i3.events) || null == (i3 = i3.values) || !i3.length);
  }
  var nl = (t3, i3) => {
    if (!((t4) => {
      try {
        new RegExp(t4);
      } catch (t5) {
        return false;
      }
      return true;
    })(i3)) return false;
    try {
      return new RegExp(i3).test(t3);
    } catch (t4) {
      return false;
    }
  };
  var ol = (t3) => t3.toLowerCase();
  var al = { exact: (t3, i3) => i3.some(((i4) => t3.some(((t4) => i4 === t4)))), is_not: (t3, i3) => i3.every(((i4) => t3.every(((t4) => i4 !== t4)))), regex: (t3, i3) => i3.some(((i4) => t3.some(((t4) => nl(i4, t4))))), not_regex: (t3, i3) => i3.every(((i4) => t3.every(((t4) => !nl(i4, t4))))), icontains: (t3, i3) => i3.map(ol).some(((i4) => t3.map(ol).some(((t4) => i4.includes(t4))))), not_icontains: (t3, i3) => i3.map(ol).every(((i4) => t3.map(ol).every(((t4) => !i4.includes(t4))))), gt: (t3, i3) => i3.some(((i4) => {
    var e3 = parseFloat(i4);
    return !isNaN(e3) && t3.some(((t4) => e3 > parseFloat(t4)));
  })), lt: (t3, i3) => i3.some(((i4) => {
    var e3 = parseFloat(i4);
    return !isNaN(e3) && t3.some(((t4) => e3 < parseFloat(t4)));
  })) };
  function ll(t3, i3) {
    return !t3 || Object.entries(t3).every(((t4) => {
      var e3 = t4[1], r3 = null == i3 ? void 0 : i3[t4[0]];
      if (null == r3) return false;
      var s3 = al[e3.operator];
      return !!s3 && s3(e3.values, [String(r3)]);
    }));
  }
  function hl(t3, i3, e3) {
    return Xn({ distinct_id: t3, userPropertiesToSet: i3, userPropertiesToSetOnce: e3 });
  }
  var ul = "custom";
  var dl = "i.posthog.com";
  var vl = /^\/static\//;
  var cl = ["/s/", "/e/", "/i/"];
  var fl = class {
    constructor(t3) {
      this.cl = {}, this.instance = t3;
    }
    get apiHost() {
      var t3 = this.instance.config.api_host.trim().replace(/\/$/, "");
      return "https://app.posthog.com" === t3 ? "https://us.i.posthog.com" : t3;
    }
    get flagsApiHost() {
      var t3 = this.instance.config.flags_api_host;
      return t3 ? t3.trim().replace(/\/$/, "") : this.apiHost;
    }
    get uiHost() {
      var t3, i3 = null == (t3 = this.instance.config.ui_host) ? void 0 : t3.replace(/\/$/, "");
      return i3 || (i3 = this.apiHost.replace("." + dl, ".posthog.com")), "https://app.posthog.com" === i3 ? "https://us.posthog.com" : i3;
    }
    get region() {
      return this.cl[this.apiHost] || (this.cl[this.apiHost] = /https:\/\/(app|us|us-assets)(\.i)?\.posthog\.com/i.test(this.apiHost) ? "us" : /https:\/\/(eu|eu-assets)(\.i)?\.posthog\.com/i.test(this.apiHost) ? "eu" : ul), this.cl[this.apiHost];
    }
    fl(t3) {
      if (vl.test(t3)) {
        var i3 = this.instance.config.asset_host;
        if ("string" == typeof i3) return i3.trim().replace(/\/$/, "") || void 0;
      }
    }
    pl(t3) {
      var i3 = Zn(t3);
      return i3 ? i3.protocol + "//" + i3.host + i3.pathname : void 0;
    }
    gl(t3, i3, e3) {
      if ("ui" === t3) return e3;
      var r3 = e3, s3 = this.instance.config.rewriteRequestPath;
      if (s3) {
        var n3, o3 = (null == (n3 = Zn(e3)) ? void 0 : n3.href) || e3;
        r3 = s3(new URL(o3)).toString();
      }
      if (s3 && "api" === t3 && cl.some(((t4) => 0 === i3.indexOf(t4)))) {
        var a3 = this.pl(r3);
        if (a3) {
          var l3, h3 = this.apiHost, u3 = this.ml;
          (null == (l3 = u3) ? void 0 : l3.apiHost) === h3 && u3.rewriteRequestPath === s3 || (u3 = { apiHost: h3, rewriteRequestPath: s3, urls: /* @__PURE__ */ new Set() }, this.ml = u3), u3.urls.add(a3);
        }
      }
      return r3;
    }
    isIngestionEndpoint(t3) {
      var i3 = this.ml, e3 = this.pl(t3);
      return (null == i3 ? void 0 : i3.apiHost) === this.apiHost && i3.rewriteRequestPath === this.instance.config.rewriteRequestPath && !!e3 && i3.urls.has(e3);
    }
    endpointFor(t3, i3) {
      if (void 0 === i3 && (i3 = ""), i3 && (i3 = "/" === i3[0] ? i3 : "/" + i3), "ui" === t3) return this.gl(t3, i3, this.uiHost + i3);
      if ("flags" === t3) return this.gl(t3, i3, this.flagsApiHost + i3);
      if ("assets" === t3) {
        var e3 = this.fl(i3);
        if (e3) return this.gl(t3, i3, "" + e3 + i3);
      }
      if (this.region === ul) return this.gl(t3, i3, this.apiHost + i3);
      var r3 = dl + i3;
      switch (t3) {
        case "assets":
          return this.gl(t3, i3, "https://" + this.region + "-assets." + r3);
        case "api":
          return this.gl(t3, i3, "https://" + this.region + "." + r3);
      }
    }
  };
  var pl = Be("[Surveys]");
  var _l = "seenSurvey_";
  var gl = (t3) => {
    try {
      var i3 = ((t4) => ((t5, i4) => "" + _l + (function(t6) {
        return t6.current_iteration && t6.current_iteration > 0 ? t6.id + "_" + t6.current_iteration : t6.id;
      })(i4))(0, t4))(t3);
      if (localStorage.getItem(i3)) return;
      localStorage.setItem(i3, "true");
    } catch (t4) {
      pl.error("Failed to persist survey seen state", t4);
    }
  };
  var ml = [No.Popover, No.Widget, No.API];
  var yl = { ignoreConditions: false, ignoreDelay: false, displayType: Ho.Popover };
  var bl = Be("[PostHog ExternalIntegrations]");
  var wl = { intercom: "intercom-integration", crispChat: "crisp-chat-integration" };
  var Sl = class {
    constructor(t3) {
      this._instance = t3;
    }
    Ys(t3, i3) {
      var e3;
      null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this._instance, t3, ((t4) => {
        if (t4) return bl.error("failed to load script", t4);
        i3();
      }));
    }
    startIfEnabledOrStop() {
      var t3 = this, i3 = function() {
        var i4, r4, s3, n3 = e3[0], o3 = e3[1];
        !o3 || null != (i4 = v.__PosthogExtensions__) && null != (i4 = i4.integrations) && i4[n3] || t3.Ys(wl[n3], (() => {
          var i5;
          null == (i5 = v.__PosthogExtensions__) || null == (i5 = i5.integrations) || null == (i5 = i5[n3]) || i5.start(t3._instance);
        })), !o3 && null != (r4 = v.__PosthogExtensions__) && null != (r4 = r4.integrations) && r4[n3] && (null == (s3 = v.__PosthogExtensions__) || null == (s3 = s3.integrations) || null == (s3 = s3[n3]) || s3.stop());
      };
      for (var e3 of Object.entries(null !== (r3 = this._instance.config.integrations) && void 0 !== r3 ? r3 : {})) {
        var r3;
        i3();
      }
    }
  };
  var xl = class {
    constructor(t3, i3) {
      this.A = t3, this.Ns = i3, this.yl = /* @__PURE__ */ new Map(), this.Os = false;
    }
    add(t3) {
      var i3 = this;
      return p((function* () {
        if (i3.Os) throw new Error("Cannot add an extension to a disposed ExtensionRuntime");
        if (i3.yl.has(t3.name)) throw new Error('Browser extension "' + t3.name + '" is already registered');
        i3.yl.set(t3.name, t3);
        try {
          var e3 = t3.setup(i3.Ns);
          e3 && (yield e3);
        } catch (e4) {
          var r3 = i3.yl.get(t3.name) === t3;
          r3 && i3.yl.delete(t3.name), i3.A.error('Failed to set up browser extension "' + t3.name + '"', e4), r3 && i3.bl(t3);
        }
      }))();
    }
    getExtension(t3) {
      return this.yl.get(t3);
    }
    dispose() {
      if (!this.Os) {
        this.Os = true;
        var t3 = Array.from(this.yl.values()).reverse();
        for (var i3 of (this.yl.clear(), t3)) this.bl(i3);
      }
    }
    bl(t3) {
      try {
        var i3 = null == t3.dispose ? void 0 : t3.dispose();
        i3 && V(i3.then) && i3.then(void 0, ((i4) => {
          this.A.error('Failed to dispose browser extension "' + t3.name + '"', i4);
        }));
      } catch (i4) {
        this.A.error('Failed to dispose browser extension "' + t3.name + '"', i4);
      }
    }
  };
  var El = class {
    constructor(t3) {
      this._instance = t3;
    }
    initialize() {
    }
    get(t3) {
      var i3 = this._instance.persistence;
      if ("string" == typeof t3) return null == i3 ? void 0 : i3.get_property(t3);
      var e3 = {};
      for (var r3 of t3) {
        var s3 = null == i3 ? void 0 : i3.get_property(r3);
        K(s3) || (e3[r3] = s3);
      }
      return e3;
    }
    set(t3, i3) {
      var e3;
      null == (e3 = this._instance.persistence) || e3.register("string" == typeof t3 ? { [t3]: i3 } : t3);
    }
    remove(t3) {
      var i3;
      null == (i3 = this._instance.persistence) || i3.unregister(t3);
    }
  };
  var kl = "extensionsRemoteConfig";
  var Tl = class {
    constructor(t3) {
      this.Os = false, this.instance = t3, this.A = Ue, this._l = t3.wl, this.kv = new El(t3), this.onEvent = (t4) => Oo(this.instance.on("eventCaptured", ((i3) => {
        try {
          t4({ event: i3.event, properties: i3.properties });
        } catch (t5) {
          this.A.error("Browser extension event listener failed", t5);
        }
      }))), this.onRemoteConfig = (t4) => {
        if (this.Os) return Oo((() => {
        }));
        var i3 = (i4) => {
          try {
            t4(i4);
          } catch (t5) {
            this.A.error("Browser extension remote config listener failed", t5);
          }
        }, e3 = this.instance.kl.on(kl, i3);
        return this._l && i3(this._l), Oo(e3);
      }, this.Sl = new xl(Ue.createLogger("[BrowserExtensions]"), this);
    }
    get logger() {
      return this.A;
    }
    get distinctId() {
      return this.instance.get_distinct_id();
    }
    get anonymousId() {
      var t3;
      return null !== (t3 = this.instance.get_property(Je)) && void 0 !== t3 ? t3 : this.distinctId;
    }
    get deviceId() {
      var t3 = this.instance.get_property(Je);
      return "string" == typeof t3 ? t3 : void 0;
    }
    get library() {
      return { name: c.LIB_NAME, version: c.LIB_VERSION };
    }
    get initialPersonProperties() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.instance.persistence) ? void 0 : i3.get_initial_props()) && void 0 !== t3 ? t3 : {};
    }
    get groups() {
      return this.instance.getGroups();
    }
    get session() {
      try {
        var t3, i3, e3, r3, s3 = null == (t3 = this.instance.sessionManager) ? void 0 : t3.checkAndGetSessionAndWindowId(true);
        return { sessionId: null !== (i3 = null == s3 ? void 0 : s3.sessionId) && void 0 !== i3 ? i3 : "", windowId: null !== (e3 = null == s3 ? void 0 : s3.windowId) && void 0 !== e3 ? e3 : "", sessionStartTimestamp: null !== (r3 = null == s3 ? void 0 : s3.sessionStartTimestamp) && void 0 !== r3 ? r3 : 0 };
      } catch (t4) {
        return { sessionId: "", windowId: "", sessionStartTimestamp: 0 };
      }
    }
    get canCapture() {
      return this.instance.is_capturing();
    }
    get projectToken() {
      return this.instance.config.token;
    }
    add(t3) {
      return this.Sl.add(t3);
    }
    getExtension(t3) {
      return this.Sl.getExtension(t3);
    }
    capture(t3, i3, e3) {
      var r3 = this;
      return p((function* () {
        e3 ? r3.instance.capture(t3, i3, { timestamp: e3.timestamp, uuid: e3.uuid, $set: e3.set, $set_once: e3.setOnce }) : r3.instance.capture(t3, i3);
      }))();
    }
    registerDynamicEventProperties(t3) {
      return Oo(this.instance.xl(t3));
    }
    handleRemoteConfig(t3) {
      this.Os || (this._l = t3, this.instance.kl.emit(kl, t3));
    }
    sendRequest(t3, i3) {
      var e3 = this;
      return p((function* () {
        var r3;
        void 0 === i3 && (i3 = {});
        var s3 = e3.instance.requestRouter.endpointFor(null !== (r3 = i3.target) && void 0 !== r3 ? r3 : "api", t3), n3 = { method: i3.method, url: i3.query ? Aa(s3, i3.query) : s3, data: i3.body, headers: i3.headers, timeout: i3.timeoutMs, fireCallbackOnDrop: true, transport: i3.transport, compression: i3.compression, compressionFallback: "flags" === i3.target && "best-available" === i3.compression ? x.Base64 : void 0, timestampMode: i3.sentAt };
        return "sendBeacon" === i3.transport ? (e3.instance._send_request(n3), { statusCode: 202 }) : new Promise(((t4) => {
          n3.callback = t4, e3.instance._send_request(n3);
        }));
      }))();
    }
    dispose() {
      this.Os || (this.Os = true, this.Sl.dispose());
    }
  };
  var $l = {};
  var Pl = 0;
  var Rl = () => {
  };
  var Cl = 'Consent opt in/out is not valid with cookieless_mode="always" and will be ignored';
  var Ol = "Surveys module not available";
  var Il = "sanitize_properties is deprecated. Use before_send instead";
  var Fl = "Invalid value for property_denylist config: ";
  var Al = ["token", "distinct_id", Gr];
  var Ml = "posthog";
  var Dl = !Ca && -1 === (null == h ? void 0 : h.indexOf("MSIE")) && -1 === (null == h ? void 0 : h.indexOf("Mozilla"));
  var Nl = (t3) => {
    var i3 = {};
    return t3 && "unset" !== t3 ? ("2025-11-30" > t3 || (i3.strictMinimumDuration = true), "2026-05-30" > t3 || (i3.canvasCapture = { resolutionScale: 0.6 }), "2026-06-25" > t3 || (i3.streamNetworkBody = true), "2026-08-30" > t3 || (i3.captureJsonLd = true), i3) : i3;
  };
  var Ll = (i3) => {
    var e3;
    return _({ api_host: "https://us.i.posthog.com", flags_api_host: null, ui_host: null, asset_host: null, token: "", autocapture: true, cross_subdomain_cookie: gs(null == r ? void 0 : r.location), persistence: "localStorage+cookie", persistence_name: "", cookie_persisted_properties: [], loaded: Rl, save_campaign_params: true, custom_campaign_params: [], custom_blocked_useragents: [], save_referrer: true, capture_pageleave: "if_capture_pageview", defaults: null != i3 ? i3 : "unset", __preview_deferred_init_extensions: false, __preview_external_dependency_versioned_paths: false, __preview_cookie_wins_on_conflict: false, debug: s && J(null == s ? void 0 : s.search) && -1 !== s.search.indexOf("__posthog_debug=true") || false, cookie_expiration: 365, upgrade: false, disable_session_recording: false, disable_persistence: false, disable_web_experiments: true, disable_surveys: false, disable_surveys_automatic_display: false, disable_conversations: false, disable_product_tours: false, disableDeviceModel: false, disable_external_dependency_loading: false, strict_script_versioning: "fallback", enable_recording_console_log: void 0, secure_cookie: "https:" === (null == t || null == (e3 = t.location) ? void 0 : e3.protocol), ip: false, opt_out_capturing_by_default: false, opt_out_persistence_by_default: false, opt_out_useragent_filter: false, opt_out_capturing_persistence_type: "localStorage", consent_persistence_name: null, opt_out_capturing_cookie_prefix: null, opt_in_site_apps: false, property_denylist: [], respect_dnt: false, sanitize_properties: null, request_headers: {}, request_batching: true, properties_string_max_length: 65535, mask_all_element_attributes: false, mask_all_text: false, mask_personal_data_properties: false, custom_personal_data_properties: [], advanced_disable_flags: false, advanced_disable_decide: false, advanced_disable_feature_flags: false, advanced_disable_feature_flags_on_first_load: false, advanced_only_evaluate_survey_feature_flags: false, advanced_feature_flags_dedup_per_session: false, advanced_enable_surveys: false, advanced_disable_toolbar_metrics: false, feature_flag_request_timeout_ms: 3e3, surveys_request_timeout_ms: 1e4, on_request_error(t3) {
      Ue.error("Bad HTTP status: " + t3.statusCode + " " + t3.text);
    }, get_device_id: (t3) => t3, capture_performance: void 0, name: "posthog", bootstrap: {}, disable_compression: false, session_idle_timeout_seconds: 1800, person_profiles: es, before_send: void 0, get_current_url: void 0, request_queue_config: { flush_interval_ms: Va }, error_tracking: {}, _onCapture: Rl }, ((t3) => ({ rageclick: t3 && t3 >= "2026-05-30" ? { content_ignorelist: mn, ignore_text_selection: true } : !t3 || "2025-11-30" > t3 || { content_ignorelist: true }, capture_pageview: !t3 || "2025-05-24" > t3 || "history_change", session_recording: Nl(t3), external_scripts_inject_target: t3 && t3 >= "2026-01-30" ? "head" : "body", internal_or_test_user_hostname: t3 && t3 >= "2026-01-30" ? /^(localhost|127\.0\.0\.1)$/ : void 0, persistence_save_debounce_ms: t3 && t3 >= "2026-05-30" ? 250 : 0, split_storage: !(!t3 || "2026-05-30" > t3), detect_google_search_app: !(!t3 || "2026-05-30" > t3), disable_capture_url_hashes: !(!t3 || "2026-06-25" > t3), cookieWinsOnConflict: !(!t3 || "unset" === t3 || "2026-08-29" > t3) }))(i3));
  };
  var jl = [["process_person", "person_profiles"], ["xhr_headers", "request_headers"], ["cookie_name", "persistence_name"], ["disable_cookie", "disable_persistence"], ["__preview_disable_beacon", "disable_beacon"], ["store_google", "save_campaign_params"], ["verbose", "debug"], ["__preview_cookie_wins_on_conflict", "cookieWinsOnConflict"]];
  var Ul = (t3) => {
    var i3 = {};
    for (var e3 of jl) {
      var r3 = e3[0], s3 = e3[1];
      K(t3[r3]) || (i3[s3] = t3[r3]);
    }
    var n3 = ds({}, i3, t3), o3 = t3.__preview_external_dependency_versioned_paths;
    return K(o3) || (K(t3.strict_script_versioning) && (n3.strict_script_versioning = !!o3), J(o3) && K(t3.asset_host) && (n3.asset_host = o3)), q(t3.property_blacklist) && (K(t3.property_denylist) ? n3.property_denylist = t3.property_blacklist : q(t3.property_denylist) ? n3.property_denylist = [...t3.property_blacklist, ...t3.property_denylist] : Ue.error(Fl + t3.property_denylist)), n3;
  };
  var Bl = class {
    constructor() {
      this.__forceAllowLocalhost = false;
    }
    get Cl() {
      return this.__forceAllowLocalhost;
    }
    set Cl(t3) {
      Ue.error("WebPerformanceObserver is deprecated and has no impact on network capture. Use `_forceAllowLocalhostNetworkCapture` on `posthog.sessionRecording`"), this.__forceAllowLocalhost = t3;
    }
  };
  var zl = class _zl {
    Tl(t3) {
      if (t3) {
        var i3 = this.yl.indexOf(t3);
        -1 !== i3 && this.yl.splice(i3, 1);
      }
    }
    Ml(t3, i3) {
      return this.Tl(t3), this.yl.push(i3), null == i3.initialize || i3.initialize(), i3;
    }
    El() {
      return this.config.cookieless_mode === Zr || this.config.cookieless_mode === Xr && this.consent.isRejected();
    }
    Il() {
      if (!this.Rl && !this.config.segment && !this.El()) {
        var t3, i3, e3, r3 = "memory" === this.config.persistence || "sessionStorage" === this.config.persistence;
        (r3 || this.config.disable_persistence) && (this.Pl || (r3 ? (t3 = "persistence is set to '" + this.config.persistence + "'", i3 = "memory" === this.config.persistence ? "on every page load" : "for every new browser tab or window", e3 = "Either set persistence to 'localStorage+cookie', or keep this persistence and pass a stable ID through bootstrap.distinctID.") : (t3 = "persistence is disabled (disable_persistence is true)", i3 = "on every page load", e3 = "Either set disable_persistence to false, or keep persistence disabled and pass a stable ID through bootstrap.distinctID."), this.Rl = true, console.warn("[PostHog.js]", t3 + " but no bootstrap.distinctID was provided. PostHog will mint a new distinct ID " + i3 + ", so calling identify() merges a new ID onto the person each time. A person can then pass the distinct-ID limit and its events stop appearing on person pages and the session tab. " + e3)));
      }
    }
    Al() {
      if (!this.El() && this.get_distinct_id() === Wr) {
        var t3 = this.persistence;
        if (t3) {
          this.Fl() || t3.load(true);
          var i3 = this.get_distinct_id();
          if (!i3 || i3 === Wr) {
            var e3 = this.config.get_device_id(Ts());
            this.register({ distinct_id: e3, $device_id: e3 }), t3.set_property(jr, ts);
          }
          this.Ol();
        }
      }
    }
    get decideEndpointWasHit() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.featureFlags) ? void 0 : i3.hasLoadedFlags) && void 0 !== t3 && t3;
    }
    get flagsEndpointWasHit() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.featureFlags) ? void 0 : i3.hasLoadedFlags) && void 0 !== t3 && t3;
    }
    constructor() {
      var t3;
      this.webPerformance = new Bl(), this.Ll = false, this.version = c.LIB_VERSION, this.Dl = /* @__PURE__ */ new Set(), this.$l = "", this.kl = new Xa(), this.yl = [], this.Nl = [], this.Pl = false, this.Rl = false, this._calculate_event_properties = this.calculateEventProperties.bind(this), this.config = Ll(), this.SentryIntegration = Wn, this.sentryIntegration = (t4) => (function(t5, i4) {
        var e3 = Vn(t5, i4);
        return { name: qn, processEvent: (t6) => e3(t6) };
      })(this, t4), this.__request_queue = [], this.__loaded = false, this.analyticsDefaultEndpoint = "/e/", this.ql = false, this.jl = null, this.Bl = null, this.Hl = null, this.scrollManager = new Ja(this), this.pageViewManager = new Gn(this), this.rateLimiter = new Ko(this), this.requestRouter = new fl(this), this.consent = new Ks(this), this.externalIntegrations = new Sl(this);
      var i3 = null !== (t3 = _zl.__defaultExtensionClasses) && void 0 !== t3 ? t3 : {};
      this.featureFlags = i3.featureFlags && new i3.featureFlags(this), this.toolbar = i3.toolbar && new i3.toolbar(this), this.surveys = i3.surveys && new i3.surveys(this), this.conversations = i3.conversations && new i3.conversations(this), this.logs = i3.logs && new i3.logs(this), this.metrics = i3.metrics && new i3.metrics(this), this.experiments = i3.experiments && new i3.experiments(this), this.exceptions = i3.exceptions && new i3.exceptions(this), this.people = { set: (t4, i4, e3) => {
        var r3 = J(t4) ? { [t4]: i4 } : t4;
        this.setPersonProperties(r3), null == e3 || e3({});
      }, set_once: (t4, i4, e3) => {
        var r3 = J(t4) ? { [t4]: i4 } : t4;
        this.setPersonProperties(void 0, r3), null == e3 || e3({});
      } }, this.on("eventCaptured", ((t4) => Ue.info('send "' + (null == t4 ? void 0 : t4.event) + '"', t4)));
    }
    init(t3, i3, e3) {
      if (e3 && e3 !== Ml) {
        var r3, s3 = null !== (r3 = $l[e3]) && void 0 !== r3 ? r3 : new _zl();
        return s3._init(t3, i3, e3), $l[e3] = s3, $l[Ml][e3] = s3, s3;
      }
      return this._init(t3, i3, e3);
    }
    _init(i3, e3, r3) {
      var s3, n3, o3;
      void 0 === e3 && (e3 = {});
      var a3, l3 = J(i3) ? i3.trim() : "";
      if (!l3) return Ue.critical("PostHog was initialized without a token. This likely indicates a misconfiguration. Please check the first argument passed to posthog.init()"), this;
      if (this.__loaded) return l3 !== (null == (a3 = this.config) ? void 0 : a3.token) ? console.warn("[PostHog.js]", "You have already initialized PostHog with a different project token! Re-initializing is a no-op, so events will keep going to the project this instance was initialized with. To capture into a second project, load PostHog once, then initialize a named instance after the SDK has loaded, e.g. posthog.init('" + l3 + "', { ... }, 'project2')") : console.warn("[PostHog.js]", "You have already initialized PostHog! Re-initializing is a no-op"), this;
      this.__loaded = true, this.config = Ll(e3.defaults), e3.debug = this.zl(e3.debug), this.Ul = e3, this.Wl = [], e3.person_profiles ? this.Bl = e3.person_profiles : e3.process_person && (this.Bl = e3.process_person);
      var h3 = Ll(e3.defaults), u3 = Ul(e3), d3 = ds({}, h3, u3, { name: r3, token: l3 });
      W(h3.rageclick) && W(u3.rageclick) && (d3.rageclick = ds({}, h3.rageclick, u3.rageclick)), W(h3.session_recording) && W(u3.session_recording) && (d3.session_recording = ds({}, h3.session_recording, u3.session_recording)), this.set_config(d3), this.config.on_xhr_error && Ue.error("on_xhr_error is deprecated. Use on_request_error instead"), this.compression = e3.disable_compression ? void 0 : Io.GZipJS;
      var v3 = this.Fl();
      if (this.persistence = new Co(this.config, v3), this.sessionPersistence = "sessionStorage" === this.config.persistence || "memory" === this.config.persistence ? this.persistence : new Co(_({}, this.config, { persistence: "sessionStorage" }), v3, false), this.$l = "ph_" + (this.config.persistence_name || this.config.token) + "_session_registered_properties", "memory" !== this.config.persistence && !v3 && Gs.ii()) {
        var f3 = Gs.ui(this.$l);
        q(f3) && f3.forEach(((t3) => {
          J(t3) && this.Dl.add(t3);
        }));
      } else Gs.oi(this.$l);
      var p3 = _({}, this.persistence.props), g3 = _({}, this.sessionPersistence.props);
      this.register({ $initialization_time: (/* @__PURE__ */ new Date()).toISOString() }), this.Vl = new Wa(((t3) => this.Gl(t3)), this.config.request_queue_config), this.Zl = new Ka(this), this.__request_queue = [];
      var m3 = this.El();
      m3 || (this.sessionManager = new il(this), this.sessionPropsManager = new Qa(this, this.sessionManager, this.persistence), this.sessionManager.onSessionId(((t3, i4, e4) => {
        (null != e4 && e4.activityTimeout || null != e4 && e4.sessionPastMaximumLength || null != e4 && e4.crossTabAdoption) && this.Ql();
      }))), this.Jl(), this.config.__preview_deferred_init_extensions ? (Ue.info("Deferring extension initialization to improve startup performance"), setTimeout((() => {
        this.Kl(m3);
      }), 0)) : (Ue.info("Initializing extensions synchronously"), this.Kl(m3)), c.DEBUG = c.DEBUG || this.config.debug, c.DEBUG && Ue.info("Starting in debug mode", { this: this, config: e3, thisC: _({}, this.config), p: p3, s: g3 }), !this.config.identity_distinct_id || null != (s3 = e3.bootstrap) && s3.distinctID || (e3.bootstrap = _({}, e3.bootstrap, { distinctID: this.config.identity_distinct_id, isIdentifiedID: true }));
      var y3 = null == (n3 = e3.bootstrap) ? void 0 : n3.distinctID;
      if (this.Pl = !!y3 && !Y(y3), void 0 !== (null == (o3 = e3.bootstrap) ? void 0 : o3.distinctID)) {
        var b3 = e3.bootstrap.distinctID, w3 = this.get_distinct_id(), S3 = this.persistence.get_property(jr);
        if (e3.bootstrap.isIdentifiedID && null != w3 && w3 !== b3 && S3 === ts) this.identify(b3);
        else if (e3.bootstrap.isIdentifiedID && null != w3 && w3 !== b3 && S3 === is) Ue.warn("Bootstrap distinctID differs from an already-identified user. The existing identity is preserved. Call reset() before reinitializing if you intend to switch users.");
        else {
          var x3 = this.config.get_device_id(Ts()), E3 = e3.bootstrap.isIdentifiedID ? x3 : b3;
          this.persistence.set_property(jr, e3.bootstrap.isIdentifiedID ? is : ts), this.register({ distinct_id: b3, $device_id: E3 });
        }
      }
      if (m3) this.register_once({ distinct_id: Wr, $device_id: null }, "");
      else if (!this.get_distinct_id()) {
        var k3 = this.config.get_device_id(Ts());
        this.register_once({ distinct_id: k3, $device_id: k3 }, ""), this.persistence.set_property(jr, ts);
      }
      return ms(t, "onpagehide" in self ? "pagehide" : "unload", this._handle_unload.bind(this), { passive: false }), e3.segment ? (function(t3, i4) {
        var e4 = t3.config.segment;
        if (!e4) return i4();
        !(function(t4, i5) {
          var e5 = t4.config.segment;
          if (!e5) return i5();
          var r4 = (e6) => {
            var r5 = () => e6.anonymousId() || Ts();
            t4.config.get_device_id = r5, e6.id() && (t4.register({ distinct_id: e6.id(), $device_id: r5() }), t4.persistence.set_property(jr, is)), i5();
          }, s4 = e5.user();
          "then" in s4 && V(s4.then) ? s4.then(r4) : r4(s4);
        })(t3, (() => {
          e4.register(((t4) => {
            "undefined" != typeof Promise && Promise.resolve || Hn.warn("This browser does not have Promise support, and can not use the segment integration");
            var i5 = (i6, e5) => {
              if (!e5) return i6;
              i6.event.userId || i6.event.anonymousId === t4.get_distinct_id() || (Hn.info("No userId set, resetting PostHog"), t4.reset()), i6.event.userId && i6.event.userId !== t4.get_distinct_id() && (Hn.info("UserId set, identifying with PostHog"), t4.identify(i6.event.userId));
              var r4 = t4.calculateEventProperties(e5, i6.event.properties);
              return i6.event.properties = Object.assign({}, r4, i6.event.properties), i6;
            };
            return { name: "PostHog JS", type: "enrichment", version: "1.0.0", isLoaded: () => true, load: () => Promise.resolve(), track: (t5) => i5(t5, t5.event.event), page: (t5) => i5(t5, ns), identify: (t5) => i5(t5, as), screen: (t5) => i5(t5, "$screen") };
          })(t3)).then((() => {
            i4();
          }));
        }));
      })(this, (() => this.Yl())) : this.Yl(), V(this.config._onCapture) && this.config._onCapture !== Rl && (Ue.warn("onCapture is deprecated. Please use `before_send` instead"), this.on("eventCaptured", ((t3) => this.config._onCapture(t3.event, t3)))), this.config.ip && Ue.warn('The `ip` config option has NO EFFECT AT ALL and has been deprecated. Use a custom transformation or "Discard IP data" project setting instead. See https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address for more information.'), this.config.disableDeviceModel || (function() {
        return rl.apply(this, arguments);
      })().then(((t3) => {
        t3 && this.register({ [Ye]: t3 });
      })).catch(Rl), this;
    }
    Xl(t3) {
      var i3 = t3;
      return J(i3.name) && V(i3.setup);
    }
    tu(t3, i3) {
      this.Xl(t3) ? i3.push((() => {
        this.eu().add(t3).catch((() => null == t3.dispose ? void 0 : t3.dispose())).catch(((i4) => {
          Ue.error('Failed to dispose browser extension "' + t3.name + '"', i4);
        }));
      })) : this.yl.push(t3);
    }
    Jl() {
      var t3, i3, e3, r3, s3, n3, o3 = null !== (t3 = null == (i3 = this.config.__extensionClasses) ? void 0 : i3.featureFlags) && void 0 !== t3 ? t3 : null == (e3 = _zl.__defaultExtensionClasses) ? void 0 : e3.featureFlags;
      o3 && (this.featureFlags && this.featureFlags instanceof o3 || (null == (r3 = this.iu) || r3.call(this), this.iu = void 0, this.featureFlags = new o3(this)), V(this.featureFlags.onReloading) && V(this.featureFlags.setup) ? this.iu || (this.iu = this.featureFlags.onReloading((() => {
        this.kl.emit("featureFlagsReloading", true);
      })), this.eu().add(this.featureFlags)) : null == (s3 = (n3 = this.featureFlags).initialize) || s3.call(n3));
    }
    Kl(t3) {
      var i3, e3, r3, s3, n3, o3, a3, l3 = performance.now(), h3 = _({}, _zl.__defaultExtensionClasses, this.config.__extensionClasses), u3 = [];
      h3.exceptions && this.yl.push(this.exceptions = null !== (i3 = this.exceptions) && void 0 !== i3 ? i3 : new h3.exceptions(this)), h3.historyAutocapture && this.yl.push(this.historyAutocapture = new h3.historyAutocapture(this)), h3.tracingHeaders && this.yl.push(this.tracingHeaders = new h3.tracingHeaders(this)), h3.siteApps && this.yl.push(this.siteApps = new h3.siteApps(this)), h3.sessionRecording && !t3 && this.yl.push(this.sessionRecording = new h3.sessionRecording(this)), this.config.disable_scroll_properties || u3.push((() => {
        this.scrollManager.startMeasuringScrollPosition();
      })), h3.autocapture && this.tu(this.autocapture = new h3.autocapture(this), u3), h3.surveys && this.tu(this.surveys = null !== (e3 = this.surveys) && void 0 !== e3 ? e3 : new h3.surveys(this), u3), h3.logs && this.tu(this.logs = null !== (r3 = this.logs) && void 0 !== r3 ? r3 : new h3.logs(this), u3), h3.metrics && this.yl.push(this.metrics = null !== (s3 = this.metrics) && void 0 !== s3 ? s3 : new h3.metrics(this)), h3.conversations && this.yl.push(this.conversations = null !== (n3 = this.conversations) && void 0 !== n3 ? n3 : new h3.conversations(this)), h3.productTours && this.yl.push(this.productTours = new h3.productTours(this)), h3.heatmaps && this.yl.push(this.heatmaps = new h3.heatmaps(this)), h3.webVitalsAutocapture && this.yl.push(this.webVitalsAutocapture = new h3.webVitalsAutocapture(this)), h3.exceptionObserver && this.yl.push(this.exceptionObserver = new h3.exceptionObserver(this)), h3.deadClicksAutocapture && this.yl.push(this.deadClicksAutocapture = new h3.deadClicksAutocapture(this, Bn)), h3.toolbar && this.yl.push(this.toolbar = null !== (o3 = this.toolbar) && void 0 !== o3 ? o3 : new h3.toolbar(this)), h3.experiments && this.yl.push(this.experiments = null !== (a3 = this.experiments) && void 0 !== a3 ? a3 : new h3.experiments(this)), this.yl.forEach(((t4) => {
        t4.initialize && u3.push((() => {
          null == t4.initialize || t4.initialize();
        }));
      })), u3.push((() => {
        if (this.ru) {
          var t4 = this.ru;
          this.ru = void 0, this.yl.forEach(((i4) => null == i4.onRemoteConfig ? void 0 : i4.onRemoteConfig(t4)));
        }
      })), this.nu(u3, l3);
    }
    nu(t3, i3) {
      for (; t3.length > 0; ) {
        if (this.config.__preview_deferred_init_extensions && performance.now() - i3 >= 30 && t3.length > 0) return void setTimeout((() => {
          this.nu(t3, i3);
        }), 0);
        var e3 = t3.shift();
        if (e3) try {
          e3();
        } catch (t4) {
          Ue.error("Error initializing extension:", t4);
        }
      }
      var r3 = Math.round(performance.now() - i3);
      this.register_for_session({ [Kr]: this.config.__preview_deferred_init_extensions ? "deferred" : "synchronous", [Jr]: r3 }), this.config.__preview_deferred_init_extensions && Ue.info("PostHog extensions initialized (" + r3 + "ms)");
    }
    ho(t3) {
      var i3;
      if (!r || !r.body) return Ue.info("document not ready yet, trying again in 500 milliseconds..."), void setTimeout((() => {
        this.ho(t3);
      }), 500);
      if (this.config.__preview_deferred_init_extensions && (this.ru = t3), this.wl = t3, this.compression = void 0, t3.ok) {
        var e3, s3 = t3.config;
        s3.supportedCompression && !this.config.disable_compression && (this.compression = N(s3.supportedCompression, Io.GZipJS) ? Io.GZipJS : N(s3.supportedCompression, Io.Base64) ? Io.Base64 : void 0), null != (e3 = s3.analytics) && e3.endpoint && (this.analyticsDefaultEndpoint = s3.analytics.endpoint);
      }
      this.set_config({ person_profiles: this.Bl ? this.Bl : es }), null == (i3 = this.su) || i3.handleRemoteConfig(t3), this.yl.forEach(((i4) => null == i4.onRemoteConfig ? void 0 : i4.onRemoteConfig(t3)));
    }
    Yl() {
      try {
        this.config.loaded(this);
      } catch (t4) {
        Ue.critical("`loaded` function failed", t4);
      }
      if (this.au(), this.config.internal_or_test_user_hostname && null != s && s.hostname) {
        var t3 = s.hostname, i3 = this.config.internal_or_test_user_hostname;
        ("string" == typeof i3 ? t3 === i3 : i3.test(t3)) && this.setInternalOrTestUser();
      }
      this.config.capture_pageview && setTimeout((() => {
        (this.consent.isOptedIn() || this.El()) && this.ou();
      }), 1), this.lu = new Yo(this), this.lu.load();
    }
    au() {
      var t3;
      this.is_capturing() && this.config.request_batching && (null == (t3 = this.Vl) || t3.enable());
    }
    _dom_loaded() {
      this.is_capturing() && hs(this.__request_queue, ((t3) => this.Gl(t3))), this.__request_queue = [], this.au();
    }
    _handle_unload() {
      var t3, i3, e3, r3, s3;
      null == (t3 = this.surveys) || null == t3.handlePageUnload || t3.handlePageUnload(), null == (i3 = this.metrics) || i3.flush("sendBeacon"), this.config.request_batching ? (this.uu() && this.capture(os), null == (e3 = this.logs) || e3.flushLogs("sendBeacon"), null == (r3 = this.Vl) || r3.unload(), null == (s3 = this.Zl) || s3.unload()) : this.uu() && this.capture(os, null, { transport: "sendBeacon" });
    }
    _send_request(t3) {
      var i3;
      this.__loaded ? Dl ? this.__request_queue.push(t3) : this.rateLimiter.isServerRateLimited(t3.batchKey) ? t3.fireCallbackOnDrop && (null == t3.callback || t3.callback({ statusCode: 429 })) : (t3.transport = t3.transport || this.config.api_transport, t3.headers = _({}, this.config.request_headers, t3.headers), t3.compression = "best-available" === t3.compression ? null !== (i3 = this.compression) && void 0 !== i3 ? i3 : t3.compressionFallback : t3.compression, (K(this.config.disable_beacon) ? this.config.__preview_disable_beacon : this.config.disable_beacon) && (t3.disableTransport = ["sendBeacon"]), t3.fetchOptions = t3.fetchOptions || this.config.fetch_options, ((t4) => {
        var i4, e3, r3, s3 = _({}, t4);
        s3.timeout = s3.timeout || 6e4;
        var n3, o3, a3, h3, u3, d3 = null !== (i4 = s3.transport) && void 0 !== i4 ? i4 : "fetch";
        "sendBeacon" === d3 && K(s3.compression) && s3.data && (s3.compression = Io.Base64), "POST" === s3.method && s3.data && ("capture-body" === s3.timestampMode ? s3.data = { api_key: null !== (o3 = null == (u3 = (h3 = (q(n3 = s3.data) ? n3 : [n3]).map(((t5) => _({}, t5, t5.timestamp instanceof Date && !isNaN(t5.timestamp.getTime()) ? { timestamp: t5.timestamp.toISOString() } : {}))))[0]) || null == (a3 = u3.properties) ? void 0 : a3.token) && void 0 !== o3 ? o3 : null == u3 ? void 0 : u3.token, batch: h3, sent_at: (/* @__PURE__ */ new Date()).toISOString() } : "body" === s3.timestampMode && (s3.data = (function(t5, i5) {
          return void 0 === i5 && (i5 = (/* @__PURE__ */ new Date()).toISOString()), q(t5) ? t5.map(((t6) => _({}, t6, { sent_at: i5 }))) : _({}, t5, { sent_at: i5 });
        })(s3.data))), s3.url = Ha(s3.url, s3.method, s3.compression, s3.timestampMode);
        var v3 = qa.filter(((t5) => !s3.disableTransport || !t5.transport || !s3.disableTransport.includes(t5.transport))), c3 = null !== (e3 = null == (r3 = (function(t5, i5) {
          for (var e4 = 0; t5.length > e4; e4++) if (t5[e4].transport === d3) return t5[e4];
        })(v3)) ? void 0 : r3.method) && void 0 !== e3 ? e3 : v3[0].method;
        if (!c3) throw new Error("No available transport method");
        var f3 = (t5) => {
          try {
            c3(t5);
          } catch (t6) {
            Ua(t6) ? Ue.warn(t6) : Ue.error(t6), null == s3.callback || s3.callback({ statusCode: 0, error: t6 });
          }
        };
        "sendBeacon" !== d3 && s3.data && s3.compression === Io.GZipJS && l && "undefined" != typeof Promise && !Ia ? La(s3).then(((t5) => {
          f3(t5);
        })).catch(((i5) => {
          if (Mi(i5)) return Ia = true, void f3(_({}, s3, { compression: void 0, url: Ha(t4.url, t4.method, void 0, t4.timestampMode) }));
          ((t5) => {
            if (!t5 || "object" != typeof t5) return false;
            var i6 = "name" in t5 ? String(t5.name) : "";
            return Mi(t5) || i6 === Ii;
          })(i5) && (Ia = true), f3(s3);
        })) : c3(s3);
      })(_({}, t3, { callback: (i4) => {
        var e3, r3;
        this.rateLimiter.checkForLimiting(i4), 400 > i4.statusCode || null == (e3 = (r3 = this.config).on_request_error) || e3.call(r3, i4), null == t3.callback || t3.callback(i4);
      } }))) : t3.fireCallbackOnDrop && (null == t3.callback || t3.callback({ statusCode: 0 }));
    }
    Gl(t3) {
      this.Zl ? this.Zl.retriableRequest(t3) : this._send_request(t3);
    }
    _execute_array(t3) {
      Pl++;
      try {
        var i3, e3 = [], r3 = [], s3 = [];
        hs(t3, ((t4) => {
          if (t4) if (q(i3 = t4[0])) s3.push(t4);
          else if (V(t4)) try {
            t4.call(this);
          } catch (i4) {
            Ue.error("Error executing queued PostHog call", t4, i4);
          }
          else q(t4) && "alias" === i3 ? e3.push(t4) : q(t4) && -1 !== i3.indexOf("capture") && V(this[i3]) ? s3.push(t4) : r3.push(t4);
        }));
        var n3 = function(t4, i4) {
          hs(t4, (function(t5) {
            try {
              if (q(t5[0])) {
                var e4 = i4;
                us(t5, (function(t6) {
                  e4 = e4[t6[0]].apply(e4, t6.slice(1));
                }));
              } else i4[t5[0]].apply(i4, t5.slice(1));
            } catch (i5) {
              Ue.error("Error executing queued PostHog call", t5, i5);
            }
          }));
        };
        n3(e3, this), n3(r3, this), n3(s3, this);
      } finally {
        Pl--;
      }
    }
    push(t3) {
      if (Pl > 0 && q(t3) && J(t3[0])) {
        var i3 = _zl.prototype[t3[0]];
        V(i3) && i3.apply(this, t3.slice(1));
      } else this._execute_array([t3]);
    }
    capture(t3, i3, e3) {
      var r3, s3, n3, o3, a3;
      if (this.__loaded && this.persistence && this.sessionPersistence && this.Vl) {
        if (this.is_capturing()) if (!K(t3) && J(t3)) {
          this.Al();
          var l3 = !this.config.opt_out_useragent_filter && this._is_bot();
          if (!l3 || this.config.__preview_capture_bot_pageviews) {
            var h3 = null != e3 && e3.skip_client_rate_limiting ? void 0 : this.rateLimiter.clientRateLimitContext();
            if (null == h3 || !h3.isRateLimited) {
              null != i3 && i3.$current_url && !J(null == i3 ? void 0 : i3.$current_url) && (Ue.error("Invalid `$current_url` property provided to `posthog.capture`. Input must be a string. Ignoring provided value."), null == i3 || delete i3.$current_url), "$exception" !== t3 || null != e3 && e3.hu || Ue.warn("Using `posthog.capture('$exception')` is unreliable because it does not attach required metadata. Use `posthog.captureException(error)` instead, which attaches required metadata automatically."), this.sessionPersistence.update_search_keyword(), this.config.save_campaign_params && this.sessionPersistence.update_campaign_params(), this.config.save_referrer && this.sessionPersistence.update_referrer_info(), (this.config.save_campaign_params || this.config.save_referrer) && this.persistence.set_initial_person_info();
              var u3 = /* @__PURE__ */ new Date(), d3 = (null == e3 ? void 0 : e3.timestamp) || u3, v3 = ki(null == e3 ? void 0 : e3.uuid, Ts), c3 = { uuid: v3, event: t3, properties: this.calculateEventProperties(t3, i3 || {}, d3, v3) };
              t3 === ns && this.config.__preview_capture_bot_pageviews && l3 && (c3.event = "$bot_pageview", c3.properties.$browser_type = "bot"), h3 && (c3.properties.$lib_rate_limit_remaining_tokens = h3.remainingTokens);
              var f3 = "$feature_flag_called" === t3 && false === c3.properties.$feature_flag_has_experiment && true === this.get_property(xr);
              (null == e3 ? void 0 : e3.$set) && !f3 && (c3.$set = null == e3 ? void 0 : e3.$set);
              var p3 = null == e3 ? void 0 : e3.$unset;
              p3 && (c3.$unset = p3);
              var g3, m3, y3, b3 = f3 ? void 0 : this.du(null == e3 ? void 0 : e3.$set_once, t3 !== ls, t3 === as);
              if (b3 && (c3.$set_once = b3), null != e3 && e3._noTruncate || (s3 = this.config.properties_string_max_length, n3 = c3, o3 = (t4) => J(t4) ? t4.slice(0, s3) : t4, a3 = /* @__PURE__ */ new Set(), c3 = (function t4(i4, e4) {
                if (i4 !== Object(i4)) return o3 ? o3(i4) : i4;
                if (!a3.has(i4)) {
                  var r4;
                  if (a3.add(i4), q(i4)) r4 = [], hs(i4, ((i5) => {
                    r4.push(t4(i5));
                  }));
                  else {
                    var s4 = {};
                    us(i4, ((i5, e5) => {
                      a3.has(i5) || (s4[e5] = t4(i5, e5));
                    })), r4 = s4;
                  }
                  return r4;
                }
              })(n3)), c3.timestamp = d3, K(null == e3 ? void 0 : e3.timestamp) || (c3.properties.$event_time_override_provided = true, c3.properties.$event_time_override_system_time = u3), f3 && (c3.properties = (function(t4, i4) {
                void 0 === i4 && (i4 = []);
                var e4 = {}, r4 = (i5) => {
                  void 0 !== t4[i5] && (e4[i5] = t4[i5]);
                };
                return w.forEach(r4), i4.forEach(r4), e4;
              })(c3.properties, Al)), t3 === Bo.DISMISSED || t3 === Bo.SENT) {
                var S3 = null == i3 ? void 0 : i3[zo.SURVEY_ID], x3 = null == i3 ? void 0 : i3[zo.SURVEY_ITERATION];
                gl({ id: S3, current_iteration: x3 }), c3.$set = _({}, c3.$set, { [(g3 = { id: S3, current_iteration: x3 }, m3 = t3 === Bo.SENT ? "responded" : "dismissed", y3 = "$survey_" + m3 + "/" + g3.id, g3.current_iteration && g3.current_iteration > 0 && (y3 = "$survey_" + m3 + "/" + g3.id + "/" + g3.current_iteration), y3)]: true });
              } else t3 === Bo.SHOWN && (c3.$set = _({}, c3.$set, { [zo.SURVEY_LAST_SEEN_DATE]: (/* @__PURE__ */ new Date()).toISOString() }));
              if (t3 === Vo.SHOWN) {
                var E3 = null == i3 ? void 0 : i3[Wo.TOUR_TYPE];
                E3 && (c3.$set = _({}, c3.$set, { [Wo.TOUR_LAST_SEEN_DATE + "/" + E3]: (/* @__PURE__ */ new Date()).toISOString() }));
              }
              var k3 = _({}, c3.properties.$set, c3.$set);
              if (G(k3) || this.setPersonPropertiesForFlags(k3), !X(this.config.before_send)) {
                var T3 = this.ts(c3);
                if (!T3) return;
                (c3 = T3).uuid = ki(c3.uuid, Ts);
              }
              this.kl.emit("eventCaptured", c3);
              var P3 = null !== (r3 = null == e3 ? void 0 : e3._url) && void 0 !== r3 ? r3 : this.requestRouter.endpointFor("api", this.analyticsDefaultEndpoint), R3 = { method: "POST", url: P3, data: c3, compression: "best-available", timestampMode: "recordings" === (null == e3 ? void 0 : e3._batchKey) || /\/s\/(?:\?|$)/.test(P3) ? "body" : "capture-body", batchKey: null == e3 ? void 0 : e3._batchKey, transport: null == e3 ? void 0 : e3.transport };
              return !this.config.request_batching || e3 && (null == e3 || !e3._batchKey) || null != e3 && e3.send_instantly ? this.Gl(R3) : this.Vl.enqueue(R3), c3;
            }
            Ue.critical("This capture call is ignored due to client rate limiting.");
          }
        } else Ue.error("No event name provided to posthog.capture");
      } else Ue.uninitializedWarning("posthog.capture");
    }
    _addCaptureHook(t3) {
      return this.on("eventCaptured", ((i3) => t3(i3.event, i3)));
    }
    getExtension(t3) {
      var i3;
      return null == (i3 = this.su) ? void 0 : i3.getExtension(t3);
    }
    eu() {
      var t3;
      return null !== (t3 = this.su) && void 0 !== t3 ? t3 : this.su = new Tl(this);
    }
    xl(t3) {
      this.Nl.push(t3);
      var i3 = true;
      return () => {
        if (i3) {
          i3 = false;
          var e3 = this.Nl.indexOf(t3);
          -1 !== e3 && this.Nl.splice(e3, 1);
        }
      };
    }
    vu(t3) {
      var i3, e3, r3;
      return void 0 === t3 && (t3 = true), !(null == (i3 = this.persistence) || !i3.consumeCookieIdentityChange()) && (this.Hl = null, this.persistence.get_property(jr) === ts && (null == (r3 = this.sessionPersistence) || r3.clear(), this.Dl.clear(), this.cu()), null == (e3 = this.featureFlags) || e3.reset(), t3 && this.reloadFeatureFlags(), true);
    }
    calculateEventProperties(i3, e3, n3, o3, a3) {
      if (n3 = n3 || /* @__PURE__ */ new Date(), !this.persistence || !this.sessionPersistence) return e3;
      this.persistence.syncCookieProperties(), this.vu();
      var l3 = a3 ? void 0 : this.persistence.remove_event_timer(i3), u3 = _({}, e3);
      if (u3.token = this.config.token, u3.$config_defaults = this.config.defaults, this.El() && (u3[Gr] = true), "$snapshot" === i3) {
        var d3 = _({}, this.persistence.properties(), this.sessionPersistence.properties());
        return u3.distinct_id = d3.distinct_id, (!J(u3.distinct_id) && !Z(u3.distinct_id) || Y(u3.distinct_id)) && Ue.error("Invalid distinct_id for replay event. This indicates a bug in your implementation"), u3;
      }
      var v3, f3 = (function(i4, e4, r3, n4) {
        var o4, a4, l4, u4;
        if (void 0 === n4 && (n4 = false), !h) return {};
        var d4, v4 = i4 ? [...oo, ...e4 || []] : [], f4 = Si(h), p4 = f4[0], _3 = f4[1], g4 = null != (d4 = "undefined" != typeof navigator ? navigator : void 0) && d4.brave ? { brave: true } : {}, m4 = {};
        K(r3) || (m4.detectGoogleSearchApp = r3);
        var y4 = {}, b4 = null == (o4 = navigator) || null == (o4 = o4.userAgentData) ? void 0 : o4.platform, w4 = null == (a4 = navigator) ? void 0 : a4.maxTouchPoints, S4 = null == t || null == (l4 = t.screen) ? void 0 : l4.width, x4 = null == t || null == (u4 = t.screen) ? void 0 : u4.height, E4 = null == t ? void 0 : t.devicePixelRatio;
        K(b4) || (y4.userAgentDataPlatform = b4), K(w4) || (y4.maxTouchPoints = w4), K(S4) || (y4.screenWidth = S4), K(x4) || (y4.screenHeight = x4), K(E4) || (y4.devicePixelRatio = E4);
        var k4, T3, P3, R3, C3, O3, I3, F3, A3 = ds(ps({ $os: p4, $os_version: _3, $browser: mi(h, navigator.vendor, g4, m4), $device: xi(h), $device_type: (T3 = h, P3 = y4, F3 = xi(T3), F3 === bt || F3 === yt || "Kobo" === F3 || "Kindle Fire" === F3 || F3 === Yt ? mt : F3 === jt || F3 === Bt || F3 === Ut || F3 === Gt ? "Console" : F3 === St ? "Wearable" : F3 ? pt : "Android" === (null == P3 ? void 0 : P3.userAgentDataPlatform) && (null !== (R3 = null == P3 ? void 0 : P3.maxTouchPoints) && void 0 !== R3 ? R3 : 0) > 0 ? 600 > Math.min(null !== (C3 = null == P3 ? void 0 : P3.screenWidth) && void 0 !== C3 ? C3 : 0, null !== (O3 = null == P3 ? void 0 : P3.screenHeight) && void 0 !== O3 ? O3 : 0) / (null !== (I3 = null == P3 ? void 0 : P3.devicePixelRatio) && void 0 !== I3 ? I3 : 1) ? pt : mt : "Desktop"), $timezone: yo(), $timezone_offset: bo() }), { $current_url: io(n4 ? $i(null == s ? void 0 : s.href) : null == s ? void 0 : s.href, v4, lo), $host: null == s ? void 0 : s.host, $pathname: null == s ? void 0 : s.pathname, $raw_user_agent: h.length > 1e3 ? h.substring(0, 997) + "..." : h, $browser_version: bi(h, navigator.vendor, g4, m4), $browser_language: fo(), $browser_language_prefix: (k4 = fo(), "string" == typeof k4 ? k4.split("-")[0] : void 0), $screen_height: null == t ? void 0 : t.screen.height, $screen_width: null == t ? void 0 : t.screen.width, $viewport_height: null == t ? void 0 : t.innerHeight, $viewport_width: null == t ? void 0 : t.innerWidth, $lib: c.LIB_NAME, $lib_version: c.LIB_VERSION, $insert_id: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10), $time: Date.now() / 1e3 });
        return c.SDK_DIST_CHANNEL && (A3.$sdk_dist_channel = c.SDK_DIST_CHANNEL), A3;
      })(this.config.mask_personal_data_properties, this.config.custom_personal_data_properties, this.config.detect_google_search_app, this.config.disable_capture_url_hashes);
      if (this.sessionManager) {
        var p3 = this.sessionManager.checkAndGetSessionAndWindowId(a3, n3.getTime(), true), g3 = p3.windowId;
        u3.$session_id = p3.sessionId, u3.$window_id = g3;
      }
      this.sessionPropsManager && ds(u3, this.sessionPropsManager.getSessionProps());
      try {
        var m3;
        this.sessionRecording && ds(u3, this.sessionRecording.sdkDebugProperties), u3.$sdk_debug_retry_queue_size = null == (m3 = this.Zl) ? void 0 : m3.length;
      } catch (t3) {
        u3.$sdk_debug_error_capturing_properties = String(t3);
      }
      if (this.requestRouter.region === ul && (u3.$lib_custom_api_host = this.config.api_host), v3 = i3 !== ns || a3 ? i3 !== os || a3 ? this.pageViewManager.doEvent() : this.pageViewManager.doPageLeave(n3) : this.pageViewManager.doPageView(n3, o3), u3 = ds(u3, v3), i3 === ns && r && (u3.title = r.title), !K(l3)) {
        var y3 = n3.getTime() - l3;
        u3.$duration = parseFloat((y3 / 1e3).toFixed(3));
      }
      h && this.config.opt_out_useragent_filter && (u3.$browser_type = this._is_bot() ? "bot" : "browser");
      var b3 = this.persistence.properties(), w3 = this.sessionPersistence.properties();
      us(["$referrer", "$referring_domain"], ((t3) => {
        t3 in b3 && delete w3[t3];
      }));
      var S3 = {};
      if (this.Nl.length > 0) for (var x3 of this.Nl.slice()) try {
        ds(S3, x3());
      } catch (t3) {
        Ue.error("Failed to produce browser extension event properties", t3);
      }
      (u3 = ds({}, f3, b3, w3, _({}, S3, u3))).$is_identified = this._isIdentified(), q(this.config.property_denylist) ? us(this.config.property_denylist, (function(t3) {
        delete u3[t3];
      })) : Ue.error(Fl + this.config.property_denylist + " or property_blacklist config: " + this.config.property_blacklist);
      var E3 = this.config.sanitize_properties;
      E3 && (Ue.error(Il), u3 = E3(u3, i3));
      var k3 = this.fu();
      return u3.$process_person_profile = k3, k3 && !a3 && this.pu("_calculate_event_properties"), u3;
    }
    du(t3, i3, e3) {
      var r3;
      if (void 0 === i3 && (i3 = true), void 0 === e3 && (e3 = false), !this.persistence || !this.fu()) return t3;
      if (this.Ll && !e3) return t3;
      var s3 = this.persistence.get_initial_props(), n3 = null == (r3 = this.sessionPropsManager) ? void 0 : r3.getSetOnceProps(), o3 = ds({}, s3, n3 || {}, t3 || {}), a3 = this.config.sanitize_properties;
      return a3 && (Ue.error(Il), o3 = a3(o3, "$set_once")), i3 && (this.Ll = true), G(o3) ? void 0 : o3;
    }
    register(t3, i3) {
      var e3;
      null == (e3 = this.persistence) || e3.register(t3, i3);
    }
    register_once(t3, i3, e3) {
      var r3;
      null == (r3 = this.persistence) || r3.register_once(t3, i3, e3);
    }
    register_for_session(t3) {
      var i3, e3;
      null == (i3 = this.persistence) || i3.syncCookieProperties(), this.vu(), null == (e3 = this.sessionPersistence) || e3.register(t3), Object.keys(t3).forEach(((t4) => this.Dl.add(t4))), this.cu();
    }
    unregister(t3) {
      var i3;
      null == (i3 = this.persistence) || i3.unregister(t3);
    }
    unregister_for_session(t3) {
      var i3;
      null == (i3 = this.sessionPersistence) || i3.unregister(t3), this.Dl.delete(t3), this.cu();
    }
    gu(t3, i3) {
      this.register({ [t3]: i3 });
    }
    Ql() {
      this.Dl.forEach(((t3) => {
        var i3;
        null == (i3 = this.sessionPersistence) || i3.unregister(t3);
      })), this.Dl.clear(), this.cu();
    }
    cu() {
      var t3;
      if (this.$l) if ("memory" === this.config.persistence || null != (t3 = this.sessionPersistence) && t3.Ca || !Gs.ii()) Gs.oi(this.$l);
      else {
        var i3 = [];
        this.Dl.forEach(((t4) => i3.push(t4))), i3.length > 0 ? Gs.ni(this.$l, i3) : Gs.oi(this.$l);
      }
    }
    getFeatureFlag(t3, i3) {
      var e3;
      return null == (e3 = this.featureFlags) ? void 0 : e3.getFeatureFlag(t3, i3);
    }
    getFeatureFlagPayload(t3) {
      var i3;
      return null == (i3 = this.featureFlags) ? void 0 : i3.getFeatureFlagPayload(t3);
    }
    getFeatureFlagResult(t3, i3) {
      var e3;
      return null == (e3 = this.featureFlags) ? void 0 : e3.getFeatureFlagResult(t3, i3);
    }
    getAllFeatureFlags() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.featureFlags) ? void 0 : i3.getAllFeatureFlags()) && void 0 !== t3 ? t3 : [];
    }
    isFeatureEnabled(t3, i3) {
      var e3, r3;
      return null !== (e3 = null == (r3 = this.featureFlags) ? void 0 : r3.isFeatureEnabled(t3, i3)) && void 0 !== e3 ? e3 : null == i3 ? void 0 : i3.defaultValue;
    }
    reloadFeatureFlags() {
      var t3;
      null == (t3 = this.featureFlags) || t3.reloadFeatureFlags();
    }
    updateFlags(t3, i3, e3) {
      var r3;
      null == (r3 = this.featureFlags) || r3.updateFlags(t3, i3, e3);
    }
    updateEarlyAccessFeatureEnrollment(t3, i3, e3) {
      var r3;
      null == (r3 = this.featureFlags) || r3.updateEarlyAccessFeatureEnrollment(t3, i3, e3);
    }
    getEarlyAccessFeatures(t3, i3, e3) {
      var r3;
      return void 0 === i3 && (i3 = false), null == (r3 = this.featureFlags) ? void 0 : r3.getEarlyAccessFeatures(t3, i3, e3);
    }
    on(t3, i3) {
      return this.kl.on(t3, i3);
    }
    onFeatureFlags(t3) {
      return this.featureFlags ? this.featureFlags.onFeatureFlags(t3) : (t3([], {}, { errorsLoading: true }), () => {
      });
    }
    onSurveysLoaded(t3) {
      return this.surveys ? this.surveys.onSurveysLoaded(t3) : (t3([], { isLoaded: false, error: Ol }), () => {
      });
    }
    onSessionId(t3) {
      var i3, e3;
      return null !== (i3 = null == (e3 = this.sessionManager) ? void 0 : e3.onSessionId(t3)) && void 0 !== i3 ? i3 : () => {
      };
    }
    getSurveys(t3, i3) {
      void 0 === i3 && (i3 = false), this.surveys ? this.surveys.getSurveys(t3, i3) : t3([], { isLoaded: false, error: Ol });
    }
    getActiveMatchingSurveys(t3, i3) {
      void 0 === i3 && (i3 = false), this.surveys ? this.surveys.getActiveMatchingSurveys(t3, i3) : t3([], { isLoaded: false, error: Ol });
    }
    renderSurvey(t3, i3) {
      var e3;
      null == (e3 = this.surveys) || e3.renderSurvey(t3, i3);
    }
    displaySurvey(t3, i3) {
      var e3;
      void 0 === i3 && (i3 = yl), null == (e3 = this.surveys) || e3.displaySurvey(t3, i3);
    }
    cancelPendingSurvey(t3) {
      var i3;
      null == (i3 = this.surveys) || i3.cancelPendingSurvey(t3);
    }
    canRenderSurvey(t3) {
      var i3, e3;
      return null !== (i3 = null == (e3 = this.surveys) ? void 0 : e3.canRenderSurvey(t3)) && void 0 !== i3 ? i3 : { visible: false, disabledReason: Ol };
    }
    canRenderSurveyAsync(t3, i3) {
      var e3, r3;
      return void 0 === i3 && (i3 = false), null !== (e3 = null == (r3 = this.surveys) ? void 0 : r3.canRenderSurveyAsync(t3, i3)) && void 0 !== e3 ? e3 : Promise.resolve({ visible: false, disabledReason: Ol });
    }
    mu(t3) {
      return !t3 || Y(t3) ? (Ue.critical("Unique user id has not been set in posthog.identify"), false) : t3 === Wr ? (Ue.critical('The string "' + t3 + '" was set in posthog.identify which indicates an error. This ID is only used as a sentinel value.'), false) : !["distinct_id", "distinctid"].includes(t3.toLowerCase()) && !["undefined", "null"].includes(t3.toLowerCase()) || (Ue.critical('The string "' + t3 + '" was set in posthog.identify which indicates an error. This ID should be unique to the user and not a hardcoded string.'), false);
    }
    identify(t3, i3, e3) {
      if (!this.__loaded || !this.persistence) return Ue.uninitializedWarning("posthog.identify");
      if (Z(t3) && (t3 = t3.toString(), Ue.warn("The first argument to posthog.identify was a number, but it should be a string. It has been converted to a string.")), this.mu(t3) && this.pu("posthog.identify")) {
        this.Al();
        var r3 = this.get_distinct_id(), s3 = this.persistence.syncCookieProperties() && this.get_distinct_id() !== r3, n3 = this.vu(false), o3 = this.persistence.Ua(), a3 = false;
        try {
          var l3 = this.get_distinct_id();
          this.register({ $user_id: t3 }), this.get_property(Je) || this.register_once({ $had_persisted_distinct_id: true, $device_id: l3 }, ""), t3 !== l3 && t3 !== this.get_property(Qe) && (this.unregister(Qe), this.register({ distinct_id: t3 }));
          var h3, u3 = (this.persistence.get_property(jr) || ts) === ts, d3 = t3 !== l3, v3 = !d3 && u3;
          if (d3 && u3) this.persistence.set_property(jr, is), this.setPersonPropertiesForFlags({ $set: i3 || {}, $set_once: e3 || {} }, false), this.config.cookieWinsOnConflict && this.persistence.Wa(), this.capture(as, { distinct_id: t3, $anon_distinct_id: l3 }, { $set: i3 || {}, $set_once: e3 || {} }), this.Hl = hl(t3, i3, e3), null == (h3 = this.featureFlags) || h3.setAnonymousDistinctId(l3);
          else if (v3) {
            this.persistence.set_property(jr, is);
            var c3 = i3 || {}, f3 = e3 || {};
            this.setPersonPropertiesForFlags({ $set: c3, $set_once: f3 }, false), this.config.cookieWinsOnConflict && this.persistence.Wa(), this.capture("$set", { $set: c3, $set_once: f3 }), this.Hl = hl(t3, i3, e3);
          } else (i3 || e3) && this.setPersonProperties(i3, e3);
          d3 || s3 || n3 ? (this.reloadFeatureFlags(), this.featureFlags ? this.featureFlags.resetFlagCallReported() : this.unregister(Mr)) : v3 && (i3 || e3) && this.reloadFeatureFlags(), a3 = true;
        } finally {
          o3 && this.persistence.Za(a3);
        }
      }
    }
    setPersonProperties(t3, i3) {
      if ((t3 || i3) && this.pu("posthog.setPersonProperties")) {
        var e3 = hl(this.get_distinct_id(), t3, i3);
        this.Hl !== e3 ? (this.setPersonPropertiesForFlags({ $set: t3 || {}, $set_once: i3 || {} }, true), this.capture("$set", { $set: t3 || {}, $set_once: i3 || {} }), this.Hl = e3) : Ue.info("A duplicate setPersonProperties call was made with the same properties. It has been ignored.");
      }
    }
    unsetPersonProperties(t3) {
      var i3, e3 = (q(t3) ? t3 : [t3]).filter(((t4) => J(t4) && t4.length > 0));
      0 !== e3.length && this.pu("posthog.unsetPersonProperties") && (null == (i3 = this.featureFlags) || i3.unsetPersonPropertiesForFlags(e3, true), this.capture("$set", { $unset: e3 }), this.Hl = null);
    }
    group(t3, i3, e3) {
      var r3;
      if (t3 && i3) {
        null == (r3 = this.persistence) || r3.syncCookieProperties(), this.vu();
        var s3 = this.getGroups(), n3 = s3[t3] !== i3;
        if (n3 && this.resetGroupPropertiesForFlags(t3), this.register({ $groups: _({}, s3, { [t3]: i3 }) }), n3 || e3) {
          var o3 = { $group_type: t3, $group_key: i3 };
          e3 && (o3.$group_set = e3), this.capture(ls, o3);
        }
        e3 && this.setGroupPropertiesForFlags({ [t3]: e3 }), n3 && !e3 && this.reloadFeatureFlags();
      } else Ue.error("posthog.group requires a group type and group key");
    }
    resetGroups() {
      this.register({ $groups: {} }), this.resetGroupPropertiesForFlags(), this.reloadFeatureFlags();
    }
    setPersonPropertiesForFlags(t3, i3) {
      var e3;
      void 0 === i3 && (i3 = true), null == (e3 = this.featureFlags) || e3.setPersonPropertiesForFlags(t3, i3);
    }
    resetPersonPropertiesForFlags(t3) {
      var i3;
      void 0 === t3 && (t3 = true), null == (i3 = this.featureFlags) || i3.resetPersonPropertiesForFlags(t3);
    }
    setGroupPropertiesForFlags(t3, i3) {
      var e3;
      void 0 === i3 && (i3 = true), this.pu("posthog.setGroupPropertiesForFlags") && (null == (e3 = this.featureFlags) || e3.setGroupPropertiesForFlags(t3, i3));
    }
    resetGroupPropertiesForFlags(t3) {
      var i3;
      null == (i3 = this.featureFlags) || i3.resetGroupPropertiesForFlags(t3);
    }
    reset(t3) {
      var i3 = it(t3) ? t3 : null == t3 ? void 0 : t3.resetDeviceID, e3 = it(t3) || null == t3 ? void 0 : t3.bootstrap;
      this.yu(i3, false, e3);
    }
    yu(t3, i3, e3) {
      var r3, s3, n3;
      if (void 0 === i3 && (i3 = false), Ue.info("reset"), !this.__loaded) return Ue.uninitializedWarning("posthog.reset");
      var o3 = null == e3 ? void 0 : e3.sessionID;
      this.config.bootstrap = e3 || (null == (r3 = this.Ul) ? void 0 : r3.bootstrap) || {}, null == (s3 = this.featureFlags) || null == s3.updateConfig || s3.updateConfig(this.config, this.do());
      var a3 = this.get_property(Je), l3 = this.get_property(Ye), h3 = this.get_property(hr), u3 = this.is_capturing();
      this.consent.reset(), i3 || !u3 || this.is_capturing() || console.warn("[PostHog.js]", "reset() cleared the stored consent, and capturing is now off because of `opt_out_capturing_by_default`. Call opt_in_capturing() again, and prefer calling reset() before opting in rather than after.");
      var d3 = null == (n3 = this.persistence) || null == n3.Ua ? void 0 : n3.Ua(), v3 = false;
      try {
        var c3, f3, p3, g3, m3, y3, b3, w3, S3, x3, E3, k3, T3;
        if (null == (c3 = this.persistence) || c3.clear(), null == (f3 = this.sessionPersistence) || f3.clear(), this.Dl.clear(), this.cu(), K(h3) || null == (x3 = this.persistence) || x3.register({ [hr]: h3 }), null == (p3 = this.surveys) || p3.reset(), null == (g3 = this.featureFlags) || g3.reset(), null == (m3 = this.conversations) || m3.reset(), null == (y3 = this.logs) || y3.reset(), null == (b3 = this.metrics) || b3.reset(), null == (w3 = this.persistence) || w3.set_property(jr, ts), null == (S3 = this.sessionManager) || S3.resetSessionId(), this.Hl = null, this.config.cookieless_mode === Zr) this.register_once({ distinct_id: Wr, $device_id: null }, "");
        else {
          var P3 = this.config.get_device_id(Ts());
          this.register_once({ distinct_id: P3, $device_id: t3 ? P3 : a3 }, ""), t3 || K(l3) || this.register({ [Ye]: l3 });
        }
        if (this.register({ $last_posthog_reset: (/* @__PURE__ */ new Date()).toISOString() }, 1), e3) {
          if (void 0 === e3.distinctID || this.El() || (null == (T3 = this.persistence) || T3.set_property(jr, e3.isIdentifiedID ? is : ts), this.register({ distinct_id: e3.distinctID })), null == (E3 = this.featureFlags) || E3.initialize(), !(K(o3) || null != (k3 = this.sessionManager) && k3.setBootstrapSessionId(o3, true))) {
            var R3 = _({}, e3);
            delete R3.sessionID, this.config.bootstrap = R3;
          }
        }
        delete this.config.identity_distinct_id, delete this.config.identity_hash, delete this.config.identity_claims, v3 = true;
      } finally {
        var C3;
        d3 && (null == (C3 = this.persistence) || null == C3.Za || C3.Za(v3));
      }
      this.reloadFeatureFlags();
    }
    shutdown(t3) {
      var i3 = this;
      return p((function* () {
        var t4, e3, r3, s3, n3, o3, a3;
        if (i3.__loaded) {
          i3.eu().dispose(), null == (t4 = i3.sessionRecording) || t4.dispose(), null == (e3 = i3.logs) || e3.flushLogs("sendBeacon"), null == (r3 = i3.metrics) || r3.flush("sendBeacon"), null == (s3 = i3.Vl) || s3.unload(), null == (n3 = i3.Zl) || n3.unload();
          try {
            var l3;
            null == (l3 = i3.featureFlags) || l3.destroy();
          } catch (t5) {
            Ue.error("Error while destroying feature flags", t5);
          }
          null == (o3 = i3.persistence) || o3.destroy(), null == (a3 = i3.sessionPersistence) || a3.destroy();
        } else Ue.uninitializedWarning("posthog.shutdown");
      }))();
    }
    setIdentity(t3, i3) {
      var e3;
      delete this.config.identity_claims, this.config.identity_distinct_id = t3, this.config.identity_hash = i3, this.alias(t3), null == (e3 = this.conversations) || e3.bu();
    }
    clearIdentity() {
      var t3;
      delete this.config.identity_distinct_id, delete this.config.identity_hash, delete this.config.identity_claims, null == (t3 = this.conversations) || t3._u();
    }
    get_distinct_id() {
      return this.get_property("distinct_id");
    }
    getGroups() {
      return this.get_property("$groups") || {};
    }
    get_session_id() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.sessionManager) ? void 0 : i3.checkAndGetSessionAndWindowId(true).sessionId) && void 0 !== t3 ? t3 : "";
    }
    get_session_replay_url(t3) {
      if (!this.sessionManager) return "";
      var i3 = this.sessionManager.checkAndGetSessionAndWindowId(true), e3 = i3.sessionStartTimestamp, r3 = this.requestRouter.endpointFor("ui", "/project/" + this.config.token + "/replay/" + i3.sessionId);
      if (null != t3 && t3.withTimestamp && e3) {
        var s3, n3 = null !== (s3 = t3.timestampLookBack) && void 0 !== s3 ? s3 : 10;
        if (!e3) return r3;
        r3 += "?t=" + Math.max(Math.floor(((/* @__PURE__ */ new Date()).getTime() - e3) / 1e3) - n3, 0);
      }
      return r3;
    }
    alias(t3, i3) {
      return t3 === this.get_property(Ge) ? (Ue.critical("Attempting to create alias for existing People user - aborting."), -2) : this.pu("posthog.alias") ? (K(i3) && (i3 = this.get_distinct_id()), t3 !== i3 ? (this.gu(Qe, t3), this.capture("$create_alias", { alias: t3, distinct_id: i3 })) : (Ue.warn("alias matches current distinct_id - skipping api call."), this.identify(t3), -1)) : void 0;
    }
    set_config(t3) {
      var i3 = _({}, this.config);
      if (W(t3)) {
        var e3, r3, s3, n3, o3, a3, l3, h3, u3, d3, v3, f3;
        ds(this.config, Ul(t3));
        var p3 = this.Fl();
        null == (e3 = this.persistence) || e3.update_config(this.config, i3, p3), this.sessionPersistence = "sessionStorage" === this.config.persistence || "memory" === this.config.persistence ? this.persistence : new Co(_({}, this.config, { persistence: "sessionStorage" }), p3, false);
        var g3, m3 = this.zl(this.config.debug);
        it(m3) && (this.config.debug = m3), it(this.config.debug) && (this.config.debug ? (c.DEBUG = true, Fs.ii() && Fs.ni("ph_debug", true), Ue.info("set_config", { config: t3, oldConfig: i3, newConfig: _({}, this.config) })) : (c.DEBUG = false, Fs.ii() && Fs.oi("ph_debug"))), null == (r3 = this.featureFlags) || null == r3.updateConfig || r3.updateConfig(this.config, this.do()), null == (s3 = this.exceptionObserver) || s3.onConfigChange(), null == (n3 = this.exceptions) || n3.onConfigChange(), null == (o3 = this.sessionRecording) || o3.startIfEnabledOrStop(), null == (a3 = this.tracingHeaders) || a3.startIfEnabledOrStop(), null == (l3 = this.autocapture) || l3.startIfEnabled(), null == (h3 = this.heatmaps) || h3.startIfEnabled(), ("capture_pageview" in t3 || "disable_capture_url_hashes" in t3) && (null == (g3 = this.historyAutocapture) || g3.startIfEnabledOrStop()), null == (u3 = this.exceptionObserver) || u3.startIfEnabledOrStop(), null == (d3 = this.deadClicksAutocapture) || d3.startIfEnabledOrStop(), null == (v3 = this.surveys) || v3.loadIfEnabled(), this.Ol(), null == (f3 = this.externalIntegrations) || f3.startIfEnabledOrStop();
      }
    }
    _overrideSDKInfo(t3, i3) {
      c.LIB_NAME = t3, c.LIB_VERSION = i3;
    }
    startSessionRecording(t3) {
      var i3, e3, r3, s3, n3, o3 = true === t3, a3 = { sampling: o3 || !(null == t3 || !t3.sampling), linked_flag: o3 || !(null == t3 || !t3.linked_flag), url_trigger: o3 || !(null == t3 || !t3.url_trigger), event_trigger: o3 || !(null == t3 || !t3.event_trigger) };
      Object.values(a3).some(Boolean) && (null == (i3 = this.sessionManager) || i3.checkAndGetSessionAndWindowId(), a3.sampling && (null == (e3 = this.sessionRecording) || e3.overrideSampling()), a3.linked_flag && (null == (r3 = this.sessionRecording) || r3.overrideLinkedFlag()), a3.url_trigger && (null == (s3 = this.sessionRecording) || s3.overrideTrigger("url")), a3.event_trigger && (null == (n3 = this.sessionRecording) || n3.overrideTrigger("event")));
      this.set_config({ disable_session_recording: false });
    }
    stopSessionRecording() {
      this.set_config({ disable_session_recording: true });
    }
    sessionRecordingStarted() {
      var t3;
      return !(null == (t3 = this.sessionRecording) || !t3.started);
    }
    captureException(t3, i3) {
      if (this.exceptions) {
        var e3 = new Error("PostHog syntheticException"), r3 = this.exceptions.buildProperties(t3, { handled: true, syntheticException: e3 });
        return this.exceptions.sendExceptionEvent(_({}, r3, i3));
      }
    }
    addExceptionStep(t3, i3) {
      var e3;
      null == (e3 = this.exceptions) || e3.addExceptionStep(t3, i3);
    }
    captureLog(t3) {
      var i3;
      null == (i3 = this.logs) || i3.captureLog(t3);
    }
    get logger() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this.logs) ? void 0 : i3.logger) && void 0 !== t3 ? t3 : _zl.wu;
    }
    startExceptionAutocapture(t3) {
      this.set_config({ capture_exceptions: null == t3 || t3 });
    }
    stopExceptionAutocapture() {
      this.set_config({ capture_exceptions: false });
    }
    loadToolbar(t3) {
      var i3, e3;
      return null !== (i3 = null == (e3 = this.toolbar) ? void 0 : e3.loadToolbar(t3)) && void 0 !== i3 && i3;
    }
    get_property(t3) {
      var i3;
      return null == (i3 = this.persistence) ? void 0 : i3.props[t3];
    }
    getSessionProperty(t3) {
      var i3;
      return null == (i3 = this.sessionPersistence) ? void 0 : i3.props[t3];
    }
    toString() {
      var t3, i3 = null !== (t3 = this.config.name) && void 0 !== t3 ? t3 : Ml;
      return i3 !== Ml && (i3 = Ml + "." + i3), i3;
    }
    _isIdentified() {
      var t3, i3;
      return (null == (t3 = this.persistence) ? void 0 : t3.get_property(jr)) === is || (null == (i3 = this.sessionPersistence) ? void 0 : i3.get_property(jr)) === is;
    }
    fu() {
      var t3, i3;
      return !("never" === this.config.person_profiles || this.config.person_profiles === es && !this._isIdentified() && G(this.getGroups()) && (null == (t3 = this.persistence) || null == (t3 = t3.props) || !t3[Qe]) && (null == (i3 = this.persistence) || null == (i3 = i3.props) || !i3[Vr]));
    }
    uu() {
      return true === this.config.capture_pageleave || "if_capture_pageview" === this.config.capture_pageleave && !!this.config.capture_pageview;
    }
    createPersonProfile() {
      this.fu() || this.pu("posthog.createPersonProfile") && this.setPersonProperties({}, {});
    }
    setInternalOrTestUser() {
      this.pu("posthog.setInternalOrTestUser") && this.setPersonProperties({ $internal_or_test_user: true });
    }
    pu(t3) {
      return "never" === this.config.person_profiles ? (Ue.error(t3 + ' was called, but process_person is set to "never". This call will be ignored.'), false) : (this.Il(), this.gu(Vr, true), true);
    }
    Fl() {
      if ("always" === this.config.cookieless_mode) return true;
      var t3 = this.consent.isOptedOut();
      return this.config.disable_persistence || t3 && !(!this.config.opt_out_persistence_by_default && this.config.cookieless_mode !== Xr);
    }
    Ol() {
      var t3, i3, e3, r3, s3, n3 = this.Fl();
      return this.is_capturing() || null == (e3 = this.logs) || e3.ku(), (null == (t3 = this.persistence) ? void 0 : t3.Ca) !== n3 && (null == (r3 = this.persistence) || r3.set_disabled(n3)), (null == (i3 = this.sessionPersistence) ? void 0 : i3.Ca) !== n3 && (null == (s3 = this.sessionPersistence) || s3.set_disabled(n3)), n3 && (this.Dl.clear(), this.cu()), n3;
    }
    opt_in_capturing(t3) {
      var i3;
      if (this.config.cookieless_mode !== Zr) {
        if (this.El()) {
          var e3, r3, s3, n3, o3, a3;
          null == (e3 = this.sessionRecording) || e3.dispose({ discardBufferedEvents: true }), this.yu(true, true), null == (r3 = this.sessionManager) || r3.destroy(), null == (s3 = this.pageViewManager) || s3.destroy(), this.sessionManager = new il(this), this.pageViewManager = new Gn(this), this.persistence && (this.sessionPropsManager = new Qa(this, this.sessionManager, this.persistence));
          var l3, h3 = null !== (n3 = null == (o3 = this.config.__extensionClasses) ? void 0 : o3.sessionRecording) && void 0 !== n3 ? n3 : null == (a3 = _zl.__defaultExtensionClasses) ? void 0 : a3.sessionRecording;
          h3 && (this.sessionRecording = this.Ml(this.sessionRecording, new h3(this)), this.wl && (null == (l3 = this.sessionRecording) || null == l3.onRemoteConfig || l3.onRemoteConfig(this.wl)));
        }
        var u3, d3;
        this.consent.optInOut(true), this.Ol(), this.au(), null == (i3 = this.sessionRecording) || i3.startIfEnabledOrStop(), this.config.cookieless_mode == Xr && (null == (u3 = this.surveys) || u3.loadIfEnabled()), (K(null == t3 ? void 0 : t3.captureEventName) || null != t3 && t3.captureEventName) && this.capture(null !== (d3 = null == t3 ? void 0 : t3.captureEventName) && void 0 !== d3 ? d3 : "$opt_in", null == t3 ? void 0 : t3.captureProperties, { send_instantly: true }), this.config.capture_pageview && this.ou();
      } else Ue.warn(Cl);
    }
    opt_out_capturing() {
      if (this.config.cookieless_mode !== Zr) {
        var t3, i3, e3 = this.config.cookieless_mode === Xr ? this.sessionRecording : void 0;
        null == e3 || e3.dispose({ discardBufferedEvents: true }), this.config.cookieless_mode === Xr && this.consent.isOptedIn() && this.yu(true, true), this.consent.optInOut(false), this.Ol(), this.config.cookieless_mode === Xr && (this.register({ distinct_id: Wr, $device_id: null }), this.Tl(e3), this.sessionRecording = void 0, null == (t3 = this.sessionManager) || t3.destroy(), null == (i3 = this.pageViewManager) || i3.destroy(), this.sessionManager = void 0, this.sessionPropsManager = void 0, this.config.capture_pageview && this.ou(), this.au());
      } else Ue.warn(Cl);
    }
    has_opted_in_capturing() {
      return this.consent.isOptedIn();
    }
    has_opted_out_capturing() {
      return this.consent.isOptedOut();
    }
    get_explicit_consent_status() {
      var t3 = this.consent.consent;
      return 1 === t3 ? "granted" : 0 === t3 ? "denied" : "pending";
    }
    is_capturing() {
      return this.config.cookieless_mode === Zr || (this.config.cookieless_mode === Xr ? this.consent.isRejected() || this.consent.isOptedIn() : !this.has_opted_out_capturing());
    }
    clear_opt_in_out_capturing() {
      this.consent.reset(), this.Ol();
    }
    _is_bot() {
      return e ? el(e, this.config.custom_blocked_useragents) : void 0;
    }
    ou() {
      r && ("visible" === r.visibilityState ? this.ql || (this.ql = true, this.capture(ns, { title: r.title }, { send_instantly: true }), this.jl && (r.removeEventListener(rs, this.jl), this.jl = null)) : this.jl || (this.jl = this.ou.bind(this), ms(r, rs, this.jl)));
    }
    debug(i3) {
      false === i3 ? (null == t || t.console.log("You've disabled debug mode."), this.set_config({ debug: false })) : (null == t || t.console.log("You're now in debug mode. All calls to PostHog will be logged in your console.\nYou can disable this with `posthog.debug(false)`."), this.set_config({ debug: true }));
    }
    do() {
      var t3 = this.Ul || {};
      return "advanced_disable_flags" in t3 ? !!t3.advanced_disable_flags : false !== this.config.advanced_disable_flags ? !!this.config.advanced_disable_flags : true === this.config.advanced_disable_decide ? (Ue.warn("Config field 'advanced_disable_decide' is deprecated. Please use 'advanced_disable_flags' instead. The old field will be removed in a future major version."), true) : (function(t4, i3, e3, r3, s3) {
        var n3 = i3 in t4 && !X(t4[i3]), o3 = e3 in t4 && !X(t4[e3]);
        return n3 ? t4[i3] : !!o3 && (s3 && s3.warn("Config field '" + e3 + "' is deprecated. Please use '" + i3 + "' instead. The old field will be removed in a future major version."), t4[e3]);
      })(t3, "advanced_disable_flags", "advanced_disable_decide", 0, Ue);
    }
    ts(t3) {
      var i3;
      if (X(this.config.before_send)) return t3;
      var e3 = Object.keys(null !== (i3 = t3.properties) && void 0 !== i3 ? i3 : {}).filter(st), r3 = q(this.config.before_send) ? this.config.before_send : [this.config.before_send], s3 = t3;
      for (var n3 of r3) try {
        if (s3 = n3(s3), X(s3)) {
          var o3 = "Event '" + t3.event + "' was rejected in beforeSend function";
          return rt(t3.event) ? Ue.warn(o3 + ". This can cause unexpected behavior.") : Ue.info(o3), null;
        }
        s3.properties && !G(s3.properties) || Ue.warn("Event '" + t3.event + "' has no properties after beforeSend function, this is likely an error.");
      } catch (i4) {
        return Ue.error("Error in beforeSend function for event '" + t3.event + "':", i4), null;
      }
      for (var a3 of e3) if (s3.properties && X(s3.properties[a3])) return Ue.warn("Event '" + t3.event + "' had its '" + a3 + "' property removed in a beforeSend function. This property is required for ingestion, so the event will be dropped."), null;
      return s3;
    }
    getPageViewId() {
      var t3;
      return null == (t3 = this.pageViewManager.ea) ? void 0 : t3.pageViewId;
    }
    captureTraceFeedback(t3, i3) {
      this.capture("$ai_feedback", { $ai_trace_id: String(t3), $ai_feedback_text: i3 });
    }
    captureTraceMetric(t3, i3, e3) {
      this.capture("$ai_metric", { $ai_trace_id: String(t3), $ai_metric_name: i3, $ai_metric_value: String(e3) });
    }
    zl(t3) {
      var i3 = it(t3) && !t3, e3 = Fs.ii() && "true" === Fs.ai("ph_debug");
      return !i3 && (!!e3 || t3);
    }
  };
  zl.__defaultExtensionClasses = {}, zl.wu = /* @__PURE__ */ (() => {
    var t3 = () => {
    };
    return { trace: t3, debug: t3, info: t3, warn: t3, error: t3, fatal: t3 };
  })(), (function(t3, i3) {
    for (var e3 = 0; i3.length > e3; e3++) t3.prototype[i3[e3]] = fs(t3.prototype[i3[e3]]);
  })(zl, ["identify"]);
  var Hl = class {
    constructor(t3) {
      this.disabled = false === t3;
      var i3 = W(t3) ? t3 : {};
      this.thresholdPx = i3.threshold_px || 30, this.timeoutMs = i3.timeout_ms || 1e3, this.clickCount = i3.click_count || 3, this.clicks = [];
    }
    isRageClick(t3, i3, e3) {
      if (this.disabled) return false;
      var r3 = this.clicks[this.clicks.length - 1];
      if (r3 && Math.abs(t3 - r3.x) + Math.abs(i3 - r3.y) < this.thresholdPx && this.timeoutMs > e3 - r3.timestamp) {
        if (this.clicks.push({ x: t3, y: i3, timestamp: e3 }), this.clicks.length === this.clickCount) return true;
      } else this.clicks = [{ x: t3, y: i3, timestamp: e3 }];
      return false;
    }
  };
  var ql = "$copy_autocapture";
  var Vl = Be("[AutoCapture]");
  function Wl(t3, i3) {
    return i3.length > t3 ? i3.slice(0, t3) + "..." : i3;
  }
  function Gl(t3) {
    if (t3.previousElementSibling) return t3.previousElementSibling;
    var i3 = t3;
    do {
      i3 = i3.previousSibling;
    } while (i3 && !en(i3));
    return i3;
  }
  function Kl(i3, e3) {
    var r3, s3, n3 = e3.e, o3 = e3.maskAllElementAttributes, a3 = e3.maskAllText, l3 = e3.elementAttributeIgnoreList, h3 = e3.elementsChainAsString, u3 = e3.disableCaptureUrlHashes;
    if (!en(i3)) return { props: {} };
    for (var d3 = [i3], v3 = /* @__PURE__ */ new Set([i3]), c3 = i3; c3.parentNode && !rn(c3, "body") && on > d3.length; ) if (nn(c3.parentNode)) {
      var f3 = c3.parentNode.host;
      if (v3.has(f3)) break;
      v3.add(f3), d3.push(f3), c3 = f3;
    } else {
      if (!en(c3.parentNode)) break;
      if (v3.has(c3.parentNode)) break;
      v3.add(c3.parentNode), d3.push(c3.parentNode), c3 = c3.parentNode;
    }
    var p3, g3, m3 = [], y3 = {}, b3 = false, w3 = false;
    if (us(d3, ((t3) => {
      var i4 = kn(t3);
      if (rn(t3, "a")) {
        var e4 = t3.getAttribute("href");
        b3 = !!(i4 && e4 && An(e4)) && (u3 ? $i(e4) : e4);
      }
      N(hn(t3), "ph-no-capture") && (w3 = true), m3.push((function(t4, i5, e5, r5, s4) {
        void 0 === s4 && (s4 = false);
        var n4 = t4.tagName.toLowerCase(), o4 = { tag_name: n4 };
        cn.indexOf(n4) > -1 && !e5 && (o4.$el_text = "a" === n4.toLowerCase() || "button" === n4.toLowerCase() ? Wl(1024, Mn(t4)) : Wl(1024, dn(t4)));
        var a4 = hn(t4);
        a4.length > 0 && (o4.classes = a4.filter((function(t5) {
          return "" !== t5;
        }))), us(t4.attributes, (function(e6) {
          var n5;
          if ((!Tn(t4) || -1 !== ["name", "id", "class", "aria-label"].indexOf(e6.name)) && (null == r5 || !r5.includes(e6.name)) && !i5 && An(e6.value) && (!J(n5 = e6.name) || "_ngcontent" !== n5.substring(0, 10) && "_nghost" !== n5.substring(0, 7))) {
            var a5 = e6.value;
            "class" === e6.name && (a5 = an(a5).join(" ")), o4["attr__" + e6.name] = Wl(1024, "href" === e6.name && s4 ? $i(a5) : a5);
          }
        }));
        for (var l4 = 1, h4 = 1, u4 = t4; u4 = Gl(u4); ) l4++, u4.tagName === t4.tagName && h4++;
        return o4.nth_child = l4, o4.nth_of_type = h4, o4;
      })(t3, o3, a3, l3, u3));
      var r4 = (function(t4) {
        if (!kn(t4)) return {};
        var i5 = {};
        return us(t4.attributes, (function(t5) {
          if (t5.name && 0 === t5.name.indexOf("data-ph-capture-attribute")) {
            var e5 = t5.name.replace("data-ph-capture-attribute-", ""), r5 = t5.value;
            e5 && r5 && An(r5) && (i5[e5] = r5);
          }
        })), i5;
      })(t3);
      us(r4, ((t4, i5) => {
        ({}).hasOwnProperty.call(y3, i5) || (y3[i5] = t4);
      }));
    })), w3) return { props: {}, explicitNoCapture: w3 };
    if (a3 || (m3[0].$el_text = rn(i3, "a") || rn(i3, "button") ? Mn(i3) : dn(i3)), b3) {
      var S3, x3;
      m3[0].attr__href = b3;
      var E3 = null == (S3 = Zn(b3)) ? void 0 : S3.host, k3 = null == t || null == (x3 = t.location) ? void 0 : x3.host;
      E3 && k3 && E3 !== k3 && (p3 = b3);
    }
    return { props: ds({ $event_type: n3.type, $ce_version: 1 }, h3 ? {} : { $elements: m3 }, { $elements_chain: (g3 = m3, q(g3) ? (function(t3) {
      return t3.map(((t4) => {
        var i4, e4, r4 = "";
        if (t4.tag_name && (r4 += t4.tag_name), t4.attr_class) for (var s4 of (t4.attr_class.sort(), t4.attr_class)) r4 += "." + s4.replace(/"/g, "");
        var n4 = _({}, t4.text ? { text: t4.text } : {}, { "nth-child": null !== (i4 = t4.nth_child) && void 0 !== i4 ? i4 : 0, "nth-of-type": null !== (e4 = t4.nth_of_type) && void 0 !== e4 ? e4 : 0 }, t4.href ? { href: t4.href } : {}, t4.attr_id ? { attr_id: t4.attr_id } : {}, t4.attributes), o4 = {};
        return vs(n4).sort(((t5, i5) => {
          return (r5 = i5[0]) > (e5 = t5[0]) ? -1 : e5 > r5 ? 1 : 0;
          var e5, r5;
        })).forEach(((t5) => {
          var i5 = t5[1];
          return o4[Nn(t5[0].toString())] = Nn(i5.toString());
        })), (r4 += ":") + vs(o4).map(((t5) => t5[0] + '="' + t5[1] + '"')).join("");
      })).join(";");
    })((function(t3) {
      return t3.map(((t4) => {
        var i4, e4, r4 = { text: null == (i4 = t4.$el_text) ? void 0 : i4.slice(0, 400), tag_name: t4.tag_name, href: null == (e4 = t4.attr__href) ? void 0 : e4.slice(0, 2048), attr_class: Ln(t4), attr_id: t4.attr__id, nth_child: t4.nth_child, nth_of_type: t4.nth_of_type, attributes: {} };
        return vs(t4).filter(((t5) => 0 === t5[0].indexOf("attr__"))).forEach(((t5) => r4.attributes[t5[0]] = t5[1])), r4;
      }));
    })(g3)) : "") }, null != (r3 = m3[0]) && r3.$el_text ? { $el_text: null == (s3 = m3[0]) ? void 0 : s3.$el_text } : {}, p3 && "click" === n3.type ? { $external_click_url: p3 } : {}, y3) };
  }
  var Jl = class {
    constructor(t3) {
      this.name = "autocapture", this.Rs = false, this.Ps = null, this.As = false, this.Fs = false, this.mn = { enabled: false, rageclick: false, maskAllElementAttributes: false, maskAllText: false, disableCaptureUrlHashes: false, remoteRequestsDisabled: false }, this.Os = false, this.Ls = t3, this.Ls.refresh(this.mn), this.rageclicks = new Hl(this.mn.rageclick), this.Ds = null;
    }
    setup(t3) {
      this.$s(), this.Ns = t3;
      var i3 = t3.onRemoteConfig(this.onRemoteConfig.bind(this));
      this.Os ? i3.dispose() : (this.qs = i3, this.startIfEnabled());
    }
    dispose() {
      var t3;
      this.Os || (this.Os = true, this.Ns = void 0, null == (t3 = this.qs) || t3.dispose(), this.qs = void 0, this.js());
    }
    Bs() {
      return this.Ls.refresh(this.mn), this.mn;
    }
    $s() {
      var t3, i3;
      return this.Bs(), this.mn.url_allowlist = null == (t3 = this.mn.url_allowlist) ? void 0 : t3.map(((t4) => new RegExp(t4))), this.mn.url_ignorelist = null == (i3 = this.mn.url_ignorelist) ? void 0 : i3.map(((t4) => new RegExp(t4))), this.mn;
    }
    Hs() {
      if (this.isBrowserSupported()) {
        if (t && r) {
          var i3 = this.zs = (i4) => {
            i4 = i4 || (null == t ? void 0 : t.event);
            try {
              this.Us(i4);
            } catch (t3) {
              Vl.error("Failed to capture event", t3);
            }
          };
          if (ms(r, "submit", i3, { capture: true }), ms(r, "change", i3, { capture: true }), ms(r, "click", i3, { capture: true }), this.Bs().capture_copied_text) {
            var e3 = this.Ws = (i4) => {
              i4 = i4 || (null == t ? void 0 : t.event);
              try {
                this.Us(i4, ql);
              } catch (t3) {
                Vl.error("Failed to capture clipboard event", t3);
              }
            };
            ms(r, "copy", e3, { capture: true }), ms(r, "cut", e3, { capture: true }), ms(r, "paste", e3, { capture: true });
          }
        }
      } else Vl.info("Disabling Automatic Event Collection because this browser is not supported");
    }
    js() {
      this.zs && (null == r || r.removeEventListener("submit", this.zs, true), null == r || r.removeEventListener("change", this.zs, true), null == r || r.removeEventListener("click", this.zs, true), this.zs = void 0), this.Ws && (null == r || r.removeEventListener("copy", this.Ws, true), null == r || r.removeEventListener("cut", this.Ws, true), null == r || r.removeEventListener("paste", this.Ws, true), this.Ws = void 0), this.Rs = false;
    }
    startIfEnabled() {
      !this.Os && this.Ns && this.isEnabled && !this.Rs && (this.Hs(), this.Rs = true);
    }
    onRemoteConfig(t3) {
      if (!this.Os) if (this.As = true, t3.ok) {
        var i3 = t3.config;
        i3.elementsChainAsString && (this.Fs = i3.elementsChainAsString);
        var e3, r3 = i3.autocapture_opt_out;
        it(r3) && (null == (e3 = this.Ns) || e3.kv.set(Ze, r3), this.Ps = r3), this.startIfEnabled();
      } else this.startIfEnabled();
    }
    setElementSelectors(t3) {
      this.Ds = t3;
    }
    getElementSelectors(t3) {
      var i3, e3 = [];
      return null == (i3 = this.Ds) || i3.forEach(((i4) => {
        var s3 = null == r ? void 0 : r.querySelectorAll(i4);
        null == s3 || s3.forEach(((r3) => {
          t3 === r3 && e3.push(i4);
        }));
      })), e3;
    }
    get isEnabled() {
      var t3, i3;
      if (this.Os) return false;
      var e3 = null == (t3 = this.Ns) ? void 0 : t3.kv.get(Ze), r3 = this.Ps, s3 = this.Bs(), n3 = s3.remoteRequestsDisabled && !this.As;
      if (Q(r3) && !it(e3) && !n3) return false;
      var o3 = null !== (i3 = this.Ps) && void 0 !== i3 ? i3 : !!e3;
      return !!s3.enabled && !o3;
    }
    Us(i3, e3) {
      if (void 0 === e3 && (e3 = "$autocapture"), this.isEnabled) {
        var r3 = vn(i3);
        sn(r3) && (r3 = r3.parentNode || null);
        var s3, n3 = this.$s();
        "$autocapture" === e3 && "click" === i3.type && i3 instanceof MouseEvent && n3.rageclick && null != (s3 = this.rageclicks) && s3.isRageClick(i3.clientX, i3.clientY, i3.timeStamp || (/* @__PURE__ */ new Date()).getTime()) && Sn(r3, n3.rageclick) && this.Us(i3, "$rageclick");
        var o3 = e3 === ql, a3 = o3 ? _({}, n3, { dom_event_allowlist: void 0 }) : n3;
        if (r3 && (function(i4, e4, r4, s4, n4, o4) {
          var a4;
          if (!t || xn(i4)) return false;
          if (null != r4 && r4.url_allowlist && !ln(r4.url_allowlist, o4)) return false;
          if (null != r4 && r4.url_ignorelist && ln(r4.url_ignorelist, o4)) return false;
          if (null != r4 && r4.dom_event_allowlist) {
            var l4 = r4.dom_event_allowlist;
            if (l4 && !l4.some(((t3) => e4.type === t3))) return false;
          }
          var h4 = En(i4, s4), u4 = h4.parentIsUsefulElement, d4 = h4.targetElementList;
          if (!(function(t3, i5) {
            var e5 = null == i5 ? void 0 : i5.element_allowlist;
            if (K(e5)) return true;
            var r5, s5 = function(t4) {
              if (e5.some(((i6) => t4.tagName.toLowerCase() === i6))) return { v: true };
            };
            for (var n5 of t3) if (r5 = s5(n5)) return r5.v;
            return false;
          })(d4, r4)) return false;
          if (!fn(d4, null == r4 ? void 0 : r4.css_selector_allowlist)) return false;
          if (fn(d4, null !== (a4 = null == r4 ? void 0 : r4.css_selector_ignorelist) && void 0 !== a4 ? a4 : _n)) return false;
          try {
            var v4 = t.getComputedStyle(i4);
            if (v4 && "pointer" === v4.getPropertyValue("cursor") && "click" === e4.type) return true;
          } catch (t3) {
          }
          var c4 = i4.tagName.toLowerCase();
          switch (c4) {
            case "html":
              return false;
            case "form":
              return (n4 || ["submit"]).indexOf(e4.type) >= 0;
            case "input":
            case "select":
            case "textarea":
              return (n4 || ["change", "click"]).indexOf(e4.type) >= 0;
            default:
              return u4 ? (n4 || ["click"]).indexOf(e4.type) >= 0 : (n4 || ["click"]).indexOf(e4.type) >= 0 && (cn.indexOf(c4) > -1 || "true" === i4.getAttribute("contenteditable"));
          }
        })(r3, i3, a3, o3, o3 ? ["copy", "cut", "paste"] : void 0, { config: { get_current_url: n3.getCurrentUrl } })) {
          var l3, h3 = Kl(r3, { e: i3, maskAllElementAttributes: n3.maskAllElementAttributes, maskAllText: n3.maskAllText, elementAttributeIgnoreList: n3.element_attribute_ignorelist, elementsChainAsString: this.Fs, disableCaptureUrlHashes: n3.disableCaptureUrlHashes }), u3 = h3.props;
          if (h3.explicitNoCapture) return false;
          var d3 = this.getElementSelectors(r3);
          if (d3 && d3.length > 0 && (u3.$element_selectors = d3), e3 === ql) {
            var v3 = i3.type || "clipboard";
            if ("paste" !== v3) {
              var c3, f3, p3 = null == t || null == (c3 = t.getSelection()) ? void 0 : c3.toString(), g3 = un(p3);
              if (!g3) return false;
              u3.$selected_content = g3, u3.$clipboard_text_length = null !== (f3 = null == p3 ? void 0 : p3.length) && void 0 !== f3 ? f3 : 0;
            }
            u3.$copy_type = v3;
          }
          return null == (l3 = this.Ns) || l3.capture(e3, u3).catch(((t3) => Vl.error("Failed to capture event", t3))), true;
        }
      }
    }
    isBrowserSupported() {
      return V(null == r ? void 0 : r.querySelectorAll);
    }
  };
  var Yl = class {
    constructor(t3) {
      this._instance = t3;
    }
    refresh(t3) {
      var i3 = this._instance.config, e3 = W(i3.autocapture) ? i3.autocapture : void 0;
      t3.enabled = !!i3.autocapture, t3.rageclick = i3.rageclick, t3.maskAllElementAttributes = i3.mask_all_element_attributes, t3.maskAllText = i3.mask_all_text, t3.disableCaptureUrlHashes = i3.disable_capture_url_hashes, t3.getCurrentUrl = i3.get_current_url, t3.remoteRequestsDisabled = this._instance.do(), t3.url_allowlist = null == e3 ? void 0 : e3.url_allowlist, t3.url_ignorelist = null == e3 ? void 0 : e3.url_ignorelist, t3.dom_event_allowlist = null == e3 ? void 0 : e3.dom_event_allowlist, t3.element_allowlist = null == e3 ? void 0 : e3.element_allowlist, t3.css_selector_allowlist = null == e3 ? void 0 : e3.css_selector_allowlist, t3.css_selector_ignorelist = null == e3 ? void 0 : e3.css_selector_ignorelist, t3.element_attribute_ignorelist = null == e3 ? void 0 : e3.element_attribute_ignorelist, t3.capture_copied_text = null == e3 ? void 0 : e3.capture_copied_text;
    }
  };
  var Ql = Be("[ExceptionAutocapture]");
  var Xl = () => {
  };
  var Zl = (t3) => {
    var i3;
    if (V(t3)) return null !== (i3 = t3.__posthog_layer__) && void 0 !== i3 ? i3 : t3.__rrweb_layer__;
  };
  function th(t3, i3, e3) {
    try {
      if (!(i3 in t3)) return Xl;
      var r3 = { next: t3[i3] }, s3 = e3((function() {
        for (var t4 = arguments.length, i4 = new Array(t4), e4 = 0; t4 > e4; e4++) i4[e4] = arguments[e4];
        return r3.next.apply(this, i4);
      }));
      return V(s3) && (s3.prototype = s3.prototype || {}, Object.defineProperties(s3, { __posthog_wrapped__: { enumerable: false, value: true }, __posthog_layer__: { enumerable: false, value: r3 } })), t3[i3] = s3, () => {
        if (t3[i3] !== s3) for (var e4 = t3[i3], n3 = Zl(e4); n3; ) {
          if (n3.next === s3) return void (n3.next = r3.next);
          n3 = Zl(e4 = n3.next);
        }
        else t3[i3] = r3.next;
      };
    } catch (t4) {
      return Xl;
    }
  }
  var ih = Be("[TracingHeaders]");
  var eh = Be("[Web Vitals]");
  var rh = 9e5;
  var sh = ["CLS", "FCP", "INP", "LCP"];
  var nh = ["INP", "LCP"];
  var oh = ["interactionTarget", "interactionType", "inputDelay", "processingDuration", "presentationDelay", "loadState", "target", "url", "timeToFirstByte", "resourceLoadDelay", "resourceLoadDuration", "elementRenderDelay", "largestShiftTarget", "largestShiftTime", "largestShiftValue", "firstByteToFCP"];
  var ah = "disabled";
  var lh = "lazy_loading";
  var hh = "awaiting_config";
  var uh = "missing_config";
  Be("[SessionRecording]"), Be("[SessionRecording]");
  var dh = "[SessionRecording]";
  var vh = Be(dh);
  var ch = Be("[Heatmaps]");
  function fh(t3) {
    return W(t3) && "clientX" in t3 && "clientY" in t3 && Z(t3.clientX) && Z(t3.clientY);
  }
  var ph = Be("[Product Tours]");
  var _h = (t3) => {
    var i3;
    return !t3.config.disable_product_tours && !(null == (i3 = t3.persistence) || !i3.get_property(or));
  };
  var gh = ["$set_once", "$set"];
  var mh = Be("[SiteApps]");
  var yh = "Error while initializing PostHog app with config id ";
  var bh = (t3, i3) => null != t3 && t3.then ? t3.then(i3) : i3(t3);
  var wh = "SDK is not enabled or survey functionality is not yet loaded";
  var Sh = "Disabled. Not loading surveys.";
  var xh = class {
    constructor(t3, i3) {
      this.name = "surveys", this._surveyEventReceiver = null, this._surveyManager = null, this.Su = false, this.xu = [], this.Cu = null, this.Tu = null, this.Os = false, this.Mu = /* @__PURE__ */ new Set(), this.onRemoteConfig = (t4) => {
        if (!this.Os && !this.mn.disableSurveys) {
          if (!t4.ok) return pl.warn("Remote config unavailable. Not loading surveys.");
          var i4 = t4.config.surveys;
          if (X(i4)) return pl.warn("Flags not loaded yet. Not loading surveys.");
          this.Eu = it(i4) ? i4 : i4.length > 0, pl.info("flags response received, isSurveysEnabled: " + this.Eu), this.loadIfEnabled();
        }
      }, this.Ls = t3, this.Iu = i3;
    }
    setup(t3) {
      if (!this.Os) return this.Ru = t3, bh(t3.kv.initialize(), (() => {
        if (this.Ru === t3 && !this.Os) {
          this.Ru = void 0, this.Ns = t3;
          var i3 = t3.onRemoteConfig(this.onRemoteConfig);
          this.Os ? i3.dispose() : (this.qs = i3, this.loadIfEnabled());
        }
      }));
    }
    dispose() {
      var t3, i3, e3;
      this.Os || (this.Os = true, this.Ru = void 0, this.Ns = void 0, null == (t3 = this.qs) || t3.dispose(), this.qs = void 0, null == (i3 = this._surveyEventReceiver) || i3.dispose(), this._surveyEventReceiver = null, null == (e3 = this._surveyManager) || null == e3.dispose || e3.dispose(), this._surveyManager = null, this.xu = [], this.Cu = null, this.Mu.forEach(((t4) => clearTimeout(t4))), this.Mu.clear());
    }
    get mn() {
      return this.Ls.get();
    }
    initialize() {
      this.loadIfEnabled();
    }
    reset() {
      try {
        var t3;
        null == (t3 = this._surveyEventReceiver) || t3.reset(), localStorage.removeItem("lastSeenSurveyDate");
        for (var i3 = [], e3 = 0; e3 < localStorage.length; e3++) {
          var r3 = localStorage.key(e3);
          (null != r3 && r3.startsWith(_l) || null != r3 && r3.startsWith("inProgressSurvey_")) && i3.push(r3);
        }
        i3.forEach(((t4) => localStorage.removeItem(t4)));
      } catch (t4) {
      }
    }
    loadIfEnabled() {
      if (!this.Os && this.Ns) {
        var t3 = this.mn;
        if (!this._surveyManager) if (this.Su) pl.info("Already initializing surveys, skipping...");
        else if (t3.disableSurveys) pl.info(Sh);
        else if (t3.cookielessMode && this.Ls.isOptedOut()) pl.info("Not loading surveys in cookieless mode without consent.");
        else {
          var i3 = this.Ls.getExtensions();
          if (i3) {
            if (!K(this.Eu) || t3.advancedEnableSurveys) {
              var e3 = this.Eu || t3.advancedEnableSurveys;
              this.Su = true;
              try {
                var r3 = i3.generateSurveys;
                if (r3) return this.Pu(r3, e3), void (this.Su = false);
                var s3 = i3.loadExternalDependency;
                if (!s3) return this.Au(Qr), void (this.Su = false);
                s3(((t4) => {
                  try {
                    if (this.Os) return;
                    var i4 = this.Ls.getExtensions();
                    t4 || null == i4 || !i4.generateSurveys ? this.Au("Could not load surveys script", t4) : this.Pu(i4.generateSurveys, e3);
                  } finally {
                    this.Su = false;
                  }
                }));
              } catch (t4) {
                throw this.Su = false, this.Au("Error initializing surveys", t4), t4;
              }
            }
          } else pl.error("PostHog Extensions not found.");
        }
      }
    }
    Pu(t3, i3) {
      this.Os || (this._surveyManager = t3(i3), this._surveyEventReceiver = this.Ls.createEventReceiver(), pl.info("Surveys loaded successfully"), this.Fu({ isLoaded: true }));
    }
    Au(t3, i3) {
      pl.error(t3, i3), this.Fu({ isLoaded: false, error: t3 });
    }
    onSurveysLoaded(t3) {
      return this.xu.push(t3), this._surveyManager && this.Fu({ isLoaded: true }), () => {
        this.xu = this.xu.filter(((i3) => i3 !== t3));
      };
    }
    getSurveys(t3, i3) {
      var e3;
      void 0 === i3 && (i3 = false);
      var r3 = null !== (e3 = this.Ns) && void 0 !== e3 ? e3 : this.Iu;
      if (r3 && !this.Os) {
        if (this.mn.disableSurveys) return pl.info(Sh), t3([]);
        var s3 = r3.kv.get(Rr);
        if (s3 && !i3) return t3(s3, { isLoaded: true }), void (this.Ou() && this.getSurveys((() => {
        }), true));
        if (this.Cu) this.Cu.then(((i4) => {
          this.Os || t3(i4.surveys, i4.context);
        })).catch(((t4) => pl.error("Error in survey callback", t4)));
        else {
          var n3 = this.Lu("/api/surveys/", { method: "GET", query: { token: r3.projectToken }, sentAt: "query", timeoutMs: this.mn.requestTimeoutMs }).then(((t4) => {
            try {
              return this.Du(r3, t4);
            } catch (t5) {
              return pl.error("Error processing surveys response", t5), this.Du(r3, { statusCode: 0, error: t5 });
            }
          }), ((t4) => this.Du(r3, { statusCode: 0, error: t4 })));
          this.Cu = n3;
          var o3 = () => {
            this.Cu === n3 && (this.Cu = null);
          };
          n3.then(((i4) => {
            o3(), this.Os || t3(i4.surveys, i4.context);
          }), o3).catch(((t4) => pl.error("Error in survey callback", t4)));
        }
      }
    }
    Lu(t3, i3) {
      var e3 = this.Ns;
      return e3 ? e3.sendRequest(t3, i3) : new Promise(((t4) => t4({ statusCode: 0, error: new Error(wh) })));
    }
    Du(t3, i3) {
      if (this.Os) return { surveys: [], context: { isLoaded: false, error: wh } };
      var e3 = i3.statusCode;
      if (200 !== e3 || !i3.json) {
        var r3 = "Surveys API could not be loaded, status: " + e3;
        return 0 !== e3 ? pl.error(r3) : i3.error || pl.warn(r3), this.Tu = Date.now(), { surveys: [], context: { isLoaded: false, error: r3 } };
      }
      this.Tu = null;
      var s3, n3 = i3.json.surveys || [], o3 = n3.filter(((t4) => (function(t5) {
        return !(!t5.start_date || t5.end_date);
      })(t4) && (sl(t4) || (function(t5) {
        var i4;
        return !(null == (i4 = t5.conditions) || null == (i4 = i4.actions) || null == (i4 = i4.values) || !i4.length);
      })(t4))));
      return o3.length > 0 && (null == (s3 = this._surveyEventReceiver) || s3.register(o3)), t3.kv.set({ [Rr]: n3, [Cr]: Date.now() }), { surveys: n3, context: { isLoaded: true } };
    }
    Ou() {
      return this.$u() && !this.Cu && !this.Nu();
    }
    $u() {
      var t3, i3, e3 = null == (t3 = null !== (i3 = this.Ns) && void 0 !== i3 ? i3 : this.Iu) ? void 0 : t3.kv.get(Cr);
      return Z(e3) && Date.now() - e3 > 3e5;
    }
    Nu() {
      return Z(this.Tu) && 3e5 > Date.now() - this.Tu;
    }
    markSurveyAsSeen(t3, i3) {
      var e3, r3 = { id: t3, current_iteration: null !== (e3 = null == i3 ? void 0 : i3.iteration) && void 0 !== e3 ? e3 : null };
      gl(r3);
      try {
        localStorage.setItem("lastSeenSurveyDate", (/* @__PURE__ */ new Date()).toISOString());
      } catch (t4) {
      }
    }
    Fu(t3) {
      for (var i3 of this.xu) try {
        if (!t3.isLoaded) return i3([], t3);
        this.getSurveys(i3);
      } catch (t4) {
        pl.error("Error in survey callback", t4);
      }
    }
    getActiveMatchingSurveys(t3, i3) {
      if (void 0 === i3 && (i3 = false), !X(this._surveyManager)) return this._surveyManager.getActiveMatchingSurveys(t3, i3);
      pl.warn("init was not called");
    }
    qu(t3) {
      var i3 = null;
      return this.getSurveys(((e3) => {
        var r3;
        i3 = null !== (r3 = e3.find(((i4) => i4.id === t3))) && void 0 !== r3 ? r3 : null;
      })), i3;
    }
    ju(t3) {
      if (X(this._surveyManager)) return { eligible: false, reason: wh };
      var i3 = "string" == typeof t3 ? this.qu(t3) : t3;
      return i3 ? this._surveyManager.checkSurveyEligibility(i3) : { eligible: false, reason: "Survey not found" };
    }
    Bu(t3) {
      if (X(this._surveyManager)) return { eligible: false, reason: wh };
      var i3 = "string" == typeof t3 ? this.qu(t3) : t3;
      return i3 ? this._surveyManager.checkSurveyRenderability(i3) : { eligible: false, reason: "Survey not found" };
    }
    canRenderSurvey(t3) {
      if (X(this._surveyManager)) return pl.warn("init was not called"), { visible: false, disabledReason: wh };
      var i3 = this.Bu(t3);
      return { visible: i3.eligible, disabledReason: i3.reason };
    }
    canRenderSurveyAsync(t3, i3) {
      return X(this._surveyManager) ? (pl.warn("init was not called"), Promise.resolve({ visible: false, disabledReason: wh })) : new Promise(((e3) => {
        this.getSurveys(((i4) => {
          var r3, s3 = null !== (r3 = i4.find(((i5) => i5.id === t3))) && void 0 !== r3 ? r3 : null;
          if (s3) {
            var n3 = this.Bu(s3);
            e3({ visible: n3.eligible, disabledReason: n3.reason });
          } else e3({ visible: false, disabledReason: "Survey not found" });
        }), i3);
      }));
    }
    renderSurvey(t3, i3, e3) {
      var s3;
      if (X(this._surveyManager)) pl.warn("init was not called");
      else {
        var n3 = "string" == typeof t3 ? this.qu(t3) : t3;
        if (null != n3 && n3.id) if (ml.includes(n3.type)) {
          var o3 = null == r ? void 0 : r.querySelector(i3);
          if (o3) if (null != (s3 = n3.appearance) && s3.surveyPopupDelaySeconds) {
            pl.info("Rendering survey " + n3.id + " with delay of " + n3.appearance.surveyPopupDelaySeconds + " seconds");
            var a3 = setTimeout((() => {
              var t4, i4;
              this.Mu.delete(a3), this.Os || (pl.info("Rendering survey " + n3.id + " with delay of " + (null == (t4 = n3.appearance) ? void 0 : t4.surveyPopupDelaySeconds) + " seconds"), null == (i4 = this._surveyManager) || i4.renderSurvey(n3, o3, e3), pl.info("Survey " + n3.id + " rendered"));
            }), 1e3 * n3.appearance.surveyPopupDelaySeconds);
            this.Mu.add(a3);
          } else this._surveyManager.renderSurvey(n3, o3, e3);
          else pl.warn("Survey element not found");
        } else pl.warn("Surveys of type " + n3.type + " cannot be rendered in the app");
        else pl.warn("Survey not found");
      }
    }
    displaySurvey(t3, i3) {
      var e3;
      if (X(this._surveyManager)) pl.warn("init was not called");
      else {
        var r3 = this.qu(t3);
        if (r3) {
          var s3 = r3;
          if (null != (e3 = r3.appearance) && e3.surveyPopupDelaySeconds && i3.ignoreDelay && (s3 = _({}, r3, { appearance: _({}, r3.appearance, { surveyPopupDelaySeconds: 0 }) })), i3.displayType !== Ho.Popover && i3.initialResponses && pl.warn("initialResponses is only supported for popover surveys. prefill will not be applied."), false === i3.ignoreConditions) {
            var n3 = this.ju(r3);
            if (!n3.eligible) return void pl.warn("Survey is not eligible to be displayed: ", n3.reason);
          }
          i3.displayType !== Ho.Inline ? this._surveyManager.handlePopoverSurvey(s3, i3) : this.renderSurvey(s3, i3.selector, i3.properties);
        } else pl.warn("Survey not found");
      }
    }
    cancelPendingSurvey(t3) {
      X(this._surveyManager) ? pl.warn("init was not called") : this._surveyManager.cancelSurvey(t3);
    }
    handlePageUnload() {
      var t3;
      null == (t3 = this._surveyManager) || null == t3.handlePageUnload || t3.handlePageUnload();
    }
  };
  function Eh(t3, i3, e3) {
    if (X(t3)) return false;
    switch (e3) {
      case "exact":
        return t3 === i3;
      case "contains":
        var r3 = i3.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_/g, ".").replace(/%/g, ".*");
        return new RegExp(r3, "i").test(t3);
      case "regex":
        try {
          return new RegExp(i3).test(t3);
        } catch (t4) {
          return false;
        }
      default:
        return false;
    }
  }
  var kh = class {
    constructor(t3) {
      this.Hu = /* @__PURE__ */ new Set(), this.zu = /* @__PURE__ */ new Set(), this.Uu = new Xa(), this.Wu = (t4, i3) => this.Vu(t4, i3) && this.Gu(t4, i3) && this.Zu(t4, i3) && this.Qu(t4, i3), this.Vu = (t4, i3) => null == i3 || !i3.event || (null == t4 ? void 0 : t4.event) === (null == i3 ? void 0 : i3.event), this._instance = t3;
    }
    init() {
      var t3, i3;
      K(null == (t3 = this._instance) ? void 0 : t3._addCaptureHook) || (this.Ju = null == (i3 = this._instance) ? void 0 : i3._addCaptureHook(((t4, i4) => {
        this.on(t4, i4);
      })));
    }
    dispose() {
      var t3;
      null == (t3 = this.Ju) || t3.call(this), this.Ju = void 0, this.Uu = new Xa();
    }
    register(t3) {
      var i3, e3;
      if (!K(null == (i3 = this._instance) ? void 0 : i3._addCaptureHook) && (t3.forEach(((t4) => {
        var i4;
        this.Hu.add(t4), null == (i4 = t4.steps) || i4.forEach(((t5) => {
          this.zu.add((null == t5 ? void 0 : t5.event) || "");
        }));
      })), null != (e3 = this._instance) && e3.autocapture)) {
        var r3 = /* @__PURE__ */ new Set();
        this.Hu.forEach(((t4) => {
          var i4;
          null == (i4 = t4.steps) || i4.forEach(((t5) => {
            null != t5 && t5.selector && r3.add(t5.selector);
          }));
        })), this._instance.autocapture.setElementSelectors(r3);
      }
    }
    replace(t3) {
      this.Hu.clear(), this.zu.clear(), this.register(t3);
    }
    on(t3, i3) {
      null != i3 && 0 != t3.length && (this.zu.has(t3) || this.zu.has(i3.event)) && this.Hu.forEach(((t4) => {
        this.Ku(i3, t4) && this.Uu.emit("actionCaptured", t4.name);
      }));
    }
    Yu(t3) {
      this.onAction("actionCaptured", ((i3) => t3(i3)));
    }
    Ku(t3, i3) {
      if (null == (null == i3 ? void 0 : i3.steps)) return false;
      for (var e3 of i3.steps) if (this.Wu(t3, e3)) return true;
      return false;
    }
    onAction(t3, i3) {
      return this.Uu.on(t3, i3);
    }
    Gu(t3, i3) {
      if (null != i3 && i3.url) {
        var e3, r3 = null == t3 || null == (e3 = t3.properties) ? void 0 : e3.$current_url;
        if (!r3 || "string" != typeof r3) return false;
        if (!Eh(r3, i3.url, i3.url_matching || "contains")) return false;
      }
      return true;
    }
    Zu(t3, i3) {
      return !!this.Xu(t3, i3) && !!this.th(t3, i3) && !!this.eh(t3, i3);
    }
    Xu(t3, i3) {
      var e3;
      if (null == i3 || !i3.href) return true;
      var r3 = this.ih(t3);
      if (r3.length > 0) return r3.some(((t4) => Eh(t4.href, i3.href, i3.href_matching || "exact")));
      var s3, n3 = (null == t3 || null == (e3 = t3.properties) ? void 0 : e3.$elements_chain) || "";
      return !!n3 && Eh((s3 = n3.match(/(?::|")href="(.*?)"/)) ? s3[1] : "", i3.href, i3.href_matching || "exact");
    }
    th(t3, i3) {
      var e3;
      if (null == i3 || !i3.text) return true;
      var r3 = this.ih(t3);
      if (r3.length > 0) return r3.some(((t4) => Eh(t4.text, i3.text, i3.text_matching || "exact") || Eh(t4.$el_text, i3.text, i3.text_matching || "exact")));
      var s3, n3, o3, a3 = (null == t3 || null == (e3 = t3.properties) ? void 0 : e3.$elements_chain) || "";
      return !!a3 && (s3 = (function(t4) {
        for (var i4, e4 = [], r4 = /(?::|")text="(.*?)"/g; !X(i4 = r4.exec(t4)); ) e4.includes(i4[1]) || e4.push(i4[1]);
        return e4;
      })(a3), n3 = i3.text, o3 = i3.text_matching || "exact", s3.some(((t4) => Eh(t4, n3, o3))));
    }
    eh(t3, i3) {
      var e3, r3;
      if (null == i3 || !i3.selector) return true;
      var s3 = null == t3 || null == (e3 = t3.properties) ? void 0 : e3.$element_selectors;
      if (null != s3 && s3.includes(i3.selector)) return true;
      var n3 = (null == t3 || null == (r3 = t3.properties) ? void 0 : r3.$elements_chain) || "";
      if (i3.selector_regex && n3) try {
        return new RegExp(i3.selector_regex).test(n3);
      } catch (t4) {
        return false;
      }
      return false;
    }
    ih(t3) {
      var i3;
      return null == (null == t3 || null == (i3 = t3.properties) ? void 0 : i3.$elements) ? [] : null == t3 ? void 0 : t3.properties.$elements;
    }
    Qu(t3, i3) {
      return null == i3 || !i3.properties || 0 === i3.properties.length || ll(i3.properties.reduce(((t4, i4) => {
        var e3 = q(i4.value) ? i4.value.map(String) : null != i4.value ? [String(i4.value)] : [];
        return t4[i4.key] = { values: e3, operator: i4.operator || "exact" }, t4;
      }), {}), null == t3 ? void 0 : t3.properties);
    }
  };
  var Th = class {
    constructor(t3) {
      var i3;
      this.rh = [], this._instance = t3, this.nh = /* @__PURE__ */ new Map(), this.sh = /* @__PURE__ */ new Map(), this.ah = /* @__PURE__ */ new Map(), this.oh = null == (i3 = this._instance) || null == i3.onSessionId ? void 0 : i3.onSessionId(((t4) => this.lh(t4)));
    }
    uh(t3) {
      return false;
    }
    hh() {
      return null;
    }
    dh(t3) {
    }
    fh() {
    }
    ph(t3, i3) {
      return !!t3 && ll(t3.propertyFilters, null == i3 ? void 0 : i3.properties);
    }
    gh(t3, i3) {
      var e3 = /* @__PURE__ */ new Map();
      return t3.forEach(((t4) => {
        var r3;
        null == (r3 = t4.conditions) || null == (r3 = r3[i3]) || null == (r3 = r3.values) || r3.forEach(((i4) => {
          if (null != i4 && i4.name) {
            var r4 = e3.get(i4.name) || [];
            r4.push(t4.id), e3.set(i4.name, r4);
          }
        }));
      })), e3;
    }
    mh(t3, i3, e3) {
      var r3 = (e3 === Fo.Activation ? this.nh : this.sh).get(t3), s3 = [];
      return this.yh(((t4) => {
        s3 = t4.filter(((t5) => null == r3 ? void 0 : r3.includes(t5.id)));
      })), s3.filter(((r4) => {
        var s4, n3 = null == (s4 = r4.conditions) || null == (s4 = s4[e3]) || null == (s4 = s4.values) ? void 0 : s4.find(((i4) => i4.name === t3));
        return this.ph(n3, i3);
      }));
    }
    register(t3) {
      this.bh(t3, false);
    }
    replace(t3) {
      this.bh(t3, true);
    }
    bh(t3, i3) {
      var e3;
      K(null == (e3 = this._instance) ? void 0 : e3._addCaptureHook) || (this._h(t3, i3), this.wh(t3, i3));
    }
    wh(t3, i3) {
      var e3 = t3.filter(((t4) => {
        var i4;
        return null == (i4 = t4.conditions) || null == (i4 = i4.actions) || null == (i4 = i4.values) ? void 0 : i4.length;
      }));
      if (i3 && this.ah.clear(), 0 !== e3.length) {
        this.kh || (this.kh = new kh(this._instance), this.kh.init(), this.kh.Yu(((t4) => this.onAction(t4))));
        var r3 = [];
        e3.forEach(((t4) => {
          var i4;
          null == (i4 = t4.conditions) || null == (i4 = i4.actions) || i4.values.forEach(((i5) => {
            if (r3.push(i5), i5.name) {
              var e4, s4 = null !== (e4 = this.ah.get(i5.name)) && void 0 !== e4 ? e4 : [];
              s4.includes(t4.id) || s4.push(t4.id), this.ah.set(i5.name, s4);
            }
          }));
        })), i3 ? this.kh.replace(r3) : this.kh.register(r3);
      } else {
        var s3;
        i3 && (null == (s3 = this.kh) || s3.replace([]));
      }
    }
    Sh(t3, i3) {
      i3.forEach(((i4, e3) => {
        var r3, s3 = null !== (r3 = t3.get(e3)) && void 0 !== r3 ? r3 : [];
        i4.forEach(((t4) => {
          s3.includes(t4) || s3.push(t4);
        })), t3.set(e3, s3);
      }));
    }
    _h(t3, i3) {
      var e3, r3, s3 = t3.filter(((t4) => {
        var i4, e4;
        return (null == (i4 = t4.conditions) ? void 0 : i4.events) && (null == (e4 = t4.conditions) || null == (e4 = e4.events) || null == (e4 = e4.values) ? void 0 : e4.length) > 0;
      })), n3 = t3.filter(((t4) => {
        var i4, e4;
        return (null == (i4 = t4.conditions) ? void 0 : i4.cancelEvents) && (null == (e4 = t4.conditions) || null == (e4 = e4.cancelEvents) || null == (e4 = e4.values) ? void 0 : e4.length) > 0;
      })), o3 = this.gh(t3, Fo.Activation), a3 = this.gh(t3, Fo.Cancellation);
      i3 ? (this.nh = o3, this.sh = a3) : (this.Sh(this.nh, o3), this.Sh(this.sh, a3)), (0 !== s3.length || 0 !== n3.length) && (null !== (e3 = this.Ju) && void 0 !== e3 || (this.Ju = null == (r3 = this._instance) ? void 0 : r3._addCaptureHook(((t4, i4) => {
        this.onEvent(t4, i4);
      }))));
    }
    onEvent(t3, i3) {
      var e3, r3, s3 = this.xh(), n3 = (null == i3 || null == (e3 = i3.properties) ? void 0 : e3.$survey_id) || (null == i3 || null == (r3 = i3.properties) ? void 0 : r3.$product_tour_id);
      if (n3 && this.getActivatedIds().includes(n3)) {
        var o3 = this.Ch(t3, n3);
        if ("consume" === o3) return s3.info("event consumed activated item, removing it", { event: t3, itemId: n3 }), void this.Th([n3]);
        if ("persist" === o3) return s3.info("shown item promoted to persisted activation", { event: t3, itemId: n3 }), this.Mh(n3), void this.Eh([n3]);
      }
      if (this.sh.has(t3)) {
        var a3 = this.mh(t3, i3, Fo.Cancellation);
        a3.length > 0 && (s3.info("cancel event matched, cancelling items", { event: t3, itemsToCancel: a3.map(((t4) => t4.id)) }), this.Th(a3.map(((t4) => t4.id))), a3.forEach(((t4) => this.Ih(t4.id))));
      }
      if (this.nh.has(t3)) {
        s3.info("event name matched", { event: t3, eventPayload: i3, items: this.nh.get(t3) });
        var l3 = this.mh(t3, i3, Fo.Activation);
        this.Rh(l3.map(((t4) => t4.id)));
      }
    }
    onAction(t3) {
      this.ah.has(t3) && this.Rh(this.ah.get(t3) || []);
    }
    Rh(t3) {
      var i3;
      if (0 !== t3.length) {
        var e3 = !(null == (i3 = this._instance) || null == i3.get_session_id || !i3.get_session_id()), r3 = [];
        for (var s3 of t3) e3 && this.uh(s3) ? this.Mh(s3) && this.Ph(s3) : r3.push(s3);
        r3.length > 0 && (this.rh = [.../* @__PURE__ */ new Set([...this.rh, ...r3])]), this.xh().info("updating activated items", { activatedItems: this.getActivatedIds() });
      }
    }
    Mh(t3) {
      this.rh = this.rh.filter(((i4) => i4 !== t3));
      var i3 = this.Ah();
      return !i3.includes(t3) && (this.Fh([...i3, t3]), this.Oh(), true);
    }
    Th(t3) {
      var i3 = new Set(t3);
      this.rh = this.rh.filter(((t4) => !i3.has(t4)));
      var e3 = this.Lh(), r3 = e3.filter(((t4) => !i3.has(t4)));
      r3.length !== e3.length && (this.Fh(r3), 0 === r3.length && this.Dh()), this.Eh(t3);
    }
    $h() {
      var t3, i3 = this.hh();
      if (!i3) return {};
      var e3 = null == (t3 = this._instance) || null == (t3 = t3.persistence) ? void 0 : t3.props[i3];
      return e3 && "object" == typeof e3 ? e3 : {};
    }
    Ph(t3) {
      if (this.hh()) {
        var i3 = this.$h();
        this.dh(_({}, i3, { [t3]: Date.now() }));
      }
    }
    Eh(t3) {
      if (this.hh()) {
        var i3 = this.$h(), e3 = {}, r3 = false;
        for (var s3 of Object.entries(i3)) {
          var n3 = s3[0], o3 = s3[1];
          t3.includes(n3) ? r3 = true : e3[n3] = o3;
        }
        r3 && (G(e3) ? this.fh() : this.dh(e3));
      }
    }
    Nh() {
      this.hh() && this.fh();
    }
    getActivationTimestamp(t3) {
      if (this.Ah().includes(t3)) {
        var i3 = this.$h()[t3];
        return Z(i3) ? i3 : void 0;
      }
    }
    Lh() {
      var t3, i3 = this.qh();
      return (null == (t3 = this._instance) || null == (t3 = t3.persistence) ? void 0 : t3.props[i3]) || [];
    }
    Ah() {
      var t3, i3, e3 = this.Lh();
      if (0 === e3.length) return [];
      var r3 = null == (t3 = this._instance) || null == (t3 = t3.persistence) ? void 0 : t3.props[this.jh()], s3 = null == (i3 = this._instance) || null == i3.get_session_id ? void 0 : i3.get_session_id();
      return s3 && r3 === s3 ? e3 : [];
    }
    Oh() {
      var t3, i3 = null == (t3 = this._instance) || null == t3.get_session_id ? void 0 : t3.get_session_id();
      i3 && this.Bh(i3);
    }
    Dh() {
      this.Hh();
    }
    lh(t3) {
      var i3, e3 = null == (i3 = this._instance) || null == (i3 = i3.persistence) ? void 0 : i3.props[this.jh()];
      if (e3 && e3 !== t3) {
        var r3 = this.Lh(), s3 = this.$h();
        r3.length > 0 && (this.Fh([]), r3.filter(((t4) => Z(s3[t4]))).forEach(((t4) => this.Ih(t4)))), this.Dh(), this.Nh();
      }
    }
    getActivatedIds() {
      return [.../* @__PURE__ */ new Set([...this.Ah(), ...this.rh])].filter(((t3) => !this.zh(t3)));
    }
    dispose() {
      var t3, i3, e3;
      null == (t3 = this.oh) || t3.call(this), this.oh = void 0, null == (i3 = this.Ju) || i3.call(this), this.Ju = void 0, null == (e3 = this.kh) || e3.dispose(), this.kh = void 0;
    }
    reset() {
      this.rh = [], this.Lh().length > 0 && this.Fh([]), this.Dh(), this.Nh();
    }
    getEventToItemsMap() {
      return this.nh;
    }
    Uh() {
      return this.kh;
    }
  };
  var $h = class extends Th {
    constructor(t3) {
      super(t3);
    }
    qh() {
      return Or;
    }
    jh() {
      return Ir;
    }
    hh() {
      return Fr;
    }
    dh(t3) {
      var i3;
      null == (i3 = this._instance) || null == (i3 = i3.persistence) || i3.register({ [Fr]: t3 });
    }
    fh() {
      var t3;
      null == (t3 = this._instance) || null == (t3 = t3.persistence) || t3.unregister(Fr);
    }
    uh(t3) {
      var i3, e3;
      this.yh(((i4) => {
        e3 = i4.find(((i5) => i5.id === t3));
      }));
      var r3 = null == (i3 = e3) || null == (i3 = i3.appearance) ? void 0 : i3.surveyPopupDelaySeconds;
      return Z(r3) && r3 > 0;
    }
    Wh() {
      return Bo.SHOWN;
    }
    yh(t3) {
      var i3;
      null == (i3 = this._instance) || i3.getSurveys(t3);
    }
    Ih(t3) {
      var i3;
      null == (i3 = this._instance) || i3.cancelPendingSurvey(t3);
    }
    xh() {
      return pl;
    }
    Fh(t3) {
      var i3;
      null == (i3 = this._instance) || null == (i3 = i3.persistence) || i3.register({ [Or]: t3 });
    }
    Bh(t3) {
      var i3;
      null == (i3 = this._instance) || null == (i3 = i3.persistence) || i3.register({ [Ir]: t3 });
    }
    Hh() {
      var t3;
      null == (t3 = this._instance) || null == (t3 = t3.persistence) || t3.unregister(Ir);
    }
    zh() {
      return false;
    }
    Ch(t3, i3) {
      var e3;
      this.yh(((t4) => {
        e3 = t4.find(((t5) => t5.id === i3));
      }));
      var r3 = !e3 || (function(t4) {
        var i4;
        return sl(t4) && !(null == (i4 = t4.conditions) || null == (i4 = i4.events) || !i4.repeatedActivation) || "always" === t4.schedule;
      })(e3);
      return r3 ? t3 === Bo.SHOWN ? "consume" : "ignore" : t3 === Bo.SHOWN ? "persist" : t3 === Bo.DISMISSED || t3 === Bo.SENT ? "consume" : "ignore";
    }
    getSurveys() {
      return this.getActivatedIds();
    }
    getEventToSurveys() {
      return this.getEventToItemsMap();
    }
  };
  var Ph = class {
    constructor(t3) {
      this._instance = t3;
    }
    initialize() {
    }
    get(t3) {
      if ("string" == typeof t3) return this._instance.get_property(t3);
      var i3 = {};
      for (var e3 of t3) {
        var r3 = this._instance.get_property(e3);
        K(r3) || (i3[e3] = r3);
      }
      return i3;
    }
    set(t3, i3) {
      this._instance.register("string" == typeof t3 ? { [t3]: i3 } : t3);
    }
    remove(t3) {
      "string" != typeof t3 ? t3.forEach(((t4) => this._instance.unregister(t4))) : this._instance.unregister(t3);
    }
  };
  var Rh = class {
    constructor(t3) {
      this._instance = t3;
    }
    get() {
      var t3 = this._instance.config;
      return { disableSurveys: t3.disable_surveys, cookielessMode: !!t3.cookieless_mode, advancedEnableSurveys: t3.advanced_enable_surveys, requestTimeoutMs: t3.surveys_request_timeout_ms };
    }
    isOptedOut() {
      return this._instance.consent.isOptedOut();
    }
    getExtensions() {
      var t3 = null == v ? void 0 : v.__PosthogExtensions__;
      if (t3) {
        var i3 = t3.generateSurveys, e3 = t3.loadExternalDependency;
        return { generateSurveys: i3 ? (t4) => i3(this._instance, t4) : void 0, loadExternalDependency: e3 ? (t4) => e3(this._instance, "surveys", t4) : void 0 };
      }
    }
    createEventReceiver() {
      return new $h(this._instance);
    }
  };
  var Ch = null != t && t.location ? eo(t.location.hash, "__posthog") || eo(location.hash, "state") : null;
  var Oh = "_postHogToolbarParams";
  var Ih = Be("[Toolbar]");
  var Fh = Be("[FeatureFlags]");
  var Ah = class {
    constructor(t3, i3) {
      void 0 === i3 && (i3 = false), this.Vh = false, this.update(t3, i3);
    }
    update(t3, i3) {
      this.Gh = ((t4, i4) => {
        var e3, r3, s3, n3, o3;
        return { bootstrap: { featureFlags: null == (e3 = t4.bootstrap) ? void 0 : e3.featureFlags, featureFlagPayloads: null == (r3 = t4.bootstrap) ? void 0 : r3.featureFlagPayloads }, remoteRequestsDisabled: i4, featureFlagsDisabled: !!t4.advanced_disable_feature_flags, onlyEvaluateSurveyFeatureFlags: !!t4.advanced_only_evaluate_survey_feature_flags, deduplicateCallsPerSession: !!t4.advanced_feature_flags_dedup_per_session, cacheTtlMs: t4.feature_flag_cache_ttl_ms, refreshIntervalMs: null !== (s3 = t4.remote_config_refresh_interval_ms) && void 0 !== s3 ? s3 : 3e5, requestTimeoutMs: t4.feature_flag_request_timeout_ms, compression: t4.disable_compression ? void 0 : "best-available", evaluationContexts: null !== (n3 = null !== (o3 = t4.evaluation_contexts) && void 0 !== o3 ? o3 : t4.evaluation_environments) && void 0 !== n3 ? n3 : [], flagKeys: q(t4.flag_keys) ? t4.flag_keys : void 0 };
      })(t3, i3), !t3.evaluation_environments || t3.evaluation_contexts || this.Vh || (Fh.warn("evaluation_environments is deprecated. Use evaluation_contexts instead. evaluation_environments will be removed in a future version."), this.Vh = true), K(t3.flag_keys) || q(t3.flag_keys) || Fh.error("Invalid flag_keys found:", t3.flag_keys, "Expected array of non-empty strings");
    }
    get() {
      return this.Gh;
    }
  };
  var Mh = Be("[FeatureFlags]");
  var Dh = Be("[FeatureFlags]", { debugEnabled: true });
  var Nh = `" failed. Feature flags didn't load in time.`;
  var Lh = "connection_error";
  var jh = (t3) => {
    for (var i3 = {}, e3 = 0; t3.length > e3; e3++) i3[t3[e3]] = true;
    return i3;
  };
  var Uh = (t3) => {
    var i3 = {};
    for (var e3 of vs(t3 || {})) {
      var r3 = e3[1];
      r3 && (i3[e3[0]] = r3);
    }
    return i3;
  };
  var Bh = Be("[Error tracking]");
  var zh = "webkit-masked-url:";
  var Hh = ["chrome-extension://", "moz-extension://", "safari-extension:", "safari-web-extension:", zh];
  var qh = ["__firefox__", "__gCrWeb"];
  var Vh = "Refusing to render web experiment since the viewer is a likely bot";
  var Wh = { icontains: (t3, i3) => i3.toLowerCase().indexOf(t3.toLowerCase()) > -1, not_icontains: (t3, i3) => -1 === i3.toLowerCase().indexOf(t3.toLowerCase()), regex: (t3, i3) => nl(i3, t3), not_regex: (t3, i3) => !nl(i3, t3), exact: (t3, i3) => i3 === t3, is_not: (t3, i3) => i3 !== t3 };
  var Gh = class _Gh {
    get mn() {
      return this._instance.config;
    }
    constructor(t3) {
      var i3 = this;
      this.getWebExperimentsAndEvaluateDisplayLogic = function(t4) {
        void 0 === t4 && (t4 = false), i3.getWebExperiments(((t5) => {
          _Gh.Zh("retrieved web experiments from the server"), i3.Qh = /* @__PURE__ */ new Map(), t5.forEach(((t6) => {
            if (t6.feature_flag_key) {
              var e3;
              i3.Qh && (_Gh.Zh("setting flag key ", t6.feature_flag_key, " to web experiment ", t6), null == (e3 = i3.Qh) || e3.set(t6.feature_flag_key, t6));
              var r3 = i3._instance.getFeatureFlag(t6.feature_flag_key);
              J(r3) && t6.variants[r3] && i3.Jh(t6.name, r3, t6.variants[r3].transforms);
            } else if (t6.variants) for (var s3 in t6.variants) {
              var n3 = t6.variants[s3];
              _Gh.Kh(n3, i3._instance) && i3.Jh(t6.name, s3, n3.transforms);
            }
          }));
        }), t4);
      }, this._instance = t3, this._instance.onFeatureFlags(((t4) => {
        this.onFeatureFlags(t4);
      }));
    }
    initialize() {
    }
    onFeatureFlags(t3) {
      if (this._is_bot()) _Gh.Zh(Vh);
      else if (!this.mn.disable_web_experiments) {
        if (X(this.Qh)) return this.Qh = /* @__PURE__ */ new Map(), this.loadIfEnabled(), void this.previewWebExperiment();
        _Gh.Zh("applying feature flags", t3), t3.forEach(((t4) => {
          var i3;
          if (this.Qh && null != (i3 = this.Qh) && i3.has(t4)) {
            var e3, r3 = this._instance.getFeatureFlag(t4), s3 = null == (e3 = this.Qh) ? void 0 : e3.get(t4);
            r3 && null != s3 && s3.variants[r3] && this.Jh(s3.name, r3, s3.variants[r3].transforms);
          }
        }));
      }
    }
    previewWebExperiment() {
      var t3 = _Gh.getWindowLocation();
      if (null != t3 && t3.search) {
        var i3 = to(null == t3 ? void 0 : t3.search, "__experiment_id"), e3 = to(null == t3 ? void 0 : t3.search, "__experiment_variant");
        i3 && e3 && (_Gh.Zh("previewing web experiments " + i3 + " && " + e3), this.getWebExperiments(((t4) => {
          this.Yh(parseInt(i3), e3, t4);
        }), false, true));
      }
    }
    loadIfEnabled() {
      this.mn.disable_web_experiments || this.getWebExperimentsAndEvaluateDisplayLogic();
    }
    getWebExperiments(t3, i3, e3) {
      if (this.mn.disable_web_experiments && !e3) return t3([]);
      var r3 = this._instance.get_property("$web_experiments");
      if (r3 && !i3) return t3(r3);
      this._instance._send_request({ url: this._instance.requestRouter.endpointFor("api", "/api/web_experiments/?token=" + this.mn.token), method: "GET", timestampMode: "query", callback: (i4) => t3(200 === i4.statusCode && i4.json && i4.json.experiments || []) });
    }
    Yh(t3, i3, e3) {
      var r3 = e3.filter(((i4) => i4.id === t3));
      r3 && r3.length > 0 && (_Gh.Zh("Previewing web experiment [" + r3[0].name + "] with variant [" + i3 + "]"), this.Jh(r3[0].name, i3, r3[0].variants[i3].transforms));
    }
    static Kh(t3, i3) {
      return !X(t3.conditions) && _Gh.Xh(t3, i3) && _Gh.td(t3);
    }
    static Xh(t3, i3) {
      var e3;
      if (X(t3.conditions) || X(null == (e3 = t3.conditions) ? void 0 : e3.url)) return true;
      var r3 = _Gh.getWindowLocation();
      if (r3) {
        var s3, n3, o3, a3 = Js(i3, r3.href);
        return null == (s3 = t3.conditions) || !s3.url || Wh[null !== (n3 = null == (o3 = t3.conditions) ? void 0 : o3.urlMatchType) && void 0 !== n3 ? n3 : "icontains"](t3.conditions.url, a3);
      }
      return false;
    }
    static getWindowLocation() {
      return null == t ? void 0 : t.location;
    }
    static td(t3) {
      var i3;
      if (X(t3.conditions) || X(null == (i3 = t3.conditions) ? void 0 : i3.utm)) return true;
      var e3 = uo();
      if (e3.utm_source) {
        var r3, s3, n3, o3, a3, l3, h3, u3, d3 = null == (r3 = t3.conditions) || null == (r3 = r3.utm) || !r3.utm_campaign || (null == (s3 = t3.conditions) || null == (s3 = s3.utm) ? void 0 : s3.utm_campaign) == e3.utm_campaign, v3 = null == (n3 = t3.conditions) || null == (n3 = n3.utm) || !n3.utm_source || (null == (o3 = t3.conditions) || null == (o3 = o3.utm) ? void 0 : o3.utm_source) == e3.utm_source, c3 = null == (a3 = t3.conditions) || null == (a3 = a3.utm) || !a3.utm_medium || (null == (l3 = t3.conditions) || null == (l3 = l3.utm) ? void 0 : l3.utm_medium) == e3.utm_medium, f3 = null == (h3 = t3.conditions) || null == (h3 = h3.utm) || !h3.utm_term || (null == (u3 = t3.conditions) || null == (u3 = u3.utm) ? void 0 : u3.utm_term) == e3.utm_term;
        return d3 && c3 && f3 && v3;
      }
      return false;
    }
    static Zh(t3) {
      for (var i3 = arguments.length, e3 = new Array(i3 > 1 ? i3 - 1 : 0), r3 = 1; i3 > r3; r3++) e3[r3 - 1] = arguments[r3];
      Ue.info("[WebExperiments] " + t3, e3);
    }
    Jh(t3, i3, e3) {
      this._is_bot() ? _Gh.Zh(Vh) : "control" !== i3 ? e3.forEach(((e4) => {
        if (e4.selector) {
          var r3;
          _Gh.Zh("applying transform of variant " + i3 + " for experiment " + t3 + " ", e4);
          var s3 = null == (r3 = document) ? void 0 : r3.querySelectorAll(e4.selector);
          null == s3 || s3.forEach(((t4) => {
            var i4 = t4;
            e4.html && (i4.innerHTML = e4.html), e4.css && i4.setAttribute("style", e4.css);
          }));
        }
      })) : _Gh.Zh("Control variants leave the page unmodified.");
    }
    _is_bot() {
      return e && this._instance ? el(e, this.mn.custom_blocked_useragents) : void 0;
    }
  };
  var Kh = Be("[Conversations]");
  var Jh = "Conversations not available yet.";
  function Yh(t3, i3) {
    var r3, s3, n3, o3, a3, l3, h3, u3 = null !== (r3 = null == t3 ? void 0 : t3.flushIntervalMs) && void 0 !== r3 ? r3 : 3e3, d3 = null !== (s3 = null == t3 ? void 0 : t3.maxBufferSize) && void 0 !== s3 ? s3 : 100, v3 = null != i3 && i3.consoleCapture ? void 0 : null !== (n3 = null == t3 ? void 0 : t3.maxLogsPerInterval) && void 0 !== n3 ? n3 : 1e3, c3 = K(v3) ? Math.max(d3, 2048) : Math.max(d3, v3), f3 = _({}, (function() {
      var t4 = "", i4 = "";
      try {
        var r4 = null == e ? void 0 : e.userAgent;
        if (r4) {
          var s4 = Si(r4);
          t4 = s4[0], i4 = s4[1];
        }
      } catch (t5) {
      }
      return (function(t5, i5) {
        var e3 = (function(t6) {
          if (t6) return {}.hasOwnProperty.call(Gi, t6) ? Gi[t6] : t6;
        })(t5);
        return _({}, e3 ? { "os.name": e3 } : {}, i5 ? { "os.version": i5 } : {});
      })(t4, i4);
    })(), null == t3 ? void 0 : t3.resourceAttributes);
    return { serviceName: null !== (o3 = null !== (a3 = null == f3 ? void 0 : f3["service.name"]) && void 0 !== a3 ? a3 : null == t3 ? void 0 : t3.serviceName) && void 0 !== o3 ? o3 : null == i3 ? void 0 : i3.serviceNameDefault, serviceVersion: null !== (l3 = null == f3 ? void 0 : f3["service.version"]) && void 0 !== l3 ? l3 : null == t3 ? void 0 : t3.serviceVersion, environment: null !== (h3 = null == f3 ? void 0 : f3["deployment.environment"]) && void 0 !== h3 ? h3 : null == t3 ? void 0 : t3.environment, resourceAttributes: f3, beforeSend: null == t3 ? void 0 : t3.beforeSend, flushIntervalMs: u3, maxBufferSize: d3, maxQueueSize: c3, maxBatchRecordsPerPost: 100, rateCapWindowMs: u3, maxLogsPerInterval: v3, backgroundFlushBudgetMs: 0, terminationFlushBudgetMs: 0 };
  }
  var Qh = ["debug", "log", "warn", "error", "info"];
  var Xh = "console";
  var Zh = "__posthogHandledLogsRequestError";
  var tu = (t3, i3) => {
    var e3 = t3 instanceof Error ? t3 : new Error(i3);
    return e3[Zh] = true, e3;
  };
  var iu = (t3) => !!t3 && "object" == typeof t3 && true === t3[Zh];
  var eu = { featureFlags: class {
    constructor(t3) {
      this.name = "featureFlags", this.ed = false, this.featureFlagEventHandlers = [], this.A = Mh, this.rd = {}, this.nd = {}, this.sd = [], this.ad = false, this.od = false, this.ld = 0, this.ud = false, this.hd = false, this.dd = false, this.vd = false, this.fd = 0, this.Wt = () => {
        var t4 = this.pd();
        this.fd = 0, t4 && this.reloadFeatureFlags();
      }, this.gd = () => {
        var t4, i3 = this.md;
        K(i3) || this.mn.remoteRequestsDisabled || !r || "hidden" === r.visibilityState || Date.now() - (null !== (t4 = this.yd) && void 0 !== t4 ? t4 : 0) < i3 || (this.reloadFeatureFlags(), this.bd());
      }, this.Vt = () => {
        "visible" === (null == r ? void 0 : r.visibilityState) && this.gd();
      }, "get" in t3 ? this.Ls = t3 : (this._instance = t3, this._d = new Ah(t3.config, t3.do()), this.Ls = this._d);
    }
    updateConfig(t3, i3) {
      var e3;
      null == (e3 = this._d) || e3.update(t3, i3), this.Ns && this.wd();
    }
    setup(t3) {
      return this.Ru = t3, this.A = t3.logger.createLogger("[FeatureFlags]"), bh(t3.kv.initialize(), (() => {
        this.Ru === t3 && (this.Ru = void 0, this.Ns = t3, this.kd(t3));
      }));
    }
    kd(i3) {
      var e3;
      if (this.Ns === i3) return t && ms(t, "online", this.Wt), this.wd(), this.Sd = i3.registerDynamicEventProperties((() => this.xd() ? this.rd : this.nd)), this.Cd = null == (e3 = this._instance) || null == (e3 = e3.persistence) ? void 0 : e3.onCrossTabFeatureFlagChange((() => {
        this.Td(), this.Md();
      })), this.Td(), this.initialize();
    }
    wd() {
      var t3 = this.mn.refreshIntervalMs, i3 = !this.mn.remoteRequestsDisabled && r && !K(t3) && t3 > 0 ? t3 : void 0;
      i3 !== this.md && (this.Ed(), K(i3) || (this.md = i3, this.bd(), null != r && r.addEventListener && ms(r, rs, this.Vt)));
    }
    bd() {
      K(this.md) || (K(this.Id) || clearInterval(this.Id), this.yd = Date.now(), this.Id = setInterval(this.gd, this.md));
    }
    Ed() {
      K(this.Id) || (clearInterval(this.Id), this.Id = void 0, null == r || null == r.removeEventListener || r.removeEventListener(rs, this.Vt)), this.md = void 0, this.yd = void 0;
    }
    destroy() {
      this.Rd();
    }
    dispose() {
      this.Rd();
    }
    Rd() {
      var i3, e3;
      this.Ed(), this.ld++, this.hd = false, this.Ru = void 0, this.Ns && (this.Pd(), null == (i3 = this.Sd) || i3.dispose(), this.Sd = void 0, null == (e3 = this.Cd) || e3.call(this), this.Cd = void 0, this.sd = [], null == t || t.removeEventListener("online", this.Wt), this.Ns = void 0);
    }
    get mn() {
      return this.Ls.get();
    }
    Ad(t3) {
      var i3;
      return null == (i3 = this.Ns) ? void 0 : i3.kv.get(t3);
    }
    ni(t3) {
      this.Fd((() => {
        var i3;
        return null == (i3 = this.Ns) ? void 0 : i3.kv.set(t3);
      }));
    }
    Od(t3, i3, e3) {
      var r3;
      if (null != (r3 = this._instance) && r3.persistence && t3[gr]) {
        var s3 = this.Ad(gr) || {}, n3 = t3[gr] || {}, o3 = i3.flags || i3.featureFlags, a3 = i3.flags ? Object.entries(i3.flags).filter(((t4) => {
          var i4 = t4[1];
          return !(null != i4 && i4.failed);
        })).map(((t4) => t4[0])) : [], l3 = !!i3.errorsWhileComputingFlags && !!i3.flags, h3 = l3 ? a3 : e3 && !q(o3) ? Object.keys(o3 || {}) : Array.from(/* @__PURE__ */ new Set([...Object.keys(s3), ...Object.keys(n3)])), u3 = this.Ad(wr) || {}, d3 = t3[wr] || {}, v3 = l3 || e3 ? h3 : Array.from(/* @__PURE__ */ new Set([...Object.keys(u3), ...Object.keys(d3)])), c3 = !l3 && !e3, f3 = !!c3 || h3, p3 = { [mr]: f3, [gr]: f3, [wr]: !!c3 || v3 };
        for (var _3 of (t3[br] && (p3[br] = f3), [Sr, Lr, xr])) K(t3[_3]) || (p3[_3] = true);
        this._instance.persistence.markCrossTabFeatureFlagChanges(p3);
      }
    }
    oi(t3) {
      this.Fd((() => {
        var i3;
        return null == (i3 = this.Ns) ? void 0 : i3.kv.remove(t3);
      }));
    }
    Fd(t3) {
      try {
        t3();
      } catch (t4) {
        this.A.error("Failed to update feature flag persistence", t4);
      }
    }
    Td() {
      var t3 = {};
      for (var i3 of [mr, wr, Sr, Er]) {
        var e3 = this.Ad(i3);
        K(e3) || (t3[i3] = e3);
      }
      this.rd = t3;
      var r3 = _({}, t3), s3 = this.Ad(gr);
      if (s3) for (var n3 of Object.entries(s3)) r3["$feature/" + n3[0]] = n3[1];
      this.nd = r3;
    }
    xd() {
      var t3 = this.mn.cacheTtlMs;
      if (!t3 || 0 >= t3) return false;
      var i3 = this.Ad(Lr);
      return "number" != typeof i3 || Date.now() - i3 > t3;
    }
    Ld() {
      return !!this.xd() && (this.vd || this.od || (this.vd = true, this.A.warn("Feature flag cache is stale, triggering refresh..."), this.reloadFeatureFlags()), true);
    }
    Dd() {
      var t3 = this.mn.evaluationContexts;
      return null != t3 && t3.length ? t3.filter(((t4) => {
        var i3 = t4 && "string" == typeof t4 && t4.trim().length > 0;
        return i3 || this.A.error("Invalid evaluation context found:", t4, "Expected non-empty string"), i3;
      })) : [];
    }
    $d() {
      var t3 = this.mn.flagKeys;
      if (!K(t3)) return t3.filter(((t4) => {
        var i3 = t4 && "string" == typeof t4 && t4.trim().length > 0;
        return i3 || this.A.error("Invalid flag key found:", t4, "Expected non-empty string"), i3;
      }));
    }
    initialize() {
      var t3, i3, e3 = this.mn, r3 = null !== (t3 = null == (i3 = e3.bootstrap) ? void 0 : i3.featureFlags) && void 0 !== t3 ? t3 : {};
      if (Object.keys(r3).length) {
        var s3, n3, o3 = null !== (s3 = null == (n3 = e3.bootstrap) ? void 0 : n3.featureFlagPayloads) && void 0 !== s3 ? s3 : {}, a3 = Object.keys(r3).filter(((t4) => !!r3[t4])).reduce(((t4, i4) => (t4[i4] = r3[i4] || false, t4)), {}), l3 = Object.keys(o3).filter(((t4) => a3[t4])).reduce(((t4, i4) => (t4[i4] = o3[i4], t4)), {});
        return this.Nd({ featureFlags: a3, featureFlagPayloads: l3 });
      }
    }
    updateFlags(t3, i3, e3) {
      var r3, s3, n3 = null != e3 && e3.merge && null !== (r3 = this.Ad(gr)) && void 0 !== r3 ? r3 : {}, o3 = null != e3 && e3.merge && null !== (s3 = this.Ad(wr)) && void 0 !== s3 ? s3 : {}, a3 = _({}, n3, t3), l3 = _({}, o3, i3), h3 = {};
      for (var u3 of Object.entries(a3)) {
        var d3 = u3[0], v3 = u3[1];
        h3[d3] = { key: d3, enabled: y(v3), variant: b(v3), reason: void 0, metadata: K(null == l3 ? void 0 : l3[d3]) ? void 0 : { id: 0, version: void 0, description: void 0, payload: l3[d3] } };
      }
      this.Nd({ flags: h3 });
    }
    get hasLoadedFlags() {
      return this.ad;
    }
    getFlags() {
      return Object.keys(this.getFlagVariants());
    }
    getFlagsWithDetails() {
      var t3 = this.Ad(br), i3 = this.Ad(Er), e3 = this.Ad(kr);
      if (!e3 && !i3) return t3 || {};
      var r3 = ds({}, t3 || {}), s3 = [.../* @__PURE__ */ new Set([...Object.keys(e3 || {}), ...Object.keys(i3 || {})])];
      for (var n3 of s3) {
        var o3, a3, l3 = r3[n3], h3 = null == i3 ? void 0 : i3[n3], u3 = K(h3) ? null !== (o3 = null == l3 ? void 0 : l3.enabled) && void 0 !== o3 && o3 : !!h3, d3 = K(h3) ? null == l3 ? void 0 : l3.variant : "string" == typeof h3 ? h3 : void 0, v3 = null == e3 ? void 0 : e3[n3], c3 = _({}, l3, { enabled: u3, variant: u3 ? null != d3 ? d3 : null == l3 ? void 0 : l3.variant : void 0 });
        u3 !== (null == l3 ? void 0 : l3.enabled) && (c3.original_enabled = null == l3 ? void 0 : l3.enabled), d3 !== (null == l3 ? void 0 : l3.variant) && (c3.original_variant = null == l3 ? void 0 : l3.variant), v3 && (c3.metadata = _({}, null == l3 ? void 0 : l3.metadata, { payload: v3, original_payload: null == l3 || null == (a3 = l3.metadata) ? void 0 : a3.payload })), r3[n3] = c3;
      }
      return this.ed || (this.A.warn(" Overriding feature flag details!", { flagDetails: t3, overriddenPayloads: e3, finalDetails: r3 }), this.ed = true), r3;
    }
    getAllFeatureFlags() {
      var t3 = this.getFlagVariants(), i3 = this.getFlagPayloads();
      return Object.keys(t3).map(((e3) => {
        var r3 = t3[e3];
        return { key: e3, enabled: y(r3), variant: b(r3), payload: m(i3[e3]) };
      }));
    }
    getFlagVariants() {
      var t3 = this.Ad(gr), i3 = this.Ad(Er);
      if (!i3) return t3 || {};
      for (var e3 = ds({}, t3 || {}), r3 = Object.keys(i3), s3 = 0; r3.length > s3; s3++) e3[r3[s3]] = i3[r3[s3]];
      return this.ed || (this.A.warn(" Overriding feature flags!", { enabledFlags: t3, overriddenFlags: i3, finalFlags: e3 }), this.ed = true), e3;
    }
    getFlagPayloads() {
      var t3 = this.Ad(wr), i3 = this.Ad(kr);
      if (!i3) return t3 || {};
      for (var e3 = ds({}, t3 || {}), r3 = Object.keys(i3), s3 = 0; r3.length > s3; s3++) e3[r3[s3]] = i3[r3[s3]];
      return this.ed || (this.A.warn(" Overriding feature flag payloads!", { flagPayloads: t3, overriddenPayloads: i3, finalPayloads: e3 }), this.ed = true), e3;
    }
    reloadFeatureFlags() {
      this.ud || this.mn.featureFlagsDisabled || this.pd() || this.qd || (this.sd.slice().forEach(((t3) => {
        try {
          t3();
        } catch (t4) {
          this.A.error("Error while running feature flags reloading callback", t4);
        }
      })), this.qd = setTimeout((() => {
        this.jd();
      }), 5));
    }
    Pd() {
      clearTimeout(this.qd), this.qd = void 0;
    }
    onReloading(t3) {
      return this.sd.push(t3), () => {
        this.sd = this.sd.filter(((i3) => i3 !== t3));
      };
    }
    ensureFlagsLoaded() {
      this.ad || this.od || this.qd || this.reloadFeatureFlags();
    }
    setAnonymousDistinctId(t3) {
      this.$anon_distinct_id = t3;
    }
    setReloadingPaused(t3) {
      this.ud = t3;
    }
    resetFlagCallReported() {
      this.oi(Mr);
    }
    jd(t3) {
      this.Pd();
      var i3 = this.Ns;
      if (i3 && !this.mn.remoteRequestsDisabled && !this.pd()) if (this.od) this.hd = true;
      else {
        var e3 = { token: i3.projectToken, distinct_id: i3.distinctId, groups: i3.groups, $anon_distinct_id: this.$anon_distinct_id, person_properties: _({}, i3.initialPersonProperties, this.Ad(Tr) || {}, { $lib: i3.library.name, $lib_version: i3.library.version }), group_properties: this.Ad($r), timezone: yo() };
        K(i3.deviceId) || (e3.$device_id = i3.deviceId), (null != t3 && t3.disableFlags || this.mn.featureFlagsDisabled) && (e3.disable_flags = true);
        var r3 = this.Dd();
        r3.length && (e3.evaluation_contexts = r3);
        var s3 = this.$d();
        K(s3) || (e3.flag_keys = s3);
        var n3 = this.mn.onlyEvaluateSurveyFeatureFlags, o3 = "/flags/?v=2" + (n3 ? "&only_evaluate_survey_feature_flags=true" : ""), a3 = this.ld;
        this.od = true;
        var l3 = () => {
          this.hd && (this.hd = false, this.jd());
        }, h3 = (t4) => {
          this.od = false, a3 === this.ld ? (this.ni({ [Nr]: [Lh] }), this.A.error("Feature flag request failed", t4), l3()) : l3();
        };
        try {
          i3.sendRequest(o3, { target: "flags", method: "POST", body: e3, compression: this.mn.compression, sentAt: "body", timeoutMs: this.mn.requestTimeoutMs }).then(((t4) => {
            var i4, r4, s4 = null !== (i4 = t4.json) && void 0 !== i4 ? i4 : {}, o4 = 200 !== t4.statusCode;
            if (this.od = false, a3 === this.ld) {
              if (this.Bd(t4.statusCode), o4 || this.hd || (this.$anon_distinct_id = void 0), !e3.disable_flags || this.hd) {
                this.dd = !o4;
                var h4 = [];
                t4.error ? h4.push(t4.error instanceof Error && "AbortError" === t4.error.name ? "timeout" : t4.error instanceof Error ? Lh : "unknown_error") : 200 !== t4.statusCode && h4.push("api_error_" + t4.statusCode), s4.errorsWhileComputingFlags && h4.push("errors_while_computing_flags");
                var u3 = !(null == (r4 = s4.quotaLimited) || !r4.includes("feature_flags"));
                u3 && h4.push("quota_limited"), this.ni({ [Nr]: h4 }), u3 ? this.A.warn("You have hit your feature flags quota limit, and will not be able to load feature flags until the quota is reset.  Please visit https://posthog.com/docs/billing/limits-alerts to learn more.") : e3.disable_flags || this.Nd(s4, o4, { partialResponse: n3 }), l3();
              }
            } else l3();
          })).catch(h3);
        } catch (t4) {
          h3(t4);
        }
      }
    }
    pd() {
      return ro(this.fd, 3);
    }
    Bd(t3) {
      this.fd = so(t3, this.fd, 3, (() => this.A.warn("Feature flag requests are failing before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped refreshing feature flags; will try again when connectivity changes.")));
    }
    getFeatureFlag(t3, i3) {
      var e3;
      if (void 0 === i3 && (i3 = {}), !i3.fresh || this.dd) if (this.ad || this.getFlags() && this.getFlags().length > 0) {
        if (!this.Ld()) {
          var r3 = this.getFeatureFlagResult(t3, i3);
          return null !== (e3 = null == r3 ? void 0 : r3.variant) && void 0 !== e3 ? e3 : null == r3 ? void 0 : r3.enabled;
        }
      } else this.A.warn('getFeatureFlag for key "' + t3 + Nh);
    }
    getFeatureFlagDetails(t3) {
      return this.getFlagsWithDetails()[t3];
    }
    getFeatureFlagPayload(t3) {
      var i3 = this.getFeatureFlagResult(t3, { send_event: false });
      return null == i3 ? void 0 : i3.payload;
    }
    getFeatureFlagResult(t3, i3) {
      if (void 0 === i3 && (i3 = {}), !i3.fresh || this.dd) if (this.ad || this.getFlags() && this.getFlags().length > 0) {
        if (!this.Ld()) {
          var e3, r3 = this.getFlagVariants(), s3 = t3 in r3, n3 = r3[t3], o3 = this.getFlagPayloads()[t3], a3 = String(n3), l3 = this.Ad(Sr) || void 0, h3 = this.Ad(Lr) || void 0, u3 = this.Ad(Mr) || {};
          if (this.mn.deduplicateCallsPerSession) {
            var d3, v3 = null == (d3 = this.Ns) ? void 0 : d3.session.sessionId, c3 = this.Ad(Dr);
            v3 && v3 !== c3 && (u3 = {}, e3 = v3);
          }
          if (i3.send_event || !("send_event" in i3)) if (t3 in u3 && u3[t3].includes(a3)) e3 && this.ni({ [Mr]: u3, [Dr]: e3 });
          else {
            var f3, p3, g3, y3, b3, w3, S3, x3, E3, k3, T3, P3;
            q(u3[t3]) ? u3[t3].push(a3) : u3[t3] = [a3], this.ni(_({ [Mr]: u3 }, e3 ? { [Dr]: e3 } : {}));
            var R3 = this.getFeatureFlagDetails(t3), C3 = [...null !== (f3 = this.Ad(Nr)) && void 0 !== f3 ? f3 : []];
            K(n3) && C3.push("flag_missing");
            var O3 = { $feature_flag: t3, $feature_flag_response: n3, $feature_flag_payload: null != o3 ? o3 : null, $feature_flag_request_id: l3, $feature_flag_evaluated_at: h3, $feature_flag_bootstrapped_response: null !== (p3 = null == (g3 = this.mn.bootstrap) || null == (g3 = g3.featureFlags) ? void 0 : g3[t3]) && void 0 !== p3 ? p3 : null, $feature_flag_bootstrapped_payload: null !== (y3 = null == (b3 = this.mn.bootstrap) || null == (b3 = b3.featureFlagPayloads) ? void 0 : b3[t3]) && void 0 !== y3 ? y3 : null, $used_bootstrap_value: !this.dd };
            K(null == R3 || null == (w3 = R3.metadata) ? void 0 : w3.has_experiment) || (O3.$feature_flag_has_experiment = R3.metadata.has_experiment), K(null == R3 || null == (S3 = R3.metadata) ? void 0 : S3.version) || (O3.$feature_flag_version = R3.metadata.version);
            var I3, F3 = null !== (x3 = null == R3 || null == (E3 = R3.reason) ? void 0 : E3.description) && void 0 !== x3 ? x3 : null == R3 || null == (k3 = R3.reason) ? void 0 : k3.code;
            F3 && (O3.$feature_flag_reason = F3), null != R3 && null != (T3 = R3.metadata) && T3.id && (O3.$feature_flag_id = R3.metadata.id), K(null == R3 ? void 0 : R3.original_variant) && K(null == R3 ? void 0 : R3.original_enabled) || (O3.$feature_flag_original_response = K(R3.original_variant) ? R3.original_enabled : R3.original_variant), null != R3 && null != (P3 = R3.metadata) && P3.original_payload && (O3.$feature_flag_original_payload = null == R3 || null == (I3 = R3.metadata) ? void 0 : I3.original_payload), C3.length && (O3.$feature_flag_error = C3.join(",")), this.Hd(O3);
          }
          else e3 && this.ni({ [Mr]: u3, [Dr]: e3 });
          if (s3) return { key: t3, enabled: !!n3, variant: "string" == typeof n3 ? n3 : void 0, payload: m(o3) };
        }
      } else this.A.warn('getFeatureFlagResult for key "' + t3 + Nh);
    }
    Hd(t3) {
      try {
        var i3;
        null == (i3 = this.Ns) || i3.capture("$feature_flag_called", t3).catch(((t4) => {
          this.A.error("Failed to capture feature flag call", t4);
        }));
      } catch (t4) {
        this.A.error("Failed to capture feature flag call", t4);
      }
    }
    getRemoteConfigPayload(t3, i3) {
      this.zd(t3, i3);
    }
    zd(t3, i3) {
      var e3 = this;
      return p((function* () {
        var r3 = e3.Ns;
        if (r3) {
          var s3 = { distinct_id: r3.distinctId, token: r3.projectToken, person_properties: { $lib: r3.library.name, $lib_version: r3.library.version } }, n3 = e3.Dd();
          n3.length && (s3.evaluation_contexts = n3);
          var o3, a3 = e3.$d();
          K(a3) || (s3.flag_keys = a3);
          try {
            var l3, h3 = null == (l3 = (yield r3.sendRequest("/flags/?v=2", { target: "flags", method: "POST", body: s3, compression: e3.mn.compression, sentAt: "body", timeoutMs: e3.mn.requestTimeoutMs })).json) ? void 0 : l3.featureFlagPayloads;
            o3 = (null == h3 ? void 0 : h3[t3]) || void 0;
          } catch (t4) {
            return void e3.A.error("Remote config feature flag request failed", t4);
          }
          try {
            i3(o3);
          } catch (t4) {
            e3.A.error("Remote config feature flag callback failed", t4);
          }
        }
      }))();
    }
    isFeatureEnabled(t3, i3) {
      if (void 0 === i3 && (i3 = {}), i3.fresh && !this.dd) return i3.defaultValue;
      if (!(this.ad || this.getFlags() && this.getFlags().length > 0)) return this.A.warn('isFeatureEnabled for key "' + t3 + Nh), i3.defaultValue;
      var e3 = this.getFeatureFlag(t3, i3);
      return K(e3) ? i3.defaultValue : !!e3;
    }
    addFeatureFlagsHandler(t3) {
      this.featureFlagEventHandlers.push(t3);
    }
    removeFeatureFlagsHandler(t3) {
      this.featureFlagEventHandlers = this.featureFlagEventHandlers.filter(((i3) => i3 !== t3));
    }
    receivedFeatureFlags(t3, i3, e3) {
      this.Nd(t3, i3, e3);
    }
    Nd(t3, i3, e3) {
      if (this.Ns) {
        this.ad = true;
        var r3 = (function(t4, i4, e4, r4, s3, n3) {
          void 0 === i4 && (i4 = {}), void 0 === e4 && (e4 = {}), void 0 === r4 && (r4 = {}), void 0 === n3 && (n3 = Mh);
          var o3 = ((t5, i5) => {
            var e5 = t5.flags;
            return e5 ? _({}, t5, { featureFlags: Object.fromEntries(Object.keys(e5).map(((t6) => {
              var i6;
              return [t6, null !== (i6 = e5[t6].variant) && void 0 !== i6 ? i6 : e5[t6].enabled];
            }))), featureFlagPayloads: Object.fromEntries(Object.keys(e5).filter(((t6) => e5[t6].enabled)).filter(((t6) => {
              var i6;
              return !K(null == (i6 = e5[t6].metadata) ? void 0 : i6.payload);
            })).map(((t6) => {
              var i6;
              return [t6, null == (i6 = e5[t6].metadata) ? void 0 : i6.payload];
            }))) }) : (t5.featureFlags && i5.warn("Using an older version of the feature flags endpoint. Please upgrade your PostHog server to the latest version"), t5);
          })(t4, n3), a3 = o3.flags, l3 = o3.featureFlags, h3 = o3.featureFlagPayloads;
          if (l3) {
            var u3 = t4.requestId, d3 = t4.evaluatedAt;
            if (q(l3)) {
              n3.warn("v1 of the feature flags endpoint is deprecated. Please use the latest version.");
              var v3 = {};
              if (l3) for (var c3 = 0; l3.length > c3; c3++) v3[l3[c3]] = true;
              return { [mr]: l3, [gr]: v3, [xr]: false };
            }
            var f3 = l3, p3 = h3, g3 = a3;
            if (null != s3 && s3.partialResponse) {
              var m3 = Object.keys(f3), y3 = p3 || {};
              f3 = _({}, i4, f3), p3 = _({}, e4, y3), m3.forEach(((t5) => {
                var i5;
                t5 in y3 || null == (i5 = p3) || delete i5[t5];
              })), g3 = _({}, r4, g3);
            } else if (t4.errorsWhileComputingFlags) if (a3) {
              var b3 = new Set(Object.keys(a3).filter(((t5) => {
                var i5;
                return !(null != (i5 = a3[t5]) && i5.failed);
              })));
              f3 = _({}, i4, Object.fromEntries(Object.entries(f3).filter(((t5) => b3.has(t5[0])))));
              var w3 = Object.fromEntries(Object.entries(p3 || {}).filter(((t5) => b3.has(t5[0]))));
              p3 = _({}, e4, w3), b3.forEach(((t5) => {
                var i5;
                t5 in w3 || null == (i5 = p3) || delete i5[t5];
              })), g3 = _({}, r4, Object.fromEntries(Object.entries(g3 || {}).filter(((t5) => b3.has(t5[0])))));
            } else f3 = _({}, i4, f3), p3 = _({}, e4, p3), g3 = _({}, r4, g3);
            return _({ [mr]: Object.keys(Uh(f3)), [gr]: f3 || {}, [wr]: p3 || {}, [br]: g3 || {}, [xr]: true === t4.minimalFlagCalledEvents }, u3 ? { [Sr]: u3 } : {}, d3 ? { [Lr]: d3 } : {});
          }
        })(t3, this.getFlagVariants(), this.getFlagPayloads(), this.getFlagsWithDetails(), e3, this.A);
        r3 && (this.Od(r3, t3, !(null == e3 || !e3.partialResponse)), this.ni(r3)), i3 || (this.vd = false), this.Md(i3);
      }
    }
    override(t3, i3) {
      void 0 === i3 && (i3 = false), this.A.warn("override is deprecated. Please use overrideFeatureFlags instead."), this.overrideFeatureFlags({ flags: t3, suppressWarning: i3 });
    }
    overrideFeatureFlags(t3) {
      this.Ud(t3);
    }
    Ud(t3) {
      if (this.Ns) {
        if (false === t3) return this.oi([Er, kr]), this.Md(), void Dh.info("All overrides cleared");
        if (q(t3)) return this.ni({ [Er]: jh(t3) }), this.Md(), void Dh.info("Flag overrides set", { flags: t3 });
        if (t3 && "object" == typeof t3 && ("flags" in t3 || "payloads" in t3)) {
          var i3, e3 = t3;
          this.ed = Boolean(null !== (i3 = e3.suppressWarning) && void 0 !== i3 && i3);
          var r3 = {}, s3 = e3.flags, n3 = e3.payloads;
          return s3 && (r3[Er] = q(s3) ? jh(s3) : s3), n3 && (r3[kr] = n3), Object.keys(r3).length && this.ni(r3), false === s3 && false === n3 ? this.oi([Er, kr]) : false === s3 ? this.oi(Er) : false === n3 && this.oi(kr), this.Md(), false === s3 ? Dh.info("Flag overrides cleared") : s3 && Dh.info("Flag overrides set", { flags: s3 }), void (false === n3 ? Dh.info("Payload overrides cleared") : n3 && Dh.info("Payload overrides set", { payloads: n3 }));
        }
        if (t3 && "object" == typeof t3) return this.ni({ [Er]: t3 }), this.Md(), void Dh.info("Flag overrides set", { flags: t3 });
        this.A.warn("Invalid overrideOptions provided to overrideFeatureFlags", { overrideOptions: t3 });
      } else this.A.warn("posthog.featureFlags.overrideFeatureFlags called before feature flags were ready");
    }
    onFeatureFlags(t3) {
      if (this.addFeatureFlagsHandler(t3), this.ad) {
        var i3 = this.Wd(), e3 = i3.flags, r3 = i3.flagVariants;
        try {
          t3(e3, r3);
        } catch (t4) {
          this.A.error("Error while running feature flags callback", t4);
        }
      }
      return () => this.removeFeatureFlagsHandler(t3);
    }
    updateEarlyAccessFeatureEnrollment(t3, i3, e3) {
      var r3, s3 = (this.Ad(yr) || []).find(((i4) => i4.flagKey === t3)), n3 = { ["$feature_enrollment/" + t3]: i3 }, o3 = { $feature_flag: t3, $feature_enrollment: i3, $set: n3 };
      s3 && (o3.$early_access_feature_name = s3.name), e3 && (o3.$feature_enrollment_stage = e3);
      var a3 = _({}, this.getFlagVariants(), { [t3]: i3 });
      null == (r3 = this._instance) || null == (r3 = r3.persistence) || r3.markCrossTabFeatureFlagChanges({ [mr]: [t3], [gr]: [t3], [Tr]: Object.keys(n3) }), this.ni({ [mr]: Object.keys(Uh(a3)), [gr]: a3, [Tr]: _({}, this.Ad(Tr) || {}, n3) }), this.Md();
      try {
        var l3;
        null == (l3 = this.Ns) || l3.capture("$feature_enrollment_update", o3).catch(((t4) => {
          this.A.error("Failed to capture early access feature enrollment", t4);
        }));
      } catch (t4) {
        this.A.error("Failed to capture early access feature enrollment", t4);
      }
    }
    getEarlyAccessFeatures(t3, i3, e3) {
      void 0 === i3 && (i3 = false);
      var r3 = this.Ad(yr);
      !r3 || i3 ? this.Vd(t3, e3) : t3(r3);
    }
    Vd(t3, i3) {
      var e3 = this;
      return p((function* () {
        var r3 = e3.Ns;
        if (r3) {
          var s3, n3 = i3 ? "&" + i3.map(((t4) => "stage=" + t4)).join("&") : "";
          try {
            var o3 = yield r3.sendRequest("/api/early_access_features/?token=" + r3.projectToken + n3, { target: "api", method: "GET", sentAt: "query" });
            if (!o3.json) return;
            e3.ni({ [yr]: s3 = o3.json.earlyAccessFeatures });
          } catch (t4) {
            return void e3.A.error("Early access feature request failed", t4);
          }
          try {
            t3(s3);
          } catch (t4) {
            e3.A.error("Early access feature callback failed", t4);
          }
        }
      }))();
    }
    Wd() {
      var t3 = this.getFlags(), i3 = this.getFlagVariants();
      return { flags: t3.filter(((t4) => i3[t4])), flagVariants: Object.keys(i3).filter(((t4) => i3[t4])).reduce(((t4, e3) => (t4[e3] = i3[e3], t4)), {}) };
    }
    Md(t3) {
      this.Td();
      var i3 = this.Wd(), e3 = i3.flags, r3 = i3.flagVariants;
      this.featureFlagEventHandlers.forEach(((i4) => {
        try {
          i4(e3, r3, { errorsLoading: t3 });
        } catch (t4) {
          this.A.error("Error while running feature flags callback", t4);
        }
      }));
    }
    setPersonPropertiesForFlags(t3, i3) {
      void 0 === i3 && (i3 = true), this.Gd(t3, i3);
    }
    Gd(t3, i3) {
      void 0 === i3 && (i3 = true);
      var e3 = this.Ad(Tr) || {}, r3 = (null == t3 ? void 0 : t3.$set) || (null != t3 && t3.$set_once ? {} : t3), s3 = null == t3 ? void 0 : t3.$set_once, n3 = {};
      if (s3) for (var o3 in s3) ({}).hasOwnProperty.call(s3, o3) && (o3 in e3 || (n3[o3] = s3[o3]));
      this.ni({ [Tr]: _({}, e3, n3, r3) }), i3 && this.reloadFeatureFlags();
    }
    unsetPersonPropertiesForFlags(t3, i3) {
      void 0 === i3 && (i3 = true);
      var e3 = _({}, this.Ad(Tr) || {});
      t3.forEach(((t4) => {
        delete e3[t4];
      })), this.ni({ [Tr]: e3 }), i3 && this.reloadFeatureFlags();
    }
    resetPersonPropertiesForFlags(t3) {
      void 0 === t3 && (t3 = true), this.oi(Tr), t3 && this.reloadFeatureFlags();
    }
    setGroupPropertiesForFlags(t3, i3) {
      void 0 === i3 && (i3 = true);
      var e3 = this.Ad($r) || {}, r3 = _({}, e3);
      for (var s3 of Object.keys(t3)) r3[s3] = _({}, e3[s3], t3[s3]);
      this.ni({ [$r]: r3 }), i3 && this.reloadFeatureFlags();
    }
    resetGroupPropertiesForFlags(t3) {
      if (t3) {
        var i3 = this.Ad($r) || {};
        this.ni({ [$r]: _({}, i3, { [t3]: {} }) });
      } else this.oi($r);
    }
    reset() {
      this.ld++, this.hd = false, this.rd = {}, this.nd = {}, this.ad = false, this.ud = false, this.dd = false, this.$anon_distinct_id = void 0, this.Pd(), this.ed = false, this.fd = 0;
    }
  } };
  var ru = { sessionRecording: class {
    get mn() {
      return this._instance.config;
    }
    get No() {
      return this._instance.persistence;
    }
    get started() {
      var t3;
      return !(null == (t3 = this.Zd) || !t3.isStarted);
    }
    get status() {
      var t3, i3;
      return this.Qd === hh || this.Qd === uh ? this.Qd : null !== (t3 = null == (i3 = this.Zd) ? void 0 : i3.status) && void 0 !== t3 ? t3 : this.Qd;
    }
    constructor(i3) {
      if (this._forceAllowLocalhostNetworkCapture = false, this.Qd = ah, this.Jd = void 0, this.Kd = false, this.jt = (() => {
        var i4;
        if (null == r || !r.visibilityState || "visible" === r.visibilityState) return true;
        var e3 = null == t || null == (i4 = t.performance) || null == i4.getEntriesByType ? void 0 : i4.getEntriesByType("visibility-state");
        return !(null != e3 && e3.length) || e3.some(((t3) => "visible" === t3.name));
      })(), this.Vt = () => {
        var t3;
        "visible" === (null == r ? void 0 : r.visibilityState) && (this.jt = true, null == (t3 = this.Zd) || null == t3.setDocumentWasEverVisible || t3.setDocumentWasEverVisible(true));
      }, this._instance = i3, !this._instance.sessionManager) throw vh.error("started without valid sessionManager"), new Error(dh + " started without valid sessionManager. This is a bug.");
      if (this.mn.cookieless_mode === Zr) throw new Error(dh + ' cannot be used with cookieless_mode="always"');
      null != r && r.addEventListener && ms(r, "visibilitychange", this.Vt);
    }
    initialize() {
      this.startIfEnabledOrStop();
    }
    dispose(t3) {
      var i3 = (void 0 === t3 ? {} : t3).discardBufferedEvents, e3 = void 0 !== i3 && i3;
      this.Kd = true, null == r || null == r.removeEventListener || r.removeEventListener("visibilitychange", this.Vt), e3 ? this.Yd(true) : this.stopRecording();
    }
    get Xd() {
      var i3, e3 = !(null == (i3 = this._instance.get_property(hr)) || !i3.enabled), r3 = !this.mn.disable_session_recording, s3 = this.mn.disable_session_recording || this._instance.consent.isOptedOut();
      return t && e3 && r3 && !s3;
    }
    startIfEnabledOrStop(t3) {
      var i3;
      if (!(this.Kd || this.Xd && null != (i3 = this.Zd) && i3.isStarted)) {
        var e3 = !K(Object.assign) && !K(Array.from);
        this.Xd && e3 ? (this.tv(t3), vh.info("starting")) : (this.Qd = ah, this.stopRecording());
      }
    }
    tv(t3) {
      var i3, e3;
      if (this.Xd) if (this.Qd !== hh && this.Qd !== uh && (this.Qd = lh), null != v && null != (i3 = v.__PosthogExtensions__) && null != (i3 = i3.rrweb) && i3.record && null != (e3 = v.__PosthogExtensions__) && e3.initSessionRecording) this.ev(t3);
      else {
        var r3, s3 = this._instance.sessionManager;
        null == (r3 = v.__PosthogExtensions__) || null == r3.loadExternalDependency || r3.loadExternalDependency(this._instance, this.iv, ((i4) => {
          if (!this.Kd && this.Xd && this._instance.sessionManager === s3) return i4 ? (this._instance.register_for_session({ [Yr]: true }), vh.error("could not load recorder", i4)) : void this.ev(t3);
          this.Qd = ah;
        }));
      }
    }
    stopRecording() {
      var t3, i3;
      null == (t3 = this.Jd) || t3.call(this), this.Jd = void 0, null == (i3 = this.Zd) || i3.stop();
    }
    Yd(t3) {
      var i3, e3;
      void 0 === t3 && (t3 = false), null == (i3 = this.Jd) || i3.call(this), this.Jd = void 0, null == (e3 = this.Zd) || e3.discard({ discardProducerEvents: t3 });
    }
    rv() {
      var t3, i3;
      null == (t3 = this.No) || t3.unregister(_r), null == (i3 = this.No) || i3.unregister(ur);
    }
    nv(t3, i3) {
      if (X(t3)) return null;
      var e3, r3 = Z(t3) ? t3 : parseFloat(t3);
      return "number" != typeof (e3 = r3) || !Number.isFinite(e3) || 0 > e3 || e3 > 1 ? (vh.warn(i3 + " must be between 0 and 1. Ignoring invalid value:", t3), null) : r3;
    }
    sv(t3) {
      if (this.No) {
        var i3, e3, r3 = this.No, s3 = () => {
          var i4, e4 = false === t3.sessionRecording ? void 0 : t3.sessionRecording, s4 = this.nv(null == (i4 = this.mn.session_recording) ? void 0 : i4.sampleRate, "session_recording.sampleRate"), n3 = this.nv(null == e4 ? void 0 : e4.sampleRate, "remote config sampleRate"), o3 = null != s4 ? s4 : n3;
          X(o3) && this.rv();
          var a3 = null == e4 ? void 0 : e4.minimumDurationMilliseconds;
          r3.register({ [hr]: _({ cache_timestamp: Date.now(), enabled: !!e4 }, e4, { networkPayloadCapture: _({ capturePerformance: t3.capturePerformance }, null == e4 ? void 0 : e4.networkPayloadCapture), canvasRecording: { enabled: null == e4 ? void 0 : e4.recordCanvas, fps: null == e4 ? void 0 : e4.canvasFps, quality: null == e4 ? void 0 : e4.canvasQuality }, sampleRate: o3, minimumDurationMilliseconds: K(a3) ? null : a3, endpoint: null == e4 ? void 0 : e4.endpoint, triggerMatchType: null == e4 ? void 0 : e4.triggerMatchType, masking: null == e4 ? void 0 : e4.masking, urlTriggers: null == e4 ? void 0 : e4.urlTriggers, version: null == e4 ? void 0 : e4.version, triggerGroups: null == e4 ? void 0 : e4.triggerGroups }) });
        };
        s3(), null == (i3 = this.Jd) || i3.call(this), this.Jd = null == (e3 = this._instance.sessionManager) ? void 0 : e3.onSessionId(s3);
      }
    }
    onRemoteConfig(t3) {
      var i3 = t3.ok ? t3.config : void 0;
      return i3 && "sessionRecording" in i3 ? false === i3.sessionRecording ? (this.sv(i3), void this.Yd()) : (this.sv(i3), void this.startIfEnabledOrStop()) : (this.Qd === hh && (this.Qd = uh, vh.warn("config refresh failed, recording will not start until page reload")), void this.startIfEnabledOrStop());
    }
    log(t3, i3) {
      var e3;
      void 0 === i3 && (i3 = "log"), null != (e3 = this.Zd) && e3.log ? this.Zd.log(t3, i3) : vh.warn("log called before recorder was ready");
    }
    get iv() {
      var t3, i3, e3 = null == (t3 = this._instance) || null == (t3 = t3.persistence) ? void 0 : t3.get_property(hr);
      return (null == e3 || null == (i3 = e3.scriptConfig) ? void 0 : i3.script) || "lazy-recorder";
    }
    av() {
      var t3, i3 = this._instance.get_property(hr);
      if (!i3) return false;
      try {
        t3 = "object" == typeof i3 ? i3 : JSON.parse(i3);
      } catch (t4) {
        return vh.warn("persisted remote config for session recording is invalid and will be ignored", t4), false;
      }
      return !X(t3.cache_timestamp) && 36e5 >= Date.now() - t3.cache_timestamp;
    }
    ev(t3) {
      var i3, e3, r3;
      if (!this.Kd && this.Xd && this._instance.sessionManager) {
        if (null == (i3 = v.__PosthogExtensions__) || !i3.initSessionRecording) return vh.warn("Called on script loaded before session recording is available. This can be caused by adblockers."), void this._instance.register_for_session({ [Yr]: true });
        var s3;
        if (this.Zd || (this.Zd = null == (s3 = v.__PosthogExtensions__) ? void 0 : s3.initSessionRecording(this._instance, this.jt), this.Zd._forceAllowLocalhostNetworkCapture = this._forceAllowLocalhostNetworkCapture), !this.av()) {
          if (this.Qd === uh || this.Qd === hh) return;
          return this.Qd = hh, vh.info("persisted remote config is stale, requesting fresh config before starting"), void new Yo(this._instance).load();
        }
        this.Qd = lh, null == (e3 = (r3 = this.Zd).setDocumentWasEverVisible) || e3.call(r3, this.jt), this.Zd.start(t3);
      } else this.Qd = ah;
    }
    onRRwebEmit(t3) {
      var i3;
      null == (i3 = this.Zd) || null == i3.onRRwebEmit || i3.onRRwebEmit(t3);
    }
    overrideLinkedFlag() {
      var t3, i3;
      this.Zd || null == (i3 = this.No) || i3.register({ [vr]: true }), null == (t3 = this.Zd) || t3.overrideLinkedFlag();
    }
    overrideSampling() {
      var t3, i3;
      this.Zd || null == (i3 = this.No) || i3.register({ [dr]: true }), null == (t3 = this.Zd) || t3.overrideSampling();
    }
    overrideTrigger(t3) {
      var i3, e3;
      this.Zd || null == (e3 = this.No) || e3.register({ ["url" === t3 ? cr : fr]: true }), null == (i3 = this.Zd) || i3.overrideTrigger(t3);
    }
    get sdkDebugProperties() {
      var t3;
      return (null == (t3 = this.Zd) ? void 0 : t3.sdkDebugProperties) || { $recording_status: this.status };
    }
    tryAddCustomEvent(t3, i3) {
      var e3;
      return !(null == (e3 = this.Zd) || !e3.tryAddCustomEvent(t3, i3));
    }
  } };
  var su = { autocapture: class extends Jl {
    constructor(t3) {
      super(new Yl(t3)), this.instance = t3;
    }
  }, historyAutocapture: class {
    constructor(t3) {
      this._instance = t3, this.ov = this.lv();
    }
    initialize() {
      this.startIfEnabled();
    }
    get isEnabled() {
      var t3 = this.uv();
      return !!(t3.path || t3.search || this.hv(t3));
    }
    startIfEnabled() {
      this.isEnabled && (Ue.info("History API monitoring enabled, starting..."), this.monitorHistoryChanges());
    }
    startIfEnabledOrStop() {
      this.stop(), this.ov = this.lv(), this.startIfEnabled();
    }
    stop() {
      this.dv && this.dv(), this.dv = void 0, this.vv && this.vv(), this.vv = void 0, Ue.info("History API monitoring stopped");
    }
    monitorHistoryChanges() {
      t && t.history && (this.fv("pushState"), this.fv("replaceState"), this.pv(), this.hv() && this.gv());
    }
    fv(i3) {
      var e3;
      if (t && (null == (e3 = t.history[i3]) || !e3.__posthog_wrapped__)) {
        var r3 = this;
        th(t.history, i3, ((t3) => function(e4, s3, n3) {
          t3.call(this, e4, s3, n3), r3.mv(i3);
        }));
      }
    }
    lv() {
      var i3 = null == t ? void 0 : t.location;
      if (null != i3 && i3.pathname) return { pathname: i3.pathname, search: i3.search, hash: i3.hash };
    }
    uv() {
      var t3 = this._instance.config.capture_pageview;
      return "history_change" === t3 ? { path: true } : W(t3) ? t3 : {};
    }
    hv(t3) {
      return void 0 === t3 && (t3 = this.uv()), !!t3.hash && !this._instance.config.disable_capture_url_hashes;
    }
    yv(t3) {
      var i3 = this.uv(), e3 = this.ov;
      return !(!e3 || !(i3.path && t3.pathname !== e3.pathname || i3.search && t3.search !== e3.search || this.hv(i3) && t3.hash !== e3.hash));
    }
    mv(t3) {
      try {
        var i3 = this.lv();
        if (!i3) return;
        this.yv(i3) && this._instance.capture(ns, { navigation_type: t3 }), this.ov = i3;
      } catch (i4) {
        Ue.error("Error capturing " + t3 + " pageview", i4);
      }
    }
    pv() {
      if (!this.dv) {
        var i3 = () => {
          this.mv("popstate");
        };
        ms(t, "popstate", i3), this.dv = () => {
          t && t.removeEventListener("popstate", i3);
        };
      }
    }
    gv() {
      if (!this.vv) {
        var i3 = () => {
          this.mv("hashchange");
        };
        ms(t, "hashchange", i3), this.vv = () => {
          t && t.removeEventListener("hashchange", i3);
        };
      }
    }
  }, heatmaps: class {
    get mn() {
      return this.instance.config;
    }
    constructor(t3) {
      var i3;
      this.bv = false, this.Rs = false, this._v = null, this.instance = t3, this.bv = !(null == (i3 = this.instance.persistence) || !i3.props[tr]), this.rageclicks = new Hl(t3.config.rageclick);
    }
    initialize() {
      this.startIfEnabled();
    }
    get flushIntervalMilliseconds() {
      var t3 = 5e3;
      return W(this.mn.capture_heatmaps) && this.mn.capture_heatmaps.flush_interval_milliseconds && (t3 = this.mn.capture_heatmaps.flush_interval_milliseconds), t3;
    }
    get isEnabled() {
      return X(this.mn.capture_heatmaps) ? X(this.mn.enable_heatmaps) ? this.bv : this.mn.enable_heatmaps : false !== this.mn.capture_heatmaps;
    }
    startIfEnabled() {
      if (this.isEnabled) {
        if (this.Rs) return;
        ch.info("starting..."), this.wv(), this.Vt();
      } else {
        var t3;
        clearInterval(null !== (t3 = this._v) && void 0 !== t3 ? t3 : void 0), this.Sv(), this.getAndClearBuffer();
      }
    }
    onRemoteConfig(t3) {
      if (t3.ok) {
        var i3 = t3.config;
        if ("heatmaps" in i3) {
          var e3 = !!i3.heatmaps;
          this.instance.persistence && this.instance.persistence.register({ [tr]: e3 }), this.bv = e3, this.startIfEnabled();
        }
      }
    }
    getAndClearBuffer() {
      var t3 = this.Pt;
      return this.Pt = void 0, t3;
    }
    xv(t3) {
      fh(t3.originalEvent) && this.Xi(t3.originalEvent, "deadclick");
    }
    Vt() {
      this._v && clearInterval(this._v), this._v = "visible" === (null == r ? void 0 : r.visibilityState) ? setInterval(this.Eo.bind(this), this.flushIntervalMilliseconds) : null;
    }
    wv() {
      t && r && (this.Cv = this.Eo.bind(this), ms(t, ss, this.Cv), this.Tv = (i3) => this.Xi(i3 || (null == t ? void 0 : t.event)), ms(r, "click", this.Tv, { capture: true }), this.Mv = (i3) => this.Ev(i3 || (null == t ? void 0 : t.event)), ms(r, "mousemove", this.Mv, { capture: true }), this.Iv = new zn(this.instance, Un, this.xv.bind(this)), this.Iv.startIfEnabledOrStop(), this.Rv = this.Vt.bind(this), ms(r, rs, this.Rv), this.Rs = true);
    }
    Sv() {
      var i3;
      t && r && (this.Cv && t.removeEventListener(ss, this.Cv), this.Tv && r.removeEventListener("click", this.Tv, { capture: true }), this.Mv && r.removeEventListener("mousemove", this.Mv, { capture: true }), this.Rv && r.removeEventListener(rs, this.Rv), clearTimeout(this.Pv), null == (i3 = this.Iv) || i3.stop(), this.Rs = false);
    }
    Av(i3, e3) {
      var r3 = this.instance.scrollManager.scrollY(), s3 = this.instance.scrollManager.scrollX(), n3 = this.instance.scrollManager.scrollElement(), o3 = (function(i4, e4, r4) {
        for (var s4 = i4; s4 && en(s4) && !rn(s4, "body"); ) {
          if (s4 === r4) return false;
          var n4 = void 0;
          try {
            var o4, a3, l3;
            n4 = null == (o4 = null !== (a3 = null == (l3 = s4.ownerDocument) ? void 0 : l3.defaultView) && void 0 !== a3 ? a3 : t) ? void 0 : o4.getComputedStyle(s4).position;
          } catch (t3) {
            return false;
          }
          if (N(e4, n4)) return true;
          s4 = pn(s4);
        }
        return false;
      })(vn(i3), ["fixed", "sticky"], n3);
      return { x: i3.clientX + (o3 ? 0 : s3), y: i3.clientY + (o3 ? 0 : r3), target_fixed: o3, type: e3 };
    }
    Xi(t3, i3) {
      var e3;
      if (void 0 === i3 && (i3 = "click"), !tn(t3.target) && fh(t3)) {
        var r3 = this.Av(t3, i3);
        null != (e3 = this.rageclicks) && e3.isRageClick(t3.clientX, t3.clientY, (/* @__PURE__ */ new Date()).getTime()) && Sn(vn(t3), this.instance.config.rageclick) && this.bs(_({}, r3, { type: "rageclick" })), this.bs(r3);
      }
    }
    Ev(t3) {
      !tn(t3.target) && fh(t3) && (clearTimeout(this.Pv), this.Pv = setTimeout((() => {
        this.bs(this.Av(t3, "mousemove"));
      }), 500));
    }
    bs(i3) {
      if (t) {
        var e3 = this.mn.disable_capture_url_hashes ? $i(t.location.href) : t.location.href, r3 = this.mn.custom_personal_data_properties, s3 = this.mn.mask_personal_data_properties ? [...oo, ...r3 || []] : [], n3 = io(e3, s3, lo);
        this.Pt = this.Pt || {}, this.Pt[n3] || (this.Pt[n3] = []), this.Pt[n3].push(i3);
      }
    }
    Eo() {
      this.Pt && !G(this.Pt) && this.instance.capture("$$heatmap", { $heatmap_data: this.getAndClearBuffer() });
    }
  }, deadClicksAutocapture: zn, webVitalsAutocapture: class {
    constructor(t3) {
      var i3;
      this.bv = false, this.Rs = false, this.Pt = { navigationKey: void 0, url: void 0, metrics: [], firstMetricTimestamp: void 0 }, this.Fv = () => {
        clearTimeout(this.Ov), this.Ov = void 0, 0 !== this.Pt.metrics.length && (this._instance.capture("$web_vitals", _({ $current_url: this.Pt.url }, this.Pt.metrics.reduce(((t4, i4) => _({}, t4, { ["$web_vitals_" + i4.name + "_event"]: _({}, i4), ["$web_vitals_" + i4.name + "_value"]: i4.value })), {}))), this.Pt = { navigationKey: void 0, url: void 0, metrics: [], firstMetricTimestamp: void 0 });
      }, this.Lv = (t4) => {
        var i4;
        if (this.Pt = this.Pt || { navigationKey: void 0, url: void 0, metrics: [], firstMetricTimestamp: void 0 }, X(null == t4 ? void 0 : t4.name) || X(null == t4 ? void 0 : t4.value)) eh.error("Invalid metric received", t4);
        else {
          var e3 = "string" == typeof t4.navigationURL ? t4.navigationURL : void 0, r3 = this.Dv(e3);
          if (!K(r3)) {
            var s3 = Z(t4.navigationId) || "string" == typeof t4.navigationId ? "navigation:" + t4.navigationId : "url:" + r3;
            if (!this.$v || this.$v > t4.value) {
              this.Pt.navigationKey !== s3 && (this.Fv(), this.Ov = setTimeout(this.Fv, this.flushToCaptureTimeoutMs)), K(this.Pt.navigationKey) && (this.Pt.navigationKey = s3, this.Pt.url = r3), this.Pt.firstMetricTimestamp = K(this.Pt.firstMetricTimestamp) ? Date.now() : this.Pt.firstMetricTimestamp;
              var n3 = null == (i4 = this._instance.sessionManager) ? void 0 : i4.checkAndGetSessionAndWindowId(true), o3 = _({}, t4, e3 ? { navigationURL: r3 } : {}, { $current_url: r3, timestamp: Date.now() });
              if (delete o3.entries, W(t4.attribution) && this.attributionMetrics.indexOf(t4.name) > -1) {
                var a3 = {};
                for (var l3 of oh) {
                  var h3 = "url" === l3 && "string" == typeof t4.attribution[l3] ? this.Dv(t4.attribution[l3]) : t4.attribution[l3];
                  K(h3) || (a3[l3] = h3);
                }
                o3.attribution = a3;
              } else delete o3.attribution;
              K(n3) || (o3.$session_id = n3.sessionId, o3.$window_id = n3.windowId), this.Pt.metrics.push(o3), this.Pt.metrics.length === this.allowedMetrics.length && this.Fv();
            } else eh.error("Ignoring metric with value >= " + this.$v, t4);
          }
        }
      }, this.Nv = () => {
        if (!this.Rs) {
          var t4, i4, e3, r3, s3 = false, n3 = v.__PosthogExtensions__, o3 = null == n3 ? void 0 : n3.postHogWebVitalsCallbacksByFlavor, a3 = (null == o3 ? void 0 : o3[this.qv]) || ("web-vitals" === this.qv && K(o3) ? null == n3 ? void 0 : n3.postHogWebVitalsCallbacks : void 0);
          if (!K(a3)) {
            var l3 = a3.withoutAttribution, h3 = this.attributionMetrics;
            s3 = !K(l3), t4 = h3.indexOf("LCP") > -1 ? a3.onLCP : (null == l3 ? void 0 : l3.onLCP) || a3.onLCP, i4 = h3.indexOf("CLS") > -1 ? a3.onCLS : (null == l3 ? void 0 : l3.onCLS) || a3.onCLS, e3 = h3.indexOf("FCP") > -1 ? a3.onFCP : (null == l3 ? void 0 : l3.onFCP) || a3.onFCP, r3 = h3.indexOf("INP") > -1 ? a3.onINP : (null == l3 ? void 0 : l3.onINP) || a3.onINP;
          }
          if (t4 && i4 && e3 && r3) {
            var u3 = { reportSoftNavs: this.useSoftNavs }, d3 = s3 && this.attributionMetrics.indexOf("INP") > -1 ? _({}, u3, { includeProcessedEventEntries: false }) : u3;
            this.allowedMetrics.indexOf("LCP") > -1 && t4(this.Lv.bind(this), u3), this.allowedMetrics.indexOf("CLS") > -1 && i4(this.Lv.bind(this), u3), this.allowedMetrics.indexOf("FCP") > -1 && e3(this.Lv.bind(this), u3), this.allowedMetrics.indexOf("INP") > -1 && r3(this.Lv.bind(this), d3), this.Rs = true;
          } else eh.error("web vitals callbacks not loaded - not starting");
        }
      }, this._instance = t3, this.bv = !(null == (i3 = this._instance.persistence) || !i3.props[sr]), this.startIfEnabled();
    }
    get jv() {
      return this._instance.config.capture_performance;
    }
    get allowedMetrics() {
      var t3, i3, e3 = W(this.jv) ? null == (t3 = this.jv) ? void 0 : t3.web_vitals_allowed_metrics : void 0;
      return X(e3) ? (null == (i3 = this._instance.persistence) ? void 0 : i3.props[lr]) || sh : e3;
    }
    get flushToCaptureTimeoutMs() {
      return (W(this.jv) ? this.jv.web_vitals_delayed_flush_ms : void 0) || 5e3;
    }
    get attributionMetrics() {
      var t3 = W(this.jv) ? this.jv.web_vitals_attribution : void 0;
      return it(t3) ? t3 ? sh : [] : q(t3) ? t3 : nh;
    }
    get useAttribution() {
      return this.attributionMetrics.length > 0;
    }
    get useSoftNavs() {
      var t3 = W(this.jv) ? this.jv.__preview_web_vitals_soft_navs : void 0;
      return null != t3 && t3;
    }
    get $v() {
      var t3 = W(this.jv) && Z(this.jv.__web_vitals_max_value) ? this.jv.__web_vitals_max_value : rh;
      return t3 > 0 && 6e4 >= t3 ? rh : t3;
    }
    get isEnabled() {
      var t3 = null == s ? void 0 : s.protocol;
      if ("http:" !== t3 && "https:" !== t3) return eh.info("Web Vitals are disabled on non-http/https protocols"), false;
      var i3 = W(this.jv) ? this.jv.web_vitals : it(this.jv) ? this.jv : void 0;
      return it(i3) ? i3 : this.bv;
    }
    startIfEnabled() {
      this.isEnabled && !this.Rs && (eh.info("enabled, starting..."), this.Ys(this.Nv));
    }
    onRemoteConfig(t3) {
      if (t3.ok) {
        var i3 = t3.config;
        if ("capturePerformance" in i3) {
          var e3 = W(i3.capturePerformance) && !!i3.capturePerformance.web_vitals, r3 = W(i3.capturePerformance) ? i3.capturePerformance.web_vitals_allowed_metrics : void 0;
          this._instance.persistence && (this._instance.persistence.register({ [sr]: e3 }), this._instance.persistence.register({ [lr]: r3 })), this.bv = e3, this.startIfEnabled();
        }
      }
    }
    get qv() {
      return this.useSoftNavs ? this.useAttribution ? "web-vitals-with-attribution-soft-navs" : "web-vitals-soft-navs" : this.useAttribution ? "web-vitals-with-attribution" : "web-vitals";
    }
    Ys(t3) {
      var i3 = v.__PosthogExtensions__, e3 = this.qv, r3 = null == i3 ? void 0 : i3.postHogWebVitalsCallbacksByFlavor;
      null != r3 && r3[e3] || "web-vitals" === e3 && K(r3) && null != i3 && i3.postHogWebVitalsCallbacks ? t3() : null == i3 || null == i3.loadExternalDependency || i3.loadExternalDependency(this._instance, e3, ((i4) => {
        i4 ? eh.error("failed to load script", i4) : t3();
      }));
    }
    Dv(i3) {
      var e3 = i3 || (null == t ? void 0 : t.location.href);
      if (e3) {
        var r3 = this._instance.config.disable_capture_url_hashes ? $i(e3) : e3, s3 = this._instance.config.custom_personal_data_properties, n3 = this._instance.config.mask_personal_data_properties ? [...oo, ...s3 || []] : [];
        return io(r3, n3, lo);
      }
      eh.error("Could not determine current URL");
    }
  } };
  var nu = { exceptionObserver: class {
    constructor(i3) {
      var e3;
      this.Nv = () => {
        var i4;
        if (t && this.isEnabled && null != (i4 = v.__PosthogExtensions__) && i4.errorWrappingFunctions) {
          var e4 = v.__PosthogExtensions__.errorWrappingFunctions.wrapOnError, r3 = v.__PosthogExtensions__.errorWrappingFunctions.wrapUnhandledRejection, s3 = v.__PosthogExtensions__.errorWrappingFunctions.wrapConsoleError;
          try {
            !this.Bv && this.mn.capture_unhandled_errors && (this.Bv = e4(this.captureException.bind(this))), !this.Hv && this.mn.capture_unhandled_rejections && (this.Hv = r3(this.captureException.bind(this))), !this.zv && this.mn.capture_console_errors && (this.zv = s3(this.captureException.bind(this)));
          } catch (t3) {
            Ql.error("failed to start", t3), this.Uv();
          }
        }
      }, this._instance = i3, this.Wv = !(null == (e3 = this._instance.persistence) || !e3.props[ir]), this.pe = new ft(_({}, (function(t3) {
        var i4, e4, r3, s3;
        return void 0 === t3 && (t3 = {}), { refillRate: null !== (i4 = null !== (e4 = t3.exceptionRateLimiterRefillRate) && void 0 !== e4 ? e4 : t3.__exceptionRateLimiterRefillRate) && void 0 !== i4 ? i4 : 1, bucketSize: null !== (r3 = null !== (s3 = t3.exceptionRateLimiterBucketSize) && void 0 !== s3 ? s3 : t3.__exceptionRateLimiterBucketSize) && void 0 !== r3 ? r3 : 10 };
      })(this._instance.config.error_tracking), { refillInterval: 1e4, A: Ql })), this.mn = this.Vv(), this.startIfEnabledOrStop();
    }
    Vv() {
      var t3 = this._instance.config.capture_exceptions, i3 = { capture_unhandled_errors: false, capture_unhandled_rejections: false, capture_console_errors: false };
      return W(t3) ? i3 = _({}, i3, t3) : (K(t3) ? this.Wv : t3) && (i3 = _({}, i3, { capture_unhandled_errors: true, capture_unhandled_rejections: true })), i3;
    }
    get isEnabled() {
      return this.mn.capture_console_errors || this.mn.capture_unhandled_errors || this.mn.capture_unhandled_rejections;
    }
    startIfEnabledOrStop() {
      this.isEnabled ? (Ql.info("enabled"), this.Uv(), this.Ys(this.Nv)) : this.Uv();
    }
    Ys(t3) {
      var i3, e3;
      null != (i3 = v.__PosthogExtensions__) && i3.errorWrappingFunctions ? t3() : null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this._instance, "exception-autocapture", ((i4) => {
        if (i4) return Ql.error("failed to load script", i4);
        t3();
      }));
    }
    Uv() {
      var t3, i3, e3;
      null == (t3 = this.Bv) || t3.call(this), this.Bv = void 0, null == (i3 = this.Hv) || i3.call(this), this.Hv = void 0, null == (e3 = this.zv) || e3.call(this), this.zv = void 0;
    }
    onRemoteConfig(t3) {
      if (t3.ok) {
        var i3 = t3.config;
        "autocaptureExceptions" in i3 && (this.Wv = !!i3.autocaptureExceptions || false, this._instance.persistence && this._instance.persistence.register({ [ir]: this.Wv }), this.mn = this.Vv(), this.startIfEnabledOrStop());
      }
    }
    onConfigChange() {
      this.mn = this.Vv();
    }
    captureException(t3) {
      var i3, e3, r3, s3 = null !== (i3 = null == t3 || null == (e3 = t3.$exception_list) || null == (e3 = e3[0]) ? void 0 : e3.type) && void 0 !== i3 ? i3 : "Exception";
      this.pe.consumeRateLimit(s3) ? Ql.info("Skipping exception capture because of client rate limiting.", { exception: s3 }) : null == (r3 = this._instance.exceptions) || r3.sendExceptionEvent(t3);
    }
  }, exceptions: class {
    constructor(t3) {
      var i3, e3;
      this.Gv = [], this.Zv = new he([new we(), new Oe(), new xe(), new Se(), new Re(), new Pe(), new ke(), new Ce()], (function(t4) {
        for (var i4 = arguments.length, e4 = new Array(i4 > 1 ? i4 - 1 : 0), r3 = 1; i4 > r3; r3++) e4[r3 - 1] = arguments[r3];
        return function(i5, r4) {
          void 0 === r4 && (r4 = 0);
          for (var s3 = [], n3 = i5.split("\n"), o3 = r4; n3.length > o3; o3++) {
            var a3 = n3[o3];
            if (1024 >= a3.length) {
              var l3 = be.test(a3) ? a3.replace(be, "$1") : a3;
              if (!l3.match(/\S*Error: /)) {
                for (var h3 of e4) {
                  var u3 = h3(l3, t4);
                  if (u3) {
                    s3.push(u3);
                    break;
                  }
                }
                if (s3.length >= 50) break;
              }
            }
          }
          return (function(t5) {
            if (!t5.length) return [];
            var i6 = Array.from(t5);
            return i6.reverse(), i6.slice(0, 50).map(((t6) => {
              return _({}, t6, { filename: t6.filename || (e5 = i6, e5[e5.length - 1] || {}).filename, function: t6.function || ue });
              var e5;
            }));
          })(s3);
        };
      })("web:javascript", _e, ye)), this._instance = t3, this.Gv = null !== (i3 = null == (e3 = this._instance.persistence) ? void 0 : e3.get_property(er)) && void 0 !== i3 ? i3 : [], this.Qv = De(this.Jv()), this.Kv = new Ne(this.Qv);
    }
    onConfigChange() {
      this.Qv = De(this.Jv()), this.Kv.setConfig(this.Qv);
    }
    onRemoteConfig(t3) {
      var i3, e3, r3;
      if (t3.ok) {
        var s3 = t3.config;
        if ("errorTracking" in s3) {
          var n3 = null !== (i3 = null == (e3 = s3.errorTracking) ? void 0 : e3.suppressionRules) && void 0 !== i3 ? i3 : [], o3 = null == (r3 = s3.errorTracking) ? void 0 : r3.captureExtensionExceptions;
          this.Gv = n3, this._instance.persistence && this._instance.persistence.register({ [er]: this.Gv, [rr]: o3 });
        }
      }
    }
    get Yv() {
      var t3, i3 = !!this._instance.get_property(rr), e3 = this._instance.config.error_tracking.captureExtensionExceptions;
      return null !== (t3 = null != e3 ? e3 : i3) && void 0 !== t3 && t3;
    }
    buildProperties(t3, i3) {
      return this.Zv.buildFromUnknown(t3, { syntheticException: null == i3 ? void 0 : i3.syntheticException, mechanism: { handled: null == i3 ? void 0 : i3.handled } });
    }
    addExceptionStep(t3, i3) {
      if (this.Qv.enabled) try {
        if (!J(t3) || 0 === t3.trim().length) return void Bh.warn("Ignoring exception step because message must be a non-empty string");
        var e3 = (function(t4) {
          if (!t4) return { sanitizedProperties: {}, droppedKeys: [] };
          var i4 = [];
          return { sanitizedProperties: Object.keys(t4).reduce(((e4, r4) => Ae.has(r4) ? (i4.push(r4), e4) : (e4[r4] = t4[r4], e4)), {}), droppedKeys: i4 };
        })(this.Xv(i3)), r3 = e3.sanitizedProperties, s3 = e3.droppedKeys;
        s3.length > 0 && Bh.warn("Ignoring reserved exception step fields", { droppedKeys: s3 }), this.Kv.add(_({ [Ie]: t3, [Fe]: (/* @__PURE__ */ new Date()).toISOString() }, r3));
      } catch (t4) {
        Bh.error("Failed to add exception step. Ignoring breadcrumb.", t4);
      }
    }
    sendExceptionEvent(t3) {
      try {
        var i3 = t3.$exception_list;
        if (this.tc(i3)) {
          if (this.ec(i3)) return this.ic("Exception dropped: matched a suppression rule"), void Bh.info("Skipping exception capture because a suppression rule matched");
          if (!this.Yv && this.rc(i3)) return this.ic("Exception dropped: thrown by a browser extension"), void Bh.info("Skipping exception capture because it was thrown by an extension");
          if (!this.Yv && this.nc(i3)) return this.ic("Exception dropped: thrown by an injected browser script"), void Bh.info("Skipping exception capture because it was thrown by an injected browser script");
          if (!this._instance.config.error_tracking.__capturePostHogExceptions && this.sc(i3)) return this.ic("Exception dropped: thrown by the PostHog SDK"), void Bh.info("Skipping exception capture because it was thrown by the PostHog SDK");
        }
        var e3 = this.Qv.enabled && X(t3.$exception_steps) ? this.ac(t3) : t3, r3 = "string" == typeof (n3 = globalThis._posthogReleaseId) && n3.length > 0 ? n3 : void 0;
        r3 && (e3.$release_id = r3);
        try {
          var s3 = this._instance.capture("$exception", e3, { _noTruncate: true, _batchKey: "exceptionEvent", hu: true });
          return s3 && this.Kv.clear(), s3;
        } catch (t4) {
          return Bh.error("Failed to capture exception event. Dropping this exception.", t4), void this.Kv.clear();
        }
      } catch (t4) {
        return void Bh.error("Failed to process exception event. Ignoring this exception.", t4);
      }
      var n3;
    }
    ac(t3) {
      try {
        var i3 = this.Kv.getAttachable();
        return 0 === i3.length ? t3 : _({}, t3, { $exception_steps: i3 });
      } catch (i4) {
        return Bh.error("Failed to read buffered exception steps. Capturing exception without steps.", i4), t3;
      }
    }
    ic(t3) {
      this.Qv.enabled && this.Kv.add({ [Ie]: t3, [Fe]: (/* @__PURE__ */ new Date()).toISOString() });
    }
    Xv(t3) {
      return W(t3) ? _({}, t3) : {};
    }
    Jv() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this._instance.config.error_tracking) ? void 0 : i3.exception_steps) && void 0 !== t3 ? t3 : {};
    }
    ec(t3) {
      if (0 === t3.length) return false;
      try {
        var i3 = t3.reduce(((t4, i4) => {
          var e3 = i4.type, r3 = i4.value;
          return J(e3) && e3.length > 0 && t4.$exception_types.push(e3), J(r3) && r3.length > 0 && t4.$exception_values.push(r3), t4;
        }), { $exception_types: [], $exception_values: [] });
        return this.Gv.some(((t4) => {
          var e3 = t4.values.map(((t5) => {
            var e4 = al[t5.operator], r3 = i3[t5.key];
            if (!e4 || !r3) return false;
            var s3 = q(t5.value) ? t5.value : [t5.value];
            return s3.length > 0 && e4(s3, r3);
          }));
          return "OR" === t4.type ? e3.some(Boolean) : e3.every(Boolean);
        }));
      } catch (t4) {
        return Bh.warn("Failed to evaluate suppression rules. Capturing the exception.", t4), false;
      }
    }
    rc(t3) {
      var i3 = t3.flatMap(((t4) => {
        var i4, e4;
        return null !== (i4 = null == (e4 = t4.stacktrace) ? void 0 : e4.frames) && void 0 !== i4 ? i4 : [];
      })), e3 = i3.filter(((t4) => {
        var i4 = t4.filename;
        return !!i4 && Hh.some(((t5) => i4.startsWith(t5)));
      }));
      return 0 !== e3.length && (!e3.every(((t4) => {
        var i4 = t4.filename;
        return !!i4 && i4.startsWith(zh);
      })) || t3.some(((t4) => {
        var i4 = t4.value;
        return J(i4) && i4.includes("isolatedAPI.contexts.topHostname");
      })) && !i3.some(((t4) => {
        var i4 = t4.filename;
        return t4.in_app && !(null != i4 && i4.startsWith(zh));
      })));
    }
    nc(t3) {
      return t3.some(((t4) => {
        var i3 = t4.value;
        return J(i3) && qh.some(((t5) => i3.includes(t5)));
      }));
    }
    sc(t3) {
      if (t3.length > 0) {
        var i3, e3, r3, s3, n3 = null !== (i3 = null == (e3 = t3[0].stacktrace) ? void 0 : e3.frames) && void 0 !== i3 ? i3 : [], o3 = n3[n3.length - 1];
        return null !== (r3 = null == o3 || null == (s3 = o3.filename) ? void 0 : s3.includes("posthog.com/static")) && void 0 !== r3 && r3;
      }
      return false;
    }
    tc(t3) {
      return !X(t3) && q(t3);
    }
  } };
  var ou = _({ productTours: class {
    get No() {
      return this._instance.persistence;
    }
    constructor(t3) {
      this.oc = null, this.lc = null, this._instance = t3;
    }
    initialize() {
      this.loadIfEnabled();
    }
    onRemoteConfig(t3) {
      if (t3.ok) {
        var i3 = t3.config;
        if ("productTours" in i3) {
          var e3, r3;
          if (this.No && this.No.register({ [or]: !!i3.productTours }), !_h(this._instance)) return !this.oc && X(null == (e3 = this.No) ? void 0 : e3.props[Ar]) || ph.info("product tours disabled; stopping and clearing cached tours"), null == (r3 = this.oc) || r3.stop(), this.oc = null, void this.clearCache();
          this.loadIfEnabled();
        }
      }
    }
    loadIfEnabled() {
      !this.oc && _h(this._instance) && this.Ys((() => this.uc()));
    }
    Ys(t3) {
      var i3, e3;
      null != (i3 = v.__PosthogExtensions__) && i3.generateProductTours ? t3() : null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this._instance, "product-tours", ((i4) => {
        i4 ? ph.error("Could not load product tours script", i4) : t3();
      }));
    }
    uc() {
      var t3;
      !this.oc && null != (t3 = v.__PosthogExtensions__) && t3.generateProductTours && (this.oc = v.__PosthogExtensions__.generateProductTours(this._instance, true));
    }
    getProductTours(t3, i3) {
      if (void 0 === i3 && (i3 = false), !q(this.lc) || i3) {
        var e3 = this.No;
        if (e3) {
          var r3 = e3.props[Ar];
          if (q(r3) && !i3) return this.lc = r3, void t3(r3, { isLoaded: true });
        }
        this._instance._send_request({ url: this._instance.requestRouter.endpointFor("api", "/api/product_tours/?token=" + this._instance.config.token), method: "GET", timestampMode: "query", callback: (i4) => {
          if (_h(this._instance)) {
            var r4 = i4.statusCode;
            if (200 !== r4 || !i4.json) {
              var s3 = "Product Tours API could not be loaded, status: " + r4;
              return 0 === r4 ? i4.error || ph.warn(s3) : ph.error(s3), void t3([], { isLoaded: false, error: s3 });
            }
            var n3 = q(i4.json.product_tours) ? i4.json.product_tours : [];
            this.lc = n3, e3 && e3.register({ [Ar]: n3 }), t3(n3, { isLoaded: true });
          } else t3([], { isLoaded: true });
        } });
      } else t3(this.lc, { isLoaded: true });
    }
    getActiveProductTours(t3) {
      X(this.oc) ? t3([], { isLoaded: false, error: "Product tours not loaded" }) : this.oc.getActiveProductTours(t3);
    }
    showProductTour(t3) {
      var i3;
      null == (i3 = this.oc) || i3.showTourById(t3);
    }
    previewTour(t3) {
      this.oc ? this.oc.previewTour(t3) : this.Ys((() => {
        var i3;
        this.uc(), null == (i3 = this.oc) || i3.previewTour(t3);
      }));
    }
    dismissProductTour() {
      var t3;
      null == (t3 = this.oc) || t3.dismissTour("user_clicked_skip");
    }
    nextStep() {
      var t3;
      null == (t3 = this.oc) || t3.nextStep();
    }
    previousStep() {
      var t3;
      null == (t3 = this.oc) || t3.previousStep();
    }
    clearCache() {
      var t3;
      this.lc = null, null == (t3 = this.No) || t3.unregister(Ar);
    }
    resetTour(t3) {
      var i3;
      null == (i3 = this.oc) || i3.resetTour(t3);
    }
    resetAllTours() {
      var t3;
      null == (t3 = this.oc) || t3.resetAllTours();
    }
    cancelPendingTour(t3) {
      var i3;
      null == (i3 = this.oc) || i3.cancelPendingTour(t3);
    }
  } }, eu);
  var au = { siteApps: class {
    constructor(t3) {
      this.hc = 0, this._instance = t3, this.dc = [], this.apps = {};
    }
    get isEnabled() {
      return !!this._instance.config.opt_in_site_apps;
    }
    vc(t3, i3) {
      if (i3) {
        var e3 = this.globalsForEvent(i3);
        this.dc.push(e3), this.dc.length > 1e3 && (this.dc = this.dc.slice(10));
      }
    }
    get siteAppLoaders() {
      var t3;
      return null == (t3 = v._POSTHOG_REMOTE_CONFIG) || null == (t3 = t3[this._instance.config.token]) ? void 0 : t3.siteApps;
    }
    initialize() {
      if (this.isEnabled) {
        var t3 = this._instance._addCaptureHook(this.vc.bind(this));
        this.cc = () => {
          t3(), this.dc = [], this.cc = void 0;
        };
      }
    }
    globalsForEvent(t3) {
      var i3, e3, r3, s3, n3, o3, a3;
      if (!t3) throw new Error("Event payload is required");
      var l3 = {}, h3 = this._instance.get_property("$groups") || [], u3 = this._instance.get_property("$stored_group_properties") || {};
      for (var d3 of Object.entries(u3)) {
        var v3 = d3[0];
        l3[v3] = { id: h3[v3], type: v3, properties: d3[1] };
      }
      var c3 = t3.$set_once, f3 = t3.$set;
      return { event: _({}, g(t3, gh), { properties: _({}, t3.properties, f3 ? { $set: _({}, null !== (i3 = null == (e3 = t3.properties) ? void 0 : e3.$set) && void 0 !== i3 ? i3 : {}, f3) } : {}, c3 ? { $set_once: _({}, null !== (r3 = null == (s3 = t3.properties) ? void 0 : s3.$set_once) && void 0 !== r3 ? r3 : {}, c3) } : {}), elements_chain: null !== (n3 = null == (o3 = t3.properties) ? void 0 : o3.$elements_chain) && void 0 !== n3 ? n3 : "", distinct_id: null == (a3 = t3.properties) ? void 0 : a3.distinct_id }), person: { properties: this._instance.get_property("$stored_person_properties") }, groups: l3 };
    }
    fc(t3) {
      var i3, e3 = null == (i3 = t3.tagName) ? void 0 : i3.toLowerCase();
      return "style" === e3 && this._instance.config.prepare_external_dependency_stylesheet ? this._instance.config.prepare_external_dependency_stylesheet(t3) || (mh.error("prepare_external_dependency_stylesheet returned null"), null) : "script" === e3 && this._instance.config.prepare_external_dependency_script ? this._instance.config.prepare_external_dependency_script(t3) || (mh.error("prepare_external_dependency_script returned null"), null) : t3;
    }
    gc() {
      var t3, i3, e3, s3, n3, o3, a3, l3;
      if (!this._instance.config.prepare_external_dependency_stylesheet && !this._instance.config.prepare_external_dependency_script) return () => {
      };
      var h3 = null == r ? void 0 : r.defaultView, u3 = null == h3 || null == (t3 = h3.Node) ? void 0 : t3.prototype;
      if (!h3 || !u3) return () => {
      };
      if (this.hc++, this.mc) return this.yc();
      var d3 = [], v3 = this, c3 = /* @__PURE__ */ new WeakSet(), f3 = (t4, i4, e4) => {
        if (null != t4 && t4[i4]) {
          var r3 = t4[i4];
          t4[i4] = e4(r3), d3.push((() => {
            t4[i4] = r3;
          }));
        }
      }, p3 = (t4) => {
        if (c3.has(t4)) return t4;
        var i4 = v3.fc(t4);
        return i4 && c3.add(i4), i4;
      }, _3 = (t4) => t4.map(((t5) => "string" == typeof t5 ? t5 : p3(t5))).filter(((t5) => !Q(t5)));
      return f3(u3, "appendChild", ((t4) => function(i4) {
        var e4 = p3(i4);
        return e4 ? t4.call(this, e4) : i4;
      })), f3(u3, "insertBefore", ((t4) => function(i4, e4) {
        var r3 = p3(i4);
        return r3 ? t4.call(this, r3, e4) : i4;
      })), f3(u3, "replaceChild", ((t4) => function(i4, e4) {
        var r3 = p3(i4);
        return r3 ? t4.call(this, r3, e4) : e4;
      })), [null == (i3 = h3.Element) ? void 0 : i3.prototype, null == (e3 = h3.Document) ? void 0 : e3.prototype, null == (s3 = h3.DocumentFragment) ? void 0 : s3.prototype].forEach(((t4) => {
        f3(t4, "append", ((t5) => function() {
          for (var i4 = arguments.length, e4 = new Array(i4), r3 = 0; i4 > r3; r3++) e4[r3] = arguments[r3];
          return t5.apply(this, _3(e4));
        })), f3(t4, "prepend", ((t5) => function() {
          for (var i4 = arguments.length, e4 = new Array(i4), r3 = 0; i4 > r3; r3++) e4[r3] = arguments[r3];
          return t5.apply(this, _3(e4));
        }));
      })), [null == (n3 = h3.Element) ? void 0 : n3.prototype, null == (o3 = h3.CharacterData) ? void 0 : o3.prototype, null == (a3 = h3.DocumentType) ? void 0 : a3.prototype].forEach(((t4) => {
        f3(t4, "before", ((t5) => function() {
          for (var i4 = arguments.length, e4 = new Array(i4), r3 = 0; i4 > r3; r3++) e4[r3] = arguments[r3];
          return t5.apply(this, _3(e4));
        })), f3(t4, "after", ((t5) => function() {
          for (var i4 = arguments.length, e4 = new Array(i4), r3 = 0; i4 > r3; r3++) e4[r3] = arguments[r3];
          return t5.apply(this, _3(e4));
        })), f3(t4, "replaceWith", ((t5) => function() {
          for (var i4 = arguments.length, e4 = new Array(i4), r3 = 0; i4 > r3; r3++) e4[r3] = arguments[r3];
          var s4 = _3(e4);
          return e4.length && !s4.length ? void 0 : t5.apply(this, s4);
        }));
      })), f3(null == (l3 = h3.Element) ? void 0 : l3.prototype, "insertAdjacentElement", ((t4) => function(i4, e4) {
        var r3 = p3(e4);
        return r3 ? t4.call(this, i4, r3) : null;
      })), this.mc = () => {
        d3.forEach(((t4) => t4())), this.mc = void 0;
      }, this.yc();
    }
    yc() {
      var t3 = false;
      return () => {
        var i3;
        t3 || (t3 = true, this.hc--, 0 === this.hc && (null == (i3 = this.mc) || i3.call(this)));
      };
    }
    bc(t3, i3) {
      void 0 === i3 && (i3 = true);
      var e3 = this.gc();
      try {
        var r3 = t3(e3);
        return i3 && e3(), r3;
      } catch (t4) {
        throw e3(), t4;
      }
    }
    setupSiteApp(t3) {
      var i3 = this.apps[t3.id], e3 = () => {
        var e4;
        !i3.errored && this.dc.length && (mh.info("Processing " + this.dc.length + " events for site app with id " + t3.id), this.dc.forEach(((t4) => this.bc((() => null == i3.processEvent ? void 0 : i3.processEvent(t4))))), i3.processedBuffer = true), Object.values(this.apps).every(((t4) => t4.processedBuffer || t4.errored)) && (null == (e4 = this.cc) || e4.call(this));
      }, r3 = false, s3 = (s4) => {
        i3.errored = !s4, i3.loaded = true, mh.info("Site app with id " + t3.id + " " + (s4 ? "loaded" : "errored")), r3 && e3();
      };
      try {
        var n3 = this.bc(((i4) => t3.init({ posthog: this._instance, callback(t4) {
          i4(), s3(t4);
        } })), false).processEvent;
        n3 && (i3.processEvent = n3), r3 = true;
      } catch (i4) {
        mh.error(yh + t3.id, i4), s3(false);
      }
      if (r3 && i3.loaded) try {
        e3();
      } catch (e4) {
        mh.error("Error while processing buffered events PostHog app with config id " + t3.id, e4), i3.errored = true;
      }
    }
    _c() {
      var t3 = this.siteAppLoaders || [];
      for (var i3 of t3) this.apps[i3.id] = { id: i3.id, loaded: false, errored: false, processedBuffer: false };
      for (var e3 of t3) this.setupSiteApp(e3);
    }
    wc(t3) {
      var i3 = this;
      if (0 !== Object.keys(this.apps).length) {
        var e3 = this.globalsForEvent(t3), r3 = function(r4) {
          try {
            i3.bc((() => null == r4.processEvent ? void 0 : r4.processEvent(e3)));
          } catch (i4) {
            mh.error("Error while processing event " + t3.event + " for site app " + r4.id, i4);
          }
        };
        for (var s3 of Object.values(this.apps)) r3(s3);
      }
    }
    onRemoteConfig(t3) {
      var i3, e3, r3, s3 = this;
      if (null != (i3 = this.siteAppLoaders) && i3.length) return this.isEnabled ? (this._c(), void this._instance.on("eventCaptured", ((t4) => this.wc(t4)))) : void mh.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');
      if (null == (e3 = this.cc) || e3.call(this), t3.ok) {
        var n3 = t3.config;
        if (null != (r3 = n3.siteApps) && r3.length) if (this.isEnabled) {
          var o3 = function() {
            var t4, i4 = a3.id, e4 = a3.url;
            v["__$$ph_site_app_" + i4] = s3._instance, null == (t4 = v.__PosthogExtensions__) || null == t4.loadSiteApp || t4.loadSiteApp(s3._instance, e4, ((t5) => {
              if (t5) return mh.error(yh + i4, t5);
            }));
          };
          for (var a3 of n3.siteApps) o3();
        } else mh.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');
      }
    }
  } };
  var lu = { tracingHeaders: class {
    constructor(t3) {
      this.kc = void 0, this.Sc = void 0, this.xc = void 0, this.Nv = () => {
        var t4, i3, e3 = this.Cc();
        e3 ? (K(this.kc) && (this.kc = null == (t4 = v.__PosthogExtensions__) || null == (t4 = t4.tracingHeadersPatchFns) ? void 0 : t4._patchXHR(e3, (() => this._instance.get_distinct_id()), this._instance.sessionManager)), K(this.Sc) && (this.Sc = null == (i3 = v.__PosthogExtensions__) || null == (i3 = i3.tracingHeadersPatchFns) ? void 0 : i3._patchFetch(e3, (() => this._instance.get_distinct_id()), this._instance.sessionManager))) : this.Uv();
      }, this._instance = t3;
    }
    initialize() {
      this.startIfEnabledOrStop();
    }
    Ys(t3) {
      var i3, e3;
      null != (i3 = v.__PosthogExtensions__) && i3.tracingHeadersPatchFns ? t3() : null == (e3 = v.__PosthogExtensions__) || null == e3.loadExternalDependency || e3.loadExternalDependency(this._instance, "tracing-headers", ((i4) => {
        if (i4) return ih.error("failed to load script", i4);
        t3();
      }));
    }
    Tc() {
      var t3, i3;
      return null !== (t3 = null !== (i3 = this._instance.config.tracing_headers) && void 0 !== i3 ? i3 : this._instance.config.addTracingHeaders) && void 0 !== t3 ? t3 : this._instance.config.__add_tracing_headers;
    }
    Cc() {
      var t3 = this.Tc();
      return q(t3) ? (q(this.xc) ? this.xc.splice(0, this.xc.length, ...t3) : this.xc = [...t3], t3.length > 0 ? this.xc : void 0) : (q(this.xc) && this.xc.splice(0), this.xc = t3 || void 0, this.xc);
    }
    Uv() {
      var t3, i3;
      null == (t3 = this.kc) || t3.call(this), null == (i3 = this.Sc) || i3.call(this), this.kc = void 0, this.Sc = void 0;
    }
    startIfEnabledOrStop() {
      this.Cc() ? this.Ys(this.Nv) : this.Uv();
    }
  } };
  var hu = _({ surveys: class extends xh {
    constructor(t3) {
      var i3;
      super(new Rh(t3), { get projectToken() {
        return i3.config.token;
      }, kv: new Ph(i3 = t3) }), this._instance = t3;
    }
    Lu(t3, i3) {
      var e3 = i3.query ? Aa(t3, i3.query) : t3;
      return new Promise(((t4) => {
        var r3;
        this._instance._send_request({ method: i3.method, url: this._instance.requestRouter.endpointFor(null !== (r3 = i3.target) && void 0 !== r3 ? r3 : "api", e3), data: i3.body, headers: i3.headers, timeout: i3.timeoutMs, fireCallbackOnDrop: true, transport: i3.transport, compression: i3.compression, timestampMode: i3.sentAt, callback: t4 });
      }));
    }
  } }, eu);
  var uu = { toolbar: class {
    constructor(t3) {
      this.instance = t3;
    }
    Mc(t3) {
      v.ph_toolbar_state = t3;
    }
    Ec() {
      var t3;
      return null !== (t3 = v.ph_toolbar_state) && void 0 !== t3 ? t3 : 0;
    }
    initialize() {
      return this.maybeLoadToolbar();
    }
    maybeLoadToolbar(i3, e3, s3) {
      if (void 0 === i3 && (i3 = void 0), void 0 === e3 && (e3 = void 0), void 0 === s3 && (s3 = void 0), ys(this.instance.config)) return false;
      if (!t || !r) return false;
      i3 = null != i3 ? i3 : t.location, s3 = null != s3 ? s3 : t.history;
      try {
        if (!e3) {
          try {
            t.localStorage.setItem("test", "test"), t.localStorage.removeItem("test");
          } catch (t3) {
            return false;
          }
          e3 = null == t ? void 0 : t.localStorage;
        }
        var n3, o3 = Ch || eo(i3.hash, "__posthog") || eo(i3.hash, "state"), a3 = o3 ? cs((() => JSON.parse(atob(decodeURIComponent(o3))))) || cs((() => JSON.parse(decodeURIComponent(o3)))) : null;
        return a3 && "ph_authorize" === a3.action ? ((n3 = a3).source = "url", n3 && Object.keys(n3).length > 0 && (a3.desiredHash ? i3.hash = a3.desiredHash : s3 ? s3.replaceState(s3.state, "", i3.pathname + i3.search) : i3.hash = "")) : ((n3 = JSON.parse(e3.getItem(Oh) || "{}")).source = "localstorage", delete n3.userIntent), !(!n3.token || this.instance.config.token !== n3.token || (this.loadToolbar(n3), 0));
      } catch (t3) {
        return false;
      }
    }
    Ic(t3) {
      var i3 = v.ph_load_toolbar || v.ph_load_editor;
      !X(i3) && V(i3) ? i3(t3, this.instance) : Ih.warn("No toolbar load function found");
    }
    loadToolbar(i3) {
      var e3 = !(null == r || !r.getElementById(Ys));
      if (!t || e3) return false;
      var s3 = "custom" === this.instance.requestRouter.region && this.instance.config.advanced_disable_toolbar_metrics, n3 = _({ token: this.instance.config.token }, i3, { apiURL: this.instance.requestRouter.endpointFor("ui") }, s3 ? { instrument: false } : {});
      if (t.localStorage.setItem(Oh, JSON.stringify(_({}, n3, { source: void 0 }))), 2 === this.Ec()) this.Ic(n3);
      else if (0 === this.Ec()) {
        var o3;
        this.Mc(1), null == (o3 = v.__PosthogExtensions__) || null == o3.loadExternalDependency || o3.loadExternalDependency(this.instance, "toolbar", ((t3) => {
          if (t3) return Ih.error("[Toolbar] Failed to load", t3), void this.Mc(0);
          this.Mc(2), this.Ic(n3);
        })), ms(t, "turbolinks:load", (() => {
          this.Mc(0), this.loadToolbar(n3);
        }));
      }
      return true;
    }
    Rc(t3) {
      return this.loadToolbar(t3);
    }
    maybeLoadEditor(t3, i3, e3) {
      return void 0 === t3 && (t3 = void 0), void 0 === i3 && (i3 = void 0), void 0 === e3 && (e3 = void 0), this.maybeLoadToolbar(t3, i3, e3);
    }
  } };
  var du = _({ experiments: Gh }, eu);
  var vu = { conversations: class {
    constructor(t3) {
      this.Pc = void 0, this._conversationsManager = null, this.Ac = false, this.je = null, this.Fc = false, this._instance = t3;
    }
    initialize() {
      this.loadIfEnabled();
    }
    onRemoteConfig(t3) {
      if (!this._instance.config.disable_conversations && (this.Oc = t3.ok, t3.ok)) {
        var i3 = t3.config.conversations;
        X(i3) || (it(i3) ? this.Pc = i3 : (this.Pc = i3.enabled, this.je = i3), this.loadIfEnabled());
      }
    }
    reset() {
      var t3;
      null == (t3 = this._conversationsManager) || t3.reset(), this._conversationsManager = null, this.Pc = void 0, this.je = null, this.Oc = void 0, this.Fc = false;
    }
    loadIfEnabled() {
      if (!(this._conversationsManager || this.Ac || this._instance.config.disable_conversations || ys(this._instance.config) || this._instance.config.cookieless_mode && this._instance.consent.isOptedOut())) {
        var t3 = null == v ? void 0 : v.__PosthogExtensions__;
        if (t3 && !K(this.Pc) && this.Pc) if (this.je && this.je.token) {
          this.Ac = true;
          try {
            var i3 = t3.initConversations;
            if (i3) return this.Lc(i3), void (this.Ac = false);
            var e3 = t3.loadExternalDependency;
            if (!e3) return void this.Dc(Qr);
            e3(this._instance, "conversations", ((i4) => {
              i4 || !t3.initConversations ? this.Dc("Could not load conversations script", i4) : this.Lc(t3.initConversations), this.Ac = false;
            }));
          } catch (t4) {
            this.Dc("Error initializing conversations", t4), this.Ac = false;
          }
        } else Kh.error("Conversations enabled but missing token in remote config.");
      }
    }
    Lc(t3) {
      if (this.je) try {
        this._conversationsManager = t3(this.je, this._instance), this.Fc = false, Kh.info("Conversations loaded successfully");
      } catch (t4) {
        this.Dc("Error completing conversations initialization", t4);
      }
      else Kh.error("Cannot complete initialization: remote config is null");
    }
    Dc(t3, i3) {
      Kh.error(t3, i3), this._conversationsManager = null, this.Ac = false, this.Fc = true;
    }
    show() {
      this._conversationsManager ? this._conversationsManager.show() : Kh.warn("Conversations not loaded yet.");
    }
    hide() {
      this._conversationsManager && this._conversationsManager.hide();
    }
    isAvailable() {
      return true === this.Pc && !Q(this._conversationsManager);
    }
    getUnavailableReason() {
      return this.isAvailable() ? null : this._instance.config.disable_conversations ? "disabled_by_config" : ys(this._instance.config) ? "disabled_for_toolbar" : this._instance.config.cookieless_mode && this._instance.consent.isOptedOut() ? "consent_opted_out" : false === this.Oc ? "remote_config_failed" : K(this.Pc) ? this.Oc ? "disabled_in_project" : "remote_config_pending" : this.Pc ? X(this.je) || !this.je.token ? "missing_token" : null != v && v.__PosthogExtensions__ ? this.Ac ? "initializing" : this.Fc ? "load_failed" : "not_loaded" : "extensions_unavailable" : "disabled_in_project";
    }
    isVisible() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this._conversationsManager) ? void 0 : i3.isVisible()) && void 0 !== t3 && t3;
    }
    sendMessage(t3, i3, e3) {
      var r3 = this;
      return p((function* () {
        return r3._conversationsManager ? r3._conversationsManager.sendMessage(t3, i3, e3) : (Kh.warn(Jh), null);
      }))();
    }
    getMessages(t3, i3) {
      var e3 = this;
      return p((function* () {
        return e3._conversationsManager ? e3._conversationsManager.getMessages(t3, i3) : (Kh.warn(Jh), null);
      }))();
    }
    markAsRead(t3) {
      var i3 = this;
      return p((function* () {
        return i3._conversationsManager ? i3._conversationsManager.markAsRead(t3) : (Kh.warn(Jh), null);
      }))();
    }
    getTickets(t3) {
      var i3 = this;
      return p((function* () {
        return i3._conversationsManager ? i3._conversationsManager.getTickets(t3) : (Kh.warn(Jh), null);
      }))();
    }
    requestRestoreLink(t3) {
      var i3 = this;
      return p((function* () {
        return i3._conversationsManager ? i3._conversationsManager.requestRestoreLink(t3) : (Kh.warn(Jh), null);
      }))();
    }
    restoreFromToken(t3) {
      var i3 = this;
      return p((function* () {
        return i3._conversationsManager ? i3._conversationsManager.restoreFromToken(t3) : (Kh.warn(Jh), null);
      }))();
    }
    restoreFromUrlToken() {
      var t3 = this;
      return p((function* () {
        return t3._conversationsManager ? t3._conversationsManager.restoreFromUrlToken() : (Kh.warn(Jh), null);
      }))();
    }
    getCurrentTicketId() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this._conversationsManager) ? void 0 : i3.getCurrentTicketId()) && void 0 !== t3 ? t3 : null;
    }
    getWidgetSessionId() {
      var t3, i3;
      return null !== (t3 = null == (i3 = this._conversationsManager) ? void 0 : i3.getWidgetSessionId()) && void 0 !== t3 ? t3 : null;
    }
    bu() {
      var t3;
      null == (t3 = this._conversationsManager) || t3.setIdentity();
    }
    _u() {
      var t3;
      null == (t3 = this._conversationsManager) || t3.clearIdentity();
    }
  } };
  var cu = { logs: class {
    constructor(i3) {
      var e3, r3 = this;
      this.name = "logs", this.$c = false, this.Nc = false, this.qc = false, this.A = Be("[logs]"), this.jc = _({}, this.A, { error() {
        for (var t3 = arguments.length, i4 = new Array(t3), e4 = 0; t3 > e4; e4++) i4[e4] = arguments[e4];
        i4.some(iu) || r3.A.error(...i4);
      } }), this.po = [], this.Bc = [], this.fd = 0, this.Os = false, this.Hc = [], this.zc = [], this.Uc = false, this.Wc = false, this.Vc = () => {
        var t3, i4;
        this.Os || (this.fd = 0, null == (t3 = this.Gc) || t3.onReconnect(), null == (i4 = this.Zc) || i4.onReconnect());
      }, this._instance = i3, this._instance && null != (e3 = this._instance.config.logs) && e3.captureConsoleLogs && (this.$c = true), t && ms(t, "online", this.Vc);
    }
    Qc(t3, i3, e3, r3) {
      var s3, n3 = Yh(null == (s3 = this._instance) || null == (s3 = s3.config) ? void 0 : s3.logs, e3);
      return [new te(this.Jc(t3, i3), n3, this.jc, (() => this.Kc()), ((t4) => t4()), void 0, r3), n3];
    }
    Yc() {
      var t3, i3 = null == (t3 = this._instance) || null == (t3 = t3.config) ? void 0 : t3.logs;
      if (!this.Gc || this.Xc !== i3) {
        var e3;
        null == (e3 = this.Gc) || e3.reset(), this.Xc = i3;
        var r3 = this.Qc((() => this.po), ((t4) => {
          this.po = t4;
        }));
        this.Gc = r3[0], this.tf = r3[1];
      }
      return this.Gc;
    }
    ef() {
      var t3, i3 = null == (t3 = this._instance) || null == (t3 = t3.config) ? void 0 : t3.logs;
      if (!this.Zc || this.if !== i3) {
        var e3;
        null == (e3 = this.Zc) || e3.reset(), this.if = i3;
        var r3 = this.Qc((() => this.Bc), ((t4) => {
          this.Bc = t4;
        }), { serviceNameDefault: "posthog-browser-logs", consoleCapture: true }, Xh);
        this.Zc = r3[0], this.rf = r3[1];
      }
      return this.Zc;
    }
    setup(t3) {
      var i3;
      if (!this.Os) {
        this.Ns = t3, null != (i3 = this._instance) && null != (i3 = i3.config) && null != (i3 = i3.logs) && i3.captureConsoleLogs && (this.$c = true), (this.$c || this.nf() && this.sf()) && this.af();
        var e3 = false, r3 = t3.onRemoteConfig(((t4) => {
          var i4;
          e3 = t4.ok && true === (null == (i4 = t4.config.logs) ? void 0 : i4.captureConsoleLogs), this.onRemoteConfig(t4);
        }));
        this.Os ? r3.dispose() : (this.qs = r3, e3 || this.loadIfEnabled());
      }
    }
    dispose() {
      var i3, e3, r3, s3;
      this.Os || (this.Os = true, this.lf(), null == (i3 = this.qs) || i3.dispose(), this.qs = void 0, this.Ns = void 0, this.qc = false, null == t || t.removeEventListener("online", this.Vc), null == (e3 = this.uf) || e3.call(this), this.uf = void 0, null == (r3 = this.Gc) || r3.reset(), null == (s3 = this.Zc) || s3.reset());
    }
    onRemoteConfig(t3) {
      var i3, e3;
      if (!this.Os) {
        var r3 = t3.ok ? null == (i3 = t3.config.logs) ? void 0 : i3.captureConsoleLogs : void 0;
        X(r3) ? this.hf() : (null == (e3 = this._instance) || null == (e3 = e3.persistence) || e3.register({ [ar]: !!r3 }), r3 ? (this.$c = true, this.Nc || this.af(), this.loadIfEnabled()) : this.hf());
      }
    }
    reset() {
      var t3, i3, e3, r3;
      this.lf(), null == (t3 = this.Gc) || t3.clearQueue(), this.po = [], null == (i3 = this.Gc) || i3.reset(), null == (e3 = this.Zc) || e3.clearQueue(), this.Bc = [], null == (r3 = this.Zc) || r3.reset(), this.fd = 0;
    }
    captureLog(t3) {
      this.Os || this.Yc().captureLog(t3);
    }
    captureConsoleLog(t3) {
      this.Os || this.ef().captureLog(t3);
    }
    captureBufferedConsoleLog(t3, i3, e3) {
      this.Os || this.ef().captureLog(t3, { context: i3, occurredAtMs: e3 });
    }
    sf() {
      var t3;
      return !(null == (t3 = this._instance) || null == (t3 = t3.persistence) || null == (t3 = t3.props) || !t3[ar]);
    }
    nf() {
      var t3, i3;
      return null == (t3 = this._instance) || null == t3.do || !t3.do() || !(null == (i3 = v._POSTHOG_REMOTE_CONFIG) || null == (i3 = i3[this._instance.config.token]) || !i3.config);
    }
    ku() {
      var t3;
      this.lf(), null == (t3 = this.Zc) || t3.clearQueue(), this.Bc = [];
    }
    hf() {
      this.$c || this.lf();
    }
    af() {
      var t3, i3 = this;
      if (!this.Uc && null != v && v.console) {
        var e3 = Yh(null == (t3 = this._instance) || null == (t3 = t3.config) ? void 0 : t3.logs).maxBufferSize, r3 = function(t4) {
          var r4;
          try {
            r4 = ((t5) => {
              for (; null != (i4 = t5) && i4.__rrweb_original__; ) {
                var i4;
                t5 = t5.__rrweb_original__;
              }
              return t5;
            })(v.console[t4]);
          } catch (t5) {
            return 0;
          }
          if (!r4) return 0;
          i3.zc.push(th(v.console, t4, ((s4) => {
            var n3 = function() {
              for (var r5 = arguments.length, n4 = new Array(r5), o3 = 0; r5 > o3; o3++) n4[o3] = arguments[o3];
              try {
                i3.df(t4, n4, e3);
              } catch (t5) {
              }
              return s4.apply(v.console, n4);
            };
            return n3.__rrweb_original__ = r4, n3;
          })));
        };
        for (var s3 of Qh) r3(s3);
        this.Uc = true, this.vf = setTimeout((() => {
          this.lf();
        }), 3e4);
      }
    }
    df(t3, i3, e3) {
      var r3;
      if (this.Uc && !this.Wc && 0 !== i3.length) if (null != (r3 = this._instance) && r3.is_capturing()) {
        if (e3 > this.Hc.length) {
          this.Wc = true;
          try {
            this.Hc.push({ level: t3, args: i3, occurredAtMs: Date.now(), context: this.Kc() });
          } finally {
            this.Wc = false;
          }
        }
      } else this.lf();
    }
    lf() {
      if (this.Hc = [], this.Uc) {
        for (var t3 of (this.Uc = false, this.vf && (clearTimeout(this.vf), this.vf = void 0), this.zc)) t3();
        this.zc = [];
      }
    }
    cf() {
      var t3 = this.Hc;
      return this.lf(), t3;
    }
    get logger() {
      return this.ff || (this.ff = { trace: (t3, i3) => this.captureLog({ body: t3, level: "trace", attributes: i3 }), debug: (t3, i3) => this.captureLog({ body: t3, level: "debug", attributes: i3 }), info: (t3, i3) => this.captureLog({ body: t3, level: "info", attributes: i3 }), warn: (t3, i3) => this.captureLog({ body: t3, level: "warn", attributes: i3 }), error: (t3, i3) => this.captureLog({ body: t3, level: "error", attributes: i3 }), fatal: (t3, i3) => this.captureLog({ body: t3, level: "fatal", attributes: i3 }) }), this.ff;
    }
    flushLogs(t3) {
      t3 ? this.pf(t3) : (this.Gc && this.Gc.flush().catch(((t4) => this.gf(t4))), this.Zc && this.Zc.flush().catch(((t4) => this.gf(t4))));
    }
    gf(t3) {
      iu(t3) || this.A.error("PostHog logs flush failed:", t3);
    }
    loadIfEnabled() {
      if (!this.Os && this.$c && !this.Nc && !this.qc) {
        var t3 = null == v ? void 0 : v.__PosthogExtensions__;
        if (!t3) return this.A.error("PostHog Extensions not found."), void this.lf();
        var i3 = t3.loadExternalDependency;
        if (!i3) return this.A.error(Qr), void this.lf();
        this.qc = true;
        try {
          i3(this._instance, "logs", ((i4) => {
            if (this.qc = false, !this.Os && this.$c) {
              var e3 = t3.logs;
              if (i4 || null == e3 || !e3.initializeLogs) this.A.error("Could not load logs script", i4), this.lf();
              else {
                var r3, s3, n3 = this.cf();
                this.uf = e3.initializeLogs(null !== (r3 = this.Ns) && void 0 !== r3 ? r3 : this._instance), this.Nc = true, n3.length > 0 && (null == e3.replayConsoleBuffer || e3.replayConsoleBuffer(null !== (s3 = this.Ns) && void 0 !== s3 ? s3 : this._instance, n3));
              }
            }
          }));
        } catch (t4) {
          throw this.qc = false, t4;
        }
      }
    }
    Jc(t3, i3) {
      var e3 = this._instance;
      return { get isDisabled() {
        return false;
      }, get optedOut() {
        return !e3.is_capturing();
      }, getPersistedProperty: (i4) => i4 === S.LogsQueue ? t3() : void 0, setPersistedProperty(t4, e4) {
        var r3;
        t4 === S.LogsQueue && i3(null !== (r3 = e4) && void 0 !== r3 ? r3 : []);
      }, os: (t4) => this.os(t4), getLibraryId: () => c.LIB_NAME, getLibraryVersion: () => c.LIB_VERSION };
    }
    os(t3) {
      return new Promise(((i3) => {
        if (ro(this.fd, 3)) i3({ kind: "fatal", error: tu(void 0, "logs endpoint is unreachable, dropping batch") });
        else {
          var e3 = false, r3 = (t4) => {
            e3 || (e3 = true, clearTimeout(s3), i3(t4));
          }, s3 = setTimeout((() => {
            this.A.warn("Logs request timed out before receiving a response"), r3({ kind: "retry-later", error: tu(void 0, "logs request timed out") });
          }), 9e4);
          this._instance._send_request({ method: "POST", url: this.mf(), data: t3, compression: "best-available", batchKey: "logs", fireCallbackOnDrop: true, callback: (t4) => {
            var i4 = t4.statusCode;
            if (this.yf(i4), i4 >= 200 && 300 > i4) r3({ kind: "ok" });
            else if (413 === i4) r3({ kind: "too-large" });
            else if (0 !== i4 && 408 !== i4 && 429 !== i4 && 500 > i4) r3({ kind: "fatal", error: new Error("logs request failed with status " + i4) });
            else {
              var e4;
              0 === i4 ? (t4.error || this.A.warn("Logs request failed before receiving an HTTP response"), r3({ kind: "retry-later", error: tu(t4.error, "logs request failed before receiving an HTTP response") })) : r3({ kind: "retry-later", error: null !== (e4 = t4.error) && void 0 !== e4 ? e4 : new Error("logs request failed with status " + i4) });
            }
          } });
        }
      }));
    }
    yf(t3) {
      (0 !== t3 || this._instance.__loaded) && (this.fd = so(t3, this.fd, 3, (() => this.A.warn("Log requests are failing before receiving an HTTP response; this can happen due to network issues, CORS, browser blocking, or ad blockers. Stopped sending logs; will try again when connectivity changes."))));
    }
    pf(t3) {
      this.po.length > 0 && this.bf(t3, this.po, this.tf, c.LIB_NAME, ((t4) => {
        this.po = t4;
      })), this.Bc.length > 0 && this.bf(t3, this.Bc, this.rf, Xh, ((t4) => {
        this.Bc = t4;
      }));
    }
    bf(t3, i3, e3, r3, s3) {
      if (0 !== i3.length) {
        var n3 = i3.map(((t4) => t4.record));
        s3([]);
        var o3 = Zi(n3, Xi(e3, c.LIB_NAME, c.LIB_VERSION), r3, c.LIB_VERSION);
        this._instance._send_request({ method: "POST", url: this.mf(), data: o3, compression: "best-available", batchKey: "logs", transport: t3 });
      }
    }
    mf() {
      return this._instance.requestRouter.endpointFor("api", "/i/v1/logs") + "?token=" + encodeURIComponent(this._instance.config.token);
    }
    Kc() {
      var t3, i3 = {};
      if (i3.distinctId = this._instance.get_distinct_id(), this._instance.sessionManager) {
        var e3 = this._instance.sessionManager.checkAndGetSessionAndWindowId(true), r3 = e3.windowId, s3 = e3.sessionStartTimestamp, n3 = e3.lastActivityTimestamp;
        i3.sessionId = e3.sessionId, i3.windowId = r3, X(s3) || (i3.sessionStartTimestamp = s3), X(n3) || (i3.lastActivityTimestamp = n3);
      }
      if (null != v && null != (t3 = v.location) && t3.href && (i3.currentUrl = this._instance.config.disable_capture_url_hashes ? $i(v.location.href) : v.location.href), this._instance.featureFlags) {
        var o3 = this._instance.featureFlags.getFlags();
        o3 && o3.length > 0 && (i3.activeFeatureFlags = o3);
      }
      return i3;
    }
  } };
  var fu = { metrics: class {
    constructor(t3) {
      this.A = Be("[metrics]"), this._instance = t3;
    }
    initialize() {
    }
    Yc() {
      var t3, i3, e3 = null == (t3 = this._instance) || null == (t3 = t3.config) ? void 0 : t3.metrics;
      return this.Gc && this.Xc === e3 || (null == (i3 = this.Gc) || i3.reset(), this.Xc = e3, this.Gc = new se(this.Jc(), (function(t4) {
        var i4, e4, r3, s3, n3, o3 = null == t4 ? void 0 : t4.resourceAttributes;
        return { serviceName: null !== (i4 = null == o3 ? void 0 : o3["service.name"]) && void 0 !== i4 ? i4 : null == t4 ? void 0 : t4.serviceName, serviceVersion: null !== (e4 = null == o3 ? void 0 : o3["service.version"]) && void 0 !== e4 ? e4 : null == t4 ? void 0 : t4.serviceVersion, environment: null !== (r3 = null == o3 ? void 0 : o3["deployment.environment"]) && void 0 !== r3 ? r3 : null == t4 ? void 0 : t4.environment, resourceAttributes: o3, beforeSend: null == t4 ? void 0 : t4.beforeSend, flushIntervalMs: null !== (s3 = null == t4 ? void 0 : t4.flushIntervalMs) && void 0 !== s3 ? s3 : 1e4, maxSeriesPerFlush: null !== (n3 = null == t4 ? void 0 : t4.maxSeriesPerFlush) && void 0 !== n3 ? n3 : 1e3 };
      })(e3), this.A)), this.Gc;
    }
    count(t3, i3, e3) {
      void 0 === i3 && (i3 = 1), this.Yc().count(t3, i3, e3);
    }
    gauge(t3, i3, e3) {
      this.Yc().gauge(t3, i3, e3);
    }
    histogram(t3, i3, e3) {
      this.Yc().histogram(t3, i3, e3);
    }
    flush(t3) {
      if (!this.Gc) return Promise.resolve();
      if (t3) {
        var i3 = this.Gc.drainWindow();
        return i3 && this.xs(i3, t3), Promise.resolve();
      }
      return this.Gc.flush().catch(((t4) => this.A.error("PostHog metrics flush failed:", t4)));
    }
    reset() {
      var t3;
      null == (t3 = this.Gc) || t3.reset();
    }
    Jc() {
      var t3 = this._instance, i3 = this;
      return { get isDisabled() {
        return false;
      }, get optedOut() {
        return !t3.is_capturing();
      }, xs: (t4) => i3.xs(t4), getLibraryId: () => c.LIB_NAME, getLibraryVersion: () => c.LIB_VERSION };
    }
    xs(t3, i3) {
      return new Promise(((e3) => {
        var r3 = false, s3 = (t4) => {
          r3 || (r3 = true, clearTimeout(n3), e3(t4));
        }, n3 = setTimeout((() => s3({ kind: "retry-later", error: new Error("metrics request timed out") })), 9e4);
        this._instance._send_request(_({ method: "POST", url: this._f(), data: t3, compression: "best-available", batchKey: "metrics" }, i3 && { transport: i3 }, { fireCallbackOnDrop: true, callback(t4) {
          var i4 = t4.statusCode;
          if (i4 >= 200 && 300 > i4) s3({ kind: "ok" });
          else if (413 === i4) s3({ kind: "too-large" });
          else if (0 !== i4 && 408 !== i4 && 429 !== i4 && 500 > i4) s3({ kind: "fatal", error: new Error("metrics request failed with status " + i4) });
          else {
            var e4;
            s3({ kind: "retry-later", error: null !== (e4 = t4.error) && void 0 !== e4 ? e4 : new Error("metrics request failed with status " + i4) });
          }
        } }));
      }));
    }
    _f() {
      return this._instance.requestRouter.endpointFor("api", "/i/v1/metrics") + "?token=" + encodeURIComponent(this._instance.config.token);
    }
  } };
  var pu = _({}, eu, ru, su, nu, ou, au, hu, lu, uu, du, vu, cu, fu);
  zl.__defaultExtensionClasses = _({}, pu);
  var _u = (function() {
    c.SDK_DIST_CHANNEL = "npm";
    var i3 = $l[Ml] = new zl();
    return (function() {
      function i4() {
        i4.done || (i4.done = true, Dl = false, us($l, (function(t3) {
          t3._dom_loaded();
        })));
      }
      null != r && r.addEventListener ? "complete" === r.readyState ? i4() : ms(r, "DOMContentLoaded", i4, { capture: false }) : t && Ue.error("Browser doesn't support `document.addEventListener` so PostHog couldn't be initialized");
    })(), i3;
  })();

  // src/telemetry.ts
  var TelemetryBuffer = class {
    // how many slots are filled
    constructor(capacity = 50) {
      this.capacity = capacity;
      this.slots = new Array(capacity).fill(null);
    }
    capacity;
    slots;
    head = 0;
    // next write position
    size = 0;
    push(event) {
      this.slots[this.head] = event;
      this.head = (this.head + 1) % this.capacity;
      if (this.size < this.capacity) this.size++;
    }
    /**
     * Returns events in chronological order (oldest first).
     */
    all() {
      if (this.size === 0) return [];
      const start = this.size < this.capacity ? 0 : this.head;
      const out = [];
      for (let i3 = 0; i3 < this.size; i3++) {
        const item = this.slots[(start + i3) % this.capacity];
        if (item) out.push(item);
      }
      return out;
    }
    /**
     * Returns the N most recent events (newest first).
     */
    recent(n3 = 20) {
      return this.all().slice(-n3).reverse();
    }
    clear() {
      this.slots.fill(null);
      this.head = 0;
      this.size = 0;
    }
  };
  var WidgetTelemetry = class {
    buffer;
    ph = null;
    started = false;
    constructor(bufferCapacity = 50) {
      this.buffer = new TelemetryBuffer(bufferCapacity);
    }
    /**
     * Initialise PostHog and start capturing.
     * Safe to call multiple times — only runs once.
     */
    init(config = {}) {
      if (this.started || typeof window === "undefined") return;
      this.started = true;
      const token = config.posthogApiKey ?? "phc_placeholder_local_only";
      const host = config.posthogHost ?? "https://us.i.posthog.com";
      const cloudEnabled = Boolean(config.posthogApiKey);
      try {
        this.ph = _u.init(
          token,
          {
            api_host: host,
            defaults: "2026-05-30",
            // Keep identity in memory only — we're an embedded widget on a
            // host page that has its own storage strategy.
            persistence: "memory",
            // ── Capture features ──────────────────────────────────────────
            // Turn everything on. PostHog handles the actual detection logic;
            // we just store what it finds.
            autocapture: true,
            rageclick: true,
            capture_dead_clicks: true,
            capture_pageview: "history_change",
            capture_exceptions: true,
            // ── Session replay ────────────────────────────────────────────
            // Only enable if the site owner provided a real project token.
            // Without a key, replays would be recorded for nothing and
            // there'd be nowhere to view them.
            disable_session_recording: !cloudEnabled,
            // ── Lifecycle hook ────────────────────────────────────────────
            // Every assembled event passes through here. We push it into the
            // ring buffer and call the optional onEvent callback.
            // Returning null when cloudEnabled=false stops any network call.
            before_send: (event) => {
              if (event) {
                this.buffer.push(event);
                config.onEvent?.(event);
              }
              return cloudEnabled ? event : null;
            }
          },
          // Unique PostHog instance name so we don't collide with any
          // PostHog the host page may already have initialised.
          "cradle_widget"
        ) ?? null;
      } catch (err) {
        console.warn("[cradle] telemetry init failed", err);
      }
    }
    // ─── Accessors ─────────────────────────────────────────────────────────────
    /** The underlying PostHog instance, if initialised. */
    get posthog() {
      return this.ph;
    }
    /**
     * PostHog session ID for the current session.
     * Useful for linking this widget session to a backend LLM trace.
     */
    sessionId() {
      return this.ph?.get_session_id();
    }
    /**
     * Direct URL to this session's replay in PostHog cloud.
     * Only meaningful when a real project token was provided.
     */
    sessionReplayUrl() {
      return this.ph?.get_session_replay_url?.();
    }
    // ─── Lifecycle ─────────────────────────────────────────────────────────────
    /** Clear the event buffer. Does not stop capture. */
    clearBuffer() {
      this.buffer.clear();
    }
    /** Stop and fully reset. Mostly useful in tests. */
    destroy() {
      this.clearBuffer();
      this.started = false;
      this.ph = null;
    }
  };
  var globalTelemetry = new WidgetTelemetry();

  // ../../node_modules/.pnpm/driver.js@1.8.0/node_modules/driver.js/dist/driver.js.mjs
  var e2 = [`pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`];
  var t2 = /* @__PURE__ */ new WeakMap();
  function n2(n3, i3, a3) {
    r2(n3);
    let o3 = (e3) => {
      let t3 = e3.target;
      n3.contains(t3) && ((!a3 || a3(t3)) && (e3.preventDefault(), e3.stopPropagation(), e3.stopImmediatePropagation()), e3.type === `click` && i3?.(e3));
    };
    for (let t3 of e2) document.addEventListener(t3, o3, true);
    t2.set(n3, o3);
  }
  function r2(n3) {
    let r3 = t2.get(n3);
    if (r3) {
      for (let t3 of e2) document.removeEventListener(t3, r3, true);
      t2.delete(n3);
    }
  }
  function i2(e3, t3) {
    let n3 = e3.wrapper.getBoundingClientRect();
    return { width: n3.width + t3, height: n3.height + t3, realWidth: n3.width, realHeight: n3.height };
  }
  function a2(e3, t3) {
    let { elementDimensions: n3, popoverDimensions: r3, popoverPadding: i3, popoverArrowDimensions: a3 } = t3;
    return e3 === `start` ? Math.max(Math.min(n3.top - i3, window.innerHeight - r3.realHeight - a3.width), a3.width) : e3 === `end` ? Math.max(Math.min(n3.top - r3?.realHeight + n3.height + i3, window.innerHeight - r3?.realHeight - a3.width), a3.width) : e3 === `center` ? Math.max(Math.min(n3.top + n3.height / 2 - r3?.realHeight / 2, window.innerHeight - r3?.realHeight - a3.width), a3.width) : 0;
  }
  function o2(e3, t3) {
    let { elementDimensions: n3, popoverDimensions: r3, popoverPadding: i3, popoverArrowDimensions: a3 } = t3;
    return e3 === `start` ? Math.max(Math.min(n3.left - i3, window.innerWidth - r3.realWidth - a3.width), a3.width) : e3 === `end` ? Math.max(Math.min(n3.left - r3?.realWidth + n3.width + i3, window.innerWidth - r3?.realWidth - a3.width), a3.width) : e3 === `center` ? Math.max(Math.min(n3.left + n3.width / 2 - r3?.realWidth / 2, window.innerWidth - r3?.realWidth - a3.width), a3.width) : 0;
  }
  function s2(e3, t3, n3) {
    let { align: r3, side: s3 } = n3, c3 = n3.centered ? `over` : s3, l3 = n3.padding, u3 = i2(e3, n3.offset), f3 = e3.arrow.getBoundingClientRect(), p3 = t3.getBoundingClientRect(), m3 = p3.top - u3.height, h3 = m3 >= 0, g3 = window.innerHeight - (p3.bottom + u3.height), _3 = g3 >= 0, v3 = p3.left - u3.width, y3 = v3 >= 0, b3 = window.innerWidth - (p3.right + u3.width), x3 = b3 >= 0, S3 = !h3 && !_3 && !y3 && !x3, C3 = c3;
    if (c3 === `top` && h3 ? x3 = y3 = _3 = false : c3 === `bottom` && _3 ? x3 = y3 = h3 = false : c3 === `left` && y3 ? x3 = h3 = _3 = false : c3 === `right` && x3 && (y3 = h3 = _3 = false), c3 === `over`) {
      let t4 = window.innerWidth / 2 - u3.realWidth / 2, n4 = window.innerHeight / 2 - u3.realHeight / 2;
      e3.wrapper.style.left = `${t4}px`, e3.wrapper.style.right = `auto`, e3.wrapper.style.top = `${n4}px`, e3.wrapper.style.bottom = `auto`;
    } else if (S3) {
      let t4 = window.innerWidth / 2 - u3?.realWidth / 2;
      e3.wrapper.style.left = `${t4}px`, e3.wrapper.style.right = `auto`, e3.wrapper.style.bottom = `10px`, e3.wrapper.style.top = `auto`;
    } else if (y3) {
      let t4 = Math.min(v3, window.innerWidth - u3?.realWidth - f3.width), n4 = a2(r3, { elementDimensions: p3, popoverDimensions: u3, popoverPadding: l3, popoverArrowDimensions: f3 });
      e3.wrapper.style.left = `${t4}px`, e3.wrapper.style.top = `${n4}px`, e3.wrapper.style.bottom = `auto`, e3.wrapper.style.right = `auto`, C3 = `left`;
    } else if (x3) {
      let t4 = Math.min(b3, window.innerWidth - u3?.realWidth - f3.width), n4 = a2(r3, { elementDimensions: p3, popoverDimensions: u3, popoverPadding: l3, popoverArrowDimensions: f3 });
      e3.wrapper.style.right = `${t4}px`, e3.wrapper.style.top = `${n4}px`, e3.wrapper.style.bottom = `auto`, e3.wrapper.style.left = `auto`, C3 = `right`;
    } else if (h3) {
      let t4 = Math.min(m3, window.innerHeight - u3.realHeight - f3.width), n4 = o2(r3, { elementDimensions: p3, popoverDimensions: u3, popoverPadding: l3, popoverArrowDimensions: f3 });
      e3.wrapper.style.top = `${t4}px`, e3.wrapper.style.left = `${n4}px`, e3.wrapper.style.bottom = `auto`, e3.wrapper.style.right = `auto`, C3 = `top`;
    } else if (_3) {
      let t4 = Math.min(g3, window.innerHeight - u3?.realHeight - f3.width), n4 = o2(r3, { elementDimensions: p3, popoverDimensions: u3, popoverPadding: l3, popoverArrowDimensions: f3 });
      e3.wrapper.style.left = `${n4}px`, e3.wrapper.style.bottom = `${t4}px`, e3.wrapper.style.top = `auto`, e3.wrapper.style.right = `auto`, C3 = `bottom`;
    }
    d2(e3, S3 ? `over` : C3, r3, t3), [...e3.wrapper.classList].filter((e4) => e4.startsWith(`driver-popover-side-`) || e4.startsWith(`driver-popover-align-`)).forEach((t4) => e3.wrapper.classList.remove(t4)), e3.wrapper.classList.add(`driver-popover-side-${C3}`), e3.wrapper.classList.add(`driver-popover-align-${r3}`);
  }
  function c2(e3, t3, n3, r3, i3, a3 = 10) {
    let o3 = r3 - n3;
    return e3 <= n3 && t3 >= r3 ? i3 === `start` ? 15 + a3 / 2 : i3 === `end` ? o3 - 15 - a3 / 2 : o3 / 2 : (Math.min(Math.max(e3, n3), r3) + Math.min(Math.max(t3, n3), r3)) / 2 - n3;
  }
  function l2(e3, t3, n3 = 10) {
    let r3 = t3 - 15 - n3;
    if (r3 < 15) return Math.max(0, (t3 - n3) / 2);
    let i3 = e3 - n3 / 2;
    return Math.min(Math.max(i3, 15), r3);
  }
  function u2(e3, t3, n3) {
    return e3 === `left` || e3 === `right` ? t3.bottom > n3.top && t3.top < n3.bottom ? e3 : t3.bottom <= n3.top ? `bottom` : `top` : t3.right > n3.left && t3.left < n3.right ? e3 : t3.right <= n3.left ? `right` : `left`;
  }
  function d2(e3, t3, n3, r3) {
    let i3 = e3.arrow;
    if (i3.className = `driver-popover-arrow`, i3.style.top = ``, i3.style.right = ``, i3.style.bottom = ``, i3.style.left = ``, t3 === `over`) {
      i3.classList.add(`driver-popover-arrow-none`);
      return;
    }
    let a3 = r3.getBoundingClientRect(), o3 = e3.wrapper.getBoundingClientRect(), s3 = u2(t3, a3, o3);
    i3.classList.add(`driver-popover-arrow-side-${s3}`);
    let d3 = i3.getBoundingClientRect().width || 10;
    if (s3 === `left` || s3 === `right`) {
      let e4 = c2(a3.top, a3.bottom, o3.top, o3.bottom, n3, d3);
      i3.style.top = `${l2(e4, o3.height, d3)}px`;
    } else {
      let e4 = c2(a3.left, a3.right, o3.left, o3.right, n3, d3);
      i3.style.left = `${l2(e4, o3.width, d3)}px`;
    }
  }
  function f2(e3) {
    return typeof e3 == `function` ? e3() : typeof e3 == `string` ? document.querySelector(e3) : e3;
  }
  function p2(e3) {
    let t3 = window.getComputedStyle(e3);
    return [t3.overflow, t3.overflowX, t3.overflowY].some((e4) => e4 === `auto` || e4 === `scroll`);
  }
  function m2(e3, t3, n3, r3) {
    return (e3 /= r3 / 2) < 1 ? n3 / 2 * e3 * e3 + t3 : -n3 / 2 * (--e3 * (e3 - 2) - 1) + t3;
  }
  function h2(e3) {
    let t3 = `a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])`;
    return e3.flatMap((e4) => {
      let n3 = e4.matches(t3), r3 = Array.from(e4.querySelectorAll(t3));
      return [...n3 ? [e4] : [], ...r3];
    }).filter((e4) => getComputedStyle(e4).pointerEvents !== `none` && y2(e4));
  }
  function g2(e3, t3) {
    if (!e3 || v2(e3)) return;
    let n3 = e3.offsetHeight > window.innerHeight;
    e3.scrollIntoView({ behavior: !t3 || _2(e3) ? `auto` : `smooth`, inline: `center`, block: n3 ? `start` : `center` });
  }
  function _2(e3) {
    if (!e3 || !e3.parentElement) return;
    let t3 = e3.parentElement;
    return t3.scrollHeight > t3.clientHeight;
  }
  function v2(e3) {
    let t3 = e3.getBoundingClientRect();
    return t3.top >= 0 && t3.left >= 0 && t3.bottom <= (window.innerHeight || document.documentElement.clientHeight) && t3.right <= (window.innerWidth || document.documentElement.clientWidth);
  }
  function y2(e3) {
    return !!(e3.offsetWidth || e3.offsetHeight || e3.getClientRects().length);
  }
  function b2(e3) {
    e3 && (e3.wrapper.style.display = `none`);
  }
  function x2(e3, t3) {
    let r3 = C2();
    document.body.appendChild(r3.wrapper);
    let { title: i3, description: a3, showButtons: o3, disableButtons: c3, showProgress: l3, nextBtnText: u3, prevBtnText: d3, progressText: f3 } = t3;
    r3.nextButton.innerHTML = u3, r3.previousButton.innerHTML = d3, r3.progress.innerHTML = f3, t3.doneButton && r3.nextButton.classList.add(`driver-popover-done-btn`), i3 ? (r3.title.innerHTML = i3, r3.title.style.display = `block`) : r3.title.style.display = `none`, a3 ? (r3.description.innerHTML = a3, r3.description.style.display = `block`) : r3.description.style.display = `none`;
    let p3 = o3.includes(`next`) || o3.includes(`previous`) || l3;
    r3.closeButton.style.display = o3.includes(`close`) ? `block` : `none`, p3 ? (r3.footer.style.display = `flex`, r3.progress.style.display = l3 ? `block` : `none`, r3.nextButton.style.display = o3.includes(`next`) ? `block` : `none`, r3.previousButton.style.display = o3.includes(`previous`) ? `block` : `none`) : r3.footer.style.display = `none`, c3.includes(`next`) && (r3.nextButton.disabled = true, r3.nextButton.classList.add(`driver-popover-btn-disabled`)), c3.includes(`previous`) && (r3.previousButton.disabled = true, r3.previousButton.classList.add(`driver-popover-btn-disabled`)), c3.includes(`close`) && (r3.closeButton.disabled = true, r3.closeButton.classList.add(`driver-popover-btn-disabled`));
    let m3 = r3.wrapper;
    m3.style.display = `block`, m3.style.left = ``, m3.style.top = ``, m3.style.bottom = ``, m3.style.right = ``, m3.id = `driver-popover-content`, m3.setAttribute(`role`, `dialog`), m3.setAttribute(`aria-labelledby`, `driver-popover-title`), m3.setAttribute(`aria-describedby`, `driver-popover-description`);
    let _3 = r3.arrow;
    _3.className = `driver-popover-arrow`, m3.className = `driver-popover ${t3.popoverClass || ``}`.trim(), n2(r3.wrapper, (e4) => {
      let n3 = e4.target;
      if (n3.closest(`.driver-popover-next-btn`)) return t3.onNextClick?.();
      if (n3.closest(`.driver-popover-prev-btn`)) return t3.onPrevClick?.();
      if (n3.closest(`.driver-popover-close-btn`)) return t3.onCloseClick?.();
    }, (e4) => r3.description.contains(e4) || r3.title.contains(e4) ? false : !!e4.closest(`.driver-popover-prev-btn, .driver-popover-next-btn, .driver-popover-close-btn`)), t3.onRender?.(r3), s2(r3, e3, t3.position), S2(r3, e3, t3.position), g2(m3, t3.smoothScroll);
    let v3 = h2([m3, e3]);
    return v3.length > 0 && v3[0].focus(), r3;
  }
  function S2(e3, t3, n3) {
    e3.wrapper.querySelectorAll(`img`).forEach((r3) => {
      if (r3.complete) return;
      let i3 = () => s2(e3, t3, n3);
      r3.addEventListener(`load`, i3, { once: true }), r3.addEventListener(`error`, i3, { once: true });
    });
  }
  function C2() {
    let e3 = document.createElement(`div`);
    e3.classList.add(`driver-popover`);
    let t3 = document.createElement(`div`);
    t3.classList.add(`driver-popover-arrow`);
    let n3 = document.createElement(`header`);
    n3.id = `driver-popover-title`, n3.classList.add(`driver-popover-title`), n3.style.display = `none`, n3.innerText = `Popover Title`;
    let r3 = document.createElement(`div`);
    r3.id = `driver-popover-description`, r3.classList.add(`driver-popover-description`), r3.style.display = `none`, r3.innerText = `Popover description is here`;
    let i3 = document.createElement(`button`);
    i3.type = `button`, i3.classList.add(`driver-popover-close-btn`), i3.setAttribute(`aria-label`, `Close`), i3.innerHTML = `&times;`;
    let a3 = document.createElement(`footer`);
    a3.classList.add(`driver-popover-footer`);
    let o3 = document.createElement(`span`);
    o3.classList.add(`driver-popover-progress-text`), o3.innerText = ``;
    let s3 = document.createElement(`span`);
    s3.classList.add(`driver-popover-navigation-btns`);
    let c3 = document.createElement(`button`);
    c3.type = `button`, c3.classList.add(`driver-popover-prev-btn`, `driver-popover-footer-btn`), c3.innerHTML = `Previous`;
    let l3 = document.createElement(`button`);
    return l3.type = `button`, l3.classList.add(`driver-popover-next-btn`, `driver-popover-footer-btn`), l3.innerHTML = `Next`, s3.appendChild(c3), s3.appendChild(l3), a3.appendChild(o3), a3.appendChild(s3), e3.appendChild(i3), e3.appendChild(t3), e3.appendChild(n3), e3.appendChild(r3), e3.appendChild(a3), { wrapper: e3, arrow: t3, title: n3, description: r3, footer: a3, previousButton: c3, nextButton: l3, closeButton: i3, footerButtons: s3, progress: o3 };
  }
  function w2(e3) {
    e3 && (r2(e3.wrapper), e3.wrapper.parentElement?.removeChild(e3.wrapper));
  }
  function T2(e3, t3) {
    let n3 = window.innerWidth, r3 = window.innerHeight, i3 = t3.padding, a3 = t3.radius, o3 = e3.width + i3 * 2, s3 = e3.height + i3 * 2, c3 = Math.min(a3, o3 / 2, s3 / 2), l3 = Math.floor(Math.max(c3, 0)), u3 = e3.x - i3 + l3, d3 = e3.y - i3, f3 = o3 - l3 * 2, p3 = s3 - l3 * 2;
    return `M${n3},0L0,0L0,${r3}L${n3},${r3}L${n3},0Z
    M${u3},${d3} h${f3} a${l3},${l3} 0 0 1 ${l3},${l3} v${p3} a${l3},${l3} 0 0 1 -${l3},${l3} h-${f3} a${l3},${l3} 0 0 1 -${l3},-${l3} v-${p3} a${l3},${l3} 0 0 1 ${l3},-${l3} z`;
  }
  function E2(e3, t3, n3, r3, i3) {
    let a3 = e3.getState(`__activeStagePosition`), o3 = a3 || r3.getBoundingClientRect(), s3 = i3.getBoundingClientRect();
    a3 = { x: m2(t3, o3.x, s3.x - o3.x, n3), y: m2(t3, o3.y, s3.y - o3.y, n3), width: m2(t3, o3.width, s3.width - o3.width, n3), height: m2(t3, o3.height, s3.height - o3.height, n3) }, A2(e3, a3), e3.setState(`__activeStagePosition`, a3);
  }
  function D2(e3, t3) {
    if (!t3) return;
    let n3 = t3.getBoundingClientRect(), r3 = { x: n3.x, y: n3.y, width: n3.width, height: n3.height };
    e3.setState(`__activeStagePosition`, r3), A2(e3, r3);
  }
  function O2(e3) {
    let t3 = e3.getState(`__activeStagePosition`), n3 = e3.getState(`__overlaySvg`);
    if (!t3) return;
    if (!n3) {
      console.warn(`No stage svg found.`);
      return;
    }
    let r3 = window.innerWidth, i3 = window.innerHeight;
    n3.setAttribute(`viewBox`, `0 0 ${r3} ${i3}`);
  }
  function k2(e3, t3) {
    let r3 = M2(e3, t3);
    document.body.appendChild(r3), n2(r3, (t4) => {
      t4.target.tagName === `path` && e3.emit(`overlayClick`);
    }), e3.setState(`__overlaySvg`, r3);
  }
  function A2(e3, t3) {
    let n3 = e3.getState(`__overlaySvg`);
    if (!n3) {
      k2(e3, t3);
      return;
    }
    let r3 = n3.firstElementChild;
    if (r3?.tagName !== `path`) throw Error(`no path element found in stage svg`);
    r3.setAttribute(`d`, T2(t3, j2(e3)));
  }
  function j2(e3) {
    return { padding: e3.getConfig(`stagePadding`) || 0, radius: e3.getConfig(`stageRadius`) || 0 };
  }
  function M2(e3, t3) {
    let n3 = window.innerWidth, r3 = window.innerHeight, i3 = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
    i3.classList.add(`driver-overlay`, `driver-overlay-animated`), i3.setAttribute(`viewBox`, `0 0 ${n3} ${r3}`), i3.setAttribute(`xmlSpace`, `preserve`), i3.setAttribute(`xmlnsXlink`, `http://www.w3.org/1999/xlink`), i3.setAttribute(`version`, `1.1`), i3.setAttribute(`preserveAspectRatio`, `xMinYMin slice`), i3.style.fillRule = `evenodd`, i3.style.clipRule = `evenodd`, i3.style.strokeLinejoin = `round`, i3.style.strokeMiterlimit = `2`, i3.style.zIndex = `10000`, i3.style.position = `fixed`, i3.style.top = `0`, i3.style.left = `0`, i3.style.width = `100%`, i3.style.height = `100%`;
    let a3 = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
    return a3.setAttribute(`d`, T2(t3, j2(e3))), a3.style.fill = e3.getConfig(`overlayColor`) || `rgb(0,0,0)`, a3.style.opacity = `${e3.getConfig(`overlayOpacity`)}`, a3.style.pointerEvents = `auto`, a3.style.cursor = `auto`, i3.appendChild(a3), i3;
  }
  function N2(e3) {
    let t3 = e3.getState(`__overlaySvg`);
    t3 && (r2(t3), t3.remove());
  }
  var P2 = `{{current}} of {{total}}`;
  function F2(e3, t3) {
    return !(t3.skipMissingElement ?? e3.getConfig(`skipMissingElement`)) || !t3.element ? false : !f2(t3.element);
  }
  function I2(e3, t3, n3) {
    let r3 = e3.getConfig(`steps`) || [];
    for (let i3 = t3; i3 >= 0 && i3 < r3.length; i3 += n3) if (!F2(e3, r3[i3])) return i3;
  }
  function L2(e3, t3) {
    let n3 = e3.getState(`activeIndex`), r3 = n3 !== void 0 && I2(e3, n3 + 1, 1) === void 0, i3 = t3?.popover?.onDoneClick || e3.getConfig(`onDoneClick`);
    return r3 && i3 ? i3 : t3?.popover?.onNextClick || e3.getConfig(`onNextClick`);
  }
  function R2(e3, t3) {
    return t3?.popover?.onPrevClick || e3.getConfig(`onPrevClick`);
  }
  function z2(e3, t3) {
    return t3?.popover?.onCloseClick || e3.getConfig(`onCloseClick`);
  }
  function B2(e3, t3, n3) {
    let r3 = e3.getConfig(`steps`) || [], i3 = r3[t3], a3 = i3.popover || {}, o3 = I2(e3, t3 + 1, 1) !== void 0, s3 = I2(e3, t3 - 1, -1) !== void 0, c3 = a3.doneBtnText || e3.getConfig(`doneBtnText`) || `Done`, l3 = e3.getConfig(`allowClose`), u3 = a3.showProgress === void 0 ? e3.getConfig(`showProgress`) : a3.showProgress, d3 = (a3.progressText || e3.getConfig(`progressText`) || P2).replace(`{{current}}`, `${t3 + 1}`).replace(`{{total}}`, `${r3.length}`), f3 = a3.showButtons || e3.getConfig(`showButtons`), p3 = [`next`, `previous`, ...l3 ? [`close`] : []].filter((e4) => !f3?.length || f3.includes(e4)), m3 = a3.onNextClick || e3.getConfig(`onNextClick`), h3 = a3.onPrevClick || e3.getConfig(`onPrevClick`), g3 = a3.onCloseClick || e3.getConfig(`onCloseClick`);
    return { ...i3, popover: { showButtons: p3, nextBtnText: o3 ? void 0 : c3, disableButtons: [...s3 ? [] : [`previous`]], showProgress: u3, onNextClick: m3 || n3.onNextClick, onPrevClick: h3 || n3.onPrevClick, onCloseClick: g3 || n3.onCloseClick, ...a3, progressText: d3 } };
  }
  function V2(e3, t3, n3) {
    let r3 = e3.getConfig(`stagePadding`) || 0;
    return { side: n3.popover?.side || `bottom`, align: n3.popover?.align || `start`, offset: r3 + (e3.getConfig(`popoverOffset`) || 0), padding: r3, centered: t3.id === `driver-dummy-element` };
  }
  function H2(e3, t3, n3) {
    let r3 = n3.popover || {}, i3 = e3.getState(`activeIndex`), a3 = i3 !== void 0 && I2(e3, i3 + 1, 1) === void 0;
    return { title: r3.title, description: r3.description, showButtons: r3.showButtons || e3.getConfig(`showButtons`), disableButtons: r3.disableButtons || e3.getConfig(`disableButtons`) || [], showProgress: r3.showProgress || e3.getConfig(`showProgress`) || false, progressText: r3.progressText ?? (e3.getConfig(`progressText`) || P2), nextBtnText: r3.nextBtnText ?? (e3.getConfig(`nextBtnText`) || `Next`), prevBtnText: r3.prevBtnText ?? (e3.getConfig(`prevBtnText`) || `Previous`), doneButton: a3, popoverClass: r3.popoverClass || e3.getConfig(`popoverClass`) || ``, smoothScroll: e3.getConfig(`smoothScroll`), onNextClick: () => {
      let r4 = L2(e3, n3);
      return r4 ? r4(t3, n3, e3.getHookOpts()) : e3.emit(`nextClick`);
    }, onPrevClick: () => {
      let r4 = R2(e3, n3);
      return r4 ? r4(t3, n3, e3.getHookOpts()) : e3.emit(`prevClick`);
    }, onCloseClick: () => {
      let r4 = z2(e3, n3);
      return r4 ? r4(t3, n3, e3.getHookOpts()) : e3.emit(`closeClick`);
    }, onRender: (t4) => {
      e3.setState(`popover`, t4), (r3.onPopoverRender || e3.getConfig(`onPopoverRender`))?.(t4, e3.getHookOpts());
    }, position: V2(e3, t3, n3) };
  }
  function U2(e3, t3, n3) {
    w2(e3.getState(`popover`)), x2(t3, H2(e3, t3, n3));
  }
  function W2(e3, t3, n3) {
    let r3 = e3.getState(`popover`);
    r3 && s2(r3, t3, V2(e3, t3, n3));
  }
  function G2() {
    let e3 = document.getElementById(`driver-dummy-element`);
    if (e3) return e3;
    let t3 = document.createElement(`div`);
    return t3.id = `driver-dummy-element`, t3.style.width = `0`, t3.style.height = `0`, t3.style.pointerEvents = `none`, t3.style.opacity = `0`, t3.style.position = `fixed`, t3.style.top = `50%`, t3.style.left = `50%`, document.body.appendChild(t3), t3;
  }
  function K2(e3, t3) {
    let n3 = f2(t3.element);
    n3 || (n3 = G2()), J2(e3, n3, t3);
  }
  function q2(e3) {
    let t3 = e3.getState(`__activeElement`), n3 = e3.getState(`__activeStep`);
    t3 && (D2(e3, t3), O2(e3), W2(e3, t3, n3));
  }
  function J2(e3, t3, n3) {
    let r3 = e3.getConfig(`duration`) || 400, i3 = Date.now(), a3 = e3.getState(`__activeStep`), o3 = e3.getState(`__activeElement`) || t3, s3 = !o3 || o3 === t3, c3 = t3.id === `driver-dummy-element`, l3 = o3.id === `driver-dummy-element`, u3 = e3.getConfig(`animate`), d3 = n3.onHighlightStarted || e3.getConfig(`onHighlightStarted`), f3 = n3?.onHighlighted || e3.getConfig(`onHighlighted`), m3 = a3?.onDeselected || e3.getConfig(`onDeselected`), h3 = e3.getHookOpts();
    !s3 && m3 && m3(l3 ? void 0 : o3, a3, h3), d3 && d3(c3 ? void 0 : t3, n3, h3);
    let _3 = !s3 && u3, v3 = false;
    b2(e3.getState(`popover`)), e3.setState(`previousStep`, a3), e3.setState(`previousElement`, o3), e3.setState(`activeStep`, n3), e3.setState(`activeElement`, t3);
    let y3 = () => {
      if (e3.getState(`__transitionCallback`) !== y3) return;
      let s4 = Date.now() - i3, l4 = r3 - s4 <= r3 / 2;
      n3.popover && l4 && !v3 && _3 && (U2(e3, t3, n3), v3 = true), e3.getConfig(`animate`) && s4 < r3 ? E2(e3, s4, r3, o3, t3) : (D2(e3, t3), f3 && f3(c3 ? void 0 : t3, n3, e3.getHookOpts()), e3.setState(`__transitionCallback`, void 0), e3.setState(`__previousStep`, a3), e3.setState(`__previousElement`, o3), e3.setState(`__activeStep`, n3), e3.setState(`__activeElement`, t3)), window.requestAnimationFrame(y3);
    };
    e3.setState(`__transitionCallback`, y3), window.requestAnimationFrame(y3), g2(t3, e3.getConfig(`smoothScroll`)), !_3 && n3.popover && U2(e3, t3, n3), document.querySelectorAll(`.driver-active-element-parent`).forEach((e4) => {
      e4.classList.remove(`driver-active-element-parent`, `driver-active-element-parent-no-scroll`);
    }), o3.classList.remove(`driver-active-element`, `driver-no-interaction`), o3.removeAttribute(`aria-haspopup`), o3.removeAttribute(`aria-expanded`), o3.removeAttribute(`aria-controls`), (n3.disableActiveInteraction ?? e3.getConfig(`disableActiveInteraction`)) && t3.classList.add(`driver-no-interaction`);
    let x3 = t3.parentElement;
    x3 && x3 !== document.body && (x3.classList.add(`driver-active-element-parent`), p2(x3) && x3.classList.add(`driver-active-element-parent-no-scroll`)), t3.classList.add(`driver-active-element`), t3.setAttribute(`aria-haspopup`, `dialog`), t3.setAttribute(`aria-expanded`, `true`), t3.setAttribute(`aria-controls`, `driver-popover-content`);
  }
  function Y2() {
    document.getElementById(`driver-dummy-element`)?.remove(), document.querySelectorAll(`.driver-active-element`).forEach((e3) => {
      let t3 = e3.parentElement;
      t3 && t3 !== document.body && t3.classList.remove(`driver-active-element-parent`, `driver-active-element-parent-no-scroll`), e3.classList.remove(`driver-active-element`, `driver-no-interaction`), e3.removeAttribute(`aria-haspopup`), e3.removeAttribute(`aria-expanded`), e3.removeAttribute(`aria-controls`);
    });
  }
  function X2(e3) {
    let t3 = e3.getState(`__resizeTimeout`);
    t3 && window.cancelAnimationFrame(t3), e3.setState(`__resizeTimeout`, window.requestAnimationFrame(() => q2(e3)));
  }
  function Z2(e3, t3) {
    if (!e3.getState(`isInitialized`) || !(t3.key === `Tab` || t3.keyCode === 9)) return;
    let n3 = e3.getState(`__activeElement`), r3 = e3.getState(`popover`)?.wrapper, i3 = h2([...r3 ? [r3] : [], ...n3 ? [n3] : []]), a3 = i3[0], o3 = i3[i3.length - 1];
    t3.preventDefault(), t3.shiftKey ? (i3[i3.indexOf(document.activeElement) - 1] || o3)?.focus() : (i3[i3.indexOf(document.activeElement) + 1] || a3)?.focus();
  }
  function Q2(e3, t3) {
    (e3.getConfig(`allowKeyboardControl`) ?? true) && (t3.key === `Escape` ? e3.emit(`escapePress`) : t3.key === `ArrowRight` ? e3.emit(`arrowRightPress`) : t3.key === `ArrowLeft` && e3.emit(`arrowLeftPress`));
  }
  function $(e3, t3) {
    let n3 = e3.getState(`__activeElement`), r3 = t3.target;
    !n3 || !r3 || !n3.contains(r3) || e3.emit(`activeElementClick`);
  }
  function ee2(e3) {
    let t3 = (t4) => Q2(e3, t4), n3 = (t4) => Z2(e3, t4), r3 = () => X2(e3), i3 = () => X2(e3), a3 = (t4) => $(e3, t4);
    e3.setState(`__events`, { onKeyup: t3, onKeydown: n3, onResize: r3, onScroll: i3, onClick: a3 }), window.addEventListener(`keyup`, t3, false), window.addEventListener(`keydown`, n3, false), window.addEventListener(`resize`, r3), window.addEventListener(`scroll`, i3), document.addEventListener(`click`, a3, false);
  }
  function te2(e3) {
    let t3 = e3.getState(`__events`);
    t3 && (window.removeEventListener(`keyup`, t3.onKeyup), window.removeEventListener(`keydown`, t3.onKeydown), window.removeEventListener(`resize`, t3.onResize), window.removeEventListener(`scroll`, t3.onScroll), document.removeEventListener(`click`, t3.onClick, false));
  }
  function ne2() {
    let e3 = {};
    function t3(t4 = {}) {
      e3 = { animate: true, duration: 400, allowClose: true, allowScroll: true, overlayClickBehavior: `close`, overlayOpacity: 0.7, smoothScroll: false, disableActiveInteraction: false, advanceOnClick: false, skipMissingElement: false, waitForElement: 0, showProgress: false, stagePadding: 10, stageRadius: 5, popoverOffset: 10, showButtons: [`next`, `previous`, `close`], disableButtons: [], overlayColor: `#000`, ...t4 };
    }
    return t3(), { getConfig: ((t4) => t4 ? e3[t4] : e3), configure: t3 };
  }
  function re2() {
    let e3 = {}, t3 = ((t4) => t4 ? e3[t4] : e3), n3 = (t4, n4) => {
      e3[t4] = n4;
    };
    function r3() {
      e3 = {};
    }
    return { getState: t3, setState: n3, resetState: r3 };
  }
  function ie2() {
    let e3 = {};
    function t3(t4, n4) {
      e3[t4] = n4;
    }
    function n3(t4) {
      e3[t4]?.();
    }
    function r3() {
      e3 = {};
    }
    return { listen: t3, emit: n3, reset: r3 };
  }
  function ae2(e3 = {}) {
    let t3 = ne2();
    t3.configure(e3);
    let n3 = re2(), r3 = ie2(), i3;
    return { getConfig: t3.getConfig, setConfig: t3.configure, getState: n3.getState, setState: n3.setState, resetState: n3.resetState, listen: r3.listen, emit: r3.emit, resetEmitter: r3.reset, getDriver: () => i3, setDriver: (e4) => {
      i3 = e4;
    }, getHookOpts: (e4) => {
      let r4 = e4 || n3.getState();
      return { config: t3.getConfig(), state: r4, driver: i3, index: r4.activeIndex };
    } };
  }
  function oe2(e3 = {}) {
    let t3 = ae2(e3);
    function n3() {
      t3.getConfig(`allowClose`) && h3();
    }
    function r3() {
      let e4 = t3.getConfig(`overlayClickBehavior`);
      if (t3.getConfig(`allowClose`) && e4 === `close`) {
        h3();
        return;
      }
      if (typeof e4 == `function`) {
        let n4 = t3.getState(`__activeStep`);
        e4(t3.getState(`__activeElement`), n4, t3.getHookOpts());
        return;
      }
      if (e4 === `nextStep`) {
        let e5 = t3.getState(`activeStep`), n4 = t3.getState(`activeElement`), r4 = L2(t3, e5);
        if (r4) {
          r4(n4, e5, t3.getHookOpts());
          return;
        }
        i3();
      }
    }
    function i3() {
      let e4 = t3.getState(`activeIndex`), n4 = t3.getConfig(`steps`) || [];
      if (e4 === void 0) return;
      let r4 = e4 + 1;
      n4[r4] ? m3(r4) : h3();
    }
    function a3() {
      let e4 = t3.getState(`activeIndex`), n4 = t3.getConfig(`steps`) || [];
      if (e4 === void 0) return;
      let r4 = e4 - 1;
      n4[r4] ? m3(r4) : h3();
    }
    function o3(e4) {
      (t3.getConfig(`steps`) || [])[e4] ? m3(e4) : h3();
    }
    function s3() {
      if (t3.getState(`__transitionCallback`)) return;
      let e4 = t3.getState(`__activeStep`);
      if (!e4 || !(e4.advanceOnClick ?? t3.getConfig(`advanceOnClick`))) return;
      let n4 = t3.getState(`__activeElement`), r4 = L2(t3, e4);
      if (r4) {
        r4(n4, e4, t3.getHookOpts());
        return;
      }
      i3();
    }
    function c3() {
      if (t3.getState(`__transitionCallback`)) return;
      let e4 = t3.getState(`activeIndex`), n4 = t3.getState(`__activeStep`), r4 = t3.getState(`__activeElement`);
      if (e4 === void 0 || n4 === void 0 || !(t3.getConfig(`steps`) || [])[e4 - 1]) return;
      let i4 = R2(t3, n4);
      if (i4) return i4(r4, n4, t3.getHookOpts());
      a3();
    }
    function l3() {
      if (t3.getState(`__transitionCallback`)) return;
      let e4 = t3.getState(`activeIndex`), n4 = t3.getState(`__activeStep`), r4 = t3.getState(`__activeElement`);
      if (e4 === void 0 || n4 === void 0) return;
      let a4 = L2(t3, n4);
      if (a4) return a4(r4, n4, t3.getHookOpts());
      i3();
    }
    function u3() {
      t3.getState(`isInitialized`) || (t3.setState(`isInitialized`, true), document.body.classList.add(`driver-active`, t3.getConfig(`animate`) ? `driver-fade` : `driver-simple`), t3.getConfig(`allowScroll`) || document.body.classList.add(`driver-no-scroll`), document.body.style.setProperty(`--driver-animation-duration`, `${t3.getConfig(`duration`) || 400}ms`), ee2(t3), t3.listen(`overlayClick`, r3), t3.listen(`activeElementClick`, s3), t3.listen(`escapePress`, n3), t3.listen(`closeClick`, n3), t3.listen(`arrowLeftPress`, c3), t3.listen(`arrowRightPress`, l3));
    }
    function d3() {
      let e4 = t3.getState(`__pendingWaitCancel`);
      e4 && (t3.setState(`__pendingWaitCancel`, void 0), e4());
    }
    function p3(e4, n4, r4) {
      let i4 = () => {
        a4.disconnect(), window.clearTimeout(o4), t3.setState(`__pendingWaitCancel`, void 0), r4();
      }, a4 = new MutationObserver(() => {
        f2(e4.element) && i4();
      }), o4 = window.setTimeout(i4, n4);
      t3.setState(`__pendingWaitCancel`, () => {
        a4.disconnect(), window.clearTimeout(o4);
      }), a4.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    }
    function m3(e4 = 0, n4 = false) {
      d3();
      let r4 = t3.getConfig(`steps`);
      if (!r4) {
        console.error(`No steps to drive through`), h3();
        return;
      }
      if (!r4[e4]) {
        h3();
        return;
      }
      let i4 = r4[e4], a4 = i4.waitForElement ?? t3.getConfig(`waitForElement`) ?? 0;
      if (!n4 && a4 > 0 && i4.element && !f2(i4.element)) {
        p3(i4, a4, () => m3(e4, true));
        return;
      }
      if (F2(t3, i4)) {
        let n5 = t3.getState(`activeIndex`), i5 = typeof n5 == `number` && e4 < n5 ? -1 : 1;
        r4[e4 + i5] ? m3(e4 + i5) : i5 === 1 && h3();
        return;
      }
      t3.setState(`__activeOnDestroyed`, document.activeElement), t3.setState(`activeIndex`, e4);
      let o4 = r4[e4 + 1];
      K2(t3, B2(t3, e4, { onNextClick: () => {
        o4 ? m3(e4 + 1) : h3();
      }, onPrevClick: () => {
        m3(e4 - 1);
      }, onCloseClick: () => {
        h3();
      } }));
    }
    function h3(e4 = true) {
      let n4 = t3.getState(`__activeElement`), r4 = t3.getState(`__activeStep`), i4 = t3.getState(`__activeOnDestroyed`), a4 = t3.getConfig(`onDestroyStarted`);
      if (e4 && a4) {
        a4(!n4 || n4?.id === `driver-dummy-element` ? void 0 : n4, r4, t3.getHookOpts());
        return;
      }
      let o4 = r4?.onDeselected || t3.getConfig(`onDeselected`), s4 = t3.getConfig(`onDestroyed`);
      document.body.classList.remove(`driver-active`, `driver-fade`, `driver-simple`, `driver-no-scroll`), document.body.style.removeProperty(`--driver-animation-duration`), d3(), te2(t3), w2(t3.getState(`popover`)), Y2(), N2(t3), t3.resetEmitter();
      let c4 = t3.getState();
      if (t3.resetState(), n4 && r4) {
        let e5 = n4.id === `driver-dummy-element`;
        o4 && o4(e5 ? void 0 : n4, r4, t3.getHookOpts(c4)), s4 && s4(e5 ? void 0 : n4, r4, t3.getHookOpts(c4));
      }
      i4 && i4.focus();
    }
    let g3 = { isActive: () => t3.getState(`isInitialized`) || false, refresh: () => X2(t3), drive: (e4 = 0) => {
      u3(), m3(e4);
    }, setConfig: t3.setConfig, setSteps: (e4) => {
      d3(), t3.resetState(), t3.setConfig({ ...t3.getConfig(), steps: e4 });
    }, getConfig: t3.getConfig, getState: t3.getState, getActiveIndex: () => t3.getState(`activeIndex`), isFirstStep: () => {
      let e4 = t3.getState(`activeIndex`);
      return e4 !== void 0 && I2(t3, e4 - 1, -1) === void 0;
    }, isLastStep: () => {
      let e4 = t3.getState(`activeIndex`);
      return e4 !== void 0 && I2(t3, e4 + 1, 1) === void 0;
    }, getActiveStep: () => t3.getState(`activeStep`), getActiveElement: () => t3.getState(`activeElement`), getPreviousElement: () => t3.getState(`previousElement`), getPreviousStep: () => t3.getState(`previousStep`), getNextStep: () => {
      let e4 = t3.getConfig(`steps`) || [], n4 = t3.getState(`activeIndex`);
      if (n4 === void 0) return;
      let r4 = I2(t3, n4 + 1, 1);
      return r4 === void 0 ? void 0 : e4[r4];
    }, moveNext: i3, movePrevious: a3, moveTo: o3, hasNextStep: () => {
      let e4 = t3.getState(`activeIndex`);
      return e4 !== void 0 && I2(t3, e4 + 1, 1) !== void 0;
    }, hasPreviousStep: () => {
      let e4 = t3.getState(`activeIndex`);
      return e4 !== void 0 && I2(t3, e4 - 1, -1) !== void 0;
    }, highlight: (e4) => {
      u3(), K2(t3, { ...e4, popover: e4.popover ? { showButtons: [], showProgress: false, progressText: ``, ...e4.popover } : void 0 });
    }, destroy: () => {
      h3(false);
    } };
    return t3.setDriver(g3), g3;
  }

  // src/spotlight.ts
  function resolveElement(selectorOrQuery) {
    if (!selectorOrQuery || typeof document === "undefined") return null;
    try {
      const el2 = document.querySelector(selectorOrQuery);
      if (el2) return el2;
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
    for (const s3 of steps) {
      const resolved = resolveElement(s3.element);
      if (resolved) {
        driveSteps.push({
          element: resolved,
          popover: {
            title: s3.title,
            description: s3.description,
            side: s3.side || "bottom",
            align: s3.align || "center",
            popoverClass: "cradle-driver-theme"
          }
        });
      } else {
        console.warn(`[cradle-spotlight] Element not found: "${s3.element}"`);
      }
    }
    if (!driveSteps.length) {
      console.warn("[cradle-spotlight] No valid elements found to spotlight");
      onFinish?.();
      return;
    }
    activeDriverInstance = oe2({
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
        const x3 = Math.round(column * cellWidth);
        const y3 = Math.round(row * cellHeight);
        const w3 = Math.max(1, Math.round(cellWidth));
        const h3 = Math.max(1, Math.round(cellHeight));
        let hasContent = false;
        try {
          const { data } = ctx.getImageData(x3, y3, w3, h3);
          for (let i3 = 3; i3 < data.length; i3 += 4) {
            if ((data[i3] ?? 0) > ALPHA_THRESHOLD) {
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
        form.addEventListener("submit", (e3) => {
          e3.preventDefault();
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
      for (const m3 of this.localMessages) {
        const bubble = document.createElement("div");
        bubble.className = `msg ${m3.role === "user" ? "user-msg" : "assistant-msg"}`;
        bubble.textContent = m3.content;
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
            messages: this.localMessages.slice(0, -1).map((m3) => ({
              id: m3.id,
              role: m3.role,
              content: m3.content,
              parts: [{ type: "text", text: m3.content }]
            })),
            installationId: this.siteId,
            visitorId: this.visitorId,
            clientContext: {
              telemetry: globalTelemetry.buffer.recent(20),
              posthogSessionId: globalTelemetry.sessionId(),
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
          const target = this.localMessages.find((m3) => m3.id === assistantMsgId);
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
        const target = this.localMessages.find((m3) => m3.id === assistantMsgId);
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
