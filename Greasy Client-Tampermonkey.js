// ==UserScript==
// @name         Greasy Client - Loader
// @namespace    http://tampermonkey.net/
// @version      3.9
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

    // CONFIG
    const REPO_USER = "iykyk-zypher";
    const REPO_NAME = "Greasy-Client";
    const BRANCH = "main";
    const CLIENT_FILE = "greasy_client_v3_9.js";

    const CLIENT_URL = `https://github.com/iykyk-zypher/Greasy-Client/blob/main/greasy_client_v3_9.js`;

    // LOADER
    function log(message, data) {
        if (data !== undefined) {
            console.log("[Greasy Loader] " + message, data);
        } else {
            console.log("[Greasy Loader] " + message);
        }
    }

    function fail(message, data) {
        if (data !== undefined) {
            console.error("[Greasy Loader] " + message, data);
        } else {
            console.error("[Greasy Loader] " + message);
        }
    }

    function injectClient(code) {
        const script = document.createElement("script");
        script.textContent = code + "\n//# sourceURL=" + CLIENT_FILE;

        const target = document.head || document.documentElement;
        target.appendChild(script);

        log("Client injected: " + CLIENT_FILE);
    }

    function loadClient() {
        const url = CLIENT_URL + "?cacheBust=" + Date.now();

        log("Loading from: " + url);

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            timeout: 20000,

            onload: function (response) {
                if (response.status !== 200) {
                    fail("Fetch failed. Status: " + response.status + " " + response.statusText);
                    fail("URL:", url);
                    return;
                }

                if (!response.responseText || response.responseText.trim().length < 100) {
                    fail("Fetched file is empty or too small.");
                    return;
                }

                try {
                    injectClient(response.responseText);
                    log("Loaded successfully.");
                } catch (e) {
                    fail("Injection failed:", e);
                }
            },

            onerror: function (err) {
                fail("Network error:", err);
            },

            ontimeout: function () {
                fail("Request timed out.");
            }
        });
    }

    loadClient();
})();
