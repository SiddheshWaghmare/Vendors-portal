// UI handling
class UI {
    static loadPage(pageName) {
        const app = document.getElementById('app');
        
        switch(pageName) {
            case 'landing':
                app.innerHTML = this.getLandingPageHTML();
                break;
            case 'login':
                app.innerHTML = this.getLoginPageHTML();
                break;
            case 'signup':
                app.innerHTML = this.getSignupPageHTML();
                break;
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'vendors':
                this.loadVendors();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            default:
                app.innerHTML = this.getLandingPageHTML();
        }
    }

    static getLandingPageHTML() {
        return `
            <div class="gradient-bg min-vh-100 d-flex flex-column justify-content-center align-items-center text-white">
                <nav class="position-absolute top-0 w-100 p-4">
                    <div class="container d-flex justify-content-between align-items-center">
                        <h2 class="mb-0">Vendor Portal</h2>
                        <div>
                            <button class="btn btn-outline-light me-2" onclick="UI.loadPage('login')">Login</button>
                            <button class="btn btn-light" onclick="UI.loadPage('signup')">Sign Up</button>
                        </div>
                    </div>
                </nav>
                <div class="text-center">
                    <h1 class="display-4 mb-4">Welcome to Vendor Portal!</h1>
                    <p class="lead mb-5">Manage vendors, products, and analytics with ease.</p>
                    <button class="btn btn-light btn-lg" onclick="UI.loadPage('signup')">Get Started</button>
                </div>
            </div>
        `;
    }

    static getLoginPageHTML() {
        return `
            <div class="container auth-container">
                <div class="card">
                    <div class="card-body">
                        <h2 class="text-center mb-4">Login</h2>
                        <form id="loginForm">
                            <div class="mb-3">
                                <input type="email" class="form-control" name="email" placeholder="Email" required>
                            </div>
                            <div class="mb-3">
                                <input type="password" class="form-control" name="password" placeholder="Password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>
                        <div class="text-center mt-3">
                            <a href="#" onclick="UI.loadPage('signup')">Don't have an account? Sign Up</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static getSignupPageHTML() {
        return `
            <div class="container auth-container">
                <div class="card">
                    <div class="card-body">
                        <h2 class="text-center mb-4">Sign Up</h2>
                        <form id="signupForm">
                            <div class="mb-3">
                                <input type="email" class="form-control" name="email" placeholder="Email" required>
                            </div>
                            <div class="mb-3">
                                <input type="password" class="form-control" name="password" placeholder="Password" required>
                            </div>
                            <div class="mb-3">
                                <input type="password" class="form-control" name="confirmPassword" placeholder="Confirm Password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Sign Up</button>
                        </form>
                        <div class="text-center mt-3">
                            <a href="#" onclick="UI.loadPage('login')">Already have an account? Login</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static async loadDashboard() {
        try {
            const data = await Database.getAnalyticsData();
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="container-fluid">
                    <div class="row">
                        <!-- Sidebar -->
                        ${this.getSidebarHTML()}
                        
                        <!-- Main content -->
                        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h1>Dashboard</h1>
                            </div>
                            
                            <!-- Stats -->
                            <div class="row">
                                ${this.getStatsHTML()}
                            </div>
                            
                            <!-- Charts -->
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">Monthly Revenue</h5>
                                            <canvas id="revenueChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <h5 class="card-title">Product Performance</h5>
                                            <canvas id="productChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            `;
            
            this.initializeCharts(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    static async loadVendors() {
        try {
            const vendors = await Database.getVendors();
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="container-fluid">
                    <div class="row">
                        ${this.getSidebarHTML()}
                        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                <h1>Vendors</h1>
                                <button class="btn btn-primary" onclick="UI.showAddVendorModal()">Add Vendor</button>
                            </div>
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Contact</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.getVendorsTableHTML(vendors)}
                                    </tbody>
                                </table>
                            </div>
                        </main>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading vendors:', error);
        }
    }

    static getSidebarHTML() {
        return `
            <nav class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#" onclick="UI.loadPage('dashboard')">
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#" onclick="UI.loadPage('vendors')">
                                Vendors
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#" onclick="UI.loadPage('products')">
                                Products
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#" onclick="UI.loadPage('orders')">
                                Orders
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#" onclick="UI.loadPage('analytics')">
                                Analytics
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
    }

    static getStatsHTML() {
        return `
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Total Vendors</h5>
                        <p class="card-text display-6">150</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Total Products</h5>
                        <p class="card-text display-6">1,234</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Total Orders</h5>
                        <p class="card-text display-6">5,678</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Total Revenue</h5>
                        <p class="card-text display-6">$123,456</p>
                    </div>
                </div>
            </div>
        `;
    }

    static initializeCharts(data) {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: data.monthlyRevenue.map(item => item.month),
                datasets: [{
                    label: 'Monthly Revenue',
                    data: data.monthlyRevenue.map(item => item.total),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Product Performance Chart
        const productCtx = document.getElementById('productChart').getContext('2d');
        new Chart(productCtx, {
            type: 'line',
            data: {
                labels: data.productPerformance.map(item => item.name),
                datasets: [{
                    label: 'Sales',
                    data: data.productPerformance.map(item => item.sales),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            }
        });
    }
}
