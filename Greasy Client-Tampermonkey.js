// ==UserScript==
// @name         Greasy Client - 3.8.1
// @namespace    http://tampermonkey.net/
// @version      3.8.1
// @description  Official Greasy Client
// @author       Botless, Not_Cole & AngryWolfX
// @match        https://miniblox.io/*
// @run-at       document-start
// @license      MIT
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const base = "https://raw.githubusercontent.com/iykyk-zypher/Greasy-Client/refs/heads/main/greasy_client_v3_8_1.js";
    const url = base + "?t=" + Date.now();

    GM_xmlhttpRequest({
        method: "GET",
        url,
        onload: function(response) {
            if (response.status === 200) {
                try {
                    const script = document.createElement("script");
                    script.textContent = response.responseText + "\n//# sourceURL=greasy_client_v3_8_1.js";
                    (document.head || document.documentElement).appendChild(script);
                    console.log("[Greasy Loader] Loaded latest Greasy version.");
                } catch (e) {
                    console.error("[Greasy Loader] Failed to inject script:", e);
                }
            } else {
                console.error("[Greasy Loader] Fetch failed:", response.status, response.statusText);
            }
        },
        onerror: function(err) {
            console.error("[Greasy Loader] Network error:", err);
        }
    });
})();
