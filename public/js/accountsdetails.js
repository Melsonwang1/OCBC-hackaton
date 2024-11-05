// Event listener for DOMContentLoaded to ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage

    // Function to fetch user and account details
    async function fetchUserAccount() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const accountId = urlParams.get('accountId');

            // Fetch account information with authorization
            const accountResponse = await fetch(`/accounts/account/${accountId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!accountResponse.ok) {
                const errorData = await accountResponse.json();
                throw new Error(errorData.message || "Failed to fetch account data");
            }
            
            const accountData = await accountResponse.json();
            const account = accountData.account;

            // Display account and user details
            document.getElementById("user-name").innerText = account.user_name.toUpperCase();
            document.querySelector('.account-details h2').innerText = account.account_name;
            document.querySelector('.account-details .account-number').innerText = account.account_number;
            document.querySelector('.balance-summary .balance-item.positive .value').innerText = account.balance_have.toFixed(2);
            document.querySelector('.balance-summary .balance-item.negative .value').innerText = account.balance_owe.toFixed(2);

            // Fetch transactions for the account
            await fetchTransactions(accountId); // Pass accountId to fetch transactions
        } catch (error) {
            console.error("Error fetching user account:", error.message);
            handleAuthError(error);
        }
    }

    // Function to fetch transactions
    async function fetchTransactions(accountId) {
        try {
            const response = await fetch(`/transactions/${accountId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch transactions");
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
                        <p class="transaction-status ${statusClass} ${transaction.status === 'Completed' ? 'status-completed' : transaction.status === 'Pending' ? 'status-pending' : 'status-failed'}">
                        ${transaction.status}
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
            localStorage.setItem("token", null); // Clear token from local storage
            window.location.href = "index.html"; // Redirect to login
        } else if (error.message === 'Unauthorized') {
            alert("Please log in first!");
            window.location.href = "index.html"; // Redirect to login
        } else {
            alert("An error occurred. Please try again later.");
        }
    }

    // Fetch user account details and transactions on page load
    await fetchUserAccount();
});



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