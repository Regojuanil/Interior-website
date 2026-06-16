const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Database Connection Failed!");
    console.error("Error details:", err.message);
    console.error("Code:", err.code);
  } else {
    console.log("🚀 MySQL Database Connected Successfully to Railway!");
  }
});

// Handle connection errors after initial connection
connection.on('error', (err) => {
  console.error('Database connection error occurred:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

module.exports = connection;