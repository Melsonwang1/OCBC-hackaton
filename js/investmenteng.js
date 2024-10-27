if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Detect if selectedLanguage has been set; if not, prompt once
    let selectedLanguage = selectedLanguage || null;
    let isRecognitionRunning = false;

    const narrate = (message, lang) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        utterance.rate = lang === 'zh-CN' ? 0.85 : 1;
        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();

        if (!selectedLanguage) {
            selectedLanguage = command.includes("english") ? 'en-US' : 'zh-CN';
            recognition.lang = selectedLanguage;
            narrate(selectedLanguage === 'en-US' ? 'Welcome to the investment page.' : '欢迎来到投资页面。', selectedLanguage);
        } else {
            narrate(selectedLanguage === 'en-US' ? 'Command not recognized on this page.' : '此页面上未识别命令。', selectedLanguage);
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
        narrate(selectedLanguage === 'en-US' ? 'Error occurred. Please try again.' : '发生错误。请再试一次。', selectedLanguage || 'en-US');
        isRecognitionRunning = false;
        startListening();
    };

    // Initial welcome message based on detected language
    if (!selectedLanguage) {
        narrate('Please say "English" for English or speak in Chinese to continue in Chinese.', 'en-US');
        narrate('请说 "中文" 选择中文', 'zh-CN');
    } else {
        narrate(selectedLanguage === 'en-US' ? 'Welcome to the investment page.' : '欢迎来到投资页面。', selectedLanguage);
    }
    startListening();

} else {
    narrate('Sorry, your browser does not support the Web Speech API.', 'en-US');
}
