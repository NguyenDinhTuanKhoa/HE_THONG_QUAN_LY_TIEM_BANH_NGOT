// models/index.js
// Central export file for all models

const Account = require('./accountModel');
const Customer = require('./customerModel');
const Product = require('./productModel');
const Category = require('./categoryModel');
const Order = require('./orderModel');

module.exports = {
  Account,
  Customer,
  Product,
  Category,
  Order
};
