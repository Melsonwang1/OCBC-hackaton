document.addEventListener("DOMContentLoaded", async () => {
    let token = localStorage.getItem("token"); // Retrieve the token from local storage

    try {
        // Fetch user data with authorization header
        const userResponse = await fetch(`/user/1`, {
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
        const accountResponse = await fetch(`/accounts/user/1`, {
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
    // Announce the page and account information
    narrate("Welcome to your accounts page. Here are your account details:");

    accounts.forEach((account, index) => {
        const bankName = account.account_name || "Unknown Bank Name";
        const accountNumber = account.account_number || "Unknown Account Number";
        const balance = account.balance_have ? `${account.balance_have.toFixed(2)} SGD` : "Unknown Balance";

        // Construct the message
        const message = `Account ${index + 1}: Bank name: ${bankName}. Account number: ${accountNumber}. Balance: ${balance}.`;

        // Use a timeout to allow for a pause between each narration (to avoid overlapping speech)
        setTimeout(() => narrate(message), index * 4000); // Wait 4 seconds before narrating the next account
    });
}

// Display account cards
function displayAccounts(accounts) {
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ''; // Clear previous content

    accounts.forEach(account => {
        const accountCard = document.createElement('a');
        accountCard.href = `accountsdetails.html?accountId=${account.account_id}`;
        accountCard.className = 'account-card';

        accountCard.innerHTML = `
            <div>
                <h3>${account.account_name}</h3>
                <p>Account Number: ${account.account_number}</p>
            </div>
            <p class="balance"><span class="currency">SGD</span> ${account.balance_have.toFixed(2)}</p>
        `;
        
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

// Manage account cards with keyboard navigation
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
