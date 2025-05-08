/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

// Some of these variables are let, so the calling HTML file can override them
let BUTTON_SIZES = [0.01, 0.02, 0.10]; // Button size as a fraction of the viewport width
let SCREEN_AREA_USED = 0.9;    // Area of the screen which is used by the experience
let BUTTON_RESPAWN_MAX_RAD = 0.5;     // Max distance to the new button, in viewport width
const HOLD_DURATION_MS = 1000;
const MOVE_INTERVAL_TIMER_MS = 3000;
const MAX_SCROLL_TRIALS = 6;
const MAX_SELECTION_TRIALS = 6;

let timer;
let backgroundTimer;
let highlightTimeout;
let successfulClicks = 0;
let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;
let successfulHold = false;
let successChimes = [];
let errorChime;
let rng;
let elapsed = 0;
let trialNum = 1;

class RandomGenerator {
    constructor(seed) {
        // If no seed is provided, use Math.random() to generate one
        this.seed = seed !== undefined ? seed : Math.floor(Math.random() * Math.pow(2, 32));
        this.a = 1664525;
        this.c = 1013904223;
        this.m = Math.pow(2, 32);
        this.x = this.seed;
    }

    nextInt() {
        this.x = (this.a * this.x + this.c) % this.m;
        return this.x;
    }

    random() {
      return this.nextInt() / this.m;
    }
  }


function loadChimes() {
    for (var i = 1; i <= 1; i++) {
        successChimes.push(new Audio('audio/chime_' + i + '.mp3'));
    }

    errorChime = new Audio('audio/error_1.mp3');
}

function playChime(success) {
    if (success) {
        let soundToPlay = successChimes[Math.floor(rng.random() * successChimes.length)];
        console.log(`Playing chime ${soundToPlay.src}`);
        soundToPlay.pause();
        soundToPlay.currentTime = 0;
        soundToPlay.play();
    } else {
        errorChime.play();
    }
}

function checkClick(e, clickMethod) {
    switch (clickMethod) {
        case 'single': {
            return e.which === 1;
        }
        case 'directtouch': {
            return e.which === 1;
        }
        case 'double': {
            return e.detail === 2;
        }
        case 'secondary': {
            return e.which === 3;
        }
    }
    return false;
}

function getRandomRange(min, max) {
    return rng.random() * (max - min + 1) + min;
}

const button_handler = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (CLICK_METHOD === 'single' || CLICK_METHOD === 'double' || CLICK_METHOD === 'secondary' || CLICK_METHOD === 'directtouch') {
        if (checkClick(e, CLICK_METHOD)) {
            moveTargetButton();
            successfulClicks += 1;
            console.log(`click ${successfulClicks}`);
            playChime(true);
            return;
        }
    }
    if (CLICK_METHOD === 'hold') {
        if (e.which != 1) {
            return; // Ignore right/middle clicks
        }

        if (event.type === 'mousedown') {
            console.log('MouseDown event');
            successfulHold = false;

            e.target.classList.remove('hold-long');
            e.target.classList.add('hold-short');

            timer = setTimeout(() => {
                console.log('Button has been held for 1 second');
                successfulHold = true;
                e.target.classList.add('hold-long');
                e.target.classList.remove('hold-short');
            }, HOLD_DURATION_MS);

        } else if (event.type === 'mouseup' || event.type === 'mouseleave') {
            console.log('MouseUp/MouseLeave event');
            clearTimeout(timer);    // If we got a mouseup before the timer expires, then the user didn't hold the button long enough
            e.target.classList.remove('hold-long');
            e.target.classList.remove('hold-short');

            if (successfulHold) {
                moveTargetButton();
                successfulClicks += 1;
                playChime(true);
                console.log(`click ${successfulClicks}`);
            }
        }
    }
}

function setBackgroundTimer() {
    // Useful for the no-contact action. If the cursor moves anywhere on the page, change the background to red for 2 seconds
    document.getElementById('container-outline').style.backgroundColor = '#ff7573'; // Change the background color to red
    clearTimeout(backgroundTimer); // Clear any existing timer

    playChime(false);   // Play the error chime

    backgroundTimer = setTimeout(() => {
        document.getElementById('container-outline').style.backgroundColor = '#fafafa'; // Reset the background
    }, 2000);
}

function moveTargetButton() {
    const button_size = BUTTON_SIZES[Math.floor(rng.random() * BUTTON_SIZES.length)];
    const buttonSize = window.innerWidth * button_size;

    // Random polar sampling
    const bound = (1 - SCREEN_AREA_USED) / 2
    const minX = bound * window.innerWidth + buttonSize / 2;
    const maxX = (1 - bound) * window.innerWidth - buttonSize / 2;

    const minY = bound * window.innerHeight + buttonSize / 2;
    const maxY = (1 - bound) * window.innerHeight - buttonSize / 2;

    const translate_dist = getRandomRange(0.01, BUTTON_RESPAWN_MAX_RAD) * window.innerWidth;

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

    targetButton = document.getElementById('target-button');
    targetButton.style.left = `${newX}px`
    targetButton.style.top = `${newY}px`
    targetButton.style.height = `${buttonSize}px`;
    targetButton.style.width = `${buttonSize}px`;

    lastX = newX;
    lastY = newY;
}

function startExperience() {
    rng = new RandomGenerator();
    loadChimes();
    successfulClicks = 0;
    moveTargetButton();

    if (CLICK_METHOD === 'timer') {
        setInterval(moveTargetButton, MOVE_INTERVAL_TIMER_MS); // Move the button at a fixed rate
        document.addEventListener('mousemove', setBackgroundTimer);
        document.addEventListener('mousedown', setBackgroundTimer);
    } else if (CLICK_METHOD === 'hold') {
        document.getElementById('target-button').addEventListener('mousedown', button_handler);
        document.getElementById('target-button').addEventListener('mouseup', button_handler);
        document.getElementById('target-button').addEventListener('mouseleave', button_handler);
    } else if (CLICK_METHOD === 'directtouch') {
        document.addEventListener('click', button_handler);
        document.addEventListener('contextmenu', button_handler);
    } else {
        document.getElementById('target-button').addEventListener('click', button_handler);
        document.getElementById('target-button').addEventListener('contextmenu', button_handler);
    }

    const percentageView = SCREEN_AREA_USED * 100
    document.getElementById('container-outline').style.width = `${percentageView}vw`
    document.getElementById('container-outline').style.height = `${percentageView}vh`

    document.getElementById('start-screen').style.display = "none";
    document.getElementById('experience-screen').style.display = "";
}

function setExperienceTitle(title, explanation) {
    document.getElementById('text-top-left').innerHTML = title;
    document.getElementById('start-title').innerHTML = title;
    document.getElementById('start-explanation').innerHTML = explanation;
    document.title = title;
}

function highlightRandomPhraseScroll() {
    let paragraphs = document.querySelectorAll('.scroll-text');
    paragraphs = Array.from(paragraphs).slice(1, -1);  // remove first and last element so the text is always possible to scroll to
    const randomParagraph = paragraphs[Math.floor(rng.random() * paragraphs.length)];
    const paragraphText = randomParagraph.textContent.replace(/\s+/g, ' ').trim();
    const phrases = paragraphText.split(' ');
    const wordCount = Math.floor(rng.random() * 2) + 3; // Select between 3 and 5 words
    const startIndex = Math.floor(rng.random() * (phrases.length - wordCount));
    const endIndex = startIndex + wordCount;

    const highlight = document.createElement('span');
    highlight.classList.add('highlight');

    highlight.textContent = phrases.slice(startIndex, endIndex).join(' ');
    const beforeText = phrases.slice(0, startIndex).join(' ');
    const afterText = phrases.slice(endIndex).join(' ');
    randomParagraph.innerHTML = `${beforeText} ${highlight.outerHTML} ${afterText}`;
    console.log('Highlighting: ' + highlight.innerHTML);

    if (isHighlightInTargetbox()) {
        removeHighlight();
        highlightRandomPhraseScroll(); // If the highlight is in targetbox, try again
    }

    showUpDownArrows();

    if (successfulClicks >= MAX_SCROLL_TRIALS) {
        // End experience
        document.getElementById('start-screen').style.display = "";
        document.getElementById('scroll-body').style.display = "none";
        removeHighlight();

        document.getElementById('scroll-body').removeEventListener('scroll', onScrollCallback);

        let startText = document.getElementById('start-text');
        let elapsedStr = (elapsed / 1000).toFixed(2)
        startText.innerText = `#${trialNum}, TTC: ${elapsedStr}s\n` + startText.innerText;
        submitForm(trialNum, elapsedStr);
        trialNum += 1;
    }
}


function removeHighlight() {
    const highlights = document.querySelectorAll('.highlight');
    for (const highlight of highlights) {
        const parent = highlight.parentNode;
        parent.innerHTML = parent.textContent; // strip out highlight formatting
    }
}

function isHighlightInTargetbox() {
    highlights = document.querySelectorAll('.highlight');
    targetbox = document.getElementById('targetbox');

    if (highlights.length === 0) {
        return false;
    }

    const highlight = highlights[0];
    const textRect = highlight.getBoundingClientRect();
    const targetRect = targetbox.getBoundingClientRect();

    if (textRect.top >= targetRect.top && textRect.bottom <= targetRect.bottom) {
        return true;
    }

    return false;
}

function showUpDownArrows() {
    highlights = document.querySelectorAll('.highlight');
    targetbox = document.getElementById('targetbox');

    if (highlights.length === 0) {
        return;
    }

    const highlight = highlights[0];
    const textRect = highlight.getBoundingClientRect();
    const targetRect = targetbox.getBoundingClientRect();
    const targetMidpoint = (targetRect.bottom + targetRect.top) / 2;

    if (textRect.bottom > targetRect.bottom) {
        // Text is below target
        document.getElementById('targetarrowup').style.display = "none";
        document.getElementById('targetarrowdown').style.display = "";
    }
    else if (textRect.top < targetRect.top) {
        // Text is above target
        document.getElementById('targetarrowup').style.display = "";
        document.getElementById('targetarrowdown').style.display = "none";
    }
    else {
        // Text somewhere inside targetbox
        document.getElementById('targetarrowup').style.display = "none";
        document.getElementById('targetarrowdown').style.display = "none";
    }
}

function onScrollCallback() {
    // If the highlight is in the target box, wait and check again. If still in, make a new highlight
    clearTimeout(highlightTimeout);
    showUpDownArrows();

    if (isHighlightInTargetbox()) {
        highlightTimeout = setTimeout(() => {
            if (isHighlightInTargetbox()) {   // check if still in target zone
                successfulClicks += 1;
                console.log(`click ${successfulClicks}`);
                removeHighlight();
                highlightRandomPhraseScroll();
                playChime(true);
            }
        }, 300); // Highlight will be removed after 0.5 seconds
    }
}

function startScrollExperience() {
    rng = new RandomGenerator();
    successfulClicks = 0;
    loadChimes();
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('scroll-body').style.display = "";

    document.getElementById('scroll-container').addEventListener('scroll', onScrollCallback);

    document.getElementById('scroll-container').scrollTop = 0;

    highlightRandomPhraseScroll();

    startTimer();

}


function highlightRandomPhraseSelection() {
    let paragraphs = document.querySelectorAll('.selection-text');
    paragraphs = Array.from(paragraphs);
    const lineHeight = parseFloat(window.getComputedStyle(paragraphs[0]).lineHeight);

    while (true) {
        let randomParagraph = paragraphs[Math.floor(rng.random() * paragraphs.length)];
        let paragraphText = randomParagraph.textContent.replace(/\s+/g, ' ').trim();
        let phrases = paragraphText.split(' ');
        let wordCount = Math.floor(rng.random() * 3) + 3;
        let startIndex = Math.floor(rng.random() * (phrases.length - wordCount));
        let endIndex = startIndex + wordCount;
        let highlight = document.createElement('span');
        highlight.classList.add('highlight');
        highlight.textContent = phrases.slice(startIndex, endIndex).join(' ');
        let beforeText = phrases.slice(0, startIndex).join(' ');
        let afterText = phrases.slice(endIndex).join(' ');

        // Temporarily insert the highlight into the paragraph
        randomParagraph.innerHTML = beforeText + ' ' + highlight.outerHTML + ' ' + afterText;
        // Measure the highlight
        const highlightElement = randomParagraph.querySelector('.highlight');
        const highlightHeight = highlightElement.getBoundingClientRect().height;
        console.log('Highlighting phrase: ' + highlight.textContent);

        if (highlightHeight <= lineHeight)
        {
            break;
        }
        else {
            // If it doesn't fit, reset the paragraph text
            randomParagraph.textContent = paragraphText;
        }
    }
}


function selectionChangedHandler() {
    const selection = window.getSelection().toString();                    // Get the user's selection
    const highlightedClasses = document.querySelector('.highlight');     // Get the highlighted text

    if (highlightedClasses === null)
        return;

    const targetText = highlightedClasses.textContent.slice(1, -1);                 // Remove the first and last character to allow overselection
    const indexOfSelection = selection.indexOf(targetText);                          // Check if the user's selection is in the highlighted text
    // console.log(selection.length, targetText.length, indexOfSelection, indexOfSelection + targetText.length);

    if (indexOfSelection >= 0 && indexOfSelection <= 2 && indexOfSelection + targetText.length + 2 >= selection.length) { // Check if the user's selection is the highlighted text
        console.log('User selected the highlighted text! Getting a new phrase.');
        removeHighlight();
        highlightRandomPhraseSelection();
        playChime(true);
        successfulClicks += 1;

        if (successfulClicks >= MAX_SELECTION_TRIALS) {
            // End experience
            document.getElementById('start-screen').style.display = "";
            document.getElementById('textselection-body').style.display = "none";
            removeHighlight();

            document.removeEventListener('mouseup', selectionChangedHandler);

            let startText = document.getElementById('start-text');
            let elapsedStr = (elapsed / 1000).toFixed(2)
            startText.innerText = `#${trialNum}, TTC: ${elapsedStr}s\n` + startText.innerText;
            submitForm(trialNum, elapsedStr);

            trialNum += 1;
        }
    }
}


function removeHighlight() {
    const highlights = document.querySelectorAll('.highlight');
    for (const highlight of highlights) {
        const parent = highlight.parentNode;
        const selection = window.getSelection();      // Save the current selection
        parent.innerHTML = parent.textContent;      // strip out highlight formatting
        selection.removeAllRanges();                // Clear the selection. This fixes a bug where the selection grows since the HTML is modified as the user drags
    }
}

function removeExcessParagraphs() {
    // This function deletes paragraphs until there's no more scrollbar. This is run once on pageload, and it makes sure we don't have a scrollbar.
    const paragraphs = document.querySelectorAll('#textselection-container p');
    const scrollable = document.getElementById('scroller');
    for (let i = paragraphs.length - 1; i >= 0; i--) {
        const hasVerticalScrollbar = scrollable.scrollHeight > scrollable.clientHeight;
        const paragraph = paragraphs[i];
        if (scrollable.scrollHeight > scrollable.clientHeight) {
            paragraph.parentNode.removeChild(paragraph);    // Remove the paragraph from the DOM
            console.log('Removed paragraph ' + i);
        }
    }
}

function startTextSelectionExperience() {
    rng = new RandomGenerator();
    successfulClicks = 0;
    loadChimes();
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('textselection-body').style.display = "";

    removeExcessParagraphs();
    highlightRandomPhraseSelection();

    document.addEventListener('mouseup', selectionChangedHandler);

    startTimer();
}

function startTimer() {
	let startTime = null;
	console.log('start timer');

	function loop(timestamp) {
		if (!startTime)
			startTime = timestamp;

		elapsed = timestamp - startTime;
		document.getElementById('text-top-left').innerText = (elapsed / 1000).toFixed(2);
		if ((EXPERIENCE_NAME == "Scroll" && successfulClicks >= MAX_SCROLL_TRIALS) || (EXPERIENCE_NAME == "Text Selection" && successfulClicks >= MAX_SELECTION_TRIALS)) {
			console.log('stop timer');
			return;
		}
		window.requestAnimationFrame(loop);
	}
	window.requestAnimationFrame(loop);
}

function submitForm(trial, ttc) {
    const form = document.getElementById('bootstrapForm');

    if (!form.dataset.submitHandlerAdded) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent redirection to new page
            const formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Google Forms requires no-cors mode
            })
            .then(() => {
                console.log('Form submitted successfully');
            })
            .catch((error) => {
                console.error('Error submitting form:', error);
            });
        });
        form.dataset.submitHandlerAdded = 'true';
    }

    // Populate the form fields
    document.getElementById('device_os').value = navigator.platform;
    document.getElementById('device_browser').value = navigator.userAgent;
    document.getElementById('participant_id').value = document.getElementById('button-pad-id').value;
    document.getElementById('trial_num').value = trial;
    document.getElementById('time_to_complete').value = ttc;

    // Dispatch a synthetic submit event
    form.dispatchEvent(new Event('submit', { cancelable: true }));
}

function initButtonPad() {
    const participantIdInput = document.getElementById('button-pad-id');
    const buttons = document.querySelectorAll('.button-pad button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent === 'C') {
                participantIdInput.value = '';
            } else if (participantIdInput.value.length < 2) {
                participantIdInput.value += button.textContent;
            }
        });
    });
}

window.addEventListener('load', initButtonPad);
