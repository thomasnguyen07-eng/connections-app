// ============================================
// IN-APP DEBUG CONSOLE FOR TESTFLIGHT
// Hidden by default — tap 🐛 to toggle
// ============================================

(function() {
    // 🍎 iPadOS 13+ reports itself as Macintosh — detect via multi-touch instead
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
    if (!isMobile) return;

    // 🛡️ GATE: only the app owner — or an explicitly enabled dev-mode session — may see the console
    const OWNER_EMAIL = 'thomasnguyen07@gmail.com';
    let _isOwner = false;

    // 1) Check localStorage user
    try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        _isOwner = !!(u && u.email === OWNER_EMAIL);
    } catch (e) {}

    // 2) Fall back to Firebase auth if available
    if (!_isOwner && window.fb && window.fb.auth && window.fb.auth.currentUser) {
        _isOwner = window.fb.auth.currentUser.email === OWNER_EMAIL;
    }

    // 3) Manual dev-mode escape hatch (set localStorage.devMode = 'on' in Safari Web Inspector)
    const _devMode = localStorage.getItem('devMode') === 'on';

    // 4) Explicit owner activation via 5-tap on "Connections" title
    const _ownerActivated = localStorage.getItem('debugConsoleVisible') === 'true';

    // Worm appears only if: (owner AND activated) OR devMode
    if (!_devMode && !(_isOwner && _ownerActivated)) {
        console.log('🛡️ Debug console hidden (owner must activate via 5-tap)');
        return;
    }

    console.log('🐛 Debug console enabled for:', _isOwner ? OWNER_EMAIL : 'devMode');

    // Persisted on/off state (default OFF)
    const STORAGE_KEY = 'debugConsoleVisible';
    const isVisible = () => localStorage.getItem(STORAGE_KEY) === 'true';
    const setVisible = (v) => localStorage.setItem(STORAGE_KEY, v ? 'true' : 'false');

    function initDebugConsole() {
        // Remove any existing elements (for hot reload)
        ['debugConsole', 'debugConsoleToggle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

        // ===== FLOATING TOGGLE BUTTON (always visible, tiny) =====
        const toggle = document.createElement('button');
        toggle.id = 'debugConsoleToggle';
        toggle.textContent = '🐛';
        toggle.style.cssText = `
            position: fixed !important;
            top: 60px !important;
            left: 10px !important;
            width: 44px !important;
            height: 44px !important;
            border-radius: 50% !important;
            background: #0f0 !important;
            color: #000 !important;
            border: 2px solid #000 !important;
            font-size: 20px !important;
            z-index: 2147483647 !important;
            padding: 0 !important;
            cursor: pointer !important;
            opacity: 1 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        `;
        toggle.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const next = !isVisible();
            setVisible(next);
            applyVisibility();
        };
        document.body.appendChild(toggle);

        // ===== CLOSE (✕) BUTTON — hides the worm immediately =====
        const debugCloseBtn = document.createElement('button');
        debugCloseBtn.id = 'debugConsoleClose';
        debugCloseBtn.textContent = '✕';
        debugCloseBtn.style.cssText = `
            position: fixed !important;
            top: 60px !important;
            left: 60px !important;
            width: 30px !important;
            height: 30px !important;
            border-radius: 50% !important;
            background: #f00 !important;
            color: #fff !important;
            border: 2px solid #000 !important;
            font-size: 14px !important;
            font-weight: bold !important;
            z-index: 2147483647 !important;
            padding: 0 !important;
            cursor: pointer !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        `;
        debugCloseBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem('debugConsoleVisible', 'false');
            ['debugConsole', 'debugConsoleToggle', 'debugConsoleClose'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
            console.log('🛡️ Debug console closed by ✕');
        };
        document.body.appendChild(debugCloseBtn);

        // ===== CONSOLE PANEL (bottom of screen) =====
        const container = document.createElement('div');
        container.id = 'debugConsole';
        container.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 30vh !important;
            background: rgba(0, 0, 0, 0.95) !important;
            color: #0f0 !important;
            font-family: Menlo, Monaco, monospace !important;
            font-size: 11px !important;
            z-index: 2147483646 !important;
            border-top: 3px solid #0f0 !important;
            display: none !important;
            flex-direction: column !important;
            -webkit-overflow-scrolling: touch !important;
        `;

        // ===== HEADER =====
        const header = document.createElement('div');
        header.style.cssText = `
            background: #111 !important;
            padding: 6px !important;
            display: flex !important;
            gap: 6px !important;
            align-items: center !important;
            border-bottom: 1px solid #0f0 !important;
            flex-shrink: 0 !important;
        `;

        const title = document.createElement('span');
        title.textContent = '📋 CONSOLE';
        title.style.cssText = 'color: #0f0; font-weight: bold; flex: 1; font-size: 12px;';
        header.appendChild(title);

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = 'padding: 4px 10px; background: #444; color: #fff; border: 1px solid #666; border-radius: 4px; font-size: 11px;';
        clearBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            logContainer.innerHTML = '';
        };
        header.appendChild(clearBtn);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'padding: 4px 10px; background: #444; color: #fff; border: 1px solid #666; border-radius: 4px; font-size: 11px;';
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            setVisible(false);
            applyVisibility();
        };
        header.appendChild(closeBtn);

        container.appendChild(header);

        // ===== LOG AREA =====
        const logContainer = document.createElement('div');
        logContainer.style.cssText = `
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 6px !important;
            color: #0f0 !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
            -webkit-overflow-scrolling: touch !important;
        `;
        container.appendChild(logContainer);

        document.body.appendChild(container);

        // ===== VISIBILITY APPLICATION =====
        function applyVisibility() {
            container.style.setProperty('display', isVisible() ? 'flex' : 'none', 'important');
            // keep the button always at full opacity; only toggle panel visibility
            toggle.style.setProperty('opacity', '1', 'important');
        }
        applyVisibility();

        // ===== LOG CAPTURE =====
        function appendLog(type, args, color) {
            if (!isVisible()) return;
            try {
                const line = document.createElement('div');
                line.style.cssText = `padding: 3px 0; border-bottom: 1px solid #222; color: ${color || '#0f0'}; word-wrap: break-word; font-size: 10px; line-height: 1.3;`;
                const time = new Date().toLocaleTimeString();
                const message = args.map(arg => {
                    if (arg === null) return 'null';
                    if (arg === undefined) return 'undefined';
                    if (typeof arg === 'object') {
                        try { return JSON.stringify(arg); }
                        catch (e) { return '[Object]'; }
                    }
                    return String(arg);
                }).join(' ');
                line.textContent = `[${time}] [${type}] ${message}`;
                logContainer.appendChild(line);
                logContainer.scrollTop = logContainer.scrollHeight;
            } catch (e) {
                // silent
            }
        }

        // Hook into console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = function(...args) {
            originalLog.apply(console, args);
            appendLog('LOG', args, '#0f0');
        };
        console.error = function(...args) {
            originalError.apply(console, args);
            appendLog('ERR', args, '#ff0000');
        };
        console.warn = function(...args) {
            originalWarn.apply(console, args);
            appendLog('WARN', args, '#ffaa00');
        };

        window.addEventListener('error', function(event) {
            appendLog('UNCAUGHT', [event.message + ' at ' + event.filename + ':' + event.lineno], '#ff0000');
        });

        window.addEventListener('unhandledrejection', function(event) {
            appendLog('PROMISE', [String(event.reason)], '#ff0000');
        });

        appendLog('READY', ['Tap 🐛 to hide. Tap again to show.'], '#00ffff');
    }

    // 🌐 Robust init: wait for page settle, attach to documentElement (safer than body),
    // then watch for accidental removal by other scripts.
    function initDebugConsoleRobust() {
        initDebugConsole();

        // If something removes the worm shortly after, re-attach once
        const checkId = setInterval(() => {
            if (!document.getElementById('debugConsoleToggle')) {
                console.log('🔄 Worm was removed — re-attaching...');
                initDebugConsole();
            } else {
                clearInterval(checkId);   // worm is stable, stop checking
            }
        }, 800);

        // Safety: stop the interval after 10 seconds no matter what
        setTimeout(() => clearInterval(checkId), 10000);
    }

    if (document.readyState === 'complete') {
        setTimeout(initDebugConsoleRobust, 1500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(initDebugConsoleRobust, 1500);
        });
    }
})();

