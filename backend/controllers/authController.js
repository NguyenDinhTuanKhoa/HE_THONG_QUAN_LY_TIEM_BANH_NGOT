const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Account = require('../models/accountModel');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra xem đầu vào là email hay username
    let account;
    if (username.includes('@')) {
      account = await Account.findByEmail(username);
    } else {
      account = await Account.findByUsername(username);
    }

    if (!account) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ message: `Tài khoản đã bị ${account.status}.` });
    }

    const token = jwt.sign(
      { 
        id: account.id, 
        username: account.username,
        email: account.email,
        role: account.role
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ 
      message: 'Đăng nhập thành công!', 
      user: { 
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};