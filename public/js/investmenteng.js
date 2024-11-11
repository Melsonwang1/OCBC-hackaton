document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // The current user
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // Get token from local storage

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

            let user_id = user.user_id;
            console.log(user_id);
            await fetchAndPlotData(user_id);
        } catch (error) {
            console.log('Error in getUserData:', error.message);
            // Step 2: Handle invalid or expired token
            if (error.message === 'Forbidden: Invalid or expired token') {
                alert("Times out. Please login again!");
                localStorage.setItem("token", null); // Properly remove token from local storage
                sessionStorage.removeItem("token"); // Remove token from session storage
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
        // Step 3: Clear token on logout
        localStorage.removeItem("token");
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    });

    await getUserData();
});

async function fetchAndPlotData(user_id) {
    try {
        const response = await fetch(`/investments/growth/${user_id}`);
        if (!response.ok) throw new Error("Failed to fetch investment growth data");

        const data = await response.json();
        console.log(data);

        // Check if data array is empty
        if (data.length === 0) {
            alert("No investment growth data found for this account.");
            return; // Exit the function if there's no data
        }

        // Initialize starting investment value
        const initialInvestment = 100;
        const labels = data.map(item => new Date(item.period_start));
        const values = data.map((item, index) => 
            index === 0 ? initialInvestment : initialInvestment + item.profit_loss
        );

        const barColors = values.map(value => 
            value < initialInvestment ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)'
        );

        investmentChart.data.labels = labels;
        investmentChart.data.datasets[0].data = values;
        investmentChart.data.datasets[0].backgroundColor = barColors;
        investmentChart.update();

        // Announce each point on the chart
        announceInvestmentGrowth(values);
        startListeningForNavigation();
    } catch (error) {
        console.error("Error fetching or updating chart data:", error);
    }
}

const ctx = document.getElementById("investmentChart").getContext("2d");
const investmentChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [],
        datasets: [{
            label: "Investment Growth",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        },
        {
            label: "Investment Shrink",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1
        }
    ]
    },
    options: {
        scales: {
            x: { type: "time", time: { unit: "month" } },
            y: { beginAtZero: true }
        }
    }
});

function toggleDropdown(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
        case "1":
            window.location.href = "../html/accountseng.html";
            break;
        case "2":
            window.location.href = "../html/transfer.html";
            break;
        case "3":
            window.location.href = "../html/investmenteng.html";
            break;
        case "c":
            window.location.href = "../html/accountschi.html";
            break;
        case "l":
            window.location.href = "logineng.html";
            break;
    }
});

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

function announceInvestmentGrowth(data) {
    narrate("Welcome to your investments page.");

    if (data.labels && data.labels.length > 0) {
        data.labels.forEach((label, index) => {
            const day = label.getDate();
            const month = label.toLocaleDateString('en-US', { month: 'long' });
            const year = label.getFullYear();
            const date = `${day} ${month} ${year}`;

            const value = data.values[index];
            const valueText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);  // Format without decimals if whole number

            let message = `On ${date}, your investment was ${valueText} SGD`;

            // Announce growth only from the second data point onwards
            if (index > 0) {
                const previousValue = data.values[index - 1];
                const growthAmount = value - previousValue;
                const growthPercentage = ((growthAmount / previousValue) * 100).toFixed(2);
                const growthAmountText = growthAmount % 1 === 0 ? growthAmount.toFixed(0) : growthAmount.toFixed(2);

                message += `, which is a change of ${growthAmountText} SGD, or ${growthPercentage}% from the previous point.`;
            }

            narrate(message);
        });
    } else {
        narrate("No investment data is available.");
    }

    narrate("Would you like to go to Transfer Money, check accounts, or View Transactions?");
}

// Initialize speech recognition and listen for navigation commands indefinitely
function startListeningForNavigation() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Speech Recognition is not supported in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, "");
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            narrate("Sorry, I didn't understand that. Please say Transfer Money, Check accounts, or View Transactions.");
        }
    };

    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

// Handle the user's response to navigation prompt
function handleUserResponse(response) {
    if (response.includes("transfer") || response.includes("sending") || response.includes("send") || response.includes("transfers") || response.includes("transferring")) {
        window.location.href = "transfer.html";
    } else if (response.includes("transaction") || response.includes("transactions") || response.includes("transacting")) {
        window.location.href = "accountsdetails.html";
    } else if (response.includes("account") || response.includes("accounts")) {
        window.location.href = "accountseng.html";
    } else {
        narrate("Sorry, I didn't understand that. Please say Transfer Money, Check accounts, or View Transactions");
    }
}

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
    document.addEventListener('keydown', function(event) {
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

