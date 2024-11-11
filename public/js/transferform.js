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



async function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("Speech Synthesis is not supported in this browser.");
    }
}

async function announceAccountsAndListen(userId) {
    const accountsData = await fetchAccounts(userId);

    if (accountsData && accountsData.account && accountsData.account.length > 0) {
        narrate(`Welcome to your accounts page. You have the following accounts:`);

        accountsData.account.forEach((account, index) => {
            const accountEnding = account.account_number.slice(-3);
            narrate(`Account ${index + 1}: ${account.account_name} ending in ${accountEnding}.`);
        });

        narrate("Please say the number of the account you'd like to check the balance for.");
        startListeningForAccountSelection(accountsData.account);
    } else {
        narrate("No accounts found.");
    }
}

async function fetchAccounts(userId) {
    try {
        const response = await fetch(`/accounts/accountnameandnumber/${userId}`);
        if (!response.ok) throw new Error(`Error status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching accounts data:', error);
        return null;
    }
}

function startListeningForAccountSelection(accounts) {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        const numberMatch = transcript.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/);

        if (numberMatch) {
            let accountIndex;
            const numberWord = numberMatch[1];
            switch (numberWord) {
                case "one": accountIndex = 0; break;
                case "two": accountIndex = 1; break;
                case "three": accountIndex = 2; break;
                case "four": accountIndex = 3; break;
                case "five": accountIndex = 4; break;
                case "six": accountIndex = 5; break;
                case "seven": accountIndex = 6; break;
                case "eight": accountIndex = 7; break;
                case "nine": accountIndex = 8; break;
                case "ten": accountIndex = 9; break;
                default: accountIndex = parseInt(numberWord) - 1;
            }

            if (accountIndex >= 0 && accountIndex < accounts.length) {
                const selectedAccount = accounts[accountIndex];
                narrate(`Fetching balance for ${selectedAccount.account_name} ending in ${selectedAccount.account_number.slice(-3)}.`);

                const transferFromDropdown = document.getElementById("transfer-from");
                transferFromDropdown.value = selectedAccount.account_id;

                fetchAndAnnounceBalance(selectedAccount.account_id).then(() => {
                    startListeningForTransferMethod();
                });
            } else {
                narrate("Invalid selection. Please say a number corresponding to the account you want.");
            }
        } else {
            narrate("Sorry, I didn't understand that. Please say the number of the account you want to check.");
        }
    };

    recognition.start();
}

async function fetchAndAnnounceBalance(accountId) {
    try {
        const response = await fetch(`/accounts/account/${accountId}`);
        if (!response.ok) throw new Error(`Error status: ${response.status}`);
        
        const accountData = await response.json();
        const balanceHave = accountData.account.balance_have.toFixed(2);

        narrate(`The balance for this account is ${balanceHave} SGD.`);
        document.getElementById('balance-amount').innerText = balanceHave;
    } catch (error) {
        console.error('Error fetching account balance:', error);
        narrate("There was an error fetching the balance for this account.");
    }
}

function startListeningForTransferMethod() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

        if (transcript.includes("mobile")) {
            document.querySelector("input[value='mobile']").checked = true;
            toggleInput("mobile");
            narrate("Please enter the mobile number character by character.");
            startListeningForCharacterEntry();
        } else if (transcript.includes("nric")) {
            document.querySelector("input[value='nric']").checked = true;
            toggleInput("nric");
            narrate("Please enter the NRIC character by character.");
            startListeningForCharacterEntry();
        } else {
            narrate("Sorry, I didn't understand. Please say mobile number or NRIC.");
        }
    };

    recognition.start();
}

function startListeningForAccountSelection(accounts) {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        // Improved pattern to catch words and digits from one to ten
        const numberMatch = transcript.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/);

        if (numberMatch) {
            let accountIndex;
            const numberWord = numberMatch[1];
            switch (numberWord) {
                case "one": accountIndex = 0; break;
                case "two": accountIndex = 1; break;
                case "three": accountIndex = 2; break;
                case "four": accountIndex = 3; break;
                case "five": accountIndex = 4; break;
                case "six": accountIndex = 5; break;
                case "seven": accountIndex = 6; break;
                case "eight": accountIndex = 7; break;
                case "nine": accountIndex = 8; break;
                case "ten": accountIndex = 9; break;
                default: accountIndex = parseInt(numberWord) - 1;
            }

            if (accountIndex >= 0 && accountIndex < accounts.length) {
                const selectedAccount = accounts[accountIndex];
                narrate(`Fetching balance for ${selectedAccount.account_name} ending in ${selectedAccount.account_number.slice(-3)}.`);

                // Set the selected account in the transfer form dropdown
                const transferFromDropdown = document.getElementById("transfer-from");
                transferFromDropdown.value = selectedAccount.account_id;

                // Announce the balance for the selected account
                fetchAndAnnounceBalance(selectedAccount.account_id).then(() => {
                    // Start listening for transfer method after announcing balance
                    startListeningForTransferMethod();
                });
            } else {
                narrate("Invalid selection. Please say a number corresponding to the account you want.");
            }
        } else {
            narrate("Sorry, I didn't understand that. Please say the number of the account you want to check.");
        }
    };

    recognition.start();
}

function toggleInput(type) {
    const mobileInput = document.getElementById('mobile');
    const nricInput = document.getElementById('nric');
    const transferInputGroup = document.querySelector('.transfer-input-group');

    transferInputGroup.style.display = 'block';

    if (type === 'mobile') {
        mobileInput.style.display = 'block';
        nricInput.style.display = 'none';
        mobileInput.value = '';
        mobileInput.addEventListener('input', validateMobileNumber);
        nricInput.removeEventListener('input', validateNRIC);
    } else if (type === 'nric') {
        mobileInput.style.display = 'none';
        nricInput.style.display = 'block';
        nricInput.value = '';
        nricInput.addEventListener('input', validateNRIC);
        mobileInput.removeEventListener('input', validateMobileNumber);
    }
}

function validateMobileNumber(event) {
    const input = event.target;
    const value = input.value;

    // Check that the first character is 8 or 9
    if (value.length === 1 && !/[89]/.test(value[0])) {
        input.value = ''; // Clear input if first character is not 8 or 9
        narrate("Mobile number must start with 8 or 9.");
        return;
    }

    // Ensure input is a digit and length doesn't exceed 8
    if (!/^\d+$/.test(value) || value.length > 8) {
        input.value = value.slice(0, -1); // Remove invalid character
        narrate("Mobile number can only be 8 digits.");
    }
}

function validateNRIC(event) {
    const input = event.target;
    const value = input.value.toUpperCase(); // Convert to uppercase for consistency
    input.value = value; // Update the input to reflect uppercase letters

    // Validate the NRIC format: start with a letter, middle characters are digits, last character is a letter
    if (value.length === 1 && !/[A-Z]/.test(value[0])) {
        input.value = ''; // Clear input if first character is not a letter
        narrate("NRIC must start with an alphabet.");
        return;
    }
    if (value.length > 1 && value.length < 9 && !/\d/.test(value[value.length - 1])) {
        input.value = value.slice(0, -1); // Clear input if middle characters are not digits
        narrate("NRIC middle characters must be digits.");
        return;
    }
    if (value.length === 9 && !/[A-Z]/.test(value[8])) {
        input.value = value.slice(0, -1); // Clear input if last character is not a letter
        narrate("NRIC must end with an alphabet.");
    }
}
