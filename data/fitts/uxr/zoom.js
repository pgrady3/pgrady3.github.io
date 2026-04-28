/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

const MAX_ZOOM_TRIALS = 10;
const ZOOM_SENSITIVITY = 0.00125;
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
let touchStartDist = 0;
let touchStartZoomScale = 1.0;
const TOUCH_ZOOM_SENSITIVITY = 1 / 2.5;

// Mouse scroll wheel — zoom without any modifier key
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    applyZoomDelta(e.deltaY, e.deltaMode);
}, { passive: false });

// Two-finger touch pinch
function touchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        touchStartDist = touchDist(e);
        touchStartZoomScale = zoomCurrentScale;
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const dist = touchDist(e);
        const ratio = dist / touchStartDist;
        const dampenedRatio = 1 + (ratio - 1) * TOUCH_ZOOM_SENSITIVITY;
        zoomCurrentScale = touchStartZoomScale * dampenedRatio;
        zoomCurrentScale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, zoomCurrentScale));
        console.log(`[zoom] pinch: zoomCurrentScale=${zoomCurrentScale.toFixed(3)}, currentSize=${(zoomInnerBaseSize * zoomCurrentScale).toFixed(1)}, targetSize=${zoomTargetSize.toFixed(1)}, ratio=${(zoomInnerBaseSize * zoomCurrentScale / zoomTargetSize).toFixed(3)}`);
        updateZoomUI();
        checkZoomMatch();
    }
}, { passive: false });

// Safari gesture events
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
    touchStartZoomScale = zoomCurrentScale;
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
    const dampenedScale = 1 + (e.scale - 1) * TOUCH_ZOOM_SENSITIVITY;
    zoomCurrentScale = touchStartZoomScale * dampenedScale;
    zoomCurrentScale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, zoomCurrentScale));
    updateZoomUI();
    checkZoomMatch();
});

document.addEventListener('gestureend', (e) => e.preventDefault());

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
    console.log(`[zoom] applyDelta: zoomCurrentScale=${zoomCurrentScale.toFixed(3)}, currentSize=${(zoomInnerBaseSize * zoomCurrentScale).toFixed(1)}, targetSize=${zoomTargetSize.toFixed(1)}, ratio=${(zoomInnerBaseSize * zoomCurrentScale / zoomTargetSize).toFixed(3)}`);
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
        const logScale = Math.random() * (logMax - logMin) + logMin;
        targetScale = Math.exp(logScale);
        attempts++;
    } while ((Math.abs(targetScale - zoomCurrentScale) / zoomCurrentScale < 0.15 || Math.abs(targetScale - 1.0) < 0.15) && attempts < 50);

    zoomTargetSize = zoomInnerBaseSize * targetScale;
    zoomCurrentScale = 1.0;
    console.log(`[zoom] new target: targetScale=${targetScale.toFixed(3)}, zoomTargetSize=${zoomTargetSize.toFixed(1)}, zoomInnerBaseSize=${zoomInnerBaseSize.toFixed(1)}, ZOOM_MIN_SCALE=${ZOOM_MIN_SCALE}, ZOOM_MAX_SCALE=${ZOOM_MAX_SCALE}`);

    const innerSize = zoomInnerBaseSize * zoomCurrentScale;

    // Compute tolerance band outlines
    const ratio = 1.0; // current/target ratio at start
    const tolerance = ZOOM_TOLERANCE + (0.03 / Math.max(ratio, 0.3));
    const outerTargetSize = zoomTargetSize * (1 + tolerance);
    const innerTargetSize = zoomTargetSize * (1 - tolerance);

    const outerOutline = document.getElementById('zoom-target-outline-outer');
    outerOutline.style.width = `${outerTargetSize}px`;
    outerOutline.style.height = `${outerTargetSize}px`;

    const innerOutline = document.getElementById('zoom-target-outline-inner');
    innerOutline.style.width = `${innerTargetSize}px`;
    innerOutline.style.height = `${innerTargetSize}px`;

    const innerSquare = document.getElementById('zoom-inner-square');
    innerSquare.style.width = `${innerSize}px`;
    innerSquare.style.height = `${innerSize}px`;
}

function checkZoomMatch() {
    if (zoomHoldTimeout) {
        clearTimeout(zoomHoldTimeout);
        zoomHoldTimeout = null;
    }

    const currentSize = zoomInnerBaseSize * zoomCurrentScale;
    const ratio = currentSize / zoomTargetSize;

    const adaptiveTolerance = ZOOM_TOLERANCE + (0.03 / Math.max(ratio, 0.3));
    if (ratio >= 1 - adaptiveTolerance && ratio <= 1 + adaptiveTolerance) {
        zoomHoldTimeout = setTimeout(() => {
            const recheckSize = zoomInnerBaseSize * zoomCurrentScale;
            const recheckRatio = recheckSize / zoomTargetSize;
            const recheckTolerance = ZOOM_TOLERANCE + (0.03 / Math.max(recheckRatio, 0.3));
            if (recheckRatio >= 1 - recheckTolerance && recheckRatio <= 1 + recheckTolerance) {
                onZoomSuccess();
            }
        }, ZOOM_HOLD_TIME);
    }
}

function onZoomSuccess() {
    successfulClicks += 1;
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

    generateZoomTarget();

    startTimer();
}
