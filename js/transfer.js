window.addEventListener("DOMContentLoaded", () => {
    const accountSelect = document.getElementById("transfer-from");
    const mobileRadio = document.querySelector("input[name='transfer-to'][value='mobile']");
    const nricRadio = document.querySelector("input[name='transfer-to'][value='nric']");
    const mobileInput = document.getElementById("mobile");
    const nricInput = document.getElementById("nric");
    const enterButton = document.querySelector(".enter-btn");
    const amountInput = document.getElementById("amount");

    let accountOptions = Array.from(accountSelect.options).slice(1); // Exclude the placeholder option
    let currentStep = "selectAccount";
    let currentField = null; // Track if input is for "nric" or "mobile"
    let accountChoice = null;

    // Announce the available accounts dynamically
    const accountList = accountOptions.map((option, index) => `Option ${index + 1}: ${option.text}`).join(", ");
    speakBack(`You are now on the Transfer and Payments page. Please choose an account. ${accountList}. Say the option number you would like to select.`, "en-US");

    // Initialize SpeechRecognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Function to start speech recognition with a 3-second timer
    function startRecognitionWithTimer() {
        recognition.start();
        setTimeout(() => {
            recognition.stop(); // Automatically stop recognition after 3 seconds
        }, 3000); // 3-second timer
    }

    startRecognitionWithTimer(); // Start recognition when the page loads

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim().toLowerCase().replace(/[.,!?]$/g, '');
        console.log("Recognized:", spokenWord);

        if (currentStep === "selectAccount") {
            const selectedIndex = parseInt(spokenWord) - 1;
            if (selectedIndex >= 0 && selectedIndex < accountOptions.length) {
                selectAccountByOption(selectedIndex); // Call function to select the account
                speakBack(`You chose ${accountOptions[selectedIndex].text}. Do you want to transfer by mobile number or NRIC?`, "en-US");
                currentStep = "selectMethod"; // Move to transfer method selection
            } else {
                speakBack("Unrecognized account choice. Please say the option number you would like to select.", "en-US");
            }
        } else if (currentStep === "selectMethod") {
            if (spokenWord === "mobile" || spokenWord === "mobile number") {
                mobileRadio.checked = true;
                currentField = "mobile";
                mobileInput.style.display = "block";
                nricInput.style.display = "none";
                speakBack("You chose mobile number. Please enter the mobile number digit by digit.", "en-US");
                currentStep = "enterDetails";
            } else if (spokenWord === "nric") {
                nricRadio.checked = true;
                currentField = "nric";
                nricInput.style.display = "block";
                mobileInput.style.display = "none";
                speakBack("You chose NRIC. Please enter the NRIC starting with a letter, followed by digits, and ending with a letter.", "en-US");
                currentStep = "enterDetails";
            } else {
                speakBack("Unrecognized transfer method. Please say 'mobile' or 'NRIC'.", "en-US");
            }
        } else if (currentStep === "enterDetails") {
            if (spokenWord === "done") {
                enterButton.click(); // Trigger click on "Enter" button
                speakBack("Please say the amount you want to transfer.", "en-US");
                currentStep = "enterAmount"; // Move to the amount entry step
            } else {
                processUserInput(spokenWord);
            }
        } else if (currentStep === "enterAmount") {
            amountInput.value = spokenWord; // Set the spoken amount in the amount input
            speakBack(`You entered ${spokenWord} dollars.`, "en-US");
            // Additional logic for further steps can go here
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakBack(`Error: ${event.error}`, "en-US");
    };

    recognition.onend = () => {
        startRecognitionWithTimer(); // Restart recognition with a 3-second timer after it ends
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
        const inputField = document.getElementById(currentField); // Use the current field (mobile or nric)
        let currentValue = inputField.value;

        // Define a map for spoken words to characters
        const spokenToCharMap = {
            // Letters
            "a": "A", "hey": "A", "ay": "A",
            "b": "B", "bee": "B", "be": "B",
            "c": "C", "see": "C", "sea": "C",
            "d": "D", "dee": "D",
            "e": "E", "ee": "E",
            "f": "F", "eff": "F",
            "g": "G", "gee": "G",
            "h": "H", "aitch": "H",
            "i": "I", "eye": "I",
            "j": "J", "jay": "J",
            "k": "K", "kay": "K",
            "l": "L", "ell": "L",
            "m": "M", "em": "M", "im": "M",
            "n": "N", "en": "N", "anne": "N", "an": "N",
            "o": "O", "oh": "O",
            "p": "P", "pee": "P",
            "q": "Q", "queue": "Q",
            "r": "R", "are": "R",
            "s": "S", "ess": "S",
            "t": "T", "tee": "T",
            "u": "U", "you": "U",
            "v": "V", "vee": "V",
            "w": "W", "double you": "W",
            "x": "X", "ex": "X",
            "y": "Y", "why": "Y",
            "z": "Z", "zee": "Z",

            // Numbers
            "zero": "0", "0": "0",
            "one": "1", "1": "1",
            "two": "2", "2": "2",
            "three": "3", "3": "3",
            "four": "4", "for": "4", "4": "4",
            "five": "5", "5": "5",
            "six": "6", "6": "6",
            "seven": "7", "7": "7",
            "eight": "8", "8": "8",
            "nine": "9", "9": "9"
        };

        const character = spokenToCharMap[spokenWord];
        console.log("Mapped character:", character); // Log the character

        if (!character) {
            speakBack("Unrecognized input. Please try again.");
            return;
        }

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
