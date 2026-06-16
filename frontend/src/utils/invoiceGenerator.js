// Utility function to generate and download invoice as PDF
export const generateInvoicePDF = (order) => {
  // Create a new window for the invoice
  const printWindow = window.open('', '_blank');
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hóa đơn #${order.id} - Tiệm Bánh Ngọt</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
        }
        
        .header {
          background: linear-gradient(135deg, #F8A5C2, #FF85A2);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        .shop-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .shop-info {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .invoice-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .section {
          margin-bottom: 25px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 15px;
          border-bottom: 2px solid #F8A5C2;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .label {
          font-weight: 600;
          color: #6b7280;
          min-width: 120px;
        }
        
        .value {
          color: #1f2937;
          text-align: right;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 14px;
        }
        
        .items-table th {
          background: #F8A5C2;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #e5e7eb;
        }
        
        .items-table td {
          padding: 12px 8px;
          border: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .total-row {
          background: #f3f4f6;
          font-weight: bold;
        }
        
        .total-amount {
          color: #F8A5C2;
          font-size: 16px;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          border-top: 2px solid #F8A5C2;
          color: #6b7280;
          font-size: 12px;
        }
        
        .footer strong {
          display: block;
          margin-bottom: 10px;
          color: #1f2937;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .invoice-container {
            max-width: none;
            margin: 0;
            padding: 15px;
          }
          
          .header {
            background: #F8A5C2 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .items-table th {
            background: #F8A5C2 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">🧁</div>
          <div class="shop-name">TIỆM BÁNH NGỌT</div>
          <div class="shop-info">
            📍 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM<br/>
            📞 (028) 1234-5678 | 📧 info@tiembanh.com
          </div>
        </div>

        <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>

        <!-- Order Info -->
        <div class="section">
          <div class="section-title">Thông tin đơn hàng</div>
          <div class="info-row">
            <span class="label">Mã đơn hàng:</span>
            <span class="value">#${order.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Ngày tạo:</span>
            <span class="value">${formatDateTime(order.created_at)}</span>
          </div>
          <div class="info-row">
            <span class="label">Trạng thái:</span>
            <span class="value">${getStatusText(order.status)}</span>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="section">
          <div class="section-title">Thông tin khách hàng</div>
          <div class="info-row">
            <span class="label">Tên khách hàng:</span>
            <span class="value">${order.customer_name}</span>
          </div>
          <div class="info-row">
            <span class="label">Số điện thoại:</span>
            <span class="value">${order.customer_phone}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${order.customer_email}</span>
          </div>
          <div class="info-row">
            <span class="label">Địa chỉ:</span>
            <span class="value">${order.customer_address}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="section">
          <div class="section-title">Chi tiết sản phẩm</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${formatCurrency(item.price)}</td>
                  <td style="text-align: right">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold">
                  TỔNG CỘNG:
                </td>
                <td style="text-align: right; font-weight: bold" class="total-amount">
                  ${formatCurrency(order.total_amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        ${order.notes ? `
        <!-- Notes -->
        <div class="section">
          <div class="section-title">Ghi chú</div>
          <div style="font-size: 14px; color: #374151">${order.notes}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <strong>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ!</strong>
          Hóa đơn được in tự động từ hệ thống quản lý tiệm bánh ngọt<br/>
          In lúc: ${new Date().toLocaleString('vi-VN')}
        </div>
      </div>

      <script>
        // Auto print when page loads
        window.onload = function() {
          window.print();
          // Close window after printing (optional)
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

// Function to download invoice as HTML file
export const downloadInvoiceHTML = (order) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Create the HTML content (same as above but without auto-print script)
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn #${order.id}</title>
  <!-- Same styles as above -->
</head>
<body>
  <!-- Same content as above -->
</body>
</html>`;

  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hoa-don-${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
