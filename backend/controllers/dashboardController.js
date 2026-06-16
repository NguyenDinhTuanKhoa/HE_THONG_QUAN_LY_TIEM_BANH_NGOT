const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const [orderStats] = await db.execute(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders,
        COALESCE(SUM(CASE WHEN status = 'delivering' THEN 1 ELSE 0 END), 0) as delivering_orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered_orders,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as revenue_today,
        COALESCE(SUM(CASE WHEN YEARWEEK(created_at,1) = YEARWEEK(NOW(),1) THEN total_amount ELSE 0 END), 0) as revenue_this_week,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN total_amount ELSE 0 END), 0) as revenue_this_month
      FROM orders
    `);

    const [productStats] = await db.execute(`
      SELECT
        COUNT(*) as total_products,
        SUM(status = 'active') as active_products,
        SUM(stock_quantity = 0) as out_of_stock
      FROM products
    `);

    const [customerStats] = await db.execute(`
      SELECT COUNT(*) as total_customers,
        SUM(DATE(created_at) = CURDATE()) as new_today
      FROM customers
    `);

    const [messageStats] = await db.execute(`
      SELECT COUNT(*) as total_messages, SUM(status = 'new') as unread_messages FROM messages
    `);

    // Doanh thu 6 tháng gần nhất
    const [revenueChart] = await db.execute(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status NOT IN ('cancelled')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Top 5 sản phẩm bán chạy
    const [topProducts] = await db.execute(`
      SELECT p.id, p.name, p.featured_image, p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelled')
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // 10 đơn hàng gần nhất
    const [recentOrders] = await db.execute(`
      SELECT o.id, o.order_number, o.customer_name, o.total_amount, o.status, o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    return successResponse(res, 'Lấy thống kê thành công', {
      orders: orderStats[0],
      products: productStats[0],
      customers: customerStats[0],
      messages: messageStats[0],
      revenue_chart: revenueChart,
      top_products: topProducts,
      recent_orders: recentOrders,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return errorResponse(res, 'Lỗi khi lấy thống kê', 500);
  }
};

// GET /api/dashboard/reports?period=monthly&year=2026&month=6
exports.getReports = async (req, res) => {
  try {
    const { period = 'monthly', year, month, date_from, date_to } = req.query;

    let whereClause = "WHERE status NOT IN ('cancelled')";
    const queryParams = [];

    if (date_from) { whereClause += ' AND DATE(o.created_at) >= ?'; queryParams.push(date_from); }
    if (date_to)   { whereClause += ' AND DATE(o.created_at) <= ?'; queryParams.push(date_to); }
    if (year)      { whereClause += ' AND YEAR(o.created_at) = ?';  queryParams.push(year); }
    if (month && period === 'daily') { whereClause += ' AND MONTH(o.created_at) = ?'; queryParams.push(month); }

    let groupBy, dateFormat;
    if (period === 'daily') {
      groupBy = "DATE(o.created_at)";
      dateFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupBy = "YEARWEEK(o.created_at, 1)";
      dateFormat = '%Y week %u';
    } else {
      groupBy = "DATE_FORMAT(o.created_at, '%Y-%m')";
      dateFormat = '%Y-%m';
    }

    const [revenueData] = await db.execute(`
      SELECT
        DATE_FORMAT(o.created_at, '${dateFormat}') as period,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(o.discount_amount), 0) as total_discount,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value
      FROM orders o
      ${whereClause}
      GROUP BY ${groupBy}
      ORDER BY MIN(o.created_at) ASC
    `, queryParams);

    const [categoryRevenue] = await db.execute(`
      SELECT c.name as category_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `, queryParams);

    const [topProducts] = await db.execute(`
      SELECT p.name, p.sku, SUM(oi.quantity) as total_quantity, SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `, queryParams);

    const [summary] = await db.execute(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM orders o ${whereClause}
    `, queryParams);

    return successResponse(res, 'Lấy báo cáo thành công', {
      summary: summary[0],
      revenue_data: revenueData,
      category_revenue: categoryRevenue,
      top_products: topProducts,
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    return errorResponse(res, 'Lỗi khi lấy báo cáo', 500);
  }
};
