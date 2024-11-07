const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    // Initial recognition instance to detect preferred language
    const languageRecognition = new SpeechRecognition();
    languageRecognition.lang = 'en-US';
    languageRecognition.interimResults = false;
    languageRecognition.maxAlternatives = 1;

    // Separate recognition instance to listen for "yes" after confirming language
    const confirmationRecognition = new SpeechRecognition();
    confirmationRecognition.lang = 'en-US';
    confirmationRecognition.interimResults = false;
    confirmationRecognition.maxAlternatives = 1;

    // New recognition instance to confirm login readiness
    const loginConfirmationRecognition = new SpeechRecognition();
    loginConfirmationRecognition.lang = 'en-US';
    loginConfirmationRecognition.interimResults = false;
    loginConfirmationRecognition.maxAlternatives = 1;

    // Function to announce the prompt in both languages
    const speakBack = (message, lang = 'en-US') => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    };

    // Function to ask if user is ready to log in
    const askLoginReady = () => {
        speakBack("Are you ready to log in? Please say 'yes' if ready.", 'en-US');
        loginConfirmationRecognition.start();
    };

    // Ask user their preferred language in both English and Chinese
    speakBack("What language do you speak? Please say 'English' for English.", 'en-US');
    speakBack("您说什么语言？如果您说中文，请说 '中文'。", 'zh-CN');
    
    // Delay the start of language recognition to allow time for the prompt to complete
    setTimeout(() => {
        languageRecognition.start();
    }, 3000); // Adjust delay as needed
    
    languageRecognition.onresult = (event) => {
        const spokenLanguage = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Detected language:", spokenLanguage);

        if (spokenLanguage === "english." || spokenLanguage === "english" || spokenLanguage === "english") {
            languageRecognition.stop();
            speakBack("Redirecting you to the English Version", 'en-US');
            setTimeout(() => {
                window.location.href = "logineng.html";
            }, 1000); // Redirect to English page after confirming language
        } else if (spokenLanguage === "中文") {
            languageRecognition.stop();
            speakBack("Redirecting to the Chinese version.", 'zh-CN');
            window.location.href = "startpagechi.html";
        } else {
            speakBack("Redirecting to the Chinese version.", 'zh-CN');
            window.location.href = "startpagechi.html";
        }
    };

    languageRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Speech recognition error:", event.error);
            alert("There was an error with voice recognition. Please try again.");
        }
    };

    languageRecognition.onend = () => {
        languageRecognition.start(); // Restart recognition for continuous listening
    };

    // Handle initial "yes" response to ask if user wants to log in
    confirmationRecognition.onresult = (event) => {
        if (event.results[0][0].transcript.trim().toLowerCase() === "yes") {
            confirmationRecognition.stop();
            askLoginReady(); // Prompt the user to confirm if they're ready to log in
        }
    };

    confirmationRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Confirmation recognition error:", event.error);
        }
    };

    confirmationRecognition.onend = () => {
        confirmationRecognition.start(); // Restart confirmation recognition for continuous listening
    };

    // Handle "yes" response to log in after confirming login readiness
    loginConfirmationRecognition.onresult = (event) => {
        if (event.results[0][0].transcript.trim().toLowerCase() === "yes") {
            window.location.href = "logineng.html";
        }
    };

    loginConfirmationRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Login confirmation recognition error:", event.error);
        }
    };

    loginConfirmationRecognition.onend = () => {
        loginConfirmationRecognition.start(); // Restart login confirmation recognition for continuous listening
    };

} else {
    alert("Speech recognition is not supported in this browser.");
}
