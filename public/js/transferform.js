
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

async function announceAccountsAndListen(userId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    let isRecognitionActive = false;

    const spokenToCharMap = {
        "hey": "A", "ay": "A", "a": "A","诶":"A", "bee": "B", "b": "B","be":"B", "see": "C", "sea": "C", "c": "C", 
        "dee": "D", "d": "D","的":"D", "ee": "E", "e": "E","一":"E", "eff": "F", "f": "F", "gee": "G", "g": "G", 
        "aitch": "H", "h": "H", "eye": "I", "i": "I", "jay": "J", "j": "J", "kay": "K", "k": "K", 
        "ell": "L", "l": "L", "em": "M", "m": "M","im":"M","an":"N","anne":"N","and":"N","嗯":"N", "en": "N", "n": "N", "oh": "O", "o": "O","哦":"O", 
        "pee": "P","屁":"P", "p": "P", "queue": "Q", "q": "Q","kill":"Q","二":"R", "are": "R", "r": "R", "ess": "S", "s": "S", 
        "tee": "T", "tea": "T", "t": "T", "you": "U", "u": "U","we":"V", "vee": "V", "v": "V", 
        "double you": "W", "w": "W", "ex": "X", "x": "X", "why": "Y", "y": "Y", "zee": "Z", "z": "Z","the":"Z",
        "zero": "0", "one": "1", "two": "2","兔":"2","tree":"3", "three": "3","for":"4", "four": "4", "five": "5", "six": "6", 
        "seven": "7", "eight": "8", "nine": "9", "dollar": "$", "dollar sign": "$", "hash": "#", 
        "hashtag": "#","hash tag":"#", "exclamation": "!", "exclamation mark": "!", "at": "@", "percent": "%","per cent": "%", 
        "caret": "^", "carrot": "^", "ampersand": "&", "plus": "+", "equal": "=","一锅":"=","equals":"=",
    
        // Numbers with Chinese translations
        "zero": "0", "一": "1", "one": "1", "二": "2", "two": "2", "三": "3", "tree": "3", "three": "3", 
        "四": "4", "for": "4", "four": "4", "五": "5", "five": "5", "六": "6", "six": "6", 
        "七": "7", "seven": "7", "八": "8", "eight": "8", "九": "9", "nine": "9", 
    
        // Special characters with Chinese translations
        "dollar": "$", "dollar sign": "$", "美元": "$", "hash": "#", "hashtag": "#", "hash tag": "#", "井号": "#", 
        "exclamation": "!", "exclamation mark": "!", "感叹号": "!", "at": "@", "艾特": "@", "percent": "%", "per cent": "%", "百分号": "%", 
        "caret": "^", "carrot": "^", "插入符号": "^", "ampersand": "&", "和号": "&", "plus": "+", "加号": "+", 
        "equal": "=", "equals": "=", "等号": "=", "left bracket": "[", "right bracket": "]", 
        "left parenthesis": "(", "right parenthesis": ")", "左括号": "(", "右括号": ")", 
        "left curly bracket": "{", "right curly bracket": "}", "左大括号": "{", "右大括号": "}", 
        "colon": ":", "冒号": ":", "semicolon": ";", "分号": ";", 
        "quote": "\"", "double quote": "\"", "双引号": "\"", "single quote": "'", "单引号": "'", 
        "comma": ",", "逗号": ",", "period": ".", "句号": ".", 
        "slash": "/", "斜杠": "/", "backslash": "\\", "反斜杠": "\\", 
        "pipe": "|", "竖线": "|", "less than": "<", "小于号": "<", 
        "greater than": ">", "大于号": ">", "question mark": "?", "问号": "?", 
        "tilde": "~", "波浪号": "~", "grave": "`", "重音符": "`"
    };

    const convertSpokenToChar = (spokenInput) => {
        return spokenToCharMap[spokenInput] || spokenInput.charAt(0);
    };

    async function fetchAndDisplayBalance(accountId) {
        try {
            const accountResponse = await fetch(`/accounts/account/${accountId}`);
            if (!accountResponse.ok) throw new Error("Failed to fetch account data");

            const accountData = await accountResponse.json();
            const balanceHave = accountData.account.balance_have.toFixed(2);
            document.getElementById('balance-amount').innerText = balanceHave; // Display balance
            const synth = window.speechSynthesis;
            synth.speak(new SpeechSynthesisUtterance(`Your balance is ${balanceHave} dollars.`));
        } catch (error) {
            console.error('Error fetching account balance:', error);
        }
    }

    try {
        const response = await fetch(`/accounts/accountnameandnumber/${userId}`);
        if (!response.ok) throw new Error(`Error status: ${response.status}`);

        const accountsData = await response.json();
        const accounts = accountsData.account;

        if (!accounts || accounts.length === 0) {
            alert('No accounts found.');
            return;
        }

        const transferFromDropdown = document.getElementById('transfer-from');
        if (!transferFromDropdown) {
            console.error('Dropdown element not found!');
            return;
        }

        transferFromDropdown.innerHTML = '<option value="" disabled selected>Select an account</option>';
        accounts.forEach((account, index) => {
            const option = document.createElement('option');
            option.value = account.account_id;
            option.textContent = `${account.account_name} (${account.account_number})`;
            transferFromDropdown.appendChild(option);
        });

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        let accountListText = 'Here are your accounts: ';
        
        accounts.forEach((account, index) => {
            accountListText += `Option ${index + 1}: ${account.account_name}, account number ${account.account_number}. `;
        });

        utterance.text = accountListText;
        synth.speak(utterance);

        utterance.onend = () => {
            if (!isRecognitionActive) {
                recognition.start();
                isRecognitionActive = true;
            }
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            if (transcript.includes("done")) {
                recognition.stop();
                isRecognitionActive = false;
                document.getElementById("enterBtn").click();
                return;
            }

            const convertedInput = convertSpokenToChar(transcript);
            const optionNumber = parseInt(convertedInput, 10);
            if (!isNaN(optionNumber) && optionNumber >= 1 && optionNumber <= accounts.length) {
                const selectedAccount = accounts[optionNumber - 1];
                recognition.stop();
                isRecognitionActive = false;

                transferFromDropdown.value = selectedAccount.account_id;
                synth.speak(new SpeechSynthesisUtterance(`You selected ${selectedAccount.account_name}, account number ${selectedAccount.account_number}.`));

                const transferMethodPrompt = new SpeechSynthesisUtterance('Do you want to transfer using a mobile number or an NRIC? Please say mobile or NRIC.');
                synth.speak(transferMethodPrompt);

                recognition.onresult = (event) => {
                    const methodTranscript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                    const mobileRadio = document.querySelector('input[name="transfer-to"][value="mobile"]');
                    const nricRadio = document.querySelector('input[name="transfer-to"][value="nric"]');
                    const mobileInput = document.getElementById('mobile');
                    const nricInput = document.getElementById('nric');
                    const transferInputGroup = document.querySelector('.transfer-input-group');
                    const errorElement = document.getElementById('error');

                    if (methodTranscript.includes('mobile')) {
                        mobileRadio.checked = true;
                        synth.speak(new SpeechSynthesisUtterance('You are now at the mobile number field. Please say a mobile number starting with 8 or 9, followed by 7 digits.'));

                        transferInputGroup.style.display = 'block';
                        mobileInput.style.display = 'block';
                        nricInput.style.display = 'none';

                        if (!isRecognitionActive) {
                            recognition.start();
                            isRecognitionActive = true;
                        }

                        recognition.onresult = (event) => {
                            const spokenInput = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                            if (spokenInput.includes("done")) {
                                recognition.stop();
                                isRecognitionActive = false;
                                synth.speak(new SpeechSynthesisUtterance(`Your mobile number is ${mobileInput.value}.`));
                                document.getElementById("enterBtn").click();
                                return;
                            }
                        
                            const convertedInput = convertSpokenToChar(spokenInput);
                            
                            // Only allow digits for mobile numbers
                            if (mobileRadio.checked && !isNaN(convertedInput) && mobileInput.value.length < 8) {
                                mobileInput.value += convertedInput;
                                synth.speak(new SpeechSynthesisUtterance(`Added ${convertedInput}`));
                            } else if (mobileRadio.checked && isNaN(convertedInput)) {
                                synth.speak(new SpeechSynthesisUtterance("Please only enter digits for mobile number."));
                            }
                        };
                        

                    } else if (methodTranscript.includes('nric')) {
                        nricRadio.checked = true;
                        synth.speak(new SpeechSynthesisUtterance('You are now at the NRIC field. Please say an NRIC starting with a letter, followed by 7 digits, and another letter.'));

                        transferInputGroup.style.display = 'block';
                        mobileInput.style.display = 'none';
                        nricInput.style.display = 'block';

                        if (!isRecognitionActive) {
                            recognition.start();
                            isRecognitionActive = true;
                        }

                        recognition.onresult = (event) => {
                            const spokenInput = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                            if (spokenInput.includes("done")) {
                                recognition.stop();
                                isRecognitionActive = false;
                                document.getElementById("enterBtn").click();
                                return;
                            }

                            const convertedNric = convertSpokenToChar(spokenInput);
                            if (nricInput.value.length < 9) {
                                nricInput.value += convertedNric;
                            }
                        };
                    } else {
                        synth.speak(new SpeechSynthesisUtterance('Invalid option. Say mobile or NRIC.'));
                    }
                };

                // Announce balance after verifying the account
                fetchAndDisplayBalance(selectedAccount.account_id);
            } else {
                synth.speak(new SpeechSynthesisUtterance('Invalid option, please try again.'));
            }
        };

        recognition.onerror = (event) => {
            recognition.stop();
            isRecognitionActive = false;
            recognition.start();
        };

        recognition.onend = () => {
            if (!isRecognitionActive) {
                recognition.start();
                isRecognitionActive = true;
            }
        };

        document.getElementById("enterBtn").onclick = async function () {
            const mobileInput = document.getElementById('mobile');
            const nricInput = document.getElementById('nric');
            const errorElement = document.getElementById('error');
            const mobileRadio = document.querySelector('input[name="transfer-to"][value="mobile"]');
        
            let input, url;
            if (mobileRadio.checked && /^[89]\d{7}$/.test(mobileInput.value)) {
                input = mobileInput.value;
                url = `/user?phoneNumber=${encodeURIComponent(input)}`;
            } else if (/^[A-Z]\d{7}[A-Z]$/.test(nricInput.value)) {
                input = nricInput.value;
                url = `/user/${input}`;
            } else {
                errorElement.textContent = 'Invalid input. Please re-enter.';
                errorElement.style.display = 'block';
                if (mobileRadio.checked) mobileInput.value = '';
                else nricInput.value = '';
                return;
            }
        
            try {
                const verifyResponse = await fetch(url);
                if (!verifyResponse.ok) throw new Error();
        
                const data = await verifyResponse.json();
                if (data.name) {
                    synth.speak(new SpeechSynthesisUtterance(`Verified. The name is ${data.name}.`));
                    errorElement.textContent = `Verified. The name is ${data.name}.`;
        
                    // Ask the user to enter the dollar amount, digit by digit
                    synth.speak(new SpeechSynthesisUtterance('Please say the amount you want to transfer in dollars, digit by digit. Say "finish" when you are done.'));
        
                    let transferAmount = { dollars: '', cents: '' };
                    let isDollarInputComplete = false;
                    
                    recognition.onresult = (event) => {
                        const spokenInput = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                        console.log(`Heard: ${spokenInput}`);
                    
                        if (spokenInput.includes("finish")) {
                            if (!isDollarInputComplete) {
                                // Move to cents input after dollars are complete
                                isDollarInputComplete = true;
                                console.log(`Dollars entered: ${transferAmount.dollars}`);
                                synth.speak(new SpeechSynthesisUtterance(`You entered ${transferAmount.dollars} dollars. Now, please say the amount in cents, digit by digit. Say "finish" when you are done.`));
                                transferAmount.cents = ''; // Reset cents input
                            } else {
                                // Complete the amount entry
                                recognition.stop();
                                const totalAmount = `${transferAmount.dollars}.${transferAmount.cents.padStart(2, '0')}`;
                                document.getElementById('amount').value = totalAmount;
                                console.log(`Final Transfer Amount: $${totalAmount}`);
                                synth.speak(new SpeechSynthesisUtterance(`Your transfer of ${totalAmount} SGD has been populated in the amount field.`));
                                return;
                            }
                        } else {
                            const digit = parseInt(spokenInput, 10);
                    
                            if (!isNaN(digit) && digit >= 0 && digit <= 9) {
                                if (!isDollarInputComplete) {
                                    transferAmount.dollars += digit;
                                    console.log(`Current dollar amount: ${transferAmount.dollars}`);
                                    synth.speak(new SpeechSynthesisUtterance(`Current dollar amount is ${transferAmount.dollars}.`));
                                } else {
                                    transferAmount.cents += digit;
                                    console.log(`Current cents amount: ${transferAmount.cents}`);
                                    synth.speak(new SpeechSynthesisUtterance(`Current cents amount is ${transferAmount.cents}.`));
                                }
                            } else {
                                console.log('Invalid input, please say a valid single digit.');
                                synth.speak(new SpeechSynthesisUtterance('Please say a valid single digit.'));
                            }
                        }
                    };
                    
        
                    recognition.onend = () => {
                        // Only restart recognition if we're still collecting input
                        if (!isDollarInputComplete || transferAmount.cents === '') recognition.start();
                    };
                } else {
                    synth.speak(new SpeechSynthesisUtterance('Invalid input. Please try again.'));
                }
            } catch (error) {
                errorElement.style.display = 'block';
            }
        };
        
        
        
        
        

    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}
