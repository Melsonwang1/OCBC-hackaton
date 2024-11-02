document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Uncomment and modify this if user information is needed
        
        const userResponse = await fetch(`/user/1`);
        if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
        }
        const user = await userResponse.json();
        document.getElementById("user-name").innerText = user.account.name; // Set user name
        

        // Fetch account information
        const accountResponse = await fetch(`/accounts/user/1`);
        if (!accountResponse.ok) {
            throw new Error("Failed to fetch account data");
        }
        const accounts = await accountResponse.json(); // Get the response data as an array
        displayAccounts(accounts); // Pass the array of accounts to the display function
    } catch (error) {
        console.error("Error:", error);
    }
});

// Adjust the displayAccounts function to handle an array of account objects
function displayAccounts(accounts) {
    console.log('Display Accounts Function Called'); // Check if this function runs
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ''; // Clear previous accounts if any

    accounts.forEach(account => {
        // Create a new account card for each account
        const accountCard = document.createElement('a');
        accountCard.href = `accountsdetails.html?accountId=${account.account_id}`; // Link to detailed view
        accountCard.className = 'account-card'; // Apply CSS class

        // Add account information using the properties from the backend response
        accountCard.innerHTML = `
            <div>
                <h3>${account.account_name}</h3>
                <p>${account.account_number}</p>
            </div>
            <p class="balance"><span class="currency">SGD</span> ${account.balance_have.toFixed(2)}</p>
        `;
        
        // Append the new card to the accounts list
        accountsList.appendChild(accountCard);
    });
}


if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    let selectedLanguage = 'en-US'; // Default to English
    let isListeningForNavigation = false;
    let isRecognitionRunning = false;

    const narrate = (message, lang) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    };

    const announcePageAndBankDetails = () => {
        narrate(`You are on the accounts page. Here are the details for both accounts.`, selectedLanguage);

        // Get details for My Account
        const myBankDetails = getBankDetails('myBank');
        if (myBankDetails) {
            const myBankMessage = `Bank name: ${myBankDetails.bankName}. Bank number: ${myBankDetails.bankNumber}. Branch: ${myBankDetails.branch}. Bank Balance: ${myBankDetails.haveamt}. Owed amount: ${myBankDetails.owedamt}. Recent transaction from: ${myBankDetails.person}. Phone number: ${myBankDetails.phonenum}. Amount: ${myBankDetails.amt}. Date: ${myBankDetails.date}.`;
            narrate(myBankMessage, selectedLanguage);
        } else {
            narrate('My Account details not found.', selectedLanguage);
        }

        // Get details for My Savings Account
        const savingsBankDetails = getBankDetails('savingsBank');
        if (savingsBankDetails) {
            const savingsBankMessage = `Bank name: ${savingsBankDetails.bankName}. Bank number: ${savingsBankDetails.bankNumber}. Branch: ${savingsBankDetails.branch}. Bank Balance: ${savingsBankDetails.haveamt}. Owed amount: ${savingsBankDetails.owedamt}. Recent transaction from: ${savingsBankDetails.person}. Phone number: ${savingsBankDetails.phonenum}. Amount: ${savingsBankDetails.amt}. Date: ${savingsBankDetails.date}.`;
            setTimeout(() => narrate(savingsBankMessage, selectedLanguage), 5000); // Add delay to avoid overlap
        } else {
            narrate('My Savings Account details not found.', selectedLanguage);
        }

        // After narration, prompt for navigation
        const navPrompt = 'Would you like to go to the Transfer and Payments page or the Investment page? Say "payments" or "investment" to proceed.';
        setTimeout(() => {
            narrate(navPrompt, selectedLanguage);
            isListeningForNavigation = true;
            startListening();
        }, 10000); // Adjust delay to allow for account details narration
    };

    const getBankDetails = (bankId) => {
        const bankElem = document.getElementById(bankId === 'myBank' ? 'myBankName' : 'savingsBankName');
        const bankNumberElem = document.getElementById(bankId === 'myBank' ? 'myBankNumberDetails' : 'savingsBankNumberDetails');
        const branchElem = document.getElementById(bankId === 'myBank' ? 'myBankBranchDetails' : 'savingsBankBranchDetails');
        const haveAmtElem = document.getElementById(bankId === 'myBank' ? 'haveamt' : 'savingshaveamt');
        const owedAmtElem = document.getElementById(bankId === 'myBank' ? 'owedamt' : 'savingsOwedamt');
        const personElem = document.getElementById(bankId === 'myBank' ? 'person' : 'savingsTransactionsperson');
        const phonenumElem = document.getElementById(bankId === 'myBank' ? 'phonenum' : 'savingsTransactionsphonenum');
        const amtElem = document.getElementById(bankId === 'myBank' ? 'amt' : 'savingsTransactionsamt');
        const dateElem = document.getElementById(bankId === 'myBank' ? 'date' : 'savingsTransactionsdate');

        return bankElem && bankNumberElem && branchElem && haveAmtElem && owedAmtElem && personElem && phonenumElem && amtElem && dateElem
            ? {
                bankName: bankElem.textContent,
                bankNumber: bankNumberElem.textContent,
                branch: branchElem.textContent,
                haveamt: haveAmtElem.textContent,
                owedamt: owedAmtElem.textContent,
                person: personElem.textContent,
                phonenum: phonenumElem.textContent,
                amt: amtElem.textContent,
                date: dateElem.textContent
            }
            : null;
    };

    const handleCommand = (spokenText) => {
        const command = spokenText.toLowerCase();

        if (isListeningForNavigation) {
            // Process navigation commands
            if (command.includes("payments")) {
                window.location.href = '../html/transfer.html';
            } else if (command.includes("investment")) {
                window.location.href = '../html/investment.html';
            } else {
                narrate('Please repeat your selection.', selectedLanguage);
                startListening();
            }
        }
    };

    const startListening = () => {
        if (!isRecognitionRunning) {
            recognition.start();
            isRecognitionRunning = true;
        }
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        console.log(`Recognized: ${spokenText}`);
        handleCommand(spokenText);
    };

    recognition.onend = () => {
        isRecognitionRunning = false;
        if (isListeningForNavigation) {
            startListening();
        }
    };

    recognition.onerror = (event) => {
        console.error('Error occurred:', event.error);
        narrate('Error occurred. Please try again.', selectedLanguage);
        isRecognitionRunning = false;
        startListening();
    };

    // Call the function to announce page and bank details when page loads
    announcePageAndBankDetails();

} else {
    narrate('Sorry, your browser does not support the Web Speech API.', 'en-US');
}
