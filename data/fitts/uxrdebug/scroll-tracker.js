// Initialize a counter for scroll events
let scrollCount = 0;

// Function to update scroll count and display it
function updateScrollCount() {
    scrollCount++;
    console.log(`Scroll Count: ${scrollCount}`);
    // Optionally, update a DOM element to display the count
    const scrollDisplay = document.getElementById('scroll-count');
    if (scrollDisplay) {
        scrollDisplay.textContent = `Scroll Count: ${scrollCount}`;
    }
}

// Function to reset scroll count
function resetScrollCount() {
    scrollCount = 0;
    console.log('Scroll Count reset to 0');
    const scrollDisplay = document.getElementById('scroll-count');
    if (scrollDisplay) {
        scrollDisplay.textContent = 'Scroll Count: 0';
    }
}

// Add a scroll event listener to the window
window.addEventListener('scroll', updateScrollCount);

// Expose the reset function globally so it can be called from the HTML
window.resetScrollCount = resetScrollCount;