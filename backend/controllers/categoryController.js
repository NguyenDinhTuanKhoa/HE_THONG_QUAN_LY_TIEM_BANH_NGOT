// controllers/categoryController.js
const db = require('../config/db');
const { successResponse, errorResponse, createdResponse, notFoundResponse } = require('../utils/response');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const [categories] = await db.execute(query);
    
    return successResponse(res, 'Lấy danh sách danh mục thành công', categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách danh mục', 500);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    const [categories] = await db.execute(query, [id]);
    
    if (categories.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy danh mục');
    }
    
    return successResponse(res, 'Lấy thông tin danh mục thành công', categories[0]);
  } catch (error) {
    console.error('Error getting category:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin danh mục', 500);
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parent_id,
      sort_order,
      is_featured,
      status
    } = req.body;
    
    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const query = `
      INSERT INTO categories (
        name, slug, description, image, parent_id, sort_order, is_featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name,
      categorySlug,
      description,
      image,
      parent_id,
      sort_order || 0,
      is_featured || false,
      status || 'active'
    ]);
    
    return createdResponse(res, 'Tạo danh mục thành công', {
      id: result.insertId,
      name,
      slug: categorySlug
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'Slug danh mục đã tồn tại', 400);
    }
    return errorResponse(res, 'Lỗi khi tạo danh mục', 500);
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if category exists
    const [existingCategory] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy danh mục');
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
    
    const query = `UPDATE categories SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return successResponse(res, 'Cập nhật danh mục thành công');
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'Slug danh mục đã tồn tại', 400);
    }
    return errorResponse(res, 'Lỗi khi cập nhật danh mục', 500);
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const [existingCategory] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return notFoundResponse(res, 'Không tìm thấy danh mục');
    }
    
    // Check if category has products
    const [products] = await db.execute('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return errorResponse(res, 'Không thể xóa danh mục đã có sản phẩm', 400);
    }
    
    // Check if category has subcategories
    const [subcategories] = await db.execute('SELECT id FROM categories WHERE parent_id = ? LIMIT 1', [id]);
    if (subcategories.length > 0) {
      return errorResponse(res, 'Không thể xóa danh mục đã có danh mục con', 400);
    }
    
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    
    return successResponse(res, 'Xóa danh mục thành công');
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse(res, 'Lỗi khi xóa danh mục', 500);
  }
};
