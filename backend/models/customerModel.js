// models/customerModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Customer {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.full_name = data.full_name;
    this.phone = data.phone;
    this.address = data.address;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.avatar = data.avatar;
    this.email_verified = data.email_verified;
    this.phone_verified = data.phone_verified;
    this.status = data.status;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find all customers with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status = 'active',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE status = ?';
    const queryParams = [status];

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT 
        id, email, full_name, phone, address, date_of_birth, gender, 
        avatar, email_verified, phone_verified, status, last_login, 
        created_at, updated_at
      FROM customers
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(query, [...queryParams, limit, offset]);
    return rows.map(row => new Customer(row));
  }

  // Find customer by ID
  static async findById(id) {
    const query = `
      SELECT 
        id, email, full_name, phone, address, date_of_birth, gender, 
        avatar, email_verified, phone_verified, status, last_login, 
        created_at, updated_at
      FROM customers 
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? new Customer(rows[0]) : null;
  }

  // Find customer by email (for authentication)
  static async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0 ? new Customer(rows[0]) : null;
  }

  // Find customer by phone
  static async findByPhone(phone) {
    const query = 'SELECT * FROM customers WHERE phone = ?';
    const [rows] = await db.execute(query, [phone]);
    return rows.length > 0 ? new Customer(rows[0]) : null;
  }

  // Create new customer
  static async create(customerData) {
    // Hash password
    const hashedPassword = await bcrypt.hash(customerData.password, 12);

    const query = `
      INSERT INTO customers (
        email, password, full_name, phone, address, date_of_birth, 
        gender, avatar, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customerData.email,
      hashedPassword,
      customerData.full_name,
      customerData.phone,
      customerData.address,
      customerData.date_of_birth,
      customerData.gender,
      customerData.avatar,
      customerData.status || 'active'
    ];

    const [result] = await db.execute(query, values);
    return this.findById(result.insertId);
  }

  // Update customer
  static async update(id, customerData) {
    const updateFields = [];
    const updateValues = [];

    // Hash password if provided
    if (customerData.password) {
      customerData.password = await bcrypt.hash(customerData.password, 12);
    }

    Object.keys(customerData).forEach(key => {
      if (customerData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(customerData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No data to update');
    }

    updateValues.push(id);

    const query = `UPDATE customers SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return this.findById(id);
  }

  // Delete customer
  static async delete(id) {
    // Check if customer has orders
    const [orders] = await db.execute('SELECT id FROM orders WHERE customer_id = ? LIMIT 1', [id]);
    if (orders.length > 0) {
      throw new Error('Cannot delete customer with orders');
    }

    const query = 'DELETE FROM customers WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Verify password
  static async verifyPassword(customer, password) {
    return await bcrypt.compare(password, customer.password);
  }

  // Update last login
  static async updateLastLogin(id) {
    const query = 'UPDATE customers SET last_login = NOW() WHERE id = ?';
    await db.execute(query, [id]);
  }

  // Verify email
  static async verifyEmail(id) {
    const query = 'UPDATE customers SET email_verified = true WHERE id = ?';
    await db.execute(query, [id]);
    return this.findById(id);
  }

  // Verify phone
  static async verifyPhone(id) {
    const query = 'UPDATE customers SET phone_verified = true WHERE id = ?';
    await db.execute(query, [id]);
    return this.findById(id);
  }

  // Change password
  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = 'UPDATE customers SET password = ?, updated_at = NOW() WHERE id = ?';
    await db.execute(query, [hashedPassword, id]);
    return this.findById(id);
  }

  // Get customers count
  static async getCount(filters = {}) {
    let whereClause = 'WHERE status = ?';
    const queryParams = [filters.status || 'active'];

    if (filters.search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    const query = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
    const [rows] = await db.execute(query, queryParams);
    return rows[0].total;
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM customers WHERE email = ?';
    const params = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  // Check if phone exists
  static async phoneExists(phone, excludeId = null) {
    let query = 'SELECT id FROM customers WHERE phone = ?';
    const params = [phone];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  // Get customer statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_emails,
        COUNT(CASE WHEN phone_verified = true THEN 1 END) as verified_phones,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as new_this_week,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
      FROM customers
    `;

    const [rows] = await db.execute(query);
    return rows[0];
  }

  // Get customer with order statistics
  static async findByIdWithStats(id) {
    const customerQuery = `
      SELECT 
        c.*,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    const [rows] = await db.execute(customerQuery, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = Customer;
