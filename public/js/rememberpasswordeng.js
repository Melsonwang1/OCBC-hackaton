window.addEventListener("DOMContentLoaded", () => {
    const accountSelect = document.getElementById("transfer-from");
    const mobileRadio = document.querySelector("input[name='transfer-to'][value='mobile']");
    const nricRadio = document.querySelector("input[name='transfer-to'][value='nric']");
    const inputBox = document.querySelector(".input-box");

    let accountOptions = Array.from(accountSelect.options).slice(1); // Exclude the placeholder option
    let currentStep = "selectAccount";
    let currentField = "nric"; // Track if input is for "nric" or "mobile"
    let accountChoice = null;

    // Announce the available accounts dynamically
    const accountList = accountOptions.map((option, index) => `Option ${index + 1}: ${option.text}`).join(", ");
    speakBack(`You are now on the Transfer and Payments page. Please choose an account. ${accountList} Say the option number you would like to select`, "en-US");

    // Initialize SpeechRecognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim().toLowerCase().replace(/[.,!?]$/g, '');
        console.log("Recognized:", spokenWord);

        if (currentStep === "selectAccount") {
            const selectedIndex = parseInt(spokenWord) - 1;
            if (selectedIndex >= 0 && selectedIndex < accountOptions.length) {
                selectAccountByOption(selectedIndex); // Call function to select the account
                speakBack(`You chose ${accountOptions[selectedIndex].text} Do you want to transfer by mobile number or NRIC`, "en-US");
                currentStep = "selectMethod"; // Move to transfer method selection
            } else {
                speakBack("Unrecognized account choice Please say the option number you would like to select", "en-US");
            }
        } else if (currentStep === "selectMethod") {
            if (spokenWord === "mobile" || spokenWord === "mobile number") {
                mobileRadio.checked = true;
                currentField = "mobile";
                speakBack("You chose mobile number Please enter the mobile number digit by digit", "en-US");
                currentStep = "enterDetails";
            } else if (spokenWord === "nric") {
                nricRadio.checked = true;
                currentField = "nric";
                speakBack("You chose NRIC Please enter the NRIC starting with a letter, followed by digits, and ending with a letter", "en-US");
                currentStep = "enterDetails";
            } else {
                speakBack("Unrecognized transfer method Please say 'mobile' or 'NRIC'", "en-US");
            }
        } else if (currentStep === "enterDetails") {
            processUserInput(spokenWord);
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakBack(`Error: ${event.error}`, "en-US");
    };

    recognition.onend = () => {
        recognition.start(); // Restart recognition after it ends
    };

    // Function to read text back to user
    function speakBack(message, lang = "en-US") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }

    // Function to select an account option based on index
    function selectAccountByOption(index) {
        accountSelect.selectedIndex = index + 1; // Set the selected option
    }

    // Function to process characters for NRIC and mobile entry
    function processUserInput(spokenWord) {
        const inputField = document.getElementById(currentField);
        let currentValue = inputField.value;

        // Define a map for spoken words to characters
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
            "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9"
        };

        const character = spokenToCharMap[spokenWord];

        // For NRIC format: letter at start and end, numbers in the middle
        if (currentField === "nric") {
            if (currentValue.length === 0 || currentValue.length === 8) {
                // Only letters allowed at start and end of NRIC
                if (/[A-Za-z]/.test(character)) {
                    inputField.value += character;
                    speakBack(`Added ${character}`);
                } else {
                    speakBack("NRIC must start and end with a letter.");
                }
            } else if (currentValue.length > 0 && currentValue.length < 8) {
                // Only numbers allowed in the middle of NRIC
                if (/\d/.test(character)) {
                    inputField.value += character;
                    speakBack(`Added ${character}`);
                } else {
                    speakBack("Only numbers are allowed in the middle of NRIC.");
                }
            }
        } else if (currentField === "mobile") {
            // Only allow numbers for mobile input
            if (/\d/.test(character)) {
                inputField.value += character;
                speakBack(`Added ${character}`);
            } else {
                speakBack("Mobile numbers should only contain digits.");
            }
        }
    }
});
