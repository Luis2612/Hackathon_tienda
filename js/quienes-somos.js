
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
