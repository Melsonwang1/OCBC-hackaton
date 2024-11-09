// login
document.addEventListener('DOMContentLoaded', async function(){
    document.getElementById("login-button").addEventListener("click",async function(e){
        e.preventDefault();
        const message = document.getElementById("message");
        let nric = document.getElementById("user-id").value;
        let password = document.getElementById("pin").value;

        if(!nric || !password){
            message.innerHTML = "Please input all field!";
            return;
        }
        else{
            await login(nric, password);
        }
    });
    
    //Login user
    async function login(nric,password){
        try{
            //fetch the endpoint with method POST
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nric, password }), //pass in the body using JSON stringify
            });
            // Handle specific response statuses
            if (response.status === 404) {
                alert("User not found!");
                return;
            }
            if (response.status === 401) {
                alert("Incorrect password!");
                return;
            }
            //Throw new error is response not ok
            if(!response.ok){
                throw new Error('Error logging in');
            }
            const data = await response.json(); //await the data
            token = data.token;
            localStorage.setItem("token",token); //set the token
            alert("Login successfully!");
            window.location.href = "accountseng.html" //direct user to patient home page
            return token;

        }
        //Catch the error if something happen
        catch{
            alert("Invalid credentials!");
        }
    }
});

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
    let awaitingForgotPassword = true; // Start with forgot password prompt
    let awaitingRememberMeConfirmation = false; // Tracks remember-me prompt
    let awaitingLoginConfirmation = false; // Tracks login confirmation

    // Start with forgot password prompt
    speakBack("Have you forgotten your password? Say yes or no.");

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
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Handle forgot password confirmation
        if (awaitingForgotPassword) {
            if (spokenWord === "yes") {
                window.location.href = "rememberpassword.html";
            } else if (spokenWord === "no") {
                speakBack("You are at the User ID field. Say 'switch to password' to enter password, or 'done' when completed. please say letter by letter.");
                currentField = 'user-id';
            } else {
                speakBack("Please say yes or no.");
                return;
            }
            awaitingForgotPassword = false;
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

        // Handle remember me confirmation
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "yes") {
                document.getElementById("remember-me").checked = true;
                speakBack("Remember Me option is now selected. Are you ready to log in? Say yes or no.");
        
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "no") {
                document.getElementById("remember-me").checked = false;
                speakBack("Remember Me option is disabled. Are you ready to log in? Say yes or no.");
        
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else {
                speakBack("Please say yes or no.");
                return;
            }
        }
        
        // Handle login confirmation
        if (awaitingLoginConfirmation) {
            if (spokenWord === "yes") {
                document.querySelector(".login-btn").click();
                awaitingLoginConfirmation = true;
            } else if (spokenWord === "no") {
                speakBack("Okay, let me know if you need further assistance.");
                awaitingLoginConfirmation = false;
            } else {
                speakBack("Please say yes or no.");
            }
            return;
        }
        
        // Switch between fields based on spoken words
        if (spokenWord.includes("change to password") || spokenWord.includes("password") || spokenWord.includes("pin")) {
            currentField = 'pin';
            speakBack("Switched to password field.");
            return;
        } else if (spokenWord.includes("change to username") || spokenWord.includes("user name") || spokenWord.includes("username") || spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("Switched to username field.");
            return;
        }

        // Handle character deletion
        if (spokenWord.includes("back") || spokenWord.includes("delete") || spokenWord.includes("remove") || spokenWord.includes("erase")) {
            deleteLastCharacter();
            return;
        } else if (spokenWord === "done") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
            speakBack(`User ID: ${userId}. Password: ${password}. Would you like me to remember you? Say yes or no.`);
            awaitingRememberMeConfirmation = true;
            return;
        }

        // Map common letters, numbers, and symbols
        const spokenToCharMap = {
            "hey": "A", "ay": "A", "a": "A", "bee": "B", "b": "B", "be": "B", "see": "C", "sea": "C", "c": "C", 
            "dee": "D", "d": "D", "ee": "E", "e": "E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M", "im": "M", "an": "N", "anne": "N", "and": "N", "en": "N", "n": "N", 
            "oh": "O", "o": "O", "pee": "P", "p": "P", "queue": "Q", "q": "Q", "kill": "Q", 
            "are": "R", "r": "R", "ess": "S", "s": "S", "tee": "T", "tea": "T", "t": "T", 
            "you": "U", "u": "U", "we": "V", "vee": "V", "v": "V", 
            "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z", "the": "Z",
        
            // Numbers with Chinese translations
            "zero": "0", "一": "1", "one": "1", "二": "2", "two": "2", "三": "3", "tree": "3", "three": "3", 
            "四": "4", "for": "4", "four": "4", "五": "5", "five": "5", "六": "6", "six": "6", 
            "七": "7", "seven": "7", "八": "8", "eight": "8", "九": "9", "nine": "9", 
        
            // Special characters with Chinese translations
            "dollar": "$", "dollar sign": "$", "美元": "$", "hash": "#", "hashtag": "#", "hash tag": "#", "井号": "#", 
            "exclamation": "!", "exclamation mark": "!", "感叹号": "!", "at": "@", "艾特": "@", "percent": "%", "per cent": "%", "百分号": "%", 
            "caret": "^", "carrot": "^", "插入符号": "^", "ampersand": "&", "和号": "&", "plus": "+", "加号": "+", 
            "equal": "=", "equals": "=", "等号": "=", "left bracket": "[", "right bracket": "]", 
            "left parenthesis": "(", "right parenthesis": ")", "左括号": "(", "右括号": ")", 
            "left curly bracket": "{", "right curly bracket": "}", "左大括号": "{", "右大括号": "}", 
            "colon": ":", "冒号": ":", "semicolon": ";", "分号": ";", 
            "quote": "\"", "double quote": "\"", "双引号": "\"", "single quote": "'", "单引号": "'", 
            "comma": ",", "逗号": ",", "period": ".", "句号": ".", 
            "slash": "/", "斜杠": "/", "backslash": "\\", "反斜杠": "\\", 
            "pipe": "|", "竖线": "|", "less than": "<", "小于号": "<", 
            "greater than": ">", "大于号": ">", "question mark": "?", "问号": "?", 
            "tilde": "~", "波浪号": "~", "grave": "`", "重音符": "`"
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
            speakBack(`Added ${charName}`);
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

    function speakBack(message) {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
    }
}
