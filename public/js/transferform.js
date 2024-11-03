document.addEventListener('DOMContentLoaded', async () => {
    const userId = "YOUR_USER_ID"; // Replace with actual user ID value
    
    try {
        const response = await fetch(`/accounts/accountnameandnumber/1`);
        if (!response.ok) {
            throw new Error('Failed to fetch account data');
        }
        
        const accountsData = await response.json();
        
        // Check if accountsData.account is an array
        if (!Array.isArray(accountsData.account)) {
            console.error('Expected an array but received:', accountsData);
            return;
        }

        const transferFromDropdown = document.getElementById('transfer-from');
        
        accountsData.account.forEach(account => {
            const option = document.createElement('option');
            option.value = account.account_number; // Set value as needed
            option.textContent = `${account.account_name} (${account.account_number})`;
            transferFromDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching account data:', error);
    }
});
