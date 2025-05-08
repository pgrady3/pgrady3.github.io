// Initialize variables for scroll session tracking
let scrollCount = 0; // Total scroll sessions
let isScrolling = false; // Whether a scroll session is active
let scrollTimeout = null; // Timer to detect the end of a scroll session
let lastScrollTop = 0; // Tracks the last scroll position to detect direction changes
let lastScrollDirection = null; // Tracks the last scroll direction ('up' or 'down')

// Function to handle scroll events
function handleScroll(event) {
    const scrollContainer = event.target; // The scrollable container
    const currentScrollTop = scrollContainer.scrollTop; // Current scroll position

    // Determine the current scroll direction
    const currentScrollDirection = currentScrollTop > lastScrollTop ? 'down' 
                                   : currentScrollTop < lastScrollTop ? 'up' 
                                   : lastScrollDirection;

    // Start a new scroll session if:
    // 1. The direction changes
    // 2. There is no active scrolling session (e.g., after a pause)
    if (!isScrolling || currentScrollDirection !== lastScrollDirection) {
        startScrollSession(currentScrollDirection);
    }

    // Update the last scroll position and direction
    lastScrollTop = currentScrollTop;
    lastScrollDirection = currentScrollDirection;

    // Clear the previous timeout and set a new one to detect scrolling end
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(endScrollSession, 200); // 200ms pause to detect scroll stop
}

// Function to start a new scroll session
function startScrollSession(direction) {
    isScrolling = true; // Mark the start of a scroll session
    scrollCount++; // Increment the scroll session count
    console.log(`New Scroll Session Started (Direction: ${direction}). Total Sessions: ${scrollCount}`);

    // Update the display
    const scrollDisplay = document.getElementById('scroll-count');
    if (scrollDisplay) {
        scrollDisplay.textContent = `Scroll Sessions: ${scrollCount}`;
    }
}

// Function to end the current scroll session
function endScrollSession() {
    isScrolling = false; // Mark the end of the scroll session
    console.log('Scroll session ended');
}

// Add a scroll event listener to the `scroll-container` element
const scrollContainer = document.getElementById('scroll-container');
if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
} else {
    console.error('scroll-container element not found.');
}

// Add an event listener to the form to set the scroll count before submission
const form = document.querySelector('form'); // Select the form element
if (form) {
    form.addEventListener('submit', function(event) {
        const scrollTotalInput = document.getElementById('scroll_total');
        if (scrollTotalInput) {
            scrollTotalInput.value = scrollCount; // Set the input value to the scroll count
            console.log(`Scroll Total Input Set to: ${scrollCount}`);
        } else {
            console.error('Input with id "scroll_total" not found.');
        }

        // Reset the scroll count after form submission
        scrollCount = 0; // Reset the scroll count to 0
        console.log('Scroll Count reset to 0 after form submission.');

        // Optionally update the display to show the reset scroll count
        const scrollDisplay = document.getElementById('scroll-count');
        if (scrollDisplay) {
            scrollDisplay.textContent = `Scroll Sessions: ${scrollCount}`;
        }
    });
} else {
    console.error('Form element not found.');
}

// Expose the scroll count globally for debugging if needed
window.getScrollCount = () => scrollCount;