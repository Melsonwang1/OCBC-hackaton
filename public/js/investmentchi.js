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
        window.location.href = "loginchi.html";
        history.replaceState(null, null, "loginchi.html");
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
        announceInvestmentGrowth(labels, values);
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
            label: "投资增长",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        },
        {
            label: "投资减少",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1
        }
    ]
    },
    options: {
        scales: {
            x: { type: "time",
                 time: { 
                    unit: "month" },
                },
                locale: 'zh-CN'
            },
            y: { beginAtZero: true }
        }
    }
);

function toggleDropdown(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === "block" ? "none" : "block";
}

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
        case "e":
            window.location.href = "../html/accountseng.html";
            break;
        case "l":
            window.location.href = "loginchi.html";
            break;
    }
});

function narrate(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("该浏览器不支持语音合成。");
    }
}

function announceInvestmentGrowth(labels, values) {
    narrate("欢迎来到您的投资页面。");

    if (labels && labels.length > 0) {
        labels.forEach((label, index) => {
            const day = label.getDate();
            const month = label.toLocaleDateString('zh-CN', { month: 'long' });
            const year = label.getFullYear();
            const date = `${year}年${month}${day}日`;

            const value = values[index];
            const valueText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);

            let message = `在${date}，您的投资为${valueText}新加坡元`;

            if (index > 0) {
                const previousValue = values[index - 1];
                const growthAmount = value - previousValue;
                const growthPercentage = ((growthAmount / previousValue) * 100).toFixed(2);
                const growthAmountText = growthAmount % 1 === 0 ? growthAmount.toFixed(0) : growthAmount.toFixed(2);

                message += `，较前一个数据点变化为${growthAmountText}新加坡元，增长率为${growthPercentage}%。`;
            }

            narrate(message);
        });
    } else {
        narrate("没有可用的投资数据。");
    }

    narrate("您想转账、查看账户，还是查看交易记录？");
}

function startListeningForNavigation() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error("该浏览器不支持语音识别。");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().replace(/\.$/, "");
        handleUserResponse(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            narrate("抱歉，我没听清楚。请说转账、查看账户，或查看交易记录。");
        }
    };

    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

function handleUserResponse(response) {
    if (response.includes("转账") || response.includes("发送") || response.includes("发") || response.includes("转账") || response.includes("转移")) {
        window.location.href = "transferchi.html";
    } else if (response.includes("交易") || response.includes("交易记录") || response.includes("进行交易")) {
        window.location.href = "accountsdetailschi.html";
    } else if (response.includes("账户") || response.includes("查看账户")) {
        window.location.href = "accountsengchi.html";
    } else {
        narrate("抱歉，我没听清楚。请说转账、查看账户，或查看交易记录。");
    }
}
