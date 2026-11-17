// ==========================================
// PATCHCARE - CHECKOUT JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const checkoutContent = document.getElementById("checkout-content");

    if (!checkoutContent) return;

    const CART_KEY = "patchcare_cart";
    const ORDERS_KEY = "patchcare_orders";
    const USER_KEY = "patchcare_current_user";

    // Delivery settings - change these to match your real rates
    const SHIPPING_FEE = 50;
    const FREE_SHIPPING_MIN = 500;

    const currentUser = JSON.parse(
        localStorage.getItem(USER_KEY) || "null"
    );

    if (!currentUser) {
        sessionStorage.setItem("patchcare_after_login", "checkout.html");
        window.location.replace("login.html?next=checkout.html");
        return;
    }

    // ======================================
    // HELPERS
    // ======================================

    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        // lets the header cart badge update
        document.dispatchEvent(new Event("cartUpdated"));
    }

    function getOrders() {
        return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    }

    function formatMoney(amount) {
        if (typeof window.formatPrice === "function") {
            return window.formatPrice(amount);
        }
        return "₱" + Number(amount).toFixed(2);
    }

    function getProduct(id) {
        return window.getProductById(id);
    }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Valid cart lines + totals
    function getCartData() {
        const items = getCart().map(function (line) {
            const product = getProduct(line.id);
            if (!product) return null;

            const quantity = Number(line.quantity);

            return {
                product: product,
                quantity: quantity,
                total: product.price * quantity
            };
        }).filter(Boolean);

        const subtotal = items.reduce(function (sum, item) {
            return sum + item.total;
        }, 0);

        const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;

        return {
            items: items,
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping
        };
    }

    // ======================================
    // FORM VALIDATION
    // ======================================

    const validators = {
        customerName: function (v) {
            return v.trim().length >= 2 ? "" : "Please enter your full name.";
        },
        email: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
                ? "" : "Please enter a valid email address.";
        },
        phone: function (v) {
            const clean = v.replace(/[\s-]/g, "");
            return /^(09\d{9}|\+639\d{9})$/.test(clean)
                ? "" : "Enter a valid mobile number, e.g. 09171234567.";
        },
        street: function (v) {
            return v.trim().length >= 4
                ? "" : "Please enter your house number and street.";
        },
        barangay: function (v) {
            return v.trim() ? "" : "Please enter your barangay.";
        },
        city: function (v) {
            return v.trim() ? "" : "Please enter your city or municipality.";
        },
        province: function (v) {
            return v.trim() ? "" : "Please enter your province.";
        },
        zip: function (v) {
            return /^\d{4}$/.test(v.trim()) ? "" : "ZIP code must be 4 digits.";
        }
    };

    function setFieldError(input, message) {
        const field = input.closest(".co-field");
        if (!field) return;

        field.classList.toggle("has-error", Boolean(message));

        const slot = field.querySelector(".co-error");
        if (slot) slot.textContent = message || "";

        input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateForm(form) {
        let firstInvalid = null;

        Object.keys(validators).forEach(function (name) {
            const input = form.elements[name];
            if (!input) return;

            const message = validators[name](input.value);
            setFieldError(input, message);

            if (message && !firstInvalid) firstInvalid = input;
        });

        return firstInvalid;
    }

    // ======================================
    // RENDER
    // ======================================

    function field(id, name, label, type, placeholder, extra) {
        return `
            <div class="co-field ${extra && extra.full ? "full" : ""}">
                <label for="${id}">${label}</label>
                <input type="${type}" id="${id}" name="${name}"
                    placeholder="${placeholder}"
                    ${extra && extra.autocomplete ? `autocomplete="${extra.autocomplete}"` : ""}
                    ${extra && extra.inputmode ? `inputmode="${extra.inputmode}"` : ""}
                    ${extra && extra.maxlength ? `maxlength="${extra.maxlength}"` : ""}>
                <span class="co-error" role="alert"></span>
            </div>
        `;
    }

    function renderEmpty() {
        checkoutContent.innerHTML = `
            <div class="co-card co-center">
                <h2>Your cart is empty</h2>
                <p>You haven't added any products yet.</p>
                <a href="index.html#buy" class="co-btn">Browse Products</a>
            </div>
        `;
    }

    function renderPage() {
        const data = getCartData();

        if (data.items.length === 0) {
            renderEmpty();
            return;
        }

        // Build the page once, so typed form data is never lost
        if (!document.getElementById("checkout-form")) {
            buildPage();
        }

        renderSummary();
    }

    function buildPage() {
        checkoutContent.innerHTML = `
            <div class="co-layout">

                <div class="co-card">
                    <form id="checkout-form" novalidate>

                        <section class="co-section">
                            <h2 class="co-title">
                                <span class="co-step">1</span> Contact Details
                            </h2>
                            <div class="co-grid">
                                ${field("customer-name", "customerName", "Full Name", "text", "Juan Dela Cruz", { full: true, autocomplete: "name" })}
                                ${field("customer-email", "email", "Email Address", "email", "you@example.com", { autocomplete: "email" })}
                                ${field("customer-phone", "phone", "Mobile Number", "tel", "09XXXXXXXXX", { autocomplete: "tel", inputmode: "tel" })}
                            </div>
                        </section>

                        <section class="co-section">
                            <h2 class="co-title">
                                <span class="co-step">2</span> Delivery Address
                            </h2>
                            <div class="co-grid">
                                ${field("customer-street", "street", "House No. &amp; Street", "text", "e.g. 123 Rizal St., Greenville Subd.", { full: true, autocomplete: "address-line1" })}
                                ${field("customer-barangay", "barangay", "Barangay", "text", "e.g. Addition Hills")}
                                ${field("customer-city", "city", "City / Municipality", "text", "e.g. Mandaluyong City", { autocomplete: "address-level2" })}
                                ${field("customer-province", "province", "Province / Region", "text", "e.g. Metro Manila", { autocomplete: "address-level1" })}
                                ${field("customer-zip", "zip", "ZIP Code", "text", "e.g. 1550", { autocomplete: "postal-code", inputmode: "numeric", maxlength: "4" })}
                                <div class="co-field full">
                                    <label for="customer-notes">
                                        Delivery Notes <span class="opt">(optional)</span>
                                    </label>
                                    <textarea id="customer-notes" name="notes" rows="2"
                                        placeholder="Landmarks, gate color, best time to deliver..."></textarea>
                                </div>
                            </div>
                        </section>
                            <section class="co-section">
                            <h2 class="co-title">
                                <span class="co-step">3</span> Payment Method
                            </h2>
                            <div class="co-pay">
                                <label class="co-pay-option is-selected">
                                    <input type="radio" name="payment" value="Cash on Delivery" checked>
                                    <span class="co-pay-dot"></span>
                                    <span class="co-pay-text">
                                        <strong>Cash on Delivery</strong>
                                        <small>Pay in cash when your order arrives.</small>
                                    </span>
                                </label>
                                <label class="co-pay-option">
                                    <input type="radio" name="payment" value="GCash">
                                    <span class="co-pay-dot"></span>
                                    <span class="co-pay-text">
                                        <strong>GCash</strong>
                                        <small>Pay online using your GCash wallet.</small>
                                    </span>
                                </label>
                            </div>
                            <div class="co-note hidden" id="gcash-note">
                                Payment instructions will be sent to your email and mobile number after you place your order.
                            </div>
                        </section>

                    </form>
                </div>

                <aside class="co-card" id="co-summary" aria-label="Order summary"></aside>

            </div>
        `;

        prefillUser();
    }

    function prefillUser() {
        const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
        if (!user) return;

        document.getElementById("customer-name").value = user.name || "";
        document.getElementById("customer-email").value = user.email || "";
        document.getElementById("customer-phone").value = user.phone || "";
        document.getElementById("customer-street").value = user.address || "";
    }

    function renderSummary() {
        const summary = document.getElementById("co-summary");
        if (!summary) return;

        const data = getCartData();
        const remaining = Math.max(FREE_SHIPPING_MIN - data.subtotal, 0);
        const progress = Math.min((data.subtotal / FREE_SHIPPING_MIN) * 100, 100);
        const count = data.items.reduce(function (n, item) {
            return n + item.quantity;
        }, 0);

        summary.innerHTML = `
            <h2 class="co-summary-title">
                Order Summary
                <span>(${count} ${count === 1 ? "item" : "items"})</span>
            </h2>

            <div class="co-items">
                ${data.items.map(function (item) {
                    const p = item.product;
                    return `
                        <div class="co-item">
                            <div class="co-thumb">
                                <img src="${esc(p.image)}" alt="${esc(p.name)}"
                                    onerror="this.style.display='none'">
                            </div>

                            <div>
                                <div class="co-item-name">${esc(p.name)}</div>
                                <div class="co-item-each">${formatMoney(p.price)} each</div>

                                <div class="co-qty">
                                    <button type="button" data-decrease="${p.id}"
                                        aria-label="Decrease quantity"
                                        ${item.quantity <= 1 ? "disabled" : ""}>−</button>
                                    <span>${item.quantity}</span>
                                    <button type="button" data-increase="${p.id}"
                                        aria-label="Increase quantity">+</button>
                                </div>
                            </div>

                            <div class="co-item-side">
                                <span class="co-item-total">${formatMoney(item.total)}</span>
                                <button type="button" class="co-remove"
                                    data-remove="${p.id}">Remove</button>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>

            <div class="co-stock-msg" id="co-stock-msg" role="status"></div>

            <div class="co-row">
                <span>Subtotal</span>
                <b>${formatMoney(data.subtotal)}</b>
            </div>
            <div class="co-row">
                <span>Shipping</span>
                ${data.shipping === 0
                    ? `<span class="free">Free</span>`
                    : `<b>${formatMoney(data.shipping)}</b>`}
            </div>

            <div class="co-ship ${remaining === 0 ? "done" : ""}">
                ${remaining === 0
                    ? "You've got free shipping!"
                    : `Add <strong>${formatMoney(remaining)}</strong> more for free shipping`}
                <div class="co-bar"><span style="width:${progress}%"></span></div>
            </div>

            <div class="co-row total">
                <span>Total</span>
                <span>${formatMoney(data.total)}</span>
            </div>

            <div class="co-eta">Estimated delivery: 3–5 business days</div>

            <button type="submit" form="checkout-form" class="co-btn" id="place-order">
                Place Order · ${formatMoney(data.total)}
            </button>

            <p class="co-secure">Your details are only used to deliver this order.</p>

            <a href="index.html#buy" class="co-back">← Continue Shopping</a>
        `;
    }
        let stockMsgTimer;

    function showStockMessage(text) {
        const slot = document.getElementById("co-stock-msg");
        if (!slot) return;

        slot.textContent = text;
        clearTimeout(stockMsgTimer);
        stockMsgTimer = setTimeout(function () {
            slot.textContent = "";
        }, 3000);
    }

    // ======================================
    // QUANTITY AND REMOVE BUTTONS
    // ======================================

    checkoutContent.addEventListener("click", function (event) {

        const increase = event.target.closest("[data-increase]");
        const decrease = event.target.closest("[data-decrease]");
        const remove = event.target.closest("[data-remove]");

        if (!increase && !decrease && !remove) return;

        let cart = getCart();

        if (increase) {
            const id = Number(increase.dataset.increase);
            const item = cart.find(line => line.id === id);
            const product = getProduct(id);

            if (!item || !product) return;

            if (item.quantity >= product.stock) {
                showStockMessage("Maximum available stock reached.");
                return;
            }

            item.quantity++;
        }

        if (decrease) {
            const id = Number(decrease.dataset.decrease);
            const item = cart.find(line => line.id === id);

            if (!item || item.quantity <= 1) return;

            item.quantity--;
        }

        if (remove) {
            const id = Number(remove.dataset.remove);
            cart = cart.filter(line => line.id !== id);
        }

        saveCart(cart);
        renderPage();
    });

    // ======================================
    // PAYMENT OPTION + LIVE VALIDATION
    // ======================================

    checkoutContent.addEventListener("change", function (event) {
        if (event.target.name !== "payment") return;

        document.querySelectorAll(".co-pay-option").forEach(function (option) {
            option.classList.toggle(
                "is-selected",
                option.querySelector("input").checked
            );
        });

        const note = document.getElementById("gcash-note");
        if (note) note.classList.toggle("hidden", event.target.value !== "GCash");
    });

    checkoutContent.addEventListener("input", function (event) {
        const input = event.target;

        if (input.closest(".co-field.has-error") && validators[input.name]) {
            setFieldError(input, validators[input.name](input.value));
        }
    });

    // ======================================
    // PLACE ORDER
    // ======================================

    checkoutContent.addEventListener("submit", function (event) {

        if (event.target.id !== "checkout-form") return;

        event.preventDefault();

        const form = event.target;
        const button = document.getElementById("place-order");

        if (button && button.disabled) return;

        const data = getCartData();

        if (data.items.length === 0) {
            renderEmpty();
            return;
        }

        const firstInvalid = validateForm(form);

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        for (const item of data.items) {
            if (item.quantity < 1 || item.quantity > item.product.stock) {
                showStockMessage("One or more products have insufficient stock.");
                return;
            }
        }

        const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
        const v = function (name) {
            return form.elements[name].value.trim();
        };

        const barangay = /^(brgy|barangay)\b/i.test(v("barangay"))
            ? v("barangay")
            : "Brgy. " + v("barangay");

        const fullAddress =
            v("street") + ", " + barangay + ", " +
            v("city") + ", " + v("province") + " " + v("zip");

        const order = {
            id: Date.now(),
            userId: user ? user.id : null,
            customer: {
                name: v("customerName"),
                email: v("email"),
                phone: v("phone").replace(/[\s-]/g, ""),
                address: fullAddress,
                street: v("street"),
                barangay: v("barangay"),
                city: v("city"),
                province: v("province"),
                zip: v("zip"),
                notes: v("notes")
            },
            payment: form.elements.payment.value,
            items: data.items.map(function (item) {
                return {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.total
                };
            }),
            subtotal: data.subtotal,
            shipping: data.shipping,
            total: data.total,
            date: new Date().toLocaleString(),
            status: "Pending"
        };

        // short "processing" state so the click feels real
        if (button) {
            button.disabled = true;
            button.textContent = "Placing your order…";
        }

        setTimeout(function () {
            const orders = getOrders();
            orders.push(order);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

            localStorage.removeItem(CART_KEY);
            document.dispatchEvent(new Event("cartUpdated"));

            renderSuccess(order);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 900);
    });

    // ======================================
    // SUCCESS SCREEN
    // ======================================

    function renderSuccess(order) {
        checkoutContent.innerHTML = `
            <div class="co-card co-center">

                <div class="co-check">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5"/>
                    </svg>
                </div>

                <h2>Order placed!</h2>
                <p>Thank you for shopping with PatchCare, ${esc(order.customer.name.split(" ")[0])}.</p>

                <div class="co-receipt">
                    <div class="co-row"><span>Order number</span><b>#${order.id}</b></div>
                    <div class="co-row"><span>Payment</span><b>${esc(order.payment)}</b></div>
                    <div class="co-row"><span>Deliver to</span><b>${esc(order.customer.address)}</b></div>
                    <div class="co-row"><span>Estimated delivery</span><b>3–5 business days</b></div>
                    <div class="co-row total"><span>Total</span><span>${formatMoney(order.total)}</span></div>
                </div>

                <div class="co-actions">
                    <a href="orders.html" class="co-btn">View My Orders</a>
                    <a href="index.html#buy" class="co-btn co-btn-light">Continue Shopping</a>
                </div>

            </div>
        `;
    }

    // INITIAL RENDER

    renderPage();

});