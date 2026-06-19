const form = document.getElementById("formContacto");
const respuesta = document.getElementById("respuesta");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  if (nombre === "" || email === "" || mensaje === "") {
    respuesta.textContent = "Por favor completa todos los campos";
    respuesta.style.color = "red";
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    respuesta.textContent = "Ingresa un correo válido";
    respuesta.style.color = "red";
    return;
  }

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      respuesta.textContent = "✅ Mensaje enviado correctamente. Te responderemos pronto 💌";
      respuesta.style.color = "green";
      form.reset();
    } else {
      respuesta.textContent = "❌ Error al enviar el mensaje.";
      respuesta.style.color = "red";
    }

  } catch (error) {
    respuesta.textContent = "❌ No se pudo conectar con el servidor.";
    respuesta.style.color = "red";
  }
});
