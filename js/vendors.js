// Global variables
let vendors = [];

// Load vendors when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeVendors();
    setupEventListeners();
    initializeFilters();
});

// Initialize vendors from localStorage or JSON file
async function initializeVendors() {
    await loadVendorsFromJSON();
    displayVendors();
}

// Load vendors from JSON file
async function loadVendorsFromJSON() {
    try {
        const response = await fetch('../data/vendors.json');
        const data = await response.json();
        vendors = data.vendors || [];
        saveVendors();
    } catch (error) {
        console.error('Error loading vendors:', error);
        vendors = [];
    }
}

// Display vendors in the table
function displayVendors() {
    const vendorsTableBody = document.getElementById('vendorsTableBody');
    if (!vendorsTableBody) return;

    if (!vendors.length) {
        vendorsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No vendors found</td></tr>';
        return;
    }

    // Sort vendors to show newest first (based on ID)
    const sortedVendors = [...vendors].sort((a, b) => b.id - a.id);

    vendorsTableBody.innerHTML = sortedVendors.map(vendor => `
        <tr data-vendor-id="${vendor.id}">
            <td>${vendor.name}</td>
            <td>${vendor.email}</td>
            <td>${vendor.phone}</td>
            <td><span class="badge ${vendor.status === 'Active' ? 'bg-success' : 'bg-danger'}">${vendor.status}</span></td>
            <td>
                <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-primary" onclick="editVendor(${vendor.id})" data-vendor-id="${vendor.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteVendor(${vendor.id})" data-vendor-id="${vendor.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Add direct event listeners to all buttons
    addRowEventListeners();
}

// Add event listeners to table rows and buttons
function addRowEventListeners() {
    // Edit buttons
    document.querySelectorAll('button[data-vendor-id]').forEach(button => {
        const vendorId = parseInt(button.getAttribute('data-vendor-id'));
        if (button.classList.contains('btn-primary')) {
            button.onclick = () => editVendor(vendorId);
        } else if (button.classList.contains('btn-danger')) {
            button.onclick = () => deleteVendor(vendorId);
        }
    });
}

// Function to add new vendor
function addVendor(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Generate new ID as max existing ID + 1
    const maxId = vendors.reduce((max, vendor) => Math.max(max, vendor.id), 0);
    const newVendor = {
        id: maxId + 1,
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        status: formData.get('status') || 'Active',
        address: formData.get('address').trim(),
        category: formData.get('category').trim(),
        joinDate: new Date().toISOString().split('T')[0]
    };

    // Validate required fields
    if (!newVendor.name || !newVendor.email || !newVendor.phone) {
        showToast('Please fill in all required fields', 'danger');
        return;
    }

    // Add to beginning of array
    vendors.unshift(newVendor);
    saveVendors();
    displayVendors();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addVendorModal'));
    modal.hide();
    form.reset();
    showToast('Vendor added successfully!', 'success');
}

// Function to edit vendor
function editVendor(vendorId) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
        showToast('Vendor not found', 'danger');
        return;
    }

    // Populate edit modal
    const form = document.getElementById('editVendorForm');
    form.elements['vendorId'].value = vendor.id;
    form.elements['name'].value = vendor.name;
    form.elements['email'].value = vendor.email;
    form.elements['phone'].value = vendor.phone;
    form.elements['status'].value = vendor.status;
    form.elements['address'].value = vendor.address || '';
    form.elements['category'].value = vendor.category || '';

    // Show edit modal
    const editModal = new bootstrap.Modal(document.getElementById('editVendorModal'));
    editModal.show();
}

// Function to update vendor
function updateVendor(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const vendorId = parseInt(formData.get('vendorId'));

    // Find vendor index
    const index = vendors.findIndex(v => v.id === vendorId);
    if (index === -1) {
        showToast('Vendor not found', 'danger');
        return;
    }

    // Validate required fields
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();

    if (!name || !email || !phone) {
        showToast('Please fill in all required fields', 'danger');
        return;
    }

    // Update vendor while preserving other fields
    vendors[index] = {
        ...vendors[index],
        name,
        email,
        phone,
        status: formData.get('status'),
        address: formData.get('address').trim(),
        category: formData.get('category').trim(),
        lastUpdated: new Date().toISOString().split('T')[0]
    };

    saveVendors();
    displayVendors();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editVendorModal'));
    modal.hide();
    showToast('Vendor updated successfully!', 'success');
}

// Function to delete vendor
function deleteVendor(vendorId) {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
        showToast('Vendor not found', 'danger');
        return;
    }

    if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
        const index = vendors.findIndex(v => v.id === vendorId);
        if (index !== -1) {
            vendors.splice(index, 1);
            saveVendors();
            displayVendors();
            showToast('Vendor deleted successfully!', 'success');
        }
    }
}

// Save vendors to localStorage
function saveVendors() {
    try {
        localStorage.setItem('vendors', JSON.stringify(vendors));
    } catch (error) {
        console.error('Error saving vendors:', error);
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
            await loadVendorsFromJSON();
            displayVendors();
            showToast('Vendors refreshed', 'info');
        });
    }

    // Add vendor form
    const addVendorForm = document.getElementById('addVendorForm');
    if (addVendorForm) {
        addVendorForm.addEventListener('submit', addVendor);
    }

    // Edit vendor form
    const editVendorForm = document.getElementById('editVendorForm');
    if (editVendorForm) {
        editVendorForm.addEventListener('submit', updateVendor);
    }
}

// Filter functionality
let activeFilters = {
    status: null,
    rating: null
};

function initializeFilters() {
    // Add click event listeners to filter items
    document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;

            if (filterType === 'clear') {
                clearFilters();
                return;
            }

            // Toggle filter if already active
            if (activeFilters[filterType] === filterValue) {
                activeFilters[filterType] = null;
            } else {
                activeFilters[filterType] = filterValue;
            }
            
            // Update UI to show active filters
            updateFilterUI();
            
            // Apply filters
            applyFilters();
        });
    });
}

function clearFilters() {
    activeFilters = {
        status: null,
        rating: null
    };
    updateFilterUI();
    applyFilters();
}

function updateFilterUI() {
    // Reset all filter items
    document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected filters
    Object.entries(activeFilters).forEach(([type, value]) => {
        if (value) {
            const filterItem = document.querySelector(`.dropdown-item[data-filter="${type}"][data-value="${value}"]`);
            if (filterItem) {
                filterItem.classList.add('active');
            }
        }
    });

    // Update filter button text
    const filterCount = Object.values(activeFilters).filter(v => v !== null).length;
    const filterBtn = document.querySelector('#filterDropdown');
    if (filterBtn) {
        filterBtn.innerHTML = `<i class="bi bi-funnel me-2"></i>Filter${filterCount > 0 ? ` (${filterCount})` : ''}`;
    }
}

function applyFilters() {
    const rows = document.querySelectorAll('#vendorsTable tbody tr');
    
    rows.forEach(row => {
        let show = true;

        // Check status filter
        if (activeFilters.status) {
            const statusBadge = row.querySelector('.badge');
            if (statusBadge) {
                const status = statusBadge.textContent.trim().toLowerCase();
                show = show && status === activeFilters.status.toLowerCase();
            }
        }

        // Check rating filter
        if (activeFilters.rating && show) {
            const ratingCell = row.querySelector('td:nth-child(5)'); // Adjust column index if needed
            if (ratingCell) {
                const rating = parseInt(ratingCell.textContent.trim());
                show = show && rating >= parseInt(activeFilters.rating);
            }
        }

        // Show/hide row
        row.style.display = show ? '' : 'none';
    });

    // Update table UI if no results
    const visibleRows = document.querySelectorAll('#vendorsTable tbody tr:not([style*="display: none"])');
    const noResultsRow = document.querySelector('#noResultsRow');
    
    if (visibleRows.length === 0) {
        if (!noResultsRow) {
            const tbody = document.querySelector('#vendorsTable tbody');
            const tr = document.createElement('tr');
            tr.id = 'noResultsRow';
            tr.innerHTML = `
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-4 d-block mb-2"></i>
                        <p class="mb-1">No vendors found matching the selected filters</p>
                        <button class="btn btn-link text-decoration-none p-0" onclick="clearFilters()">Clear Filters</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        } else {
            noResultsRow.style.display = '';
        }
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }
}
