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
        <div class="empty-cart-container py-4 text-center">
          <i class="bi bi-cart-x empty-cart-icon text-muted" style="font-size: 3.5rem;"></i>
          <h3 class="h5 mt-3 fw-bold">Tu carrito está vacío</h3>
          <p class="text-muted small">¡Agrega algunos productos del catálogo para comenzar a comprar!</p>
          <a href="../catalogo/index.html" class="btn btn-primary btn-sm rounded-pill mt-2 mb-4 px-4 py-2 fw-bold shadow-sm">
            <i class="bi bi-shop me-2"></i>Ir al Catálogo
          </a>
        </div>
        <hr class="my-4">
        <div class="recommendations-section">
          <h4 class="h6 fw-bold mb-3 text-center text-sm-start" style="font-family: 'Outfit', sans-serif; color: #250f1a;">Quizás te interese...</h4>
          <div class="row row-cols-1 row-cols-sm-3 g-3" id="recommendations-grid">
             <div class="w-100 text-center py-4">
                 <div class="spinner-border spinner-border-sm text-primary" role="status">
                     <span class="visually-hidden">Cargando sugerencias...</span>
                 </div>
             </div>
          </div>
        </div>
      `;

      if (window.ProductService) {
        window.ProductService.getFeaturedProducts(3)
          .then(recommended => {
            const grid = document.getElementById("recommendations-grid");
            if (!grid) return;

            let recsHtml = "";
            recommended.forEach(p => {
              const price = (p.precio || p.price || 0).toLocaleString('es-CO');
              recsHtml += `
                <div class="col">
                  <div class="card h-100 p-2 border rounded-4 text-center bg-white shadow-sm">
                    <img src="${p.imagen || p.image}" alt="${p.nombre || p.title}" class="img-fluid rounded mx-auto mb-2" style="height: 100px; object-fit: contain;">
                    <h5 class="small fw-bold text-truncate text-dark mb-1" style="font-size: 0.85rem;" title="${p.nombre || p.title}">${p.nombre || p.title}</h5>
                    <div class="text-primary fw-bold small mb-2" style="font-size: 0.9rem;">$${price}</div>
                    <button class="btn btn-primary btn-sm w-100 rounded-pill py-1 fw-semibold btn-quick-add shadow-sm" data-id="${p.id}" style="font-size: 0.75rem;">
                      <i class="bi bi-cart-plus me-1"></i>Agregar
                    </button>
                  </div>
                </div>
              `;
            });
            grid.innerHTML = recsHtml;

            grid.querySelectorAll(".btn-quick-add").forEach(btn => {
              btn.addEventListener("click", (e) => {
                const btnEl = e.target.closest(".btn-quick-add");
                const id = parseInt(btnEl.getAttribute("data-id"));
                const prod = recommended.find(p => p.id === id);
                if (prod && window.Carrito) {
                  window.Carrito.addItem(prod, 1);
                }
              });
            });
          })
          .catch(err => {
            console.error("Error al cargar sugerencias en carrito:", err);
            const grid = document.getElementById("recommendations-grid");
            if (grid) {
              grid.innerHTML = `<p class="text-muted small text-center w-100">No se pudieron cargar recomendaciones en este momento.</p>`;
            }
          });
      }

      this.actualizarResumen(0, 0, 0, 0, 0);
      return;
    }

    let html = "";
    items.forEach(item => {
      const product = item.product;
      const price =
        product.precioConIva ??
        Math.round((product.precio || product.price || 0) * 1.19);
      const subtotal = price * item.quantity;

      html += `
        <article class="card cart-item mb-3 rounded-4 shadow-sm border-0" data-product-id="${product.id}">
          <div class="card-body d-flex flex-column flex-sm-row align-items-center gap-3 p-3">
            
            <img src="${product.imagen || product.image || 'https://via.placeholder.com/100'}" 
                 alt="${product.nombre || product.title}" 
                 class="cart-item__image img-fluid"
                 onerror="this.src='https://via.placeholder.com/100?text=Producto'">
            
            <div class="flex-grow-1 text-center text-sm-start">
              <h2 class="cart-item__name h6 mb-1">${product.nombre || product.title}</h2>
              <span class="badge bg-light text-secondary border mb-2" style="font-size: 0.75rem;">
                ${product.categoria || product.category || 'Varios'}
              </span>
              <div class="text-primary fw-bold" style="font-size: 1.05rem;">
                $${price.toLocaleString('es-CO')} <span class="text-muted small fw-normal">c/u</span>
              </div>
            </div>
 
            <div class="d-flex flex-row flex-sm-column align-items-center align-items-sm-end gap-3 gap-sm-2 w-100 w-sm-auto justify-content-between">
              
              <div class="quantity-control shadow-sm">
                <button class="btn-qty-minus" data-id="${product.id}">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button class="btn-qty-plus" data-id="${product.id}">+</button>
              </div>
 
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
  actualizarResumen(subtotal, discount, tax, shipping, total) {
    const subtotalEl = document.getElementById("cart-subtotal");
    const discountRow = document.getElementById("discount-row");
    const discountEl = document.getElementById("cart-discount");
    const taxEl = document.getElementById("cart-tax");
    const shippingEl = document.getElementById("cart-shipping");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CO')}`;

    if (discountRow && discountEl) {
      if (discount > 0) {
        discountEl.textContent = `-$${discount.toLocaleString('es-CO')}`;
        discountRow.classList.remove("d-none");
      } else {
        discountRow.classList.add("d-none");
      }
    }

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

document.addEventListener("DOMContentLoaded", () => {
  if (window.Carrito) {
    window.Carrito.init();
  }
  const nav = document.querySelector(".navEnlaces");
  if (!nav) return;

  const cartBtn = Array.from(nav.querySelectorAll("a")).find(a =>
    a.textContent.includes("Carrito") || a.querySelector(".bi-cart3")
  );

  const authContainer = document.createElement("div");
  authContainer.className = "d-flex align-items-center d-inline-block ms-3";

  const isSubfolder = window.location.pathname.split('/').filter(Boolean).some(part =>
    ["catalogo", "about", "contactanos", "carrito", "login", "checkout"].includes(part.toLowerCase())
  );
  const prefix = isSubfolder ? "../" : "";

  const token = localStorage.getItem("auth-token");
  const username = localStorage.getItem("auth-username");

  if (token && username) {
    authContainer.innerHTML = `
      <span class="text-dark fw-semibold small d-none d-md-inline me-2" style="font-family: 'Outfit', sans-serif;">
        <i class="bi bi-person-circle text-primary me-1"></i>${username}
      </span>
      <a href="#" id="auth-logout-btn" class="text-danger fw-bold small d-flex align-items-center" title="Cerrar Sesión" style="text-decoration: none;">
        <i class="bi bi-box-arrow-right fs-5"></i>
      </a>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="${prefix}login/index.html" class="text-primary fw-bold small d-flex align-items-center gap-1" style="text-decoration: none; font-family: 'Outfit', sans-serif;">
        <i class="bi bi-person-lock fs-5"></i> <span class="d-none d-sm-inline">Ingresar</span>
      </a>
    `;
  }

  if (cartBtn) {
    nav.insertBefore(authContainer, cartBtn);
  } else {
    nav.appendChild(authContainer);
  }

  const logoutBtn = document.getElementById("auth-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-username");
      if (typeof UI.showToast === "function") {
        UI.showToast("Sesión cerrada correctamente", "success");
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }

  const whatsappBtn = document.createElement("a");
  whatsappBtn.href = "https://wa.me/573118867248?text=Hola!%20Tengo%20una%20consulta%20sobre%20TrendyShop";
  whatsappBtn.className = "whatsapp-btn";
  whatsappBtn.target = "_blank";
  whatsappBtn.rel = "noopener";
  whatsappBtn.innerHTML = '<i class="bi bi-whatsapp"></i>';
  document.body.appendChild(whatsappBtn);
});
