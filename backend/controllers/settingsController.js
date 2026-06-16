const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Chuyển mảng rows [{setting_key, setting_value, setting_type}] thành object phẳng
const rowsToObject = (rows) => {
  const result = {};
  rows.forEach(row => {
    let val = row.setting_value;
    if (row.setting_type === 'number') val = Number(val);
    else if (row.setting_type === 'boolean') val = val === 'true' || val === '1';
    else if (row.setting_type === 'json') { try { val = JSON.parse(val); } catch { /* keep as string */ } }
    result[row.setting_key] = val;
  });
  return result;
};

// GET /api/settings  — public (chỉ các setting is_public=1)
exports.getPublicSettings = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT setting_key, setting_value, setting_type FROM website_settings WHERE is_public = 1');
    return successResponse(res, 'Lấy cài đặt thành công', rowsToObject(rows));
  } catch (error) {
    console.error('Error getting public settings:', error);
    return errorResponse(res, 'Lỗi khi lấy cài đặt', 500);
  }
};

// GET /api/settings/all  — admin
exports.getAllSettings = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM website_settings ORDER BY setting_key');
    return successResponse(res, 'Lấy tất cả cài đặt thành công', rowsToObject(rows));
  } catch (error) {
    console.error('Error getting all settings:', error);
    return errorResponse(res, 'Lỗi khi lấy cài đặt', 500);
  }
};

// PUT /api/settings  — admin, body: { key: value, ... }
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0)
      return errorResponse(res, 'Không có dữ liệu để cập nhật', 400);

    for (const [key, value] of Object.entries(updates)) {
      const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      // Upsert: nếu key tồn tại thì update, không thì insert
      await db.execute(
        `INSERT INTO website_settings (setting_key, setting_value, is_public)
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
        [key, strValue]
      );
    }

    const [rows] = await db.execute('SELECT setting_key, setting_value, setting_type FROM website_settings');
    return successResponse(res, 'Cập nhật cài đặt thành công', rowsToObject(rows));
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse(res, 'Lỗi khi cập nhật cài đặt', 500);
  }
};
