const express = require("express");
const sql = require("mssql");
const path = require('path');
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const authorize = require("./middlewares/authorize"); // Middleware Authorization for JWT (Zheng Bin)

// Middlewares
const validateTransactions = require("./middlewares/validateTransactions"); // Transaction Page (Melson)

// Controllers
const transactionsController = require("./controllers/transactionsController"); // Transaction Page (Melson)
const accountController = require("./controllers/accountController"); // Account Page (Zheng Bin)
const userController = require("./controllers/userController"); // User Page (Zheng Bin)
const investmentController = require("./controllers/investmentController"); // Investment Page (Zhe Kai)

const { profile } = require("console");

const app = express();
const port = 3000;
const staticMiddleware = express.static(path.join(__dirname, 'public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware);

// Login Page (Zheng Bin)
app.post('/user/register', userController.createUser); 
app.post("/user/login", userController.loginUser); 

// Transaction Page (Melson)
app.get("/transactions/:account_id", transactionsController.getTransactionsbyaccountid);
app.post("/transactions", validateTransactions, transactionsController.createTransaction);
app.delete("/transactions/:transaction_id", transactionsController.deleteTransactionByTransactionId); // Part of Zheng Bin's Feature

// Account Page (Zheng Bin)
app.get("/accounts/user/:user_id", accountController.getAccountsById);
app.get("/accounts/account/:account_id", accountController.getAccountByAccountId);
app.get("/accounts/accountnameandnumber/:account_id", accountController.getAccountnameandnumberByAccountId);

// User (Zheng Bin)
app.get("/users", authorize, userController.getUserById);
app.get("/user", userController.getUserByPhoneorNric);

// Investment Page (Zhe Kai)
app.get("/investments/:user_id", investmentController.getInvestmentsByUserId);
app.get("/investments/growth/:user_id", investmentController.getInvestmentGrowthByUserId);


app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});