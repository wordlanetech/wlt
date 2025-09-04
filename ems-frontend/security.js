// authCheck.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // No token → redirect to login
    window.location.href = "/a/login.html";
    return;
  }

  try {
    // Decode token payload to check expiry
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      // Token expired → remove and redirect
      localStorage.removeItem("authToken");
      window.location.href = "/a/login.html";
      return;
    }
  } catch (e) {
    // Invalid token → clear and redirect
    localStorage.removeItem("authToken");
    window.location.href = "/a/login.html";
  }
});
