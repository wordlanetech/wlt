document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    const loginContent = document.getElementById('loginContent');
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('user_id');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const messageBox = document.getElementById('messageBox');
    let messageTimeout;

    const showMessage = (message, type) => {
        clearTimeout(messageTimeout);
        messageBox.textContent = message;
        messageBox.className = `p-3 rounded-lg text-sm font-medium show ${type === 'success' ? 'message-success' : 'message-error'}`;
        messageTimeout = setTimeout(() => {
            messageBox.classList.remove('show');
        }, 5000);
    };

    // Splash animation
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            loginContent.classList.add('visible');
        }, 1000);
    }, 3000);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = togglePasswordBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Handle login form submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user_id = userIdInput.value.trim();
        const password_hash = passwordInput.value;

        if (!user_id || !password_hash) {
            showMessage('Please enter both User ID and Password.', 'error');
            return;
        }

        try {
            // ✅ Use relative path so Nginx proxies it to Node.js
            const response = await fetch("/api/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, password_hash })
                });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user_id', data.user_id);
                if (data.role_id) localStorage.setItem('role_id', data.role_id);
                if (data.token) localStorage.setItem('token', data.token);

                showMessage(
                    `✅ Login successful! Welcome, ${data.user_id}${data.role_id ? ' (Role: ' + data.role_id + ')' : ''}.`,
                    'success'
                );

                setTimeout(() => {
                    window.location.href = data.redirect_page || "dashboard.html";
                }, 1000);
            } else {
                showMessage(data.message || 'Invalid credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('⚠️ Could not connect to server.', 'error');
        }
    });
});
