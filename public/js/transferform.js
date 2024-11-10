// Function to check if the user is currently focused on an input or textarea
function isTyping() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable;
}

// General page navigation shortcuts
document.addEventListener('keydown', function(event) {
    // Ensure we're not in an input field or similar element
    if (isTyping()) return;

    // General page navigation shortcuts
    if (event.key === '1') {
        window.location.href = "../html/accountseng.html";
    } else if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    } else if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    } else if (event.key === 't') {
        window.location.href = "../html/accountschi.html";
    } else if (event.key === 'l') {
        localStorage.removeItem("token"); // Properly remove the token
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    }
});

/* Still working on it*/
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        const focusableElements = [
            document.getElementById('transfer-from'),
            document.querySelector('.radio-button[value="mobile"]'),
            document.querySelector('.radio-button[value="nric"]'),
            document.getElementById('mobile'),
            document.getElementById('nric'),
            document.getElementById('enterBtn'),
            document.getElementById('amount'),
            document.getElementById('description'),
            document.querySelector('.transfer-btn')
        ];

        const currentIndex = focusableElements.findIndex(el => el === document.activeElement);

        let nextIndex;
        if (event.shiftKey) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else {
            nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }

        focusableElements[nextIndex].focus();
    }
});

// Get user token
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
    await fetchAccDetails(user.user_id)

});

async function fetchAccDetails(userId){
    try {
        const response = await fetch(`/accounts/accountnameandnumber/${userId}`); 
        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`); // Throw an error if response is not ok
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

        // Display and show balance when an account is selected (zb)
        transferFromDropdown.addEventListener('change', async (event) => {
            const selectedAccountId = event.target.value;
            if (selectedAccountId) {
                document.getElementById('balance').style.display = 'block'; // Show balance display
                await fetchAndDisplayBalance(selectedAccountId); // Fetch and show balance
            } else {
                document.getElementById('balance').style.display = 'none'; // Hide balance if no account is selected
            }
        });
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        alert('No bank account records data found'); // Alert the user if no bank accounts are found
    }
}

    // Function to fetch and display the balance (zb)
    async function fetchAndDisplayBalance(accountId) {       
        try {
            const accountResponse = await fetch(`/accounts/account/${accountId}`);
            if (!accountResponse.ok) {
                const errorData = await accountResponse.json();
                throw new Error(errorData.message || "Failed to fetch account data");
            }
            const accountData = await accountResponse.json();
            const balanceHave = accountData.account.balance_have.toFixed(2);
            document.getElementById('balance-amount').innerText = balanceHave; // Display balance
        } catch (error) {
            console.error('Error fetching account balance:', error);
        }
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
                document.getElementById('balance').style.display = 'none'; // Hide balance after successful transaction
            } else {
                throw new Error(result.error || "Transaction failed");
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Transaction error: " + error.message);
        }
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

// Function for buttons nric and phone number
function selectOption(value) {
    // Get all buttons
    const buttons = document.querySelectorAll('.radio-button');
    
    // Remove selected class from all buttons
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    // Add selected class to the clicked button
    const selectedButton = Array.from(buttons).find(button => button.textContent === (value === 'mobile' ? 'Mobile Number' : 'NRIC'));
    selectedButton.classList.add('selected');

    // Call your existing toggleInput function
    toggleInput(value);
}

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