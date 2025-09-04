document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token"); // ✅ matches login.js

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      localStorage.clear(); // remove all user data
      window.location.href = "./login.html";
      return;
    }
  } catch (err) {
    localStorage.clear();
    window.location.href = "./login.html";
  }
});
