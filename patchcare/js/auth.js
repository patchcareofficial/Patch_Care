
// ==========================================
// PATCHCARE - AUTHENTICATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const USERS_KEY = "patchcare_users";
    const CURRENT_USER_KEY = "patchcare_current_user";
    const ORDERS_KEY = "patchcare_orders";

    function getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function isStrongPassword(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password);
    }

    function passwordHelpMessage() {
        return "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    // ======================================
    // SIGN UP
    // ======================================

    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = signupForm.elements.name.value.trim();
            const email = signupForm.elements.email.value.trim().toLowerCase();
            const username = signupForm.elements.username.value.trim().toLowerCase();
            const password = signupForm.elements.password.value;
            const confirm = signupForm.elements.confirm.value;

            if (!isStrongPassword(password)) {
                alert(passwordHelpMessage());
                return;
            }

            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }

            const users = getUsers();

            const existingUser = users.find(user =>
                user.email === email || user.username === username
            );

            if (existingUser) {
                alert("Email or username is already registered.");
                return;
            }

            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);

            alert("Account created successfully!");

            window.location.href = "login.html";
        });
    }

    // ======================================
    // LOGIN
    // ======================================

    const loginForm = document.getElementById("login-form");

    if (
        (loginForm || document.getElementById("signup-form")) &&
        localStorage.getItem(CURRENT_USER_KEY)
    ) {
        window.location.replace("index.html");
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const identity = loginForm.elements.identity.value.trim().toLowerCase();
            const password = loginForm.elements.password.value;

            const users = getUsers();

            const user = users.find(account =>
                (account.email === identity ||
                 account.username === identity) &&
                account.password === password
            );

            if (!user) {
                alert("Incorrect email, username, or password.");
                return;
            }

            const loggedInUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone || "",
                address: user.address || ""
            };

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(loggedInUser)
            );

            // CONNECT PREVIOUS GUEST ORDERS TO THIS ACCOUNT
            const orders = JSON.parse(
                localStorage.getItem(ORDERS_KEY) || "[]"
            );

            const updatedOrders = orders.map(order => {
                if (
                    !order.userId &&
                    order.customer &&
                    order.customer.email &&
                    order.customer.email.toLowerCase() === user.email.toLowerCase()
                ) {
                    return {
                        ...order,
                        userId: user.id
                    };
                }

                return order;
            });

            localStorage.setItem(
                ORDERS_KEY,
                JSON.stringify(updatedOrders)
            );

            alert("Welcome back, " + user.name + "!");

            sessionStorage.removeItem("patchcare_after_login");
            window.location.replace("index.html");
        });
    }

    // ======================================
    // FORGOT PASSWORD (demo: no email is sent)
    // ======================================

    const forgotForm = document.getElementById("forgot-form");

    if (forgotForm) {
        forgotForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = forgotForm.elements.email.value.trim().toLowerCase();
            const username = forgotForm.elements.username.value.trim().toLowerCase();
            const password = forgotForm.elements.password.value;
            const confirm = forgotForm.elements.confirm.value;

            const users = getUsers();
            const index = users.findIndex(account =>
                account.email === email && account.username === username
            );

            if (index === -1) {
                alert("We could not find an account with that email and username.");
                return;
            }

            if (!isStrongPassword(password)) {
                alert(passwordHelpMessage());
                return;
            }

            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }

            users[index].password = password;
            saveUsers(users);

            alert("Password reset successfully. You can now log in.");
            window.location.href = "login.html";
        });
    }

    // ======================================
    // PASSWORD VISIBILITY
    // ======================================

    document.querySelectorAll("[data-toggle]").forEach(button => {
        button.addEventListener("click", function () {
            const input = document.getElementById(this.dataset.toggle);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                this.textContent = "Hide";
            } else {
                input.type = "password";
                this.textContent = "Show";
            }
        });
    });

    // ======================================
    // PROFILE
    // ======================================

    const profileContent = document.getElementById("profile-content");

    if (profileContent) {
        const user = getCurrentUser();

        if (!user) {
            profileContent.innerHTML = `
                <div class="empty-content">
                    <h3>Please log in first.</h3>
                    <a href="login.html" class="btn">Log In</a>
                </div>
            `;
        } else {
            // Saved account (has createdAt) and this customer's real orders
            const account = getUsers().find(
                item => String(item.id) === String(user.id)
            ) || user;

            profileContent.innerHTML = `
                <div class="form-container">
                    <h2>Account Information</h2>

                    <div class="form-group">
                        <label>Full Name</label>
                        <input value="${esc(user.name)}" readonly>
                    </div>

                    <div class="form-group">
                        <label>Email Address</label>
                        <input value="${esc(user.email)}" readonly>
                    </div>

                    <div class="form-group">
                        <label>Username</label>
                        <input value="${esc(user.username)}" readonly>
                    </div>

                    <form id="profile-form">

                        <div class="form-group">
                            <label for="profile-phone">Contact Number</label>
                            <input type="tel" id="profile-phone"
                                placeholder="09XXXXXXXXX"
                                value="${esc(account.phone || "")}">
                        </div>

                        <div class="form-group">
                            <label for="profile-address">Delivery Address</label>
                            <textarea id="profile-address" rows="3"
                                placeholder="House number, street, barangay, city">${esc(account.address || "")}</textarea>
                        </div>

                        <button type="submit" class="btn full-width">
                            Save Changes
                        </button>

                    </form>

                    <a href="orders.html" class="btn btn-light full-width mt-20">
                        View My Orders
                    </a>

                    <button type="button" class="btn btn-light full-width mt-20"
                        id="logout-button">
                        Log Out
                    </button>
                </div>
            `;

            document.getElementById("profile-form")
                .addEventListener("submit", function (event) {
                    event.preventDefault();

                    const phone = document
                        .getElementById("profile-phone").value.trim();
                    const address = document
                        .getElementById("profile-address").value.trim();

                    if (phone && !/^09\d{9}$/.test(phone)) {
                        alert("Enter a valid mobile number, like 09123456789.");
                        return;
                    }

                    const users = getUsers();
                    const index = users.findIndex(
                        item => String(item.id) === String(user.id)
                    );

                    if (index !== -1) {
                        users[index].phone = phone;
                        users[index].address = address;
                        saveUsers(users);
                    }

                    localStorage.setItem(
                        CURRENT_USER_KEY,
                        JSON.stringify({ ...user, phone, address })
                    );

                    alert("Profile updated.");
                });

            document.getElementById("logout-button")
                .addEventListener("click", function () {
                    localStorage.removeItem(CURRENT_USER_KEY);
                    alert("You have been logged out.");
                    window.location.href = "index.html";
                });
        }
    }

    // ======================================
    // MY ORDERS
    // ======================================

    const ordersContent = document.getElementById("orders-content");

    if (ordersContent) {
        const user = getCurrentUser();

        const money = amount => typeof window.formatPrice === "function"
            ? window.formatPrice(amount)
            : "\u20B1" + Number(amount || 0).toFixed(2);

        const allOrders = () =>
            JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");

        const belongsToUser = order =>
            String(order.userId) === String(user.id) ||
            (!order.userId && order.customer &&
             String(order.customer.email || "").toLowerCase() ===
             String(user.email).toLowerCase());

        const updateOrder = (id, changes) => {
            const orders = allOrders();
            const order = orders.find(item => String(item.id) === String(id));

            if (!order) return;

            Object.assign(order, changes);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        };

        const trackerHtml = status => {
            const steps = [
                ["Pending", "Order Placed"],
                ["Shipped", "Shipped"],
                ["Delivered", "Delivered"]
            ];
            const current = steps.findIndex(step => step[0] === status);

            return `
                <div class="order-tracker">
                    ${steps.map((step, i) => `
                        <div class="tracker-step ${i <= current ? "done" : ""}">
                            <div class="tracker-dot">${i <= current ? "&#10003;" : i + 1}</div>
                            ${step[1]}
                        </div>
                    `).join("")}
                </div>
            `;
        };

        const orderHtml = order => {
            const status = order.status || "Pending";
            const customer = order.customer || {};
            const id = esc(order.id);

            let actions = "";

            if (status === "Pending") {
                actions = `<button type="button" class="btn btn-light btn-cancel"
                    data-cancel-order="${id}">Cancel Order</button>`;
            } else if (status === "Shipped") {
                actions = `<button type="button" class="btn"
                    data-receive-order="${id}">Order Received</button>`;
            } else if (status === "Delivered") {
                actions = `<a href="index.html#buy" class="btn btn-light">Buy Again</a>`;
            }

            const demo = status === "Pending"
                ? `<button type="button" class="demo-link"
                    data-ship-order="${id}">Demo: mark as Shipped</button>`
                : "";

            return `
                <article class="order-card">

                    <div class="order-top">
                        <div>
                            <h3>Order #${id}</h3>
                            <p class="order-date">${esc(order.date || "")}</p>
                        </div>
                        <span class="order-status status-${esc(status.toLowerCase())}">
                            ${esc(status)}
                        </span>
                    </div>

                    ${status === "Cancelled"
                        ? `<p class="order-cancelled">This order was cancelled.</p>`
                        : trackerHtml(status)}

                    <div class="order-items">
                        ${(order.items || []).map(item => `
                            <div class="order-item-row">
                                <span>${esc(item.name)} &times; ${esc(item.quantity)}</span>
                                <span>${money(item.subtotal)}</span>
                            </div>
                        `).join("")}
                    </div>

                    <div class="order-meta">
                        <p><strong>Payment:</strong> ${esc(order.payment || "")}</p>
                        <p><strong>Deliver to:</strong> ${esc(customer.name || "")}
                            ${customer.phone ? "&middot; " + esc(customer.phone) : ""}</p>
                        <p>${esc(customer.address || "")}</p>
                    </div>

                    <div class="order-footer">
                        <strong>Total: ${money(order.total)}</strong>
                        <div class="order-actions">${actions}</div>
                    </div>

                    ${demo}

                </article>
            `;
        };

        const renderOrders = () => {
            if (!user) {
                ordersContent.innerHTML = `
                    <div class="empty-content">
                        <h3>Please log in to view your orders.</h3>
                        <a href="login.html" class="btn">Log In</a>
                    </div>
                `;
                return;
            }

            const mine = allOrders().filter(belongsToUser).reverse();

            if (mine.length === 0) {
                ordersContent.innerHTML = `
                    <div class="empty-content">
                        <h3>No orders yet.</h3>
                        <p>Your purchases will appear here.</p>
                        <a href="index.html#buy" class="btn">Start Shopping</a>
                    </div>
                `;
                return;
            }

            ordersContent.innerHTML = `
                <p class="orders-summary">
                    You have <strong>${mine.length}</strong>
                    order${mine.length === 1 ? "" : "s"}
                </p>
                ${mine.map(orderHtml).join("")}
            `;
        };

        ordersContent.addEventListener("click", function (event) {
            const cancel = event.target.closest("[data-cancel-order]");
            const receive = event.target.closest("[data-receive-order]");
            const ship = event.target.closest("[data-ship-order]");

            if (cancel) {
                if (!confirm("Cancel this order?")) return;
                updateOrder(cancel.dataset.cancelOrder, {
                    status: "Cancelled",
                    cancelledAt: new Date().toLocaleString()
                });
            } else if (receive) {
                updateOrder(receive.dataset.receiveOrder, {
                    status: "Delivered",
                    deliveredAt: new Date().toLocaleString()
                });
            } else if (ship) {
                updateOrder(ship.dataset.shipOrder, {
                    status: "Shipped",
                    shippedAt: new Date().toLocaleString()
                });
            } else {
                return;
            }

            renderOrders();
        });

        renderOrders();
    }

});
