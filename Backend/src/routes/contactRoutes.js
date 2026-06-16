const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { sendInquiryNotification } = require("../services/emailService");

router.post("/", (req, res) => {

    const { name, email, phone, message } = req.body;

    const sql =
    `INSERT INTO inquiries
    (name, email, phone, message)
    VALUES (?, ?, ?, ?)`;

    db.query(
        sql,
        [name, email, phone, message],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            // Trigger email notification asynchronously
            sendInquiryNotification({ name, email, phone, message })
                .catch(emailErr => console.error("Email notification deferred failure:", emailErr));

            res.json({
                success: true,
                message: "Inquiry received successfully"
            });
        }
    );
});

module.exports = router;