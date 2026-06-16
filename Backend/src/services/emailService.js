const nodemailer = require("nodemailer");

// Initialize transporter asynchronously to support dynamic ethereal testing fallback
const transporterPromise = (async () => {
    // If SMTP credentials are fully provided in .env, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log("🚀 Using custom SMTP configuration for email notifications");
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback: Create ethereal test account dynamically
        console.log("ℹ️ No SMTP credentials configured. Creating temporary Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        console.log("✅ Dynamic Ethereal test account created successfully!");
        console.log(`   Username: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
})();

/**
 * Sends a notification email when a new inquiry is submitted
 */
async function sendInquiryNotification({ name, email, phone, message }) {
    try {
        const transporter = await transporterPromise;
        
        // Recipient credentials
        const targetEmail = "anilregoju@gmail.com";
        const ownerContact = "8247404515";
        
        // Luxury themed HTML email layout
        const htmlContent = `
        <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px 20px; border-radius: 15px; max-width: 600px; margin: 0 auto; border: 1px solid #b89b54; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(184, 155, 84, 0.2); padding-bottom: 20px;">
                <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">REGOJU</span><br/>
                <span style="font-size: 9px; font-weight: 600; letter-spacing: 4px; color: #b89b54; text-transform: uppercase;">INTERIOR STUDIO</span>
            </div>
            
            <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border-left: 4px solid #b89b54; margin-bottom: 25px;">
                <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #b89b54; margin-top: 0; font-size: 20px; letter-spacing: 0.5px;">New Consultation Inquiry</h2>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
                    A customer has submitted an inquiry form on the Regoju Interior Studio website. Below are the details:
                </p>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                        <td style="padding: 12px 0; font-weight: bold; width: 120px; color: #b89b54;">Name:</td>
                        <td style="padding: 12px 0; color: #ffffff;">${name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                        <td style="padding: 12px 0; font-weight: bold; color: #b89b54;">Email:</td>
                        <td style="padding: 12px 0; color: #ffffff;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                        <td style="padding: 12px 0; font-weight: bold; color: #b89b54;">Phone:</td>
                        <td style="padding: 12px 0; color: #ffffff;"><a href="tel:${phone}" style="color: #ffffff; text-decoration: none;">${phone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; vertical-align: top; color: #b89b54;">Message:</td>
                        <td style="padding: 12px 0; color: #ffffff; line-height: 1.6;">${message || 'No project description provided.'}</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; padding-top: 10px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 5px 0;">This is an automated notification from your portfolio inquiry system.</p>
                <p style="margin: 5px 0; color: #b89b54; font-weight: bold;">Owner Notification Desk: ${targetEmail} | Contact: ${ownerContact}</p>
            </div>
        </div>
        `;
        
        const mailOptions = {
            from: '"Regoju Interior Studio" <no-reply@regoju.com>',
            to: targetEmail,
            subject: `🔔 New Website Inquiry: ${name}`,
            html: htmlContent
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email notification sent successfully! Message ID: ${info.messageId}`);
        
        // Ethereal URL logging
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Preview Ethereal Email URL: ${previewUrl}`);
        }
        
        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error("❌ Failed to send email notification:", err);
        return { success: false, error: err };
    }
}

/**
 * Sends a notification email when a new order is placed
 */
async function sendOrderNotification({ orderId, customerName, customerEmail, customerPhone, address, totalPrice, items, paymentMethod }) {
    try {
        const transporter = await transporterPromise;
        
        const targetEmail = "anilregoju@gmail.com";
        const ownerContact = "8247404515";
        
        const itemsListHtml = items.map(item => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 10px 0; color: #ffffff;">${item.name}</td>
                <td style="padding: 10px 0; text-align: center; color: #ffffff;">${item.quantity}</td>
                <td style="padding: 10px 0; text-align: right; color: #b89b54; font-weight: bold;">₹${Math.round(item.price * item.quantity)}</td>
            </tr>
        `).join("");

        const htmlContent = `
        <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px 20px; border-radius: 15px; max-width: 600px; margin: 0 auto; border: 1px solid #b89b54; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(184, 155, 84, 0.2); padding-bottom: 20px;">
                <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">REGOJU</span><br/>
                <span style="font-size: 9px; font-weight: 600; letter-spacing: 4px; color: #b89b54; text-transform: uppercase;">INTERIOR STUDIO</span>
            </div>
            
            <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border-left: 4px solid #b89b54; margin-bottom: 25px;">
                <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #b89b54; margin-top: 0; font-size: 20px; letter-spacing: 0.5px;">New Order Placed - Order #${orderId}</h2>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
                    A customer has placed a new order. Below are the order and customer details:
                </p>
                
                <h4 style="color: #b89b54; border-bottom: 1px solid rgba(184, 155, 84, 0.2); padding-bottom: 5px; margin-top: 0;">Customer Details</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 120px; color: #b89b54;">Name:</td><td style="padding: 6px 0; color: #ffffff;">${customerName}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #b89b54;">Email:</td><td style="padding: 6px 0; color: #ffffff;">${customerEmail}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #b89b54;">Phone:</td><td style="padding: 6px 0; color: #ffffff;">${customerPhone}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #b89b54;">Address:</td><td style="padding: 6px 0; color: #ffffff;">${address}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #b89b54;">Payment Mode:</td><td style="padding: 6px 0; color: #ffffff;">${paymentMethod}</td></tr>
                </table>

                <h4 style="color: #b89b54; border-bottom: 1px solid rgba(184, 155, 84, 0.2); padding-bottom: 5px; margin-top: 25px;">Items Ordered</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1; margin-bottom: 15px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="text-align: left; padding: 10px 0; color: #94a3b8;">Item</th>
                            <th style="text-align: center; padding: 10px 0; color: #94a3b8; width: 65px;">Qty</th>
                            <th style="text-align: right; padding: 10px 0; color: #94a3b8; width: 100px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsListHtml}
                        <tr>
                            <td colspan="2" style="padding: 15px 0 0; font-weight: bold; font-size: 15px; color: #ffffff;">Total Amount:</td>
                            <td style="padding: 15px 0 0; text-align: right; font-weight: bold; font-size: 17px; color: #b89b54;">₹${Math.round(totalPrice)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="text-align: center; padding-top: 10px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                <p style="margin: 5px 0;">This is an automated notification from your portfolio store checkout system.</p>
                <p style="margin: 5px 0; color: #b89b54; font-weight: bold;">Owner Notification Desk: ${targetEmail} | Contact: ${ownerContact}</p>
            </div>
        </div>
        `;

        const mailOptions = {
            from: '"Regoju Interior Studio" <no-reply@regoju.com>',
            to: targetEmail,
            subject: `🛍️ New Order Placed: Order #${orderId} (₹${Math.round(totalPrice)})`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Order email notification sent successfully! Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ Failed to send order email notification:", err);
        return { success: false, error: err };
    }
}

module.exports = {
    sendInquiryNotification,
    sendOrderNotification
};
