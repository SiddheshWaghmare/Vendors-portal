// Global variables to store data
let orders = [];
let products = [];
let vendors = [];

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchVendors()
    ]);
    
    updateDashboard();
    initializeCharts();
    updateTopVendors();
});

// Fetch data functions
async function fetchOrders() {
    try {
        const response = await fetch('../data/orders.json');
        orders = await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        orders = [];
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('../data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        products = [];
    }
}

async function fetchVendors() {
    try {
        const response = await fetch('../data/vendors.json');
        vendors = await response.json();
    } catch (error) {
        console.error('Error fetching vendors:', error);
        vendors = [];
    }
}

// Update dashboard statistics
function updateDashboard() {
    // Calculate current month's data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const lastMonth = currentMonth - 1;
    
    const currentMonthOrders = orders.filter(order => new Date(order.date).getMonth() === currentMonth);
    const lastMonthOrders = orders.filter(order => new Date(order.date).getMonth() === lastMonth);
    
    // Calculate revenue
    const currentRevenue = calculateTotalRevenue(currentMonthOrders);
    const lastRevenue = calculateTotalRevenue(lastMonthOrders);
    const revenueChange = calculatePercentageChange(lastRevenue, currentRevenue);
    
    // Update revenue card
    document.getElementById('totalRevenue').textContent = formatCurrency(currentRevenue);
    updateChangeIndicator('revenueChange', revenueChange);
    
    // Update orders card
    const ordersChange = calculatePercentageChange(lastMonthOrders.length, currentMonthOrders.length);
    document.getElementById('totalOrders').textContent = currentMonthOrders.length;
    updateChangeIndicator('ordersChange', ordersChange);
    
    // Calculate average order value
    const currentAOV = currentMonthOrders.length ? currentRevenue / currentMonthOrders.length : 0;
    const lastAOV = lastMonthOrders.length ? lastRevenue / lastMonthOrders.length : 0;
    const aovChange = calculatePercentageChange(lastAOV, currentAOV);
    
    document.getElementById('avgOrderValue').textContent = formatCurrency(currentAOV);
    updateChangeIndicator('avgOrderChange', aovChange);
    
    // Update active vendors
    const currentActiveVendors = countActiveVendors(currentMonth);
    const lastActiveVendors = countActiveVendors(lastMonth);
    const vendorChange = currentActiveVendors - lastActiveVendors;
    
    document.getElementById('activeVendors').textContent = currentActiveVendors;
    document.getElementById('vendorsChange').innerHTML = 
        `<i class="bi bi-arrow-${vendorChange >= 0 ? 'up' : 'down'}"></i> ${Math.abs(vendorChange)} from last month`;
}

// Initialize charts
function initializeCharts() {
    initializeRevenueTrendChart();
    initializeOrderDistributionChart();
}

function initializeRevenueTrendChart() {
    const ctx = document.getElementById('revenueTrendChart').getContext('2d');
    const monthlyRevenue = calculateMonthlyRevenue();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLastSixMonths(),
            datasets: [{
                label: 'Revenue',
                data: monthlyRevenue,
                borderColor: '#0d6efd',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function initializeOrderDistributionChart() {
    const ctx = document.getElementById('orderDistributionChart').getContext('2d');
    const distribution = calculateOrderDistribution();
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Processing', 'Cancelled'],
            datasets: [{
                data: [
                    distribution.completed,
                    distribution.pending,
                    distribution.processing,
                    distribution.cancelled
                ],
                backgroundColor: [
                    '#198754',  // success
                    '#ffc107',  // warning
                    '#0dcaf0',  // info
                    '#dc3545'   // danger
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update top vendors section
function updateTopVendors() {
    const topVendorsContainer = document.getElementById('topVendors');
    const vendorPerformance = calculateVendorPerformance();
    const topVendors = vendorPerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const maxRevenue = Math.max(...topVendors.map(v => v.revenue));
    
    topVendorsContainer.innerHTML = topVendors.map(vendor => `
        <div class="vendor-rank">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${vendor.name}</h6>
                    <small class="text-muted">${vendor.orders} orders</small>
                </div>
                <div class="text-end">
                    <h6 class="mb-0">${formatCurrency(vendor.revenue)}</h6>
                    <small class="text-${vendor.growth >= 0 ? 'success' : 'danger'}">
                        ${vendor.growth >= 0 ? '+' : ''}${vendor.growth}%
                    </small>
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${(vendor.revenue / maxRevenue * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function calculateTotalRevenue(ordersList) {
    return ordersList.reduce((total, order) => total + order.total, 0);
}

function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / oldValue * 100).toFixed(1);
}

function updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    element.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
    element.innerHTML = `
        <i class="bi bi-arrow-${change >= 0 ? 'up' : 'down'}"></i>
        ${Math.abs(change)}% from last month
    `;
}

function countActiveVendors(month) {
    const vendorOrders = new Set(
        orders
            .filter(order => new Date(order.date).getMonth() === month)
            .map(order => order.vendorId)
    );
    return vendorOrders.size;
}

function calculateMonthlyRevenue() {
    const monthlyRevenue = new Array(6).fill(0);
    const today = new Date();
    
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        const monthDiff = (today.getMonth() + 12 - orderDate.getMonth()) % 12;
        if (monthDiff < 6) {
            monthlyRevenue[5 - monthDiff] += order.total;
        }
    });
    
    return monthlyRevenue;
}

function getLastSixMonths() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const lastSixMonths = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (today.getMonth() - i + 12) % 12;
        lastSixMonths.push(months[monthIndex]);
    }
    
    return lastSixMonths;
}

function calculateOrderDistribution() {
    const distribution = {
        completed: 0,
        pending: 0,
        processing: 0,
        cancelled: 0
    };
    
    orders.forEach(order => {
        distribution[order.status.toLowerCase()]++;
    });
    
    return distribution;
}

function calculateVendorPerformance() {
    const vendorStats = {};
    const currentMonth = new Date().getMonth();
    const lastMonth = (currentMonth - 1 + 12) % 12;
    
    // Initialize vendor stats
    vendors.forEach(vendor => {
        vendorStats[vendor.id] = {
            name: vendor.name,
            currentRevenue: 0,
            lastRevenue: 0,
            orders: 0
        };
    });
    
    // Calculate revenue and orders
    orders.forEach(order => {
        const orderMonth = new Date(order.date).getMonth();
        const vendorStat = vendorStats[order.vendorId];
        
        if (orderMonth === currentMonth) {
            vendorStat.currentRevenue += order.total;
            vendorStat.orders++;
        } else if (orderMonth === lastMonth) {
            vendorStat.lastRevenue += order.total;
        }
    });
    
    // Calculate growth and format final results
    return Object.values(vendorStats).map(stat => ({
        name: stat.name,
        revenue: stat.currentRevenue,
        orders: stat.orders,
        growth: calculatePercentageChange(stat.lastRevenue, stat.currentRevenue)
    }));
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Sidebar toggle functionality
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('content').classList.toggle('expanded');
});

document.getElementById('sidebarCollapseBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.add('collapsed');
    document.getElementById('content').classList.add('expanded');
});
