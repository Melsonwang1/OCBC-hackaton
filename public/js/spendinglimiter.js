document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.querySelector("button");
    const categories = ["food", "fashion", "groceries", "entertainment", "transport"];
    
    function updateSliderValue(sliderId, displayId) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        display.textContent = `$${slider.value}`;
    }
    
    saveButton.addEventListener("click", function () {
        const spendingLimits = {};
        
        categories.forEach(category => {
            const slider = document.getElementById(`${category}-slider`);
            spendingLimits[category] = parseInt(slider.value);
        });
        
        fetch("/api/spending-limits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(spendingLimits)
        })
        .then(response => response.json())
        .then(data => {
            alert("Spending limits saved successfully!");
        })
        .catch(error => console.error("Error saving limits:", error));
    });
    
    categories.forEach(category => {
        const slider = document.getElementById(`${category}-slider`);
        slider.addEventListener("input", function () {
            updateSliderValue(`${category}-slider`, `${category}-limit`);
        });
    });
});
