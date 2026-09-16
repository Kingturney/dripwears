// ============ CONFIG ============
const WHATSAPP_NUMBER = '254714330593'; // Kenya code + your number (no leading 0)

// ============ CART STORAGE ============
function getCart() {
  return JSON.parse(localStorage.getItem('drip_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('drip_cart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

// ============ ADD TO CART ============
function addToCart(id, name, price, image) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  saveCart(cart);
  showToast(`✅ ${name} added to cart`);
}

// ============ TOAST ============
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #00e5ff, #39ff14);
      color: #0a0e17; padding: 0.9rem 1.5rem; border-radius: 8px;
      font-weight: 800; z-index: 9999; box-shadow: 0 0 25px rgba(57,255,20,0.6);
      transition: opacity 0.3s; opacity: 0;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.style.opacity = '0', 2000);
}

// ============ WHATSAPP LINK ============
function whatsappLink(text = '') {
  const encoded = encodeURIComponent(text || 'Hi DRIP&OUTFITS! I would like to make an enquiry.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

// ============ CART PAGE ============
function renderCart() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty 🛒</h2>
        <p style="margin-top:1rem;">Browse our <a href="clothes.html">clothes</a>,
        <a href="shoes.html">shoes</a>, or <a href="others.html">other items</a>.</p>
      </div>`;
    if (summary) summary.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="price">KSh ${item.price.toLocaleString()}</div>
      </div>
      <div class="qty-controls">
        <button onclick="changeQty('${item.id}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = 'KSh ' + total.toLocaleString();
  if (summary) summary.style.display = 'block';
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

// ============ PLACE ORDER → WHATSAPP ============
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  let message = `🛍️ *NEW ORDER — DRIP&OUTFITS*\n\n`;
  cart.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}*\n`;
    message += `   Qty: ${item.qty} × KSh ${item.price.toLocaleString()}\n`;
    message += `   Subtotal: KSh ${(item.qty * item.price).toLocaleString()}\n\n`;
  });
  message += `━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: KSh ${total.toLocaleString()}*\n\n`;
  message += `Please confirm my order and share delivery details. Thank you!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ============ NAV DROPDOWN (mobile tap) ============
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();

  // Make dropdown work on tap (mobile)
  document.querySelectorAll('.dropdown > button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.parentElement;
      document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== parent) d.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // Update WhatsApp buttons with proper link
  document.querySelectorAll('.whatsapp-btn').forEach(btn => {
    btn.href = whatsappLink();
  });
});