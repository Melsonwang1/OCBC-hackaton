// Event listener for DOMContentLoaded to ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    let token = localStorage.getItem('token');

    // Function to fetch transactions
    async function fetchTransactions() {
        try {
            const response = await fetch(`/transactions/1`, {
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
    await fetchTransactions();
});
