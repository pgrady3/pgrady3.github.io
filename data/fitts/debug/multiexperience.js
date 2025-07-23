/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

// Configuration variables
let BUTTON_SIZES = [0.02, 0.03]; // Button size as a fraction of the viewport width
let SCREEN_AREA_USED = 0.9; // Area of the screen which is used by the experience
let BUTTON_RESPAWN_MAX_RAD = 0.5; // Max distance to the new button, in viewport width

// Multi-action variables
let currentAction = '';
let isHolding = false;
let isDragging = false;
let dragTargetX = 0;
let dragTargetY = 0;
let isScrolling = false;
let scrollBlockPosition = 135; // Starting position in pixels
let scrollTargetPosition = 0;
let successfulClicks = 0;
let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;
let successChimes = [];
let errorChime;

const ACTIONS = ['left-click', 'right-click', 'hold', 'scroll'];
const ACTION_LABELS = {
    'left-click': 'Left Click',
    'right-click': 'Right Click',
    'hold': 'Drag',
    'scroll': 'Scroll'
};

const DRAG_TARGET_RADIUS = 30; // pixels
const MIN_DRAG_DISTANCE = 50; // minimum pixels to drag
const MAX_DRAG_DISTANCE = 600; // minimum pixels to drag
const SCROLL_TRACK_HEIGHT = 300; // Height of scroll track in pixels
const SCROLL_BLOCK_HEIGHT = 10; // Height of scroll block in pixels
const SCROLL_TARGET_HEIGHT = 20; // Height of scroll target in pixels
const SCROLL_SENSITIVITY = 0.1; // Pixels per scroll unit

function loadChimes() {
    for (var i = 1; i <= 17; i++) {
        successChimes.push(new Audio('audio/chime_' + i + '.mp3'));
    }
    errorChime = new Audio('audio/error_1.mp3');
}

function playChime(success) {
    if (success) {
        let soundToPlay = successChimes[Math.floor(Math.random() * successChimes.length)];
        console.log(`Playing chime ${soundToPlay.src}`);
        soundToPlay.pause();
        soundToPlay.currentTime = 0;
        soundToPlay.play();
    } else {
        errorChime.play();
    }
}

function getRandomAction() {
    return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
}

function getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function generateDragTarget(buttonX, buttonY) {
    const bound = (1 - SCREEN_AREA_USED) / 2;
    const minX = bound * window.innerWidth + DRAG_TARGET_RADIUS;
    const maxX = (1 - bound) * window.innerWidth - DRAG_TARGET_RADIUS;
    const minY = bound * window.innerHeight + DRAG_TARGET_RADIUS;
    const maxY = (1 - bound) * window.innerHeight - DRAG_TARGET_RADIUS;

    let targetX, targetY;
    let attempts = 0;

    do {
        targetX = getRandomRange(minX, maxX);
        targetY = getRandomRange(minY, maxY);
        const distance = Math.sqrt((targetX - buttonX) ** 2 + (targetY - buttonY) ** 2);

        if (distance > MIN_DRAG_DISTANCE && distance < MAX_DRAG_DISTANCE) {
            break;
        }
        attempts++;
    } while (attempts < 50);

    return { x: targetX, y: targetY };
}

function showDragTarget(x, y) {
    const dragTarget = document.getElementById('drag-target');
    dragTarget.style.left = `${x}px`;
    dragTarget.style.top = `${y}px`;
    dragTarget.style.display = 'block';
}

function hideDragTarget() {
    const dragTarget = document.getElementById('drag-target');
    dragTarget.style.display = 'none';
}

function isWithinDragTarget(mouseX, mouseY) {
    const distance = Math.sqrt((mouseX - dragTargetX) ** 2 + (mouseY - dragTargetY) ** 2);
    return distance <= DRAG_TARGET_RADIUS;
}

function showScrollMinigame() {
    // Reset scroll variables
    scrollBlockPosition = SCROLL_TRACK_HEIGHT / 2 - SCROLL_BLOCK_HEIGHT / 2; // Center the block
    scrollTargetPosition = getRandomRange(0, SCROLL_TRACK_HEIGHT - SCROLL_TARGET_HEIGHT);

    // Update DOM elements
    const scrollMinigame = document.getElementById('scroll-minigame');
    const scrollBlock = document.getElementById('scroll-block');
    const scrollTarget = document.getElementById('scroll-target');

    scrollBlock.style.top = `${scrollBlockPosition}px`;
    scrollBlock.style.height = `${SCROLL_BLOCK_HEIGHT}px`;
    scrollTarget.style.top = `${scrollTargetPosition}px`;
    scrollTarget.style.height = `${SCROLL_TARGET_HEIGHT}px`;

    scrollMinigame.style.display = 'flex';
    isScrolling = true;

    console.log(`Scroll minigame started - target at ${scrollTargetPosition}px`);
}

function hideScrollMinigame() {
    const scrollMinigame = document.getElementById('scroll-minigame');
    scrollMinigame.style.display = 'none';
    isScrolling = false;
}

function updateScrollBlock(deltaY) {
    if (!isScrolling) return;

    // Update block position based on scroll
    scrollBlockPosition += deltaY * SCROLL_SENSITIVITY;

    // Constrain to track bounds
    const minPosition = 0;
    const maxPosition = SCROLL_TRACK_HEIGHT - SCROLL_BLOCK_HEIGHT;
    scrollBlockPosition = Math.max(minPosition, Math.min(maxPosition, scrollBlockPosition));

    // Update DOM
    const scrollBlock = document.getElementById('scroll-block');
    scrollBlock.style.top = `${scrollBlockPosition}px`;

    // Check if block is within target
    if (isScrollBlockInTarget()) {
        console.log('Scroll target achieved!');
        hideScrollMinigame();
        moveTargetButton();
        successfulClicks += 1;
        console.log(`scroll completed - click ${successfulClicks}`);
        playChime(true);
    }
}

function isScrollBlockInTarget() {
    const blockTop = scrollBlockPosition;
    const blockBottom = scrollBlockPosition + SCROLL_BLOCK_HEIGHT;
    const targetTop = scrollTargetPosition;
    const targetBottom = scrollTargetPosition + SCROLL_TARGET_HEIGHT;

    // Check if block is completely within target
    return blockTop >= targetTop && blockBottom <= targetBottom;
}

function handleScrollEvent(e) {
    if (currentAction === 'scroll' && isScrolling) {
        e.preventDefault();
        updateScrollBlock(e.deltaY);
    }
}

function checkMultiAction(e) {
    if (e.type === 'mousedown') {
        if (currentAction === 'left-click' && e.which === 1) {
            return true;
        } else if (currentAction === 'right-click' && e.which === 3) {
            return true;
        } else if (currentAction === 'hold' && e.which === 1) {
            isHolding = true;
            isDragging = true;
            e.target.classList.add('dragging');

            // Generate drag target position immediately
            const buttonRect = e.target.getBoundingClientRect();
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;

            const dragTarget = generateDragTarget(buttonCenterX, buttonCenterY);
            dragTargetX = dragTarget.x;
            dragTargetY = dragTarget.y;

            showDragTarget(dragTargetX, dragTargetY);
            console.log('Drag target shown - move mouse to target and release');

            return false; // Don't complete yet, wait for drag and mouseup
        }
    } else if (e.type === 'mouseup') {
        if (currentAction === 'hold' && e.which === 1 && isHolding) {
            isHolding = false;
            hideDragTarget();

            // Remove dragging class when mouse is released
            const targetButton = document.getElementById('target-button');
            targetButton.classList.remove('dragging');

            if (isDragging && isWithinDragTarget(e.clientX, e.clientY)) {
                console.log('Successful drag to target!');
                return true;
            } else {
                console.log('Mouse released outside target area');
            }
        }
    } else if (e.type === 'mouseleave') {
        if (currentAction === 'hold' && isHolding) {
            // Don't end the action on mouseleave for hold & drag
            // User might drag outside the button area
            return false;
        }
    } else if (e.type === 'contextmenu') {
        if (currentAction === 'right-click') {
            return true;
        }
    }

    return false;
}

const button_handler = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (checkMultiAction(e)) {
        moveTargetButton();
        successfulClicks += 1;
        console.log(`${currentAction} completed - click ${successfulClicks}`);
        playChime(true);
    }
}

function moveTargetButton() {
    const button_size = BUTTON_SIZES[Math.floor(Math.random() * BUTTON_SIZES.length)];
    const buttonSize = window.innerWidth * button_size;

    // Random polar sampling
    const bound = (1 - SCREEN_AREA_USED) / 2
    const minX = bound * window.innerWidth + buttonSize / 2;
    const maxX = (1 - bound) * window.innerWidth - buttonSize / 2;
    const minY = bound * window.innerHeight + buttonSize / 2;
    const maxY = (1 - bound) * window.innerHeight - buttonSize / 2;

    const translate_dist = getRandomRange(0.01, BUTTON_RESPAWN_MAX_RAD) * window.innerWidth;

    let newX, newY;
    for (var i = 0;; i++) {
        // In rare cases this loop may get stuck forever
        const random_theta = getRandomRange(0, 2 * Math.PI);
        newX = lastX + Math.cos(random_theta) * translate_dist;
        newY = lastY + Math.sin(random_theta) * translate_dist;

        if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY)
            break;

        if (i > 100) {
            // Random cartesian sampling
            newX = getRandomRange(minX, maxX);
            newY = getRandomRange(minY, maxY);
            break;
        }
    }

    const targetButtonContainer = document.getElementById('target-button-container');
    const targetButton = document.getElementById('target-button');
    const targetButtonLabel = document.getElementById('target-button-label');

    targetButtonContainer.style.left = `${newX}px`
    targetButtonContainer.style.top = `${newY}px`
    targetButton.style.height = `${buttonSize}px`;
    targetButton.style.width = `${buttonSize}px`;

    // Set random action and update label text (not button text)
    currentAction = getRandomAction();
    targetButtonLabel.textContent = ACTION_LABELS[currentAction];
    console.log(`New button action: ${currentAction}`);

    lastX = newX;
    lastY = newY;
}

function startExperience() {
    loadChimes();
    successfulClicks = 0;
    moveTargetButton();

    // Add all necessary event listeners for multi-action experience
    const targetButton = document.getElementById('target-button');
    targetButton.addEventListener('mousedown', button_handler);
    targetButton.addEventListener('mouseup', button_handler);
    targetButton.addEventListener('mouseleave', button_handler);
    targetButton.addEventListener('click', button_handler);
    targetButton.addEventListener('contextmenu', button_handler);

    // Add mouseover event for scroll action
    targetButton.addEventListener('mouseover', (e) => {
        if (currentAction === 'scroll' && !isScrolling) {
            showScrollMinigame();
        }
    });

    // Add global mouseup listener for drag actions that happen outside the button
    document.addEventListener('mouseup', (e) => {
        if (currentAction === 'hold' && isHolding && isDragging) {
            button_handler(e);
        }
    });

    // Add scroll event listener for scroll minigame
    document.addEventListener('wheel', handleScrollEvent, { passive: false });

    const percentageView = SCREEN_AREA_USED * 100
    document.getElementById('container-outline').style.width = `${percentageView}vw`
    document.getElementById('container-outline').style.height = `${percentageView}vh`

    document.getElementById('start-screen').style.display = "none";
    document.getElementById('experience-screen').style.display = "";
}
