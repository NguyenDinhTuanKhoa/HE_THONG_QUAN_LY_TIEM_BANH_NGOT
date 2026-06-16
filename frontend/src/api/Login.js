export const loginUser = async (username, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock user data - CHỈ 2 VAI TRÒ: ADMIN VÀ STAFF
  const users = {
    // QUẢN TRỊ VIÊN
    'admin': {
      id: 1,
      username: 'admin',
      email: 'admin@tiembanh.com',
      role: 'admin',
      name: 'Quản trị viên chính'
    },
    'admin2': {
      id: 2,
      username: 'admin2',
      email: 'admin2@tiembanh.com',
      role: 'admin',
      name: 'Quản trị viên phụ'
    },

    // NHÂN VIÊN
    'nhanvien1': {
      id: 3,
      username: 'nhanvien1',
      email: 'nhanvien1@tiembanh.com',
      role: 'staff',
      name: 'Nguyễn Văn Nhân Viên'
    },
    'nhanvien2': {
      id: 4,
      username: 'nhanvien2',
      email: 'nhanvien2@tiembanh.com',
      role: 'staff',
      name: 'Trần Thị Nhân Viên'
    },
    'nhanvien3': {
      id: 5,
      username: 'nhanvien3',
      email: 'nhanvien3@tiembanh.com',
      role: 'staff',
      name: 'Lê Văn Nhân Viên'
    }
  };

  // Mock passwords
  const passwords = {
    'admin': 'admin123',
    'admin2': 'admin123',
    'nhanvien1': 'nhanvien123',
    'nhanvien2': 'nhanvien123',
    'nhanvien3': 'nhanvien123'
  };

  // Check credentials
  if (users[username] && passwords[username] === password) {
    return {
      success: true,
      user: users[username],
      token: 'mock-jwt-token-' + Date.now()
    };
  } else {
    throw new Error('Tài khoản hoặc mật khẩu không đúng');
  }
};
