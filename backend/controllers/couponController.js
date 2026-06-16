const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse, createdResponse, notFoundResponse } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/helpers');

// GET /api/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSort(req.query, ['created_at', 'valid_from', 'valid_until', 'code']);

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (req.query.status) {
      whereClause += ' AND status = ?';
      queryParams.push(req.query.status);
    }
    if (req.query.search) {
      whereClause += ' AND (code LIKE ? OR name LIKE ?)';
      queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM coupons ${whereClause}`, queryParams);
    const total = countResult[0].total;

    const [coupons] = await db.execute(
      `SELECT * FROM coupons ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return paginatedResponse(res, 'Lấy danh sách mã giảm giá thành công', coupons, { page, limit, total });
  } catch (error) {
    console.error('Error getting coupons:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách mã giảm giá', 500);
  }
};

// GET /api/coupons/:id
exports.getCouponById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return notFoundResponse(res, 'Không tìm thấy mã giảm giá');
    return successResponse(res, 'Lấy thông tin mã giảm giá thành công', rows[0]);
  } catch (error) {
    console.error('Error getting coupon:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin mã giảm giá', 500);
  }
};

// POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const {
      code, name, description, type, value,
      minimum_amount, maximum_discount, usage_limit,
      usage_limit_per_customer, valid_from, valid_until,
      applicable_products, applicable_categories, status
    } = req.body;

    if (!code || !name || !type || !value || !valid_from || !valid_until)
      return errorResponse(res, 'Thiếu thông tin bắt buộc', 400);

    const [result] = await db.execute(
      `INSERT INTO coupons (code, name, description, type, value, minimum_amount, maximum_discount,
        usage_limit, usage_limit_per_customer, valid_from, valid_until,
        applicable_products, applicable_categories, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(), name, description, type, value,
        minimum_amount || 0, maximum_discount || null, usage_limit || null,
        usage_limit_per_customer || 1, valid_from, valid_until,
        applicable_products || null, applicable_categories || null, status || 'active'
      ]
    );

    const [newCoupon] = await db.execute('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
    return createdResponse(res, 'Tạo mã giảm giá thành công', newCoupon[0]);
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.code === 'ER_DUP_ENTRY') return errorResponse(res, 'Mã coupon đã tồn tại', 409);
    return errorResponse(res, 'Lỗi khi tạo mã giảm giá', 500);
  }
};

// PUT /api/coupons/:id
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.execute('SELECT id FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) return notFoundResponse(res, 'Không tìm thấy mã giảm giá');

    const allowedFields = [
      'code', 'name', 'description', 'type', 'value', 'minimum_amount',
      'maximum_discount', 'usage_limit', 'usage_limit_per_customer',
      'valid_from', 'valid_until', 'applicable_products', 'applicable_categories', 'status'
    ];
    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'code' ? req.body[key].toUpperCase() : req.body[key]);
      }
    });

    if (updateFields.length === 0) return errorResponse(res, 'Không có dữ liệu để cập nhật', 400);
    updateValues.push(id);

    await db.execute(`UPDATE coupons SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`, updateValues);
    const [updated] = await db.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    return successResponse(res, 'Cập nhật mã giảm giá thành công', updated[0]);
  } catch (error) {
    console.error('Error updating coupon:', error);
    if (error.code === 'ER_DUP_ENTRY') return errorResponse(res, 'Mã coupon đã tồn tại', 409);
    return errorResponse(res, 'Lỗi khi cập nhật mã giảm giá', 500);
  }
};

// DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT id FROM coupons WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return notFoundResponse(res, 'Không tìm thấy mã giảm giá');
    await db.execute('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    return successResponse(res, 'Xóa mã giảm giá thành công');
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return errorResponse(res, 'Lỗi khi xóa mã giảm giá', 500);
  }
};

// POST /api/coupons/validate   { code, order_amount, customer_id }
exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_amount = 0, customer_id } = req.body;
    if (!code) return errorResponse(res, 'Vui lòng nhập mã giảm giá', 400);

    const [rows] = await db.execute(
      `SELECT * FROM coupons WHERE code = ? AND status = 'active'
         AND valid_from <= NOW() AND valid_until >= NOW()`,
      [code.toUpperCase()]
    );
    if (rows.length === 0) return errorResponse(res, 'Mã giảm giá không hợp lệ hoặc đã hết hạn', 400);

    const coupon = rows[0];

    if (coupon.minimum_amount && order_amount < coupon.minimum_amount)
      return errorResponse(res, `Đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('vi-VN')}đ để dùng mã này`, 400);

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
      return errorResponse(res, 'Mã giảm giá đã hết lượt sử dụng', 400);

    // Tính số tiền giảm
    let discount_amount = 0;
    if (coupon.type === 'percentage') {
      discount_amount = (order_amount * coupon.value) / 100;
      if (coupon.maximum_discount) discount_amount = Math.min(discount_amount, coupon.maximum_discount);
    } else {
      discount_amount = Math.min(coupon.value, order_amount);
    }
    discount_amount = Math.round(discount_amount);

    return successResponse(res, 'Mã giảm giá hợp lệ', {
      coupon_id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      discount_amount,
      final_amount: order_amount - discount_amount,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return errorResponse(res, 'Lỗi khi kiểm tra mã giảm giá', 500);
  }
};
