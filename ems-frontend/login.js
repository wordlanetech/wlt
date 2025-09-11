document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    const loginContent = document.getElementById('loginContent');
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('user_id');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const messageBox = document.getElementById('messageBox');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    let messageTimeout;

    // Enhanced message display with icons and animations
    const showMessage = (message, type) => {
        clearTimeout(messageTimeout);
        messageBox.textContent = message;
        messageBox.className = `p-4 rounded-lg text-sm font-medium show transition-all duration-300 ${type === 'success' ? 'message-success' : 'message-error'}`;
        
        // Add entrance animation
        messageBox.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            messageBox.style.transform = 'translateY(0)';
        }, 10);
        
        messageTimeout = setTimeout(() => {
            messageBox.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                messageBox.classList.remove('show');
                messageBox.style.transform = 'translateY(0)';
            }, 300);
        }, 5000);
    };

    // Enhanced splash screen animation sequence with smoother transitions
    const initializeSplashScreen = () => {
        // Ensure splash screen is fully visible first
        splashScreen.style.opacity = '1';
        splashScreen.style.transform = 'scale(1)';
        
        setTimeout(() => {
            // Start gentle fade and scale transition
            splashScreen.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            splashScreen.style.transform = 'scale(1.05)';
            splashScreen.style.filter = 'blur(2px)';
            splashScreen.style.opacity = '0.9';
            
            setTimeout(() => {
                // Enhanced exit animation
                splashScreen.style.transition = 'all 0.8s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
                splashScreen.style.transform = 'scale(1.3)';
                splashScreen.style.filter = 'blur(8px)';
                splashScreen.style.opacity = '0';
                
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    
                    // Smooth login content entrance
                    loginContent.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    loginContent.classList.add('visible');
                    
                    // Staggered entrance effect for form elements with smoother timing
                    setTimeout(() => {
                        const formElements = loginForm.querySelectorAll('.input-group, .login-btn');
                        formElements.forEach((element, index) => {
                            element.style.opacity = '0';
                            element.style.transform = 'translateY(30px)';
                            element.style.filter = 'blur(5px)';
                            
                            setTimeout(() => {
                                element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                element.style.opacity = '1';
                                element.style.transform = 'translateY(0)';
                                element.style.filter = 'blur(0px)';
                            }, index * 150); // Increased stagger timing
                        });
                    }, 300);
                }, 800);
            }, 600);
        }, 4000); // Slightly longer initial display
    };

    // Initialize splash screen
    initializeSplashScreen();

    // Enhanced toggle password functionality with smooth transitions
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePasswordBtn.querySelector('i');
        
        // Add rotation animation
        icon.style.transform = 'rotate(180deg)';
        
        setTimeout(() => {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
            icon.style.transform = 'rotate(0deg)';
        }, 150);
        
        // Add haptic feedback simulation
        togglePasswordBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            togglePasswordBtn.style.transform = 'scale(1)';
        }, 100);
    });

    // Enhanced input validation and feedback
    const addInputValidation = () => {
        [userIdInput, passwordInput].forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const inputGroup = e.target.closest('.input-group');
                
                if (value.length > 0) {
                    inputGroup.classList.add('has-content');
                } else {
                    inputGroup.classList.remove('has-content');
                }
            });
            
            input.addEventListener('focus', (e) => {
                const inputGroup = e.target.closest('.input-group');
                inputGroup.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', (e) => {
                const inputGroup = e.target.closest('.input-group');
                inputGroup.style.transform = 'translateY(0)';
            });
        });
    };

    // Initialize input validation
    addInputValidation();

    // Enhanced loading state management
    const setLoadingState = (isLoading) => {
        if (isLoading) {
            loginButton.disabled = true;
            loginButton.style.opacity = '0.8';
            loginButton.querySelector('span').textContent = 'Signing In...';
            loginSpinner.classList.remove('hidden');
            
            // Add pulse effect
            loginButton.style.animation = 'pulse 2s infinite';
        } else {
            loginButton.disabled = false;
            loginButton.style.opacity = '1';
            loginButton.querySelector('span').textContent = 'Sign In';
            loginSpinner.classList.add('hidden');
            loginButton.style.animation = 'none';
        }
    };

    // Enhanced login form submission with better UX
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user_id = userIdInput.value.trim();
        const password_hash = passwordInput.value;

        // Enhanced validation with visual feedback
        if (!user_id) {
            showMessage('Please enter your User ID.', 'error');
            userIdInput.focus();
            userIdInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                userIdInput.style.borderColor = '';
            }, 3000);
            return;
        }

        if (!password_hash) {
            showMessage('Please enter your Password.', 'error');
            passwordInput.focus();
            passwordInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                passwordInput.style.borderColor = '';
            }, 3000);
            return;
        }

        if (password_hash.length < 3) {
            showMessage('Password must be at least 3 characters long.', 'error');
            passwordInput.focus();
            return;
        }

        // Start loading state
        setLoadingState(true);

        try {
            // ✅ Correct API endpoint with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch("https://dashboard.wordlanetech.com/api/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, password_hash }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                // Store user data securely
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('role_id', data.role_id);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    user_id: data.user_id,
                    role_id: data.role_id,
                    name: data.name || data.user_id
                }));

                showMessage(`✅ Login successful! Welcome, ${data.user_id}.`, 'success');
                
                // Add success animation to login button
                loginButton.style.background = 'linear-gradient(135deg, #22c55e 0%, #00BFFF 100%)';
                loginButton.innerHTML = '<i class="fas fa-check mr-2"></i><span>Success!</span>';
                
                // Enhanced redirect with fade effect
                setTimeout(() => {
                    loginContent.style.opacity = '0';
                    loginContent.style.transform = 'translateY(-30px) scale(0.95)';
                    
                    setTimeout(() => {
                        window.location.href = data.redirect_page;
                    }, 500);
                }, 1000);
                
            } else {
                // Enhanced error handling
                const errorMessage = data.message || 'Invalid credentials. Please check your User ID and password.';
                showMessage(errorMessage, 'error');
                
                // Add shake animation to form
                loginForm.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    loginForm.style.animation = 'none';
                }, 500);
                
                // Reset form state
                setLoadingState(false);
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = '⚠️ Connection failed. Please check your internet connection and try again.';
            
            if (error.name === 'AbortError') {
                errorMessage = '⏱️ Request timed out. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '🌐 Unable to connect to server. Please check your connection.';
            }
            
            showMessage(errorMessage, 'error');
            setLoadingState(false);
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + L to focus on user ID input
        if (e.altKey && e.key === 'l') {
            e.preventDefault();
            userIdInput.focus();
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            userIdInput.value = '';
            passwordInput.value = '';
            messageBox.classList.remove('show');
        }
    });

    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }
        
        .input-group.has-content .icon {
            color: #00BFFF !important;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    // Auto-focus on user ID input when page loads with smooth timing
    setTimeout(() => {
        if (loginContent.classList.contains('visible')) {
            userIdInput.focus();
            // Add gentle focus animation
            userIdInput.style.transition = 'all 0.3s ease';
            userIdInput.style.transform = 'scale(1.02)';
            setTimeout(() => {
                userIdInput.style.transform = 'scale(1)';
            }, 300);
        }
    }, 2500); // Adjusted timing for smoother flow
});
