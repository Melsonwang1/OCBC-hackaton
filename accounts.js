
// ------------------------------ start of account speech recognition ------------------------------

// Initialize the Speech Recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

// Start recognition when the button is clicked
function startRecognition() {
    recognition.start();
    document.getElementById('result').textContent = "Listening...";
}

// Handle the speech recognition result
recognition.onresult = function(event) {
    const spokenText = event.results[0][0].transcript.toLowerCase();
    document.getElementById('result').textContent = `You said: "${spokenText}"`;

    // Call function to navigate based on voice command
    navigateBasedOnCommand(spokenText);
};

// Define logic for navigation
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

// Handle recognition errors
recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    document.getElementById('result').textContent = "Error occurred, please try again.";
};


// ------------------------------ end of account speech recognition ------------------------------