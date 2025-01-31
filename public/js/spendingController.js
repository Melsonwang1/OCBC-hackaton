// Example of data structure
const spendingData = {
    "January": {
        food: 4000,
        fashion: 2000,
        groceries: 1500,
        entertainment: 800,
        transport: 1200
    },
    "February": {
        food: 3500,
        fashion: 1800,
        groceries: 1400,
        entertainment: 600,
        transport: 1100
    },
    "March": {
        food: 4500,
        fashion: 2200,
        groceries: 1600,
        entertainment: 900,
        transport: 1300
    }
};

// Default limit for each category
const spendingLimits = {
    food: 5000,
    fashion: 5000,
    groceries: 5000,
    entertainment: 5000,
    transport: 5000
};

// Example transaction history
const transactionHistory = [
    { category: "food", amount: 400, date: "2025-01-15" },
    { category: "transport", amount: 200, date: "2025-01-16" },
    { category: "fashion", amount: 300, date: "2025-01-17" }
];

// Function to display transaction history
function displayTransactionHistory() {
    const historyDiv = document.getElementById("transaction-history");
    transactionHistory.forEach(transaction => {
        const transactionElement = document.createElement("div");
        transactionElement.innerHTML = `<p>${transaction.date}: $${transaction.amount} on ${transaction.category}</p>`;
        historyDiv.appendChild(transactionElement);
    });
}

displayTransactionHistory();
