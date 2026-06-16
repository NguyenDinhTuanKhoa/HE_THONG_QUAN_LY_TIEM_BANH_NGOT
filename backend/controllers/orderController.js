// controllers/orderController.js
const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse, createdResponse, notFoundResponse } = require('../utils/response');
const { parsePagination, parseSort, generateRandomString } = require('../utils/helpers');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
};

// Get all orders (Admin/Staff)
exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSort(req.query, ['created_at', 'total_amount', 'status']);
    
    // Build WHERE clause for filters
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    
    if (req.query.status) {
      whereClause += ' AND o.status = ?';
      queryParams.push(req.query.status);
    }
    
    if (req.query.customer_id) {
      whereClause += ' AND o.customer_id = ?';
      queryParams.push(req.query.customer_id);
    }
    
    if (req.query.date_from) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      queryParams.push(req.query.date_from);
    }
    
    if (req.query.date_to) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      queryParams.push(req.query.date_to);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get orders
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
    
    const [orders] = await db.execute(query, [...queryParams, limit, offset]);
    
    return paginatedResponse(res, 'Lấy danh sách đơn hàng thành công', orders, {
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', 500);
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order info
    const orderQuery = `
      SELECT 
        o.*,
        c.full_name as customer_full_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `;
    
    const [orders] = await db.execute(orderQuery, [id]);
    
    if (orders.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy đơn hàng');
    }
    
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
    
    const [items] = await db.execute(itemsQuery, [id]);
    
    const order = {
      ...orders[0],
      items
    };
    
    return successResponse(res, 'Lấy thông tin đơn hàng thành công', order);
  } catch (error) {
    console.error('Error getting order:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin đơn hàng', 500);
  }
};

// Create new order (Customer)
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      subtotal,
      tax_amount,
      discount_amount,
      shipping_amount,
      total_amount,
      payment_method,
      delivery_method,
      delivery_date,
      delivery_time,
      delivery_notes,
      coupon_code,
      notes,
      items
    } = req.body;
    
    // Generate order number
    const order_number = generateOrderNumber();
    
    // Create order
    const orderQuery = `
      INSERT INTO orders (
        order_number, customer_id, customer_name, customer_email, customer_phone,
        customer_address, subtotal, tax_amount, discount_amount, shipping_amount,
        total_amount, payment_method, delivery_method, delivery_date, delivery_time,
        delivery_notes, coupon_code, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [orderResult] = await connection.execute(orderQuery, [
      order_number,
      req.customer?.id || null,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      subtotal,
      tax_amount || 0,
      discount_amount || 0,
      shipping_amount || 0,
      total_amount,
      payment_method,
      delivery_method,
      delivery_date,
      delivery_time,
      delivery_notes,
      coupon_code,
      notes
    ]);
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (const item of items) {
      // Get product info
      const [product] = await connection.execute(
        'SELECT name, sku, price FROM products WHERE id = ?',
        [item.product_id]
      );
      
      if (product.length === 0) {
        throw new Error(`Sản phẩm với ID ${item.product_id} không tồn tại`);
      }
      
      const itemQuery = `
        INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(itemQuery, [
        orderId,
        item.product_id,
        product[0].name,
        product[0].sku,
        item.quantity,
        item.unit_price,
        item.quantity * item.unit_price
      ]);
      
      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    await connection.commit();
    
    return createdResponse(res, 'Tạo đơn hàng thành công', {
      id: orderId,
      order_number,
      total_amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    return errorResponse(res, error.message || 'Lỗi khi tạo đơn hàng', 500);
  } finally {
    connection.release();
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if order exists
    const [existingOrder] = await db.execute('SELECT id, status FROM orders WHERE id = ?', [id]);
    if (existingOrder.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy đơn hàng');
    }
    
    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Trạng thái không hợp lệ', 400);
    }
    
    await db.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    
    return successResponse(res, 'Cập nhật trạng thái đơn hàng thành công', {
      id,
      old_status: existingOrder[0].status,
      new_status: status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 'Lỗi khi cập nhật trạng thái đơn hàng', 500);
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const customerId = req.customer.id;
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE customer_id = ?';
    const [countResult] = await db.execute(countQuery, [customerId]);
    const total = countResult[0].total;
    
    // Get orders
    const query = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [orders] = await db.execute(query, [customerId, limit, offset]);
    
    return paginatedResponse(res, 'Lấy danh sách đơn hàng thành công', orders, {
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error getting customer orders:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', 500);
  }
};

// Get customer order by ID
exports.getCustomerOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.id;
    
    // Get order info
    const orderQuery = `
      SELECT o.*
      FROM orders o
      WHERE o.id = ? AND o.customer_id = ?
    `;
    
    const [orders] = await db.execute(orderQuery, [id, customerId]);
    
    if (orders.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy đơn hàng');
    }
    
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
    
    const [items] = await db.execute(itemsQuery, [id]);
    
    const order = {
      ...orders[0],
      items
    };
    
    return successResponse(res, 'Lấy thông tin đơn hàng thành công', order);
  } catch (error) {
    console.error('Error getting customer order:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin đơn hàng', 500);
  }
};

// Delete order (Admin only)
exports.deleteOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Check if order exists
    const [existingOrder] = await connection.execute('SELECT id, status FROM orders WHERE id = ?', [id]);
    if (existingOrder.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy đơn hàng');
    }
    
    // Only allow deletion of cancelled orders
    if (existingOrder[0].status !== 'cancelled') {
      return errorResponse(res, 'Chỉ có thể xóa đơn hàng đã hủy', 400);
    }
    
    // Delete order items first
    await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
    
    // Delete order
    await connection.execute('DELETE FROM orders WHERE id = ?', [id]);
    
    await connection.commit();
    
    return successResponse(res, 'Xóa đơn hàng thành công');
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting order:', error);
    return errorResponse(res, 'Lỗi khi xóa đơn hàng', 500);
  } finally {
    connection.release();
  }
};
