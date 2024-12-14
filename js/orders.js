// Global variables
let orders = [];

// Load orders when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeOrders();
    setupEventListeners();
});

// Initialize orders from localStorage or JSON file
async function initializeOrders() {
    await loadOrdersFromJSON();
    displayOrders();
}

// Load orders from JSON file
async function loadOrdersFromJSON() {
    try {
        const response = await fetch('../data/orders.json');
        const data = await response.json();
        orders = data.orders || [];
        saveOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
    }
}

// Display orders in the table
function displayOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;

    if (!orders.length) {
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
        return;
    }

    // Sort orders to show newest first (based on ID)
    const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

    ordersTableBody.innerHTML = sortedOrders.map(order => `
        <tr data-order-id="${order.id}">
            <td>${order.orderNumber}</td>
            <td>${order.customerName}</td>
            <td>${order.productName}</td>
            <td>${order.quantity}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            <td>${order.orderDate}</td>
            <td>
                <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-primary" onclick="editOrder(${order.id})" data-order-id="${order.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})" data-order-id="${order.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Add direct event listeners to all buttons
    addRowEventListeners();
}

// Get appropriate badge class based on status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'delivered':
            return 'bg-success';
        case 'processing':
            return 'bg-warning text-dark';
        case 'shipped':
            return 'bg-info text-dark';
        default:
            return 'bg-secondary';
    }
}

// Add event listeners to table rows and buttons
function addRowEventListeners() {
    // Edit buttons
    document.querySelectorAll('button[data-order-id]').forEach(button => {
        const orderId = parseInt(button.getAttribute('data-order-id'));
        if (button.classList.contains('btn-primary')) {
            button.onclick = () => editOrder(orderId);
        } else if (button.classList.contains('btn-danger')) {
            button.onclick = () => deleteOrder(orderId);
        }
    });
}

// Function to add new order
function addOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Generate new ID as max existing ID + 1
    const maxId = orders.reduce((max, order) => Math.max(max, order.id), 0);
    const newOrder = {
        id: maxId + 1,
        orderNumber: generateOrderNumber(),
        customerName: formData.get('customerName').trim(),
        productName: formData.get('productName').trim(),
        quantity: parseInt(formData.get('quantity')),
        totalAmount: parseFloat(formData.get('totalAmount')),
        status: formData.get('status'),
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: null,
        shippingAddress: formData.get('shippingAddress').trim(),
        paymentMethod: formData.get('paymentMethod')
    };

    // Validate required fields
    if (!newOrder.customerName || !newOrder.productName || !newOrder.quantity || !newOrder.totalAmount) {
        showToast('Please fill in all required fields', 'danger');
        return;
    }

    // Add to beginning of array
    orders.unshift(newOrder);
    saveOrders();
    displayOrders();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addOrderModal'));
    modal.hide();
    form.reset();
    showToast('Order added successfully!', 'success');
}

// Generate unique order number
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const maxId = orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
    return `ORD-${year}-${month}-${String(maxId).padStart(3, '0')}`;
}

// Function to edit order
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showToast('Order not found', 'danger');
        return;
    }

    // Populate edit modal
    const form = document.getElementById('editOrderForm');
    form.elements['orderId'].value = order.id;
    form.elements['customerName'].value = order.customerName;
    form.elements['productName'].value = order.productName;
    form.elements['quantity'].value = order.quantity;
    form.elements['totalAmount'].value = order.totalAmount;
    form.elements['status'].value = order.status;
    form.elements['shippingAddress'].value = order.shippingAddress;
    form.elements['paymentMethod'].value = order.paymentMethod;

    // Show edit modal
    const editModal = new bootstrap.Modal(document.getElementById('editOrderModal'));
    editModal.show();
}

// Function to update order
function updateOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const orderId = parseInt(formData.get('orderId'));

    // Find order index
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) {
        showToast('Order not found', 'danger');
        return;
    }

    // Validate required fields
    const customerName = formData.get('customerName').trim();
    const productName = formData.get('productName').trim();
    const quantity = parseInt(formData.get('quantity'));
    const totalAmount = parseFloat(formData.get('totalAmount'));

    if (!customerName || !productName || !quantity || !totalAmount) {
        showToast('Please fill in all required fields', 'danger');
        return;
    }

    // Update order while preserving other fields
    orders[index] = {
        ...orders[index],
        customerName,
        productName,
        quantity,
        totalAmount,
        status: formData.get('status'),
        shippingAddress: formData.get('shippingAddress').trim(),
        paymentMethod: formData.get('paymentMethod'),
        lastUpdated: new Date().toISOString().split('T')[0]
    };

    saveOrders();
    displayOrders();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
    modal.hide();
    showToast('Order updated successfully!', 'success');
}

// Function to delete order
function deleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showToast('Order not found', 'danger');
        return;
    }

    if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders.splice(index, 1);
            saveOrders();
            displayOrders();
            showToast('Order deleted successfully!', 'success');
        }
    }
}

// Save orders to localStorage
function saveOrders() {
    try {
        localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving orders:', error);
        showToast('Error saving changes', 'danger');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('[data-bs-toggle="tooltip"][title="Refresh"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadOrdersFromJSON();
            displayOrders();
            showToast('Orders refreshed', 'info');
        });
    }

    // Add order form
    const addOrderForm = document.getElementById('addOrderForm');
    if (addOrderForm) {
        addOrderForm.addEventListener('submit', addOrder);
    }

    // Edit order form
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', updateOrder);
    }
}
