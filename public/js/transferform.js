
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


// Function to check if the user is currently focused on an input or textarea
function isTyping() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable;
}

// General page navigation shortcuts
document.addEventListener('keydown', function(event) {
    // Ensure we're not in an input field or similar element
    if (isTyping()) return;

    // General page navigation shortcuts
    if (event.key === '1') {
        window.location.href = "../html/accountseng.html";
    } else if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    } else if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    } else if (event.key === 't') {
        window.location.href = "../html/accountschi.html";
    } else if (event.key === 'l') {
        localStorage.removeItem("token"); // Properly remove the token
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    }
});

/* Still working on it*/
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        const focusableElements = [
            document.getElementById('transfer-from'),
            document.querySelector('.radio-button[value="mobile"]'),
            document.querySelector('.radio-button[value="nric"]'),
            document.getElementById('mobile'),
            document.getElementById('nric'),
            document.getElementById('enterBtn'),
            document.getElementById('amount'),
            document.getElementById('description'),
            document.querySelector('.transfer-btn')
        ];

        const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

        let nextIndex;
        if (event.shiftKey) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else {
            nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }

        focusableElements[nextIndex].focus();
    }
});

// Get user token
document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // The current user
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // Get token from local storage

    // Check if token is null before proceeding
    if (!token) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        window.location.href = "logineng.html"; // Redirect to login page
        return; // Stop execution
    }

    // Get the user data
    async function getUserData() {
        console.log('Token:', token);  // Log the token to ensure it's valid
        try {
            const response = await fetch(`/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);  // Log error details
                throw new Error(errorData.message);
            }

            const userData = await response.json();
            console.log('User Data:', userData);  // Log the user data

            // Populate user object
            user = userData;
            // Display the user's name
            document.getElementById("user-name").innerText = user.name.toUpperCase();
        } catch (error) {
            console.log('Error in getUserData:', error.message);
            if (error.message === 'Forbidden: Invalid or expired token') {
                alert("Times out. Please login again!");
                localStorage.setItem("token", null); // Clear token from local storage
                window.location.href = "logineng.html"; // Redirect to login
            } else if (error.message === 'Unauthorized') {
                alert("Please login first!");
                window.location.href = "logineng.html"; // Redirect to login
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    // Log Out Button functionality
    document.getElementById("logout-btn").addEventListener("click", function() {
        localStorage.removeItem("token"); // Properly remove the token
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    });

    // Wait for user data to load before fetching bank accounts
    await getUserData();
    await fetchAccDetails(user.user_id)
    announceAccountsAndListen(user.user_id);

});

    async function fetchAccDetails(userId){
        try {
            const response = await fetch(`/accounts/accountnameandnumber/${userId}`); 
            if (!response.ok) {
                throw new Error(`Error status: ${response.status}`); // Throw an error if response is not ok
            }
            const accountsData = await response.json();

            // Check if accountsData.account exists and is an array
            if (!accountsData.account || !Array.isArray(accountsData.account)) {
                console.error('Expected an array but received:', accountsData);
                return;
            }

            const transferFromDropdown = document.getElementById('transfer-from');
            
            // Populate the dropdown with account data
            accountsData.account.forEach(account => {
                const option = document.createElement('option');
                option.value = account.account_id; // Set account ID as value
                option.textContent = `${account.account_name} (${account.account_number})`; // Display name and number
                transferFromDropdown.appendChild(option);
            });

            // Display and show balance when an account is selected (zb)
            transferFromDropdown.addEventListener('change', async (event) => {
                const selectedAccountId = event.target.value;
                if (selectedAccountId) {
                    document.getElementById('balance').style.display = 'block'; // Show balance display
                    await fetchAndDisplayBalance(selectedAccountId); // Fetch and show balance
                } else {
                    document.getElementById('balance').style.display = 'none'; // Hide balance if no account is selected
                }
            });
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            alert('No bank account records data found'); // Alert the user if no bank accounts are found
        }
    }

    // Function to fetch and display the balance (zb)
    async function fetchAndDisplayBalance(accountId) {       
        try {
            const accountResponse = await fetch(`/accounts/account/${accountId}`);
            if (!accountResponse.ok) {
                const errorData = await accountResponse.json();
                throw new Error(errorData.message || "Failed to fetch account data");
            }
            const accountData = await accountResponse.json();
            const balanceHave = accountData.account.balance_have.toFixed(2);
            document.getElementById('balance-amount').innerText = balanceHave; // Display balance
        } catch (error) {
            console.error('Error fetching account balance:', error);
        }
    }

    // Fetch user data and display recipient name or error
    function fetchUserData() {
        const mobileInput = document.getElementById("mobile");
        const nricInput = document.getElementById("nric");
        let url = 'http://localhost:3000/user';
        if (mobileInput.style.display === 'block' && mobileInput.value) {
            url += `?phoneNumber=${encodeURIComponent(mobileInput.value)}`;
        } else if (nricInput.style.display === 'block' && nricInput.value) {
            url += `?nric=${encodeURIComponent(nricInput.value)}`;
        } else {
            // Hide error message and recipient name if nothing is entered
            document.getElementById("name").style.display = 'none';
            document.getElementById("error").style.display = 'none';
            alert("Please enter a valid phone number or NRIC.");
            return;
        }
        // Make an API call to fetch the user data
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the full response to see its structure
                // If user data exists and has a name, show the recipient name
                if (data && data.name) {
                    document.getElementById("user-namee").textContent = data.name;
                    document.getElementById("name").style.display = 'block'; // Show recipient name
                    document.getElementById("error").style.display = 'none'; // Hide error message if successful
                } else {
                    // Show error if user is not found
                    document.getElementById("user-namee").textContent = "";
                    document.getElementById("name").style.display = 'none'; // Hide recipient name if no user
                    document.getElementById("error").textContent = "User not found."; // Display error message
                    document.getElementById("error").style.display = 'block'; // Show error
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                document.getElementById("user-namee").textContent = "";
                document.getElementById("name").style.display = 'none'; // Hide recipient name if error occurs
                document.getElementById("error").textContent = "Error fetching user data."; // Display error message
                document.getElementById("error").style.display = 'block'; // Show error
            });
    }

    // Add event listener to the form for transaction submission
const form = document.querySelector('.transfer-container form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Hide the Lottie animation at the start of the submission process
    document.getElementById("update-msg").style.display = "none";

    // Get form data
    const transferFrom = parseInt(document.getElementById('transfer-from').value, 10);
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value || '';
    
    // Check the "Set as Pending" checkbox status
    const statusCheckbox = document.getElementById('status-checkbox');
    const status = statusCheckbox.checked ? 'pending' : 'completed';

    // Determine transfer method (mobile or NRIC)
    let phoneNumber = null;
    let nric = null;
    const transferMethodElement = document.querySelector('input[name="transfer-to"]:checked');
    
    if (transferMethodElement) {
        const transferMethod = transferMethodElement.value;
        if (transferMethod === 'mobile') {
            phoneNumber = document.getElementById('mobile').value;
        } else if (transferMethod === 'nric') {
            nric = document.getElementById('nric').value;
        }
    } else {
        alert("Please select a transfer method.");
        return;
    }

    // Validate form fields
    if (!transferFrom || isNaN(amount) || amount <= 0) {
        alert("Please select an account, enter a valid amount, and choose a transfer method.");
        return;
    }

    console.log("Transaction data being sent:", {
        user_id: transferFrom,
        amount,
        description,
        phoneNumber,
        nric,
        status
    });

    try {
        const requestData = {
            user_id: transferFrom,
            amount: parseFloat(amount),
            description,
            phoneNumber,
            nric,
            status
        };

        const response = await fetch('/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // Ensure response is JSON and handle response accordingly
        const result = await response.json();
        
        if (response.ok) {
            //alert("Transaction completed successfully!");

            // Show the Lottie animation
            document.getElementById("update-msg").style.display = "block";

            // Hide the animation after 3 seconds (adjust the time as needed)
            setTimeout(function () {
                document.getElementById("update-msg").style.display = "none";
            }, 4000); // 3000ms = 3 seconds

            // Optional: Clear form fields
            form.reset();
            document.getElementById('balance').style.display = 'none'; // Hide balance after successful transaction
        } else {
            throw new Error(result.error || "Transaction failed");
        }
    } catch (error) {
        console.error("Error creating transaction:", error);
        alert("Transaction error: " + error.message);
    }
});


// Function to toggle input fields based on selected transfer method
function toggleInput(selected) {
    const mobileInput = document.getElementById('mobile');
    const nricInput = document.getElementById('nric');
    const enterBtn = document.getElementById('enterBtn');
    const transferInputGroup = document.querySelector('.transfer-input-group');

    transferInputGroup.style.display = 'flex';

    if (selected === 'mobile') {
        mobileInput.style.display = 'block';
        nricInput.style.display = 'none';
        enterBtn.style.display = 'block';
    } else if (selected === 'nric') {
        nricInput.style.display = 'block';
        mobileInput.style.display = 'none';
        enterBtn.style.display = 'block';
    } else {
        mobileInput.style.display = 'none';
        nricInput.style.display = 'none';
        enterBtn.style.display = 'none';
    }
}

// Function for buttons nric and phone number
function selectOption(value) {
    // Get all buttons
    const buttons = document.querySelectorAll('.radio-button');
    
    // Remove selected class from all buttons
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    // Add selected class to the clicked button
    const selectedButton = Array.from(buttons).find(button => button.textContent === (value === 'mobile' ? 'Mobile Number' : 'NRIC'));
    selectedButton.classList.add('selected');

    // Call your existing toggleInput function
    toggleInput(value);
}

// Event listener for keydown event
document.addEventListener('keydown', function(event) {
    // Check if the left or right arrow key is pressed
    if (event.key === 'ArrowLeft') {
        // Go to the previous page (like undo)
        window.history.back();
    } else if (event.key === 'ArrowRight') {
        // Go to the next page (like redo)
        window.history.forward();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var shortcutList = document.getElementById("shortcut-list");
    var icon = document.getElementById("dropdown-icon");
    var keyboardNote = document.querySelector(".keyboard-note");

    // Show the list by default on page load
    shortcutList.style.display = "block";
    icon.classList.add("up");  // Initially show the downward arrow
    keyboardNote.style.maxHeight = "500px"; // Adjust to accommodate the expanded list
});

document.getElementById("keyboard-shortcut-header").addEventListener("click", function() {
    var shortcutList = document.getElementById("shortcut-list");
    var icon = document.getElementById("dropdown-icon");
    var keyboardNote = document.querySelector(".keyboard-note");

    // Toggle the visibility of the shortcut list with animation
    if (shortcutList.classList.contains("collapsed")) {
        shortcutList.classList.remove("collapsed");
        icon.classList.add("up");
        keyboardNote.style.maxHeight = "500px"; // Adjust based on content
    } else {
        shortcutList.classList.add("collapsed");
        icon.classList.remove("up");
        keyboardNote.style.maxHeight = "50px"; // Collapse back
    }
});




