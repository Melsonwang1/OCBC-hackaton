let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

function resetFields() {
    document.getElementById("user-id").value = "";
    document.getElementById("pin").value = "";
    currentField = 'user-id';

    // Reset voice recognition state
    awaitingForgotPassword = false; 
    awaitingRememberMeConfirmation = false; 
    awaitingLoginConfirmation = false;

    speakBack("Login failed. Please enter your User ID again, letter by letter.");
}


document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById("login-button").addEventListener("click", async function(e) {
        e.preventDefault();
        const message = document.getElementById("message");
        let nric = document.getElementById("user-id").value;
        let password = document.getElementById("pin").value;
        const rememberMe = document.getElementById("remember-me").checked;

        if (!nric || !password) {
            message.innerHTML = "Please input all fields!";
            return;
        } else {
            await login(nric, password, rememberMe);
        }
    });

    async function login(nric, password, rememberMe) {
        try {
            const response = await fetch('http://localhost:3000/user/login', { // vaish changed this for a while. from /user/login to http://localhost:3000/user/login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nric, password, rememberMe }),
            });
    
            if (response.status === 404) {
                resetFields(); // Clears fields and prompts re-entry
                return;
            }
            if (response.status === 401) {
                
                resetFields(); // Clears fields and prompts re-entry
                return;
            }
            
            if (!response.ok) {
                throw new Error('Error logging in');
            }
    
            const data = await response.json();
            const token = data.token;
    
            // Store token based on rememberMe preference
            if (rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }
    
            
            window.location.href = "accountseng.html";
        } catch (error) {
            
            resetFields();
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
    speakBack("Welcome to OCBC Bank. You are currently on the login page. Would you like to login? Say yes or no.");

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
                speakBack("You are at the User ID field. Say 'switch to password' to enter password, or 'done' when completed. Please say letter by letter.");
                currentField = 'user-id';
            } else if (spokenWord === "no") {
                window.location.href = "startpageeng.html";
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
        }
    
        // Handle the "done" keyword
        if (spokenWord === "done") {
            const userId = document.getElementById("user-id").value;
            const password = document.getElementById("pin").value;
    
            // Validation check: If fields are empty, reset and prompt again
            if (!userId || !password) {
                resetFields();
                speakBack("Fields are incomplete. Please start again by entering your User ID, letter by letter.");
                return;
            }
    
            // If both fields are filled, proceed to Remember Me confirmation
            speakBack(`User ID: ${userId}. Password: ${password}. Would you like me to remember you? Say yes or no.`);
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
            "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "=","一锅":"=","equals":"=",
        
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
            // Check if the current field is 'user-id' and restrict input to alphanumeric characters
            if (currentField === 'user-id') {
                if (/^[a-zA-Z0-9]$/.test(character)) {  // Allow only letters and numbers
                    inputField.value += character;
                    speakBack(`Added ${charName}`);
                } else {
                    speakBack("Error: User ID can only contain letters and numbers.");
                }
            } else if (currentField === 'pin') {
                // Allow any character for PIN
                inputField.value += character;
                speakBack(`Added ${charName}`);
            }
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

function toggleMode() {
    const body = document.body;
    const button = document.getElementById('mode-toggle');

    // Toggle the 'dark-mode' class
    body.classList.toggle('dark-mode');
    
    // Update the button text
    if (body.classList.contains('dark-mode')) {
        button.textContent = 'Switch to Light Mode';
        localStorage.setItem('mode', 'dark');
    } else {
        button.textContent = 'Switch to Dark Mode';
        localStorage.setItem('mode', 'light');
    }
}

// Check the saved mode preference on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('mode') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('mode-toggle').textContent = 'Switch to Light Mode';
        document.getElementById('account-selection').classList.add('dark-mode');  // Apply dark mode to account selection
    }
});