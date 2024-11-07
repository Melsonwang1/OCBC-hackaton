document.addEventListener("DOMContentLoaded", async () => {
    let token = localStorage.getItem("token"); // Retrieve the token from local storage

    try {
        // Fetch user data with authorization header
        const userResponse = await fetch("/user/1", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.message || "Failed to fetch user data");
        }

        const user = await userResponse.json();
        document.getElementById("user-name").innerText = user.account.name.toUpperCase();

        // Fetch account information with authorization header
        const accountResponse = await fetch("/accounts/user/1", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            throw new Error(errorData.message || "Failed to fetch account data");
        }

        const accounts = await accountResponse.json();
        displayAccounts(accounts);
        announceAccountDetails(accounts);  // Call this function to announce account details

        // Start listening for user navigation responses
        startListeningForNavigation();

    } catch (error) {
        console.error("Error:", error);

        // Handle specific error messages for token expiration or absence
        if (error.message === 'Forbidden') {
            alert("Session timed out. Please log in again.");
            localStorage.setItem("token", null); // Clear token from local storage
            window.location.href = "index.html"; // Redirect to login
        } else if (error.message === 'Unauthorized') {
            alert("Please log in first.");
            window.location.href = "index.html"; // Redirect to login
        }
    }
});

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

// Display account cards
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
