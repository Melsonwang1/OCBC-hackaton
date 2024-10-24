if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set recognition properties
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Button to start the speech recognition
    const startButton = document.getElementById('start-btn');
    
    startButton.addEventListener('click', () => {
        recognition.start();
        console.log('Speech recognition started');
    });

    // When speech is recognized
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript.toLowerCase();
        console.log('Recognized: ' + spokenText);

        if (spokenText.includes('view accounts')) {
            alert('Navigating to View Accounts');
            // Redirect to View Accounts page
            window.location.href = 'view-accounts.html';
        } else if (spokenText.includes('transfer') || spokenText.includes('payments')) {
            alert('Navigating to Transfer and Payments');
            // Redirect to Transfer and Payments page
            window.location.href = 'transfer-payments.html';
        } else if (spokenText.includes('investments')) {
            alert('Navigating to Investments');
            // Redirect to Investments page
            window.location.href = 'investments.html';
        } else {
            alert('Command not recognized, please try again.');
        }
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error: ', event.error);
        alert('Error occurred in speech recognition: ' + event.error);
    };

    // On recognition end (for re-triggering or alerts)
    recognition.onend = () => {
        console.log('Speech recognition ended.');
    };
} else {
    console.warn('Speech Recognition is not supported in this browser.');
    alert('Sorry, your browser does not support the Web Speech API.');
}
