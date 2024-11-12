
let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('main, main *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}


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
        account_id: transferFrom,
        amount,
        description,
        phoneNumber,
        nric,
        status
    });

    try {
        const requestData = {
            account_id: transferFrom,
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

async function announceAccountsAndListen(userId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Set recognition language
    recognition.continuous = true; // Listen indefinitely
    recognition.interimResults = false; // Only get finalized speech

    try {
        const response = await fetch(`/accounts/accountnameandnumber/${userId}`);
        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`);
        }

        const accountsData = await response.json();
        const accounts = accountsData.account;

        if (!accounts || accounts.length === 0) {
            alert('No accounts found.');
            return;
        }

        // Populate the dropdown with account options
        const transferFromDropdown = document.getElementById('transfer-from');
        if (!transferFromDropdown) {
            console.error('Dropdown element not found!');
            return;
        }

        transferFromDropdown.innerHTML = '<option value="" disabled selected>Select an account</option>'; // Reset dropdown
        accounts.forEach((account, index) => {
            const option = document.createElement('option');
            option.value = account.account_id; // Set account ID as value
            option.textContent = `${account.account_name} (${account.account_number})`; // Display name and number
            transferFromDropdown.appendChild(option);
        });

        // Announce account options using Text-to-Speech
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        let accountListText = 'Here are your accounts: ';
        
        accounts.forEach((account, index) => {
            accountListText += `Option ${index + 1}: ${account.account_name}, account number ${account.account_number}. `;
        });

        utterance.text = accountListText;
        synth.speak(utterance);

        // Wait for TTS to finish before starting speech recognition
        utterance.onend = () => {
            console.log('Text-to-Speech complete. Starting speech recognition...');
            recognition.start();
        };

        // Handle speech recognition for account selection
        recognition.onresult = async (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log('You said:', transcript);

            // Check if the user selects an account by speaking the option number
            const optionNumber = parseInt(transcript, 10);
            if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= accounts.length) {
                const selectedAccount = accounts[optionNumber - 1];
                console.log('Selected Account:', selectedAccount);

                // Stop listening once selection is made
                recognition.stop();

                // Update the dropdown to select the chosen option
                transferFromDropdown.value = selectedAccount.account_id;

                // Fetch and display balance for the selected account
                await fetchAndDisplayBalance(selectedAccount.account_id);

                // Announce options for transferring money
                const transferMethodPrompt = new SpeechSynthesisUtterance(
                    'Do you want to transfer using a mobile number or an NRIC? Please say mobile or NRIC.'
                );
                synth.speak(transferMethodPrompt);

                transferMethodPrompt.onend = () => {
                    recognition.start();
                };

                // Handle speech recognition for transfer method
                recognition.onresult = (event) => {
                    const methodTranscript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                    console.log('You said:', methodTranscript);

                    if (methodTranscript.includes('mobile')) {
                        document.querySelector('input[name="transfer-to"][value="mobile"]').click();
                        console.log('Mobile number selected.');
                        synth.speak(new SpeechSynthesisUtterance('Mobile number selected.'));
                    } else if (methodTranscript.includes('nric')) {
                        document.querySelector('input[name="transfer-to"][value="nric"]').click();
                        console.log('NRIC selected.');
                        synth.speak(new SpeechSynthesisUtterance('NRIC selected.'));
                    } else {
                        console.error('Invalid transfer method. Listening again...');
                        synth.speak(new SpeechSynthesisUtterance('Invalid option, please say mobile or NRIC.'));
                    }
                };
            } else {
                console.error('Invalid selection. Listening again...');
                synth.speak(new SpeechSynthesisUtterance('Invalid option, please try again.'));
            }
        };

        // Handle recognition errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            recognition.stop(); // Stop recognition and restart
            synth.speak(new SpeechSynthesisUtterance('Sorry, there was an error. Listening again.'));
            recognition.start();
        };

        recognition.onend = () => {
            console.log('Recognition ended. Restarting...');
            recognition.start(); // Restart listening
        };

    } catch (error) {
        console.error('Error announcing accounts:', error);
        alert('Could not retrieve or announce accounts. Please try again later.');
    }
}
