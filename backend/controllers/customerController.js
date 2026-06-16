// controllers/customerController.js
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');

// Tạo JWT cho khách hàng
const signToken = (customer) =>
  jwt.sign(
    { id: customer.id, email: customer.email, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

// Chuẩn hoá dữ liệu khách hàng trả về cho frontend (camelCase, không kèm mật khẩu)
const toPublic = (customer) => ({
  id: customer.id,
  email: customer.email,
  fullName: customer.full_name,
  phone: customer.phone,
  address: customer.address || '',
});

// POST /api/customers/register
exports.register = async (req, res) => {
  const { email, password, fullName, phone } = req.body;

  // Validate cơ bản
  if (!email || !password || !fullName || !phone) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }

  try {
    // Email đã tồn tại chưa?
    if (await Customer.emailExists(email)) {
      return res.status(409).json({ message: 'Email này đã được đăng ký! Vui lòng sử dụng email khác.' });
    }

    // Lưu vào MySQL (mật khẩu được hash bằng bcrypt trong model)
    const customer = await Customer.create({
      email,
      password,
      full_name: fullName,
      phone,
      address: null,
      date_of_birth: null,
      gender: null,
      avatar: null,
      status: 'active',
    });

    const token = signToken(customer);
    return res.status(201).json({
      message: 'Đăng ký thành công!',
      customer: toPublic(customer),
      token,
    });
  } catch (err) {
    console.error('Customer register error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại!' });
  }
};

// POST /api/customers/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
  }

  try {
    const customer = await Customer.findByEmail(email);
    if (!customer) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    const isMatch = await Customer.verifyPassword(customer, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    if (customer.status && customer.status !== 'active') {
      return res.status(403).json({ message: 'Tài khoản đã bị khoá hoặc chưa kích hoạt.' });
    }

    await Customer.updateLastLogin(customer.id);

    const token = signToken(customer);
    return res.json({
      message: 'Đăng nhập thành công!',
      customer: toPublic(customer),
      token,
    });
  } catch (err) {
    console.error('Customer login error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại!' });
  }
};

// PATCH /api/customers/me  (cập nhật hồ sơ)
exports.updateMe = async (req, res) => {
  try {
    const { fullName, phone, address, date_of_birth, gender } = req.body;
    const id = req.customer.id;

    const updateFields = [];
    const updateValues = [];

    if (fullName !== undefined) { updateFields.push('full_name = ?');   updateValues.push(fullName); }
    if (phone   !== undefined) { updateFields.push('phone = ?');        updateValues.push(phone); }
    if (address !== undefined) { updateFields.push('address = ?');      updateValues.push(address); }
    if (date_of_birth !== undefined) { updateFields.push('date_of_birth = ?'); updateValues.push(date_of_birth); }
    if (gender  !== undefined) { updateFields.push('gender = ?');       updateValues.push(gender); }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
    }

    updateValues.push(id);
    await require('../config/db').execute(
      `UPDATE customers SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    const customer = await Customer.findById(id);
    return res.json({ message: 'Cập nhật thông tin thành công!', customer: toPublic(customer) });
  } catch (err) {
    console.error('Customer updateMe error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// GET /api/customers/me  (cần token Bearer)
exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }
    return res.json({ customer: toPublic(customer) });
  } catch (err) {
    console.error('Customer getMe error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
