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
}

function handleZoomWheelEvent(e) {
    if (!e.ctrlKey) return;

    e.preventDefault();

    let normalizedDeltaY = e.deltaY;
    if (e.deltaMode === 1) {
        normalizedDeltaY *= 16;
    } else if (e.deltaMode === 2) {
        normalizedDeltaY *= window.innerHeight;
    }

    zoomCurrentScale -= normalizedDeltaY * ZOOM_SENSITIVITY;
    zoomCurrentScale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, zoomCurrentScale));

    const currentSize = zoomInnerBaseSize * zoomCurrentScale;
    const innerSquare = document.getElementById('zoom-inner-square');
    innerSquare.style.width = `${currentSize}px`;
    innerSquare.style.height = `${currentSize}px`;

    checkZoomMatch();
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
    console.log('zoom completed - trial ' + successfulClicks);
    playChime(true);

    if (successfulClicks >= MAX_ZOOM_TRIALS) {
        document.getElementById('start-screen').style.display = "";
        document.getElementById('zoom-body').style.display = "none";
        document.removeEventListener('wheel', handleZoomWheelEvent);

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

    document.addEventListener('wheel', handleZoomWheelEvent, { passive: false });

    startTimer();
}
