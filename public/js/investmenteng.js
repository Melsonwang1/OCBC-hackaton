const account_id = 1;

document.addEventListener("DOMContentLoaded", async () => {
    let token = localStorage.getItem("token");

    try {
        const userResponse = await fetch(`/user/1`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.message || "Failed to fetch user data");
        }

        const user = await userResponse.json();
        document.getElementById("user-name").innerText = user.account.name.toUpperCase();
    } catch (error) {
        console.error("Error fetching account data:", error);
    }
});

async function fetchAndPlotData(range = "ALL") {
    try {
        const response = await fetch(`/investments/growth/${account_id}`);
        if (!response.ok) throw new Error("Failed to fetch investment growth data");

        const data = await response.json();
        console.log(data);

        // Adjust the starting value to 100 instead of zero
        const initialInvestment = 100;
        const labels = data.map(item => new Date(item.period_start));
        const values = data.map((item, index) => index === 0 ? initialInvestment : initialInvestment + item.profit_loss);

        const filteredData = filterDataByRange({ labels, values }, range);

        investmentChart.data.labels = filteredData.labels;
        investmentChart.data.datasets[0].data = filteredData.values;
        investmentChart.update();

        // Announce each point on the chart
        announceInvestmentGrowth(filteredData);
    } catch (error) {
        console.error("Error fetching or updating chart data:", error);
    }
}

function filterDataByRange(data, range) {
    const { labels, values } = data;
    const today = new Date();
    let startIndex;

    switch (range) {
        case "3M":
            startIndex = labels.length - 3;
            break;
        case "6M":
            startIndex = labels.length - 6;
            break;
        case "YTD":
            startIndex = labels.findIndex(date => date.startsWith(today.getFullYear()));
            break;
        case "2Y":
            startIndex = labels.length - 24;
            break;
        case "ALL":
        default:
            return data;
    }
    startIndex = Math.max(0, startIndex);
    return { labels: labels.slice(startIndex), values: values.slice(startIndex) };
}

const ctx = document.getElementById("investmentChart").getContext("2d");
const investmentChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Investment Growth",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            x: { type: "time", time: { unit: "month" } },
            y: { beginAtZero: true }
        }
    }
});

document.querySelectorAll("#range-buttons button").forEach(button => {
    button.addEventListener("click", () => {
        const range = button.textContent;
        fetchAndPlotData(range);
    });
});

function toggleDropdown(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

fetchAndPlotData("ALL");

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

    narrate("Would you like to go to Transfer Money, Check Investments, or View Transactions?");
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
            narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
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
    } else if (response.includes("investments") || response.includes("investment") || response.includes("investing") || response.includes("invest")) {
        window.location.href = "investmenteng.html";
    } else if (response.includes("account") || response.includes("accounts")) {
        window.location.href = "accountseng.html";
    } else {
        narrate("Sorry, I didn't understand that. Please say Transfer Money, Check Investments, or View Transactions.");
    }
}
