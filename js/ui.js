const UI = {
  updateCartBadge(count) {
    const badge = document.getElementById("cart-badge");
    const headerCount = document.getElementById("cart-count-header");

    if (badge) {
      badge.textContent = count;
      if (count === 0) {
        badge.classList.add("d-none");
      } else {
        badge.classList.remove("d-none");
      }
    }

    if (headerCount) {
      headerCount.textContent = `${count} artículo${count !== 1 ? 's' : ''}`;
    }
  },
  mostrarCarrito(items) {
    const container = document.getElementById("cart-items");
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-container py-5 text-center">
          <i class="bi bi-cart-x empty-cart-icon text-muted" style="font-size: 4rem;"></i>
          <h3 class="h5 mt-3 fw-bold">Tu carrito está vacío</h3>
          <p class="text-muted small">¡Agrega algunos productos del catálogo para comenzar a comprar!</p>
          <a href="../catalogo/index.html" class="btn btn-primary btn-sm rounded-pill mt-3 px-4 py-2 fw-bold">
            <i class="bi bi-shop me-2"></i>Ir al Catálogo
          </a>
        </div>
      `;
      this.actualizarResumen(0, 0, 0, 0);
      return;
    }

    let html = "";
    items.forEach(item => {
      const product = item.product;
      const price = product.precio || product.price || 0;
      const subtotal = price * item.quantity;

      html += `
        <article class="card cart-item mb-3 rounded-4 shadow-sm border-0" data-product-id="${product.id}">
          <div class="card-body d-flex flex-column flex-sm-row align-items-center gap-3 p-3">
            
            <!-- Imagen del Producto -->
            <img src="${product.imagen || product.image || 'https://via.placeholder.com/100'}" 
                 alt="${product.nombre || product.title}" 
                 class="cart-item__image img-fluid"
                 onerror="this.src='https://via.placeholder.com/100?text=Producto'">
            
            <!-- Detalles del Producto -->
            <div class="flex-grow-1 text-center text-sm-start">
              <h2 class="cart-item__name h6 mb-1">${product.nombre || product.title}</h2>
              <span class="badge bg-light text-secondary border mb-2" style="font-size: 0.75rem;">
                ${product.categoria || product.category || 'Varios'}
              </span>
              <div class="text-primary fw-bold" style="font-size: 1.05rem;">
                $${price.toLocaleString('es-CO')} <span class="text-muted small fw-normal">c/u</span>
              </div>
            </div>

            <!-- Cantidad e Interacciones -->
            <div class="d-flex flex-row flex-sm-column align-items-center align-items-sm-end gap-3 gap-sm-2 w-100 w-sm-auto justify-content-between">
              
              <!-- Controles de Cantidad -->
              <div class="quantity-control shadow-sm">
                <button class="btn-qty-minus" data-id="${product.id}">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button class="btn-qty-plus" data-id="${product.id}">+</button>
              </div>

              <!-- Botón Eliminar -->
              <button class="btn btn-sm btn-outline-danger cart-item__remove border-0" data-id="${product.id}">
                <i class="bi bi-trash-fill"></i> <span class="d-none d-sm-inline">Eliminar</span>
              </button>

            </div>

          </div>
        </article>
      `;
    });

    container.innerHTML = html;
    this.configurarEventosCarrito();
  },
  configurarEventosCarrito() {
    document.querySelectorAll(".btn-qty-plus").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const currentQty = window.Carrito.items.find(i => i.product.id === parseInt(id))?.quantity || 1;
        window.Carrito.updateQuantity(id, currentQty + 1);
      });
    });
    document.querySelectorAll(".btn-qty-minus").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const currentQty = window.Carrito.items.find(i => i.product.id === parseInt(id))?.quantity || 1;
        if (currentQty > 1) {
          window.Carrito.updateQuantity(id, currentQty - 1);
        } else {
          window.Carrito.removeItem(id);
        }
      });
    });
    document.querySelectorAll(".cart-item__remove").forEach(button => {
      button.addEventListener("click", (e) => {
        const btn = e.target.closest(".cart-item__remove");
        const id = btn.getAttribute("data-id");
        window.Carrito.removeItem(id);
      });
    });
  },
  actualizarResumen(subtotal, tax, shipping, total) {
    const subtotalEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const shippingEl = document.getElementById("cart-shipping");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CO')}`;
    if (taxEl) taxEl.textContent = `$${tax.toLocaleString('es-CO')}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "Gratis" : `$${shipping.toLocaleString('es-CO')}`;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-CO')}`;
  },
  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      container.style.zIndex = "1055";
      document.body.appendChild(container);
    }

    const toastId = `toast-${Date.now()}`;
    const bgClass = type === "success" ? "bg-success" : (type === "error" ? "bg-danger" : "bg-warning");
    const iconClass = type === "success" ? "bi-check-circle-fill" : (type === "error" ? "bi-x-circle-fill" : "bi-exclamation-triangle-fill");

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${iconClass}"></i>
            <span>${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", toastHtml);

    const toastEl = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
      const bsToast = new window.bootstrap.Toast(toastEl, { delay: 3000 });
      bsToast.show();
      toastEl.addEventListener("hidden.bs.toast", () => {
        toastEl.remove();
      });
    }
  }
};

window.UI = UI;
