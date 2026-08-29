(() => {
  const CART_KEY = "almasoud_cart_v2";
  const WHATSAPP_NUMBER = "966506113217";

  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      if (!Array.isArray(saved)) return [];

      return saved
        .filter(item =>
          item &&
          item.name &&
          Number.isFinite(Number(item.price))
        )
        .map(item => ({
          name: String(item.name),
          price: Number(item.price),
          qty: Math.max(1, Number(item.qty) || 1)
        }));
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    updateCartCount();
  }

  function getCartQuantity() {
    return cart.reduce(
      (total, item) => total + item.qty,
      0
    );
  }

  function updateCartCount() {
    const cartCount =
      document.getElementById("cartCount");

    if (cartCount) {
      cartCount.textContent = getCartQuantity();
    }
  }

  function formatPrice(price) {
    return Number(price).toLocaleString("ar-SA");
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
  }

  function addToCart(name, price) {
    const productName = String(name).trim();
    const productPrice = Number(price);

    if (
      !productName ||
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      alert("تعذر إضافة المنتج إلى السلة.");
      return;
    }

    const existingItem = cart.find(
      item => item.name === productName
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        name: productName,
        price: productPrice,
        qty: 1
      });
    }

    saveCart();

    alert(
      "تمت إضافة " +
      productName +
      " إلى السلة"
    );
  }

  function removeFromCart(index) {
    if (
      index < 0 ||
      index >= cart.length
    ) {
      return;
    }

    cart.splice(index, 1);
    saveCart();
    openCart();
  }

  function changeCartQty(index, amount) {
    const item = cart[index];

    if (!item) return;

    item.qty += Number(amount);

    if (item.qty <= 0) {
      cart.splice(index, 1);
    }

    saveCart();
    openCart();
  }

  function clearCart() {
    if (!cart.length) return;

    const confirmed = confirm(
      "هل تريد تفريغ السلة بالكامل؟"
    );

    if (!confirmed) return;

    cart = [];
    saveCart();
    openCart();
  }

  function createOrderMessage(total) {
    let message =
      "طلب جديد من موقع شركة المسعود للأغنام:\n\n";

    cart.forEach((item, index) => {
      const subtotal =
        item.price * item.qty;

      message +=
        `${index + 1}- ${item.name}\n` +
        `الكمية: ${item.qty}\n` +
        `السعر: ${formatPrice(subtotal)} ريال\n\n`;
    });

    message +=
      `الإجمالي: ${formatPrice(total)} ريال`;

    return message;
  }

  function openCart() {
    const cartItems =
      document.getElementById("cartItems");

    const cartTotal =
      document.getElementById("cartTotal");

    const orderLink =
      document.getElementById("orderLink");

    const cartModal =
      document.getElementById("cartModal");

    if (
      !cartItems ||
      !cartTotal ||
      !orderLink ||
      !cartModal
    ) {
      return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    if (!cart.length) {
      cartItems.innerHTML =
        "<p>السلة فارغة حاليًا.</p>";

      orderLink.href = "#";
      orderLink.removeAttribute("target");
