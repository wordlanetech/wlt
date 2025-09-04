    document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  console.log("AuthCheck - Token:", token);

  if (!token) {
    console.log("No token found, redirecting...");
    window.location.href = "/a/login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("AuthCheck - Payload:", payload);

    if (payload.exp * 1000 < Date.now()) {
      console.log("Token expired, redirecting...");
      localStorage.removeItem("token");
      window.location.href = "/a/login.html";
      return;
    }
  } catch (e) {
    console.log("Invalid token, redirecting...", e);
    localStorage.removeItem("token");
    window.location.href = "/a/login.html";
  }
});