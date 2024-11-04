document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`/accounts/accountnameandnumber/1`); // Replace 1 with the actual user ID
        if (!response.ok) {
            throw new Error('Failed to fetch account data');
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
    } catch (error) {
        console.error('Error fetching account data:', error);
    }

    // Add event listener to the form for transaction submission
    const form = document.querySelector('.transfer-container form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form data
        const transferFrom = parseInt(document.getElementById('transfer-from').value, 10);
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value || '';

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
            nric
        });

        try {
            const requestData = {
                account_id: transferFrom,
                amount: parseFloat(amount),
                description,
                phoneNumber,
                nric
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
                alert("Transaction completed successfully!");
                // Optional: Clear form fields
                form.reset();
            } else {
                throw new Error(result.error || "Transaction failed");
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Transaction error: " + error.message);
        }
    });
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
