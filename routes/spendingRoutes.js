const express = require('express');
const spendingController = require('../controllers/spendingController'); // Use "../" to go up a level
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
const router = express.Router();

module.exports = router;


// Define API endpoints
app.post('/api/save-limits', spendingController.saveLimits);
app.post('/api/handle-transaction', spendingController.handleTransaction);
app.post('/api/extend-limit', spendingController.extendLimit);
app.post('/api/send-sms', spendingController.sendSMS);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

router.post('/save-limits', spendingController.saveLimits); // This should match the frontend request
router.post('/handle-transaction', spendingController.handleTransaction); // This should match the frontend request
router.post('/extend-limit', spendingController.extendLimit); // This should match the frontend request
router.post('/send-sms', spendingController.sendSMS); // This should match the frontend request

module.exports = router;