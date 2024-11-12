document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; 
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        window.location.href = "logineng.html"; 
        return; 
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

    // Get the user data
    await getUserData(); 
    await fetchUserAccount(); 
});

async function fetchUserAccount(token) { 
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const accountId = urlParams.get('accountId');

        const accountResponse = await fetch(`/accounts/account/${accountId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            throw new Error(errorData.message || "Failed to fetch account data");
        }

        const accountData = await accountResponse.json();
        const account = accountData.account;

        document.getElementById("user-name").innerText = account.user_name.toUpperCase();
        document.querySelector('.account-details h2').innerText = account.account_name;
        document.querySelector('.account-details .account-number').innerText = account.account_number;
        document.querySelector('.balance-summary .balance-item.positive .value').innerText = account.balance_have.toFixed(2);
        document.querySelector('.balance-summary .balance-item.negative .value').innerText = account.balance_owe.toFixed(2);

        const transactions = await fetchTransactions(accountId, token); // Pass token here
        displayTransactions(transactions); 

        if(!ttsEnabled){ // when tts is not enabled
            announceAccountDetails(account, transactions);
            startListeningForNavigation();
        }
        
    } catch (error) {
        console.error("Error fetching user account:", error.message);
        handleAuthError(error);  // Make sure handleAuthError is defined
    }
}

async function fetchTransactions(accountId, token) { 
    try {
        const response = await fetch(`/transactions/${accountId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch transactions");
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        handleAuthError(error);  // Make sure handleAuthError is defined
        return [];
    }
}

function handleAuthError(error) {
    if (error.message.includes("Unauthorized") || error.message.includes("Forbidden")) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        localStorage.setItem("token", null); // Clear token from local storage
        window.location.href = "logineng.html"; // Redirect to login page
    } else {
        alert("An error occurred. Please try again later.");
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transaction-list');
    if (container) {
        container.innerHTML = '';
        transactions.forEach(transaction => {
            const amountClass = transaction.transactionAmount >= 0 ? 'value-positive' : 'value-negative';
            const amountSign = transaction.transactionAmount >= 0 ? '+' : '-';

            let statusClass;
            switch (transaction.status.toLowerCase()) {
                case 'completed':
                    statusClass = 'status-completed';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    break;
                case 'failed':
                    statusClass = 'status-failed';
                    break;
                default:
                    statusClass = '';
            }

            container.innerHTML += `
                <div class="transaction">
                    <p class="transaction-date">${new Date(transaction.date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    })}</p>
                    <p class="transaction-description">${transaction.description}</p>
                    <p class="transaction-amount ${amountClass}">
                        <span class="currency">SGD</span> 
                        <span class="${amountClass}">${amountSign}${Math.abs(transaction.transactionAmount).toFixed(2)}</span>
                    </p>
                    <p class="transaction-status ${statusClass}">${transaction.status}</p>
                </div>
            `;
        });
    } else {
        console.warn('Transaction list container not found');
    }
}

// State variable to track if TTS is enabled (Hover mouse to listen to text, zb)
let ttsEnabled = false;

// Function to trigger speech
function speakText(text) {
    if (ttsEnabled) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Create a new utterance and speak the text
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7; // Speed of speech (1 is normal speed)
        utterance.pitch = 0.7; // Pitch of speech (1 is normal pitch)

        // Speak the text
        speechSynthesis.speak(utterance);
    }
}

// Toggle the TTS state (on/off)
function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const statusText = document.getElementById('tts-status');
    const toggleButton = document.getElementById('toggle-tts');
    if (ttsEnabled) {
        statusText.innerHTML = 'Hover to listen: <strong>ON</strong>';
    } else {
        statusText.innerHTML = 'Hover to listen: <strong>OFF</strong>';
    }
}

// You can also trigger speech for dynamic content
window.onload = function () {
    // Welcome message will be spoken when the page loads if TTS is enabled
    if (ttsEnabled) {
        const welcomeMessage = document.getElementById('welcome-message');
        speakText(welcomeMessage.innerText); // Speak "Welcome, user" message
    }
};

function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("Speech Synthesis is not supported in this browser.");
    }
}

function announceAccountDetails(account, transactions) {
    if (ttsEnabled) {
        return; // Skip if TTS is enabled
    }

    narrate(`Welcome to your accounts page. Here are your account details.`);

    const accountDetailsMessage = `User name: ${account.user_name.toUpperCase()}. 
        Bank name: ${account.account_name}. 
        Account number: ${account.account_number}. 
        Balance you have: ${account.balance_have.toFixed(2)} SGD. 
        Balance you owe: ${account.balance_owe.toFixed(2)} SGD.`;
    narrate(accountDetailsMessage);

    if (!ttsEnabled && transactions && transactions.length > 0) {
        narrate("Here are your recent transactions:");
        transactions.forEach((transaction, index) => {
            const transactionMessage = `Transaction ${index + 1}: Date: ${new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}. 
                Description: ${transaction.description}. 
                Amount: ${transaction.transactionAmount >= 0 ? '+' : '-'}${Math.abs(transaction.transactionAmount).toFixed(2)} SGD. 
                Status: ${transaction.status}.`;
            setTimeout(() => narrate(transactionMessage), (index + 1) * 4000);
        });
    } else {
        narrate("There are no recent transactions.");
    }

    setTimeout(() => narrate("Would you like to go to Transfer Money, Check Investments, or View Transactions?"), (transactions.length + 1) * 4000);
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (ttsEnabled) return; // Skip if TTS is enabled

    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, ""); // Remove trailing period
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (!ttsEnabled && event.error !== 'no-speech') {
            narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
        }
    };

    // Restart listening when speech ends
    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

// Handle the user's response to navigation prompt
function handleUserResponse(response) {
    if (ttsEnabled) return; // Skip if TTS is enabled

    if (response.includes("transfer")||response.includes("sending")|| response.includes("send")|| response.includes("transfers")|| response.includes("transfering")) {
        window.location.href = "transfer.html";
    } else if (response.includes("investments")||response.includes("investment")||response.includes("investing")||response.includes("invest")) {
        window.location.href = "investmenteng.html";
    } else if (response.includes(" account")||response.includes("accounts")) {
        window.location.href = "accountseng.html";
    } else {
        narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
    }
}

// Keyboard Navigation
document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === '1') {
        window.location.href = "../html/accountseng.html";
    }
    if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    }
    if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    }
    if (event.key == 'c') {
        window.location.href = "../html/accountschi.html";
    }
    if (event.key === 'l') {
        window.location.href = 'logineng.html';
    }
});

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