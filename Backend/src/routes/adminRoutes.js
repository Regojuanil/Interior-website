const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get statistics for Admin Dashboard
router.get("/stats", (req, res) => {
    // 1. Total Products
    const productsSql = "SELECT COUNT(*) AS total_products FROM products";
    db.query(productsSql, (err, productsRes) => {
        if (err) {
            console.error("Stats products query failed:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        
        // 2. Total Orders
        const ordersSql = "SELECT COUNT(*) AS total_orders FROM orders";
        db.query(ordersSql, (err, ordersRes) => {
            if (err) {
                console.error("Stats orders query failed:", err);
                return res.status(500).json({ success: false, message: "Database Error" });
            }

            // 3. Total Revenue
            const revenueSql = "SELECT SUM(amount) AS total_revenue FROM transactions WHERE status = 'Success'";
            db.query(revenueSql, (err, revenueRes) => {
                if (err) {
                    console.error("Stats revenue query failed:", err);
                    return res.status(500).json({ success: false, message: "Database Error" });
                }

                // 4. Total Transactions
                const txSql = "SELECT COUNT(*) AS total_transactions FROM transactions";
                db.query(txSql, (err, txRes) => {
                    if (err) {
                        console.error("Stats transactions query failed:", err);
                        return res.status(500).json({ success: false, message: "Database Error" });
                    }

                    // 5. Contact Inquiries
                    const inquiriesSql = "SELECT * FROM inquiries ORDER BY id DESC";
                    db.query(inquiriesSql, (err, inquiriesRes) => {
                        if (err) {
                            console.error("Stats inquiries query failed:", err);
                            return res.status(500).json({ success: false, message: "Database Error" });
                        }

                        res.json({
                            success: true,
                            stats: {
                                total_products: productsRes[0].total_products || 0,
                                total_orders: ordersRes[0].total_orders || 0,
                                total_revenue: revenueRes[0].total_revenue || 0,
                                total_transactions: txRes[0].total_transactions || 0,
                            },
                            inquiries: inquiriesRes
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
