import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { FormField, Input, Select } from '../components/ui/FormField';
import InvoicePrint from '../components/invoice/InvoicePrint';

const OrderManagement = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

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

  const statusBadgeStyle = (status) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    backgroundColor: 
      status === 'completed' ? '#d1fae5' :
      status === 'processing' ? '#fef3c7' :
      status === 'pending' ? '#e0f2fe' :
      status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
    color:
      status === 'completed' ? '#065f46' :
      status === 'processing' ? '#92400e' :
      status === 'pending' ? '#0369a1' :
      status === 'cancelled' ? '#991b1b' : '#374151',
  });

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const columns = [
    {
      key: 'id',
      header: 'Mã đơn',
      width: '100px',
      render: (value) => `#${value}`,
    },
    {
      key: 'customer_name',
      header: 'Khách hàng',
      width: '150px',
    },
    {
      key: 'customer_phone',
      header: 'Số điện thoại',
      width: '120px',
    },
    {
      key: 'total_amount',
      header: 'Tổng tiền',
      width: '120px',
      render: (value) => formatCurrency(value),
      align: 'right',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      render: (value) => <span style={statusBadgeStyle(value)}>{getStatusLabel(value)}</span>,
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      width: '150px',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '200px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            style={{
              ...buttonStyle,
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
            }}
            onClick={() => handleViewDetail(row)}
          >
            Chi tiết
          </button>
          <button
            style={{
              ...buttonStyle,
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#f59e0b',
            }}
            onClick={() => handlePrintInvoice(row)}
          >
            🖨️ In
          </button>
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <button
              style={{
                ...buttonStyle,
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#10b981',
              }}
              onClick={() => handleUpdateStatus(row.id, 'completed')}
            >
              Hoàn thành
            </button>
          )}
        </div>
      ),
    },
  ];

  // Mock data
  useEffect(() => {
    setOrders([
      {
        id: 1001,
        customer_name: 'Nguyễn Văn A',
        customer_phone: '0901234567',
        customer_email: 'nguyenvana@email.com',
        customer_address: '123 Đường ABC, Quận 1, TP.HCM',
        total_amount: 450000,
        status: 'pending',
        created_at: '2024-01-20T10:30:00Z',
        items: [
          { id: 1, name: 'Bánh kem dâu tây', quantity: 1, price: 250000 },
          { id: 2, name: 'Cupcake chocolate', quantity: 4, price: 45000 },
        ],
        notes: 'Giao hàng trước 3h chiều'
      },
      {
        id: 1002,
        customer_name: 'Trần Thị B',
        customer_phone: '0912345678',
        customer_email: 'tranthib@email.com',
        customer_address: '456 Đường XYZ, Quận 2, TP.HCM',
        total_amount: 180000,
        status: 'processing',
        created_at: '2024-01-20T14:15:00Z',
        items: [
          { id: 4, name: 'Bánh tiramisu', quantity: 1, price: 180000 },
        ],
        notes: ''
      },
      {
        id: 1003,
        customer_name: 'Lê Văn C',
        customer_phone: '0923456789',
        customer_email: 'levanc@email.com',
        customer_address: '789 Đường DEF, Quận 3, TP.HCM',
        total_amount: 275000,
        status: 'completed',
        created_at: '2024-01-19T16:45:00Z',
        items: [
          { id: 5, name: 'Bánh mì nho khô', quantity: 5, price: 35000 },
          { id: 6, name: 'Éclair kem vanilla', quantity: 2, price: 55000 },
        ],
        notes: 'Khách hàng VIP'
      },
      {
        id: 1004,
        customer_name: 'Phạm Thị D',
        customer_phone: '0934567890',
        customer_email: 'phamthid@email.com',
        customer_address: '321 Đường GHI, Quận 4, TP.HCM',
        total_amount: 120000,
        status: 'cancelled',
        created_at: '2024-01-19T09:20:00Z',
        items: [
          { id: 3, name: 'Bánh quy bơ', quantity: 1, price: 120000 },
        ],
        notes: 'Khách hàng hủy do thay đổi kế hoạch'
      }
    ]);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone.includes(searchTerm) ||
                         order.id.toString().includes(searchTerm);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    
    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const orderDate = new Date(order.created_at);
      if (dateRange.from) {
        matchesDate = matchesDate && orderDate >= new Date(dateRange.from);
      }
      if (dateRange.to) {
        matchesDate = matchesDate && orderDate <= new Date(dateRange.to + 'T23:59:59');
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const handlePrintInvoice = (order) => {
    setInvoiceOrder(order);
    setShowInvoice(true);
  };

  const getTotalRevenue = () => {
    return filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total_amount, 0);
  };

  const orderDetailStyle = {
    display: 'grid',
    gap: '16px',
  };

  const sectionStyle = {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
  };

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };

  const labelStyle = {
    fontWeight: '500',
    color: '#6b7280',
  };

  const valueStyle = {
    color: '#1f2937',
  };

  const itemsTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px',
  };

  const itemsHeaderStyle = {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    border: '1px solid #e5e7eb',
  };

  const itemsCellStyle = {
    padding: '12px',
    border: '1px solid #e5e7eb',
    color: '#374151',
  };

  return (
    <div>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <Header
        title="Quản lý Hóa đơn"
        isCollapsed={isCollapsed}
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      <main style={mainStyle}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                {filteredOrders.length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Tổng đơn hàng</div>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                {filteredOrders.filter(o => o.status === 'completed').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Đã hoàn thành</div>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                {filteredOrders.filter(o => o.status === 'processing').length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang xử lý</div>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#F8A5C2', marginBottom: '8px' }}>
                {formatCurrency(getTotalRevenue())}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Doanh thu</div>
            </div>
          </Card>
        </div>

        <Card title="Danh sách hóa đơn">
          <div style={toolbarStyle}>
            <div style={searchFilterStyle}>
              <Input
                placeholder="Tìm kiếm theo tên, SĐT hoặc mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '300px' }}
              />
              <Select
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  ...statusOptions
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minWidth: '150px' }}
              />
              <Input
                type="date"
                placeholder="Từ ngày"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                style={{ minWidth: '150px' }}
              />
              <Input
                type="date"
                placeholder="Đến ngày"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                style={{ minWidth: '150px' }}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredOrders}
            striped={true}
            hoverable={true}
          />
        </Card>

        {/* Order Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
          size="lg"
        >
          {selectedOrder && (
            <div style={orderDetailStyle}>
              {/* Customer Information */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Thông tin khách hàng</h3>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Tên khách hàng:</span>
                  <span style={valueStyle}>{selectedOrder.customer_name}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Số điện thoại:</span>
                  <span style={valueStyle}>{selectedOrder.customer_phone}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Email:</span>
                  <span style={valueStyle}>{selectedOrder.customer_email}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Địa chỉ:</span>
                  <span style={valueStyle}>{selectedOrder.customer_address}</span>
                </div>
              </div>

              {/* Order Information */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Thông tin đơn hàng</h3>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Mã đơn hàng:</span>
                  <span style={valueStyle}>#{selectedOrder.id}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Ngày tạo:</span>
                  <span style={valueStyle}>{formatDateTime(selectedOrder.created_at)}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Trạng thái:</span>
                  <span style={statusBadgeStyle(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Ghi chú:</span>
                  <span style={valueStyle}>{selectedOrder.notes || 'Không có'}</span>
                </div>
              </div>

              {/* Order Items */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Sản phẩm đặt hàng</h3>
                <table style={itemsTableStyle}>
                  <thead>
                    <tr>
                      <th style={itemsHeaderStyle}>Sản phẩm</th>
                      <th style={itemsHeaderStyle}>Số lượng</th>
                      <th style={itemsHeaderStyle}>Đơn giá</th>
                      <th style={itemsHeaderStyle}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td style={itemsCellStyle}>{item.name}</td>
                        <td style={itemsCellStyle}>{item.quantity}</td>
                        <td style={itemsCellStyle}>{formatCurrency(item.price)}</td>
                        <td style={itemsCellStyle}>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{...itemsCellStyle, fontWeight: 'bold', textAlign: 'right'}}>
                        Tổng cộng:
                      </td>
                      <td style={{...itemsCellStyle, fontWeight: 'bold', color: '#F8A5C2'}}>
                        {formatCurrency(selectedOrder.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', flexWrap: 'wrap' }}>
                <button
                  style={{...buttonStyle, backgroundColor: '#f59e0b'}}
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handlePrintInvoice(selectedOrder);
                  }}
                >
                  🖨️ In hóa đơn
                </button>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <>
                    <button
                      style={{...buttonStyle, backgroundColor: '#10b981'}}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'completed');
                        setIsDetailModalOpen(false);
                      }}
                    >
                      Hoàn thành đơn hàng
                    </button>
                    <button
                      style={{...buttonStyle, backgroundColor: '#ef4444'}}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'cancelled');
                        setIsDetailModalOpen(false);
                      }}
                    >
                      Hủy đơn hàng
                    </button>
                  </>
                )}
                <button
                  style={{...buttonStyle, backgroundColor: '#6b7280'}}
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Invoice Print Component */}
        {showInvoice && (
          <InvoicePrint
            order={invoiceOrder}
            onClose={() => {
              setShowInvoice(false);
              setInvoiceOrder(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default OrderManagement;
