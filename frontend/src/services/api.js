// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const user = localStorage.getItem('user');
    const customer = localStorage.getItem('customer');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (customer) {
      try {
        const customerData = JSON.parse(customer);
        if (customerData.token) {
          headers.Authorization = `Bearer ${customerData.token}`;
        }
      } catch (error) {
        console.error('Error parsing customer data:', error);
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Auth specific methods
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  // Account management
  async getAccounts() {
    return this.get('/accounts');
  }

  async createAccount(accountData) {
    return this.post('/accounts', accountData);
  }

  async updateAccount(id, accountData) {
    return this.put(`/accounts/${id}`, accountData);
  }

  async deleteAccount(id) {
    return this.delete(`/accounts/${id}`);
  }

  // Products
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Orders
  async getOrders() {
    return this.get('/orders');
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async updateOrder(id, orderData) {
    return this.put(`/orders/${id}`, orderData);
  }

  async deleteOrder(id) {
    return this.delete(`/orders/${id}`);
  }

  // Categories
  async getCategories() {
    return this.get('/categories');
  }

  async createCategory(categoryData) {
    return this.post('/categories', categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // Customers
  async getCustomers() {
    return this.get('/customers');
  }

  async getCustomer(id) {
    return this.get(`/customers/${id}`);
  }

  async updateCustomer(id, customerData) {
    return this.put(`/customers/${id}`, customerData);
  }

  async deleteCustomer(id) {
    return this.delete(`/customers/${id}`);
  }

  // Coupons
  async getCoupons() {
    return this.get('/coupons');
  }

  async createCoupon(couponData) {
    return this.post('/coupons', couponData);
  }

  async updateCoupon(id, couponData) {
    return this.put(`/coupons/${id}`, couponData);
  }

  async deleteCoupon(id) {
    return this.delete(`/coupons/${id}`);
  }

  // Messages
  async getMessages() {
    return this.get('/messages');
  }

  async createMessage(messageData) {
    return this.post('/messages', messageData);
  }

  async updateMessage(id, messageData) {
    return this.put(`/messages/${id}`, messageData);
  }

  async deleteMessage(id) {
    return this.delete(`/messages/${id}`);
  }

  // Reports
  async getReports() {
    return this.get('/reports');
  }

  async getSalesReport(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/reports/sales?${queryString}`);
  }

  // Website Settings
  async getSettings() {
    return this.get('/settings');
  }

  async updateSettings(settingsData) {
    return this.put('/settings', settingsData);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
