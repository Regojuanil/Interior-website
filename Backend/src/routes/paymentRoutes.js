const express = require("express");
const router = express.Router();
const db = require("../config/db");
const crypto = require("crypto");
const { sendOrderNotification } = require("../services/emailService");

let Razorpay;
try {
    Razorpay = require("razorpay");
} catch (e) {
    console.warn("Razorpay module not loaded, will only use simulation mode.");
}

// Helper to check if Razorpay is properly configured
const isRazorpayConfigured = () => {
    return Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
};

// 1. Checkout (Initiate payment / order creation)
router.post("/checkout", (req, res) => {
    const {
        customer_name,
        customer_email,
        customer_phone,
        address,
        city,
        state,
        pincode,
        items,
        payment_method,
        total_price
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !address || !city || !state || !pincode || !items || !items.length || !payment_method || !total_price) {
        return res.status(400).json({ success: false, message: "Missing required checkout fields" });
    }

    // Step 1: Create Order in local database
    const orderSql = `INSERT INTO orders 
        (customer_name, customer_email, customer_phone, address, city, state, pincode, total_price, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Cash on Delivery starts as 'Pending'. Simulated payments start as 'Paid'. Razorpay starts as 'Pending'.
    const initialStatus = (payment_method === "Cash On Delivery") ? "Pending" : 
                          (isRazorpayConfigured() ? "Pending" : "Paid");

    db.query(
        orderSql,
        [customer_name, customer_email, customer_phone, address, city, state, pincode, total_price, initialStatus],
        (err, orderResult) => {
            if (err) {
                console.error("Error creating order:", err);
                return res.status(500).json({ success: false, message: "Database Error during order creation" });
            }

            const orderId = orderResult.insertId;

            // Step 2: Create Order Items in database
            const itemQueries = items.map(item => {
                return new Promise((resolve, reject) => {
                    const itemSql = `INSERT INTO order_items 
                        (order_id, product_id, product_name, price, quantity) 
                        VALUES (?, ?, ?, ?, ?)`;
                    db.query(
                        itemSql,
                        [orderId, item.id || null, item.name, item.price, item.quantity],
                        (itemErr) => {
                            if (itemErr) reject(itemErr);
                            else resolve();
                        }
                    );
                });
            });

            Promise.all(itemQueries)
                .then(async () => {
                    // Step 3: Handle Payments based on configuration and choice

                    // Case A: Cash on Delivery
                    if (payment_method === "Cash On Delivery") {
                        const txSql = `INSERT INTO transactions 
                            (order_id, transaction_id, payment_method, amount, status) 
                            VALUES (?, ?, ?, ?, ?)`;
                        const simTxId = "COD-" + Math.floor(Math.random() * 1000000);
                        db.query(txSql, [orderId, simTxId, payment_method, total_price, "Pending"], (txErr) => {
                            if (txErr) {
                                console.error("Error creating transaction for COD:", txErr);
                                return res.status(500).json({ success: false, message: "Transaction database logging failed" });
                            }

                            // Send email notification asynchronously
                            sendOrderNotification({
                                orderId,
                                customerName: customer_name,
                                customerEmail: customer_email,
                                customerPhone: customer_phone,
                                address: `${address}, ${city}, ${state} - ${pincode}`,
                                totalPrice: total_price,
                                items,
                                paymentMethod: payment_method
                            }).catch(mailErr => console.error("COD order notification mail error:", mailErr));

                            return res.json({
                                success: true,
                                mode: "simulation",
                                order_id: orderId,
                                message: "Order placed successfully using Cash On Delivery"
                            });
                        });
                    }
                    // Case B: Razorpay (Production Mode)
                    else if (isRazorpayConfigured()) {
                        try {
                            const razorpayInstance = new Razorpay({
                                key_id: process.env.RAZORPAY_KEY_ID,
                                key_secret: process.env.RAZORPAY_KEY_SECRET
                            });

                            const options = {
                                amount: Math.round(total_price * 100), // amount in paisa
                                currency: "INR",
                                receipt: `receipt_order_${orderId}`
                            };

                            const razorpayOrder = await razorpayInstance.orders.create(options);
                            return res.json({
                                success: true,
                                mode: "razorpay",
                                order_id: orderId,
                                razorpay_order_id: razorpayOrder.id,
                                amount: options.amount,
                                key_id: process.env.RAZORPAY_KEY_ID,
                                customer: {
                                    name: customer_name,
                                    email: customer_email,
                                    contact: customer_phone
                                }
                            });
                        } catch (rzpErr) {
                            console.error("Razorpay order creation failed:", rzpErr);
                            // Fallback to simulation if Razorpay fails/errors
                            return proceedWithSimulation(orderId, payment_method, total_price, res, "Razorpay API error fallback", customer_name, customer_email, customer_phone, address, city, state, pincode, items);
                        }
                    }
                    // Case C: Simulated Successful Payment (Development Mode fallback)
                    else {
                        return proceedWithSimulation(orderId, payment_method, total_price, res, "Development mode simulation", customer_name, customer_email, customer_phone, address, city, state, pincode, items);
                    }
                })
                .catch(itemsErr => {
                    console.error("Error inserting order items:", itemsErr);
                    res.status(500).json({ success: false, message: "Error mapping order items" });
                });
        }
    );
});

// Helper function to complete transaction simulation
function proceedWithSimulation(orderId, payment_method, total_price, res, note, customer_name, customer_email, customer_phone, address, city, state, pincode, items) {
    const txSql = `INSERT INTO transactions 
        (order_id, transaction_id, payment_method, amount, status) 
        VALUES (?, ?, ?, ?, ?)`;
    const simTxId = "SIM-" + Math.floor(Math.random() * 1000000);
    db.query(txSql, [orderId, simTxId, payment_method, total_price, "Success"], (txErr) => {
        if (txErr) {
            console.error("Error creating simulated transaction:", txErr);
            return res.status(500).json({ success: false, message: "Transaction database logging failed" });
        }

        // Send email notification asynchronously
        sendOrderNotification({
            orderId,
            customerName: customer_name,
            customerEmail: customer_email,
            customerPhone: customer_phone,
            address: `${address}, ${city}, ${state} - ${pincode}`,
            totalPrice: total_price,
            items,
            paymentMethod: payment_method
        }).catch(mailErr => console.error("Simulated order notification mail error:", mailErr));

        res.json({
            success: true,
            mode: "simulation",
            order_id: orderId,
            transaction_id: simTxId,
            message: `Checkout successful! (Simulated payment via ${payment_method})`,
            note
        });
    });
}

// 2. Verify Razorpay Signature (Production Mode Webhook/Callback verification)
router.post("/verify", (req, res) => {
    const {
        order_id,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        payment_method,
        amount
    } = req.body;

    if (!isRazorpayConfigured()) {
        return res.status(400).json({ success: false, message: "Razorpay is not configured on the server" });
    }

    // Hash text: order_id + "|" + payment_id
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        // 1. Update order status to Paid
        const updateOrderSql = "UPDATE orders SET status = 'Paid' WHERE id = ?";
        db.query(updateOrderSql, [order_id], (err) => {
            if (err) {
                console.error("Failed to update order status post-verify:", err);
                return res.status(500).json({ success: false, message: "Order update failed" });
            }

            // 2. Insert transaction details
            const insertTxSql = `INSERT INTO transactions 
                (order_id, transaction_id, payment_method, amount, status) 
                VALUES (?, ?, ?, ?, ?)`;
            db.query(
                insertTxSql,
                [order_id, razorpay_payment_id, payment_method || "Razorpay", amount, "Success"],
                (txErr) => {
                    if (txErr) {
                        console.error("Failed to save transaction details post-verify:", txErr);
                        return res.status(500).json({ success: false, message: "Transaction save failed" });
                    }

                    // 3. Fetch order items and customer info to send verification email
                    db.query("SELECT * FROM orders WHERE id = ?", [order_id], (ordErr, ordRows) => {
                        if (ordRows && ordRows.length > 0) {
                            const order = ordRows[0];
                            db.query("SELECT * FROM order_items WHERE order_id = ?", [order_id], (itemsErr, itemsRows) => {
                                if (!itemsErr && itemsRows) {
                                    const items = itemsRows.map(row => ({
                                        name: row.product_name,
                                        price: row.price,
                                        quantity: row.quantity
                                    }));
                                    
                                    sendOrderNotification({
                                        orderId: order.id,
                                        customerName: order.customer_name,
                                        customerEmail: order.customer_email,
                                        customerPhone: order.customer_phone,
                                        address: `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
                                        totalPrice: order.total_price,
                                        items,
                                        paymentMethod: payment_method || "Razorpay"
                                    }).catch(mailErr => console.error("Razorpay order notification mail error:", mailErr));
                                }
                            });
                        }
                    });

                    res.json({ success: true, message: "Payment verified and order placed successfully" });
                }
            );
        });
    } else {
        // Payment failed signature check
        const insertTxSql = `INSERT INTO transactions 
            (order_id, transaction_id, payment_method, amount, status) 
            VALUES (?, ?, ?, ?, ?)`;
        db.query(
            insertTxSql,
            [order_id, razorpay_payment_id || "FAILED", payment_method || "Razorpay", amount, "Failed"],
            () => {
                res.status(400).json({ success: false, message: "Invalid payment signature" });
            }
        );
    }
});

module.exports = router;
