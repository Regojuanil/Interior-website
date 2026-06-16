require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

console.log("Connecting to the database...");

connection.connect((err) => {
  if (err) {
    console.error("❌ Database Connection Failed!");
    console.error(err);
    process.exit(1);
  }
  console.log("🚀 Connected to the MySQL database successfully!");

  // Read schema.sql
  const schemaPath = path.join(__dirname, '..', 'Database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error("❌ schema.sql not found at path:", schemaPath);
    process.exit(1);
  }

  let schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Remove CREATE DATABASE and USE statements to prevent errors in Railway/Render
  schemaSql = schemaSql.replace(/CREATE DATABASE[\s\S]*?;/i, '');
  schemaSql = schemaSql.replace(/USE[\s\S]*?;/i, '');

  // Split queries by semicolon, removing comments first
  const cleanSql = schemaSql
    .split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith('--'))
    .join('\n');

  const queries = cleanSql
    .split(';')
    .map(query => query.trim())
    .filter(query => query.length > 0);

  console.log(`Executing ${queries.length} SQL statements to initialize tables and seed data...`);

  let executedCount = 0;

  function executeQuery(index) {
    if (index >= queries.length) {
      console.log("✅ Database initialization and seeding completed successfully!");
      connection.end();
      process.exit(0);
    }

    const q = queries[index];
    connection.query(q, (queryErr) => {
      if (queryErr) {
        console.error(`❌ Error executing statement #${index + 1}:`);
        console.error(q);
        console.error("Error details:", queryErr);
        connection.end();
        process.exit(1);
      }
      executedCount++;
      console.log(`[${executedCount}/${queries.length}] Executed statement successfully.`);
      executeQuery(index + 1);
    });
  }

  executeQuery(0);
});
