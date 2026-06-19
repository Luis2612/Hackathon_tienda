async function initCatalog() {
    let state = {
        query: "",
        category: "",
        sortBy: "",
        allProductsCache: []
    };

    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const sortSelect = document.getElementById("sort-select");
    const categoryLinks = document.querySelectorAll(".category-link");
    const productGrid = document.getElementById("product-grid");
    const resultsCount = document.getElementById("results-count");

    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("search");

    if (categoryParam) {
        state.category = categoryParam;
        categoryLinks.forEach(link => {
            if (link.getAttribute("data-category") === categoryParam) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    if (searchParam) {
        state.query = searchParam;
        searchInput.value = searchParam;
    }

    try {
        state.allProductsCache = await window.ProductService.getProducts();
        actualizarContadoresCategorias(state.allProductsCache);
    } catch (err) {
        console.error("Error al cargar caché de productos para contadores", err);
    }

    await renderCatalog();

    searchBtn.addEventListener("click", () => {
        ejecutarBusqueda();
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            ejecutarBusqueda();
        }
    });

    sortSelect.addEventListener("change", async (e) => {
        state.sortBy = e.target.value;
        await renderCatalog();
    });

    categoryLinks.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            
            categoryLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            state.category = link.getAttribute("data-category") || "";
            
            const url = new URL(window.location);
            if (state.category) {
                url.searchParams.set("category", state.category);
            } else {
                url.searchParams.delete("category");
            }
            window.history.pushState({}, "", url);

            await renderCatalog();
        });
    });

    window.addEventListener("cart-updated", (event) => {
        const { totalQty } = event.detail;
        if (window.UI) {
            window.UI.updateCartBadge(totalQty);
        }
    });

    async function ejecutarBusqueda() {
        state.query = searchInput.value.trim();
        
        const url = new URL(window.location);
        if (state.query) {
            url.searchParams.set("search", state.query);
        } else {
            url.searchParams.delete("search");
        }
        window.history.pushState({}, "", url);

        await renderCatalog();
    }

    function actualizarContadoresCategorias(products) {
        const countAll = products.length;
        const countWomens = products.filter(p => p.categoria === "women's clothing" || p.category === "women's clothing").length;
        const countMens = products.filter(p => p.categoria === "men's clothing" || p.category === "men's clothing").length;
        const countJewelery = products.filter(p => p.categoria === "jewelery" || p.category === "jewelery").length;
        const countElectronics = products.filter(p => p.categoria === "electronics" || p.category === "electronics").length;

        document.getElementById("count-all").textContent = countAll;
        document.getElementById("count-womens").textContent = countWomens;
        document.getElementById("count-mens").textContent = countMens;
        document.getElementById("count-jewelery").textContent = countJewelery;
        document.getElementById("count-electronics").textContent = countElectronics;
    }

    async function renderCatalog() {
        productGrid.innerHTML = `
            <div class="w-100 text-center py-5 loading-overlay">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando productos...</span>
                </div>
                <h5 class="mt-3 text-muted">Buscando en TrendyShop...</h5>
            </div>
        `;
        resultsCount.textContent = "0";

        try {
            const products = await window.ProductService.searchAndFilter({
                query: state.query,
                category: state.category,
                sortBy: state.sortBy
            });

            resultsCount.textContent = products.length;

            if (products.length === 0) {
                productGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search-heart text-muted" style="font-size: 4rem;"></i>
                        <h4 class="h5 mt-3 fw-bold">No encontramos coincidencias</h4>
                        <p class="text-muted small">Prueba escribiendo otra palabra o cambiando de categoría.</p>
                    </div>
                `;
                return;
            }

            let html = "";
            products.forEach(p => {
                const starsHtml = getStarsHtml(p.valoracion || p.rating || 0);
                const precioFormateado = (p.precio || p.price || 0).toLocaleString("es-CO");

                let categoriaVisual = p.categoria || p.category || "Varios";
                if (categoriaVisual === "women's clothing") categoriaVisual = "Mujer";
                else if (categoriaVisual === "men's clothing") categoriaVisual = "Hombre";
                else if (categoriaVisual === "jewelery") categoriaVisual = "Accesorios";
                else if (categoriaVisual === "electronics") categoriaVisual = "Relojes & Tech";

                html += `
                    <div class="col">
                        <article class="card product-card rounded-4 shadow-sm border-0 position-relative">
                            <div class="product-card__img-container">
                                <img src="${p.imagen || p.image}" alt="${p.nombre || p.title}" onerror="this.src='https://via.placeholder.com/200?text=Producto';">
                            </div>
                            <div class="product-card__body">
                                <span class="product-card__category">${categoriaVisual}</span>
                                <h3 class="product-card__title" title="${p.nombre || p.title}">${p.nombre || p.title}</h3>
                                <div class="d-flex align-items-center gap-2 mb-3">
                                    <div class="rating-stars">${starsHtml}</div>
                                    <span class="rating-count">(${p.rating ? (p.rating.count || 25) : 25})</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-auto">
                                    <div class="product-card__price">$${precioFormateado}</div>
                                    <button class="btn btn-primary rounded-pill btn-sm px-3 py-2 fw-semibold btn-add-cart" data-id="${p.id}">
                                        <i class="bi bi-cart-plus-fill fs-6"></i>
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                `;
            });

            productGrid.innerHTML = html;
            configurarBotonesAgregar(products);

        } catch (error) {
            console.error("Error al renderizar catálogo:", error);
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size: 4rem;"></i>
                    <h4 class="h5 mt-3 fw-bold">Ocurrió un error</h4>
                    <p class="text-muted small">No pudimos conectar con los servidores. Por favor, recarga la página.</p>
                </div>
            `;
        }
    }

    function configurarBotonesAgregar(products) {
        document.querySelectorAll(".btn-add-cart").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const button = e.target.closest(".btn-add-cart");
                const id = parseInt(button.getAttribute("data-id"));
                
                const product = products.find(p => p.id === id);
                if (product && window.Carrito) {
                    window.Carrito.addItem(product);
                }
            });
        });
    }

    function getStarsHtml(rating) {
        let starsHtml = "";
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
        const roundedFullStars = rating % 1 > 0.7 ? fullStars + 1 : fullStars;

        for (let i = 1; i <= 5; i++) {
            if (i <= roundedFullStars) {
                starsHtml += '<i class="bi bi-star-fill"></i>';
            } else if (i === roundedFullStars + 1 && hasHalfStar) {
                starsHtml += '<i class="bi bi-star-half"></i>';
            } else {
                starsHtml += '<i class="bi bi-star"></i>';
            }
        }
        return starsHtml;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCatalog);
} else {
    initCatalog();
}
