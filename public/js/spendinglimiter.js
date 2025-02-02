document.addEventListener('DOMContentLoaded', function () {
  const sliders = document.querySelectorAll('input[type="range"]');
  const saveButton = document.getElementById('save-button'); // Use the button's ID
  const userPhone = '88696555'; // TODO: Replace with actual user phone dynamically
  const userId = 'T0673139I'; // TODO: Replace with actual user ID


  const limits = { 
    food: 1000, 
    fashion: 500, 
    groceries: 600, 
    entertainment: 400, 
    transport: 200 
};

fetch('http://127.0.0.1:3000/api/save-limits', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: userPhone, limits }) 
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));


  function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const limitId = sliderId.replace('-slider', '-limit');
    document.getElementById(limitId).innerText = '$' + slider.value;
  }  
  // Attach function to window to make it accessible in HTML
  window.updateSliderValue = updateSliderValue;

  // Update slider values dynamically
  sliders.forEach(slider => {
    slider.addEventListener('input', function () {
      const limitId = this.id.replace('-slider', '-limit');
      document.getElementById(limitId).innerText = '$' + this.value;
    });
  });

  // Save button click event
  saveButton.addEventListener('click', async function () {
    const categories = ['food', 'fashion', 'groceries', 'entertainment', 'transport'];
    const limits = {};

    // Get the current slider values
    categories.forEach(category => {
      limits[category] = document.getElementById(`${category}-slider`).value;
    });

    try {
      const response = await fetch('/api/save-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, limits }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.message === 'Limits saved successfully.') {
        alert('Limits saved successfully!');

        // Send SMS confirmation
        const smsMessage = `Your spending limits have been updated: 
          Food: $${limits.food}, 
          Fashion: $${limits.fashion}, 
          Groceries: $${limits.groceries}, 
          Entertainment: $${limits.entertainment}, 
          Transport: $${limits.transport}.`;

        await sendSMS(userId, smsMessage);
      } else {
        alert('Failed to save limits.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save limits.');
    }
  });

  // Send SMS using Twilio
  async function sendSMS(userId, message) {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('SMS sent:', data);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  // Simulate a transaction (for demo)
  async function simulateTransaction() {
    const category = document.getElementById('demo-category').value;
    const amountSpent = parseFloat(document.getElementById('demo-amount').value);

    if (!category || isNaN(amountSpent)) {
      alert('Please select a category and enter a valid amount.');
      return;
    }

    try {
      const response = await fetch('/api/handle-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, category, amountSpent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const smsSection = document.getElementById('sms-section');

      if (data.excessAmount) {
        smsSection.innerHTML = `
          <p>SMS: Exceeded ${category} limit by $${data.excessAmount}. Do you want to extend the limit and make the transaction now? Reply 'YES' or 'NO'.</p>
        `;

        const userResponse = prompt(
          `Exceeded limit by $${data.excessAmount}. Do you want to extend the limit and make the transaction now? Reply 'YES' or 'NO'`
        );

        if (userResponse.toUpperCase() === 'YES') {
          await fetch('/api/extend-limit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: userPhone, category, excessAmount: data.excessAmount }),
          });
          smsSection.innerHTML += `<p>SMS: Limit extended and transaction completed.</p>`;
        } else {
          smsSection.innerHTML += `<p>SMS: Transaction declined. Please adjust your purchase.</p>`;
        }
      } else {
        smsSection.innerHTML = `<p>SMS: Transaction successful.</p>`;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process transaction.');
    }
  }

  // Demo section: Simulate transaction button
  document.getElementById('demo-button').addEventListener('click', simulateTransaction);
});