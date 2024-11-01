const express = require("express");
const sql = require("mssql");
const path = require('path');
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
/*const authorize = require("./middlewares/authorize");*/


const transactionsController = require("./controllers/transactionsController");

const validateTransactions = require("./middlewares/validateTransactions");
const { profile } = require("console");


const app = express();
const port = 3000;
const staticMiddleware = express.static(path.join(__dirname, 'public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware);

app.get("/transactions/:account_id", transactionsController.getTransactionsbyaccountid);
app.post("/transactions", validateTransactions, transactionsController.createTransaction);


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