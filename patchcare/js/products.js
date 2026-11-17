
window.PATCHCARE_PRODUCTS = [
    {
        id: 1,
        name: "TriaPatch",
        price: 149,
        description: "A wearable temperature-monitoring patch with a thermo-reactive, sweat-sensitive layer that changes color based on body temperature to show normal, fever, or high fever. Gentle on skin and made for long-lasting monitoring, for caregivers and healthcare providers.",
        image: "assets/images/products/Triapatch.jpg",
        stock: 50,
        featured: true
    }
];

window.getProductById = function (id) {
    return window.PATCHCARE_PRODUCTS.find(
        product => product.id === Number(id)
    );
};

window.formatPrice = function (price) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(price);
};
