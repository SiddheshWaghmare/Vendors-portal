// Sample product data (replace with actual data from your backend)
let products = [
    {
        id: 1,
        name: "Product 1",
        category: "Electronics",
        price: 499.99,
        stock: 50,
        status: "active",
        image: "../assets/images/product1.jpg"
    },
    {
        id: 2,
        name: "Product 2",
        category: "Clothing",
        price: 59.99,
        stock: 100,
        status: "active",
        image: "../assets/images/product2.jpg"
    }
];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchProduct');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');
const addProductForm = document.getElementById('addProductForm');
const editProductForm = document.getElementById('editProductForm');

// Utility Functions
function showAlert(message, type = 'info') {
    console.log(message); // Just log to console for debugging
}

// Format price with currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Render product card
function createProductCard(product) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">
                        <span class="badge bg-secondary">${product.category}</span>
                        <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                            ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </p>
                    <p class="card-text">Price: ${formatPrice(product.price)}</p>
                    <p class="card-text">Stock: ${product.stock} units</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-primary" onclick="editProduct(${product.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Display products
function displayProducts(productsToShow = products) {
    if (!productGrid) return;
    
    if (productsToShow.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    No products found.
                </div>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

// Filter products
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const stockStatus = stockFilter.value;

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === '' || product.category === category;
        const matchesStock = stockStatus === '' || 
            (stockStatus === 'inStock' && product.stock > 0) ||
            (stockStatus === 'outOfStock' && product.stock === 0);

        return matchesSearch && matchesCategory && matchesStock;
    });

    displayProducts(filteredProducts);
}

// Add new product
function addProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(addProductForm);
    const newProduct = {
        id: products.length + 1,
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        status: 'active',
        image: formData.get('image') || '../assets/images/default-product.jpg'
    };

    products.push(newProduct);
    displayProducts();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    addProductForm.reset();
    showAlert('Product added successfully!', 'success');
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Populate edit form
    const editForm = document.getElementById('editProductForm');
    editForm.elements['productId'].value = product.id;
    editForm.elements['name'].value = product.name;
    editForm.elements['category'].value = product.category;
    editForm.elements['price'].value = product.price;
    editForm.elements['stock'].value = product.stock;

    // Show edit modal
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    editModal.show();
}

// Update product
function updateProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(editProductForm);
    const productId = parseInt(formData.get('productId'));
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) return;

    products[productIndex] = {
        ...products[productIndex],
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock'))
    };

    displayProducts();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    modal.hide();
    showAlert('Product updated successfully!', 'success');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    products = products.filter(p => p.id !== productId);
    displayProducts();
    showAlert('Product deleted successfully!', 'success');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial display
    displayProducts();

    // Search and filter
    searchInput?.addEventListener('input', filterProducts);
    categoryFilter?.addEventListener('change', filterProducts);
    stockFilter?.addEventListener('change', filterProducts);

    // Form submissions
    addProductForm?.addEventListener('submit', addProduct);
    editProductForm?.addEventListener('submit', updateProduct);

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('content').classList.toggle('expanded');
    });

    // Mobile sidebar close
    document.getElementById('sidebarCollapseBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('content').classList.add('expanded');
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            // Implement logout logic here
            window.location.href = 'login.html';
        }
    });
});
