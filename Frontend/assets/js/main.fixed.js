// Fixed main.js - corrected template literals and added chat UX improvements

const API_BASE_URL = "https://YOUR_RENDER_BACKEND_URL/api";

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      alert(result.message || "Message sent");
      contactForm.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again later.");
    }
  });
}

// CHATBOT

const chatToggle = document.getElementById("chatToggle");
const chatContainer = document.getElementById("chatContainer");
const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatBody = document.getElementById("chatBody");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (chatToggle && chatContainer) {
  chatToggle.addEventListener("click", () => {
    const current = getComputedStyle(chatContainer).display;
    if (current === "none" || current === "") {
      chatContainer.style.display = "flex";
      if (chatInput) chatInput.focus();
    } else {
      chatContainer.style.display = "none";
    }
  });
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);

if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function sendMessage() {
  if (!chatInput || !chatBody) return;
  const message = chatInput.value.trim();
  if (!message) return;

  chatBody.innerHTML += `<div class="user-message">${escapeHtml(message)}</div>`;
  // loading indicator
  const loadingId = `loading-${Date.now()}`;
  chatBody.innerHTML += `<div class="bot-message" id="${loadingId}">Typing...</div>`;
  chatBody.scrollTop = chatBody.scrollHeight;

  chatInput.value = "";
  chatInput.focus();

  try {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();

    const replyText = data && data.reply ? data.reply : "Sorry, no reply from AI.";
    chatBody.innerHTML += `<div class="bot-message">${escapeHtml(replyText)}</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (err) {
    console.error(err);
    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();
    chatBody.innerHTML += `<div class="bot-message">Sorry, AI service is unavailable.</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}
