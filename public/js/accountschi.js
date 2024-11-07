document.addEventListener("DOMContentLoaded", async () => {
    let token = localStorage.getItem("token"); // Retrieve the token from local storage

    try {
        // Fetch user data with authorization header
        const userResponse = await fetch("/user/1", {
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
        const accountResponse = await fetch("/accounts/user/1", {
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

        // Start listening for user navigation responses
        startListeningForNavigation();

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
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("Speech Synthesis is not supported in this browser.");
    }
}

// Announce the account details dynamically
function announceAccountDetails(accounts) {
    narrate("欢迎来到您的账户页面。以下是您的账户信息：");


    accounts.forEach((account, index) => {
        const bankName = account.account_name || "未知银行名称";
        const accountNumber = account.account_number || "未知账户号码";
        const balance = account.balance_have ? `${account.balance_have.toFixed(2)} 新加坡元` : "未知余额";


        const message = `账户 ${index + 1}：银行名称：${bankName}。账号：${accountNumber}。余额：${balance}。`;

        setTimeout(() => narrate(message), index * 4000);
    });

    setTimeout(() => narrate("您想要去转账，查看投资，还是查看交易记录？请说 '转账' 进入转账页面，'查看投资' 进入投资页面，或者 '查看交易记录' 查看交易记录。")
    , accounts.length * 4000);
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.lang = 'zh-CN';  // Set to Chinese

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, ""); // Remove trailing period
        console.log("User said: " + transcript);  // Log what the user said
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易记录。");
        }
    };

    // Restart listening when speech ends
    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}


// Handle the user's response to navigation prompt
function handleUserResponse(response) {
    if (response.includes("转账") || response.includes("汇款") || response.includes("转移")) {
        window.location.href = "transferchi.html";
    } else if (response.includes("投资") || response.includes("查看投资") || response.includes("理财")) {
        window.location.href = "investmentchi.html";
    } else if (response.includes("交易记录") || response.includes("查看交易") || response.includes("账户详情") || response.includes("账户")) {
        window.location.href = "accountsdetailschi.html";
    } else {
        narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易记录。");
    }
    
}

// Display account cards
function displayAccounts(accounts) {
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = ''; // Clear previous content

    accounts.forEach(account => {
        const accountCard = document.createElement('a');
        accountCard.href = `accountsdetails.html?accountId=${account.account_id}`;
        accountCard.className = 'account-card';

        accountCard.innerHTML = 
            `<div>
                <h3>${account.account_name}</h3>
                <p>Account Number: ${account.account_number}</p>
            </div>
            <p class="balance"><span class="currency">SGD</span> ${account.balance_have.toFixed(2)}</p>`;
        
        accountsList.appendChild(accountCard);
    });
}


// Keyboard Shortcuts
document.addEventListener('keydown', function (event) {
    // Ensure we don't interfere with regular typing events
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    // Shortcut for "View Accounts"
    if (event.key === '1') {
        window.location.href = "../html/accountschi.html";
    }
    
    // Shortcut for "Transfer Money"
    if (event.key === '2') {
        window.location.href = "../html/transferchi.html";
    }

    // Shortcut for "Investments"
    if (event.key === '3') {
        window.location.href = "../html/investmentchi.html";
    }

    // Shortcut for "Chinese Translation"
    if(event.key == 'e'){
        window.location.href = "../html/accountseng.html";
    }

    // Shortcut for "Log Out" (L key)
    if (event.key === 'l') {
        window.location.href = 'loginchi.html';
    }

});
