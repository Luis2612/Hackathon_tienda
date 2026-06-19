document.addEventListener("DOMContentLoaded", () => {
    if (window.Carrito) {
        window.Carrito.init();
    }

    const container = document.getElementById("featured-products");
    if (window.ProductService && container) {
        window.ProductService.getFeaturedProducts(4)
            .then(productos => {
                if (productos.length === 0) {
                    container.innerHTML = `<p class="text-muted">No hay productos destacados disponibles en este momento.</p>`;
                    return;
                }

                container.innerHTML = productos.map(p => `
                    <article class="card bg-white shadow-sm rounded-3 border-0 p-3" data-id="${p.id}">
                        <img src="${p.imagen || p.image || 'https://via.placeholder.com/180?text=Producto'}" 
                             alt="${p.nombre || p.title}" 
                             class="card-img-top rounded img-fluid"
                             onerror="this.src='https://via.placeholder.com/180?text=Producto'">
                        <div class="card-body p-0 mt-3 d-flex flex-column justify-content-between" style="min-height: 120px;">
                            <div>
                                <h3 class="h6 fw-bold text-dark text-truncate mb-1" title="${p.nombre || p.title}">
                                    ${p.nombre || p.title}
                                </h3>
                                <p class="text-muted small text-truncate mb-2">${p.categoria || p.category}</p>
                            </div>
                            <div>
                                <p class="text-primary fw-bold h5 mb-3">$${p.precio.toLocaleString('es-CO')}</p>
                                <button class="btn btn-primary btn-sm btn-agregar w-100 rounded-3 fw-semibold shadow-sm" data-id="${p.id}">
                                    <i class="bi bi-cart-plus me-1"></i>Agregar
                                </button>
                            </div>
                        </div>
                    </article>
                `).join('');
                container.querySelectorAll(".btn-agregar").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const btnElement = e.target.closest(".btn-agregar");
                        const id = parseInt(btnElement.getAttribute("data-id"));
                        const producto = productos.find(prod => prod.id === id);
                        
                        if (producto && window.Carrito) {
                            window.Carrito.addItem(producto, 1);
                        }
                    });
                });
            })
            .catch(error => {
                console.error("Error al cargar productos destacados:", error);
                container.innerHTML = `<p class="text-danger">Error al conectar con la API. Intente de nuevo más tarde.</p>`;
            });
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

    // Manejador del Formulario del Newsletter (Suscripción)
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletter-email");
            const responseEl = document.getElementById("newsletter-response");
            
            if (emailInput && responseEl) {
                // Mostrar mensaje de éxito local en el banner
                responseEl.classList.remove("d-none");
                emailInput.value = "";
                
                // Disparar toast global de éxito
                if (window.UI && typeof window.UI.showToast === "function") {
                    window.UI.showToast("¡Te has unido al Beauty Club! Revisa tu correo.", "success");
                }
            }
        });
    }
});
