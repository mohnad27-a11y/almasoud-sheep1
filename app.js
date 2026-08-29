/* شركة المسعود للأغنام - التطبيق الرئيسي */
(() => {
  const CART_KEY = "almasoud_cart_v2";
  const FAV_KEY = "almasoud_favorites_v1";

  let savedCart = [];
  let savedFavs = [];

  try {
    savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (_) {}

  try {
    savedFavs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch (_) {}

  // استعادة السلة والمفضلة
  if (Array.isArray(savedCart)) {
    cart.length = 0;

    savedCart.forEach(item => {
      if (
        item &&
        item.name &&
        Number.isFinite(Number(item.price))
      ) {
        cart.push({
          name: item.name,
          price: Number(item.price),
          qty: Math.max(1, Number(item.qty || 1))
        });
      }
    });
  }

  function saveCart() {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );
  }

  function cartQuantity() {
    return cart.reduce(
      (sum, item) => sum + (item.qty || 1),
      0
    );
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartCount");

    if (badge) {
      badge.textContent = cartQuantity();
    }
  }

  // إضافة المنتج للسلة
  window.addToCart = function(name, price) {
    const existing = cart.find(
      item => item.name === name
    );

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        name,
        price: Number(price),
        qty: 1
      });
    }

    saveCart();
    updateCartBadge();

    alert("تمت إضافة " + name + " إلى السلة");
  };

  // حذف منتج من السلة
  window.removeFromCart = function(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);

      saveCart();
      updateCartBadge();
      openCart();
    }
  };

  // تغيير الكمية
  window.changeCartQty = function(index, delta) {
    const item = cart[index];

    if (!item) return;

    item.qty = Math.max(
      1,
      (item.qty || 1) + delta
    );

    saveCart();
    openCart();
  };

  // فتح السلة
  window.openCart = function() {
    const itemsBox =
      document.getElementById("cartItems");

    const totalBox =
      document.getElementById("cartTotal");

    const link =
      document.getElementById("orderLink");

    if (!itemsBox || !totalBox || !link) {
      return;
    }

    itemsBox.innerHTML = "";

    let total = 0;

    if (!cart.length) {
      itemsBox.innerHTML =
        "<p>السلة فارغة حاليًا.</p>";

      link.style.pointerEvents = "none";
      link.style.opacity = ".5";
      link.href = "#";

    } else {
      link.style.pointerEvents = "auto";
      link.style.opacity = "1";

      cart.forEach((item, i) => {
        const qty = item.qty || 1;

        const subtotal =
          Number(item.price) * qty;

        total += subtotal;

        const row =
          document.createElement("div");

        row.className = "cart-item";

        row.innerHTML = `
          <div style="flex:1">
            <strong>
              ${escapeHtml(item.name)}
            </strong>

            <div style="
              font-size:12px;
              color:var(--muted);
              margin-top:5px
            ">
              ${Number(item.price).toLocaleString("ar-SA")}
              ر.س للوحدة
            </div>

            <div style="
              display:flex;
              align-items:center;
              gap:7px;
              margin-top:8px
            ">
              <button
                type="button"
                onclick="changeCartQty(${i},-1)"
                style="
                  border:0;
                  border-radius:8px;
                  padding:5px 10px
                "
              >
                −
              </button>

              <b>${qty}</b>

              <button
                type="button"
                onclick="changeCartQty(${i},1)"
                style="
                  border:0;
                  border-radius:8px;
                  padding:5px 10px
                "
              >
                +
              </button>

              <button
                type="button"
                onclick="removeFromCart(${i})"
                style="
                  border:0;
                  background:#f1dede;
                  color:#8b2f2f;
                  border-radius:8px;
                  padding:5px 9px
                "
              >
                حذف
              </button>
            </div>
          </div>

          <b>
            ${subtotal.toLocaleString("ar-SA")} ر.س
          </b>
        `;

        itemsBox.appendChild(row);
      });

      // رسالة الطلب
      let msg =
        "طلب جديد من موقع شركة المسعود للأغنام:\n\n";

      cart.forEach((item, i) => {
        msg +=
          `${i + 1}- ${item.name} × ${item.qty || 1} - ` +
          `${item.price * (item.qty || 1)} ريال\n`;
      });

      msg += `\nالإجمالي: ${total} ريال`;

      link.href =
        "sms:0506113217?body=" +
        encodeURIComponent(msg);
    }

    totalBox.textContent =
      total.toLocaleString("ar-SA");

    document
      .getElementById("cartModal")
      ?.classList.add("open");

    updateCartBadge();
  };

  // إضافة البحث
  function addSearch() {
    if (
      document.getElementById("productSearch")
    ) {
      return;
    }

    const section =
      document.getElementById("offers");

    if (!section) return;

    const head =
      section.querySelector(".section-head");

    if (!head) return;

    const box =
      document.createElement("div");

    box.style.margin = "0 0 12px";

    box.innerHTML = `
      <input
        id="productSearch"
        type="search"
        placeholder="ابحث عن خروف، نعيمي، حري..."
        aria-label="البحث عن المنتجات"
        style="
          width:100%;
          padding:13px 15px;
          border:1px solid var(--line);
          border-radius:13px;
          background:#fffaf3;
          font-size:15px;
          outline:none
        "
      >
    `;

    head.insertAdjacentElement(
      "afterend",
      box
    );

    const input =
      box.querySelector("#productSearch");

    input.addEventListener("input", () => {
      const q =
        input.value.trim().toLowerCase();

      document
        .querySelectorAll(".product")
        .forEach(card => {
          const text =
            card.textContent.toLowerCase();

          card.classList.toggle(
            "hidden",
            q && !text.includes(q)
          );
        });
    });
  }

  // إعداد المفضلة
  function setupFavorites() {
    document
      .querySelectorAll(".product")
      .forEach(card => {

        const name =
          card
            .querySelector("h4")
            ?.textContent
            ?.trim();

        const btn =
          card.querySelector(".fav");

        if (!name || !btn) return;

        if (savedFavs.includes(name)) {
          btn.textContent = "♥";
          btn.style.color = "#a33";
        }

        btn.addEventListener(
          "click",
          () => {

            const nowFav =
              btn.textContent === "♥";

            if (nowFav) {
              if (
                !savedFavs.includes(name)
              ) {
                savedFavs.push(name);
              }
            } else {
              savedFavs =
                savedFavs.filter(
                  x => x !== name
                );
            }

            localStorage.setItem(
              FAV_KEY,
              JSON.stringify(savedFavs)
            );
          }
        );
      });
  }

  // حماية النصوص
  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[ch])
    );
  }

  // إغلاق النوافذ عند الضغط خارج البطاقة
  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        e => {
          if (e.target === modal) {
            modal.classList.remove("open");
          }
        }
      );
    });

  // منع تأكيد طلب بسلة فارغة
  document
    .getElementById("orderLink")
    ?.addEventListener(
      "click",
      e => {

        if (!cart.length) {
          e.preventDefault();

          alert(
            "أضف منتجًا إلى السلة أولًا."
          );
        }
      }
    );

  addSearch();
  setupFavorites();
  updateCartBadge();

})();
