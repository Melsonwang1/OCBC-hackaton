const express = require("express");
const sql = require("mssql");
const path = require("path");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const Fuse = require("fuse.js");
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

// AI Virtual Assistant (Zhizhong)
let responses = [];
let fuse;

app.post("/assistant", (req, res) => {
  const userMessage = req.body.message;
  if (!fuse) {
    return res.json({ response: "AI assistant is not ready yet. Please try again later." });
  }
  const result = fuse.search(userMessage);
  res.json({
    response: result.length > 0 ? result[0].item.response : "I'm sorry, I don't understand that question.",
  });
});

// Spending over time API
app.get("/api/spending-over-time/:user_id", transactionsController.getSpendingOverTime);

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");

    // Fetch chatbot responses after DB connection is established
    const result = await sql.query("SELECT * FROM chatbot_responses");
    responses = result.recordset;
    fuse = new Fuse(responses, {
      keys: ["question"], // Search based on questions
      threshold: 0.4, // Lower = stricter matching
    });

    console.log("AI Assistant responses loaded successfully");

  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Graceful shutdown on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});
