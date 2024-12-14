// Revenue Chart Data
const revenueData = {
    'Last 7 Days': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [4500, 5200, 4800, 5900, 6500, 7200, 6800]
    },
    'Last 30 Days': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [24000, 28000, 32000, 35000]
    },
    'Last 3 Months': {
        labels: ['January', 'February', 'March'],
        data: [95000, 88000, 105000]
    },
    'Last Year': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [85000, 88000, 95000, 92000, 98000, 105000, 102000, 108000, 112000, 115000, 118000, 125000]
    }
};

// Order Distribution Data
const orderDistributionData = {
    labels: ['Completed', 'Processing', 'Pending', 'Cancelled'],
    data: [45, 30, 15, 10],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
};

// Initialize Revenue Chart
let revenueChart;
function initRevenueChart(period = 'Last 7 Days') {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (revenueChart) {
        revenueChart.destroy();
    }

    const data = revenueData[period];
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$ ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [2, 2]
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$ ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Initialize Order Distribution Chart
function initOrderDistributionChart() {
    const ctx = document.getElementById('orderDistributionChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: orderDistributionData.labels,
            datasets: [{
                data: orderDistributionData.data,
                backgroundColor: orderDistributionData.colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Sample data for Top Products
const topProducts = [
    {
        name: 'Wireless Earbuds Pro',
        sales: 1250,
        revenue: 124500,
        status: 'In Stock'
    },
    {
        name: 'Smart Watch Series 5',
        sales: 980,
        revenue: 245000,
        status: 'Low Stock'
    },
    {
        name: 'Ultra HD Monitor 27"',
        sales: 745,
        revenue: 186250,
        status: 'In Stock'
    },
    {
        name: 'Gaming Laptop Elite',
        sales: 632,
        revenue: 758400,
        status: 'Out of Stock'
    },
    {
        name: 'Mechanical Keyboard RGB',
        sales: 528,
        revenue: 52800,
        status: 'In Stock'
    }
];

// Sample data for Recent Transactions
const recentTransactions = [
    {
        orderId: 'ORD-2024-001',
        customer: 'John Smith',
        amount: 1299.99,
        status: 'Completed',
        date: '2024-12-14'
    },
    {
        orderId: 'ORD-2024-002',
        customer: 'Emma Wilson',
        amount: 849.50,
        status: 'Processing',
        date: '2024-12-14'
    },
    {
        orderId: 'ORD-2024-003',
        customer: 'Michael Brown',
        amount: 2499.99,
        status: 'Pending',
        date: '2024-12-13'
    },
    {
        orderId: 'ORD-2024-004',
        customer: 'Sarah Davis',
        amount: 599.99,
        status: 'Completed',
        date: '2024-12-13'
    },
    {
        orderId: 'ORD-2024-005',
        customer: 'James Johnson',
        amount: 1799.99,
        status: 'Processing',
        date: '2024-12-12'
    }
];

// Function to populate Top Products table
function populateTopProducts() {
    const tbody = document.getElementById('topProductsTable');
    if (!tbody) return;

    tbody.innerHTML = topProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.sales.toLocaleString()}</td>
            <td>$${product.revenue.toLocaleString()}</td>
            <td class="text-center">
                <span class="badge ${getStatusClass(product.status)}">
                    ${product.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Function to populate Recent Transactions table
function populateRecentTransactions() {
    const tbody = document.getElementById('recentTransactionsTable');
    if (!tbody) return;

    tbody.innerHTML = recentTransactions.map(transaction => `
        <tr>
            <td>${transaction.orderId}</td>
            <td>${transaction.customer}</td>
            <td>$${transaction.amount.toLocaleString()}</td>
            <td class="text-center">
                <span class="badge ${getTransactionStatusClass(transaction.status)}">
                    ${transaction.status}
                </span>
            </td>
            <td>${formatDate(transaction.date)}</td>
        </tr>
    `).join('');
}

// Helper function to get status badge class
function getStatusClass(status) {
    switch (status) {
        case 'In Stock':
            return 'bg-success';
        case 'Low Stock':
            return 'bg-warning';
        case 'Out of Stock':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Helper function to get transaction status badge class
function getTransactionStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'bg-success';
        case 'Processing':
            return 'bg-primary';
        case 'Pending':
            return 'bg-warning';
        case 'Cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initRevenueChart();
    initOrderDistributionChart();

    // Populate tables
    populateTopProducts();
    populateRecentTransactions();

    // Add event listener for revenue period change
    const revenuePeriodSelect = document.querySelector('.card-actions select');
    if (revenuePeriodSelect) {
        revenuePeriodSelect.addEventListener('change', function(e) {
            initRevenueChart(e.target.value);
        });
    }
});
