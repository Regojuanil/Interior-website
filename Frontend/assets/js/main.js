// Frontend script — contact form + chatbot integration

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

  // Append user message
  chatBody.innerHTML += `<div class="user-message">${escapeHtml(message)}</div>`;
  
  // Loading indicator
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

// ==========================================
// E-COMMERCE CART & PRODUCTS SYSTEM
// ==========================================

let cart = JSON.parse(localStorage.getItem("regoju_cart")) || [];

// Fetch products from API on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    updateCartUI();
});

// Fetch products from backend database
async function fetchProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (data.success && data.products) {
            grid.innerHTML = data.products.map(product => `
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="${product.image_url}" alt="${product.name}">
                    </div>
                    <div class="product-details">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-desc">${product.description || "Premium handcrafted furniture."}</p>
                        <div class="product-price-row">
                            <span class="product-price">₹${Math.round(product.price)}</span>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${escapeQuote(product.name)}', ${product.price}, '${product.image_url}')">Add to Cart</button>
                            <button class="buy-now-btn" onclick="buyNow(${product.id}, '${escapeQuote(product.name)}', ${product.price}, '${product.image_url}')">Buy Now</button>
                        </div>
                    </div>
                </div>
            `).join("");
        } else {
            grid.innerHTML = "<p>Failed to load products. Please try again later.</p>";
        }
    } catch (err) {
        console.error("Error fetching products:", err);
        grid.innerHTML = "<p>Error loading products from server.</p>";
    }
}

function escapeQuote(str) {
    return str.replace(/'/g, "\\'");
}

// Add item to cart
window.addToCart = function(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, image_url: img, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    openCartSidebar();
};

// Buy Now function
window.buyNow = function(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (!existing) {
        cart.push({ id, name, price, image_url: img, quantity: 1 });
    }
    saveCart();
    window.location.href = "checkout.html";
};

// Save cart to localstorage
function saveCart() {
    localStorage.setItem("regoju_cart", JSON.stringify(cart));
}

// Update UI
function updateCartUI() {
    const itemsContainer = document.getElementById("cartItemsContainer");
    const badge = document.getElementById("cartBadge");
    const totalSpan = document.getElementById("cartTotalPrice");
    
    if (!itemsContainer) return;
    
    // Update Badge
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) badge.innerText = totalQty;
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p style="color: #94a3b8; text-align: center; margin-top: 50px;">Your cart is empty.</p>`;
        if (totalSpan) totalSpan.innerText = "₹0";
        return;
    }
    
    let total = 0;
    itemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${Math.round(item.price)}</div>
                    <div class="cart-item-qty-row">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join("");
    
    if (totalSpan) totalSpan.innerText = "₹" + total;
}

// Update quantity
window.updateQty = function(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    }
};

// Remove from cart
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
};

// Cart Sidebar controls
const cartSidebar = document.getElementById("cartSidebar");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");

if (cartToggleBtn && cartSidebar) {
    cartToggleBtn.addEventListener("click", openCartSidebar);
}
if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener("click", closeCartSidebar);
}
if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        window.location.href = "checkout.html";
    });
}

function openCartSidebar() {
    if (cartSidebar) cartSidebar.classList.add("open");
}
function closeCartSidebar() {
    if (cartSidebar) cartSidebar.classList.remove("open");
}
