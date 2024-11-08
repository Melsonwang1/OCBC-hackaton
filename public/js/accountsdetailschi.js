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

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    async function fetchUserAccount() {
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

            const transactions = await fetchTransactions(accountId);
            displayTransactions(transactions);  // Call displayTransactions to show transactions on the page
            announceAccountDetails(account, transactions);
        } catch (error) {
            console.error("Error fetching user account:", error.message);
            handleAuthError(error);
        }
    }

    async function fetchTransactions(accountId) {
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
            handleAuthError(error);
            return [];
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

    function handleAuthError(error) {
        if (error.message === 'Forbidden') {
            alert("Session expired. Please log in again!");
            localStorage.setItem("token", null);
            window.location.href = "index.html";
        } else if (error.message === 'Unauthorized') {
            alert("Please log in first!");
            window.location.href = "index.html";
        } else {
            alert("An error occurred. Please try again later.");
        }
    }

    await fetchUserAccount();
});

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
    narrate(`Welcome to your accounts page. Here are your account details.`);

    const accountDetailsMessage = `User name: ${account.user_name.toUpperCase()}. 
        Bank name: ${account.account_name}. 
        Account number: ${account.account_number}. 
        Balance you have: ${account.balance_have.toFixed(2)} SGD. 
        Balance you owe: ${account.balance_owe.toFixed(2)} SGD.`;
    narrate(accountDetailsMessage);

    if (transactions && transactions.length > 0) {
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

function startListeningForNavigation() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, "");
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
        }
    };

    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

function handleUserResponse(response) {
    if (response.includes("transfer") || response.includes("sending") || response.includes("send") || response.includes("transfers") || response.includes("transfering")) {
        window.location.href = "transfer.html";
    } else if (response.includes("investments") || response.includes("investment") || response.includes("investing") || response.includes("invest")) {
        window.location.href = "investmenteng.html";
    } else if (response.includes("transactions") || response.includes("transaction") || response.includes("viewing") || response.includes("view") || response.includes("account")) {
        window.location.href = "accountsdetails.html";
    } else {
        narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
    }
}



// IN CASE NEED
/* // Event listener for DOMContentLoaded to ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    let token = localStorage.getItem('token');

    // Function to fetch user and account details
    async function fetchUserAccount(token) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const accountId = urlParams.get('accountId');

            // Fetch account information
            const accountResponse = await fetch(`/accounts/account/${accountId}`, {
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            if (!accountResponse.ok) {
                throw new Error("Failed to fetch account data");
            }
            
            const accountData = await accountResponse.json();
            const account = accountData.account; 

            // Display user name
            document.getElementById("user-name").innerText = account.user_name.toUpperCase(); // Display user name

            // Display account details
            document.querySelector('.account-details h2').innerText = account.account_name; // Set account name
            document.querySelector('.account-details p').innerText = account.account_number; // Set account number
            document.querySelector('.balance-summary .balance-item.positive .value').innerText = account.balance_have.toFixed(2); // Set balance have
            document.querySelector('.balance-summary .balance-item.negative .value').innerText = account.balance_owe.toFixed(2); // Set balance owe

            // Fetch transactions for the account
            await fetchTransactions(accountId, token); // Pass accountId to fetch transactions
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Function to fetch transactions
    async function fetchTransactions() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const accountId = urlParams.get('accountId');

            const response = await fetch(`/transactions/${accountId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            const transactions = await response.json();
            displayTransactions(transactions);
        } catch (error) {
            console.error('Error fetching transactions:', error.message);
            handleAuthError(error);
        }
    }

    // Function to display transactions on the page
    function displayTransactions(transactions) {
        const container = document.getElementById('transaction-list');
        if (container) {
            container.innerHTML = ''; // Clear any previous content
            transactions.forEach(transaction => {
                const amountClass = transaction.amount >= 0 ? 'value-positive' : 'value-negative';
                const amountSign = transaction.amount >= 0 ? '+' : '-';

                container.innerHTML += `
                    <div class="transaction">
                        <p class="transaction-date">${new Date(transaction.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric'
                        })}</p>
                        <p class="transaction-description">${transaction.description}</p>
                        <p class="transaction-amount ${amountClass}">
                            <span class="currency">SGD</span> 
                            <span class="${amountClass}">${amountSign}${Math.abs(transaction.amount).toFixed(2)}</span>
                        </p>
                    </div>
                `;
            });
        } else {
            console.warn('Transaction list container not found');
        }
    }

    // Handle authentication-related errors
    function handleAuthError(error) {
        if (error.message === 'Forbidden') {
            alert("Session expired. Please log in again!");
            localStorage.setItem("token", null);
            window.location.href = "index.html";
        } else if (error.message === 'Unauthorized') {
            alert("Please log in first!");
            window.location.href = "index.html";
        } else {
            alert("An error occurred. Please try again later.");
        }
    }

    // Fetch transactions on page load
    await fetchUserAccount();
    await fetchTransactions();
}); */