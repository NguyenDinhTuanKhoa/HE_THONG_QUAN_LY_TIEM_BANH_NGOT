import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FormField, Input, Select } from '../components/ui/FormField';
import Button from '../components/Button';

const AccountManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    status: 'active'
  });

  const mainStyle = {
    marginLeft: isCollapsed ? '80px' : '280px',
    marginTop: '70px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: 'calc(100vh - 70px)',
    transition: 'margin-left 0.3s ease',
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const searchFilterStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flex: 1,
  };

  const buttonStyle = {
    backgroundColor: '#F8A5C2',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10b981',
  };

  const statusBadgeStyle = (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    backgroundColor: 
      status === 'active' ? '#d1fae5' :
      status === 'banned' ? '#fee2e2' : '#fef3c7',
    color:
      status === 'active' ? '#065f46' :
      status === 'banned' ? '#991b1b' : '#92400e',
  });

  // CHỈ 2 VAI TRÒ: ADMIN VÀ STAFF
  const roleOptions = [
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'staff', label: 'Nhân viên' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'banned', label: 'Bị cấm' },
    { value: 'pending', label: 'Chờ duyệt' }
  ];

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
    },
    {
      key: 'username',
      header: 'Tên đăng nhập',
      width: '150px',
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px',
    },
    {
      key: 'role',
      header: 'Vai trò',
      width: '120px',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor:
            value === 'admin' ? '#fef3c7' : '#f3e8ff',
          color:
            value === 'admin' ? '#92400e' : '#7c3aed',
        }}>
          {value === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      render: (value) => <span style={statusBadgeStyle(value)}>{
        value === 'active' ? 'Hoạt động' :
        value === 'banned' ? 'Bị cấm' : 'Chờ duyệt'
      }</span>,
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      width: '150px',
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '150px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              ...buttonStyle,
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
            }}
            onClick={() => handleEdit(row)}
          >
            Sửa
          </button>
          <button
            style={{
              ...dangerButtonStyle,
              padding: '6px 12px',
              fontSize: '12px',
            }}
            onClick={() => handleDelete(row.id)}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  // Mock data
  useEffect(() => {
    // Mock data - CHỈ 2 VAI TRÒ: ADMIN VÀ STAFF
    setAccounts([
      {
        id: 1000,
        username: 'admin',
        email: 'admin@tiembanh.com',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 1001,
        username: 'admin2',
        email: 'admin2@tiembanh.com',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-16T14:20:00Z'
      },
      {
        id: 1002,
        username: 'nhanvien1',
        email: 'nhanvien1@tiembanh.com',
        role: 'staff',
        status: 'active',
        created_at: '2024-01-17T09:15:00Z'
      },
      {
        id: 1003,
        username: 'nhanvien2',
        email: 'nhanvien2@tiembanh.com',
        role: 'staff',
        status: 'active',
        created_at: '2024-01-18T16:45:00Z'
      },
      {
        id: 1004,
        username: 'nhanvien3',
        email: 'nhanvien3@tiembanh.com',
        role: 'staff',
        status: 'pending',
        created_at: '2024-01-19T11:30:00Z'
      }
    ]);
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || account.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      email: account.email,
      password: '',
      role: account.role,
      status: account.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setAccounts(accounts.filter(account => account.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(account => 
        account.id === editingAccount.id 
          ? { ...account, ...formData }
          : account
      ));
    } else {
      // Add new account
      const newAccount = {
        id: Math.max(...accounts.map(a => a.id)) + 1,
        ...formData,
        created_at: new Date().toISOString()
      };
      setAccounts([...accounts, newAccount]);
    }
    
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <Header 
        title="Quản lý Tài khoản" 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />
      
      <main style={mainStyle}>
        <Card 
          title="Danh sách tài khoản"
          headerAction={
            <button style={buttonStyle} onClick={handleAdd}>
              <span>➕</span>
              Thêm tài khoản
            </button>
          }
        >
          <div style={toolbarStyle}>
            <div style={searchFilterStyle}>
              <Input
                placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '300px' }}
              />
              <Select
                options={[
                  { value: '', label: 'Tất cả vai trò' },
                  ...roleOptions
                ]}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ minWidth: '150px' }}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredAccounts}
            striped={true}
            hoverable={true}
          />
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <FormField label="Tên đăng nhập" required>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Nhập địa chỉ email"
                required
              />
            </FormField>

            <FormField label={editingAccount ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} required={!editingAccount}>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Nhập mật khẩu"
                required={!editingAccount}
              />
            </FormField>

            <FormField label="Vai trò" required>
              <Select
                options={roleOptions}
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Chọn vai trò"
                required
              />
            </FormField>

            <FormField label="Trạng thái" required>
              <Select
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                required
              />
            </FormField>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: '#6b7280',
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </button>
              <button type="submit" style={successButtonStyle}>
                {editingAccount ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AccountManagement;
