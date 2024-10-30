module.exports = {
    user: "testing1234", // Replace with your SQL Server login username
    password: "testingtesting1234", // Replace with your SQL Server login password
    server: "localhost",
    database: "fsdpSQL",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };