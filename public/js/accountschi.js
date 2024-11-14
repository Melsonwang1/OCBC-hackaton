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

document.addEventListener('DOMContentLoaded', async function () {
    var user = {}; // The current user
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // Check both storages for token

    // Step 1: Check if token is present on page load
    if (!token) {
        alert("请您重新登录以继续");
        window.location.href = "loginchi.html"; // Redirect to login page
        return; // Stop execution
    }

    // Fetch and verify user data
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
    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("token"); // Properly remove the token
        window.location.href = "loginchi.html";
        history.replaceState(null, null, "loginchi.html");
    });

    // Wait for user data to load before fetching bank accounts
    await getUserData();

    // Only call fetchBankAccounts after user data is available
    if (user && user.user_id) {
        await fetchBankAccounts(user.user_id);
    } else {
        console.log('错误账号');
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
        console.error('无法获取银行账户:', error);
        alert('没有银行账户资料'); // Alert the user if no bank accounts are found
    }
}


// Function to narrate bank account details using the Web Speech API
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

// Announce the account details dynamically
function announceAccountDetails(accounts) {
    if (ttsEnabled) return;  // If TTS is enabled, don't announce account details (zb)
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
    if (ttsEnabled) return;  // If TTS is enabled, don't start navigation listenin (zb)

    if (!('webkitSpeechRecognition' in window)) {
        console.error("该浏览器不支持语音识别");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.lang = 'zh-CN';

    recognition.onresult = function (event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, ""); // Remove trailing period
        console.log("User said: " + transcript);  // Log what the user said
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function (event) {
        if (event.error !== 'no-speech') {
            narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易记录。");
        }
    };

    // Restart listening when speech ends
    recognition.onend = function () {
        recognition.start();
    };

    recognition.start();
}

// Handle the user's response to navigation prompt
function handleUserResponse(response) {
    if (ttsEnabled) return; // Exit early if TTS is enabled (zb)
    if (response.includes("转账") || response.includes("汇款") || response.includes("汇") || response.includes("转") || response.includes("支付")) {
        window.location.href = "transferchi.html";
    } else if (response.includes("投资") || response.includes("查看投资") || response.includes("理财") || response.includes("股权") || response.includes("股票")) {
        window.location.href = "investmentchi.html";
    } else if (response.includes("账户") || response.includes("我的账户") || response.includes("账户信息")) {
        window.location.href = "accountschi.html";
    } else {
        narrate("抱歉，我没有听清楚。请说转账、查看投资或查看交易。");
    }

}

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

// Display account cards and set up narration and listening
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


        // Add text-to-speech functionality on mouse hover only if TTS is enabled
        accountCard.onmouseover = function () {
            if (ttsEnabled) {
                const accountDetails = `点击查看 ${account.account_name}, 账号为 ${account.account_number}. 您的余额是SGD ${account.balance_have.toFixed(2)}.`;
                speakText(accountDetails); // Use speakText function to narrate account details
            }
        };
    });

    // Only announce account details and start navigation listening if TTS is NOT enabled
    if (!ttsEnabled) {
        announceAccountDetails(accounts);
        startListeningForNavigation();
    }
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

document.addEventListener('DOMContentLoaded', function () {
    // Find the account list and account cards
    const accountsList = document.getElementById('accounts-list');
    // Sample accounts (You can replace this with dynamically loaded data)
    const accounts = [];
    // Function to create account card elements
    function createAccountCards() {
        accounts.forEach(account => {
            const accountCard = document.createElement('button');
            accountCard.classList.add('account-card');
            accountCard.setAttribute('aria-label', account.name);
            accountCard.setAttribute('tabindex', '0'); // Makes it focusable with Tab
            accountCard.innerText = account.name;
            accountCard.addEventListener('click', () => {
                alert(`Viewing details of: ${account.name}`);
                // You can add logic to open the account details page here.
            });
            accountsList.appendChild(accountCard);
        });
    }
    // Call function to create account cards
    createAccountCards();
    // Handle Tab navigation only within account selection
    document.addEventListener('keydown', function (event) {
        // Only process Tab key (Forward or Shift + Tab for backward)
        if (event.key === 'Tab') {
            const focusableElements = Array.from(accountsList.querySelectorAll('.account-card'));
            const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
            if (event.shiftKey) {
                // If Shift + Tab, go backward
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                focusableElements[prevIndex].focus();
                event.preventDefault(); // Prevent default tabbing behavior
            } else {
                // If Tab (forward), go forward
                const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                focusableElements[nextIndex].focus();
                event.preventDefault(); // Prevent default tabbing behavior
            }
        }
    });
});

// Event listener for keydown event
document.addEventListener('keydown', function (event) {
    // Check if the left or right arrow key is pressed
    if (event.key === 'ArrowLeft') {
        // Go to the previous page (like undo)
        window.history.back();
    } else if (event.key === 'ArrowRight') {
        // Go to the next page (like redo)
        window.history.forward();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    var shortcutList = document.getElementById("shortcut-list");
    var icon = document.getElementById("dropdown-icon");
    var keyboardNote = document.querySelector(".keyboard-note");

    // Show the list by default on page load
    shortcutList.style.display = "block";
    icon.classList.add("up");  // Initially show the downward arrow
    keyboardNote.style.maxHeight = "500px"; // Adjust to accommodate the expanded list
});

document.getElementById("keyboard-shortcut-header").addEventListener("click", function () {
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