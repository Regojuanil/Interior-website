const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. Get all products
router.get("/", (req, res) => {
    const sql = "SELECT * FROM products ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching products:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        res.json({ success: true, products: results });
    });
});

// 2. Add a new product (Admin function)
router.post("/", (req, res) => {
    const { name, description, price, image_url } = req.body;

    if (!name || !price || !image_url) {
        return res.status(400).json({ success: false, message: "Name, price, and image URL are required" });
    }

    const sql = "INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, description, price, image_url], (err, result) => {
        if (err) {
            console.error("Error creating product:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        res.json({
            success: true,
            message: "Product added successfully",
            product: { id: result.insertId, name, description, price, image_url }
        });
    });
});

// 3. Edit a product (Admin function)
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price, image_url } = req.body;

    if (!name || !price || !image_url) {
        return res.status(400).json({ success: false, message: "Name, price, and image URL are required" });
    }

    const sql = "UPDATE products SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ?";
    db.query(sql, [name, description, price, image_url, id], (err, result) => {
        if (err) {
            console.error("Error updating product:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({
            success: true,
            message: "Product updated successfully",
            product: { id: parseInt(id), name, description, price, image_url }
        });
    });
});

// 4. Delete a product (Admin function)
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting product:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    });
});

module.exports = router;
