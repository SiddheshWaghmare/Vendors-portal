// Load dashboard data from localStorage or JSON file
async function loadDashboardData() {
    let dashboardData = JSON.parse(localStorage.getItem('dashboardData'));
    
    if (!dashboardData) {
        try {
            const response = await fetch('../data/dashboard.json');
            dashboardData = await response.json();
            localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            return null;
        }
    }
    return dashboardData;
}

// Update dashboard statistics
async function updateDashboardStats() {
    const data = await loadDashboardData();
    if (!data) return;

    // Update main statistics
    document.getElementById('totalRevenue').textContent = `$${data.statistics.revenue.total.toLocaleString()}`;
    document.getElementById('totalOrders').textContent = data.statistics.orders.total;
    document.getElementById('averageOrderValue').textContent = `$${data.statistics.averageOrderValue.current.toFixed(2)}`;
    document.getElementById('activeVendors').textContent = data.statistics.activeVendors.current;

    // Update percentage changes
    updatePercentageChange('revenueChange', data.statistics.revenue.percentChange);
    updatePercentageChange('ordersChange', data.statistics.orders.percentChange);
    updatePercentageChange('avgOrderChange', data.statistics.averageOrderValue.percentChange);
    updatePercentageChange('vendorsChange', data.statistics.activeVendors.change, true);

    // Update charts
    updateRevenueChart(data.statistics.revenue);
    updateOrderDistributionChart(data.statistics.orders.distribution);
    updateSalesByCategoryChart(data.salesByCategory);
    
    // Update top products table
    updateTopProducts(data.topProducts);
    
    // Update recent transactions
    updateRecentTransactions(data.recentTransactions);
}

// Helper function to update percentage changes
function updatePercentageChange(elementId, change, isAbsolute = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const isPositive = change > 0;
    const changeText = isAbsolute ? change : `${Math.abs(change)}%`;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-success' : 'text-danger';

    element.textContent = `${arrow} ${changeText}`;
    element.className = `${colorClass} ms-2`;
}

// Update Revenue Chart
function updateRevenueChart(revenueData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: revenueData.monthly,
                borderColor: '#4e73df',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(78, 115, 223, 0.05)'
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Order Distribution Chart
function updateOrderDistributionChart(distributionData) {
    const ctx = document.getElementById('orderDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(distributionData).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
            datasets: [{
                data: Object.values(distributionData),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#f4b619'],
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '75%'
        }
    });
}

// Update Sales by Category Chart
function updateSalesByCategoryChart(categoryData) {
    const ctx = document.getElementById('salesByCategoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryData.map(item => item.category),
            datasets: [{
                label: 'Sales',
                data: categoryData.map(item => item.sales),
                backgroundColor: '#4e73df',
                borderRadius: 4
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
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Top Products Table
function updateTopProducts(products) {
    const tbody = document.querySelector('#topProductsTable tbody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.sales}</td>
            <td>$${product.revenue.toLocaleString()}</td>
        </tr>
    `).join('');
}

// Update Recent Transactions
function updateRecentTransactions(transactions) {
    const tbody = document.querySelector('#recentTransactionsTable tbody');
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.date}</td>
            <td>${transaction.customer}</td>
            <td>${transaction.product}</td>
            <td>$${transaction.amount.toLocaleString()}</td>
            <td><span class="badge bg-${getStatusColor(transaction.status)}">${transaction.status}</span></td>
        </tr>
    `).join('');
}

// Helper function for transaction status colors
function getStatusColor(status) {
    const colors = {
        completed: 'success',
        processing: 'info',
        pending: 'warning',
        cancelled: 'danger'
    };
    return colors[status] || 'secondary';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
});

// Function to update specific dashboard metrics (for future use)
function updateDashboardMetric(metricPath, newValue) {
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData'));
    if (!dashboardData) return;

    // Split the path into an array (e.g., "statistics.revenue.total" -> ["statistics", "revenue", "total"])
    const pathArray = metricPath.split('.');
    let current = dashboardData;
    
    // Traverse the path until the second-to-last element
    for (let i = 0; i < pathArray.length - 1; i++) {
        if (current[pathArray[i]] === undefined) return;
        current = current[pathArray[i]];
    }

    // Update the value
    current[pathArray[pathArray.length - 1]] = newValue;
    
    // Save back to localStorage
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    
    // Refresh the dashboard
    updateDashboardStats();
}
