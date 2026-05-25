// ==UserScript==
// @name         Greasy Client
// @namespace    http://tampermonkey.net/
// @version      3.9.0
// @description  Official Greasy Client
// @author       Botless, Not_Cole & AngryWolfX
// @match        https://miniblox.io/*
// @match        https://miniblox.org/*
// @license      MIT
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // CONFIG
    const VERSION = "v3.10.2";
    const LOGO_URL = "https://tinyurl.com/greasyclient";
    const SPLASH_BG = "https://wallpaperaccess.com/full/439751.jpg";
    const splashPreloader = new Image();
    splashPreloader.src = SPLASH_BG;
    const DISCORD_LINK = "https://discord.gg/emEaezsMzp";

    const YT_NOT_COLE = "https://www.youtube.com/@Not_ColePlayz?sub_confirmation=1";
    const YT_MINIBLOX = "https://www.youtube.com/@Miniblox-ffgf?sub_confirmation=1";

    const MAX_CUSTOM_PRESETS = 10;

    const phrases = [
        "Bypassing The Limits....",
        "TIME TO FLY OFF!",
        "Stay Greasy.",
        "GC ON TOP!"
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    const BASE_COLOR_PRESETS = {
        green:  { accent: "#00ff88", accent2: "#2ecc71", glow: "rgba(0,255,136,0.45)" },
        blue:   { accent: "#4da3ff", accent2: "#2f7ee6", glow: "rgba(77,163,255,0.45)" },
        purple: { accent: "#b266ff", accent2: "#8b4de0", glow: "rgba(178,102,255,0.45)" },
        red:    { accent: "#ff5c7a", accent2: "#e04462", glow: "rgba(255,92,122,0.45)" },
        gold:   { accent: "#ffd166", accent2: "#e0b94a", glow: "rgba(255,209,102,0.45)" }
    };

    const defaultSettings = {
        nickname: "Greasy" + Math.floor(Math.random() * 999),
        nicknameConfirmed: false,
        showFPS: false,
        showCPS: false,
        showKeystrokes: false,
        showCrosshair: false,
        showClock: false,
        autoSaveModules: false,
        soundPreset: "crystal",
        soundsEnabled: true,
        optimizedMode: false,
        soundVolume: 70,
        language: "en",
        accentPreset: "green",
        gameMenuBgUrl: "https://wallpaperaccess.com/full/439751.jpg",
        customColors: {},
        positions: {
            'greasy-main-title': { top: '15px', left: '15px' },
            'fps-wrap': { top: '70px', left: '15px' },
            'cps-wrap': { top: '110px', left: '15px' },
            'keys-wrap': { top: '160px', left: '15px' },
            'clock-wrap': { top: '320px', left: '15px' },
            'gc-welcome-banner': { top: '70px', left: '15px' }
        }
    };

    let settings = JSON.parse(localStorage.getItem('greasyClientSettings')) || defaultSettings;
    settings.language = settings.language || "en";
    settings.accentPreset = settings.accentPreset || "green";
    settings.showClock = typeof settings.showClock === "boolean" ? settings.showClock : false;
    settings.showFPS = typeof settings.showFPS === "boolean" ? settings.showFPS : false;
    settings.showCPS = typeof settings.showCPS === "boolean" ? settings.showCPS : false;
    settings.showKeystrokes = typeof settings.showKeystrokes === "boolean" ? settings.showKeystrokes : false;
    settings.showCrosshair = typeof settings.showCrosshair === "boolean" ? settings.showCrosshair : false;
    settings.autoSaveModules = typeof settings.autoSaveModules === "boolean" ? settings.autoSaveModules : false;
    settings.soundPreset = settings.soundPreset || "crystal";
    settings.soundsEnabled = typeof settings.soundsEnabled === "boolean" ? settings.soundsEnabled : true;
    settings.soundVolume = Number.isFinite(Number(settings.soundVolume)) ? Math.max(0, Math.min(100, Number(settings.soundVolume))) : 70;
    settings.optimizedMode = typeof settings.optimizedMode === "boolean" ? settings.optimizedMode : false;
    settings.nicknameConfirmed = typeof settings.nicknameConfirmed === "boolean" ? settings.nicknameConfirmed : false;
    settings.customColors = settings.customColors || {};

    settings.positions = settings.positions || {};
    settings.positions['greasy-main-title'] = settings.positions['greasy-main-title'] || { top: '15px', left: '15px' };
    settings.positions['fps-wrap'] = settings.positions['fps-wrap'] || { top: '70px', left: '15px' };
    settings.positions['cps-wrap'] = settings.positions['cps-wrap'] || { top: '110px', left: '15px' };
    settings.positions['keys-wrap'] = settings.positions['keys-wrap'] || { top: '160px', left: '15px' };
    settings.positions['clock-wrap'] = settings.positions['clock-wrap'] || { top: '320px', left: '15px' };
    settings.positions['gc-welcome-banner'] = settings.positions['gc-welcome-banner'] || { top: '70px', left: '15px' };

    const moduleIds = ['greasy-main-title', 'fps-wrap', 'cps-wrap', 'keys-wrap', 'clock-wrap'];

    function cloneDefaultPositions() {
        return JSON.parse(JSON.stringify(defaultSettings.positions));
    }

    function forceCleanModulesIfAutoSaveOff() {
        if (settings.autoSaveModules) return;

        settings.showFPS = false;
        settings.showCPS = false;
        settings.showKeystrokes = false;
        settings.showCrosshair = false;
        settings.showClock = false;
        settings.positions = cloneDefaultPositions();
    }

    forceCleanModulesIfAutoSaveOff();

    const save = () => localStorage.setItem('greasyClientSettings', JSON.stringify(settings));

    function saveModulesIfEnabled() {
        if (settings.autoSaveModules) {
            save();
        }
    }

    function applyOptimizedMode() {
        document.body.classList.toggle('gc-performance-mode', !!settings.optimizedMode);

        if (settings.optimizedMode) {
            document.querySelectorAll('.gc-magnetic-button').forEach(button => {
                button.style.transform = '';
                button.classList.remove('gc-magnet-active');
            });
        }
    }


    function getAllColorPresets() {
        return {
            ...BASE_COLOR_PRESETS,
            ...settings.customColors
        };
    }

    function hexToRgb(hex) {
        const clean = hex.replace('#', '');
        const normalized = clean.length === 3
            ? clean.split('').map(c => c + c).join('')
            : clean;

        const num = parseInt(normalized, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(v => {
            const n = Math.max(0, Math.min(255, Math.round(v)));
            return n.toString(16).padStart(2, '0');
        }).join('');
    }

    function darkenHex(hex, amount = 0.18) {
        const { r, g, b } = hexToRgb(hex);
        return rgbToHex(
            r * (1 - amount),
            g * (1 - amount),
            b * (1 - amount)
        );
    }

    function makeGlowFromHex(hex, alpha = 0.45) {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function sanitizePresetKey(name) {
        return name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 30);
    }

    function getCustomPresetEntries() {
        return Object.entries(settings.customColors);
    }

    function showMiniNotice(message, isError = false) {
        let notice = document.getElementById('gc-mini-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'gc-mini-notice';
            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.className = isError ? 'gc-mini-notice gc-error' : 'gc-mini-notice gc-ok';
        notice.style.display = 'block';
        notice.style.opacity = '1';
        notice.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(showMiniNotice._timer);
        showMiniNotice._timer = setTimeout(() => {
            if (!notice) return;
            notice.style.opacity = '0';
            notice.style.transform = 'translateX(-50%) translateY(-8px)';
            setTimeout(() => {
                if (notice) notice.style.display = 'none';
            }, 220);
        }, 2200);
    }


    function playGcTone(type = 'click', previewPreset = null) {
        try {
            if (!settings.soundsEnabled && !previewPreset) return;

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const preset = previewPreset || settings.soundPreset || 'crystal';
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const volumeLevel = Math.max(0, Math.min(2.4, Number(settings.soundVolume || 70) / 100));
            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-24, now);
            compressor.knee.setValueAtTime(22, now);
            compressor.ratio.setValueAtTime(7, now);
            compressor.attack.setValueAtTime(0.002, now);
            compressor.release.setValueAtTime(0.22, now);
            compressor.connect(ctx.destination);

            const master = ctx.createGain();
            master.gain.setValueAtTime(0.0001, now);

            // Stronger internal gain. This only affects Greasy Client sounds.
            const baseGain = type === 'click' ? 0.95 : 1.35;
            master.gain.exponentialRampToValueAtTime(baseGain * volumeLevel, now + 0.018);
            master.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'click' ? 0.26 : 0.62));
            master.connect(compressor);

            function tone(freqStart, freqEnd, startTime, duration, wave = 'sine', volume = 1) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = wave;
                osc.frequency.setValueAtTime(freqStart, startTime);

                if (freqEnd && freqEnd !== freqStart) {
                    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), startTime + duration);
                }

                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

                osc.connect(gain);
                gain.connect(master);
                osc.start(startTime);
                osc.stop(startTime + duration + 0.03);
            }

            // Five original sound styles.
            // click = short UI click
            // on    = module enabled
            // off   = module disabled
            const maps = {
                crystal: {
                    click: [[520, 760, 0, .09, 'sine', .58], [1040, 1320, .045, .12, 'triangle', .36]],
                    on:    [[392, 560, 0, .13, 'sine', .81], [660, 990, .105, .18, 'triangle', .62], [1180, 1560, .235, .16, 'sine', .32]],
                    off:   [[820, 620, 0, .14, 'triangle', .62], [520, 340, .12, .20, 'sine', .48], [300, 220, .285, .16, 'sine', .26]]
                },
                cyber: {
                    click: [[170, 210, 0, .06, 'square', .32], [860, 1280, .045, .11, 'sawtooth', .29], [1480, 1720, .12, .07, 'triangle', .17]],
                    on:    [[210, 340, 0, .10, 'square', .43], [480, 760, .09, .16, 'sawtooth', .36], [980, 1480, .22, .17, 'triangle', .29]],
                    off:   [[920, 620, 0, .12, 'sawtooth', .36], [520, 300, .115, .18, 'square', .29], [240, 160, .28, .13, 'triangle', .17]]
                },
                bubble: {
                    click: [[430, 560, 0, .08, 'sine', .45], [620, 820, .065, .10, 'sine', .32]],
                    on:    [[330, 470, 0, .12, 'sine', .51], [470, 660, .12, .13, 'sine', .49], [660, 920, .245, .16, 'sine', .36]],
                    off:   [[660, 500, 0, .12, 'sine', .45], [500, 360, .12, .15, 'sine', .36], [360, 260, .255, .16, 'sine', .23]]
                },
                retro: {
                    click: [[330, 330, 0, .07, 'square', .32], [494, 494, .075, .07, 'square', .29], [660, 660, .15, .06, 'square', .22]],
                    on:    [[330, 330, 0, .09, 'square', .36], [392, 392, .10, .09, 'square', .36], [523, 523, .20, .11, 'square', .32], [784, 784, .325, .12, 'square', .22]],
                    off:   [[784, 784, 0, .09, 'square', .29], [523, 523, .10, .10, 'square', .28], [392, 392, .22, .10, 'square', .23], [262, 262, .34, .12, 'square', .17]]
                },
                soft: {
                    click: [[420, 520, 0, .12, 'sine', .26], [620, 720, .10, .12, 'sine', .16]],
                    on:    [[349, 440, 0, .18, 'sine', .32], [440, 587, .16, .20, 'sine', .29], [587, 740, .32, .17, 'triangle', .16]],
                    off:   [[520, 430, 0, .17, 'sine', .29], [392, 300, .16, .19, 'sine', .22], [262, 220, .33, .13, 'sine', .13]]
                }
            };

            const selected = maps[preset] || maps.crystal;
            const notes = selected[type] || selected.click;

            notes.forEach(note => {
                const [a, b, offset, duration, wave, volume] = note;
                tone(a, b, now + offset, duration, wave, volume);
            });

            setTimeout(() => ctx.close(), 700);
        } catch (e) {}
    }

    function playGcButtonSound() {
        playGcTone('click');
    }

    function playGcModuleSound(isEnabled) {
        playGcTone(isEnabled ? 'on' : 'off');
    }

    function bindMagneticButtons() {
        if (bindMagneticButtons.bound) return;
        bindMagneticButtons.bound = true;

        const selector = [
            'button',
            '[role="button"]',
            '.btn',
            '[class*="button"]',
            '[class*="Button"]'
        ].join(',');

        function refreshMagneticButtons() {
            document.querySelectorAll(selector).forEach(button => {
                if (!button.classList.contains('gc-magnetic-button')) {
                    button.classList.add('gc-magnetic-button');
                }
            });
        }

        refreshMagneticButtons();

        const observer = new MutationObserver(refreshMagneticButtons);
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('mousemove', (e) => {
            if (settings.optimizedMode) return;
            const buttons = Array.from(document.querySelectorAll('.gc-magnetic-button'))
                .filter(button => {
                    const style = window.getComputedStyle(button);
                    const rect = button.getBoundingClientRect();

                    return !button.disabled &&
                        style.display !== 'none' &&
                        style.visibility !== 'hidden' &&
                        parseFloat(style.opacity || '1') > 0 &&
                        rect.width >= 24 &&
                        rect.height >= 18;
                });

            let closestButton = null;
            let closestDistance = Infinity;

            buttons.forEach(button => {
                const rect = button.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

                if (distance < 90 && distance < closestDistance) {
                    closestDistance = distance;
                    closestButton = button;
                }
            });

            buttons.forEach(button => {
                if (button === closestButton) {
                    const rect = button.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.055;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.055;
                    const scale = 1 + Math.max(0, (90 - closestDistance) / 90) * 0.03;

                    button.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
                    button.classList.add('gc-magnet-active');
                } else {
                    button.style.transform = '';
                    button.classList.remove('gc-magnet-active');
                }
            });
        });

        document.addEventListener('mouseleave', () => {
            document.querySelectorAll('.gc-magnetic-button').forEach(button => {
                button.style.transform = '';
                button.classList.remove('gc-magnet-active');
            });
        });
    }

    function bindClientButtonSounds() {
        if (bindClientButtonSounds.bound) return;
        bindClientButtonSounds.bound = true;

        document.addEventListener('click', (e) => {
            const target = e.target.closest(
                '#gc-master-container button, ' +
                '#client-menu button, ' +
                '#gc-credits-modal button, ' +
                '#gc-sounds-modal button, ' +
                '#gc-delete-confirm-modal button, ' +
                '#gc-nick-confirm-modal button'
            );

            if (!target || target.disabled) return;

            if (target.id === 'btn-cross') {
                playGcModuleSound(!settings.showCrosshair);
                return;
            }

            if (target.id === 'btn-fps') {
                playGcModuleSound(!settings.showFPS);
                return;
            }

            if (target.id === 'btn-cps') {
                playGcModuleSound(!settings.showCPS);
                return;
            }

            if (target.id === 'btn-keys') {
                playGcModuleSound(!settings.showKeystrokes);
                return;
            }

            if (target.id === 'btn-clock') {
                playGcModuleSound(!settings.showClock);
                return;
            }

            if (target.id === 'btn-save-modules') {
                playGcModuleSound(!settings.autoSaveModules);
                return;
            }

            if (target.id === 'btn-optimized-mode') {
                playGcModuleSound(!settings.optimizedMode);
                return;
            }

            playGcButtonSound();
        }, true);
    }

    // TRANSLATIONS
    const I18N = {
        en: {
            play: "PLAY",
            modSettings: "MOD SETTINGS",
            discord: "DISCORD SERVER",
            credits: "CREDITS",
            sounds: "SOUNDS",
            soundsTitle: "SOUND SETTINGS",
            soundsEnabled: "SOUNDS ENABLED",
            soundVolume: "VOLUME",
            soundTest: "TEST SOUND",
            soundCrystal: "Crystal",
            soundCyber: "Cyber",
            soundBubble: "Bubble",
            soundRetro: "Retro",
            soundSoft: "Soft",
            soundSelected: "Sound selected.",
            close: "CLOSE",
            subscribe: "SUBSCRIBE",
            founderOfGC: "Founder of GC",
            firstVersionCoder: "First Version Coder",
            mainCoder: "Main Coder",
            bugFixer: "Bug Fixer",
            nicknamePlaceholder: "Nickname...",
            confirmNick: "CONFIRM NICK",
            confirmNickQuestion: "Are you sure you want to use this nickname?",
            nickRequired: "Nickname is required.",
            nickConfirmed: "Nickname confirmed.",
            nickChangedNeedsConfirm: "Confirm your nickname to unlock Play.",
            welcomeToGc: "Welcome to Greasy Client",
            modsTitle: "GC MODS",
            modsHint: "R-SHIFT to close (Drag HUD when open)",
            menuBgLabel: "Menu Background URL:",
            customCrosshair: "CUSTOM CROSSHAIR",
            fpsCounter: "FPS COUNTER",
            cpsCounter: "CPS COUNTER",
            keystrokes: "KEYSTROKES",
            clock: "CLOCK",
            saveModules: "SAVE MODULES",
            time: "TIME",
            language: "LANGUAGE",
            accentColor: "ACCENT COLOR",
            customPresetName: "CUSTOM PRESET NAME",
            pickCustomColor: "PICK CUSTOM COLOR",
            saveCustomColor: "SAVE CUSTOM COLOR",
            customPresets: "CUSTOM PRESETS",
            yes: "YES",
            cancel: "CANCEL",
            deleteQuestion: "Are you sure you want to delete it?",
            limitReached: "Free up space. Max 10 custom colors.",
            presetSaved: "Custom color saved.",
            presetDeleted: "Custom color deleted.",
            invalidPresetName: "Enter a valid name.",
            duplicatePreset: "That name already exists.",
            english: "English",
            spanish: "Español",
            green: "Green",
            blue: "Blue",
            purple: "Purple",
            red: "Red",
            gold: "Gold",
            greasyTitle: "GREASY CLIENT",
            fps: "FPS",
            cps: "CPS",
            creditsTitle: "CLIENT CREDITS",
            creditsThanks: "Thanks for using Greasy Client."
        },
        es: {
            play: "JUGAR",
            modSettings: "AJUSTES DEL MOD",
            discord: "SERVIDOR DISCORD",
            credits: "CRÉDITOS",
            sounds: "SONIDOS",
            soundsTitle: "CONFIGURACIÓN DE SONIDOS",
            soundsEnabled: "SONIDOS ACTIVOS",
            soundVolume: "VOLUMEN",
            soundTest: "PROBAR SONIDO",
            soundCrystal: "Cristal",
            soundCyber: "Cyber",
            soundBubble: "Burbuja",
            soundRetro: "Retro",
            soundSoft: "Suave",
            soundSelected: "Sonido seleccionado.",
            close: "CERRAR",
            subscribe: "SUSCRÍBETE",
            founderOfGC: "Fundador de GC",
            firstVersionCoder: "Primer Programador de la Versión",
            mainCoder: "Programador Principal",
            bugFixer: "Corrector de Bugs",
            nicknamePlaceholder: "Apodo...",
            confirmNick: "CONFIRMAR NICK",
            confirmNickQuestion: "¿Seguro que quieres usar este nickname?",
            nickRequired: "El nickname es obligatorio.",
            nickConfirmed: "Nickname confirmado.",
            nickChangedNeedsConfirm: "Confirma tu nickname para desbloquear Play.",
            welcomeToGc: "Welcome to Greasy Client",
            modsTitle: "MODS GC",
            modsHint: "R-SHIFT para cerrar (arrastra el HUD al abrir)",
            menuBgLabel: "URL del fondo del menú:",
            customCrosshair: "MIRA PERSONALIZADA",
            fpsCounter: "CONTADOR FPS",
            cpsCounter: "CONTADOR CPS",
            keystrokes: "TECLAS",
            clock: "RELOJ",
            saveModules: "GUARDAR MÓDULOS",
            time: "HORA",
            language: "IDIOMA",
            accentColor: "COLOR DE ACENTO",
            customPresetName: "NOMBRE DEL PRESET",
            pickCustomColor: "ELIGE COLOR PERSONALIZADO",
            saveCustomColor: "GUARDAR COLOR PERSONALIZADO",
            customPresets: "PRESETS PERSONALIZADOS",
            yes: "SI",
            cancel: "CANCELAR",
            deleteQuestion: "¿Seguro que quieres eliminarlo?",
            limitReached: "Libera espacio. Máximo 10 colores personalizados.",
            presetSaved: "Color personalizado guardado.",
            presetDeleted: "Color personalizado eliminado.",
            invalidPresetName: "Escribe un nombre válido.",
            duplicatePreset: "Ese nombre ya existe.",
            english: "English",
            spanish: "Español",
            green: "Verde",
            blue: "Azul",
            purple: "Morado",
            red: "Rojo",
            gold: "Dorado",
            greasyTitle: "GREASY CLIENT",
            fps: "FPS",
            cps: "CPS",
            creditsTitle: "CRÉDITOS DEL CLIENT",
            creditsThanks: "Gracias por usar Greasy Client."
        }
    };

    function t(key) {
        const lang = settings.language || "en";
        return I18N[lang][key] || I18N.en[key] || key;
    }

    // ORIGINAL IMAGE MODIFIER
    function modifyMinibloxImages() {
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach(img => {
            if (img.src.includes('default-DKNlYibk.png')) {
                if (img.src !== settings.gameMenuBgUrl) {
                    img.src = settings.gameMenuBgUrl;
                }
            }
            if (img.src.includes('miniblox-Dj36hMhG.png') || img.src.includes('join-discord-73c5Y2Jf.png')) {
                img.style.display = 'none';
            }
        });
    }
    setInterval(modifyMinibloxImages, 500);

    // MINIBLOX BUTTON STYLE FIXED
    function styleMinibloxButtons() {
        const candidates = document.querySelectorAll('button, [role="button"], .btn, [class*="button"], [class*="Button"]');

        candidates.forEach(el => {
            if (!el || !el.classList) return;

            if (
                el.id?.startsWith('gc-') ||
                el.id === 'gc-play' ||
                el.id === 'gc-close-credits' ||
                el.classList.contains('gc-sub-btn') ||
                el.classList.contains('gc-subscribe-btn') ||
                el.closest('#gc-master-container') ||
                el.closest('#client-menu') ||
                el.closest('#gc-credits-modal') ||
                el.closest('#gc-delete-confirm-modal') ||
                el.closest('#gc-nick-confirm-modal')
            ) {
                el.classList.remove('gc-miniblox-rounded-btn');
                return;
            }

            const text = (el.textContent || "").trim().toLowerCase();
            const rect = el.getBoundingClientRect();
            const computed = window.getComputedStyle(el);

            const isVisible =
                rect.width > 0 &&
                rect.height > 0 &&
                computed.visibility !== 'hidden' &&
                computed.display !== 'none' &&
                parseFloat(computed.opacity || '1') > 0;

            const isTooSmall = rect.width < 95 || rect.height < 28;

            const looksLikeMainButton =
                text.includes("settings") ||
                text.includes("friends") ||
                text.includes("party") ||
                text.includes("shop") ||
                text.includes("rankings") ||
                text.includes("contact") ||
                text.includes("play") ||
                text.includes("sign in");

            const isMenuSizedButton = rect.width >= 120 && rect.height >= 40;

            if (isVisible && !isTooSmall && (looksLikeMainButton || isMenuSizedButton)) {
                el.classList.add('gc-miniblox-rounded-btn');
            } else {
                el.classList.remove('gc-miniblox-rounded-btn');
            }
        });
    }
    setInterval(styleMinibloxButtons, 700);

    // STYLES
    const style = document.createElement('style');
    style.id = 'gc-pro-style';
    document.head.appendChild(style);

    function applyTheme() {
        const presets = getAllColorPresets();
        const theme = presets[settings.accentPreset] || BASE_COLOR_PRESETS.green;

        style.innerHTML = `
            :root {
                --gc-accent: ${theme.accent};
                --gc-accent-2: ${theme.accent2};
                --gc-glow: ${theme.glow};
                --gc-bg-dark: #0b0d12;
                --gc-bg-panel: rgba(10, 13, 18, 0.86);
                --gc-border: rgba(255,255,255,0.08);
                --gc-text: #ffffff;
                --gc-text-muted: rgba(255,255,255,0.66);
                --gc-shadow: 0 20px 50px rgba(0,0,0,0.45);
                --gc-radius: 16px;
                --gc-ease: cubic-bezier(0.22, 1, 0.36, 1);
                --gc-fast: .18s;
                --gc-mid: .34s;
                --gc-slow: .55s;
            }

            @keyframes gcFadeInUp {
                from { opacity: 0; transform: translateY(22px) scale(.97); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes gcFadeOutDown {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to   { opacity: 0; transform: translateY(14px) scale(.97); }
            }

            @keyframes gcSoftPulse {
                0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 18px var(--gc-glow); }
                50%      { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 30px var(--gc-glow); }
            }

            @keyframes gcLogoFloat {
                0%,100% { transform: translateY(0px); }
                50%     { transform: translateY(-5px); }
            }

            @keyframes gcShine {
                0%   { transform: translateX(-140%); }
                100% { transform: translateX(220%); }
            }

            @keyframes gcCrosshairPulse {
                0%, 100% { opacity: .85; transform: translate(-50%, -50%) scale(1); }
                50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
            }

            @keyframes gcWelcomeGlow {
                0%   { opacity: 0; transform: translateY(-10px) scale(.94); }
                12%  { opacity: 1; transform: translateY(0) scale(1); }
                88%  { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-10px) scale(.96); }
            }

            #gc-master-container {
                position: fixed;
                inset: 0;
                background: #05070b;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', Arial, sans-serif;
                opacity: 1;
                transition: opacity .8s ease, transform .8s ease;
                overflow: hidden;
                isolation: isolate;
            }

            #gc-master-bg {
                position: absolute;
                inset: 0;
                z-index: 0;
                background-position: center center;
                background-repeat: no-repeat;
                background-size: cover;
                opacity: 0;
                transform: scale(1.02);
                transition: opacity .35s ease, transform .8s ease;
                will-change: opacity, transform;
            }

            #gc-master-container.gc-bg-ready #gc-master-bg {
                opacity: 1;
                transform: scale(1);
            }

            #gc-master-container::before {
                content: "";
                position: absolute;
                inset: 0;
                z-index: 1;
                background:
                    radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 30%),
                    linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.58));
                backdrop-filter: blur(3px);
                pointer-events: none;
            }

            #gc-branding,
            #gc-launcher-ui {
                position: relative;
                z-index: 2;
            }

            #gc-branding {
                text-align: center;
                animation: gcFadeInUp .8s var(--gc-ease);
            }

            #gc-branding img {
                width: 140px;
                border-radius: 22px;
                border: 3px solid var(--gc-accent);
                box-shadow: 0 0 25px var(--gc-glow);
                animation: gcLogoFloat 3s ease-in-out infinite, gcSoftPulse 2.4s ease-in-out infinite;
            }

            #gc-branding h1 {
                color: var(--gc-accent);
                font-size: 55px;
                margin: 15px 0 0;
                letter-spacing: 15px;
                font-weight: 900;
                text-shadow: 0 0 12px var(--gc-glow);
            }

            #gc-tagline {
                color: #fff;
                opacity: .92;
                margin-top: 10px;
                font-size: 14px;
                letter-spacing: .4px;
            }

            #gc-launcher-ui {
                display: none;
                opacity: 0;
                transform: translateY(16px) scale(.97);
                transition: opacity var(--gc-slow) var(--gc-ease), transform var(--gc-slow) var(--gc-ease);
            }

            #gc-launcher-ui.gc-show {
                display: block !important;
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }

            .gc-box {
                width: 360px;
                margin-top: 26px;
                background: var(--gc-bg-panel);
                backdrop-filter: blur(10px);
                border: 1px solid var(--gc-border);
                border-radius: 20px;
                padding: 22px;
                text-align: center;
                box-shadow: var(--gc-shadow);
                animation: gcFadeInUp .55s var(--gc-ease);
            }

            .gc-input-field,
            .gc-select,
            .gc-color-input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                margin: 6px 0;
                background: rgba(0,0,0,0.45);
                border: 1px solid rgba(255,255,255,0.1);
                color: var(--gc-accent);
                border-radius: 10px;
                text-align: center;
                font-size: 12px;
                outline: none;
                transition: border-color .2s ease, box-shadow .2s ease, transform .14s ease;
            }

            .gc-input-field:focus,
            .gc-select:focus,
            .gc-color-input:focus {
                border-color: var(--gc-accent);
                box-shadow: 0 0 0 3px color-mix(in srgb, var(--gc-accent) 18%, transparent);
                transform: scale(1.01);
            }

            .gc-color-input {
                height: 44px;
                padding: 4px;
                cursor: pointer;
            }

            .gc-nick-row {
                display: grid;
                grid-template-columns: 1fr 48px;
                gap: 10px;
                align-items: center;
            }

            #gc-nick-confirm-btn {
                height: 42px;
                margin-top: 6px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
                background: linear-gradient(135deg, var(--gc-accent), var(--gc-accent-2));
                color: #08110d;
                font-weight: 900;
                font-size: 22px;
                cursor: pointer;
                box-shadow: 0 8px 18px color-mix(in srgb, var(--gc-accent) 24%, transparent);
                transition: transform .16s ease, filter .2s ease, box-shadow .2s ease;
            }

            #gc-nick-confirm-btn:hover {
                transform: translateY(-1px);
                filter: brightness(1.05);
            }

            .gc-sub-btn, #gc-play, #gc-credits-btn, #gc-close-credits, #gc-close-sounds, #gc-test-sound, .gc-sound-option, #gc-save-custom-color, #gc-delete-yes, #gc-delete-cancel, #gc-nick-yes, #gc-nick-cancel {
                position: relative;
                width: 100%;
                overflow: hidden;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 800;
                letter-spacing: .35px;
                transition: transform .16s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease, filter .22s ease;
            }

            .gc-sub-btn::before,
            #gc-play::before,
            #gc-credits-btn::before,
            #gc-close-credits::before,
            #gc-close-sounds::before,
            #gc-test-sound::before,
            .gc-sound-option::before,
            #gc-save-custom-color::before,
            #gc-delete-yes::before,
            #gc-delete-cancel::before,
            #gc-nick-yes::before,
            #gc-nick-cancel::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 40%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
                transform: translateX(-140%);
                pointer-events: none;
            }

            .gc-sub-btn:hover::before,
            #gc-play:hover::before,
            #gc-credits-btn:hover::before,
            #gc-close-credits:hover::before,
            #gc-close-sounds:hover::before,
            #gc-test-sound:hover::before,
            .gc-sound-option:hover::before,
            #gc-save-custom-color:hover::before,
            #gc-delete-yes:hover::before,
            #gc-delete-cancel:hover::before,
            #gc-nick-yes:hover::before,
            #gc-nick-cancel:hover::before {
                animation: gcShine .8s linear;
            }

            #gc-play {
                background: linear-gradient(135deg, var(--gc-accent), var(--gc-accent-2));
                color: #08110d;
                border: none;
                padding: 15px;
                font-size: 19px;
                margin-top: 10px;
                box-shadow: 0 10px 22px color-mix(in srgb, var(--gc-accent) 24%, transparent);
            }

            #gc-play:hover:not(:disabled) {
                transform: translateY(-2px);
                filter: brightness(1.05);
                box-shadow: 0 14px 28px color-mix(in srgb, var(--gc-accent) 34%, transparent);
            }

            #gc-play:disabled {
                opacity: .45;
                cursor: not-allowed;
                filter: grayscale(.15);
                box-shadow: none;
            }

            .gc-sub-btn, #gc-credits-btn, #gc-close-credits, #gc-close-sounds, #gc-test-sound, .gc-sound-option, #gc-delete-cancel, #gc-nick-cancel {
                background: rgba(255,255,255,0.03);
                color: var(--gc-text);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 11px;
                margin-top: 10px;
                font-family: monospace;
            }

            #gc-save-custom-color,
            #gc-delete-yes,
            #gc-nick-yes {
                background: linear-gradient(135deg, var(--gc-accent), var(--gc-accent-2));
                color: #08110d;
                border: none;
                padding: 11px;
                margin-top: 10px;
                font-family: monospace;
                box-shadow: 0 8px 18px color-mix(in srgb, var(--gc-accent) 24%, transparent);
            }

            .gc-sub-btn:hover,
            #gc-credits-btn:hover,
            #gc-close-credits:hover,
            #gc-close-sounds:hover,
            #gc-test-sound:hover,
            .gc-sound-option:hover,
            #gc-delete-cancel:hover,
            #gc-save-custom-color:hover,
            #gc-delete-yes:hover,
            #gc-nick-yes:hover,
            #gc-nick-cancel:hover {
                transform: translateY(-1px);
                border-color: var(--gc-accent);
                box-shadow: 0 0 16px color-mix(in srgb, var(--gc-accent) 18%, transparent);
            }

            .gc-sub-btn:active,
            #gc-play:active,
            #gc-credits-btn:active,
            #gc-close-credits:active,
            #gc-save-custom-color:active,
            #gc-delete-yes:active,
            #gc-delete-cancel:active,
            #gc-nick-yes:active,
            #gc-nick-cancel:active {
                transform: scale(.98);
            }

            .gc-label {
                text-align: left;
                font-size: 12px;
                color: var(--gc-text-muted);
                margin: 10px 0 4px;
            }

            .active-opt {
                border-color: var(--gc-accent) !important;
                color: var(--gc-accent) !important;
                box-shadow: 0 0 14px color-mix(in srgb, var(--gc-accent) 16%, transparent);
            }

            #greasy-main-title {
                position: fixed;
                font-family: Arial, sans-serif;
                font-size: 38px;
                font-weight: bold;
                color: var(--gc-accent-2);
                z-index: 10001;
                pointer-events: none;
                display: none;
                white-space: nowrap;
                text-shadow: 0 0 18px color-mix(in srgb, var(--gc-accent) 30%, transparent), 2px 2px 4px rgba(0,0,0,0.5);
            }

            .draggable-hud {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                color: white;
                text-shadow: 2px 2px 2px black;
                display: none;
                opacity: 0;
                transform: translateX(-14px) scale(.97);
                transition: opacity var(--gc-mid) var(--gc-ease), transform var(--gc-mid) var(--gc-ease);
            }

            .draggable-hud.gc-show {
                display: block !important;
                opacity: 1;
                transform: translateX(0) scale(1);
            }

            .menu-open .draggable-hud,
            .menu-open #greasy-main-title {
                pointer-events: auto !important;
                cursor: move !important;
                outline: 1px dashed var(--gc-accent);
                background: color-mix(in srgb, var(--gc-accent) 10%, transparent);
            }

            .hud-item {
                background: rgba(0,0,0,0.58);
                padding: 7px 14px;
                border-radius: 8px;
                font-weight: bold;
                border-left: 3px solid var(--gc-accent);
                margin-bottom: 6px;
                font-family: monospace;
                backdrop-filter: blur(4px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.18);
            }

            #gc-welcome-banner {
                position: fixed;
                z-index: 100020;
                display: none;
                pointer-events: none;
                padding: 14px 20px;
                border-radius: 18px;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 24px;
                font-weight: 900;
                color: #fff;
                background:
                    linear-gradient(135deg,
                        color-mix(in srgb, var(--gc-accent) 80%, transparent),
                        color-mix(in srgb, var(--gc-accent-2) 78%, transparent));
                border: 2px solid color-mix(in srgb, var(--gc-accent) 70%, white 30%);
                box-shadow:
                    0 0 14px var(--gc-glow),
                    0 0 34px var(--gc-glow),
                    0 20px 40px rgba(0,0,0,0.35);
                text-shadow:
                    0 0 10px rgba(255,255,255,0.28),
                    0 2px 10px rgba(0,0,0,0.35);
                white-space: nowrap;
            }

            #gc-welcome-banner.gc-show {
                display: block !important;
                animation: gcWelcomeGlow 5s var(--gc-ease) forwards;
            }

            .key-row {
                display: flex;
                gap: 4px;
                margin-top: 4px;
                justify-content: center;
            }

            .key {
                width: 45px;
                height: 45px;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                font-weight: bold;
                transition: transform .08s ease, background .12s ease, box-shadow .12s ease, color .12s ease, border-color .12s ease;
                border: 1px solid rgba(255,255,255,0.08);
                backdrop-filter: blur(2px);
                user-select: none;
            }

            .key-space {
                width: 145px;
                font-size: 14px;
            }

            .key-mouse {
                width: 68px;
                font-size: 13px;
            }

            .key.active {
                background: var(--gc-accent);
                color: black;
                box-shadow: 0 0 12px var(--gc-glow);
                border-color: var(--gc-accent);
                transform: scale(.9);
            }

            #gc-crosshair {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 18px;
                height: 18px;
                pointer-events: none;
                z-index: 200000;
                display: none;
                animation: gcCrosshairPulse 1.6s ease-in-out infinite;
            }

            .ch-line {
                position: absolute;
                background: var(--gc-accent);
                box-shadow: 0 0 8px var(--gc-glow);
            }

            .ch-v { width: 2px; height: 100%; left: 8px; }
            .ch-h { width: 100%; height: 2px; top: 8px; }

            #client-menu,
            #gc-credits-modal,
            #gc-sounds-modal,
            #gc-delete-confirm-modal,
            #gc-nick-confirm-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(.95);
                background: rgba(12, 14, 18, 0.92);
                border: 1px solid rgba(255,255,255,0.08);
                padding: 24px;
                color: white;
                z-index: 100002;
                border-radius: 18px;
                display: none;
                min-width: 330px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.52), 0 0 18px color-mix(in srgb, var(--gc-accent) 12%, transparent);
                opacity: 0;
                transition: opacity var(--gc-mid) var(--gc-ease), transform var(--gc-mid) var(--gc-ease);
                backdrop-filter: blur(10px);
            }

            #client-menu {
                max-height: 88vh;
                overflow-y: auto;
                width: min(560px, calc(100vw - 28px));
                padding: 26px;
            }

            #client-menu.gc-open,
            #gc-credits-modal.gc-open,
            #gc-sounds-modal.gc-open,
            #gc-delete-confirm-modal.gc-open,
            #gc-nick-confirm-modal.gc-open {
                display: block !important;
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
                animation: gcFadeInUp .26s var(--gc-ease);
            }

            #client-menu.gc-closing,
            #gc-credits-modal.gc-closing,
            #gc-sounds-modal.gc-closing,
            #gc-delete-confirm-modal.gc-closing,
            #gc-nick-confirm-modal.gc-closing {
                animation: gcFadeOutDown .22s ease forwards;
            }

            #gc-credits-modal,
            #gc-sounds-modal {
                min-width: 420px;
                max-width: 560px;
                z-index: 100003;
            }

            #gc-delete-confirm-modal,
            #gc-nick-confirm-modal {
                min-width: 320px;
                max-width: 400px;
                z-index: 100004;
            }

            .gc-credits-title {
                margin: 0 0 12px 0;
                color: var(--gc-accent);
                font-size: 24px;
                font-weight: 900;
                letter-spacing: .6px;
            }

            .gc-credit-entry {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin: 12px 0;
                padding: 12px 14px;
                border-radius: 12px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                text-align: left;
            }

            .gc-credit-info {
                flex: 1;
                min-width: 0;
            }

            .gc-credit-main {
                color: var(--gc-text);
                font-size: 15px;
                font-weight: 800;
                line-height: 1.2;
            }

            .gc-credit-sub {
                color: var(--gc-text-muted);
                font-size: 12px;
                margin-top: 3px;
                word-break: break-word;
            }

            .gc-subscribe-btn {
                min-width: 120px;
                width: auto;
                padding: 10px 14px;
                background: linear-gradient(135deg, var(--gc-accent), var(--gc-accent-2));
                color: #08110d;
                border: none;
                border-radius: 10px;
                font-weight: 900;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 0 8px 18px color-mix(in srgb, var(--gc-accent) 24%, transparent);
                transition: transform .16s ease, filter .2s ease, box-shadow .2s ease;
                flex-shrink: 0;
            }

            .gc-subscribe-btn:hover {
                transform: translateY(-1px);
                filter: brightness(1.05);
                box-shadow: 0 10px 22px color-mix(in srgb, var(--gc-accent) 34%, transparent);
            }

            .gc-subscribe-btn:active {
                transform: scale(.98);
            }

            .gc-credits-label {
                color: var(--gc-text-muted);
                display: block;
                font-size: 12px;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: .8px;
            }

            .gc-credits-line {
                margin: 10px 0;
                color: var(--gc-text);
                font-size: 14px;
            }

            .gc-sounds-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
                margin-top: 12px;
            }

            .gc-sound-option {
                min-height: 54px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .gc-sound-option.gc-selected-sound {
                border-color: var(--gc-accent) !important;
                color: var(--gc-accent) !important;
                box-shadow: 0 0 18px color-mix(in srgb, var(--gc-accent) 22%, transparent);
            }

            .gc-sound-toggle-row {
                margin-top: 12px;
                padding: 12px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.03);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                text-align: left;
            }

            .gc-sound-volume-wrap {
                margin-top: 12px;
                padding: 12px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.03);
                text-align: left;
            }

            .gc-sound-volume-row {
                display: grid;
                grid-template-columns: 1fr 54px;
                gap: 12px;
                align-items: center;
                margin-top: 8px;
            }

            #gc-sound-volume {
                width: 100%;
                accent-color: var(--gc-accent);
                cursor: pointer;
            }

            #gc-sound-volume-value {
                color: var(--gc-accent);
                font-weight: 900;
                font-family: monospace;
                text-align: right;
            }


            .gc-sound-switch {
                width: 48px;
                height: 26px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.12);
                background: rgba(255,255,255,0.10);
                position: relative;
                cursor: pointer;
                flex-shrink: 0;
                transition: background .2s ease, border-color .2s ease;
            }

            .gc-sound-switch::after {
                content: "";
                position: absolute;
                top: 3px;
                left: 3px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fff;
                transition: transform .2s ease;
            }

            .gc-sound-switch.gc-on {
                background: var(--gc-accent);
                border-color: var(--gc-accent);
            }

            .gc-sound-switch.gc-on::after {
                transform: translateX(22px);
            }

            .gc-row-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 8px;
            }

            .gc-menu-header {
                margin-bottom: 16px;
                text-align: left;
            }

            .gc-menu-header h2 {
                margin: 0;
                color: var(--gc-accent);
                font-size: 28px;
                letter-spacing: .6px;
            }

            .gc-menu-header p {
                font-size: 12px;
                color: #8f98a3;
                margin: 6px 0 0;
            }

            .gc-settings-section {
                margin-top: 14px;
                padding: 14px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 16px;
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
            }

            .gc-section-title {
                color: var(--gc-text);
                font-size: 13px;
                font-weight: 800;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: .8px;
            }

            .gc-settings-section .gc-label:first-child {
                margin-top: 0;
            }

            .gc-modules-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin-top: 4px;
            }

            .gc-modules-grid .gc-sub-btn {
                width: 100%;
                margin-top: 0;
                min-height: 54px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .gc-full-span {
                grid-column: 1 / -1;
            }

            .gc-inline-note {
                font-size: 11px;
                color: var(--gc-text-muted);
                margin-top: 8px;
                text-align: left;
                line-height: 1.45;
            }

            @media (max-width: 640px) {
                #client-menu {
                    width: min(96vw, 560px);
                    padding: 18px;
                }

                .gc-row-2,
                .gc-modules-grid {
                    grid-template-columns: 1fr;
                }

                .gc-menu-header h2 {
                    font-size: 24px;
                }
            }

            .gc-footer-version {
                position: fixed;
                bottom: 10px;
                right: 15px;
                color: rgba(255,255,255,0.35);
                font-family: monospace;
                z-index: 3;
            }

            .gc-fade-out {
                opacity: 0 !important;
                transform: scale(.97) translateY(10px) !important;
                pointer-events: none !important;
            }

            .gc-miniblox-rounded-btn {
                border-radius: 18px !important;
                border: 2px solid var(--gc-accent) !important;
                box-shadow:
                    0 0 0 1px rgba(255,255,255,0.03) inset,
                    0 0 14px color-mix(in srgb, var(--gc-accent) 20%, transparent) !important;
                transition:
                    transform .16s ease,
                    box-shadow .22s ease,
                    border-color .22s ease,
                    filter .22s ease !important;
                overflow: hidden !important;
                background-clip: padding-box !important;
            }

            .gc-miniblox-rounded-btn:hover {
                border-color: var(--gc-accent) !important;
                box-shadow:
                    0 0 0 1px rgba(255,255,255,0.05) inset,
                    0 0 22px color-mix(in srgb, var(--gc-accent) 30%, transparent) !important;
                filter: brightness(1.04) !important;
                transform: translateY(-1px);
            }

            .gc-miniblox-rounded-btn:active {
                transform: scale(.98);
            }

            .gc-miniblox-rounded-btn > *,
            .gc-miniblox-rounded-btn span,
            .gc-miniblox-rounded-btn div,
            .gc-miniblox-rounded-btn p,
            .gc-miniblox-rounded-btn svg {
                border-radius: inherit !important;
            }

            .gc-miniblox-rounded-btn::before,
            .gc-miniblox-rounded-btn::after {
                border-radius: inherit !important;
            }

            .gc-custom-presets-wrap {
                margin-top: 10px;
                padding: 10px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 12px;
            }

            .gc-custom-preset-entry {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
                padding: 8px;
                border-radius: 10px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
            }

            .gc-custom-preset-swatch {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                flex-shrink: 0;
                border: 1px solid rgba(255,255,255,0.22);
                box-shadow: 0 0 8px rgba(0,0,0,0.18);
            }

            .gc-custom-preset-name {
                flex: 1;
                text-align: left;
                font-size: 12px;
                color: var(--gc-text);
                word-break: break-word;
            }

            .gc-custom-preset-remove {
                width: 28px;
                height: 28px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04);
                color: #fff;
                cursor: pointer;
                font-weight: 900;
                flex-shrink: 0;
                transition: transform .15s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
            }

            .gc-custom-preset-remove:hover {
                transform: translateY(-1px);
                border-color: var(--gc-accent);
                box-shadow: 0 0 12px color-mix(in srgb, var(--gc-accent) 18%, transparent);
                background: rgba(255,255,255,0.08);
            }

            .gc-delete-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 16px;
            }

            .gc-mini-notice {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(-8px);
                z-index: 100010;
                padding: 10px 14px;
                border-radius: 12px;
                font-family: monospace;
                font-size: 12px;
                color: #fff;
                display: none;
                opacity: 0;
                transition: opacity .22s ease, transform .22s ease;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 10px 28px rgba(0,0,0,0.35);
            }

            .gc-mini-notice.gc-ok {
                background: rgba(12, 18, 14, 0.88);
                border-color: color-mix(in srgb, var(--gc-accent) 50%, rgba(255,255,255,0.1));
            }

            .gc-mini-notice.gc-error {
                background: rgba(28, 10, 14, 0.9);
                border-color: rgba(255,92,122,0.45);
            }

            @keyframes gcButtonPop {
                0% { transform: scale(1); }
                45% { transform: scale(0.965); }
                100% { transform: scale(1); }
            }

            @keyframes gcModuleGlowOn {
                0% { box-shadow: 0 0 0 rgba(0,0,0,0); }
                45% { box-shadow: 0 0 22px var(--gc-glow); }
                100% { box-shadow: 0 0 14px color-mix(in srgb, var(--gc-accent) 16%, transparent); }
            }

            @keyframes gcPanelAura {
                0% { box-shadow: 0 20px 60px rgba(0,0,0,0.52), 0 0 0 color-mix(in srgb, var(--gc-accent) 0%, transparent); }
                50% { box-shadow: 0 24px 70px rgba(0,0,0,0.58), 0 0 32px color-mix(in srgb, var(--gc-accent) 20%, transparent); }
                100% { box-shadow: 0 20px 60px rgba(0,0,0,0.52), 0 0 18px color-mix(in srgb, var(--gc-accent) 12%, transparent); }
            }

            #client-menu.gc-open,
            #gc-credits-modal.gc-open,
            #gc-sounds-modal.gc-open,
            #gc-delete-confirm-modal.gc-open,
            #gc-nick-confirm-modal.gc-open {
                animation:
                    gcFadeInUp .24s var(--gc-ease),
                    gcPanelAura .72s ease-out;
            }

            .gc-sub-btn,
            #gc-play,
            #gc-credits-btn,
            #gc-close-credits,
            #gc-close-sounds,
            .gc-sound-option,
            #gc-save-custom-color,
            #gc-delete-yes,
            #gc-delete-cancel,
            #gc-nick-yes,
            #gc-nick-cancel,
            #gc-test-sound {
                transform: translateZ(0);
                will-change: transform, box-shadow, filter;
            }

            .gc-sub-btn:hover,
            #gc-play:hover:not(:disabled),
            #gc-credits-btn:hover,
            #gc-close-credits:hover,
            #gc-close-sounds:hover,
            .gc-sound-option:hover,
            #gc-save-custom-color:hover,
            #gc-delete-yes:hover,
            #gc-delete-cancel:hover,
            #gc-nick-yes:hover,
            #gc-nick-cancel:hover,
            #gc-test-sound:hover {
                transform: translateY(-2px) scale(1.015);
                filter: brightness(1.08);
            }

            .gc-sub-btn:active,
            #gc-play:active,
            #gc-credits-btn:active,
            #gc-close-credits:active,
            #gc-close-sounds:active,
            .gc-sound-option:active,
            #gc-save-custom-color:active,
            #gc-delete-yes:active,
            #gc-delete-cancel:active,
            #gc-nick-yes:active,
            #gc-nick-cancel:active,
            #gc-test-sound:active {
                animation: gcButtonPop .18s ease-out;
            }

            .active-opt,
            .gc-selected-sound {
                animation: gcModuleGlowOn .32s ease-out;
            }

            .draggable-hud.gc-show {
                transition:
                    opacity .28s var(--gc-ease),
                    transform .28s var(--gc-ease),
                    filter .22s ease;
                filter: drop-shadow(0 8px 18px rgba(0,0,0,.28));
            }

            .key.active {
                animation: gcButtonPop .12s ease-out;
            }

            .gc-magnetic-button {
                transition:
                    transform .18s var(--gc-ease),
                    box-shadow .22s ease,
                    border-color .22s ease,
                    filter .22s ease;
                will-change: transform;
            }

            .gc-magnetic-button.gc-magnet-active {
                filter: brightness(1.08);
            }

            body.gc-performance-mode *,
            body.gc-performance-mode *::before,
            body.gc-performance-mode *::after {
                animation-duration: .01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: .01ms !important;
                scroll-behavior: auto !important;
            }

            body.gc-performance-mode #gc-master-container::before,
            body.gc-performance-mode #client-menu,
            body.gc-performance-mode #gc-credits-modal,
            body.gc-performance-mode #gc-sounds-modal,
            body.gc-performance-mode #gc-delete-confirm-modal,
            body.gc-performance-mode #gc-nick-confirm-modal,
            body.gc-performance-mode .hud-item {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            body.gc-performance-mode #client-menu,
            body.gc-performance-mode #gc-credits-modal,
            body.gc-performance-mode #gc-sounds-modal,
            body.gc-performance-mode #gc-delete-confirm-modal,
            body.gc-performance-mode #gc-nick-confirm-modal,
            body.gc-performance-mode .hud-item,
            body.gc-performance-mode .key,
            body.gc-performance-mode .gc-box {
                box-shadow: 0 8px 18px rgba(0,0,0,0.32) !important;
            }

            body.gc-performance-mode .gc-magnetic-button,
            body.gc-performance-mode .gc-magnetic-button:hover,
            body.gc-performance-mode .gc-magnetic-button.gc-magnet-active {
                transform: none !important;
                filter: none !important;
            }

            body.gc-performance-mode #gc-crosshair,
            body.gc-performance-mode .draggable-hud.gc-show {
                animation: none !important;
                filter: none !important;
            }

            #gc-custom-presets-empty {
                color: var(--gc-text-muted);
                font-size: 12px;
                margin-top: 8px;
            }
        `;
    }

    // DRAGGABLE LOGIC
    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function clampElementToViewport(el) {
        if (!el) return;

        const margin = 4;
        const currentDisplay = el.style.display;
        const currentVisibility = el.style.visibility;
        const computed = window.getComputedStyle(el);
        const wasHidden = computed.display === 'none';

        if (wasHidden) {
            el.style.visibility = 'hidden';
            el.style.display = 'block';
        }

        const width = el.offsetWidth || 1;
        const height = el.offsetHeight || 1;
        const maxLeft = Math.max(margin, window.innerWidth - width - margin);
        const maxTop = Math.max(margin, window.innerHeight - height - margin);

        const nextLeft = clampNumber(el.offsetLeft, margin, maxLeft);
        const nextTop = clampNumber(el.offsetTop, margin, maxTop);

        el.style.left = nextLeft + 'px';
        el.style.top = nextTop + 'px';

        if (wasHidden) {
            el.style.display = currentDisplay;
            el.style.visibility = currentVisibility;
        }
    }

    function getPositionForElement(id) {
        if (settings.autoSaveModules && settings.positions && settings.positions[id]) {
            return settings.positions[id];
        }

        return defaultSettings.positions[id] || { top: '15px', left: '15px' };
    }

    function applyModulePositions() {
        moduleIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const pos = getPositionForElement(id);
            el.style.top = pos.top;
            el.style.left = pos.left;
            clampElementToViewport(el);
        });
    }

    function captureModulePositions() {
        if (!settings.positions) settings.positions = {};

        moduleIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            clampElementToViewport(el);
            settings.positions[id] = {
                top: el.style.top,
                left: el.style.left
            };
        });
    }

    function makeDraggable(el) {
        let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
        el.onmousedown = (e) => {
            if (!document.body.classList.contains('menu-open')) return;
            e.preventDefault();
            p3 = e.clientX;
            p4 = e.clientY;

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;

                clampElementToViewport(el);

                if (settings.autoSaveModules) {
                    settings.positions[el.id] = { top: el.style.top, left: el.style.left };
                    save();
                }
            };

            document.onmousemove = (e) => {
                e.preventDefault();
                p1 = p3 - e.clientX;
                p2 = p4 - e.clientY;
                p3 = e.clientX;
                p4 = e.clientY;
                el.style.top = (el.offsetTop - p2) + "px";
                el.style.left = (el.offsetLeft - p1) + "px";
                clampElementToViewport(el);
            };
        };
    }

    // UI HELPERS
    function revealHUD(el) {
        if (!el) return;
        el.style.display = 'block';
        requestAnimationFrame(() => el.classList.add('gc-show'));
    }

    function hideHUD(el) {
        if (!el) return;
        el.classList.remove('gc-show');
        setTimeout(() => {
            if (!el.classList.contains('gc-show')) el.style.display = 'none';
        }, 260);
    }

    function openPanel(panel) {
        if (!panel) return;

        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.classList.remove('gc-closing');
        panel.classList.add('gc-open');

        panel.style.opacity = '0';
        panel.style.transform = 'translate(-50%, -48%) scale(.96)';

        requestAnimationFrame(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    function closePanel(panel) {
        if (!panel) return;

        panel.classList.remove('gc-open');
        panel.classList.add('gc-closing');

        panel.style.opacity = '0';
        panel.style.transform = 'translate(-50%, -52%) scale(.96)';

        setTimeout(() => {
            panel.style.display = 'none';
            panel.style.visibility = 'visible';
            panel.classList.remove('gc-closing');
            panel.style.opacity = '';
            panel.style.transform = '';
        }, 180);
    }

    function toggleMenu(menu) {
        const isVisible = menu.style.display === 'block' && menu.classList.contains('gc-open');
        if (isVisible) {
            closePanel(menu);
            document.body.classList.remove('menu-open');
        } else {
            openPanel(menu);
            document.body.classList.add('menu-open');
        }
    }

    function createHUDElement(id, html, pos) {
        const el = document.body.appendChild(document.createElement('div'));
        el.id = id;
        el.className = 'draggable-hud';
        el.style.top = pos.top;
        el.style.left = pos.left;
        el.innerHTML = html;
        return el;
    }

    function renderAccentSelect() {
        const accentSelect = document.getElementById('gc-accent-select');
        if (!accentSelect) return;

        const current = settings.accentPreset;
        let html = `
            <option value="green">${t('green')}</option>
            <option value="blue">${t('blue')}</option>
            <option value="purple">${t('purple')}</option>
            <option value="red">${t('red')}</option>
            <option value="gold">${t('gold')}</option>
        `;

        const customEntries = getCustomPresetEntries();
        customEntries.forEach(([key, data]) => {
            html += `<option value="${key}">${data.label || key}</option>`;
        });

        accentSelect.innerHTML = html;
        accentSelect.value = current in getAllColorPresets() ? current : "green";
        settings.accentPreset = accentSelect.value;
    }

    function renderCustomPresetList() {
        const wrap = document.getElementById('gc-custom-presets-list');
        if (!wrap) return;

        const customEntries = getCustomPresetEntries();
        if (!customEntries.length) {
            wrap.innerHTML = `<div id="gc-custom-presets-empty">—</div>`;
            return;
        }

        wrap.innerHTML = customEntries.map(([key, data]) => {
            const label = (data.label || key).replace(/"/g, '&quot;');
            const accent = data.accent || '#ffffff';
            return `
                <div class="gc-custom-preset-entry">
                    <div class="gc-custom-preset-swatch" style="background:${accent};"></div>
                    <div class="gc-custom-preset-name">${label}</div>
                    <button class="gc-custom-preset-remove" data-preset-key="${key}" title="Delete">X</button>
                </div>
            `;
        }).join('');
    }

    function syncCustomPresetUI() {
        renderAccentSelect();
        renderCustomPresetList();

        const countLabel = document.getElementById('gc-custom-count');
        if (countLabel) {
            countLabel.textContent = `${getCustomPresetEntries().length}/${MAX_CUSTOM_PRESETS}`;
        }
    }

    function refreshPlayButtonState() {
        const playBtn = document.getElementById('gc-play');
        const nickInput = document.getElementById('gc-nick-input');
        if (!playBtn || !nickInput) return;

        const nick = nickInput.value.trim();
        playBtn.disabled = !(nick && settings.nicknameConfirmed && nick === settings.nickname.trim());
    }

    function showWelcomeBanner() {
        const welcome = document.getElementById('gc-welcome-banner');
        if (!welcome) return;

        welcome.textContent = `${t('welcomeToGc')} ${settings.nickname}!!`;
        welcome.style.display = 'block';
        welcome.classList.remove('gc-show');
        void welcome.offsetWidth;
        welcome.classList.add('gc-show');

        clearTimeout(showWelcomeBanner._timer);
        showWelcomeBanner._timer = setTimeout(() => {
            welcome.classList.remove('gc-show');
            setTimeout(() => {
                if (!welcome.classList.contains('gc-show')) {
                    welcome.style.display = 'none';
                }
            }, 260);
        }, 5000);
    }

    function updateTexts() {
        const nickInput = document.getElementById('gc-nick-input');
        if (nickInput) nickInput.placeholder = t('nicknamePlaceholder');

        const playBtn = document.getElementById('gc-play');
        if (playBtn) playBtn.textContent = t('play');

        const nickConfirmBtn = document.getElementById('gc-nick-confirm-btn');
        if (nickConfirmBtn) nickConfirmBtn.title = t('confirmNick');

        const settingsBtn = document.getElementById('gc-open-settings');
        if (settingsBtn) settingsBtn.textContent = t('modSettings');

        const discordBtn = document.getElementById('gc-discord');
        if (discordBtn) discordBtn.textContent = t('discord');

        const creditsBtn = document.getElementById('gc-credits-btn');
        if (creditsBtn) creditsBtn.textContent = t('credits');

        const soundsBtn = document.getElementById('gc-sounds-btn');
        if (soundsBtn) soundsBtn.textContent = t('sounds');

        const closeCreditsBtn = document.getElementById('gc-close-credits');
        if (closeCreditsBtn) closeCreditsBtn.textContent = t('close');

        const closeSoundsBtn = document.getElementById('gc-close-sounds');
        if (closeSoundsBtn) closeSoundsBtn.textContent = t('close');

        const soundsTitle = document.getElementById('gc-sounds-title');
        if (soundsTitle) soundsTitle.textContent = t('soundsTitle');

        const soundsEnabledLabel = document.getElementById('gc-sounds-enabled-label');
        if (soundsEnabledLabel) soundsEnabledLabel.textContent = t('soundsEnabled');

        const soundVolumeLabel = document.getElementById('gc-sound-volume-label');
        if (soundVolumeLabel) soundVolumeLabel.textContent = t('soundVolume');

        const soundTestBtn = document.getElementById('gc-test-sound');
        if (soundTestBtn) soundTestBtn.textContent = t('soundTest');

        const soundVolumeInput = document.getElementById('gc-sound-volume');
        const soundVolumeValue = document.getElementById('gc-sound-volume-value');
        if (soundVolumeInput) soundVolumeInput.value = settings.soundVolume;
        if (soundVolumeValue) soundVolumeValue.textContent = `${settings.soundVolume}%`;

        document.querySelectorAll('.gc-sound-option').forEach(btn => {
            const preset = btn.getAttribute('data-sound-preset');
            const key = {
                crystal: 'soundCrystal',
                cyber: 'soundCyber',
                bubble: 'soundBubble',
                retro: 'soundRetro',
                soft: 'soundSoft'
            }[preset];

            if (key) btn.textContent = t(key);
            btn.classList.toggle('gc-selected-sound', preset === settings.soundPreset);
        });

        const soundsToggle = document.getElementById('gc-sounds-toggle');
        if (soundsToggle) soundsToggle.classList.toggle('gc-on', settings.soundsEnabled);

        const subscribeFounder = document.getElementById('gc-sub-founder');
        if (subscribeFounder) subscribeFounder.textContent = t('subscribe');

        const subscribeFirstCoder = document.getElementById('gc-sub-firstcoder');
        if (subscribeFirstCoder) subscribeFirstCoder.textContent = t('subscribe');

        const subscribeMainCoder = document.getElementById('gc-sub-maincoder');
        if (subscribeMainCoder) subscribeMainCoder.textContent = t('subscribe');

        const title = document.getElementById('greasy-main-title');
        if (title) title.textContent = t('greasyTitle');

        const modsTitle = document.getElementById('gc-mods-title');
        if (modsTitle) modsTitle.textContent = t('modsTitle');

        const modsHint = document.getElementById('gc-mods-hint');
        if (modsHint) modsHint.textContent = t('modsHint');

        const menuBgLabel = document.getElementById('gc-menu-bg-label');
        if (menuBgLabel) menuBgLabel.textContent = t('menuBgLabel');

        const btnCross = document.getElementById('btn-cross');
        if (btnCross) btnCross.textContent = t('customCrosshair');

        const btnFps = document.getElementById('btn-fps');
        if (btnFps) btnFps.textContent = t('fpsCounter');

        const btnCps = document.getElementById('btn-cps');
        if (btnCps) btnCps.textContent = t('cpsCounter');

        const btnKeys = document.getElementById('btn-keys');
        if (btnKeys) btnKeys.textContent = t('keystrokes');

        const btnClock = document.getElementById('btn-clock');
        if (btnClock) btnClock.textContent = t('clock');

        const btnSaveModules = document.getElementById('btn-save-modules');
        if (btnSaveModules) btnSaveModules.textContent = t('saveModules');

        const btnOptimizedMode = document.getElementById('btn-optimized-mode');
        if (btnOptimizedMode) btnOptimizedMode.textContent = t('optimizedMode');

        const langLabel = document.getElementById('gc-language-label');
        if (langLabel) langLabel.textContent = t('language');

        const accentLabel = document.getElementById('gc-accent-label');
        if (accentLabel) accentLabel.textContent = t('accentColor');

        const customNameLabel = document.getElementById('gc-custom-name-label');
        if (customNameLabel) customNameLabel.textContent = t('customPresetName');

        const customColorLabel = document.getElementById('gc-custom-color-label');
        if (customColorLabel) customColorLabel.textContent = t('pickCustomColor');

        const saveCustomBtn = document.getElementById('gc-save-custom-color');
        if (saveCustomBtn) saveCustomBtn.textContent = t('saveCustomColor');

        const customPresetsLabel = document.getElementById('gc-custom-presets-label');
        if (customPresetsLabel) customPresetsLabel.textContent = t('customPresets');

        const customNameInput = document.getElementById('gc-custom-name-input');
        if (customNameInput) customNameInput.placeholder = t('customPresetName');

        const deleteQuestion = document.getElementById('gc-delete-question');
        if (deleteQuestion) deleteQuestion.textContent = t('deleteQuestion');

        const deleteYes = document.getElementById('gc-delete-yes');
        if (deleteYes) deleteYes.textContent = t('yes');

        const deleteCancel = document.getElementById('gc-delete-cancel');
        if (deleteCancel) deleteCancel.textContent = t('cancel');

        const nickQuestion = document.getElementById('gc-nick-question');
        if (nickQuestion) nickQuestion.textContent = t('confirmNickQuestion');

        const nickYes = document.getElementById('gc-nick-yes');
        if (nickYes) nickYes.textContent = t('yes');

        const nickCancel = document.getElementById('gc-nick-cancel');
        if (nickCancel) nickCancel.textContent = t('cancel');

        const creditsTitle = document.getElementById('gc-credits-title');
        if (creditsTitle) creditsTitle.textContent = t('creditsTitle');

        const roleFounder = document.getElementById('gc-role-founder');
        if (roleFounder) roleFounder.textContent = t('founderOfGC');

        const roleFirstCoder = document.getElementById('gc-role-firstcoder');
        if (roleFirstCoder) roleFirstCoder.textContent = t('firstVersionCoder');

        const roleMainCoder = document.getElementById('gc-role-maincoder');
        if (roleMainCoder) roleMainCoder.textContent = t('mainCoder');

        const roleBugFixer = document.getElementById('gc-role-bugfixer');
        if (roleBugFixer) roleBugFixer.textContent = t('bugFixer');

        const creditsThanks = document.getElementById('gc-credits-thanks');
        if (creditsThanks) creditsThanks.textContent = t('creditsThanks');

        const clockEl = document.getElementById('clock-display');
        if (clockEl) {
            const nowTime = new Date();
            const hh = String(nowTime.getHours()).padStart(2, '0');
            const mm = String(nowTime.getMinutes()).padStart(2, '0');
            const ss = String(nowTime.getSeconds()).padStart(2, '0');
            clockEl.innerText = `${t('time')}: ${hh}:${mm}:${ss}`;
        }

        const langSelect = document.getElementById('gc-language-select');
        if (langSelect) {
            const current = langSelect.value;
            langSelect.innerHTML = `
                <option value="en">${t('english')}</option>
                <option value="es">${t('spanish')}</option>
            `;
            langSelect.value = current || settings.language;
        }

        renderAccentSelect();
        renderCustomPresetList();

        const countLabel = document.getElementById('gc-custom-count');
        if (countLabel) {
            countLabel.textContent = `${getCustomPresetEntries().length}/${MAX_CUSTOM_PRESETS}`;
        }

        refreshPlayButtonState();
    }

    // INIT
    function init() {
        if (document.getElementById('gc-master-container')) return;

        bindClientButtonSounds();
        bindMagneticButtons();
        applyTheme();
        applyOptimizedMode();

        const cross = document.body.appendChild(document.createElement('div'));
        cross.id = 'gc-crosshair';
        cross.innerHTML = '<div class="ch-line ch-v"></div><div class="ch-line ch-h"></div>';

        const welcomeBanner = document.body.appendChild(document.createElement('div'));
        welcomeBanner.id = 'gc-welcome-banner';
        welcomeBanner.textContent = '';
        welcomeBanner.style.top = defaultSettings.positions['gc-welcome-banner'].top;
        welcomeBanner.style.left = defaultSettings.positions['gc-welcome-banner'].left;

        const master = document.body.appendChild(document.createElement('div'));
        master.id = 'gc-master-container';
        master.innerHTML = `
            <div id="gc-master-bg"></div>

            <div id="gc-branding">
                <img src="${LOGO_URL}">
                <h1>GC</h1>
                <p id="gc-tagline">${randomPhrase}</p>
            </div>

            <div id="gc-launcher-ui">
                <div class="gc-box">
                    <div class="gc-nick-row">
                        <input id="gc-nick-input" type="text" placeholder="${t('nicknamePlaceholder')}" value="${settings.nickname}" class="gc-input-field">
                        <button id="gc-nick-confirm-btn" title="${t('confirmNick')}">✓</button>
                    </div>

                    <button id="gc-play" ${settings.nicknameConfirmed && settings.nickname.trim() ? '' : 'disabled'}>${t('play')}</button>
                    <button class="gc-sub-btn" id="gc-open-settings">${t('modSettings')}</button>
                    <button class="gc-sub-btn" id="gc-discord">${t('discord')}</button>
                    <button class="gc-sub-btn" id="gc-sounds-btn">${t('sounds')}</button>
                    <button class="gc-sub-btn" id="gc-credits-btn">${t('credits')}</button>
                </div>
            </div>

            <div class="gc-footer-version">GC ${VERSION}</div>
        `;

        const masterBg = document.getElementById('gc-master-bg');
        if (masterBg) {
            masterBg.style.backgroundImage = `url("${SPLASH_BG}")`;

            const markBgReady = () => master.classList.add('gc-bg-ready');

            if (splashPreloader.complete) {
                markBgReady();
            } else {
                splashPreloader.onload = markBgReady;
                splashPreloader.onerror = markBgReady;
            }
        }

        const mainTitle = document.body.appendChild(document.createElement('div'));
        mainTitle.id = 'greasy-main-title';
        mainTitle.innerText = t('greasyTitle');
        mainTitle.style.top = getPositionForElement('greasy-main-title').top;
        mainTitle.style.left = getPositionForElement('greasy-main-title').left;

        const fpsW = createHUDElement(
            'fps-wrap',
            `<div id="fps-display" class="hud-item">${t('fps')}: 0</div>`,
            getPositionForElement('fps-wrap')
        );

        const cpsW = createHUDElement(
            'cps-wrap',
            `<div id="cps-display" class="hud-item">${t('cps')}: 0</div>`,
            getPositionForElement('cps-wrap')
        );

        const keysW = createHUDElement(
            'keys-wrap',
            `
            <div class="key-row"><div id="key-KeyW" class="key">W</div></div>
            <div class="key-row">
                <div id="key-KeyA" class="key">A</div>
                <div id="key-KeyS" class="key">S</div>
                <div id="key-KeyD" class="key">D</div>
            </div>
            <div class="key-row">
                <div id="key-Space" class="key key-space">SPACE</div>
            </div>
            <div class="key-row">
                <div id="key-Mouse0" class="key key-mouse">LMB</div>
                <div id="key-Mouse2" class="key key-mouse">RMB</div>
            </div>
            `,
            getPositionForElement('keys-wrap')
        );

        const clockW = createHUDElement(
            'clock-wrap',
            `<div id="clock-display" class="hud-item">${t('time')}: 00:00:00</div>`,
            getPositionForElement('clock-wrap')
        );


        [mainTitle, fpsW, cpsW, keysW, clockW].forEach(makeDraggable);
        applyModulePositions();

        const menu = document.body.appendChild(document.createElement('div'));
        menu.id = 'client-menu';
        menu.innerHTML = `
            <div class="gc-menu-header">
                <h2 id="gc-mods-title">${t('modsTitle')}</h2>
                <p id="gc-mods-hint">${t('modsHint')}</p>
            </div>

            <div class="gc-settings-section">
                <div class="gc-section-title">Menu</div>
                <div id="gc-menu-bg-label" class="gc-label">${t('menuBgLabel')}</div>
                <input id="gc-bg-url-input" type="text" value="${settings.gameMenuBgUrl}" class="gc-input-field">

                <div class="gc-row-2">
                    <div>
                        <div id="gc-language-label" class="gc-label">${t('language')}</div>
                        <select id="gc-language-select" class="gc-select">
                            <option value="en">${t('english')}</option>
                            <option value="es">${t('spanish')}</option>
                        </select>
                    </div>

                    <div>
                        <div id="gc-accent-label" class="gc-label">${t('accentColor')}</div>
                        <select id="gc-accent-select" class="gc-select"></select>
                    </div>
                </div>
            </div>

            <div class="gc-settings-section">
                <div class="gc-section-title">Custom Colors</div>
                <div class="gc-row-2">
                    <div>
                        <div id="gc-custom-name-label" class="gc-label">${t('customPresetName')}</div>
                        <input id="gc-custom-name-input" type="text" class="gc-input-field" placeholder="${t('customPresetName')}" maxlength="30">
                    </div>

                    <div>
                        <div id="gc-custom-color-label" class="gc-label">${t('pickCustomColor')}</div>
                        <input id="gc-custom-color-input" type="color" class="gc-color-input" value="#00ff88">
                    </div>
                </div>

                <button id="gc-save-custom-color">${t('saveCustomColor')}</button>

                <div class="gc-custom-presets-wrap">
                    <div id="gc-custom-presets-label" class="gc-label" style="margin-top:0;">${t('customPresets')}</div>
                    <div id="gc-custom-count" style="font-size:11px; color:#8f98a3; text-align:right;">0/${MAX_CUSTOM_PRESETS}</div>
                    <div id="gc-custom-presets-list"></div>
                </div>
            </div>

            <div class="gc-settings-section">
                <div class="gc-section-title">Modules</div>
                <div class="gc-modules-grid">
                    <button id="btn-save-modules" class="gc-sub-btn ${settings.autoSaveModules ? 'active-opt' : ''}">${t('saveModules')}</button>
                    <button id="btn-optimized-mode" class="gc-sub-btn ${settings.optimizedMode ? 'active-opt' : ''}">${t('optimizedMode')}</button>
                    <button id="btn-cross" class="gc-sub-btn ${settings.showCrosshair ? 'active-opt' : ''}">${t('customCrosshair')}</button>
                    <button id="btn-fps" class="gc-sub-btn ${settings.showFPS ? 'active-opt' : ''}">${t('fpsCounter')}</button>
                    <button id="btn-cps" class="gc-sub-btn ${settings.showCPS ? 'active-opt' : ''}">${t('cpsCounter')}</button>
                    <button id="btn-keys" class="gc-sub-btn ${settings.showKeystrokes ? 'active-opt' : ''}">${t('keystrokes')}</button>
                    <button id="btn-clock" class="gc-sub-btn ${settings.showClock ? 'active-opt' : ''}">${t('clock')}</button>
                </div>
                <div class="gc-inline-note">Save Modules ON = remembers active modules and HUD positions. OFF = starts clean each time.</div>
            </div>
        `;

        const soundsModal = document.body.appendChild(document.createElement('div'));
        soundsModal.id = 'gc-sounds-modal';
        soundsModal.innerHTML = `
            <h2 id="gc-sounds-title" class="gc-credits-title">${t('soundsTitle')}</h2>

            <div class="gc-sound-toggle-row">
                <div>
                    <div id="gc-sounds-enabled-label" style="font-weight:800;">${t('soundsEnabled')}</div>
                    <div style="font-size:12px; color:var(--gc-text-muted); margin-top:3px;">Choose your client button sound style.</div>
                </div>
                <div id="gc-sounds-toggle" class="gc-sound-switch ${settings.soundsEnabled ? 'gc-on' : ''}"></div>
            </div>

            <div class="gc-sound-volume-wrap">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                    <div id="gc-sound-volume-label" style="font-weight:800;">${t('soundVolume')}</div>
                    <button id="gc-test-sound" style="width:auto; padding:8px 12px; margin-top:0;">${t('soundTest')}</button>
                </div>
                <div class="gc-sound-volume-row">
                    <input id="gc-sound-volume" type="range" min="0" max="100" value="${settings.soundVolume}">
                    <div id="gc-sound-volume-value">${settings.soundVolume}%</div>
                </div>
            </div>

            <div class="gc-sounds-grid">
                <button class="gc-sound-option ${settings.soundPreset === 'crystal' ? 'gc-selected-sound' : ''}" data-sound-preset="crystal">${t('soundCrystal')}</button>
                <button class="gc-sound-option ${settings.soundPreset === 'cyber' ? 'gc-selected-sound' : ''}" data-sound-preset="cyber">${t('soundCyber')}</button>
                <button class="gc-sound-option ${settings.soundPreset === 'bubble' ? 'gc-selected-sound' : ''}" data-sound-preset="bubble">${t('soundBubble')}</button>
                <button class="gc-sound-option ${settings.soundPreset === 'retro' ? 'gc-selected-sound' : ''}" data-sound-preset="retro">${t('soundRetro')}</button>
                <button class="gc-sound-option gc-full-span ${settings.soundPreset === 'soft' ? 'gc-selected-sound' : ''}" data-sound-preset="soft">${t('soundSoft')}</button>
            </div>

            <button id="gc-close-sounds">${t('close')}</button>
        `;

        const creditsModal = document.body.appendChild(document.createElement('div'));
        creditsModal.id = 'gc-credits-modal';
        creditsModal.innerHTML = `
            <h2 id="gc-credits-title" class="gc-credits-title">${t('creditsTitle')}</h2>

            <div class="gc-credit-entry">
                <div class="gc-credit-info">
                    <span id="gc-role-founder" class="gc-credits-label">${t('founderOfGC')}</span>
                    <div class="gc-credit-main">Not_Cole</div>
                    <div class="gc-credit-sub">YouTube: Not_ColePlayz</div>
                </div>
                <button id="gc-sub-founder" class="gc-subscribe-btn">${t('subscribe')}</button>
            </div>

            <div class="gc-credit-entry">
                <div class="gc-credit-info">
                    <span id="gc-role-firstcoder" class="gc-credits-label">${t('firstVersionCoder')}</span>
                    <div class="gc-credit-main">Not_Cole</div>
                    <div class="gc-credit-sub">YouTube: Not_ColePlayz</div>
                </div>
                <button id="gc-sub-firstcoder" class="gc-subscribe-btn">${t('subscribe')}</button>
            </div>

            <div class="gc-credit-entry">
                <div class="gc-credit-info">
                    <span id="gc-role-maincoder" class="gc-credits-label">${t('mainCoder')}</span>
                    <div class="gc-credit-main">AngryWolfX</div>
                    <div class="gc-credit-sub">YouTube: Miniblox-ffgf</div>
                </div>
                <button id="gc-sub-maincoder" class="gc-subscribe-btn">${t('subscribe')}</button>
            </div>

            <div class="gc-credit-entry">
                <div class="gc-credit-info">
                    <span id="gc-role-bugfixer" class="gc-credits-label">${t('bugFixer')}</span>
                    <div class="gc-credit-main">Botless</div>
                </div>
            </div>

            <div id="gc-credits-thanks" class="gc-credits-line" style="margin-top:16px; color:var(--gc-text-muted);">
                ${t('creditsThanks')}
            </div>

            <button id="gc-close-credits">${t('close')}</button>
        `;

        const deleteModal = document.body.appendChild(document.createElement('div'));
        deleteModal.id = 'gc-delete-confirm-modal';
        deleteModal.innerHTML = `
            <h2 style="color:var(--gc-accent); margin:0 0 12px 0;">GC</h2>
            <div id="gc-delete-question" style="font-size:14px; color:white;">${t('deleteQuestion')}</div>
            <div class="gc-delete-actions">
                <button id="gc-delete-yes">${t('yes')}</button>
                <button id="gc-delete-cancel">${t('cancel')}</button>
            </div>
        `;

        const nickModal = document.body.appendChild(document.createElement('div'));
        nickModal.id = 'gc-nick-confirm-modal';
        nickModal.innerHTML = `
            <h2 style="color:var(--gc-accent); margin:0 0 12px 0;">GC</h2>
            <div id="gc-nick-question" style="font-size:14px; color:white;">${t('confirmNickQuestion')}</div>
            <div class="gc-delete-actions">
                <button id="gc-nick-yes">${t('yes')}</button>
                <button id="gc-nick-cancel">${t('cancel')}</button>
            </div>
        `;

        let pendingDeletePresetKey = null;
        let pendingNickname = null;

        syncCustomPresetUI();

        const nickInput = document.getElementById('gc-nick-input');
        const playBtn = document.getElementById('gc-play');

        // ACTIONS
        nickInput.addEventListener('input', () => {
            const currentValue = nickInput.value.trim();
            if (currentValue !== settings.nickname.trim()) {
                settings.nicknameConfirmed = false;
                save();
            }
            refreshPlayButtonState();
        });

        document.getElementById('gc-nick-confirm-btn').onclick = () => {
            const value = nickInput.value.trim();
            if (!value) {
                showMiniNotice(t('nickRequired'), true);
                refreshPlayButtonState();
                return;
            }

            pendingNickname = value;
            openPanel(nickModal);
        };

        document.getElementById('gc-nick-cancel').onclick = () => {
            pendingNickname = null;
            closePanel(nickModal);
        };

        document.getElementById('gc-nick-yes').onclick = () => {
            if (!pendingNickname) {
                closePanel(nickModal);
                return;
            }

            settings.nickname = pendingNickname;
            settings.nicknameConfirmed = true;
            save();
            nickInput.value = settings.nickname;
            pendingNickname = null;
            refreshPlayButtonState();
            closePanel(nickModal);
            showMiniNotice(t('nickConfirmed'));
        };

        document.getElementById('gc-play').onclick = () => {
            const currentNick = nickInput.value.trim();

            if (!currentNick) {
                showMiniNotice(t('nickRequired'), true);
                return;
            }

            if (!settings.nicknameConfirmed || currentNick !== settings.nickname.trim()) {
                showMiniNotice(t('nickChangedNeedsConfirm'), true);
                refreshPlayButtonState();
                return;
            }

            settings.nickname = currentNick;
            save();

            master.classList.add('gc-fade-out');

            setTimeout(() => {
                master.remove();
                applyModulePositions();

                mainTitle.style.display = 'block';
                mainTitle.style.animation = 'gcFadeInUp .4s var(--gc-ease)';

                if (settings.showFPS) revealHUD(fpsW);
                if (settings.showCPS) revealHUD(cpsW);
                if (settings.showKeystrokes) revealHUD(keysW);
                if (settings.showClock) revealHUD(clockW);
                if (settings.showCrosshair) cross.style.display = 'block';

                showWelcomeBanner();
                startSystems();
            }, 800);
        };

        document.getElementById('gc-open-settings').onclick = () => {
            toggleMenu(menu);
        };

        document.getElementById('gc-discord').onclick = () => {
            window.open(DISCORD_LINK, '_blank');
        };

        document.getElementById('gc-sounds-btn').onclick = () => {
            openPanel(soundsModal);
        };

        document.getElementById('gc-credits-btn').onclick = () => {
            openPanel(creditsModal);
        };

        document.getElementById('gc-close-credits').onclick = () => {
            closePanel(creditsModal);
        };

        document.getElementById('gc-close-sounds').onclick = () => {
            closePanel(soundsModal);
        };

        document.getElementById('gc-sounds-toggle').onclick = () => {
            settings.soundsEnabled = !settings.soundsEnabled;
            save();

            const toggle = document.getElementById('gc-sounds-toggle');
            if (toggle) toggle.classList.toggle('gc-on', settings.soundsEnabled);

            if (settings.soundsEnabled) {
                playGcTone('on', settings.soundPreset);
            }
        };

        document.getElementById('gc-sound-volume').oninput = (e) => {
            settings.soundVolume = Math.max(0, Math.min(100, Number(e.target.value)));
            const value = document.getElementById('gc-sound-volume-value');
            if (value) value.textContent = `${settings.soundVolume}%`;
            save();
        };

        document.getElementById('gc-sound-volume').onchange = () => {
            playGcTone('click', settings.soundPreset);
        };

        document.getElementById('gc-test-sound').onclick = () => {
            settings.soundsEnabled = true;
            save();

            const toggle = document.getElementById('gc-sounds-toggle');
            if (toggle) toggle.classList.add('gc-on');

            playGcTone('on', settings.soundPreset);
        };

        document.querySelectorAll('.gc-sound-option').forEach(btn => {
            btn.onclick = () => {
                const preset = btn.getAttribute('data-sound-preset');
                if (!preset) return;

                settings.soundPreset = preset;
                settings.soundsEnabled = true;
                save();

                document.querySelectorAll('.gc-sound-option').forEach(opt => {
                    opt.classList.toggle('gc-selected-sound', opt.getAttribute('data-sound-preset') === preset);
                });

                const toggle = document.getElementById('gc-sounds-toggle');
                if (toggle) toggle.classList.add('gc-on');

                playGcTone('on', preset);
                showMiniNotice(t('soundSelected'));
            };
        });

        document.getElementById('gc-sub-founder').onclick = () => {
            window.open(YT_NOT_COLE, '_blank');
        };

        document.getElementById('gc-sub-firstcoder').onclick = () => {
            window.open(YT_NOT_COLE, '_blank');
        };

        document.getElementById('gc-sub-maincoder').onclick = () => {
            window.open(YT_MINIBLOX, '_blank');
        };

        document.getElementById('gc-bg-url-input').oninput = (e) => {
            settings.gameMenuBgUrl = e.target.value;
            save();
        };

        document.getElementById('gc-language-select').onchange = (e) => {
            settings.language = e.target.value;
            save();
            updateTexts();
        };

        document.getElementById('gc-accent-select').onchange = (e) => {
            settings.accentPreset = e.target.value;
            save();
            applyTheme();
            updateTexts();
            styleMinibloxButtons();
        };

        document.getElementById('gc-save-custom-color').onclick = () => {
            const nameInput = document.getElementById('gc-custom-name-input');
            const colorInput = document.getElementById('gc-custom-color-input');

            const rawName = (nameInput.value || '').trim();
            const presetKey = sanitizePresetKey(rawName);
            const existingKeys = Object.keys(settings.customColors);
            const allPresets = getAllColorPresets();

            if (!rawName || !presetKey) {
                showMiniNotice(t('invalidPresetName'), true);
                return;
            }

            if (allPresets[presetKey] || existingKeys.some(k => (settings.customColors[k].label || k).toLowerCase() === rawName.toLowerCase())) {
                showMiniNotice(t('duplicatePreset'), true);
                return;
            }

            if (existingKeys.length >= MAX_CUSTOM_PRESETS) {
                showMiniNotice(t('limitReached'), true);
                return;
            }

            const accent = colorInput.value || '#00ff88';
            const accent2 = darkenHex(accent, 0.18);
            const glow = makeGlowFromHex(accent, 0.45);

            settings.customColors[presetKey] = {
                label: rawName,
                accent,
                accent2,
                glow
            };

            settings.accentPreset = presetKey;
            save();
            applyTheme();
            syncCustomPresetUI();
            updateTexts();
            styleMinibloxButtons();

            nameInput.value = '';
            showMiniNotice(t('presetSaved'));
        };

        document.getElementById('gc-custom-presets-list').addEventListener('click', (e) => {
            const btn = e.target.closest('.gc-custom-preset-remove');
            if (!btn) return;

            const presetKey = btn.getAttribute('data-preset-key');
            if (!presetKey || !settings.customColors[presetKey]) return;

            pendingDeletePresetKey = presetKey;
            openPanel(deleteModal);
        });

        document.getElementById('gc-delete-cancel').onclick = () => {
            pendingDeletePresetKey = null;
            closePanel(deleteModal);
        };

        document.getElementById('gc-delete-yes').onclick = () => {
            if (!pendingDeletePresetKey || !settings.customColors[pendingDeletePresetKey]) {
                closePanel(deleteModal);
                return;
            }

            delete settings.customColors[pendingDeletePresetKey];

            if (settings.accentPreset === pendingDeletePresetKey) {
                settings.accentPreset = 'green';
            }

            pendingDeletePresetKey = null;
            save();
            applyTheme();
            syncCustomPresetUI();
            updateTexts();
            styleMinibloxButtons();
            closePanel(deleteModal);
            showMiniNotice(t('presetDeleted'));
        };

        document.getElementById('btn-save-modules').onclick = (e) => {
            settings.autoSaveModules = !settings.autoSaveModules;
            e.target.classList.toggle('active-opt', settings.autoSaveModules);

            if (settings.autoSaveModules) {
                captureModulePositions();
                save();
                showMiniNotice('Save Modules ON');
            } else {
                save();
                showMiniNotice('Save Modules OFF');
            }
        };

        document.getElementById('btn-optimized-mode').onclick = (e) => {
            settings.optimizedMode = !settings.optimizedMode;
            e.target.classList.toggle('active-opt', settings.optimizedMode);
            applyOptimizedMode();
            save();

            showMiniNotice(settings.optimizedMode ? t('optimizedOn') : t('optimizedOff'));
        };

        document.getElementById('btn-cross').onclick = (e) => {
            settings.showCrosshair = !settings.showCrosshair;
            cross.style.display = settings.showCrosshair ? 'block' : 'none';
            e.target.classList.toggle('active-opt', settings.showCrosshair);
            saveModulesIfEnabled();
        };

        document.getElementById('btn-fps').onclick = (e) => {
            settings.showFPS = !settings.showFPS;
            if (settings.showFPS) revealHUD(fpsW);
            else hideHUD(fpsW);
            e.target.classList.toggle('active-opt', settings.showFPS);
            saveModulesIfEnabled();
        };

        document.getElementById('btn-cps').onclick = (e) => {
            settings.showCPS = !settings.showCPS;
            if (settings.showCPS) revealHUD(cpsW);
            else hideHUD(cpsW);
            e.target.classList.toggle('active-opt', settings.showCPS);
            saveModulesIfEnabled();
        };

        document.getElementById('btn-keys').onclick = (e) => {
            settings.showKeystrokes = !settings.showKeystrokes;
            if (settings.showKeystrokes) revealHUD(keysW);
            else hideHUD(keysW);
            e.target.classList.toggle('active-opt', settings.showKeystrokes);
            saveModulesIfEnabled();
        };

        document.getElementById('btn-clock').onclick = (e) => {
            settings.showClock = !settings.showClock;
            if (settings.showClock) revealHUD(clockW);
            else hideHUD(clockW);
            e.target.classList.toggle('active-opt', settings.showClock);
            saveModulesIfEnabled();
        };

        setTimeout(() => {
            const uiBox = document.getElementById('gc-launcher-ui');
            if (uiBox) {
                uiBox.style.display = 'block';
                requestAnimationFrame(() => uiBox.classList.add('gc-show'));
            }
        }, 1500);

        updateTexts();
    }

    // SYSTEMS
    function startSystems() {
        let frames = 0;
        let lastTime = performance.now();
        let clicks = [];

        window.addEventListener('mousedown', () => {
            clicks.push(Date.now());
        });
        function update() {
            frames++;
            const now = performance.now();

            if (now - lastTime >= 1000) {
                const fpsEl = document.getElementById('fps-display');
                if (fpsEl) fpsEl.innerText = `${t('fps')}: ${frames}`;
                frames = 0;
                lastTime = now;
            }

            clicks = clicks.filter(ti => Date.now() - ti < 1000);

            const cpsEl = document.getElementById('cps-display');
            if (cpsEl) cpsEl.innerText = `${t('cps')}: ${clicks.length}`;

            const clockEl = document.getElementById('clock-display');
            if (clockEl) {
                const nowTime = new Date();
                const hh = String(nowTime.getHours()).padStart(2, '0');
                const mm = String(nowTime.getMinutes()).padStart(2, '0');
                const ss = String(nowTime.getSeconds()).padStart(2, '0');
                clockEl.innerText = `${t('time')}: ${hh}:${mm}:${ss}`;
            }

            requestAnimationFrame(update);
        }

        update();
    }

    // RESPONSIVE MODULE BARRIER
    let resizeFixTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeFixTimer);
        resizeFixTimer = setTimeout(() => {
            applyModulePositions();
        }, 80);
    });

    // KEY EVENTS
    window.addEventListener('keydown', e => {
        const k = document.getElementById(`key-${e.code}`);
        if (k) k.classList.add('active');

        if (e.code === 'ShiftRight') {
            const m = document.getElementById('client-menu');
            if (m) toggleMenu(m);
        }

        if (e.code === 'Escape') {
            const creditsModal = document.getElementById('gc-credits-modal');
            const soundsModal = document.getElementById('gc-sounds-modal');
            const deleteModal = document.getElementById('gc-delete-confirm-modal');
            const nickModal = document.getElementById('gc-nick-confirm-modal');

            if (nickModal && nickModal.style.display === 'block') {
                closePanel(nickModal);
                return;
            }

            if (deleteModal && deleteModal.style.display === 'block') {
                closePanel(deleteModal);
                return;
            }

            if (soundsModal && soundsModal.style.display === 'block') {
                closePanel(soundsModal);
                return;
            }

            if (creditsModal && creditsModal.style.display === 'block') {
                closePanel(creditsModal);
            }
        }
    });

    window.addEventListener('keyup', e => {
        const k = document.getElementById(`key-${e.code}`);
        if (k) k.classList.remove('active');
    });

    // MOUSE EVENTS FOR KEYSTROKES
    window.addEventListener('mousedown', e => {
        const mouseKey = document.getElementById(`key-Mouse${e.button}`);
        if (mouseKey) mouseKey.classList.add('active');
    });

    window.addEventListener('mouseup', e => {
        const mouseKey = document.getElementById(`key-Mouse${e.button}`);
        if (mouseKey) mouseKey.classList.remove('active');
    });

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);

})();
