// models/orderModel.js
const db = require('../config/db');

class Order {
  constructor(data) {
    this.id = data.id;
    this.order_number = data.order_number;
    this.customer_id = data.customer_id;
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    this.customer_address = data.customer_address;
    this.subtotal = data.subtotal;
    this.tax_amount = data.tax_amount;
    this.discount_amount = data.discount_amount;
    this.shipping_amount = data.shipping_amount;
    this.total_amount = data.total_amount;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status;
    this.delivery_method = data.delivery_method;
    this.delivery_date = data.delivery_date;
    this.delivery_time = data.delivery_time;
    this.delivery_notes = data.delivery_notes;
    this.status = data.status;
    this.coupon_code = data.coupon_code;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.items = data.items || [];
  }

  // Find all orders with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      customer_id,
      status,
      date_from,
      date_to,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (customer_id) {
      whereClause += ' AND o.customer_id = ?';
      queryParams.push(customer_id);
    }

    if (status) {
      whereClause += ' AND o.status = ?';
      queryParams.push(status);
    }

    if (date_from) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      queryParams.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      queryParams.push(date_to);
    }

    const query = `
      SELECT 
        o.*,
        c.full_name as customer_full_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(query, [...queryParams, limit, offset]);
    return rows.map(row => new Order(row));
  }

  // Find order by ID with items
  static async findById(id) {
    const orderQuery = `
      SELECT 
        o.*,
        c.full_name as customer_full_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `;
    
    const [orderRows] = await db.execute(orderQuery, [id]);
    
    if (orderRows.length === 0) {
      return null;
    }

    const order = new Order(orderRows[0]);

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name,
        p.featured_image as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    const [itemRows] = await db.execute(itemsQuery, [id]);
    order.items = itemRows;

    return order;
  }

  // Find order by order number
  static async findByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = ?';
    const [rows] = await db.execute(query, [orderNumber]);
    return rows.length > 0 ? new Order(rows[0]) : null;
  }

  // Create new order
  static async create(orderData, items) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          order_number, customer_id, customer_name, customer_email, customer_phone,
          customer_address, subtotal, tax_amount, discount_amount, shipping_amount,
          total_amount, payment_method, delivery_method, delivery_date, delivery_time,
          delivery_notes, coupon_code, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const orderValues = [
        orderNumber,
        orderData.customer_id,
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        orderData.customer_address,
        orderData.subtotal,
        orderData.tax_amount || 0,
        orderData.discount_amount || 0,
        orderData.shipping_amount || 0,
        orderData.total_amount,
        orderData.payment_method,
        orderData.delivery_method,
        orderData.delivery_date,
        orderData.delivery_time,
        orderData.delivery_notes,
        orderData.coupon_code,
        orderData.notes,
        orderData.status || 'pending'
      ];

      const [orderResult] = await connection.execute(orderQuery, orderValues);
      const orderId = orderResult.insertId;

      // Create order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (
            order_id, product_id, product_name, product_sku, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(itemQuery, [
          orderId,
          item.product_id,
          item.product_name,
          item.product_sku,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price
        ]);

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return this.findById(orderId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update order
  static async update(id, orderData) {
    const updateFields = [];
    const updateValues = [];

    Object.keys(orderData).forEach(key => {
      if (orderData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(orderData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No data to update');
    }

    updateValues.push(id);

    const query = `UPDATE orders SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return this.findById(id);
  }

  // Update order status
  static async updateStatus(id, status) {
    const query = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
    await db.execute(query, [status, id]);
    return this.findById(id);
  }

  // Delete order
  static async delete(id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete order items first
      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);

      // Delete order
      const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [id]);

      await connection.commit();
      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get orders count
  static async getCount(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (filters.customer_id) {
      whereClause += ' AND customer_id = ?';
      queryParams.push(filters.customer_id);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      queryParams.push(filters.status);
    }

    if (filters.date_from) {
      whereClause += ' AND DATE(created_at) >= ?';
      queryParams.push(filters.date_from);
    }

    if (filters.date_to) {
      whereClause += ' AND DATE(created_at) <= ?';
      queryParams.push(filters.date_to);
    }

    const query = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const [rows] = await db.execute(query, queryParams);
    return rows[0].total;
  }

  // Generate order number
  static async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get today's order count
    const todayStart = `${date.getFullYear()}-${month}-${day} 00:00:00`;
    const todayEnd = `${date.getFullYear()}-${month}-${day} 23:59:59`;
    
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE created_at BETWEEN ? AND ?',
      [todayStart, todayEnd]
    );
    
    const orderCount = (countResult[0].count + 1).toString().padStart(4, '0');
    
    return `ORD${year}${month}${day}${orderCount}`;
  }

  // Get order statistics
  static async getStatistics(dateRange = {}) {
    const { date_from, date_to } = dateRange;
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (date_from) {
      whereClause += ' AND DATE(created_at) >= ?';
      queryParams.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(created_at) <= ?';
      queryParams.push(date_to);
    }

    const query = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders ${whereClause}
    `;

    const [rows] = await db.execute(query, queryParams);
    return rows[0];
  }
}

module.exports = Order;
