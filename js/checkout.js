document.addEventListener("DOMContentLoaded", () => {
    if (!window.Carrito) return;
    window.Carrito.init();

    const items = window.Carrito.getItems();
    if (items.length === 0) {
        window.location.href = "../carrito/index.html";
        return;
    }

    const itemsListContainer = document.getElementById("checkout-items-list");
    const subtotalEl = document.getElementById("summary-subtotal");
    const discountRow = document.getElementById("summary-discount-row");
    const discountEl = document.getElementById("summary-discount");
    const taxEl = document.getElementById("summary-tax");
    const shippingEl = document.getElementById("summary-shipping");
    const totalEl = document.getElementById("summary-total");

    let itemsHtml = "";
    items.forEach(item => {
        const p = item.product;
        const price = (p.precio || p.price || 0).toLocaleString("es-CO");
        itemsHtml += `
            <div class="d-flex align-items-center gap-3 py-2 border-bottom">
                <img src="${p.imagen || p.image}" alt="${p.nombre || p.title}" class="checkout-item-thumb">
                <div class="flex-grow-1 min-w-0">
                    <h4 class="small text-truncate fw-bold text-dark mb-0">${p.nombre || p.title}</h4>
                    <span class="text-muted small">Cant: ${item.quantity}</span>
                </div>
                <div class="text-dark fw-bold small">$${price}</div>
            </div>
        `;
    });
    itemsListContainer.innerHTML = itemsHtml;

    const subtotal = window.Carrito.getSubtotal();
    const discount = window.Carrito.getDiscount();
    const tax = window.Carrito.getTax();
    const shipping = window.Carrito.getShipping();
    const total = window.Carrito.getTotal();

    subtotalEl.textContent = `$${subtotal.toLocaleString("es-CO")}`;
    
    if (discount > 0) {
        discountEl.textContent = `-$${discount.toLocaleString("es-CO")}`;
        discountRow.classList.remove("d-none");
    } else {
        discountRow.classList.add("d-none");
    }

    taxEl.textContent = `$${tax.toLocaleString("es-CO")}`;
    shippingEl.textContent = shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-CO")}`;
    totalEl.textContent = `$${total.toLocaleString("es-CO")}`;

    const payRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const formCard = document.getElementById("form-pay-card");
    const formPse = document.getElementById("form-pay-pse");
    const formDelivery = document.getElementById("form-pay-delivery");

    payRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const method = e.target.value;
            formCard.classList.add("d-none");
            formPse.classList.add("d-none");
            formDelivery.classList.add("d-none");

            if (method === "card") {
                formCard.classList.remove("d-none");
            } else if (method === "pse") {
                formPse.classList.remove("d-none");
            } else if (method === "delivery") {
                formDelivery.classList.remove("d-none");
            }
        });
    });

    const checkoutForm = document.getElementById("checkoutForm");
    const loader = document.getElementById("processing-loader");
    const successView = document.getElementById("success-view");
    const checkoutContent = document.getElementById("checkout-content");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const city = document.getElementById("city").value.trim();
            const address = document.getElementById("address").value.trim();

            loader.classList.remove("d-none");

            setTimeout(() => {
                window.Carrito.clear();

                loader.classList.add("d-none");
                checkoutContent.classList.add("d-none");
                successView.classList.remove("d-none");

                const randomOrder = `TS-${Math.floor(10000 + Math.random() * 90000)}`;
                document.getElementById("order-number").textContent = randomOrder;
                document.getElementById("order-name").textContent = fullName;
                document.getElementById("order-address").textContent = `${address}, ${city}`;

                if (window.UI && typeof window.UI.showToast === "function") {
                    window.UI.showToast("¡Pedido confirmado con éxito!", "success");
                }
            }, 2500);
        });
    }
});
