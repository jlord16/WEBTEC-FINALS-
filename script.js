// ============================
// 🛒 Load saved cart or create new
// ============================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ============================
// 📦 Add to Cart on product pages
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".product-card .btn");

  addButtons.forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      const card = e.target.closest(".product-card");
      const name = card.querySelector("h5").textContent;
      const priceText = card.querySelector(".price").textContent.replace("₱", "").replace(",", "");
      const price = parseFloat(priceText);
      const image = card.querySelector("img")?.src || "https://via.placeholder.com/200";

      addToCart(name, price, image);
    });
  });

  updateCartTotal();

  // Auto-display cart if on cart.html
  if (window.location.pathname.endsWith("cart.html")) {
    displayCart();
  }
});

// ============================
// ➕ Add item to cart
// ============================
function addToCart(name, price, image) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showNotification(`${name} added to your cart! 🛍️`);
  updateCartTotal();
}

// ============================
// 🔔 Show small success notification
// ============================
function showNotification(message) {
  const notif = document.createElement("div");
  notif.className = "alert alert-success position-fixed top-0 end-0 m-3 shadow";
  notif.style.zIndex = "1055";
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 1000);
}

// ============================
// 💰 Update cart total badge
// ============================
function updateCartTotal() {
  const totalBadge = document.getElementById("cartTotal");
  if (!totalBadge) return;

  const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  savedCart.forEach(item => total += item.price * item.quantity);

  totalBadge.textContent = `${total.toLocaleString()}`;
}

// ============================
// 🧾 Display Cart Items (for cart.html)
// ============================
function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const thankYouModalElement = document.getElementById("thankYouModal");

  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  let total = 0;

  // Empty cart message
  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
    if (cartTotal) cartTotal.textContent = "0";
    return;
  }

  // Render cart items
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartContainer.innerHTML += `
      <div class="card mb-3 shadow-sm">
        <div class="row g-0 align-items-center">
          <div class="col-md-2">
            <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
          </div>
          <div class="col-md-4">
            <div class="card-body">
              <h5 class="card-title mb-1">${item.name}</h5>
              <p class="card-text mb-0">₱${item.price}</p>
            </div>
          </div>
          <div class="col-md-2 text-center">
            <input type="number" class="form-control text-center quantity-input" 
              value="${item.quantity}" min="1" data-index="${index}">
          </div>
          <div class="col-md-2 text-center">
            <p class="fw-semibold mb-0">₱${itemTotal.toLocaleString()}</p>
          </div>
          <div class="col-md-2 text-center">
            <button class="btn btn-outline-danger btn-sm delete-btn" data-index="${index}">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  });

  cartTotal.textContent = total.toLocaleString();

  // ============================
  // ✏️ Quantity Update
  // ============================
  document.querySelectorAll(".quantity-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      const newQty = parseInt(e.target.value);
      if (newQty > 0) {
        cart[index].quantity = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
      }
    });
  });

  // ============================
  // ❌ Delete Item
  // ============================
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.closest("button").dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      displayCart();
    });
  });

  // ============================
  // 🏁 Proceed to Checkout
  // ============================
  checkoutBtn.onclick = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Clear cart
    localStorage.removeItem("cart");
    cart = [];
    displayCart();
    updateCartTotal();

    // Show Thank You modal
    const thankYouModal = new bootstrap.Modal(thankYouModalElement);
    thankYouModal.show();

    // Optional: redirect after modal closes
    thankYouModalElement.addEventListener("hidden.bs.modal", () => {
      // Uncomment this if you want redirect
      // window.location.href = "index.html";
    });
  };
}

// 🔍 Handle search button click
// 🔍 SEARCH FUNCTION (Highlight and auto-scroll to matched items)
// ============================
// 🔍 SEARCH FUNCTIONALITY
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    // ✅ If on index.html, let the home search handle it — don't show alert
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
      localStorage.setItem("homeSearchQuery", query); // optional: keep it if you want
      return;
    }

    // ✅ Else, handle products page search
    handleSearch(query);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();

      if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        localStorage.setItem("homeSearchQuery", query);
        return;
      }

      handleSearch(query);
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query === "") clearHighlights();
  });

  // Auto search when redirected to products.html
  if (window.location.pathname.endsWith("products.html")) {
    const savedQuery = localStorage.getItem("searchQuery");
    if (savedQuery) {
      handleSearch(savedQuery);
      if (searchInput) searchInput.value = savedQuery;
      localStorage.removeItem("searchQuery");
    }
  }
});

// ============================
// 🔎 Handle search logic (for products.html only)
// ============================
function handleSearch(query) {
  if (!query) {
    clearHighlights();
    return;
  }

  const productCards = document.querySelectorAll(".product-card");
  if (productCards.length === 0) return; // ✅ Prevent alert on non-product pages

  let found = false;
  let firstMatch = null;

  productCards.forEach(card => {
    const productName = card.querySelector("h5").textContent.toLowerCase();

    if (productName.includes(query)) {
      found = true;
      card.classList.add("highlight-product");
      if (!firstMatch) firstMatch = card;
    } else {
      card.classList.remove("highlight-product");
    }
  });

  if (found && firstMatch) {
    firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert("No products found matching your search.");
  }
}

function clearHighlights() {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach(card => card.classList.remove("highlight-product"));
}

// contact.js
/// Contact Form Handler
document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    
    if(contactForm) {
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;
            
            // Create modal instance
            const thankYouModal = new bootstrap.Modal(document.getElementById('contactThankYouModal'));
            
            // Show modal
            thankYouModal.show();
            
            // Reset form
            contactForm.reset();
        });
    }
});





