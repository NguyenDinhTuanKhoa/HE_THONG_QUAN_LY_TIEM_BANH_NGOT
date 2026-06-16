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

  async forgotPassword(email) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, password) {
    return this.post('/auth/reset-password', { token, password });
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

  // Upload product image (multipart/form-data)
  async uploadProductImage(file) {
    const formData = new FormData();
    formData.append('featured_image', file);

    const headers = {};
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.token) headers.Authorization = `Bearer ${u.token}`;
      } catch {}
    }

    const response = await fetch(`${this.baseURL}/products/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed: ${response.status}`);
    }
    return response.json();
  }

  // Products
  async getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/products${qs ? '?' + qs : ''}`);
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
  async getOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/orders${qs ? '?' + qs : ''}`);
  }

  async updateOrder(id, data) {
    if (data.status && Object.keys(data).length === 1) {
      return this.put(`/orders/${id}/status`, { status: data.status });
    }
    return this.put(`/orders/${id}`, data);
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
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

  // Customer authentication & profile
  async customerRegister(data) {
    return this.post('/customers/register', data);
  }

  async customerLogin(credentials) {
    return this.post('/customers/login', credentials);
  }

  async getCustomerProfile() {
    return this.get('/customers/me');
  }

  async updateCustomerProfile(data) {
    return this.patch('/customers/me', data);
  }

  async getCustomerOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/customers/me/orders${qs ? '?' + qs : ''}`);
  }

  async getCustomerOrderById(id) {
    return this.get(`/customers/me/orders/${id}`);
  }

  // Customers (admin)
  async getCustomers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/customers${qs ? '?' + qs : ''}`);
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
  async getCoupons(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/coupons${qs ? '?' + qs : ''}`);
  }

  async getCoupon(id) {
    return this.get(`/coupons/${id}`);
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

  async validateCoupon(code, order_amount, customer_id) {
    return this.post('/coupons/validate', { code, order_amount, customer_id });
  }

  // Messages
  async getMessages(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/messages${qs ? '?' + qs : ''}`);
  }

  async getMessage(id) {
    return this.get(`/messages/${id}`);
  }

  async createMessage(messageData) {
    return this.post('/messages', messageData);
  }

  async updateMessageStatus(id, status) {
    return this.patch(`/messages/${id}/status`, { status });
  }

  async replyMessage(id, reply_message) {
    return this.post(`/messages/${id}/reply`, { reply_message });
  }

  async deleteMessage(id) {
    return this.delete(`/messages/${id}`);
  }

  // Dashboard & Reports (admin)
  async getDashboardStats() {
    return this.get('/admin/dashboard/stats');
  }

  async getReports(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/admin/reports${qs ? '?' + qs : ''}`);
  }

  // Website Settings
  async getSettings() {
    return this.get('/admin/settings');
  }

  async getAllSettings() {
    return this.get('/admin/settings/all');
  }

  async getPublicSettings() {
    return this.get('/admin/settings');
  }

  async updateSettings(settingsData) {
    return this.put('/admin/settings', settingsData);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
