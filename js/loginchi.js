// Check if SpeechRecognition is supported in this browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'zh-CN'; // Start with Chinese language for initial prompt
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let awaitingForgotPassword = true; // Start with forgot password prompt
    let awaitingRememberMeConfirmation = false; // Tracks remember-me prompt
    let awaitingLoginConfirmation = false; // Tracks login confirmation

    // Start with forgot password prompt in Chinese
    speakBack("您忘记密码了吗？请说是或不是。", "zh-CN");

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
        speakBack(`Error: ${event.error}`);
    };

    recognition.onend = () => {
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);

        // Clean the word and handle simplified Chinese responses
        spokenWord = spokenWord.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Handle forgot password confirmation in Chinese
        if (awaitingForgotPassword) {
            if (spokenWord === "是") {
                speakBack("您选择了是", "zh-CN");
                window.location.href = "rememberpassword.html";
                awaitingForgotPassword = false;
                return;
            } else if (spokenWord === "不是" || spokenWord === "不") {
                speakBack("您在用户 ID 字段中。请说 '切换到密码' 以输入密码，或完成时说 '完成'。", "zh-CN");
                currentField = 'user-id';
                awaitingForgotPassword = false;
                return;
            } else {
                speakBack("请说是或不是。", "zh-CN");
                return;
            }
        }

        // Process special characters and letter/numbers
        const specialCharacterMap = {
            "left bracket": "[", "right bracket": "]", "left parenthesis": "(", "right parenthesis": ")",
            "underscore": "_", "under score": "_", "dash": "-", "star": "*", "asterisk": "*", "estrus": "*"
        };
        if (specialCharacterMap[spokenWord]) {
            processSpokenCharacter(specialCharacterMap[spokenWord], spokenWord);
            return;
        }

        // Handle remember me confirmation
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "是") {
                document.getElementById("remember-me").checked = true;
                speakBack("记住我”选项现在已被选中。您准备好登录吗？请说是或不是。" , "zh-CN");
        
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "不是" || spokenWord === "不") {
                document.getElementById("remember-me").checked = false;
                speakBack("记住我选项已被禁用。您准备好登录吗？请说是或不是。" , "zh-CN");
        
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else {
                speakBack("请说是或不是。", "zh-CN");

                return;
            }
        }

        // Handle login confirmation
        if (awaitingLoginConfirmation) {
            if (spokenWord === "是") {
                document.querySelector(".login-btn").click();
                awaitingLoginConfirmation = true;
            } else if (spokenWord === "不是" || spokenWord === "不") {
                speakBack("好的，如果您需要进一步的帮助，请告诉我。" , "zh-CN");
                awaitingLoginConfirmation = false;
            } else {
                speakBack("请说是或不是。" , "zh-CN");

            }
            return;
        }

        // Switch between fields based on spoken words
        if (spokenWord.includes("密码") || spokenWord.includes("切换到密码")) {
            currentField = 'pin';
            speakBack("切换到密码字段。", "zh-CN");
            return;
        } else if (spokenWord.includes("切换到用户名") || spokenWord.includes("用户名")  || spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("切换到用户名字段。", "zh-CN");
            return;
        }

        // Handle character deletion
        if (spokenWord.includes("返回") || spokenWord.includes("删除") || spokenWord.includes("remove") || spokenWord.includes("erase")) {
            deleteLastCharacter();
            return;
        } else if (spokenWord === "完成" || spokenWord === "完") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
            speakBack(`用户 ID: ${userId}。密码: ${password}。您想让我记住您吗？请说是或不是。`, "zh-CN");
            awaitingRememberMeConfirmation = true;
            return;
        }

        // Map common letters, numbers, and symbols
        const spokenToCharMap = {
            "hey": "A", "ay": "A", "a": "A","诶":"A", "bee": "B", "b": "B","be":"B", "see": "C", "sea": "C", "c": "C", 
            "dee": "D", "d": "D","的":"D", "ee": "E", "e": "E","一":"E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M","im":"M","an":"N","anne":"N","and":"N","嗯":"N", "en": "N", "n": "N", "oh": "O", "o": "O","哦":"O", 
            "pee": "P","屁":"P", "p": "P", "queue": "Q", "q": "Q","kill":"Q","二":"R", "are": "R", "r": "R", "ess": "S", "s": "S", 
            "tee": "T", "tea": "T", "t": "T", "you": "U", "u": "U","we":"V", "vee": "V", "v": "V", 
            "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z","the":"Z",
            "zero": "0", "one": "1", "two": "2","兔":"2","tree":"3", "three": "3","for":"4", "four": "4", "five": "5", "six": "6", 
            "seven": "7", "eight": "8", "nine": "9", "dollar": "$", "dollar sign": "$", "hash": "#", 
            "hashtag": "#","hash tag":"#", "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%","per cent": "%", 
            "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "=","一锅":"=","equals":"="    
        };
        const character = spokenToCharMap[spokenWord];
        if (character) {
            processSpokenCharacter(character, spokenWord);
        } else {
            speakBack(`Error: unrecognized input "${spokenWord}"`);
        }
    }

    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            inputField.value += character;
            speakBack(`当前输入的字符是: ${charName}`, "zh-CN");
        } else {
            speakBack("Error: Field not found.");
        }
    }

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        if (inputField && inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            speakBack("Deleted last character");
        } else {
            speakBack("Field is empty, nothing to delete.");
        }
    }

    function speakBack(message, lang = "en-US") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }
}
