/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedback-form');
    const submitButton = document.getElementById('submit-btn');
    const thankYouMessage = document.getElementById('thank-you-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Show submitting state
        form.classList.add('form-submitting');
        submitButton.disabled = true;

        // Collect form data
        const formData = collectFormData();

        // Submit to Unity
        sendToUnity(formData);

        // Show thank you message after a short delay
        setTimeout(() => {
            form.style.display = 'none';
            thankYouMessage.style.display = 'block';
        }, 1000);
    });
});

function collectFormData() {
    const formData = {};

    // Collect Likert scale responses
    const questions = [
        'ease_of_interaction',
        'satisfaction',
        'frustration_level',
        'feeling_of_control',
        'fatigue',
        'accuracy',
        'lag',
        'likelihood_of_use'
    ];

    questions.forEach(questionName => {
        const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
        if (selectedOption) {
            formData[questionName] = parseInt(selectedOption.value);
        }
    });

    // Add metadata
    formData.timestamp = new Date().toISOString();
    formData.device_os = navigator.platform;
    formData.device_browser = navigator.userAgent;

    return formData;
}

function sendToUnity(formData) {
    console.log('Sending feedback data to Unity:', formData);

    // Send to Unity using the same method as Fitts test
    if (window.vuplex) {
        // Send form data as JSON string
        const message = JSON.stringify(formData);

        window.vuplex.postMessage({
            type: "test_result",
            message: message
        });

        console.log('Feedback data sent to Unity successfully');
    } else {
        console.log('Unity interface (vuplex) not available - running in browser mode');
        console.log('Feedback data that would be sent:', formData);
    }
}
