const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse, createdResponse, notFoundResponse } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/helpers');

// GET /api/messages  (admin)
exports.getAllMessages = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSort(req.query, ['created_at', 'status', 'customer_name']);

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (req.query.status) {
      whereClause += ' AND status = ?';
      queryParams.push(req.query.status);
    }
    if (req.query.type) {
      whereClause += ' AND type = ?';
      queryParams.push(req.query.type);
    }
    if (req.query.search) {
      whereClause += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ?)';
      queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`);
    }

    const [countResult] = await db.execute(`SELECT COUNT(*) as total FROM messages ${whereClause}`, queryParams);
    const total = countResult[0].total;

    const [messages] = await db.execute(
      `SELECT m.*, a.full_name as replied_by_name
       FROM messages m
       LEFT JOIN accounts a ON m.replied_by = a.id
       ${whereClause}
       ORDER BY m.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Thống kê nhanh
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'new') as new_count,
        SUM(status = 'read') as read_count,
        SUM(status = 'replied') as replied_count,
        SUM(status = 'closed') as closed_count
      FROM messages
    `);

    return paginatedResponse(res, 'Lấy danh sách tin nhắn thành công', messages, {
      page, limit, total, stats: stats[0]
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách tin nhắn', 500);
  }
};

// GET /api/messages/:id
exports.getMessageById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*, a.full_name as replied_by_name
       FROM messages m LEFT JOIN accounts a ON m.replied_by = a.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return notFoundResponse(res, 'Không tìm thấy tin nhắn');
    // Đánh dấu đã đọc nếu là 'new'
    if (rows[0].status === 'new')
      await db.execute("UPDATE messages SET status = 'read', updated_at = NOW() WHERE id = ?", [req.params.id]);
    return successResponse(res, 'Lấy thông tin tin nhắn thành công', { ...rows[0], status: rows[0].status === 'new' ? 'read' : rows[0].status });
  } catch (error) {
    console.error('Error getting message:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin tin nhắn', 500);
  }
};

// POST /api/messages  (public — từ form liên hệ)
exports.createMessage = async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, subject, message, type, order_id, customer_id } = req.body;
    if (!customer_name || !customer_email || !subject || !message)
      return errorResponse(res, 'Thiếu thông tin bắt buộc', 400);

    const [result] = await db.execute(
      `INSERT INTO messages (customer_id, customer_name, customer_email, customer_phone, subject, message, type, order_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id || null, customer_name, customer_email, customer_phone || null, subject, message, type || 'contact', order_id || null]
    );

    return createdResponse(res, 'Gửi tin nhắn thành công. Chúng tôi sẽ phản hồi sớm nhất!', { id: result.insertId });
  } catch (error) {
    console.error('Error creating message:', error);
    return errorResponse(res, 'Lỗi khi gửi tin nhắn', 500);
  }
};

// PATCH /api/messages/:id/status  (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(status)) return errorResponse(res, 'Trạng thái không hợp lệ', 400);

    const [existing] = await db.execute('SELECT id FROM messages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return notFoundResponse(res, 'Không tìm thấy tin nhắn');

    await db.execute('UPDATE messages SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    return successResponse(res, 'Cập nhật trạng thái thành công');
  } catch (error) {
    console.error('Error updating message status:', error);
    return errorResponse(res, 'Lỗi khi cập nhật trạng thái', 500);
  }
};

// POST /api/messages/:id/reply  (admin)
exports.replyMessage = async (req, res) => {
  try {
    const { reply_message } = req.body;
    if (!reply_message) return errorResponse(res, 'Vui lòng nhập nội dung phản hồi', 400);

    const [existing] = await db.execute('SELECT id FROM messages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return notFoundResponse(res, 'Không tìm thấy tin nhắn');

    await db.execute(
      `UPDATE messages SET status = 'replied', reply_message = ?, replied_by = ?, replied_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [reply_message, req.user?.id || null, req.params.id]
    );
    return successResponse(res, 'Phản hồi tin nhắn thành công');
  } catch (error) {
    console.error('Error replying message:', error);
    return errorResponse(res, 'Lỗi khi phản hồi tin nhắn', 500);
  }
};

// DELETE /api/messages/:id  (admin)
exports.deleteMessage = async (req, res) => {
  try {
    const [existing] = await db.execute('SELECT id FROM messages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return notFoundResponse(res, 'Không tìm thấy tin nhắn');
    await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
    return successResponse(res, 'Xóa tin nhắn thành công');
  } catch (error) {
    console.error('Error deleting message:', error);
    return errorResponse(res, 'Lỗi khi xóa tin nhắn', 500);
  }
};
