document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("auth-token")) {
        window.location.href = "../index.html";
        return;
    }

    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const loginTabContent = document.getElementById("login-tab-content");
    const registerTabContent = document.getElementById("register-tab-content");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorAlert = document.getElementById("login-error-alert");
    const errorMsg = document.getElementById("login-error-msg");
    
    const loginSubmitBtn = document.getElementById("login-submit-btn");
    const loginBtnSpinner = document.getElementById("login-btn-spinner");

    const registerSubmitBtn = document.getElementById("register-submit-btn");
    const registerBtnSpinner = document.getElementById("register-btn-spinner");

    if (tabLogin && tabRegister && loginTabContent && registerTabContent) {
        tabLogin.addEventListener("click", () => {
            tabLogin.classList.replace("border-transparent", "border-primary");
            tabLogin.classList.replace("text-muted", "text-primary");
            tabRegister.classList.replace("border-primary", "border-transparent");
            tabRegister.classList.replace("text-primary", "text-muted");

            loginTabContent.classList.remove("d-none");
            registerTabContent.classList.add("d-none");
            errorAlert.classList.add("d-none");
        });

        tabRegister.addEventListener("click", () => {
            tabRegister.classList.replace("border-transparent", "border-primary");
            tabRegister.classList.replace("text-muted", "text-primary");
            tabLogin.classList.replace("border-primary", "border-transparent");
            tabLogin.classList.replace("text-primary", "text-muted");

            registerTabContent.classList.remove("d-none");
            loginTabContent.classList.add("d-none");
            errorAlert.classList.add("d-none");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorAlert.classList.add("d-none");
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) return;

            loginSubmitBtn.disabled = true;
            loginBtnSpinner.classList.remove("d-none");

            try {
                if (!window.ApiService || typeof window.ApiService.post !== "function") {
                    throw new Error("El servicio API no está configurado correctamente.");
                }

                const result = await window.ApiService.post("/auth/login", {
                    username: username,
                    password: password
                });

                if (result && result.token) {
                    localStorage.setItem("auth-token", result.token);
                    localStorage.setItem("auth-username", username);

                    if (window.UI && typeof window.UI.showToast === "function") {
                        window.UI.showToast(`¡Bienvenido de nuevo, ${username}!`, "success");
                    }

                    setTimeout(() => {
                        window.location.href = "../index.html";
                    }, 1500);
                } else {
                    throw new Error("No se recibió un token válido del servidor.");
                }
            } catch (err) {
                console.error("Error al iniciar sesión:", err);
                
                loginSubmitBtn.disabled = false;
                loginBtnSpinner.classList.add("d-none");

                errorMsg.textContent = "Credenciales incorrectas. Por favor verifica el usuario y la contraseña.";
                errorAlert.classList.remove("d-none");
                
                if (window.UI && typeof window.UI.showToast === "function") {
                    window.UI.showToast("Error al iniciar sesión", "error");
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const regName = document.getElementById("reg-name").value.trim();
            const regEmail = document.getElementById("reg-email").value.trim();
            const regUser = document.getElementById("reg-username").value.trim();
            const regPass = document.getElementById("reg-password").value;

            if (!regName || !regEmail || !regUser || !regPass) return;

            registerSubmitBtn.disabled = true;
            registerBtnSpinner.classList.remove("d-none");

            setTimeout(() => {
                registerSubmitBtn.disabled = false;
                registerBtnSpinner.classList.add("d-none");

                if (window.UI && typeof window.UI.showToast === "function") {
                    window.UI.showToast("¡Registro exitoso! Ya puedes iniciar sesión.", "success");
                }

                registerForm.reset();

                if (tabLogin) {
                    tabLogin.click();
                }
            }, 1200);
        });
    }
});
