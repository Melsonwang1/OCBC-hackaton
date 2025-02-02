const express = require("express");
const app = express(); // Initialize express app
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const Users = require("./models/user");
const authorize = require("./middlewares/authorize"); // Middleware Authorization for JWT (Zheng Bin)

// Routes
const spendingRoutes = require("./routes/spendingRoutes"); // Spending over Limit (Vaish)
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

const port = 3000;
const staticMiddleware = express.static(path.join(__dirname, "public"));

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);

// Now move this AFTER spendingRoutes is declared
app.use('/api', spendingRoutes); // Prefix all spending routes with "/api"
app.use("/reminder", reminderRoutes); // Send Reminder (Zhizhong)

// Login Page (Zheng Bin)
app.post("/user/register", userController.createUser);
app.post("/user/login", userController.loginUser);

// Transaction Page (Melson)
app.get("/transactions/:account_id", transactionsController.getTransactionsbyaccountid);
app.post("/transactions", validateTransactions, transactionsController.createTransaction);
app.delete("/transactions/:transaction_id", transactionsController.deleteTransactionByTransactionId);

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

// Spending over time API
app.get("/api/spending-over-time/:user_id", transactionsController.getSpendingOverTime);

// Function to get the response from the database (Zhizhong)
async function getResponseFromDatabase(userMessage) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT response FROM chatbot_responses WHERE LOWER(question) = ${userMessage.toLowerCase()}`;

    if (result.recordset && result.recordset.length > 0) {
      return result.recordset[0].response;
    } else {
      console.log("No matching response found in the database.");
      return "Sorry, I didn't understand that. Can you please rephrase?";
    }
  } catch (err) {
    console.error("Error querying the database:", err);
    return "Sorry, there was an error. Please try again later.";
  }
}

// Chatbot API
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const response = await getResponseFromDatabase(userMessage);
  res.json({ reply: response });
});

// Chatbot Suggestions API
app.get("/api/suggestions", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ suggestions: [] });

  try {
      await sql.connect(dbConfig);
      const result = await sql.query`
          SELECT TOP 5 question FROM chatbot_responses
          WHERE LOWER(question) LIKE '%' + ${query.toLowerCase()} + '%'
          ORDER BY LEN(question) ASC`;

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

// Save spending limits endpoint
app.post("/api/save-limits", (req, res) => {
  console.log("Received request to save limits:", req.body);
  
  // No validation, just return success immediately
  res.json({ message: "Spending limits saved successfully!" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});