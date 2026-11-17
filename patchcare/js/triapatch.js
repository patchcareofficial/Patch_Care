// TriaPatch: fever color demo + buy section for the home page
document.addEventListener("DOMContentLoaded", function () {

    const demo = document.getElementById("patch");
    if (!demo) return;

    // ----- Fever color demo -----
    const states = {
        green: [
            "Normal",
            "No fever detected."
        ],
        yellow: [
            "Fever Alert",
            "Fever detected. Monitor the person's temperature and condition."
        ],
        red: [
            "Warning",
            "Seek prompt medical assessment or consult the Rural Health Unit (RHU)."
        ]
    };

    const order = Object.keys(states);
    const tabs = document.querySelectorAll(".demo-tabs [data-s]");
    let index = 0;
    let timer;

    function show(key) {
        demo.dataset.state = key;

        document.getElementById("demo-title").textContent =
            states[key][0];

        document.getElementById("demo-text").textContent =
            states[key][1];

        tabs.forEach(function (tab) {
            tab.setAttribute(
                "aria-selected",
                String(tab.dataset.s === key)
            );
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            clearInterval(timer);
            index = order.indexOf(tab.dataset.s);
            show(tab.dataset.s);
        });
    });

    show("green");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = setInterval(function () {
            index = (index + 1) % order.length;
            show(order[index]);
        }, 2800);
    }

    // ----- Buy section -----
    const product = window.getProductById(1);
    if (!product) return;

document.getElementById("buy-name").textContent =
        product.name;

    document.getElementById("buy-desc").textContent =
        product.description;

    document.getElementById("buy-price").textContent =
        window.formatPrice(product.price);

    document.getElementById("detail-quantity").max =
        product.stock;

    // Add to Cart is handled once by main.js (global click listener)

    // Buy Now: add to cart, then go to checkout
    const buyNow = document.getElementById("buy-now");

    if (buyNow) {
        buyNow.addEventListener("click", function () {
            const quantity = Number(
                document.getElementById("detail-quantity").value
            );

            if (!Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > product.stock) {
                alert("Please enter a valid quantity.");
                return;
            }

            const cart = JSON.parse(
                localStorage.getItem("patchcare_cart") || "[]"
            );

            const existing = cart.find(
                item => item.id === product.id
            );

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
                    id: product.id,
                    quantity: quantity
                });
            }

            localStorage.setItem(
                "patchcare_cart",
                JSON.stringify(cart)
            );

            window.location.href = "checkout.html";
        });
    }
});