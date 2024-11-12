let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });

    document.querySelectorAll('section, section *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    document.querySelectorAll('section, section *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // The current user
    let token = localStorage.getItem("token"); // Get token from local storage

    // Check if token is null before proceeding
    if (!token) {
        alert("请您重新登录以继续");
        window.location.href = "loginchi.html"; // Redirect to login page
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
                alert("请您重新登录以继续!");
                localStorage.setItem("token", null); // Clear token from local storage
                window.location.href = "loginchi.html"; // Redirect to login
            } else if (error.message === 'Unauthorized') {
                alert("请先登录!");
                window.location.href = "loginchi.html"; // Redirect to login
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

    // Only call fetchBankAccounts after user data is available
    if (user && user.user_id) {
        await fetchBankAccounts(user.user_id);
    } else {
        console.log('User ID is not available.');
    }
});

async function fetchBankAccounts(userId) {
    try {
        const response = await fetch(`/accounts/user/${userId}`); 
        if (!response.ok) {
            throw new Error(`Error status: ${response.status}`); // Throw an error if response is not ok
        }
        const accounts = await response.json();
        displayAccounts(accounts); // Display the bank records
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        alert('No bank account records data found'); // Alert the user if no bank accounts are found
    }
}


// Function to narrate bank account details using the Web Speech API
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

// Announce the account details dynamically
function announceAccountDetails(accounts) {
    narrate("欢迎来到您的账户页面。以下是您的账户信息：");

    
    accounts.forEach((account, index) => {
        const bankName = account.account_name || "未知银行名称";
        const accountNumber = account.account_number || "未知账户号码";
        const balance = account.balance_have ? `${account.balance_have.toFixed(2)} 新币` : "未知余额";

        const message = `账户 ${index + 1}: 银行名称: ${bankName}. 账号: ${accountNumber}. 余额: ${balance}.`;
        setTimeout(() => narrate(message), index * 4000);
    });

    setTimeout(() => narrate("您想要去转账，查看投资，还是查看交易记录？请说 '转账' 进入转账页面，'查看投资' 进入投资页面，或者 '查看交易记录' 查看交易记录。"), accounts.length * 4000);
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.lang = 'zh-CN';

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
        accountCard.href = `accountdetailschi.html?accountId=${account.account_id}`;
        accountCard.className = 'account-card';

        accountCard.innerHTML = 
            `<div>
                <h3>${account.account_name}</h3>
                <p>账户号码: ${account.account_number}</p>
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
        window.location.href = "../html/accountseng.html";
    }
    
    // Shortcut for "Transfer Money"
    if (event.key === '2') {
        window.location.href = "../html/transfer.html";
    }

    // Shortcut for "Investments"
    if (event.key === '3') {
        window.location.href = "../html/investmenteng.html";
    }

    // Shortcut for "Chinese Translation"
    if(event.key == 'c'){
        window.location.href = "../html/accountschi.html";
    }

    // Shortcut for "Log Out" (L key)
    if (event.key === 'l') {
        window.location.href = 'logineng.html';
    }

});
