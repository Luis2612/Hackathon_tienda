
document.addEventListener("DOMContentLoaded", () => {
  if (window.Carrito) {
    window.Carrito.init();
  }
  const cartItemsContainer = document.getElementById("cart-items");
  if (cartItemsContainer) {
    inicializarPaginaCarrito();
  }

});
function inicializarPaginaCarrito() {
  if (!window.Carrito || !window.UI) return;
  const items = window.Carrito.getItems();
  window.UI.mostrarCarrito(items);
  window.UI.actualizarResumen(
    window.Carrito.getSubtotal(),
    window.Carrito.getTax(),
    window.Carrito.getShipping(),
    window.Carrito.getTotal()
  );
  window.addEventListener("cart-updated", (event) => {
    const { items, subtotal, tax, shipping, total } = event.detail;
    window.UI.mostrarCarrito(items);
    window.UI.actualizarResumen(subtotal, tax, shipping, total);
  });
  const btnClearCart = document.getElementById("clear-cart");
  if (btnClearCart) {
    btnClearCart.addEventListener("click", () => {
      if (window.Carrito.getItems().length === 0) return;
      
      const confirmacion = confirm("¿Estás seguro de que deseas vaciar todo el carrito?");
      if (confirmacion) {
        window.Carrito.clear();
        window.UI.showToast("Carrito vaciado por completo", "error");
      }
    });
  }
  const btnCheckout = document.getElementById("btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      const items = window.Carrito.getItems();
      if (items.length === 0) {
        window.UI.showToast("Tu carrito está vacío. Agrega productos antes de pagar.", "warning");
        return;
      }
      window.UI.showToast("¡Procesando tu pedido! Espere un momento...", "success");
      
      setTimeout(() => {
        alert("¡Compra exitosa! Tu pedido en TrendyShop llegará en 48 horas.");
        window.Carrito.clear();
      }, 1000);
    });
  }
}
