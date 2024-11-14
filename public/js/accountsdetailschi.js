let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; 
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
        alert("请您重新登录以继续");
        window.location.href = "loginchi.html"; 
        return; 
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
                console.error('出现错误:', error);
            }
        }
    }

    // Log Out Button functionality
    document.getElementById("logout-btn").addEventListener("click", function() {
        localStorage.removeItem("token"); // Properly remove the token
        window.location.href = "loginchi.html";
        history.replaceState(null, null, "loginchi.html");
    });

    // Get the user data
    await getUserData(); 
    await fetchUserAccount(); 
});

async function fetchUserAccount(token) { 
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const accountId = urlParams.get('accountId');

        const accountResponse = await fetch(`/accounts/account/${accountId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            throw new Error(errorData.message || "无法获取账户信息");
        }

        const accountData = await accountResponse.json();
        const account = accountData.account;

        document.getElementById("user-name").innerText = account.user_name.toUpperCase();
        document.querySelector('.account-details h2').innerText = account.account_name;
        document.querySelector('.account-details .account-number').innerText = account.account_number;
        document.querySelector('.balance-summary .balance-item.positive .value').innerText = account.balance_have.toFixed(2);
        document.querySelector('.balance-summary .balance-item.negative .value').innerText = account.balance_owe.toFixed(2);

        const transactions = await fetchTransactions(accountId, token); // Pass token here
        displayTransactions(transactions); 

        if(!ttsEnabled){ // when tts is not enabled
            announceAccountDetails(account, transactions);
            startListeningForNavigation();
        }
        
    } catch (error) {
        console.error("无法获取银行账户:", error.message);
        handleAuthError(error);  // Make sure handleAuthError is defined
    }
}

async function fetchTransactions(accountId, token) { 
    try {
        const response = await fetch(`/transactions/${accountId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "无法获取转账信息");
        }

        return await response.json();
    } catch (error) {
        console.error('无法获取转账信息:', error.message);
        handleAuthError(error);  // Make sure handleAuthError is defined
        return [];
    }
}

function handleAuthError(error) {
    if (error.message.includes("Unauthorized") || error.message.includes("Forbidden")) {
        alert("您已被登出, 请重新登录以继续");
        localStorage.setItem("token", null); // Clear token from local storage
        window.location.href = "loginchi.html"; // Redirect to login page
    } else {
        alert("错误出现");
    }
}

const container = document.getElementById('transaction-list');
const deleteBtn = document.getElementById('delete-transaction-btn');
let selectedTransactionId = null;

function displayTransactions(transactions) {
    if (container) {
        container.innerHTML = ''; // Clear existing rows

        // Sort transactions by date in descending order
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

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

            // Add a new row for each transaction
            const row = document.createElement('tr');
            row.setAttribute('data-id', transaction.id);
            row.onclick = function(event) {
                selectTransactionRow(event, transaction); // Pass the whole transaction object
            };

            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${new Date(transaction.date).toLocaleDateString('zh-CN', {
                    day: '2-digit', month: 'long', year: 'numeric'
                })}</td>
                <td>${transaction.description}</td>
                <td class="${amountClass}">
                    <span class="currency">SGD</span> ${amountSign}${Math.abs(transaction.transactionAmount).toFixed(2)}
                </td>
                <td><span class="transaction-status ${statusClass}">${transaction.status}</span></td>
            `;

            container.appendChild(row);
        });
    } else {
        console.warn('无法获取转账资料');
    }
}

// Function to select the row
function selectTransactionRow(event, transaction) {
    const table = document.getElementById('transaction-list');
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        row.classList.remove('selected'); // Remove 'selected' class from all rows
    });

    const row = event.currentTarget;
    row.classList.add('selected'); // Add 'selected' class to clicked row
    selectedTransactionId = transaction.id; // Store the selected transaction ID

    // Enable the delete button only if the status is "pending" and the amount is negative
    const status = transaction.status.toLowerCase();
    const amount = transaction.transactionAmount;

    if (status === 'pending' && amount < 0) {
        deleteBtn.disabled = false; // Enable the delete button
    } else {
        deleteBtn.disabled = true; // Disable the delete button if not eligible for deletion
    }
}

// Handle delete button click
deleteBtn.addEventListener('click', async function() {
    if (selectedTransactionId) {
        // Immediately disable the delete button after clicking
        deleteBtn.disabled = true; // Disable the delete button
        try {
            // First, delete the selected transaction
            const response1 = await fetch(`/transactions/${selectedTransactionId}`, {
                method: 'DELETE'
            });

            if (response1.ok) {
                // Remove the selected row from the table
                const selectedRow = document.querySelector(`tr[data-id="${selectedTransactionId}"]`);
                if (selectedRow) {
                    selectedRow.remove();
                }

                // Increment the transaction ID for the next one
                const nextTransactionId = selectedTransactionId + 1;
                
                // Now, delete the next transaction
                await fetch(`/transactions/${nextTransactionId}`, {
                    method: 'DELETE'
                });

                // Reset the selected transaction ID
                selectedTransactionId = null; // Clear the selected transaction ID
            }
        } catch (error) {
            console.error('Error:', error); // Only log errors in the console, no alert shown
        }
    } 
});



// State variable to track if TTS is enabled (Hover mouse to listen to text, zb)
let ttsEnabled = false;

// Function to trigger speech
function speakText(text) {
    if (ttsEnabled) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Create a new utterance and speak the text
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7; // Speed of speech (1 is normal speed)
        utterance.pitch = 0.7; // Pitch of speech (1 is normal pitch)

        // Speak the text
        speechSynthesis.speak(utterance);
    }
}

// Toggle the TTS state (on/off)
function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const statusText = document.getElementById('tts-status');
    const toggleButton = document.getElementById('toggle-tts');
    if (ttsEnabled) {
        statusText.innerHTML = '语音助读: <strong>开启</strong>';
    } else {
        statusText.innerHTML = '语音助读: <strong>关闭</strong>';
    }
}

// You can also trigger speech for dynamic content
window.onload = function () {
    // Welcome message will be spoken when the page loads if TTS is enabled
    if (ttsEnabled) {
        const welcomeMessage = document.getElementById('welcome-message');
        speakText(welcomeMessage.innerText); // Speak "Welcome, user" message
    }
};

function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("该浏览器不支持语音识别。");
    }
}

function announceAccountDetails(account, transactions) {
    if (ttsEnabled) {
        return; // Skip if TTS is enabled
    }

    narrate(`欢迎来到您的账户页面。以下是您的账户信息：`);

    const accountDetailsMessage = `用户名: ${account.user_name.toUpperCase()}. 
        银行名称: ${account.account_name}. 
        账户号码: ${account.account_number}. 
        您的余额: ${account.balance_have.toFixed(2)} SGD. 
        您的欠款: ${account.balance_owe.toFixed(2)} SGD.`;
    narrate(accountDetailsMessage);

    if (!ttsEnabled && transactions && transactions.length > 0) {
        narrate("以下是您最近的转账信息:");
        transactions.forEach((transaction, index) => {
            const transactionMessage = `转账 ${index + 1}: 日期: ${new Date(transaction.date).toLocaleDateString('zh-CN', { day: '2-digit', month: 'long', year: 'numeric' })}. 
                备注: ${transaction.description}. 
                余额: ${transaction.transactionAmount >= 0 ? '+' : '-'}${Math.abs(transaction.transactionAmount).toFixed(2)} SGD. 
                状态: ${transaction.status}.`;
            setTimeout(() => narrate(transactionMessage), (index + 1) * 4000);
        });
    } else {
        narrate("没有最近的交易。");
    }

    setTimeout(() => narrate("您想转账, 查看投资还是查看近期转账信息？"), (transactions.length + 1) * 4000);
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (ttsEnabled) return; // Skip if TTS is enabled

    if (!('webkitSpeechRecognition' in window)) {
        console.error("该浏览器不支持语音识别。");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.lang = 'zh-CN';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, ""); // Remove trailing period
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (!ttsEnabled && event.error !== 'no-speech') {
            narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易。");
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
    if (ttsEnabled) return; // Skip if TTS is enabled

    if (response.includes("转账")||response.includes("汇款")|| response.includes("汇")|| response.includes("转")|| response.includes("支付")) {
        window.location.href = "transferchi.html";
    } else if (response.includes("投资")||response.includes("查看投资")||response.includes("理财")||response.includes("股权")||response.includes("股票")) {
        window.location.href = "investmentchi.html";
    } else if (response.includes("账户")||response.includes("我的账户")||response.includes("账户信息")) {
        window.location.href = "accountschi.html";
    } else {
        narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易。");
    }
}

// Keyboard Navigation
document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === '1') {
        window.location.href = "../html/accountschi.html";
    }
    if (event.key === '2') {
        window.location.href = "../html/transferchi.html";
    }
    if (event.key === '3') {
        window.location.href = "../html/investmentchi.html";
    }
    if (event.key == 'e') {
        window.location.href = "../html/accountsdetails.html";
    }
    if (event.key === 'l') {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "loginchi.html";
        history.replaceState(null, null, "loginchi.html");
    }
});

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

document.addEventListener("DOMContentLoaded", function() {
    var shortcutList = document.getElementById("shortcut-list");
    var icon = document.getElementById("dropdown-icon");
    var keyboardNote = document.querySelector(".keyboard-note");

    // Show the list by default on page load
    shortcutList.style.display = "block";
    icon.classList.add("up");  // Initially show the downward arrow
    keyboardNote.style.maxHeight = "500px"; // Adjust to accommodate the expanded list
});

document.getElementById("keyboard-shortcut-header").addEventListener("click", function() {
    var shortcutList = document.getElementById("shortcut-list");
    var icon = document.getElementById("dropdown-icon");
    var keyboardNote = document.querySelector(".keyboard-note");

    // Toggle the visibility of the shortcut list with animation
    if (shortcutList.classList.contains("collapsed")) {
        shortcutList.classList.remove("collapsed");
        icon.classList.add("up");
        keyboardNote.style.maxHeight = "500px"; // Adjust based on content
    } else {
        shortcutList.classList.add("collapsed");
        icon.classList.remove("up");
        keyboardNote.style.maxHeight = "50px"; // Collapse back
    }
});