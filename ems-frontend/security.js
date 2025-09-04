  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken"); // saved after login

    if (!token) {
      window.location.href = "/a/login.html"; // redirect if no token
    } else {
      try {
        // Optional: verify expiry by decoding token payload
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("authToken");
          window.location.href = "/a/login.html";
        }
      } catch (e) {
        localStorage.removeItem("authToken");
        window.location.href = "/a/login.html";
      }
    }
  });
