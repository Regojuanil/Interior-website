const express = require("express");
const cors = require("cors");

const chatbotRoutes = require("./routes/chatbotRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Interior Website API Running");
});

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/contact", contactRoutes);

module.exports = app;