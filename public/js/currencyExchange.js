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
        utterance.lang = 'en-US';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error("Speech Synthesis is not supported in this browser.");
    }
}

const API_KEY = 'f43af5f8d5a7ebfff4be7f57'; // Replace with your actual API key 
const BASE_CURRENCY = 'SGD'; // Default currency to convert from (SGD in your case)
let selectedCurrency = 'USD'; // Default selected currency

// Fetch exchange rate data from the API
async function fetchExchangeRate() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);
        const data = await response.json();

        if (!data || !data.rates) {
            throw new Error('Unable to fetch exchange rates.');
        }

        // Store the rates for future use
        return data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

// Fetch historical exchange rates and populate the chart
async function fetchHistoricalData() {
    try {
        // Fetch data for the selected currency
        const rates = await fetchExchangeRate();

        // Prepare data for the chart
        const labels = []; // Array for dates
        const dataPoints = []; // Array for exchange rates

        // Assuming we have the historical data available (you might need to adjust based on your API)
        const historicalData = [
            { date: '2025-01-15', rate: rates[selectedCurrency] },
            { date: '2025-01-14', rate: rates[selectedCurrency] * 0.99 },
            { date: '2025-01-13', rate: rates[selectedCurrency] * 1.01 },
            // Add more historical data here...
        ];

        // Populate the labels and dataPoints arrays
        historicalData.forEach((data) => {
            labels.push(data.date);
            dataPoints.push(data.rate);
        });

        // Update the chart
        updateChart(labels, dataPoints);
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}

// Function to update the chart with new data
function updateChart(labels, dataPoints) {
    const ctx = document.getElementById('exchangeRateGraph').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Exchange Rate (${selectedCurrency})`,
                data: dataPoints,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'll',
                    },
                },
                y: {
                    beginAtZero: false,
                }
            }
        }
    });
}

// Convert the entered currency amount
function convertCurrency() {
    const amount = document.getElementById('amount').value;

    fetchExchangeRate().then(rates => {
        const exchangeRate = rates[selectedCurrency];
        const convertedAmount = (amount * exchangeRate).toFixed(2);
        document.getElementById('convertedAmount').innerText = convertedAmount;
        document.getElementById('exchangeRate').innerText = `1 SGD = ${exchangeRate.toFixed(4)} ${selectedCurrency}`;
    });
}

// Update the graph with current values
function updateGraph() {
    fetchHistoricalData();
}

// Toggle the visibility of the dropdown content
function toggleDropdown() {
    const dropdownContent = document.getElementById("currency-dropdown");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

// Add an event listener to close the dropdown if clicked outside
document.addEventListener('click', function(event) {
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.getElementById("currency-dropdown");
    if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.style.display = "none";
    }
});

// Set selected currency and close dropdown
function selectCurrency(event) {
    event.preventDefault(); // Prevent the default action (scrolling to top)

    selectedCurrency = event.target.dataset.value;
    document.querySelector(".dropdown-btn").textContent = `${selectedCurrency} - ${event.target.textContent}`;
    document.getElementById("currency-dropdown").style.display = "none";

    // Call convertCurrency to update the conversion
    convertCurrency();
}

// Add event listeners to each currency option
const currencyOptions = document.querySelectorAll("#currency-dropdown a");
currencyOptions.forEach(option => {
    option.addEventListener("click", selectCurrency);
});

// Initialize by fetching exchange rate data and updating the graph
document.addEventListener('DOMContentLoaded', () => {
    updateGraph();
});

// Listen for changes to amount input and convert when the user decides
document.getElementById('amount').addEventListener('input', convertCurrency);



