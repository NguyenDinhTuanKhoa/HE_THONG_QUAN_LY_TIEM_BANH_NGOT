import React from 'react';
import { generateInvoicePDF, downloadInvoiceHTML } from '../../utils/invoiceGenerator';

const InvoicePrint = ({ order, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintPDF = () => {
    generateInvoicePDF(order);
  };

  const handleDownloadHTML = () => {
    downloadInvoiceHTML(order);
  };

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .invoice-print, .invoice-print * {
        visibility: visible;
      }
      .invoice-print {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .invoice-container {
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 20px !important;
      }
    }
  `;

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const invoiceStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #F8A5C2, #FF85A2)',
    color: '#fff',
    padding: '30px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
  };

  const logoStyle = {
    fontSize: '48px',
    marginBottom: '10px',
  };

  const shopNameStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const shopInfoStyle = {
    fontSize: '14px',
    opacity: 0.9,
  };

  const contentStyle = {
    padding: '30px',
  };

  const invoiceTitleStyle = {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  };

  const sectionStyle = {
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '15px',
    borderBottom: '2px solid #F8A5C2',
    paddingBottom: '5px',
  };

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#6b7280',
    minWidth: '120px',
  };

  const valueStyle = {
    color: '#1f2937',
    textAlign: 'right',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    fontSize: '14px',
  };

  const thStyle = {
    backgroundColor: '#F8A5C2',
    color: '#fff',
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: 'bold',
    border: '1px solid #e5e7eb',
  };

  const tdStyle = {
    padding: '12px 8px',
    border: '1px solid #e5e7eb',
    color: '#374151',
  };

  const totalRowStyle = {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const printButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#10b981',
    color: '#fff',
  };

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: '#fff',
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '30px',
    padding: '20px',
    borderTop: '2px solid #F8A5C2',
    color: '#6b7280',
    fontSize: '12px',
  };

  if (!order) return null;

  return (
    <>
      <style>{printStyles}</style>
      <div style={containerStyle} onClick={onClose}>
        <div className="invoice-print" style={invoiceStyle} onClick={(e) => e.stopPropagation()}>
          <div className="invoice-container">
            {/* Header */}
            <div style={headerStyle}>
              <div style={logoStyle}>🧁</div>
              <div style={shopNameStyle}>TIỆM BÁNH NGỌT</div>
              <div style={shopInfoStyle}>
                📍 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM<br/>
                📞 (028) 1234-5678 | 📧 info@tiembanh.com
              </div>
            </div>

            {/* Content */}
            <div style={contentStyle}>
              <div style={invoiceTitleStyle}>HÓA ĐƠN BÁN HÀNG</div>

              {/* Order Info */}
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Thông tin đơn hàng</div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Mã đơn hàng:</span>
                  <span style={valueStyle}>#{order.id}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Ngày tạo:</span>
                  <span style={valueStyle}>{formatDateTime(order.created_at)}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Trạng thái:</span>
                  <span style={valueStyle}>
                    {order.status === 'completed' ? 'Hoàn thành' :
                     order.status === 'processing' ? 'Đang xử lý' :
                     order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Thông tin khách hàng</div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Tên khách hàng:</span>
                  <span style={valueStyle}>{order.customer_name}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Số điện thoại:</span>
                  <span style={valueStyle}>{order.customer_phone}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Email:</span>
                  <span style={valueStyle}>{order.customer_email}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Địa chỉ:</span>
                  <span style={valueStyle}>{order.customer_address}</span>
                </div>
              </div>

              {/* Items */}
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Chi tiết sản phẩm</div>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>STT</th>
                      <th style={thStyle}>Tên sản phẩm</th>
                      <th style={thStyle}>Số lượng</th>
                      <th style={thStyle}>Đơn giá</th>
                      <th style={thStyle}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={{...tdStyle, textAlign: 'center'}}>{item.quantity}</td>
                        <td style={{...tdStyle, textAlign: 'right'}}>{formatCurrency(item.price)}</td>
                        <td style={{...tdStyle, textAlign: 'right'}}>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                    <tr style={totalRowStyle}>
                      <td colSpan="4" style={{...tdStyle, textAlign: 'right', fontWeight: 'bold'}}>
                        TỔNG CỘNG:
                      </td>
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: 'bold', color: '#F8A5C2'}}>
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {order.notes && (
                <div style={sectionStyle}>
                  <div style={sectionTitleStyle}>Ghi chú</div>
                  <div style={{fontSize: '14px', color: '#374151'}}>{order.notes}</div>
                </div>
              )}

              {/* Footer */}
              <div style={footerStyle}>
                <div style={{marginBottom: '10px'}}>
                  <strong>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ!</strong>
                </div>
                <div>
                  Hóa đơn được in tự động từ hệ thống quản lý tiệm bánh ngọt
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="no-print" style={buttonContainerStyle}>
            <button
              style={printButtonStyle}
              onClick={handlePrint}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              🖨️ In hóa đơn
            </button>
            <button
              style={{...printButtonStyle, backgroundColor: '#3b82f6'}}
              onClick={handlePrintPDF}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              📄 Xuất PDF
            </button>
            <button
              style={{...printButtonStyle, backgroundColor: '#f59e0b'}}
              onClick={handleDownloadHTML}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
            >
              💾 Tải HTML
            </button>
            <button
              style={closeButtonStyle}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrint;
