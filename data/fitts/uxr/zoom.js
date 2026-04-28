/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

const MAX_ZOOM_TRIALS = 6;
const ZOOM_SENSITIVITY = 0.005;
const ZOOM_TOLERANCE = 0.08;
const ZOOM_HOLD_TIME = 300;
const ZOOM_MIN_SCALE = 0.4;
const ZOOM_MAX_SCALE = 2.5;
const ZOOM_TARGET_SCALE_MIN = 0.55;
const ZOOM_TARGET_SCALE_MAX = 1.8;

let zoomCurrentScale = 1.0;
let zoomTargetSize = 0;
let zoomInnerBaseSize = 0;
let zoomHoldTimeout = null;
let gestureStartScale = 1.0;
let debugLogEl = null;
let debugLineCount = 0;

function debugLog(msg) {
    if (!debugLogEl) return;
    debugLineCount++;
    const line = document.createElement('div');
    line.textContent = `[${debugLineCount}] ${msg}`;
    debugLogEl.appendChild(line);
    debugLogEl.scrollTop = debugLogEl.scrollHeight;
}

// --- Register all possible zoom input handlers at load time ---

// 1. wheel events (Chrome/Edge trackpad pinch fires wheel with ctrlKey=true)
document.addEventListener('wheel', (e) => {
    debugLog(`wheel: deltaY=${e.deltaY.toFixed(2)} ctrlKey=${e.ctrlKey} deltaMode=${e.deltaMode}`);
    if (e.ctrlKey) {
        e.preventDefault();
        applyZoomDelta(e.deltaY, e.deltaMode);
    }
}, { passive: false });

// 2. gesturestart/gesturechange/gestureend (Safari pinch)
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
    gestureStartScale = zoomCurrentScale;
    debugLog(`gesturestart: scale=${e.scale.toFixed(3)}`);
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
    debugLog(`gesturechange: scale=${e.scale.toFixed(3)}`);
    zoomCurrentScale = gestureStartScale * e.scale;
    zoomCurrentScale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, zoomCurrentScale));
    updateZoomUI();
    checkZoomMatch();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
    debugLog(`gestureend: scale=${e.scale.toFixed(3)}`);
});

// 3. touchstart/touchmove/touchend (raw touch — log finger count)
document.addEventListener('touchstart', (e) => {
    debugLog(`touchstart: touches=${e.touches.length}`);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length >= 2) {
        debugLog(`touchmove: touches=${e.touches.length} t0=(${e.touches[0].clientX.toFixed(0)},${e.touches[0].clientY.toFixed(0)}) t1=(${e.touches[1].clientX.toFixed(0)},${e.touches[1].clientY.toFixed(0)})`);
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    debugLog(`touchend: remaining=${e.touches.length}`);
}, { passive: true });

// 4. pointerdown/pointermove (log pointer type)
document.addEventListener('pointerdown', (e) => {
    debugLog(`pointerdown: type=${e.pointerType} id=${e.pointerId} (${e.clientX.toFixed(0)},${e.clientY.toFixed(0)})`);
}, { passive: true });

// --- Zoom logic ---

function applyZoomDelta(deltaY, deltaMode) {
    if (!zoomInnerBaseSize) return;

    let normalizedDeltaY = deltaY;
    if (deltaMode === 1) {
        normalizedDeltaY *= 16;
    } else if (deltaMode === 2) {
        normalizedDeltaY *= window.innerHeight;
    }

    zoomCurrentScale -= normalizedDeltaY * ZOOM_SENSITIVITY;
    zoomCurrentScale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, zoomCurrentScale));
    updateZoomUI();
    checkZoomMatch();
}

function updateZoomUI() {
    const currentSize = zoomInnerBaseSize * zoomCurrentScale;
    const innerSquare = document.getElementById('zoom-inner-square');
    if (!innerSquare) return;
    innerSquare.style.width = `${currentSize}px`;
    innerSquare.style.height = `${currentSize}px`;
}

function generateZoomTarget() {
    let targetScale;
    let attempts = 0;

    const logMin = Math.log(ZOOM_TARGET_SCALE_MIN);
    const logMax = Math.log(ZOOM_TARGET_SCALE_MAX);

    do {
        const logScale = getRandomRange(logMin, logMax);
        targetScale = Math.exp(logScale);
        attempts++;
    } while ((Math.abs(targetScale - zoomCurrentScale) / zoomCurrentScale < 0.15 || Math.abs(targetScale - 1.0) < 0.15) && attempts < 50);

    zoomTargetSize = zoomInnerBaseSize * targetScale;
    zoomCurrentScale = 1.0;

    const innerSize = zoomInnerBaseSize * zoomCurrentScale;

    const targetOutline = document.getElementById('zoom-target-outline');
    targetOutline.style.width = `${zoomTargetSize}px`;
    targetOutline.style.height = `${zoomTargetSize}px`;

    const innerSquare = document.getElementById('zoom-inner-square');
    innerSquare.style.width = `${innerSize}px`;
    innerSquare.style.height = `${innerSize}px`;
    innerSquare.classList.remove('zoom-match');

    debugLog(`new target: scale=${targetScale.toFixed(2)} size=${zoomTargetSize.toFixed(0)}px`);
}

function checkZoomMatch() {
    if (zoomHoldTimeout) {
        clearTimeout(zoomHoldTimeout);
        zoomHoldTimeout = null;
    }

    const currentSize = zoomInnerBaseSize * zoomCurrentScale;
    const ratio = currentSize / zoomTargetSize;
    const innerSquare = document.getElementById('zoom-inner-square');

    const adaptiveTolerance = ZOOM_TOLERANCE + (0.03 / Math.max(ratio, 0.3));
    if (ratio >= 1 - adaptiveTolerance && ratio <= 1 + adaptiveTolerance) {
        innerSquare.classList.add('zoom-match');
        zoomHoldTimeout = setTimeout(() => {
            const recheckSize = zoomInnerBaseSize * zoomCurrentScale;
            const recheckRatio = recheckSize / zoomTargetSize;
            const recheckTolerance = ZOOM_TOLERANCE + (0.03 / Math.max(recheckRatio, 0.3));
            if (recheckRatio >= 1 - recheckTolerance && recheckRatio <= 1 + recheckTolerance) {
                onZoomSuccess();
            } else {
                innerSquare.classList.remove('zoom-match');
            }
        }, ZOOM_HOLD_TIME);
    } else {
        innerSquare.classList.remove('zoom-match');
    }
}

function onZoomSuccess() {
    successfulClicks += 1;
    debugLog('zoom completed - trial ' + successfulClicks);
    playChime(true);

    if (successfulClicks >= MAX_ZOOM_TRIALS) {
        document.getElementById('start-screen').style.display = "";
        document.getElementById('zoom-body').style.display = "none";

        let startText = document.getElementById('start-text');
        let elapsedStr = (elapsed / 1000).toFixed(2);
        startText.innerText = `#${trialNum}, TTC: ${elapsedStr}s\n` + startText.innerText;
        submitForm(trialNum, elapsedStr);
        trialNum += 1;
    } else {
        generateZoomTarget();
    }
}

function startZoomExperience() {
    rng = new RandomGenerator();
    successfulClicks = 0;
    loadChimes();

    zoomCurrentScale = 1.0;
    zoomInnerBaseSize = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    document.getElementById('start-screen').style.display = "none";
    document.getElementById('zoom-body').style.display = "";

    debugLogEl = document.getElementById('debug-log');
    debugLog('Experience started. Pinch/zoom to see which events fire.');

    generateZoomTarget();

    startTimer();
}
