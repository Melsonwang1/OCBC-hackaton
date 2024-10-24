// Check if the browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Set recognition properties
recognition.continuous = false;
recognition.lang = 'en-US';  // Use the preferred language
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let currentField = 'user-id';  // Track which field is currently being populated
let isListening = false;  // To avoid multiple triggers

// A map to associate spoken words with letters/numbers
const spokenToCharMap = {
    "hey": "A",
    "ay": "A",
    "a": "A",
    "bee": "B",
    "b": "B",
    "see": "C",
    "sea": "C",
    "c": "C",
    "dee": "D",
    "d": "D",
    "ee": "E",
    "e": "E",
    "eff": "F",
    "f": "F",
    "gee": "G",
    "g": "G",
    "aitch": "H",
    "h": "H",
    "eye": "I",
    "i": "I",
    "jay": "J",
    "j": "J",
    "kay": "K",
    "k": "K",
    "ell": "L",
    "l": "L",
    "em": "M",
    "m": "M",
    "en": "N",
    "n": "N",
    "oh": "O",
    "o": "O",
    "pee": "P",
    "p": "P",
    "queue": "Q",
    "q": "Q",
    "are": "R",
    "r": "R",
    "ess": "S",
    "s": "S",
    "tee": "T",
    "t": "T",
    "you": "U",
    "u": "U",
    "vee": "V",
    "v": "V",
    "double you": "W",
    "w": "W",
    "ex": "X",
    "x": "X",
    "why": "Y",
    "y": "Y",
    "zee": "Z",
    "z": "Z",
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
};

// Start listening when the page loads
window.onload = () => {
    startVoiceControl();
};

// Function to start voice recognition
function startVoiceControl() {
    if (!isListening) {
        console.log("Starting speech recognition...");
        recognition.start();
        isListening = true;
    }

    recognition.onresult = (event) => {
        let spokenWord = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Recognized word (raw):", spokenWord);

        // Remove any punctuation or trailing characters (like periods, commas)
        spokenWord = spokenWord.replace(/[^\w\s]/gi, '');
        console.log("Cleaned recognized word:", spokenWord);

        // Check if the cleaned spoken word corresponds to a letter or number
        if (spokenToCharMap[spokenWord]) {
            const character = spokenToCharMap[spokenWord];
            console.log("Mapped character:", character);
            processSpokenCharacter(character);
        } else {
            console.log("Unrecognized word. Please try again.");
        }
        isListening = false;  // Reset the listening flag
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        console.log("Speech recognition ended. Restarting...");
        // Restart recognition after processing the last input
        if (!isListening) {
            recognition.start();
            isListening = true;
        }
    };
}

// Function to process the mapped character
function processSpokenCharacter(character) {
    // Insert the mapped character into the current input field
    const inputField = document.getElementById(currentField);
    inputField.value += character;

    // Speak back the character for confirmation
    speakBack(character);
}

// Function to repeat the spoken character
function speakBack(character) {
    console.log("Speaking back:", character);
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(character);
    synth.speak(utterThis);
}
