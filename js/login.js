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

        if (awaitingVoiceFeedbackResponse) {
            if (spokenWord === "yes") {
                useVoiceFeedback = true;
                speakBack("Voice feedback is now enabled.");
            } else if (spokenWord === "no") {
                useVoiceFeedback = false;
                speakBack("Voice feedback is disabled.");
            } else {
                speakBack("Please say yes or no to confirm.");
                return; // Wait for valid response before proceeding
            }
            awaitingVoiceFeedbackResponse = false;
            return;
        }

        // Switch field based on spoken words "change to password" or "change to username"
        if (spokenWord.includes("change to password") || spokenWord.includes("password")) {
            currentField = 'password';
            speakBack("Switched to password field.");
            return;
        } else if (spokenWord.includes("change to username") || spokenWord.includes("user name") || spokenWord.includes("username")|| spokenWord.includes("user id")) {
            currentField = 'user-id';
            speakBack("Switched to username field.");
            return;
        }

        // Other recognition logic
        if (spokenWord.includes("capital letter")) {
            let character = spokenWord.split(" ").pop().toUpperCase();
            processSpokenCharacter(character, true);
        } else if (spokenWord.includes("pin") || spokenWord.includes("done")) {
            switchToPinField();
        } else if (spokenWord.includes("back")) {
            deleteLastCharacter();
        } else {
            // Map specific phrases directly to special characters
            if (spokenWord === "left bracket") {
                processSpokenCharacter("[", "left bracket");
            } else if (spokenWord === "right bracket") {
                processSpokenCharacter("]", "right bracket");
            } else if (spokenWord === "left parenthesis") {
                processSpokenCharacter("(", "left parenthesis");
            } else if (spokenWord === "right parenthesis") {
                processSpokenCharacter(")", "right parenthesis");
            } else if (spokenWord === "underscore" || spokenWord === "under score") {
                processSpokenCharacter("_", "underscore");
            } else if (spokenWord === "dash") {
                processSpokenCharacter("-", "dash");
            } else if (spokenWord === "star" || spokenWord === "asterisk" || spokenWord === "estrus") {
                processSpokenCharacter("*", "star");
            } else {
                // Attempt to map common letters and numbers
                const spokenToCharMap = {
                    "hey": "A", "ay": "A", "a": "A", "bee": "B", "b": "B", "see": "C",
                    "sea": "C", "c": "C", "dee": "D", "d": "D", "ee": "E", "e": "E",
                    "eff": "F", "f": "F", "gee": "G", "g": "G", "aitch": "H", "h": "H",
                    "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K",
                    "ell": "L", "l": "L", "em": "M", "m": "M", "en": "N", "n": "N",
                    "oh": "O", "o": "O", "pee": "P", "p": "P", "queue": "Q", "q": "Q",
                    "are": "R", "r": "R", "ess": "S", "s": "S", "tee": "T", "tea": "T",
                    "t": "T", "you": "U", "u": "U", "vee": "V", "v": "V", "double you": "W",
                    "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z",
                    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
                    "six": "6", "seven": "7", "eight": "8", "nine": "9", "0": "0", "1": "1",
                    "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
                    "done": "DONE",  // For switching fields
                    "back": "BACK",  // For deleting last character
                    "dollar": "$", "dollar sign": "$", "hash": "#", "hashtag": "#", "hash tag": "#",
                    "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%", "caret": "^", "carrot": "^",
                    "ampersand": "&", "star": "*", "asterisk": "*", "estrus": "*", "left bracket": "[",
                    "right bracket": "]", "left parenthesis": "(", "right parenthesis": ")",
                    "dash": "-", "underscore": "_", "under score": "_", "plus": "+", "equal": "=", "equals": "=", "equal sign": "="
                };
                
                const character = spokenToCharMap[spokenWord];
                if (character) {
                    processSpokenCharacter(character, spokenWord);
                } else {
                    if (useVoiceFeedback) speakBack(`Error: unrecognized input "${spokenWord}"`);
                }
            }
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
            const deletedChar = inputField.value.slice(-1);
            inputField.value = inputField.value.slice(0, -1);
            if (useVoiceFeedback) speakBack(`Deleted ${deletedChar}`);
        } else {
            if (useVoiceFeedback) speakBack("Error: No character to delete");
        }
    }

    function speakBack(message) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(message);
        synth.speak(utterThis);
    }
}
