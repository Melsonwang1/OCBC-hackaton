document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`/accounts/accountnameandnumber/1`); // Replace 1 with the actual user ID
        if (!response.ok) {
            throw new Error('Failed to fetch account data');
        }
        
        const accountsData = await response.json();
        
        if (!Array.isArray(accountsData.account)) {
            console.error('Expected an array but received:', accountsData);
            return;
        }

        const transferFromDropdown = document.getElementById('transfer-from');
        
        // Access the array within the account property
        accountsData.account.forEach(account => {
            const option = document.createElement('option');
            option.value = account.account_id; // Set the account_id as the value (hidden)
            option.textContent = `${account.account_name} (${account.account_number})`; // Show only name and number
            transferFromDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching account data:', error);
    }

    // Add event listener to the form for submitting the transaction
    const form = document.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form data
        const transferFrom = document.getElementById('transfer-from').value; // this is the hidden account_id
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value || '';
        const purpose = document.getElementById('purpose').value;

        // Get the selected transfer method (mobile or NRIC)
        let phoneNumber = null;
        let nric = null;
        const transferMethod = document.querySelector('input[name="transfer-to"]:checked').value;

        if (transferMethod === 'mobile') {
            phoneNumber = document.getElementById('mobile').value;
        } else if (transferMethod === 'nric') {
            nric = document.getElementById('nric').value;
        }

        if (!transferFrom || isNaN(amount) || amount <= 0) {
            alert("Please select an account, enter a valid amount, and choose a transfer method.");
            return;
        }

        // Log transaction details for debugging
        console.log("Transaction data:", {
            account_id: transferFrom, // account_id is recorded here, not account_number
            amount,
            description,
            phoneNumber,
            nric
        });

        try {
            const response = await fetch('http://localhost:3000/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    account_id: transferFrom,  // Using account_id instead of account_number
                    amount,
                    description,
                    phoneNumber,
                    nric
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert("Transaction completed successfully!");
            } else {
                throw new Error(result.error || "Transaction failed");
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Transaction error: " + error.message);
        }
    });
});

// Toggle input fields based on the selected transfer method
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
