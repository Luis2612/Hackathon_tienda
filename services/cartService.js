const CartService = {
  saveCart(cartItems) {
    localStorage.setItem("tienda_cart", JSON.stringify(cartItems));
  },
  getCart() {
    const saved = localStorage.getItem("tienda_cart");
    return saved ? JSON.parse(saved) : [];
  },
  clearCart() {
    localStorage.removeItem("tienda_cart");
  }
};

window.CartService = CartService;
