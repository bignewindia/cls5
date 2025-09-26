document.addEventListener('DOMContentLoaded', function() {
    const examForm = document.getElementById('examForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progressBar');
    const examContainer = document.getElementById('examContainer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackText = document.getElementById('feedbackText');
    const resetExamBtn = document.getElementById('resetExamBtn');

    let currentStep = 0; // 0-indexed: represents the current question shown

    function updateProgressBar() {
        // Calculate progress based on current step (0 to max-1)
        // If there's only one step, progress is always 100% when active.
        let progress = 0;
        if (formSteps.length > 1) {
            progress = (currentStep / (formSteps.length - 1)) * 100;
        } else if (formSteps.length === 1 && currentStep === 0) {
            progress = 100; // If only one step, it's 100% when shown
        }
        progressBar.style.width = `${progress}%`;
    }

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        updateProgressBar();
    }

    function validateCurrentStep() {
        const activeStep = formSteps[currentStep];
        const radioButtons = activeStep.querySelectorAll('input[type="radio"]');
        let isAnswered = false;
        radioButtons.forEach(radio => {
            if (radio.checked) {
                isAnswered = true;
            }
        });
        return isAnswered;
    }

    // Initialize by showing the first step and progress bar
    showStep(currentStep);

    // Add event listeners for Next buttons
    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < formSteps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            } else {
                alert('Please select an answer before proceeding!');
            }
        });
    });

    // Add event listeners for Previous buttons
    document.querySelectorAll('.prev-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Handle Form submission
    examForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission to handle it with JS

        if (!validateCurrentStep()) {
            alert('Please select an answer for the current question before submitting!');
            return;
        }

        // Simulate submission with Formsubmit.co by sending a POST request
        const formData = new FormData(examForm);
        fetch(examForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json' // Important for Formsubmit.co AJAX responses
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Formsubmit often returns a success JSON
            }
            throw new Error('Network response was not ok, or Formsubmit.co returned an error.');
        })
        .then(data => {
            // Formsubmit generally returns success if the email is valid and configured.
            // A "real" failure from the form itself would need more complex server-side validation.
            showFeedback(true, "Assessment Submitted!", "Your grammar test responses have been successfully sent. Thank you!");
        })
        .catch(error => {
            console.error('Submission error:', error);
            showFeedback(false, "Submission Failed!", "There was an issue submitting your assessment. Please try again.");
        })
        .finally(() => {
            // Optional: You could disable the form or specific buttons here
        });
    });

    function showFeedback(isSuccess, title, message) {
        examContainer.style.display = 'none'; // Hide the exam questions
        feedbackMessage.style.display = 'flex'; // Show the feedback message
        feedbackTitle.textContent = title;
        feedbackText.textContent = message;

        if (isSuccess) {
            feedbackMessage.classList.add('success');
            feedbackMessage.classList.remove('failure');
        } else {
            feedbackMessage.classList.add('failure');
            feedbackMessage.classList.remove('success');
        }
        resetExamBtn.style.display = 'block'; // Always show retake button for now
    }

    // Reset button functionality
    resetExamBtn.addEventListener('click', () => {
        feedbackMessage.style.display = 'none'; // Hide feedback
        examContainer.style.display = 'block'; // Show exam again
        examForm.reset(); // Clear all selections
        currentStep = 0; // Go back to the first step
        showStep(currentStep);
        feedbackMessage.classList.remove('success', 'failure'); // Clean up classes
        resetExamBtn.style.display = 'none'; // Hide reset button initially
    });
});
