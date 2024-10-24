// Initialize the Speech Recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true; // Enable continuous listening mode
recognition.interimResults = false; // Finalize the result only when the user stops speaking

// Start recognition automatically when the page loads
window.onload = function() {
    startRecognition();
};

// Start recognition and set status to listening
function startRecognition() {
    recognition.start();
    document.getElementById('result').textContent = "Listening..."; // Optional: Visual cue that it's listening
}

// Handle the speech recognition result
recognition.onresult = function(event) {
    const spokenText = event.results[event.resultIndex][0].transcript.toLowerCase();
    document.getElementById('result').textContent = `You said: "${spokenText}"`;

    // Call function to navigate based on voice command
    navigateBasedOnCommand(spokenText);
};

// Define logic for navigation based on spoken commands
function navigateBasedOnCommand(command) {
    if (command.includes("view accounts")) {
        window.location.href = "#view-accounts"; // Navigate to View Accounts section
    } else if (command.includes("transfer payments")) {
        window.location.href = "#transfer-payments"; // Navigate to Transfer and Payments section
    } else if (command.includes("investments")) {
        window.location.href = "#investments"; // Navigate to Investments section
    } else if (command.includes("credit card")) {
        window.location.href = "#credit-card"; // Navigate to Credit Card section
    } else if (command.includes("loans")) {
        window.location.href = "#loans"; // Navigate to Loans section
    } else if (command.includes("home page")) {
        window.location.href = "#home"; // Navigate to Home section
    } else {
        document.getElementById('result').textContent = "Sorry, I didn't understand that.";
    }
}

// Restart recognition when it stops (for continuous listening)
recognition.onend = function() {
    recognition.start(); // Restart recognition after it ends
    document.getElementById('result').textContent = "Listening again..."; // Optional: Update status
};

// Handle recognition errors
recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    document.getElementById('result').textContent = "Error occurred, please try again.";
    recognition.start(); // Restart recognition if there's an error
};
