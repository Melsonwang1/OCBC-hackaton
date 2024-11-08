// Full dataset for "All-time"
const allTimeData = {
    labels: [
        "2022-01-01", "2022-02-01", "2022-03-01", "2022-04-01",
        "2022-05-01", "2022-06-01", "2022-07-01", "2022-08-01",
        "2022-09-01", "2022-10-01", "2022-11-01", "2022-12-01",
        "2023-01-01", "2023-02-01", "2023-03-01", "2023-04-01",
        "2023-05-01", "2023-06-01", "2023-07-01", "2023-08-01",
        "2023-09-01", "2023-10-01", "2023-11-01", "2023-12-01",
        "2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01",
        "2024-05-01", "2024-06-01", "2024-07-01", "2024-08-01",
        "2024-09-01", "2024-10-01", "2024-11-01", "2024-12-01"
    ],
    values: [
        100.00, 101.50, 103.00, 102.50, 104.00, 106.00,
        107.50, 109.00, 108.00, 110.50, 112.00, 115.00,
        117.50, 119.00, 121.00, 120.50, 122.50, 125.00,
        126.50, 128.00, 130.00, 132.50, 134.00, 136.50,
        138.00, 140.00, 142.50, 145.00, 146.50, 148.00,
        150.50, 152.00, 153.50, 155.00, 157.50, 160.00
    ]
};

// Function to get filtered data based on the selected range
function getFilteredData(range) {
    const today = new Date();
    const labels = [...allTimeData.labels];
    const values = [...allTimeData.values];
    
    // Calculate the start index for each range
    let startIndex;
    switch (range) {
        case '3M':
            startIndex = labels.length - 3; // Last 3 months
            break;
        case '6M':
            startIndex = labels.length - 6; // Last 6 months
            break;
        case 'YTD':
            startIndex = labels.findIndex(date => date.startsWith(today.getFullYear())); // From beginning of this year
            break;
        case '2Y':
            startIndex = labels.length - 24; // Last 24 months (2 years)
            break;
        case 'ALL':
        default:
            return { labels, values }; // Full data
    }

    // Ensure startIndex is not out of range
    startIndex = Math.max(0, startIndex);

    return {
        labels: labels.slice(startIndex),
        values: values.slice(startIndex)
    };
}

// Function to update the chart based on selected range
function updateChart(range) {
    const filteredData = getFilteredData(range);
    
    // Update the data in the chart
    investmentChart.data.labels = filteredData.labels;
    investmentChart.data.datasets[0].data = filteredData.values;
    investmentChart.update();
}

// Initial chart rendering with "All-time" data
const ctx = document.getElementById('investmentChart').getContext('2d');
const investmentChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: allTimeData.labels,
        datasets: [{
            label: "Investment Value (SGD)",
            data: allTimeData.values,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Investment Value (SGD)'
                }
            }
        }
    }
});
function toggleDropdown(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}