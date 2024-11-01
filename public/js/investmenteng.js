if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    let isRecognitionRunning = false;

    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();

        if (command.includes("accounts")) {
            narrate("Navigating to View Accounts page.");
            window.location.href = "accounts.html";
        } else if (command.includes("transfer")) {
            narrate("Navigating to Transfer and Payments page.");
            window.location.href = "transfer.html";
        } else if (command.includes("investment")) {
            narrate("You are on the Investment page.");
        } else {
            narrate("Command not recognized on this page.");
        }
    };

    const startListening = () => {
        if (!isRecognitionRunning) {
            recognition.start();
            isRecognitionRunning = true;
        }
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log(`Recognized: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        startListening();
    };

    recognition.onerror = (event) => {
        console.error('Error occurred:', event.error);
        narrate('Error occurred. Please try again.');
        isRecognitionRunning = false;
        startListening();
    };

    // Initial welcome message
    narrate('Welcome to the Investment page. Here are your current investments. Say "Accounts" to view accounts, "Transfer" for transfers, or "Investment" for this page.');
    startListening();

} else {
    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };
    narrate('Sorry, your browser does not support the Web Speech API.');
}
