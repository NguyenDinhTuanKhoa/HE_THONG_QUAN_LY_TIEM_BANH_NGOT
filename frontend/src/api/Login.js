// api/Login.js — đăng nhập admin/nhân viên qua API thật (bảng accounts)
import apiService from '../services/api';

export const loginUser = async (username, password) => {
  // Gọi API thật: POST /api/auth/login (chấp nhận cả username lẫn email)
  const res = await apiService.login({ username, password });

  // Backend trả về { message, user } và set token vào cookie httpOnly.
  // Trả về shape mà LoginForm đang dùng: { user }
  return {
    success: true,
    user: res.user,
  };
};
