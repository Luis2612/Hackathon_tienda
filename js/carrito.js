const Carrito = {
  items: [],
  init() {
    this.items = window.CartService ? window.CartService.getCart() : [];
    this.notifyChange();
  },
  getItems() {
    return this.items;
  },
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        product: product,
        quantity: quantity
      });
    }

    this.save();
    this.notifyChange();
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast(`"${product.nombre || product.title}" agregado al carrito`, "success");
    }
  },
  removeItem(productId) {
    const item = this.items.find(i => i.product.id === parseInt(productId));
    const nombre = item ? (item.product.nombre || item.product.title) : "Producto";
    
    this.items = this.items.filter(item => item.product.id !== parseInt(productId));
    
    this.save();
    this.notifyChange();
    
    if (window.UI && typeof window.UI.showToast === 'function') {
      window.UI.showToast(`"${nombre}" eliminado del carrito`, "error");
    }
  },
  updateQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return;

    const item = this.items.find(item => item.product.id === parseInt(productId));
    if (item) {
      item.quantity = qty;
      this.save();
      this.notifyChange();
    }
  },
  clear() {
    this.items = [];
    if (window.CartService) {
      window.CartService.clearCart();
    }
    this.notifyChange();
  },
  getTotalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },
  getSubtotal() {
    return this.items.reduce((total, item) => {
      const precio = item.product.precio || item.product.price || 0;
      return total + (precio * item.quantity);
    }, 0);
  },
  getDiscount() {
    const token = localStorage.getItem("auth-token");
    if (token) {
      return Math.round(this.getSubtotal() * 0.10);
    }
    return 0;
  },
  getTax() {
    return Math.round((this.getSubtotal() - this.getDiscount()) * 0.19);
  },
  getShipping() {
    const subtotal = this.getSubtotal() - this.getDiscount();
    if (subtotal <= 0) return 0;
    return subtotal > 150000 ? 0 : 15000;
  },
  getTotal() {
    return this.getSubtotal() - this.getDiscount() + this.getTax() + this.getShipping();
  },
  save() {
    if (window.CartService) {
      window.CartService.saveCart(this.items);
    }
  },
  notifyChange() {
    if (window.UI && typeof window.UI.updateCartBadge === 'function') {
      window.UI.updateCartBadge(this.getTotalQuantity());
    }
    const event = new CustomEvent("cart-updated", {
      detail: {
        items: this.items,
        totalQty: this.getTotalQuantity(),
        subtotal: this.getSubtotal(),
        discount: this.getDiscount(),
        tax: this.getTax(),
        shipping: this.getShipping(),
        total: this.getTotal()
      }
    });
    window.dispatchEvent(event);
  }
};

window.Carrito = Carrito;
