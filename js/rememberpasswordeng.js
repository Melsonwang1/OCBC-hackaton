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
    let awaitingSubmitConfirmation = false; // Tracks submit confirmation
    let inputTimeout; // Timer for 3-second timeout
    let isRecognitionRunning = false; // Tracks if recognition is running

    // Start with a welcome message
    speakBack("Welcome to the password recovery page. Please enter your User ID letter by letter. Say 'done' when completed.");

    // Start voice recognition
    startVoiceRecognition();

    function startVoiceRecognition() {
        if (!isRecognitionRunning) {
            recognition.start();
            isRecognitionRunning = true;
            console.log("Starting voice recognition...");
        }
    }

    recognition.onstart = () => {
        hasMicPermission = true;
        console.log("Microphone permission granted, listening...");
    };

    recognition.onresult = (event) => {
        clearTimeout(inputTimeout); // Clear the timer as we received a result
        processRecognitionResult(event);
        startInputTimeout(); // Restart the timeout for the next word
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakBack(`Error: ${event.error}`);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        if (hasMicPermission) {
            startVoiceRecognition(); // Restart if stopped
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // If "done" is spoken, read back User ID and ask if ready to submit
        if (spokenWord === "done") {
            const userId = document.getElementById("user-id").value;
            speakBack(`User ID: ${userId}. Are you ready to submit? Say yes or no.`);
            awaitingSubmitConfirmation = true;
            return;
        }

        // Handle submit confirmation
        if (awaitingSubmitConfirmation) {
            if (spokenWord === "yes") {
                document.querySelector(".submit-btn").click();
                awaitingSubmitConfirmation = false;
                speakBack("Form submitted.");
            } else if (spokenWord === "no") {
                speakBack("Submission canceled. Let me know if you need further assistance.");
                awaitingSubmitConfirmation = false;
            } else {
                speakBack("Please say yes or no.");
            }
            return;
        }

        // Process user input for user ID
        processUserInput(spokenWord);
    }

    // Function to process characters for user ID entry
    function processUserInput(spokenWord) {
        const inputField = document.getElementById(currentField);

        // Map letters, numbers, and special characters
        const spokenToCharMap = {
            "hey": "A", "ay": "A", "a": "A", "bee": "B", "b": "B", "be": "B", "see": "C", "sea": "C", "c": "C", 
            "dee": "D", "d": "D", "ee": "E", "e": "E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
            "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
            "ell": "L", "l": "L", "em": "M", "m": "M", "im": "M", "an": "N", "anne": "N", "and": "N", "en": "N", "n": "N", 
            "oh": "O", "o": "O", "pee": "P", "p": "P", "queue": "Q", "q": "Q", "kill": "Q", 
            "are": "R", "r": "R", "ess": "S", "s": "S", "tee": "T", "tea": "T", "t": "T", 
            "you": "U", "u": "U", "we": "V", "vee": "V", "v": "V", 
            "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z", "the": "Z",
            "zero": "0", "one": "1", "two": "2", "tree": "3", "three": "3", "for": "4", "four": "4", 
            "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", 
            "dollar": "$", "dollar sign": "$", "hash": "#", "hashtag": "#", "hash tag": "#", 
            "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%", "per cent": "%", 
            "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "=", "equals": "=",
            "left bracket": "[", "right bracket": "]", "left parenthesis": "(", "right parenthesis": ")",
            "left curly bracket": "{", "right curly bracket": "}", "colon": ":", "semicolon": ";",
            "quote": "\"", "double quote": "\"", "single quote": "'", "comma": ",", "period": ".",
            "slash": "/", "backslash": "\\", "pipe": "|", "less than": "<", "greater than": ">",
            "question mark": "?", "tilde": "~", "grave": "`"
        };

        const character = spokenToCharMap[spokenWord];
        if (character) {
            inputField.value += character;
            speakBack(`Added ${spokenWord}`);
        } else {
            speakBack(`Error: unrecognized input "${spokenWord}"`);
        }
    }

    function speakBack(message) {
        const speech = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(speech);
    }

    function startInputTimeout() {
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            console.log("No input detected within 3 seconds, restarting recognition...");
            if (isRecognitionRunning) {
                recognition.stop(); // Stop the recognition to handle the timeout
            }
        }, 3000); // 3 seconds
    }

    // Initialize the timeout on first start
    startInputTimeout();
}
