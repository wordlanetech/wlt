document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken"); // or sessionStorage

    if (!token) {
      // No login token, redirect to login
      window.location.href = "./login.html";
    }
  });