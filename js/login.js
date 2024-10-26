// Check if the browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
} else {
    const recognition = new SpeechRecognition();

    // Set recognition properties
    recognition.continuous = false;  // Disable continuous mode to prevent repetition
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';  // Track which field is currently being populated
    let hasMicPermission = false;  // Track if permissions were granted

    // Map spoken words to letters/numbers and actions
    const spokenToCharMap = {
        "hey": "A", "ay": "A", "a": "A", "bee": "B", "b": "B","be":"", "see": "C",
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
        "done": "DONE",   // For switching fields
        "back": "BACK"    // For deleting last character
    };

    // Start listening when the page loads
    window.onload = () => {
        requestMicPermissionOnce();
    };

    // Function to request microphone permission once
    function requestMicPermissionOnce() {
        if (!hasMicPermission) {
            recognition.start();

            recognition.onstart = () => {
                hasMicPermission = true;
                console.log("Microphone permission granted, listening...");
            };

            // Handle recognition result
            recognition.onresult = (event) => {
                processRecognitionResult(event);
            };

            // Error handling
            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === "not-allowed") {
                    alert("Please allow microphone access.");
                }
            };

            // Restart recognition after each input
            recognition.onend = () => {
                if (hasMicPermission) {
                    recognition.start();
                }
            };
        }
    }

    // Function to process recognition result
    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);

        // Remove punctuation
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Check if the cleaned spoken word corresponds to a letter, number, "done," or "back"
        if (spokenToCharMap[spokenWord]) {
            const character = spokenToCharMap[spokenWord];
            if (character === "DONE") {
                switchToPinField();
            } else if (character === "BACK") {
                deleteLastCharacter();
            } else {
                processSpokenCharacter(character);
            }
        } else {
            console.log("Unrecognized word. Please try again.");
        }
    }

    // Function to insert the recognized character into the current field
    function processSpokenCharacter(character) {
        const inputField = document.getElementById(currentField);
        inputField.value += character;
        speakBack(character);
    }

    // Function to switch to the PIN input field
    function switchToPinField() {
        currentField = currentField === 'user-id' ? 'pin' : 'user-id';  // Toggle between User ID and PIN
        console.log("Switched to field:", currentField);
    }

    // Function to delete the last character from the current input field
    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        inputField.value = inputField.value.slice(0, -1);  // Remove the last character
        console.log("Deleted last character from field:", currentField);
    }

    // Function to speak back the recognized character for user confirmation
    function speakBack(character) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(character);
        synth.speak(utterThis);
    }
}
