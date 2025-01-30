const express = require("express");
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const authorize = require("./middlewares/authorize"); // Middleware Authorization for JWT (Zheng Bin)
const { OpenAI } = require("openai");

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store your API key in an environment variable
});
app.post("/assistant", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use "gpt-3.5-turbo" if you want to save tokens
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ response: "Sorry, something went wrong." });
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
