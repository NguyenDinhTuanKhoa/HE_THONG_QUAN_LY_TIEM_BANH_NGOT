// controllers/productController.js
const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse, createdResponse, notFoundResponse } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/helpers');

// Get all products with pagination and filters
exports.getAllProducts = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSort(req.query, ['name', 'price', 'created_at', 'stock_quantity']);
    
    // Build WHERE clause for filters
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    
    if (req.query.category_id) {
      whereClause += ' AND p.category_id = ?';
      queryParams.push(req.query.category_id);
    }
    
    if (req.query.search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    
    if (req.query.status) {
      whereClause += ' AND p.status = ?';
      queryParams.push(req.query.status);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get products with category info
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const [products] = await db.execute(query, [...queryParams, limit, offset]);
    
    return paginatedResponse(res, 'Lấy danh sách sản phẩm thành công', products, {
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách sản phẩm', 500);
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    
    const [products] = await db.execute(query, [id]);
    
    if (products.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy sản phẩm');
    }
    
    return successResponse(res, 'Lấy thông tin sản phẩm thành công', products[0]);
  } catch (error) {
    console.error('Error getting product:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin sản phẩm', 500);
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      short_description,
      sku,
      price,
      sale_price,
      cost_price,
      stock_quantity,
      min_stock_level,
      category_id,
      featured_image,
      gallery,
      ingredients,
      nutritional_info,
      allergen_info,
      preparation_time,
      shelf_life,
      storage_instructions,
      is_featured,
      is_bestseller,
      status
    } = req.body;
    
    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const query = `
      INSERT INTO products (
        name, slug, description, short_description, sku, price, sale_price, cost_price,
        stock_quantity, min_stock_level, category_id, featured_image, gallery,
        ingredients, nutritional_info, allergen_info, preparation_time, shelf_life,
        storage_instructions, is_featured, is_bestseller, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name, productSlug, description, short_description, sku, price, sale_price, cost_price,
      stock_quantity || 0, min_stock_level || 0, category_id, featured_image, gallery,
      ingredients, nutritional_info, allergen_info, preparation_time, shelf_life,
      storage_instructions, is_featured || false, is_bestseller || false, status || 'active'
    ]);
    
    return createdResponse(res, 'Tạo sản phẩm thành công', {
      id: result.insertId,
      name,
      slug: productSlug,
      price,
      stock_quantity: stock_quantity || 0
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'SKU hoặc slug đã tồn tại', 400);
    }
    return errorResponse(res, 'Lỗi khi tạo sản phẩm', 500);
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if product exists
    const [existingProduct] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy sản phẩm');
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return errorResponse(res, 'Không có dữ liệu để cập nhật', 400);
    }
    
    updateValues.push(id);
    
    const query = `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return successResponse(res, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'SKU hoặc slug đã tồn tại', 400);
    }
    return errorResponse(res, 'Lỗi khi cập nhật sản phẩm', 500);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [existingProduct] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy sản phẩm');
    }
    
    // Check if product is used in orders
    const [orderItems] = await db.execute('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    if (orderItems.length > 0) {
      return errorResponse(res, 'Không thể xóa sản phẩm đã có trong đơn hàng', 400);
    }
    
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    
    return successResponse(res, 'Xóa sản phẩm thành công');
  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse(res, 'Lỗi khi xóa sản phẩm', 500);
  }
};

// Update stock quantity
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body; // type: 'in' | 'out' | 'adjustment'
    
    // Check if product exists
    const [product] = await db.execute('SELECT stock_quantity FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy sản phẩm');
    }
    
    const currentStock = product[0].stock_quantity;
    let newStock;
    
    switch (type) {
      case 'in':
        newStock = currentStock + quantity;
        break;
      case 'out':
        newStock = Math.max(0, currentStock - quantity);
        break;
      case 'adjustment':
        newStock = quantity;
        break;
      default:
        return errorResponse(res, 'Loại cập nhật không hợp lệ', 400);
    }
    
    // Update stock
    await db.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, id]);
    
    // Log inventory change
    await db.execute(`
      INSERT INTO inventory_logs (product_id, type, quantity, previous_stock, new_stock, reason, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, type, quantity, currentStock, newStock, reason, req.user.id]);
    
    return successResponse(res, 'Cập nhật tồn kho thành công', {
      previous_stock: currentStock,
      new_stock: newStock,
      change: newStock - currentStock
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return errorResponse(res, 'Lỗi khi cập nhật tồn kho', 500);
  }
};
