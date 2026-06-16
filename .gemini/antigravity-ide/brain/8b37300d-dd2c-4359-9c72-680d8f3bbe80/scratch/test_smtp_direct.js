require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/dotenv').config({ 
    path: 'c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/.env' 
});
const nodemailer = require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/nodemailer');

async function sendTestEmail() {
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Loaded" : "❌ Missing");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: "xrwl wzfo vwkk txbd"
        }
    });

    try {
        console.log("\nVerifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP connection verified successfully!");

        console.log("\nSending test email...");
        const info = await transporter.sendMail({
            from: '"Regoju Interior Studio" <anilregoju@gmail.com>',
            to: "anilregoju@gmail.com",
            subject: "🔔 Test: New Website Inquiry — Ravi Kumar",
            html: `
                <div style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:30px;border-radius:10px;border:1px solid #b89b54;max-width:600px;margin:0 auto;">
                    <h2 style="color:#b89b54;font-family:Georgia,serif;">REGOJU INTERIOR STUDIO</h2>
                    <h3 style="color:#fff;">New Consultation Inquiry</h3>
                    <table style="width:100%;font-size:14px;">
                        <tr><td style="color:#b89b54;padding:8px 0;width:100px;"><b>Name:</b></td><td style="color:#fff;">Ravi Kumar</td></tr>
                        <tr><td style="color:#b89b54;padding:8px 0;"><b>Email:</b></td><td style="color:#fff;">ravi@example.com</td></tr>
                        <tr><td style="color:#b89b54;padding:8px 0;"><b>Phone:</b></td><td style="color:#fff;">9876543210</td></tr>
                        <tr><td style="color:#b89b54;padding:8px 0;vertical-align:top;"><b>Message:</b></td><td style="color:#fff;">I am interested in a full home interior design for my 3BHK in Hyderabad.</td></tr>
                    </table>
                    <p style="color:#94a3b8;font-size:11px;margin-top:20px;">This is an automated notification from your Regoju Interior Studio website.</p>
                </div>
            `
        });

        console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
        console.log("   Message ID:", info.messageId);
        console.log("   Accepted:", info.accepted);
    } catch (err) {
        console.error("\n❌ SMTP ERROR:", err.message);
        if (err.code) console.error("   Error Code:", err.code);
        if (err.response) console.error("   Server Response:", err.response);
    }
}

sendTestEmail();
