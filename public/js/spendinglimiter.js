document.addEventListener('DOMContentLoaded', function () {
    const sliders = document.querySelectorAll('input[type="range"]');
    const saveButton = document.querySelector('button');
  
    // Update slider values dynamically
    sliders.forEach(slider => {
      slider.addEventListener('input', function () {
        const limitId = this.id.replace('-slider', '-limit');
        document.getElementById(limitId).innerText = '$' + this.value;
      });
    });
  
    // Save button click event
    saveButton.addEventListener('click', async function () {
      const userPhone = '88696555'; // Replace with actual user phone number
      const categories = ['food', 'fashion', 'groceries', 'entertainment', 'transport'];
  
      for (const category of categories) {
        const newLimit = document.getElementById(`${category}-slider`).value;
        await saveLimit(userPhone, category, newLimit);
      }
  
      alert('Limits saved successfully!');
    });
  
    // Function to save limits via API
    async function saveLimit(phone, category, newLimit) {
      try {
        const response = await fetch('/api/save-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, category, newLimit }),
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  
    // Simulate a transaction (for testing)
    async function simulateTransaction() {
      const userPhone = '88696555'; // Replace with actual user phone number
      const category = 'groceries';
      const amountSpent = 120;
  
      const response = await fetch('/api/handle-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, category, amountSpent }),
      });
      const data = await response.json();
      console.log(data);
  
      if (data.excessAmount) {
        const userResponse = prompt(
          `Exceeded limit by $${data.excessAmount}. Do you want to extend the limit? Reply 'YES' or 'NO'`
        );
        await handleUserResponse(userPhone, category, userResponse, data.excessAmount);
      }
    }
  
    // Handle user response to SMS
    async function handleUserResponse(phone, category, userResponse, excessAmount) {
      try {
        const response = await fetch('/api/handle-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, category, userResponse, excessAmount }),
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  
    // Uncomment to simulate a transaction (for testing)
    // simulateTransaction();
  });