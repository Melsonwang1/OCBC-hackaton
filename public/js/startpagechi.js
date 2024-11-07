const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    // Set up recognition for Chinese language
    const loginQuestionRecognition = new SpeechRecognition();
    loginQuestionRecognition.lang = 'zh-CN';
    loginQuestionRecognition.interimResults = false;
    loginQuestionRecognition.maxAlternatives = 1;

    // Recognition for detecting if they want to log in later
    const loginCommandRecognition = new SpeechRecognition();
    loginCommandRecognition.lang = 'zh-CN';
    loginCommandRecognition.interimResults = false;
    loginCommandRecognition.maxAlternatives = 1;

    // Function to speak a message in Chinese
    const speakBack = (message, lang = 'zh-CN') => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    };

    // Prompt asking if user wants to log in now
    const askIfLoginNow = () => {
        speakBack("您想要登录吗？如果想登录，请说 '是'。如果不想登录，可以稍后说 '我要登录'。");
        loginQuestionRecognition.start();
    };

    // Start by asking the user if they want to log in upon arriving at the Chinese start page
    askIfLoginNow();

    // Handle response to initial login question
    loginQuestionRecognition.onresult = (event) => {
        const response = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Login question response:", response);

        if (response === "是") {
            // If the user says '是' (yes), confirm and redirect to the login page in Chinese
            speakBack("正在重定向到登录页面。");
            window.location.href = "loginchi.html";
        } else {
            // If the user says 'no' or another response, instruct them to say "我要登录" when ready
            speakBack("好的，如果您想登录，请稍后说 '我要登录'。");
            // Start continuous listening for the login command later
            loginCommandRecognition.start();
        }
    };

    loginQuestionRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Login question recognition error:", event.error);
        }
    };

    // Continuous listening for "我要登录" (I want to log in) if the user initially says no
    loginCommandRecognition.onresult = (event) => {
        const command = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Login command response:", command);

        if (command.includes("我要登录")) {
            // If the user says "我要登录" at any point, redirect them to the login page
            speakBack("正在重定向到登录页面。");
            window.location.href = "loginchi.html";
        }
    };

    loginCommandRecognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Login command recognition error:", event.error);
        }
    };

    // Restart `loginCommandRecognition` for continuous listening if it stops
    loginCommandRecognition.onend = () => {
        loginCommandRecognition.start();
    };

} else {
    alert("您的浏览器不支持语音识别。");
}
