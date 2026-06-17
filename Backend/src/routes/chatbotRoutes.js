const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/db");

const genAI = new GoogleGenerativeAI(
    process.env.gemini_api_key || process.env.GEMINI_API_KEY
);

router.post("/", (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, reply: "Message is required" });
    }

    // 1. Fetch available products from DB to feed into the bot prompt
    const productsSql = "SELECT name, description, price FROM products";
    db.query(productsSql, (err, products) => {
        if (err) {
            console.error("Chatbot products lookup failed:", err);
            products = []; // fallback to empty
        }

        // 2. Parse message for potential order status inquiries
        // Looks for patterns like "order 5" or "order #5" or "status of 5"
        const orderIdMatch = message.match(/(?:order\s*#?\s*|id\s*#?\s*|status\s+of\s+|status\s+#?)(\d+)/i) || message.match(/\b(\d+)\b/);
        
        if (orderIdMatch && (message.toLowerCase().includes("order") || message.toLowerCase().includes("status") || message.toLowerCase().includes("track"))) {
            const orderId = orderIdMatch[1];
            const orderSql = "SELECT * FROM orders WHERE id = ?";
            
            db.query(orderSql, [orderId], (orderErr, orderResults) => {
                let orderContext = "";
                if (orderErr) {
                    console.error("Chatbot order lookup failed:", orderErr);
                    orderContext = "Database error looking up the order status.";
                } else if (orderResults && orderResults.length > 0) {
                    const order = orderResults[0];
                    orderContext = `Customer Order Context: The user is asking about order ID #${order.id}. This order was placed by ${order.customer_name}. Total: ₹${order.total_price}. Current Status: '${order.status}'. Placed on: ${order.created_at}.`;
                } else {
                    orderContext = `Customer Order Context: The user asked about order ID #${orderId}, but no order with this ID exists in the database. Ask them to verify the order number.`;
                }
                
                generateBotResponse(message, products, orderContext, res);
            });
        } else {
            generateBotResponse(message, products, null, res);
        }
    });
});

async function generateBotResponse(message, products, orderContext, res) {
    try {
        const productListStr = products.map(p => `- ${p.name}: ₹${p.price} (${p.description})`).join("\n");
        
        const prompt = `
        You are Regoju Interior Works AI Assistant.

        Company Services:
        - Modular Kitchens
        - Living Room Design
        - Bedroom Design
        - Commercial Interiors
        - Luxury Interiors

        Services Pricing:
        - Modular Kitchen starts from ₹2 Lakhs
        - Full Home Interior starts from ₹3 Lakhs
        - Commercial Interior starts from ₹5 Lakhs

        Available Products (Furniture Catalog):
        ${productListStr || "No custom products are available currently."}

        E-Commerce FAQs:
        - Delivery: Free shipping on orders above ₹15,000. Under ₹15,000, flat shipping fee of ₹500 is applied. Delivery takes 5-7 business days across India.
        - Payment Methods: Credit Card, Debit Card, Google Pay, PhonePe, Paytm, UPI, and Cash on Delivery.
        - Order Status: Customers can check their order status by providing their Order ID.
        - Furniture Suggestions: Match modular interior services with matching furniture products (e.g. recommend Wooden Sofa for Living Room Designs, Wooden Dining Table for modular dining setup, etc.).

        ${orderContext ? `Current Order Context:\n${orderContext}\n` : ""}

        Answer professionally, briefly and politely.

        Customer Question:
        ${message}
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        // Return the AI reply
        return res.json({ success: true, reply });

    } catch (error) {
        const errMsg = error && error.message ? error.message : String(error);
        console.error("Gemini chatbot error:", errMsg);
        res.status(500).json({
            success: false,
            reply: "AI service unavailable at the moment."
        });
    }
}

module.exports = router;