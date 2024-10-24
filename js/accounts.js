if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Set up English SpeechRecognition instance
    const recognitionEnglish = new SpeechRecognition();
    recognitionEnglish.lang = 'en-US';
    recognitionEnglish.continuous = true;
    recognitionEnglish.interimResults = false;

    // Set up Chinese SpeechRecognition instance
    const recognitionChinese = new SpeechRecognition();
    recognitionChinese.lang = 'zh-CN';
    recognitionChinese.continuous = true;
    recognitionChinese.interimResults = false;

    // Start both recognitions automatically
    recognitionEnglish.start();
    recognitionChinese.start();
    console.log('English and Chinese speech recognition started');

    // Get the result element to show feedback
    const resultElement = document.getElementById('result');

    // Speech Synthesis function for narration
    const narrate = (message, lang) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;

        // Adjust speed for Chinese narration
        if (lang === 'zh-CN') {
            utterance.rate = 0.85; // Adjust the speed
        }

        window.speechSynthesis.speak(utterance);
    };

    // Common function to handle commands in either language
    const handleCommand = (spokenText) => {
        const lowerText = spokenText.toLowerCase();
        const lowerChineseText = spokenText.toLowerCase(); // Handle mixed text

        // Mixed language handling for view accounts
        if (lowerText.includes('view accounts') || lowerText.includes('accounts') || lowerChineseText.includes('查看账户') || lowerChineseText.includes('bank account') || lowerChineseText.includes('余额')) {
            const message = 'Navigating to View Accounts...';
            console.log(message);
            resultElement.textContent = message;
            narrate(message, lowerText.includes('账户') ? 'zh-CN' : 'en-US'); // Narrate in detected language
            window.location.href = 'view-accounts.html';
        }
        // Mixed language handling for transfer/payments
        else if (lowerText.includes('transfer') || lowerText.includes('payments') || lowerText.includes('send money') || lowerChineseText.includes('转账') || lowerChineseText.includes('支付')) {
            const message = 'Navigating to Transfer and Payments...';
            console.log(message);
            resultElement.textContent = message;
            narrate(message, lowerText.includes('转账') ? 'zh-CN' : 'en-US'); // Narrate in detected language
            window.location.href = 'transfer-payments.html';
        }
        // Mixed language handling for investments
        else if (lowerText.includes('investments') || lowerText.includes('invest') || lowerChineseText.includes('投资') || lowerChineseText.includes('理财')) {
            const message = 'Navigating to Investments...';
            console.log(message);
            resultElement.textContent = message;
            narrate(message, lowerText.includes('投资') ? 'zh-CN' : 'en-US'); // Narrate in detected language
            window.location.href = 'investments.html';
        }
        else {
            const message = 'Command not recognized. Please try again.';
            console.log(message);
            resultElement.textContent = message;
            narrate(message, 'en-US'); // Narration in English as fallback
        }
    };

    // When English speech is recognized
    recognitionEnglish.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log('Recognized in English: ' + spokenText);
        handleCommand(spokenText);
    };

    // When Chinese speech is recognized
    recognitionChinese.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log('识别到的内容: ' + spokenText); // "Recognized in Chinese: "
        handleCommand(spokenText);
    };

    // Handle English recognition errors
    recognitionEnglish.onerror = (event) => {
        const message = 'Error occurred: ' + event.error;
        console.error(message);
        resultElement.textContent = message;
        narrate(message, 'en-US');
    };

    // Handle Chinese recognition errors
    recognitionChinese.onerror = (event) => {
        const message = '发生错误: ' + event.error; // "Error occurred: "
        console.error(message);
        resultElement.textContent = message;
        narrate(message, 'zh-CN');
    };

} else {
    const message = 'Sorry, your browser does not support the Web Speech API.';
    console.warn(message);
    document.getElementById('result').textContent = message;
    narrate(message, 'en-US');
}
