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
app.use(cors({
    origin: [
        "https://interior-website-rosy-rho.vercel.app",
        "https://interior-website-z9e9.onrender.com",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
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

    const cleanSql = schemaSql
      .split('\n')
      .map(line => line.trim())
      .filter(line => !line.startsWith('--'))
      .join('\n');

    const queries = cleanSql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

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
                
                db.query("SELECT * FROM inquiries", (err4, inquiries) => {
                    const inquiryRows = err4 ? { error: err4.message } : inquiries;
                    
                    res.json({
                        success: true,
                        tables: tables,
                        productsDescription: desc,
                        products: prodRows,
                        inquiries: inquiryRows
                    });
                });
            });
        });
    });
});

// Test Route
app.get("/", (req, res) => {
    res.send("Interior Website API Running");
});

// Debug env check route
app.get("/api/debug-env-xyz", (req, res) => {
    const geminiKeyLower = process.env.gemini_api_key || '';
    const geminiKeyUpper = process.env.GEMINI_API_KEY || '';
    res.json({
        gemini_api_key_present: !!geminiKeyLower,
        gemini_api_key_prefix: geminiKeyLower.substring(0, 12),
        GEMINI_API_KEY_present: !!geminiKeyUpper,
        GEMINI_API_KEY_prefix: geminiKeyUpper.substring(0, 12),
        all_env_keys: Object.keys(process.env).filter(k => k.toLowerCase().includes('gemini')),
        smtp_host: process.env.SMTP_HOST || "NOT SET",
        smtp_port: process.env.SMTP_PORT || "NOT SET",
        smtp_user: process.env.SMTP_USER || "NOT SET",
        smtp_pass_length: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
        smtp_pass_preview: process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 4) + "..." : "NOT SET"
    });
});

// Live SMTP test route — sends a real test email from the deployed server
app.get("/api/test-smtp-xyz", async (req, res) => {
    const nodemailer = require("nodemailer");
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
        return res.json({
            success: false,
            error: "SMTP credentials missing in environment",
            smtp_host: smtpHost || "MISSING",
            smtp_user: smtpUser || "MISSING",
            smtp_pass_length: smtpPass ? smtpPass.length : 0
        });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: false,
            auth: { user: smtpUser, pass: smtpPass }
        });

        // Verify connection first
        await transporter.verify();

        // Send test mail
        const info = await transporter.sendMail({
            from: `"Regoju Test" <${smtpUser}>`,
            to: smtpUser,
            subject: "✅ SMTP Test from Render Server",
            text: "SMTP is working correctly from the deployed Render server!"
        });

        res.json({
            success: true,
            messageId: info.messageId,
            response: info.response,
            smtp_user: smtpUser,
            smtp_host: smtpHost,
            smtp_port: smtpPort
        });
    } catch (err) {
        res.json({
            success: false,
            error: err.message,
            code: err.code,
            command: err.command,
            smtp_user: smtpUser,
            smtp_host: smtpHost,
            smtp_port: smtpPort,
            smtp_pass_length: smtpPass ? smtpPass.length : 0
        });
    }
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
