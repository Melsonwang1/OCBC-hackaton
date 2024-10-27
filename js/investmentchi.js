if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    let isRecognitionRunning = false;

    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();

        if (command.includes("账户")) {
            narrate("正在导航到查看账户页面。");
            window.location.href = "accounts.html";
        } else if (command.includes("转账")) {
            narrate("正在导航到转账和支付页面。");
            window.location.href = "transfer.html";
        } else if (command.includes("投资")) {
            narrate("您在投资页面。");
        } else {
            narrate("此页面上未识别命令。");
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
        console.log(`识别结果: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        startListening();
    };

    recognition.onerror = (event) => {
        console.error('发生错误:', event.error);
        narrate('发生错误。请再试一次。');
        isRecognitionRunning = false;
        startListening();
    };

    // Initial welcome message in Chinese
    narrate('欢迎来到投资页面。以下是您当前的投资。说 "账户" 查看账户，"转账" 进行转账，或"投资"留在此页面。');
    startListening();

} else {
    const narrate = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    };
    narrate('抱歉,您的浏览器不支持网络语音API。');
}
