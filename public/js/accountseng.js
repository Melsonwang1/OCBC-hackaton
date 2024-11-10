document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // The current user
    let token = localStorage.getItem("token"); // Get token from local storage

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

    // Only call fetchBankAccounts after user data is available
    if (user && user.user_id) {
        await fetchBankAccounts(user.user_id);
    } else {
        console.log('User ID is not available.');
    }
});

async function fetchBankAccounts(userId) {
    try {
        const response = await fetch(`/accounts/user/${userId}`); 
        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`); // Throw an error if response is not ok
        }
        const accounts = await response.json();
        displayAccounts(accounts); // Display the bank records
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        alert('No bank account records data found'); // Alert the user if no bank accounts are found
    }
}


// Function to narrate bank account details using the Web Speech API
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

// Announce the account details dynamically
function announceAccountDetails(accounts) {
    narrate("Welcome to your accounts page. Here are your account details:");

    accounts.forEach((account, index) => {
        const bankName = account.account_name || "Unknown Bank Name";
        const accountNumber = account.account_number || "Unknown Account Number";
        const balance = account.balance_have ? `${account.balance_have.toFixed(2)} SGD` : "Unknown Balance";

        const message = `Account ${index + 1}: Bank name: ${bankName}. Account number: ${accountNumber}. Balance: ${balance}.`;
        setTimeout(() => narrate(message), index * 4000);
    });

    setTimeout(() => narrate("Would you like to go to Transfer Money, Check Investments, or View Transactions?"), accounts.length * 4000);
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
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
        if (event.error !== 'no-speech') {
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
    if (response.includes("transfer")||response.includes("sending")|| response.includes("send")|| response.includes("transfers")|| response.includes("transfering")) {
        window.location.href = "transfer.html";
    } else if (response.includes("investments")||response.includes("investment")||response.includes("investing")||response.includes("invest")) {
        window.location.href = "investmenteng.html";
    } else if (response.includes(" transactions")||response.includes("transaction")||response.includes("viewing")||response.includes("view")||response.includes("account")) {
        window.location.href = "accountsdetails.html";
    } else {
        narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
    }
}

// Display account cards and set up narration and listening
function displayAccounts(accounts) {
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ''; // Clear previous content

    accounts.forEach(account => {
        const accountCard = document.createElement('a');
        accountCard.href = `accountsdetails.html?accountId=${account.account_id}`;
        accountCard.className = 'account-card';

        accountCard.innerHTML = 
            `<div>
                <h3>${account.account_name}</h3>
                <p>Account Number: ${account.account_number}</p>
            </div>
            <p class="balance"><span class="currency">SGD</span> ${account.balance_have.toFixed(2)}</p>`;
        
        accountsList.appendChild(accountCard);
    });

    // Announce account details
    announceAccountDetails(accounts);

    // Start listening for navigation commands after announcement
    startListeningForNavigation();
}



// Keyboard Shortcuts
document.addEventListener('keydown', function (event) {
    // Ensure we don't interfere with regular typing events
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    // Shortcut for "View Accounts"
    if (event.key === '1') {
        window.location.href = "../html/accountseng.html";
    }
    
    // Shortcut for "Transfer Money"
    if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    }

    // Shortcut for "Investments"
    if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    }

    // Shortcut for "Chinese Translation"
    if(event.key == 'c'){
        window.location.href = "../html/accountschi.html";
    }

    // Shortcut for "Log Out" (L key)
    if (event.key === 'l') {
        window.location.href = 'logineng.html';
    }

});

document.addEventListener('DOMContentLoaded', function () {
    // Find the account list and account cards
    const accountsList = document.getElementById('accounts-list');
    // Sample accounts (You can replace this with dynamically loaded data)
    const accounts = [];
    // Function to create account card elements
    function createAccountCards() {
        accounts.forEach(account => {
            const accountCard = document.createElement('button');
            accountCard.classList.add('account-card');
            accountCard.setAttribute('aria-label', account.name);
            accountCard.setAttribute('tabindex', '0'); // Makes it focusable with Tab
            accountCard.innerText = account.name;
            accountCard.addEventListener('click', () => {
                alert(`Viewing details of: ${account.name}`);
                // You can add logic to open the account details page here.
            });
            accountsList.appendChild(accountCard);
        });
    }
    // Call function to create account cards
    createAccountCards();
    // Handle Tab navigation only within account selection
    document.addEventListener('keydown', function(event) {
        // Only process Tab key (Forward or Shift + Tab for backward)
        if (event.key === 'Tab') {
            const focusableElements = Array.from(accountsList.querySelectorAll('.account-card'));
            const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
            if (event.shiftKey) { 
                // If Shift + Tab, go backward
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                focusableElements[prevIndex].focus();
                event.preventDefault(); // Prevent default tabbing behavior
            } else {
                // If Tab (forward), go forward
                const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                focusableElements[nextIndex].focus();
                event.preventDefault(); // Prevent default tabbing behavior
            }
        }
    });
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
