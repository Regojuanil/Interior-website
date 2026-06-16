-- Run this SQL in your MySQL client to create the chat_messages table

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_message TEXT,
  bot_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
