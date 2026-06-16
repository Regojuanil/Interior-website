require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Database Connection
require("./src/config/db");

// Routes
const contactRoutes = require("./src/routes/contactRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Route to initialize and seed database remotely
app.get("/api/init-db-secure-xyz", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const db = require("./src/config/db");

    const schemaPath = path.join(__dirname, '..', 'Database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        return res.status(404).json({ success: false, message: "schema.sql not found at " + schemaPath });
    }

    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    schemaSql = schemaSql.replace(/CREATE DATABASE[\s\S]*?;/i, '');
    schemaSql = schemaSql.replace(/USE[\s\S]*?;/i, '');

    const queries = schemaSql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    console.log(`Executing ${queries.length} SQL statements remotely...`);

    let executedCount = 0;
    
    function executeNext(index) {
        if (index >= queries.length) {
            return res.json({ success: true, message: `Successfully executed ${executedCount} queries to initialize database.` });
        }

        const q = queries[index];
        db.query(q, (err) => {
            if (err) {
                console.error(`Error executing statement #${index + 1}:`, err);
                return res.status(500).json({ success: false, error: err.message, query: q, index: index + 1 });
            }
            executedCount++;
            executeNext(index + 1);
        });
    }

    executeNext(0);
});

// Route to check database state remotely
app.get("/api/check-db-secure-xyz", (req, res) => {
    const db = require("./src/config/db");
    db.query("SHOW TABLES", (err, tables) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        db.query("DESCRIBE products", (err2, columns) => {
            const desc = err2 ? { error: err2.message } : columns;
            
            db.query("SELECT * FROM products", (err3, rows) => {
                const prodRows = err3 ? { error: err3.message } : rows;
                
                res.json({
                    success: true,
                    tables: tables,
                    productsDescription: desc,
                    products: prodRows
                });
            });
        });
    });
});

// Test Route
app.get("/", (req, res) => {
    res.send("Interior Website API Running");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});