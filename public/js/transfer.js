window.addEventListener("DOMContentLoaded", () => {
    const accountSelect = document.getElementById("transfer-from");
    const mobileRadio = document.querySelector("input[name='transfer-to'][value='mobile']");
    const nricRadio = document.querySelector("input[name='transfer-to'][value='nric']");
    const mobileInput = document.getElementById("mobile");
    const nricInput = document.getElementById("nric");
    const enterButton = document.getElementById("enterBtn");
    const amountInput = document.getElementById("amount");
    const descriptionInput = document.getElementById("description"); // Add a description input element

    let accountOptions = Array.from(accountSelect.options).slice(1);
    let currentStep = "selectAccount";
    let currentField = null;

    const accountList = accountOptions.map((option, index) => `Option ${index + 1}: ${option.text}`).join(", ");
    speakBack(`You are now on the Transfer and Payments page. Please choose an account. ${accountList}. Say the option number you would like to select.`, "en-US");

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    function startRecognitionWithTimer() {
        recognition.start();
        setTimeout(() => {
            recognition.stop();
        }, 3000);
    }

    startRecognitionWithTimer();

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim().toLowerCase().replace(/[.,!?]$/g, '');
        console.log("Recognized:", spokenWord);

        if (currentStep === "selectAccount") {
            const selectedIndex = parseInt(spokenWord) - 1;
            if (selectedIndex >= 0 && selectedIndex < accountOptions.length) {
                selectAccountByOption(selectedIndex);
                speakBack(`You chose ${accountOptions[selectedIndex].text}. Do you want to transfer by mobile number or NRIC? Please say mobile number or NRIC`, "en-US");
                currentStep = "selectMethod";
            } else {
                speakBack("Unrecognized account choice. Please say the option number you would like to select.", "en-US");
            }
        } else if (currentStep === "selectMethod") {
            if (spokenWord === "mobile" || spokenWord === "mobile number") {
                toggleInput('mobile');
                currentField = "mobile";
                speakBack("You chose mobile number. Please enter the mobile number digit by digit.", "en-US");
                currentStep = "enterDetails";
            } else if ( spokenWord=== "nric") {
                toggleInput('nspokenWordric');
                currentField = "nric";
                speakBack("You chose NRIC. Please enter the NRIC starting with a letter, followed by digits, and ending with a letter.", "en-US");
                currentStep = "enterDetails";
            } else {
                speakBack("Unrecognized transfer method. Please say 'mobile' or 'NRIC'.", "en-US");
            }
        } else if (currentStep === "enterDetails") {
            if (spokenWord === "done") {
                if (currentField === "mobile" && mobileInput.value.length !== 8) {
                    speakBack("Mobile number must be exactly 8 digits. Please complete the number.", "en-US");
                } else if (currentField === "nric" && (nricInput.value.length !== 9 || !/^[A-Za-z]\d{7}[A-Za-z]$/.test(nricInput.value))) {
                    speakBack("NRIC must start with a letter, contain seven digits in between, and end with a letter. Please complete the NRIC.", "en-US");
                } else {
                    enterButton.click();
                    speakBack("Please say the amount you want to transfer.", "en-US");
                    currentStep = "enterAmount";
                }
            } else {
                processUserInput(spokenWord);
            }
        }
        
         else if (currentStep === "enterAmount") {
            const amount = parseFloat(spokenWord.replace(/[^\d.]/g, ''));
            if (!isNaN(amount) && amount >= 0) {
                amountInput.value = amount.toFixed(2);
                speakBack(`You entered ${amount.toFixed(2)} dollars.`, "en-US");
                currentStep = "addDescription";
                speakBack("Would you like to add anything to the description?", "en-US");
            } else {
                speakBack("Please enter a valid amount in dollars and cents.", "en-US");
            }

        } else if (currentStep === "addDescription") {
            if (spokenWord === "no") {
                descriptionInput.value = ""; // Leave description blank
                speakBack("Description left blank. Your transfer is ready.", "en-US");
                // Move to next step or confirmation here if needed
            } else if (spokenWord === "yes") {
                speakBack("Please dictate your description and say 'done' when finished.", "en-US");
                currentStep = "recordDescription";
            } else if (currentStep === "recordDescription" && spokenWord === "done") {
                speakBack(`Description recorded: ${descriptionInput.value}. Is this correct? Say yes or no.`, "en-US");
                currentStep = "confirmDescription";
            } else if (currentStep === "confirmDescription") {
                if (spokenWord === "yes") {
                    speakBack("Description confirmed. Your transfer is ready.", "en-US");
                    // Move to the final step here
                } else if (spokenWord === "no") {
                    descriptionInput.value = ""; // Clear previous input
                    speakBack("Please dictate your description again and say 'done' when finished.", "en-US");
                    currentStep = "recordDescription";
                }
            } else {
                descriptionInput.value += " " + spokenWord; // Append spoken words to description
            }
        }
        
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        speakBack(`Error: ${event.error}`, "en-US");
    };

    recognition.onend = () => {
        startRecognitionWithTimer();
    };

    function toggleInput(selected) {
        const transferInputGroup = document.querySelector('.transfer-input-group');
        transferInputGroup.style.display = 'flex';
        if (selected === 'mobile') {
            mobileInput.style.display = 'block';
            nricInput.style.display = 'none';
            enterButton.style.display = 'block';
        } else if (selected === 'nric') {
            nricInput.style.display = 'block';
            mobileInput.style.display = 'none';
            enterButton.style.display = 'block';
        } else {
            mobileInput.style.display = 'none';
            nricInput.style.display = 'none';
            enterButton.style.display = 'none';
        }
    }

    function speakBack(message, lang = "en-US") {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang;
        window.speechSynthesis.speak(speech);
    }

    function selectAccountByOption(index) {
        accountSelect.selectedIndex = index + 1;
    }

    function processUserInput(spokenWord) {
        const inputField = document.getElementById(currentField);
        let currentValue = inputField.value;

        const spokenToCharMap = {
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
            "two": "2", "2": "2","true": "2",
            "three": "3", "3": "3",
            "four": "4", "for": "4", "4": "4",
            "five": "5", "5": "5",
            "six": "6", "6": "6",
            "seven": "7", "7": "7",
            "eight": "8", "8": "8",
            "nine": "9", "9": "9"
        };

        const character = spokenToCharMap[spokenWord];
        console.log("Mapped character:", character);

        if (!character) {
            speakBack("Unrecognized input. Please try again.");
            return;
        }

        if (currentField === "nric") {
            if (currentValue.length === 0) {
                if (/[A-Za-z]/.test(character)) {
                    inputField.value += character;
                    speakBack(`Added ${character}`);
                } else {
                    speakBack("NRIC must start with a letter.");
                }
            }
            else if (currentValue.length > 0 && currentValue.length < 8) {
                if (/\d/.test(character)) {
                    inputField.value += character;
                    speakBack(`Added ${character}`);
                } else {
                    speakBack("Please enter a digit for NRIC.");
                }
            }
            else if (currentValue.length === 8) {
                if (/[A-Za-z]/.test(character)) {
                    inputField.value += character;
                    speakBack(`Added ${character}`);
                } else {
                    speakBack("NRIC must end with a letter.");
                }
            }
            else {
                speakBack("NRIC must be exactly 9 characters long, starting and ending with letters and containing seven digits in between.");
            }
            
            
        } else if (currentField === "mobile") {
            if (currentField === "mobile") {
                // Ensure only digits are added to the mobile field, starts with 8 or 9, and limited to 8 digits
                if (currentValue.length === 0) {
                    // Check if the first character is 8 or 9
                    if (/[89]/.test(character)) {
                        inputField.value += character;
                        speakBack(`Added ${character}`);
                    } else {
                        speakBack("Mobile number must start with 8 or 9.");
                    }
                } else if (currentValue.length < 8) {
                    // Check if the next characters are digits
                    if (/\d/.test(character)) {
                        inputField.value += character;
                        speakBack(`Added ${character}`);
                    } else {
                        speakBack("Mobile numbers can only contain digits.");
                    }
                } else {
                    speakBack("Mobile number must be 8 digits long.");
                }
            }
            else if (currentField === "nric") {
                // Existing NRIC handling logic remains the same
                if (currentValue.length === 0 || currentValue.length === 8) {
                    if (/[A-Za-z]/.test(character)) {
                        inputField.value += character;
                        speakBack(`Added ${character}`);
                    } else {
                        speakBack("NRIC must start and end with a letter.");
                    }
                } else if (currentValue.length > 0 && currentValue.length < 8) {
                    if (/\d/.test(character)) {
                        inputField.value += character;
                        speakBack(`Added ${character}`);
                    } else {
                        speakBack("Please enter a number for NRIC.");
                    }
                } else {
                    speakBack("NRIC must be 9 characters long.");
                }
            }
            
        }
    }
});
