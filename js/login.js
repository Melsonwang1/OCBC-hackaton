// Check if SpeechRecognition is supported in this browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;  // Disable continuous mode to handle pauses
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let currentField = 'user-id';
    let hasMicPermission = false;
    let lastRecognitionTime = 0;

    // Map spoken words to characters
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
        "back": "BACK"   // For deleting last character
    };

    // Start recognition initially
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
        const now = new Date().getTime();
        if (now - lastRecognitionTime > 1000) {  // 1-second pause
            processRecognitionResult(event);
        }
        lastRecognitionTime = now;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
            alert("Please allow microphone access.");
        }
    };

    recognition.onend = () => {
        // Automatically restart recognition after it stops
        if (hasMicPermission) {
            recognition.start();
        }
    };

    function processRecognitionResult(event) {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        if (spokenWord.includes("capital letter")) {
            let character = spokenWord.split(" ").pop().toUpperCase();
            processSpokenCharacter(character, true);
        } else if (spokenWord.includes("pin") || spokenWord.includes("done")) {
            switchToPinField();
        } else if (spokenWord.includes("back")) {
            deleteLastCharacter();
        } else {
            for (const word of spokenWord.split(" ")) {
                if (spokenToCharMap[word]) {
                    processSpokenCharacter(spokenToCharMap[word]);
                }
            }
        }
    }

    function processSpokenCharacter(character, isUpperCase = false) {
        const inputField = document.getElementById(currentField);
        if (currentField === "pin" && isUpperCase) {
            inputField.value += character;
        } else {
            inputField.value += character.toLowerCase();
        }
        // Narrate the character added
        speakBack(`Added ${character}`);
    }

    function switchToPinField() {
        currentField = currentField === 'user-id' ? 'pin' : 'user-id';
        console.log("Switched to field:", currentField);
        // Narrate field switching
        speakBack(`Switched to ${currentField.replace("-", " ")} field`);
    }

    function deleteLastCharacter() {
        const inputField = document.getElementById(currentField);
        const deletedChar = inputField.value.slice(-1);
        inputField.value = inputField.value.slice(0, -1);
        console.log("Deleted last character from field:", currentField);
        // Narrate character deletion
        speakBack(`Deleted ${deletedChar}`);
    }

    function speakBack(message) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(message);
        synth.speak(utterThis);
    }
}
