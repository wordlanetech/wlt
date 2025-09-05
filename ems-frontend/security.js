document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const roleId = localStorage.getItem("role_id");

  // 🚨 If not logged in, always redirect to login
  if (!token || !userId || !roleId) {
    localStorage.clear();
    window.location.href = "../login.html";  // change path if needed
    return;
  }

  // ✅ If you are using JWT tokens
  if (token.includes(".")) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        console.log("Token expired, redirecting...");
        localStorage.clear();
        window.location.href = "../login.html";
      }
    } catch (e) {
      console.log("Invalid token, redirecting...");
      localStorage.clear();
      window.location.href = "../login.html";
    }
  }
});
