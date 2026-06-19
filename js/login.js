document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("auth-token")) {
        window.location.href = "../index.html";
        return;
    }

    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorAlert = document.getElementById("login-error-alert");
    const errorMsg = document.getElementById("login-error-msg");
    const submitBtn = document.getElementById("login-submit-btn");
    const btnSpinner = document.getElementById("login-btn-spinner");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            errorAlert.classList.add("d-none");
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) return;

            submitBtn.disabled = true;
            btnSpinner.classList.remove("d-none");

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
                
                submitBtn.disabled = false;
                btnSpinner.classList.add("d-none");

                errorMsg.textContent = "Credenciales incorrectas. Por favor verifica el usuario y la contraseña.";
                errorAlert.classList.remove("d-none");
                
                if (window.UI && typeof window.UI.showToast === "function") {
                    window.UI.showToast("Error al iniciar sesión", "error");
                }
            }
        });
    }
});
