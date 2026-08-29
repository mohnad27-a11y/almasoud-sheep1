(() => {
  const CART_KEY = "almasoud_cart_v2";
  const WHATSAPP_NUMBER = "966506113217";

  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

      if (!Array.isArray(saved)) return [];

      return saved
        .filter(item => item && item.id != null)
        .map(item => ({
          id: String(item.id),
          name: String(item.name || "منتج"),
          price: Number(item.price) || 0,
          image: String(item.image || ""),
          quantity: Math.max(1, Number(item.quantity) || 1)
        }));
    } catch (error) {
      console.error("تعذر تحميل السلة:", error);
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(product) {
    if (!product || product.id == null) return;

    const id = String(product.id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
      existing.quantity += Math.max(1, Number(product.quantity) || 1);
    } else {
      cart.push({
        id,
        name: String(product.name || product.title || "منتج"),
        price: Number(product.price) || 0,
        image: String(product.image || ""),
        quantity: Math.max(1, Number(product.quantity) || 1)
      });
    }

    saveCart();
    renderCart();

    showMessage("تمت إضافة المنتج إلى السلة");
  }

  function removeFromCart(id) {
    const productId = String(id);

    cart = cart.filter(item => item.id !== productId);

    saveCart();
    renderCart();
  }

  function updateQuantity(id, quantity) {
    const productId = String(id);
    const item = cart.find(product => product.id === productId);

    if (!item) return;

    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    item.quantity = Math.max(1, newQuantity);

    saveCart();
    renderCart();
  }

  function increaseQuantity(id) {
    const item = cart.find(product => product.id === String(id));

    if (!item) return;

    item.quantity += 1;

    saveCart();
    renderCart();
  }

  function decreaseQuantity(id) {
    const item = cart.find(product => product.id === String(id));

    if (!item) return;

    if (item.quantity <= 1) {
      removeFromCart(id);
      return;
    }

    item.quantity -= 1;

    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function getCart() {
    return [...cart];
  }

  function getCartTotal() {
    return cart.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0
    );
  }

  function getCartCount() {
    return cart.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );
  }

  function formatPrice(price) {
    return `${Number(price || 0).toLocaleString("ar-SA")} ر.س`;
  }

  function updateCartCount() {
    const count = getCartCount();

    const selectors = [
      "#cart-count",
      ".cart-count",
      "[data-cart-count]"
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? "" : "none";
      });
    });
  }

  function renderCart() {
    updateCartCount();

    const container =
      document.getElementById("cart-items") ||
      document.querySelector("[data-cart-items]");

    const totalElement =
      document.getElementById("cart-total") ||
      document.querySelector("[data-cart-total]");

    const emptyElement =
      document.getElementById("empty-cart") ||
      document.querySelector("[data-empty-cart]");

    if (totalElement) {
      totalElement.textContent = formatPrice(getCartTotal());
    }

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <p>السلة فارغة حالياً</p>
          <a href="index.html">العودة للتسوق</a>
        </div>
      `;

      if (emptyElement) {
        emptyElement.style.display = "";
      }

      return;
    }

    if (emptyElement) {
      emptyElement.style.display = "none";
    }

    container.innerHTML = cart
      .map(
        item => `
          <div class="cart-item" data-id="${escapeHtml(item.id)}">

            ${
              item.image
                ? `
                  <img
                    src="${escapeHtml(item.image)}"
                    alt="${escapeHtml(item.name)}"
                    class="cart-item-image"
                  >
                `
                : ""
            }

            <div class="cart-item-info">
              <h3>${escapeHtml(item.name)}</h3>

              <div class="cart-item-price">
                ${formatPrice(item.price)}
              </div>

              <div class="cart-quantity">
                <button
                  type="button"
                  onclick="decreaseCartQuantity('${escapeJs(item.id)}')"
                  aria-label="تقليل الكمية"
                >
                  −
                </button>

                <span>${item.quantity}</span>

                <button
                  type="button"
                  onclick="increaseCartQuantity('${escapeJs(item.id)}')"
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>

              <div class="cart-item-subtotal">
                الإجمالي:
                ${formatPrice(item.price * item.quantity)}
              </div>

              <button
                type="button"
                class="remove-cart-item"
                onclick="removeFromCart('${escapeJs(item.id)}')"
              >
                حذف
              </button>
            </div>

          </div>
        `
      )
      .join("");
  }

  function sendOrderToWhatsApp() {
    if (cart.length === 0) {
      showMessage("السلة فارغة");
      return;
    }

    const lines = [];

    lines.push("السلام عليكم");
    lines.push("أرغب في طلب المنتجات التالية من شركة المسعود للأغنام:");
    lines.push("");

    cart.forEach((item, index) => {
      lines.push(
        `${index + 1}- ${item.name}`,
        `الكمية: ${item.quantity}`,
        `السعر: ${formatPrice(item.price)}`,
        `الإجمالي: ${formatPrice(item.price * item.quantity)}`,
        ""
      );
    });

    lines.push(`إجمالي الطلب: ${formatPrice(getCartTotal())}`);
    lines.push("");
    lines.push("فضلاً أرسلوا لي تفاصيل تأكيد الطلب.");

    const message = encodeURIComponent(lines.join("\n"));

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.location.href = whatsappUrl;
  }

  function showMessage(message) {
    let notification = document.getElementById("cart-notification");

    if (!notification) {
      notification = document.createElement("div");
      notification.id = "cart-notification";

      Object.assign(notification.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#222",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "10px",
        zIndex: "99999",
        fontSize: "15px",
        textAlign: "center",
        maxWidth: "90%"
      });

      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = "block";

    clearTimeout(notification._timer);

    notification._timer = setTimeout(() => {
      notification.style.display = "none";
    }, 2200);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeJs(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    const whatsappButtons = document.querySelectorAll(
      "#whatsapp-order, .whatsapp-order, [data-whatsapp-order]"
    );

    whatsappButtons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        sendOrderToWhatsApp();
      });
    });

    const clearButtons = document.querySelectorAll(
      "#clear-cart, .clear-cart, [data-clear-cart]"
    );

    clearButtons.forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        clearCart();
      });
    });
  });

  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.updateCartQuantity = updateQuantity;
  window.increaseCartQuantity = increaseQuantity;
  window.decreaseCartQuantity = decreaseQuantity;
  window.clearCart = clearCart;
  window.getCart = getCart;
  window.getCartTotal = getCartTotal;
  window.sendOrderToWhatsApp = sendOrderToWhatsApp;
})();
