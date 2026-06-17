const mysql = require("mysql2");

// Use a connection POOL instead of single connection.
// Render free tier and Railway can drop idle connections — a pool
// automatically reconnects, preventing "PROTOCOL_CONNECTION_LOST" crashes.
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Database Connection Failed!");
    console.error("Error details:", err.message);
    console.error("Code:", err.code);
  } else {
    console.log("🚀 MySQL Database Pool Connected Successfully to Railway!");
    connection.release();
  }
});

module.exports = pool;