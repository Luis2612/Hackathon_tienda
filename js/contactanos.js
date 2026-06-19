const form = document.getElementById("formContacto");
const respuesta = document.getElementById("respuesta");
if (window.Carrito) {
  window.Carrito.init();
}
window.addEventListener("cart-updated", (event) => {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const totalQty = event.detail.totalQty;
    badge.textContent = totalQty;
    if (totalQty === 0) {
      badge.classList.add("d-none");
    } else {
      badge.classList.remove("d-none");
    }
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  if (nombre === "" || email === "" || mensaje === "") {
    respuesta.textContent = "⚠️ Por favor completa todos los campos";
    respuesta.style.color = "red";
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    respuesta.textContent = "⚠️ Ingresa un correo válido";
    respuesta.style.color = "red";
    return;
  }

  respuesta.textContent = "✅ Mensaje enviado correctamente. Te responderemos pronto 💌";
  respuesta.style.color = "green";

  form.reset();
});
