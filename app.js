function checkInternetConnection() {
  if (!navigator.onLine) {
    document.body.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        min-height:100vh;
        text-align:center;
        font-family:Arial,sans-serif;
        background:#f7f7f7;
        padding:20px;
      ">
        <div>
          <h2>لا يوجد اتصال بالإنترنت</h2>
          <p>يرجى الاتصال بالإنترنت ثم إعادة المحاولة.</p>
          <button onclick="location.reload()" style="
            padding:12px 20px;
            border:none;
            border-radius:8px;
            background:#222;
            color:#fff;
            font-size:16px;
          ">
            إعادة المحاولة
          </button>
        </div>
      </div>
    `;
    return false;
  }

  return true;
}

window.addEventListener("load", () => {
  checkInternetConnection();
});

window.addEventListener("offline", () => {
  checkInternetConnection();
});

window.addEventListener("online", () => {
  location.reload();
});
