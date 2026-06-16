// models/productModel.js
const db = require('../config/db');

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.short_description = data.short_description;
    this.sku = data.sku;
    this.price = data.price;
    this.sale_price = data.sale_price;
    this.cost_price = data.cost_price;
    this.stock_quantity = data.stock_quantity;
    this.min_stock_level = data.min_stock_level;
    this.category_id = data.category_id;
    this.featured_image = data.featured_image;
    this.gallery = data.gallery;
    this.ingredients = data.ingredients;
    this.nutritional_info = data.nutritional_info;
    this.allergen_info = data.allergen_info;
    this.preparation_time = data.preparation_time;
    this.shelf_life = data.shelf_life;
    this.storage_instructions = data.storage_instructions;
    this.is_featured = data.is_featured;
    this.is_bestseller = data.is_bestseller;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find all products with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      category_id,
      search,
      status = 'active',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE p.status = ?';
    const queryParams = [status];

    if (category_id) {
      whereClause += ' AND p.category_id = ?';
      queryParams.push(category_id);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

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

    const [rows] = await db.execute(query, [...queryParams, limit, offset]);
    return rows.map(row => new Product(row));
  }

  // Find product by ID
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? new Product(rows[0]) : null;
  }

  // Find product by SKU
  static async findBySku(sku) {
    const query = 'SELECT * FROM products WHERE sku = ?';
    const [rows] = await db.execute(query, [sku]);
    return rows.length > 0 ? new Product(rows[0]) : null;
  }

  // Find product by slug
  static async findBySlug(slug) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `;
    
    const [rows] = await db.execute(query, [slug]);
    return rows.length > 0 ? new Product(rows[0]) : null;
  }

  // Create new product
  static async create(productData) {
    const query = `
      INSERT INTO products (
        name, slug, description, short_description, sku, price, sale_price, cost_price,
        stock_quantity, min_stock_level, category_id, featured_image, gallery,
        ingredients, nutritional_info, allergen_info, preparation_time, shelf_life,
        storage_instructions, is_featured, is_bestseller, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      productData.name,
      productData.slug,
      productData.description,
      productData.short_description,
      productData.sku,
      productData.price,
      productData.sale_price,
      productData.cost_price,
      productData.stock_quantity || 0,
      productData.min_stock_level || 0,
      productData.category_id,
      productData.featured_image,
      productData.gallery,
      productData.ingredients,
      productData.nutritional_info,
      productData.allergen_info,
      productData.preparation_time,
      productData.shelf_life,
      productData.storage_instructions,
      productData.is_featured || false,
      productData.is_bestseller || false,
      productData.status || 'active'
    ];

    const [result] = await db.execute(query, values);
    return this.findById(result.insertId);
  }

  // Update product
  static async update(id, productData) {
    const updateFields = [];
    const updateValues = [];

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(productData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No data to update');
    }

    updateValues.push(id);

    const query = `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(query, updateValues);
    
    return this.findById(id);
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Update stock quantity
  static async updateStock(id, quantity, type = 'set') {
    let query;
    let values;

    switch (type) {
      case 'add':
        query = 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?';
        values = [quantity, id];
        break;
      case 'subtract':
        query = 'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?';
        values = [quantity, id];
        break;
      case 'set':
      default:
        query = 'UPDATE products SET stock_quantity = ? WHERE id = ?';
        values = [quantity, id];
        break;
    }

    await db.execute(query, values);
    return this.findById(id);
  }

  // Get products count
  static async getCount(filters = {}) {
    let whereClause = 'WHERE status = ?';
    const queryParams = [filters.status || 'active'];

    if (filters.category_id) {
      whereClause += ' AND category_id = ?';
      queryParams.push(filters.category_id);
    }

    if (filters.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const query = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [rows] = await db.execute(query, queryParams);
    return rows[0].total;
  }

  // Get featured products
  static async getFeatured(limit = 8) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows.map(row => new Product(row));
  }

  // Get bestseller products
  static async getBestsellers(limit = 8) {
    const query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_bestseller = true AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows.map(row => new Product(row));
  }
}

module.exports = Product;
