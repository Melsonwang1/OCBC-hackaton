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
        startListeningForNavigation();
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

function announceInvestmentGrowth(data) {
    narrate("欢迎来到您的投资页面。");

    if (data.labels && data.labels.length > 0) {
        data.labels.forEach((label, index) => {
            const day = label.getDate();
            const month = label.toLocaleDateString('zh-CN', { month: 'long' });
            const year = label.getFullYear();
            const date = `${year}年${month}${day}日`;

            const value = data.values[index];
            const valueText = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);

            let message = `在${date}，您的投资为${valueText}新加坡元`;

            if (index > 0) {
                const previousValue = data.values[index - 1];
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
