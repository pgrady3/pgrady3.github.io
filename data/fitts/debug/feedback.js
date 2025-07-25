/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedback-form');
    const submitButton = document.getElementById('submit-btn');
    const thankYouMessage = document.getElementById('thank-you-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

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

function validateForm() {
    const requiredQuestions = [
        'ease_of_interaction',
        'satisfaction',
        'frustration_level',
        'feeling_of_control',
        'fatigue',
        'accuracy',
        'lag',
        'likelihood_of_use'
    ];

    let isValid = true;
    let firstInvalidQuestion = null;

    requiredQuestions.forEach(questionName => {
        const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
        if (!selectedOption) {
            isValid = false;
            if (!firstInvalidQuestion) {
                firstInvalidQuestion = document.querySelector(`input[name="${questionName}"]`);
            }
        }
    });

    if (!isValid) {
        alert('Please answer all required questions before submitting.');
        if (firstInvalidQuestion) {
            firstInvalidQuestion.closest('.question-group').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
        return false;
    }

    return true;
}

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

// Optional: Add some visual feedback for radio button interactions
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove any existing selection styling from the question group
            const questionGroup = this.closest('.question-group');
            const allOptions = questionGroup.querySelectorAll('.likert-option');

            allOptions.forEach(option => {
                option.classList.remove('selected');
            });

            // Add selection styling to the chosen option
            this.closest('.likert-option').classList.add('selected');
        });
    });
});

// Add some additional CSS for the selected state
const style = document.createElement('style');
style.textContent = `
    .likert-option.selected {
        background-color: #e3f2fd !important;
        border-left: 4px solid #4a90e2;
    }
`;
document.head.appendChild(style);
