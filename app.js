const express = require("express");
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const authorize = require("./middlewares/authorize"); // Middleware Authorization for JWT (Zheng Bin)

// Routes
const reminderRoutes = require("./routes/reminderRoutes"); // Reminder (Zhizhong)

// Middlewares
const validateTransactions = require("./middlewares/validateTransactions"); // Transaction Page (Melson)

// Controllers
const transactionsController = require("./controllers/transactionsController"); // Transaction Page (Melson)
const accountController = require("./controllers/accountController"); // Account Page (Zheng Bin)
const userController = require("./controllers/userController"); // User Page (Zheng Bin)
const investmentController = require("./controllers/investmentController"); // Investment Page (Zhe Kai)
const forumController = require("./controllers/forumController"); // Forum page (Zhe Kai)
const replyController = require("./controllers/replyController"); // Forum page (Zhe Kai)
const spendingController = require("./controllers/spendingController"); // Spending over Limit (Vaish)
const spendingRoutes = require('./routes/spendingRoutes'); // Spending over Limit (Vaish)


const app = express();
const port = 3000;
const staticMiddleware = express.static(path.join(__dirname, "public"));

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware);

// Login Page (Zheng Bin)
app.post("/user/register", userController.createUser);
app.post("/user/login", userController.loginUser);

// Transaction Page (Melson)
app.get("/transactions/:account_id", transactionsController.getTransactionsbyaccountid);
app.post("/transactions", validateTransactions, transactionsController.createTransaction);
app.delete("/transactions/:transaction_id", transactionsController.deleteTransactionByTransactionId); // Part of Zheng Bin's Feature

// Account Page (Zheng Bin)
app.get("/accounts/user/:user_id", accountController.getAccountsById);
app.get("/accounts/account/:account_id", accountController.getAccountByAccountId);
app.get("/accounts/accountnameandnumber/:account_id", accountController.getAccountnameandnumberByAccountId);

// User Page (Zheng Bin)
app.get("/users", authorize, userController.getUserById);
app.get("/user", userController.getUserByPhoneorNric);

// Investment Page (Zhe Kai)
app.get("/investments/:user_id", investmentController.getInvestmentsByUserId);
app.get("/investments/growth/:user_id", investmentController.getInvestmentGrowthByUserId);

// Forum Page (Zhe Kai)
app.get("/posts", forumController.getAllPosts);
app.post("/posts", forumController.createPost);
app.get("/posts/:post_id/replies", replyController.getRepliesByPostId);
app.post("/replies", replyController.createReply);

app.use("/reminder", reminderRoutes); // Send Reminder (Zhizhong)

// Spending over time API
app.get("/api/spending-over-time/:user_id", transactionsController.getSpendingOverTime);

// Function to get the response from the database (Zhizhong)
async function getResponseFromDatabase(userMessage) {
  try {
    // Connect to the database
    await sql.connect(dbConfig);

    // Query the database for the response based on the user's message
    const result = await sql.query`SELECT response FROM chatbot_responses WHERE LOWER(question) = ${userMessage.toLowerCase()}`;

    // Check if result.recordset is not empty and contains the expected data
    if (result.recordset && result.recordset.length > 0) {
      return result.recordset[0].response; // Return the response from the first record
    } else {
      console.log("No matching response found in the database.");
      return "Sorry, I didn't understand that. Can you please rephrase?";
    }
  } catch (err) {
    console.error("Error querying the database:", err);
    return "Sorry, there was an error. Please try again later.";
  }
}

// Endpoint to handle user input
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Get the response from the database
  const response = await getResponseFromDatabase(userMessage);

  // Send the response back to the frontend
  res.json({ reply: response });
});

app.get("/api/suggestions", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ suggestions: [] });

  try {
      await sql.connect(dbConfig);
      const result = await sql.query`
          SELECT TOP 5 question FROM chatbot_responses
          WHERE LOWER(question) LIKE '%' + ${query.toLowerCase()} + '%'
          ORDER BY LEN(question) ASC`;  // Show shorter questions first

      const suggestions = result.recordset.map(row => row.question);
      res.json({ suggestions });
  } catch (err) {
      console.error("Error fetching suggestions:", err);
      res.json({ suggestions: [] });
  }
});


app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

// Graceful shutdown on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});


 
app.use(express.json()); // Middleware to parse JSON
app.use(spendingRoutes); // Use spending routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
