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
    speakBack("Would you like to enable voice feedback? Please say yes or no.");

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
        if (useVoiceFeedback) speakBack(`Error: ${event.error}`);
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
                speakBack("Voice feedback is now enabled. Have you forgotten your password? Say yes or no.");
            } else if (spokenWord === "no") {
                useVoiceFeedback = false;
                speakBack("Voice feedback is disabled. Have you forgotten your password? Say yes or no.");
            } else {
                speakBack("Please say yes or no to confirm.");
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
                speakBack("You are at the User ID field. Say 'switch to password' to enter password, or 'done' when completed.");
                currentField = 'user-id';
            } else {
                speakBack("Please say yes or no.");
                return;
            }
            awaitingForgotPassword = false;
            return;
        }
    
        // Handle remember me confirmation
        if (awaitingRememberMeConfirmation) {
            if (spokenWord === "yes") {
                document.getElementById("remember-me").checked = true;
                speakBack("Remember Me option is now selected. Are you ready to log in? Say yes or no.");
        
                // Start listening for login confirmation
                awaitingLoginConfirmation = true;
                awaitingRememberMeConfirmation = false;
                return;
            } else if (spokenWord === "no") {
                document.getElementById("remember-me").checked = false;
                speakBack("Remember Me option is disabled. Are you ready to log in? Say yes or no.");
        
                // Start listening for login confirmation
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
            speakBack(`User ID: ${userId}. Password: ${password}. Would you like me to remember you? Say yes or no.`);
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
            if (useVoiceFeedback) speakBack(`Error: unrecognized input "${spokenWord}"`);
        }
    }
    

    function processSpokenCharacter(character, charName) {
        const inputField = document.getElementById(currentField);
        if (inputField) {
            inputField.value += character;
            if (useVoiceFeedback) speakBack(`Added ${charName}`);
        } else {
            if (useVoiceFeedback) speakBack("Error: Field not found.");
        }
    }

    function switchToPinField() {
        currentField = currentField === 'user-id' ? 'pin' : 'user-id';
        console.log("Switched to field:", currentField);
        if (useVoiceFeedback) speakBack(`Switched to ${currentField.replace("-", " ")} field`);
    }

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        if (inputField && inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            if (useVoiceFeedback) speakBack("Deleted last character");
        } else {
            if (useVoiceFeedback) speakBack("Field is empty, nothing to delete.");
        }
    }

    function speakBack(message) {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
    }
}
