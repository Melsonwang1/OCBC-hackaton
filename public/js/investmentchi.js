document.addEventListener('DOMContentLoaded', async function () {
    var user = {}; // The current user
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // Get token from local storage

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

            let user_id = user.user_id;
            console.log(user_id);
            await fetchAndPlotData(user_id);
        } catch (error) {
            console.log('Error in getUserData:', error.message);
            // Step 2: Handle invalid or expired token
            if (error.message === 'Forbidden: Invalid or expired token') {
                alert("请您重新登录以继续!");
                localStorage.setItem("token", null); // Properly remove token from local storage
                sessionStorage.removeItem("token"); // Remove token from session storage
                window.location.href = "logineng.html"; // Redirect to login
            } else if (error.message === 'Unauthorized') {
                alert("请先登录!");
                window.location.href = "logineng.html"; // Redirect to login
            } else {
                console.error('出现错误:', error);
            }
        }
    }

    // Log Out Button functionality
    document.getElementById("logout-btn").addEventListener("click", function () {
        // Step 3: Clear token on logout
        localStorage.removeItem("token");
        window.location.href = "loginchi.html";
        history.replaceState(null, null, "loginchi.html");
    });

    await getUserData();
});

async function fetchAndPlotData(user_id) {
    try {
        const response = await fetch(`/investments/growth/${user_id}`);
        if (!response.ok) throw new Error("无法取得投资图表");

        const data = await response.json();
        console.log(data);

        // Check if data array is empty
        if (data.length === 0) {
            alert("此账户无任何投资资料.");
            return; // Exit the function if there's no data
        }

        const labels = data.map(item => new Date(item.period_start));
        const amounts = data.map(item => item.amount);
        const profits = data.map(item => item.profit_loss);

        investmentChart.data.labels = labels;
        investmentChart.data.datasets[0].data = amounts;
        investmentChart.data.datasets[1].data = profits;
        investmentChart.update();

        if (!ttsEnabled) {
            announceInvestmentGrowth(labels, amounts.map((amount, i) => amount + profits[i]));
            startListeningForNavigation();
        }

    } catch (error) {
        console.error("出现错误:", error);
    }
}

const ctx = document.getElementById("investmentChart").getContext("2d");
const investmentChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [],
        datasets: [{
            label: "投资",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        },
        {
            label: "投资的增长",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        }
        ]
    },
    options: {
        scales: {
            x: { 
                stacked: true, // Enable stacking on the x-axis
                type: "time", 
                time: { unit: "month" } 
            },
            y: { 
                beginAtZero: true, 
                stacked: true // Enable stacking on the y-axis as well
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        const total = context.chart.data.datasets.reduce((sum, dataset, index) => {
                            return sum + (context.datasetIndex === index ? 0 : dataset.data[context.dataIndex]);
                        }, value);
                        return `${label}: $${value} (Total: $${total})`;
                    }
                }
            }
        }
    }
});

function toggleDropdown(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

// Function to handle navigation to account details
function navigateToAccountDetails(accountId) {
    window.location.href = `accountdetailschi.html?accountId=${accountId + 2}`;
}

// Function to make dropdown items clickable
function enableDropdownNavigation() {
    // Get all dropdown items
    const dropdownItems = document.querySelectorAll("#fixedDeposit .card");

    dropdownItems.forEach((item, index) => {
        // Assuming each card corresponds to a specific account ID
        const accountId = index + 1; // Update this based on actual account IDs
        item.onclick = () => navigateToAccountDetails(accountId);
    });
}

// Call the function after the dropdown content is loaded
enableDropdownNavigation();

document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
        case "1":
            window.location.href = "../html/accountschi.html";
            break;
        case "2":
            window.location.href = "../html/transferchi.html";
            break;
        case "3":
            window.location.href = "../html/investmentchi.html";
            break;
        case "c":
            window.location.href = "../html/accountschi.html";
            break;
        case "l":
            window.location.href = "loginchi.html";
            break;
    }
});

let currentFontSize = 25; // Default font size for tracking changes only

function changeFontSize(sizeChange) {
    currentFontSize += sizeChange;

    // Apply font size change to elements inside .container and .content
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });

    document.querySelectorAll('.content, .content *').forEach(element => {
        element.style.fontSize = `${currentFontSize}px`;
    });
}

function resetFontSize() {
    // Reset font size by removing inline styles
    document.querySelectorAll('.container, .container *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    document.querySelectorAll('.content, .content *').forEach(element => {
        element.style.fontSize = ''; // Clear inline style to revert to CSS default
    });

    currentFontSize = 25;
}

function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("该浏览器不支持语音合成");
    }
}

function announceInvestmentGrowth(labels, values) {
    if (ttsEnabled) return; // Exit early if TTS is enabled (zb)

    narrate("欢迎来到您的投资页面。");

    if (labels && labels.length > 0) {
        labels.forEach((label, index) => {
            const day = label.getDate();
            const month = label.toLocaleDateString('zh-CN', { month: 'long' });
            const year = label.getFullYear();
            const date = `${year}年${month}${day}日`;

            const value = values[index];
            const valueText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);  // Format without decimals if whole number

            let message = `在${date}，您的投资为${valueText}新币`;

            // Announce growth only from the second data point onwards
            if (index > 0) {
                const previousValue = values[index - 1];
                const growthAmount = value - previousValue;
                const growthPercentage = ((growthAmount / previousValue) * 100).toFixed(2);
                const growthAmountText = growthAmount % 1 === 0 ? growthAmount.toFixed(0) : growthAmount.toFixed(2);

                message += `, 比较前一个数据点变化为${growthAmountText}新币, 增长率为${growthPercentage}%。`;
            }

            narrate(message);
        });
    } else {
        narrate("没有可用的投资数据。");
    }

    narrate("您想转账、查看账户，还是查看交易记录？");
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (ttsEnabled) return; // Exit early if TTS is enabled (zb)

    if (!('webkitSpeechRecognition' in window)) {
        console.error("该浏览器不支持语音识别。");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = function (event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, "");
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (!ttsEnabled && event.error !== 'no-speech') {
            narrate("抱歉，我没听清楚。请说转账、查看账户，或查看交易记录。");
        }
    };

    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

// Handle the user's response to navigation prompt
function handleUserResponse(response) {
    if (ttsEnabled) return; // Exit early if TTS is enabled (zb)

    if (response.includes("transfer") || response.includes("sending") || response.includes("send") || response.includes("transfers") || response.includes("transferring")) {
        window.location.href = "transfer.html";
    } else if (response.includes("transaction") || response.includes("transactions") || response.includes("transacting")) {
        window.location.href = "accountsdetails.html";
    } else if (response.includes("account") || response.includes("accounts")) {
        window.location.href = "accountseng.html";
    } else {
        narrate("抱歉，我没听清楚。请说转账、查看账户，或查看交易记录。");
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
                alert(`您正在查看: ${account.name}`);
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