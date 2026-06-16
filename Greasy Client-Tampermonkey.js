// ==UserScript==
// @name         Greasy Client - Loader
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Official Greasy Client Loader
// @author       Botless, Not_Cole & AngryWolfX
// @match        https://miniblox.io/*
// @run-at       document-start
// @license      MIT
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const CLIENT_VERSION = "4.0";
    const CLIENT_URL = "https://raw.githubusercontent.com/iykyk-zypher/Greasy-Client/main/greasy_client_latest.js";

    GM_xmlhttpRequest({
        method: "GET",
        url: CLIENT_URL + "?t=" + Date.now(),
        timeout: 15000,

        onload: function (response) {
            if (response.status !== 200) {
                console.error("[Greasy Loader] Fetch failed:", response.status, response.statusText);
                return;
            }

            try {
                const script = document.createElement("script");
                script.textContent = response.responseText + `\n//# sourceURL=greasy_client_${CLIENT_VERSION}.js`;
                (document.head || document.documentElement).appendChild(script);
                script.remove();

                console.log("[Greasy Loader] Loaded Greasy Client v" + CLIENT_VERSION);
            } catch (e) {
                console.error("[Greasy Loader] Failed to inject script:", e);
            }
        },

        onerror: function (err) {
            console.error("[Greasy Loader] Network error:", err);
        },

        ontimeout: function () {
            console.error("[Greasy Loader] Request timed out.");
        }
    });
})();
