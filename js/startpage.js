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

    // Function to announce the prompt in both languages
    const speakBack = (message, lang = 'en-US') => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    };

    // Function to ask if user is ready to log in
    const askLoginReady = () => {
        speakBack("Are you ready to log in? Please say 'yes' if ready.", 'en-US');
        confirmationRecognition.start();
    };

    // Ask user their preferred language in both English and Chinese
    speakBack("What language do you speak? Please say 'English' for English.", 'en-US');
    speakBack("您说什么语言？如果您说中文，请说 '中文'。", 'zh-CN');
    
    languageRecognition.start();

    languageRecognition.onresult = (event) => {
        const spokenLanguage = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Detected language:", spokenLanguage);

        if (spokenLanguage === "english") {
            languageRecognition.stop();
            speakBack("Thank you.", 'en-US');
            setTimeout(() => {
                window.location.href = "logineng.html";
            }, 1000); // Redirect to English page after confirming language
        } else if (spokenLanguage === "中文") {
            languageRecognition.stop();
            speakBack("Redirecting to the Chinese version.", 'zh-CN');
            window.location.href = "loginchi.html";
        } else {
            speakBack("Redirecting to the English version.", 'zh-CN');
            window.location.href = "logineng.html";
        }
    };

    languageRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("There was an error with voice recognition. Please try again.");
    };

    languageRecognition.onend = () => {
        console.log("Language detection ended.");
    };

    // Handle "yes" response to log in
    confirmationRecognition.onresult = (event) => {
        if (event.results[0][0].transcript.trim().toLowerCase() === "yes") {
            window.location.href = "logineng.html";
        }
    };

    confirmationRecognition.onerror = (event) => {
        console.error("Confirmation recognition error:", event.error);
    };

    confirmationRecognition.onend = () => {
        console.log("Confirmation recognition ended.");
    };

} else {
    alert("Speech recognition is not supported in this browser.");
}
