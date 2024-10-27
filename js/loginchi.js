const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("此浏览器不支持语音识别。");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let awaitingForgotPassword = true;
    let awaitingRememberMeConfirmation = false;
    let awaitingLoginConfirmation = false;
    let awaitingLetterInput = false;

    speakBack("您是否忘记密码？请说是或否。");
    startVoiceRecognition();

    function startVoiceRecognition() {
        recognition.start();
        console.log("开始语音识别...");
    }

    recognition.onstart = () => {
        hasMicPermission = true;
        console.log("麦克风权限已授予，正在监听...");
    };

    recognition.onresult = (event) => {
        processRecognitionResult(event);
    };

    recognition.onerror = (event) => {
        console.error("语音识别错误:", event.error);
        speakBack(`错误: ${event.error}`);
    };

    recognition.onend = () => {
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        spokenWord = spokenWord.replace(/[。？！，；]/g, '');

        if (awaitingForgotPassword) {
            if (spokenWord === "是" || spokenWord === "是的") {
                window.location.href = "rememberpassword.html";
            } else if (spokenWord === "否") {
                speakBack("您可以一个字母一个字母地说出用户名或密码。");
                awaitingForgotPassword = false;
                awaitingLetterInput = true;
            } else {
                speakBack("请说 是 或 否。");
                return;
            }
            return;
        }

        if (awaitingLetterInput) {
            handleCharacterInput(spokenWord);
        } else if (awaitingRememberMeConfirmation) {
            handleRememberMe(spokenWord);
        } else if (awaitingLoginConfirmation) {
            handleLoginConfirmation(spokenWord);
        } else {
            handleFieldSwitching(spokenWord);
        }
    }

    function handleRememberMe(spokenWord) {
        if (spokenWord === "是") {
            document.getElementById("remember-me").checked = true;
            speakBack("记住我选项已启用。您准备好登录了吗？请说 是 或 否。");
            awaitingLoginConfirmation = true;
            awaitingRememberMeConfirmation = false;
        } else if (spokenWord === "否") {
            document.getElementById("remember-me").checked = false;
            speakBack("记住我选项已禁用。您准备好登录了吗？请说 是 或 否。");
            awaitingLoginConfirmation = true;
            awaitingRememberMeConfirmation = false;
        } else {
            speakBack("请说 是 或 否。");
        }
    }

    function handleLoginConfirmation(spokenWord) {
        if (spokenWord === "是") {
            document.querySelector(".login-btn").click();
            awaitingLoginConfirmation = false;
        } else if (spokenWord === "否") {
            speakBack("好的，请告诉我是否需要进一步帮助。");
            awaitingLoginConfirmation = false;
        } else {
            speakBack("请说 是 或 否。");
        }
    }

    function handleFieldSwitching(spokenWord) {
        if (spokenWord.includes("切换到密码") || spokenWord.includes("密码")) {
            currentField = 'pin';
            speakBack("已切换到密码字段。");
        } else if (spokenWord.includes("切换到用户名") || spokenWord.includes("用户名")) {
            currentField = 'user-id';
            speakBack("已切换到用户名字段。");
        } else if (spokenWord === "完成") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
            speakBack(`用户名: ${userId}。密码: ${password}。是否记住您？请说 是 或 否。`);
            awaitingRememberMeConfirmation = true;
        } else {
            handleCharacterInput(spokenWord);
        }
    }

    function handleCharacterInput(spokenWord) {
        const spokenToCharMap = {
            "hey": "A", "ay": "A", "a": "A", "bee": "B", "b": "B","be":"B", "see": "C", "sea": "C", "c": "C", 
            "dee": "D", "d": "D", "ee": "E", "e": "E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M", "en": "N", "n": "N", "oh": "O", "o": "O", 
            "pee": "P", "p": "P", "queue": "Q", "q": "Q", "are": "R", "r": "R", "ess": "S", "s": "S", 
            "tee": "T", "tea": "T", "t": "T", "you": "U", "u": "U", "vee": "V", "v": "V", 
            "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z",
            "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", 
            "seven": "7", "eight": "8", "nine": "9", "dollar": "$", "dollar sign": "$", "hash": "#", 
            "hashtag": "#", "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%", 
            "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "="
        };
        const character = spokenToCharMap[spokenWord];
        if (character) {
            document.getElementById(currentField).value += character;
            speakBack(`已添加 ${character}`);
        } else {
            speakBack(`错误: 未识别的输入 "${spokenWord}"`);
        }
    }

    function speakBack(message) {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = 'zh-CN';
        window.speechSynthesis.speak(speech);
    }
}
