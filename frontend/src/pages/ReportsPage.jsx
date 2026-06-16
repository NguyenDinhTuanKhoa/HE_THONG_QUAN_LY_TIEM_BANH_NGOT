import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState({
    revenue: {
      total: 0,
      growth: 0,
      chart: []
    },
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0
    },
    products: {
      topSelling: [],
      lowStock: [],
      totalSold: 0
    },
    customers: {
      total: 0,
      new: 0,
      returning: 0,
      retention: 0
    }
  });

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  // Hàm xuất Excel
  const exportToExcel = () => {
    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      const overviewData = [
        ['BÁO CÁO TỔNG QUAN', '', '', ''],
        ['Thời gian:', getPeriodLabel(), '', ''],
        ['Ngày xuất:', new Date().toLocaleDateString('vi-VN'), '', ''],
        ['', '', '', ''],
        ['DOANH THU', '', '', ''],
        ['Tổng doanh thu:', formatCurrency(reportData.revenue.total), '', ''],
        ['Tăng trưởng:', formatPercent(reportData.revenue.growth), '', ''],
        ['', '', '', ''],
        ['ĐỚN HÀNG', '', '', ''],
        ['Tổng đơn hàng:', reportData.orders.total, '', ''],
        ['Hoàn thành:', reportData.orders.completed, '', ''],
        ['Đang xử lý:', reportData.orders.pending, '', ''],
        ['Đã hủy:', reportData.orders.cancelled, '', ''],
        ['', '', '', ''],
        ['KHÁCH HÀNG', '', '', ''],
        ['Tổng khách hàng:', reportData.customers.total, '', ''],
        ['Khách hàng mới:', reportData.customers.new, '', ''],
        ['Khách hàng quay lại:', reportData.customers.returning, '', ''],
        ['Tỷ lệ giữ chân:', formatPercent(reportData.customers.retention), '', '']
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // Sheet 2: Sản phẩm bán chạy
      const topProductsData = [
        ['SẢN PHẨM BÁN CHẠY', '', ''],
        ['Tên sản phẩm', 'Số lượng bán', 'Doanh thu'],
        ...reportData.products.topSelling.map(product => [
          product.name,
          product.quantity,
          formatCurrency(product.revenue)
        ])
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Sản phẩm bán chạy');

      // Sheet 3: Biểu đồ doanh thu
      const chartData = [
        ['BIỂU ĐỒ DOANH THU', ''],
        ['Ngày', 'Doanh thu'],
        ...reportData.revenue.chart.map(item => [
          item.date,
          item.revenue
        ])
      ];

      const ws3 = XLSX.utils.aoa_to_sheet(chartData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Biểu đồ doanh thu');

      // Xuất file
      const fileName = `bao-cao-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert('Xuất Excel thành công! File đã được tải về.');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại.');
    }
  };

  // Hàm xuất PDF (sử dụng print to PDF)
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Báo cáo ${getPeriodLabel()}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #F8A5C2;
            margin: 0;
            font-size: 28px;
          }
          .header h2 {
            margin: 10px 0;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h3 {
            background-color: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #F8A5C2;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #F8A5C2;
          }
          .stat-label {
            color: #666;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #F8A5C2;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .pdf-note {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="pdf-note">
          <strong>📄 Hướng dẫn xuất PDF:</strong> Nhấn Ctrl+P (Windows) hoặc Cmd+P (Mac), chọn "Save as PDF" trong phần Destination
        </div>

        <div class="header">
          <h1>🧁 SWEET BAKERY</h1>
          <h2>Báo cáo ${getPeriodLabel()}</h2>
          <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        <div class="section">
          <h3>📊 Tổng quan</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${formatCurrency(reportData.revenue.total)}</div>
              <div class="stat-label">Doanh thu</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.total}</div>
              <div class="stat-label">Đơn hàng</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.total}</div>
              <div class="stat-label">Khách hàng</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.products.totalSold}</div>
              <div class="stat-label">Sản phẩm bán</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📋 Chi tiết đơn hàng</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.completed}</div>
              <div class="stat-label">Hoàn thành</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.pending}</div>
              <div class="stat-label">Đang xử lý</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.cancelled}</div>
              <div class="stat-label">Đã hủy</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>🏆 Sản phẩm bán chạy</h3>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.products.topSelling.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${formatCurrency(product.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>👥 Thống kê khách hàng</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.new}</div>
              <div class="stat-label">Khách hàng mới</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.returning}</div>
              <div class="stat-label">Khách hàng quay lại</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${formatPercent(reportData.customers.retention)}</div>
              <div class="stat-label">Tỷ lệ giữ chân</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi hệ thống Sweet Bakery</p>
          <p>© 2024 Sweet Bakery. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Hàm in báo cáo
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Báo cáo ${getPeriodLabel()}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #F8A5C2;
            margin: 0;
            font-size: 28px;
          }
          .header h2 {
            margin: 10px 0;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h3 {
            background-color: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #F8A5C2;
            margin-bottom: 15px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #F8A5C2;
          }
          .stat-label {
            color: #666;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #F8A5C2;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧁 SWEET BAKERY</h1>
          <h2>Báo cáo ${getPeriodLabel()}</h2>
          <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        <div class="section">
          <h3>📊 Tổng quan</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${formatCurrency(reportData.revenue.total)}</div>
              <div class="stat-label">Doanh thu</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.total}</div>
              <div class="stat-label">Đơn hàng</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.total}</div>
              <div class="stat-label">Khách hàng</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.products.totalSold}</div>
              <div class="stat-label">Sản phẩm bán</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📋 Chi tiết đơn hàng</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.completed}</div>
              <div class="stat-label">Hoàn thành</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.pending}</div>
              <div class="stat-label">Đang xử lý</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.orders.cancelled}</div>
              <div class="stat-label">Đã hủy</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>🏆 Sản phẩm bán chạy</h3>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.products.topSelling.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${formatCurrency(product.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>👥 Thống kê khách hàng</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.new}</div>
              <div class="stat-label">Khách hàng mới</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${reportData.customers.returning}</div>
              <div class="stat-label">Khách hàng quay lại</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${formatPercent(reportData.customers.retention)}</div>
              <div class="stat-label">Tỷ lệ giữ chân</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi hệ thống Sweet Bakery</p>
          <p>© 2024 Sweet Bakery. All rights reserved.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const loadReportData = () => {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const customers = JSON.parse(localStorage.getItem('customerAccounts') || '{}');
    
    // Calculate date range based on selected period
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Filter orders by period
    const periodOrders = orders.filter(order => 
      new Date(order.orderDate) >= startDate
    );

    // Revenue calculations
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
    const previousPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const prevStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      return orderDate >= prevStart && orderDate < startDate;
    });
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Orders statistics
    const totalOrders = periodOrders.length;
    const completedOrders = periodOrders.filter(order => order.status === 'delivered').length;
    const pendingOrders = periodOrders.filter(order => order.status === 'pending').length;
    const cancelledOrders = periodOrders.filter(order => order.status === 'cancelled').length;

    // Product statistics
    const productSales = {};
    periodOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.name]) {
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.price * item.quantity;
        } else {
          productSales[item.name] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
            price: item.price
          };
        }
      });
    });

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Customer statistics
    const totalCustomers = Object.keys(customers).length + 3; // +3 for demo accounts
    const newCustomers = Object.values(customers).filter(customer => {
      // Mock: assume customers joined this period
      return Math.random() > 0.7; // 30% are new
    }).length;

    // Revenue chart data (mock)
    const chartData = [];
    const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < Math.min(daysInPeriod, 30); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayRevenue = Math.random() * 2000000 + 500000; // Mock data
      chartData.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayRevenue
      });
    }

    setReportData({
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
        chart: chartData
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders
      },
      products: {
        topSelling,
        lowStock: [
          { name: 'Bánh kem dâu tây', stock: 5, minStock: 10 },
          { name: 'Cupcake vanilla', stock: 3, minStock: 15 },
          { name: 'Bánh macaron', stock: 8, minStock: 20 }
        ],
        totalSold: Object.values(productSales).reduce((sum, product) => sum + product.quantity, 0)
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        returning: totalCustomers - newCustomers,
        retention: totalCustomers > 0 ? ((totalCustomers - newCustomers) / totalCustomers) * 100 : 0
      }
    });
  };

  // Hàm gửi email báo cáo
  const sendEmailReport = () => {
    const subject = `Báo cáo ${getPeriodLabel()} - Sweet Bakery`;
    const body = `
Kính gửi,

Đính kèm báo cáo ${getPeriodLabel()} của Sweet Bakery:

📊 TỔNG QUAN:
- Doanh thu: ${formatCurrency(reportData.revenue.total)}
- Tăng trưởng: ${formatPercent(reportData.revenue.growth)}
- Tổng đơn hàng: ${reportData.orders.total}
- Khách hàng: ${reportData.customers.total}

📋 CHI TIẾT ĐỚN HÀNG:
- Hoàn thành: ${reportData.orders.completed}
- Đang xử lý: ${reportData.orders.pending}
- Đã hủy: ${reportData.orders.cancelled}

🏆 SẢN PHẨM BÁN CHẠY:
${reportData.products.topSelling.map((product, index) =>
  `${index + 1}. ${product.name}: ${product.quantity} sản phẩm - ${formatCurrency(product.revenue)}`
).join('\n')}

👥 KHÁCH HÀNG:
- Khách hàng mới: ${reportData.customers.new}
- Khách hàng quay lại: ${reportData.customers.returning}
- Tỷ lệ giữ chân: ${formatPercent(reportData.customers.retention)}

Trân trọng,
Sweet Bakery Management System
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getPeriodLabel = () => {
    const labels = {
      week: 'Tuần này',
      month: 'Tháng này',
      quarter: 'Quý này',
      year: 'Năm này'
    };
    return labels[selectedPeriod] || 'Tháng này';
  };

  const mainStyle = {
    marginLeft: isCollapsed ? '80px' : '280px',
    marginTop: '70px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 70px)',
    transition: 'margin-left 0.3s ease',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  };

  const statCardStyle = (color, bgColor) => ({
    backgroundColor: bgColor || '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: `2px solid ${color}20`,
    borderLeft: `4px solid ${color}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  });

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <Sidebar isCollapsed={isCollapsed} />
      
      <main style={mainStyle}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '8px',
            }}>
              📊 Báo Cáo & Thống Kê
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '0',
            }}>
              Phân tích dữ liệu kinh doanh và hiệu suất bán hàng
            </p>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={selectStyle}
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </select>
        </div>

        {/* Period Summary */}
        <div style={{
          ...cardStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            📈 Tổng Quan {getPeriodLabel()}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {formatCurrency(reportData.revenue.total)}
              </div>
              <div style={{ opacity: 0.9 }}>Doanh Thu</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {formatPercent(reportData.revenue.growth)} so với kỳ trước
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {reportData.orders.total}
              </div>
              <div style={{ opacity: 0.9 }}>Đơn Hàng</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {reportData.orders.completed} hoàn thành
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {reportData.products.totalSold}
              </div>
              <div style={{ opacity: 0.9 }}>Sản Phẩm Bán</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                Từ {reportData.products.topSelling.length} loại
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {reportData.customers.new}
              </div>
              <div style={{ opacity: 0.9 }}>Khách Hàng Mới</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {formatPercent(reportData.customers.retention)} retention
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            📈 Biểu Đồ Doanh Thu {getPeriodLabel()}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '4px',
            height: '200px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            overflowX: 'auto',
          }}>
            {reportData.revenue.chart.map((data, index) => {
              const maxRevenue = Math.max(...reportData.revenue.chart.map(d => d.revenue));
              const height = (data.revenue / maxRevenue) * 160;
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '40px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: `${height}px`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '8px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    title={`${data.date}: ${formatCurrency(data.revenue)}`}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'scaleY(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'scaleY(1)';
                    }}
                  />
                  <div style={{
                    fontSize: '10px',
                    color: '#64748b',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                  }}>
                    {data.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* Order Status */}
          <div style={statCardStyle('#3b82f6')}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>
              📋 Trạng Thái Đơn Hàng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Hoàn thành:</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>{reportData.orders.completed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Đang xử lý:</span>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{reportData.orders.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Đã hủy:</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{reportData.orders.cancelled}</span>
              </div>
              <div style={{
                marginTop: '8px',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Tổng cộng:</span>
                <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '18px' }}>
                  {reportData.orders.total}
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div style={statCardStyle('#10b981')}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>
              🏆 Sản Phẩm Bán Chạy
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportData.products.topSelling.slice(0, 3).map((product, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '6px',
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#059669',
                    backgroundColor: '#dcfce7',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}>
                    {product.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div style={statCardStyle('#ef4444')}>
            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>
              ⚠️ Cảnh Báo Tồn Kho
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportData.products.lowStock.map((product, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '6px',
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Tối thiểu: {product.minStock}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#dc2626',
                    backgroundColor: '#fee2e2',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}>
                    {product.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '20px',
          }}>
            📤 Xuất Báo Cáo
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <button style={{
              padding: '16px',
              backgroundColor: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={exportToExcel}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📊 Xuất Excel
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={exportToPDF}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📄 Xuất PDF
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={sendEmailReport}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              📧 Gửi Email
            </button>

            <button style={{
              padding: '16px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={printReport}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              🖨️ In Báo Cáo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
