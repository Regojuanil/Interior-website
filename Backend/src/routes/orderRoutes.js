const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. Get all orders (including order items and transactions)
router.get("/", (req, res) => {
    // Fetch all orders
    const ordersSql = "SELECT * FROM orders ORDER BY id DESC";
    db.query(ordersSql, (err, orders) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }

        if (orders.length === 0) {
            return res.json({ success: true, orders: [] });
        }

        // Fetch all order items
        const itemsSql = "SELECT * FROM order_items";
        db.query(itemsSql, (err, items) => {
            if (err) {
                console.error("Error fetching order items:", err);
                return res.status(500).json({ success: false, message: "Database Error" });
            }

            // Fetch all transactions
            const txSql = "SELECT * FROM transactions";
            db.query(txSql, (err, transactions) => {
                if (err) {
                    console.error("Error fetching transactions:", err);
                    return res.status(500).json({ success: false, message: "Database Error" });
                }

                // Map items and transactions to their respective orders
                const ordersWithDetails = orders.map(order => {
                    const orderItems = items.filter(item => item.order_id === order.id);
                    const orderTx = transactions.filter(tx => tx.order_id === order.id);
                    return {
                        ...order,
                        items: orderItems,
                        transactions: orderTx
                    };
                });

                res.json({ success: true, orders: ordersWithDetails });
            });
        });
    });
});

// 2. Update order status (Admin function)
router.put("/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
    }

    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating order status:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, message: `Order status updated to ${status}` });
    });
});

module.exports = router;
