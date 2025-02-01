module.exports = {
    user: "testing123", // Replace with your SQL Server login username (testing1234)
    password: "testing123", // Replace with your SQL Server login password (testingtesting1234)
    server: "localhost\\SQLEXPRESS", // vaish changed this from localhost to localhost\\SQLEXPRESS for a while
    database: "FSDP",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };