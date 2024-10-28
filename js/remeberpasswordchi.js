// Check if SpeechRecognition is supported in this browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'zh-CN'; // Set language to Chinese
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let awaitingLoginConfirmation = false; // Track login confirmation
    let spokenUserId = ""; // Store the User ID entered by voice

    // Notify user they're on the "remember password" page and prompt for User ID
    speakBack("您在记住密码页面。请说出您的用户 ID。", "zh-CN");

    // Start voice recognition
    startVoiceRecognition();

    function startVoiceRecognition() {
        recognition.start();
        console.log("Starting voice recognition...");
    }

    recognition.onstart = () => {
        hasMicPermission = true;
        console.log("Microphone permission granted, listening...");
    };

    recognition.onresult = (event) => {
        processRecognitionResult(event);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakBack(`错误: ${event.error}`, "zh-CN");
    };

    recognition.onend = () => {
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);

        // Clean and process recognized word
        spokenWord = spokenWord.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Handle login confirmation
        if (awaitingLoginConfirmation) {
            if (spokenWord === "是") {
                document.querySelector(".submit-btn").click();
                speakBack("表单已提交。", "zh-CN");
                awaitingLoginConfirmation = false;
            } else if (spokenWord === "否" || spokenWord === "不是") {
                speakBack("请重新输入您的用户 ID。", "zh-CN");
                document.getElementById(currentField).value = ""; // Clear the input field
                spokenUserId = ""; // Reset User ID
                awaitingLoginConfirmation = false;
            } else {
                speakBack("请说 是 或 否。", "zh-CN");
            }
            return;
        }

        // Handle completion and read-back
        if (spokenWord === "完成" || spokenWord === "完" || spokenWord === "玩") {
            const inputField = document.getElementById(currentField);
            spokenUserId = inputField.value;
            speakBack(`您的用户 ID 是: ${spokenUserId}. 准备提交表单吗？请说 是 或 否。`, "zh-CN");
            awaitingLoginConfirmation = true;
            return;
        }

        // Process recognized characters and digits
        const spokenToCharMap = {
            "hey": "A","哎":"A", "ay": "A", "a": "A", "诶": "A", "bee": "B", "逼": "B", "b": "B", "be": "B", "see": "C", "sea": "C", "c": "C", 
            "dee": "D", "d": "D", "的": "D", "ee": "E", "e": "E", "一": "E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M", "im": "M", "an": "N", "anne": "N", "and": "N", "嗯": "N", "en": "N", "n": "N", 
            "oh": "O", "o": "O", "哦": "O", "pee": "P", "屁": "P", "p": "P", "queue": "Q", "q": "Q", "kill": "Q", 
            "二": "R", "are": "R", "r": "R", "ess": "S", "s": "S", "tee": "T", "tea": "T", "t": "T", "you": "U", "u": "U", 
            "we": "V", "vee": "V", "v": "V", "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", 
            "zee": "Z", "z": "Z", "the": "Z", "zero": "0", "one": "1", "two": "2", "兔": "2", "tree": "3", "three": "3", 
            "for": "4", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", 
            "dollar": "$", "dollar sign": "$", "hash": "#", "hashtag": "#", "hash tag": "#", "exclamation": "!", 
            "exclamation mark": "!", "at": "@", "percent": "%", "per cent": "%", "caret": "^", "carrot": "^", 
            "ampersand": "&", "plus": "+", "equal": "=", "equals": "=", "left bracket": "[", "right bracket": "]", 
            "left parenthesis": "(", "right parenthesis": ")", "colon": ":", "semicolon": ";", "quote": "\"", 
            "double quote": "\"", "single quote": "'", "comma": ",", "period": ".", "slash": "/", 
            "backslash": "\\", "pipe": "|", "less than": "<", "greater than": ">", "question mark": "?", 
            "tilde": "~", "grave": "`"
        };

        const character = spokenToCharMap[spokenWord];
        if (character) {
            processSpokenCharacter(character, spokenWord);
        } else {
            speakBack(`无法识别的输入 "${spokenWord}"`, "zh-CN");
        }
    }

    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            inputField.value += character;
            speakBack(`当前输入的字符是: ${charName}`, "zh-CN");
        } else {
            speakBack("找不到输入字段。", "zh-CN");
        }
    }

    function speakBack(message, lang = "zh-CN") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }
}
