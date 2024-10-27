// Check if SpeechRecognition is supported in this browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let useVoiceFeedback = false; // Default to no voice feedback
    let awaitingVoiceFeedbackResponse = true;
    let awaitingRememberMeConfirmation = false; // Tracks remember-me prompt
    let awaitingLoginConfirmation = false; // Tracks login confirmation

    // Narrate prompt to ask user if they want voice feedback
    speakBack("您想启用语音反馈吗？请说是或否。");

    // Start voice recognition after the prompt
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
        if (event.error === "not-allowed") {
            alert("Please allow microphone access.");
        }
        if (useVoiceFeedback) speakBack(`错误: ${event.error}`);
    };

    recognition.onend = () => {
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Handle voice feedback confirmation
        if (awaitingVoiceFeedbackResponse) {
            if (spokenWord === "yes") {
                useVoiceFeedback = true;
                speakBack("语音反馈已启用。您忘记密码了吗？请说是或否。");
            } else if (spokenWord === "no") {
                useVoiceFeedback = false;
                speakBack("语音反馈已禁用。您忘记密码了吗？请说是或否。");
            } else {
                speakBack("请说是或否以确认。");
                return;
            }
            awaitingVoiceFeedbackResponse = false;
            awaitingForgotPassword = true;
            return;
        }

        // Handle forgot password confirmation
        if (awaitingForgotPassword) {
            if (spokenWord === "yes") {
                window.location.href = "rememberpassword.html";
            } else if (spokenWord === "no") {
                speakBack("您在用户名字段。说 '切换到密码' 输入密码，或完成时说 '完成'。");
                currentField = 'user-id';
            } else {
                speakBack("请说是或否。");
                return;
            }
            awaitingForgotPassword = false;
            return;
        }

        // Handle remember me confirmation
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "yes") {
                document.getElementById("remember-me").checked = true;
                speakBack("已选择记住我选项。准备好登录了吗？请说是或否。");

                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "no") {
                document.getElementById("remember-me").checked = false;
                speakBack("记住我选项已禁用。准备好登录了吗？请说是或否。");

                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else {
                speakBack("请说是或否。");
                return;
            }
        }

        // Handle login confirmation
        if (awaitingLoginConfirmation) {
            if (spokenWord === "yes") {
                document.querySelector(".login-btn").click();
                awaitingLoginConfirmation = false;
            } else if (spokenWord === "no") {
                speakBack("好的，如果需要进一步帮助，请告诉我。");
                awaitingLoginConfirmation = false;
            } else {
                speakBack("请说是或否。");
            }
            return;
        }

        // Switch between fields based on spoken words
        if (spokenWord.includes("change to password") || spokenWord.includes("password") || spokenWord.includes("pin")) {
            currentField = 'pin';
            speakBack("切换到密码字段。");
            return;
        } else if (spokenWord.includes("change to username") || spokenWord.includes("user name") || spokenWord.includes("username") || spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("切换到用户名字段。");
            return;
        }

        // Handle PIN and character deletion
        if (spokenWord.startsWith("capital letter")) {
            let character = spokenWord.split(" ").pop().toUpperCase();
            processSpokenCharacter(character, character);
            return;
        } else if (spokenWord.includes("back") || spokenWord.includes("delete") || spokenWord.includes("remove") || spokenWord.includes("erase") || spokenWord.includes("undo") || spokenWord.includes("backspace") || spokenWord.includes("back space")) {
            deleteLastCharacter();
            return;
        } else if (spokenWord === "done") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
            speakBack(`用户名: ${userId}。密码: ${password}。是否需要我记住您？请说是或否。`);
            awaitingRememberMeConfirmation = true;
            return;
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

        // Map common letters, numbers, and symbols
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
            processSpokenCharacter(character, spokenWord);
        } else {
            if (useVoiceFeedback) speakBack(`错误: 未识别的输入 "${spokenWord}"`);
        }
    }
    
    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            inputField.value += character;
            if (useVoiceFeedback) speakBack(`已添加 ${charName}`);
        } else {
            if (useVoiceFeedback) speakBack("错误: 找不到字段。");
        }
    }

    function switchToPinField() {
        currentField = currentField === 'user-id' ? 'pin' : 'user-id';
        console.log("Switched to field:", currentField);
        if (useVoiceFeedback) speakBack(`已切换到 ${currentField.replace("-", " ")} 字段`);
    }

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        if (inputField && inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            if (useVoiceFeedback) speakBack("已删除最后一个字符");
        } else {
            if (useVoiceFeedback) speakBack("字段为空，无需删除。");
        }
    }

    function speakBack(message) {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
    }
}
