// models/categoryModel.js
const db = require('../config/db');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.image = data.image;
    this.parent_id = data.parent_id;
    this.sort_order = data.sort_order;
    this.is_featured = data.is_featured;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.product_count = data.product_count || 0;
  }

  // Find all categories
  static async findAll(options = {}) {
    const { status = 'active', includeProductCount = true } = options;
    
    let query = `
      SELECT 
        c.*
        ${includeProductCount ? ', COUNT(p.id) as product_count' : ''}
      FROM categories c
      ${includeProductCount ? 'LEFT JOIN products p ON c.id = p.category_id AND p.status = "active"' : ''}
      WHERE c.status = ?
      ${includeProductCount ? 'GROUP BY c.id' : ''}
      ORDER BY c.sort_order ASC, c.name ASC
    `;

    const [rows] = await db.execute(query, [status]);
    return rows.map(row => new Category(row));
  }

  // Find category by ID
  static async findById(id) {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? new Category(rows[0]) : null;
  }

  // Find category by slug
  static async findBySlug(slug) {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.slug = ?
      GROUP BY c.id
    `;
    
    const [rows] = await db.execute(query, [slug]);
    return rows.length > 0 ? new Category(rows[0]) : null;
  }

  // Find category by name
  static async findByName(name) {
    const query = 'SELECT * FROM categories WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows.length > 0 ? new Category(rows[0]) : null;
  }

  // Create new category
  static async create(categoryData) {
    const query = `
      INSERT INTO categories (
        name, slug, description, image, parent_id, sort_order, is_featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      categoryData.name,
      categoryData.slug,
      categoryData.description,
      categoryData.image,
      categoryData.parent_id,
      categoryData.sort_order || 0,
      categoryData.is_featured || false,
      categoryData.status || 'active'
    ];

    const [result] = await db.execute(query, values);
    return this.findById(result.insertId);
  }

  // Update category
  static async update(id, categoryData) {
    const updateFields = [];
    const updateValues = [];

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(categoryData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No data to update');
    }

    updateValues.push(id);

    const query = `UPDATE categories SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return this.findById(id);
  }

  // Delete category
  static async delete(id) {
    // Check if category has products
    const [products] = await db.execute('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      throw new Error('Cannot delete category with products');
    }

    // Check if category has subcategories
    const [subcategories] = await db.execute('SELECT id FROM categories WHERE parent_id = ? LIMIT 1', [id]);
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    const query = 'DELETE FROM categories WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get parent categories (top level)
  static async getParentCategories() {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.parent_id IS NULL AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows.map(row => new Category(row));
  }

  // Get subcategories by parent ID
  static async getSubcategories(parentId) {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.parent_id = ? AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const [rows] = await db.execute(query, [parentId]);
    return rows.map(row => new Category(row));
  }

  // Get featured categories
  static async getFeatured(limit = 6) {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.is_featured = true AND c.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows.map(row => new Category(row));
  }

  // Get category tree (hierarchical structure)
  static async getCategoryTree() {
    const parentCategories = await this.getParentCategories();
    
    for (let parent of parentCategories) {
      parent.subcategories = await this.getSubcategories(parent.id);
    }
    
    return parentCategories;
  }

  // Get categories count
  static async getCount(filters = {}) {
    let whereClause = 'WHERE status = ?';
    const queryParams = [filters.status || 'active'];

    if (filters.parent_id !== undefined) {
      if (filters.parent_id === null) {
        whereClause += ' AND parent_id IS NULL';
      } else {
        whereClause += ' AND parent_id = ?';
        queryParams.push(filters.parent_id);
      }
    }

    const query = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [rows] = await db.execute(query, queryParams);
    return rows[0].total;
  }

  // Check if slug exists
  static async slugExists(slug, excludeId = null) {
    let query = 'SELECT id FROM categories WHERE slug = ?';
    const params = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  }

  // Generate unique slug
  static async generateUniqueSlug(name, excludeId = null) {
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

module.exports = Category;
