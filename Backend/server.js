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

// Test Route
app.get("/", (req, res) => {
    res.send("Interior Website API Running");
});

// Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});