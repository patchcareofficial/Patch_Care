(function () {
    "use strict";

    // ======================================
    // SITE HEADER + FOOTER (navigation)
    // ======================================

    const CART_KEY = "patchcare_cart";
    const CURRENT_USER_KEY = "patchcare_current_user";

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        }[char]));
    }

    function icon(path) {
        return `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    }

    const ICONS = {
        home: icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
        shop: icon('<path d="M4 7h16l-1.5 12h-13z"/><path d="M9 7a3 3 0 016 0"/>'),
        how: icon('<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'),
        orders: icon('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>'),
        contact: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')
    };

    function getCartCount() {
        const cart = readJSON(CART_KEY, []);
        return Array.isArray(cart)
            ? cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
            : 0;
    }

    function renderHeader() {
        const mount = document.getElementById("site-header");
        if (!mount) return;

        const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        const user = readJSON(CURRENT_USER_KEY, null);

        const active = file => (page === file ? " active" : "");

        const accountLabel = user
            ? "My profile (" + escapeHTML(String(user.name || user.username || "Account").split(" ")[0]) + ")"
            : "Log in";
        const accountHref = user ? "profile.html" : "login.html";

        mount.innerHTML = `
            <div class="container site-header">
                <button class="menu-toggle" type="button"
                        aria-label="Open menu" aria-expanded="false"
                        aria-controls="nav-links">
                    <span></span><span></span><span></span>
                </button>

                <a class="logo" href="index.html" aria-label="PatchCare home">
                    <span class="logo-icon">+</span>
                    <span>Patch</span><span>Care</span>
                </a>

                <nav class="nav-links" id="nav-links" aria-label="Main navigation">
                    <a href="index.html" class="${active("index.html").trim()}">${ICONS.home}Home</a>

                    <a href="index.html#buy">${ICONS.shop}TriaPatch</a>
                    <a href="index.html#how">${ICONS.how}How It Works</a>
                    <a href="orders.html" class="${active("orders.html").trim()}">${ICONS.orders}My Orders</a>
                    <a href="contact.html" class="${active("contact.html").trim()}">${ICONS.contact}Contact</a>
                </nav>

                <div class="nav-actions">
                    <a class="account-link${user ? " logged-in" : ""}" href="${accountHref}"
                       aria-label="${accountLabel}" title="${accountLabel}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
                        </svg>
                    </a>
                    <a class="cart-icon-link" href="checkout.html" aria-label="Cart">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="9" cy="20" r="1.5"/>
                            <circle cx="18" cy="20" r="1.5"/>
                            <path d="M2 3h3l2.5 12h11l2-8H6"/>
                        </svg>
                        <span class="cart-count" id="cart-count">0</span>
                    </a>
                </div>
            </div>
        `;

        const toggle = mount.querySelector(".menu-toggle");
        const links = mount.querySelector(".nav-links");

        function setMenu(open) {
            links.classList.toggle("open", open);
            toggle.classList.toggle("active", open);
            toggle.setAttribute("aria-expanded", String(open));
        }

        toggle.addEventListener("click", function (event) {
            event.stopPropagation();
            setMenu(!links.classList.contains("open"));
        });

        document.addEventListener("click", function (event) {
            if (!mount.contains(event.target)) setMenu(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") setMenu(false);
        });

        links.addEventListener("click", function (event) {
            if (event.target.closest("a")) setMenu(false);
        });

        updateCartCount();
    }

    
function updateCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;

    // Check if a user is currently logged in
    const user = readJSON(CURRENT_USER_KEY, null);

    // Hide cart badge when logged out
    if (!user) {
        badge.textContent = "";
        badge.style.display = "none";
        return;
    }

    // Show cart count only when logged in
    const count = getCartCount();

    badge.textContent = count > 99 ? "99+" : String(count);
    badge.style.display = count > 0 ? "flex" : "none";
}


    function renderFooter() {
        const mount = document.getElementById("site-footer");
        if (!mount) return;

        mount.innerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <div class="footer-grid">
                        <div>
                            <h3>PatchCare</h3>
                            <p>Thoughtful healthcare essentials for everyday care.</p>
                        </div>
                        <div>
                            <h3>Explore</h3>
                            <div class="footer-links">
                                <a href="index.html">Home</a>
                                <a href="index.html#buy">TriaPatch</a>
                                <a href="orders.html">My Orders</a>
                            </div>
                        </div>
                        <div>
                            <h3>Support</h3>
                            <div class="footer-links">
                                <a href="contact.html">Contact us</a>
                                <a href="login.html">Log in</a>
                                <a href="signup.html">Create account</a>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        &copy; ${new Date().getFullYear()} PatchCare. All rights reserved.
                    </div>
                </div>
            </footer>
        `;
    }

    document.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    renderHeader();
    renderFooter();

    // ======================================
    // PRODUCT DATA + PRODUCT CARD
    // ======================================

    const products = window.PATCHCARE_PRODUCTS || [];

    function createProductCard(product) {
        const name = escapeHTML(product.name);
        const soldOut = Number(product.stock) <= 0;

        return `
            <article class="product-card">
                <button class="product-image-button" type="button"
                        data-view-product="${product.id}"
                        aria-label="View details of ${name}">
                    <span class="product-image">
                        ${product.image
                            ? `<img src="${escapeHTML(product.image)}" alt="${name}" loading="lazy">`
                            : `<span class="medical-cross">+</span>`}
                    </span>
                </button>

                <div class="product-info">
                    <h3>
                        <button class="product-title-button" type="button"
                                data-view-product="${product.id}">${name}</button>
                    </h3>
                    <p>${escapeHTML(product.description)}</p>
                    <div class="product-price">${window.formatPrice(product.price)}</div>
                    <button class="btn" type="button"
                            data-add-cart="${product.id}"
                            ${soldOut ? "disabled" : ""}>
                        ${soldOut ? "Out of Stock" : "Add to Cart"}
                    </button>
                </div>
            </article>
        `;
    }

    // PRODUCT DETAILS MODAL
    // ======================================

    const productModal = document.createElement("div");
    productModal.id = "product-modal";
    productModal.className = "product-modal";

    productModal.innerHTML = `
        <div class="product-modal-backdrop"
             data-close-product-modal></div>

        <section class="product-modal-box"
                 role="dialog"
                 aria-modal="true"
                 aria-label="Product details">

            <button class="product-modal-close"
                    type="button"
                    data-close-product-modal>
                &times;
            </button>

            <div id="product-modal-body"></div>

        </section>
    `;

    document.body.appendChild(productModal);

    function openProductDetails(id) {

        const product = window.getProductById(id);

        if (!product) return;

        const body = document.getElementById("product-modal-body");

        body.innerHTML = `
            <div class="modal-product-layout">

                <div class="modal-product-image">
                    ${
                        product.image
                        ? `<img src="${product.image}" alt="${product.name}">`
                        : `<span class="medical-cross">＋</span>`
                    }
                </div>

                <div class="modal-product-info">

                    <h2>${product.name}</h2>

                    <div class="product-price">
                        ${window.formatPrice(product.price)}
                    </div>

                    <p>${product.description}</p>

                    <p class="modal-stock">
                        <strong>Availability:</strong>
                        ${product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </p>

                    <p>
                        <strong>Available Quantity:</strong>
                        ${product.stock}
                    </p>

                    <label class="modal-quantity-label">
                        Quantity
                        <input
                            type="number"
                            id="modal-quantity"
                            min="1"
                            max="${product.stock}"
                            value="1">
                    </label>

                    <button class="btn modal-add-cart"
                        type="button"
                        data-add-cart="${product.id}"
                        ${product.stock <= 0 ? "disabled" : ""}>
                        Add to Cart
                    </button>

                </div>
            </div>

            <div class="product-modal-tabs">

                <button class="product-tab active"
                    data-product-tab="description">
                    Description
                </button>

                <button class="product-tab"
                    data-product-tab="details">
                    More Details
                </button>

                <button class="product-tab"
                    data-product-tab="reviews">
                    Reviews
                </button>

            </div>

            <div class="product-tab-content">

                <div class="product-tab-panel active"
                     id="tab-description">
                    <h3>Product Description</h3>
                    <p>${product.description}</p>
                </div>

                <div class="product-tab-panel"
                     id="tab-details">
                    <h3>Product Information</h3>
                    <p><strong>Product:</strong> ${product.name}</p>
                    <p><strong>Price:</strong> ${window.formatPrice(product.price)}</p>
                    <p><strong>Available Stock:</strong> ${product.stock}</p>
                    <p><strong>Product ID:</strong> PC-${String(product.id).padStart(3, "0")}</p>
                </div>

                <div class="product-tab-panel"
                     id="tab-reviews">
                    <h3>Customer Reviews</h3>
                    <p class="no-reviews">
                        No customer reviews yet.
                        Be the first to share your experience with this product!
                    </p>
                </div>

            </div>
        `;

        productModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeProductDetails() {
        productModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    document.addEventListener("click", function(event) {

        const viewButton = event.target.closest("[data-view-product]");

        if (viewButton) {
            openProductDetails(Number(viewButton.dataset.viewProduct));
            return;
        }

        if (event.target.closest("[data-close-product-modal]")) {
            closeProductDetails();
            return;
        }

        const tabButton = event.target.closest("[data-product-tab]");

        if (tabButton) {

            const tab = tabButton.dataset.productTab;

            productModal.querySelectorAll(".product-tab").forEach(button => {
                button.classList.toggle("active", button === tabButton);
            });

            productModal.querySelectorAll(".product-tab-panel").forEach(panel => {
                panel.classList.toggle("active", panel.id === "tab-" + tab);
            });
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeProductDetails();
        }
    });

    const featuredContainer =
        document.getElementById("featured-products");

    if (featuredContainer) {
        const featured = products.filter(product => product.featured);

        featuredContainer.innerHTML = featured
            .slice(0, 4)
            .map(createProductCard)
            .join("");
    }

        // ======================================
    // PRODUCT DETAILS PAGE
    // ======================================

    const detailContainer =
        document.getElementById("product-detail");

    if (detailContainer) {

        const productId =
            new URLSearchParams(location.search).get("id");

        const product =
            window.getProductById(productId);

        if (!product) {

            detailContainer.innerHTML = `
                <div class="empty-content">
                    <h3>Product not found</h3>
                    <p>The product you are looking for is unavailable.</p>
                    <a href="index.html#buy" class="btn">Back to TriaPatch</a>
                </div>
            `;

        } else {

            detailContainer.innerHTML = `
                <div class="product-detail-layout">

                    <div class="product-detail-image">
                        ${
                            product.image
                            ? `<img src="${product.image}" alt="${product.name}">`
                            : `<span class="medical-cross">＋</span>`
                        }
                    </div>

                    <div class="product-detail-info">
<h1>${product.name}</h1>

                        <p>${product.description}</p>

                        <div class="detail-price">
                            ${window.formatPrice(product.price)}
                        </div>

                        <p>Available stock: ${product.stock}</p>

                        <label>
                            Quantity
                            <input
                                class="quantity-input"
                                id="detail-quantity"
                                type="number"
                                min="1"
                                max="${product.stock}"
                                value="1">
                        </label>

                        <button
                            class="btn"
                            type="button"
                            data-add-cart="${product.id}">
                            Add to Cart
                        </button>

                        <a href="index.html#buy" class="btn btn-light">
                            Continue Shopping
                        </a>

                    </div>

                </div>
            `;
        }
    }

    // ======================================
    // ADD TO CART
    // ======================================

    document.addEventListener("click", function (event) {

        const button = event.target.closest("[data-add-cart]");

        if (!button) return;

        const id = Number(button.dataset.addCart);
        const product = window.getProductById(id);

        if (!product) return;

        const detailQuantity =
            document.getElementById("detail-quantity");

        const modalQuantity =
            document.getElementById("modal-quantity");

        const quantityInput = modalQuantity || detailQuantity;

        const quantity = quantityInput
            ? Number(quantityInput.value)
            : 1;

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > product.stock
        ) {
            alert("Please enter a valid quantity.");
            return;
        }

        let cart = JSON.parse(
            localStorage.getItem("patchcare_cart") || "[]"
        );

        const existing = cart.find(item => item.id === id);

        const newQuantity =
            (existing ? existing.quantity : 0) + quantity;

        if (newQuantity > product.stock) {
            alert("Not enough stock available.");
            return;
        }

        if (existing) {
            existing.quantity = newQuantity;
        } else {
            cart.push({
                id: id,
                quantity: quantity
            });
        }

        localStorage.setItem(
            "patchcare_cart",
            JSON.stringify(cart)
        );

        document.dispatchEvent(new Event("cartUpdated"));
        alert(product.name + " added to cart!");
    });


})();
