// services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Account = require('../models/accountModel');
const Customer = require('../models/customerModel');

class AuthService {
  // Generate JWT token
  static generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Admin/Staff login
  static async loginAdmin(username, password) {
    try {
      // Check if input is email or username
      let account;
      if (username.includes('@')) {
        account = await Account.findByEmail(username);
      } else {
        account = await Account.findByUsername(username);
      }

      if (!account) {
        throw new Error('Invalid credentials');
      }

      // Check if account is active
      if (account.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, account.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await Account.updateLastLogin(account.id);

      // Generate token
      const token = this.generateToken({
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
        type: 'admin'
      });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = account;

      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Customer login
  static async loginCustomer(email, password) {
    try {
      const customer = await Customer.findByEmail(email);

      if (!customer) {
        throw new Error('Invalid credentials');
      }

      // Check if customer is active
      if (customer.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isValidPassword = await Customer.verifyPassword(customer, password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await Customer.updateLastLogin(customer.id);

      // Generate token
      const token = this.generateToken({
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        type: 'customer'
      });

      // Return customer data without password
      const { password: _, ...customerWithoutPassword } = customer;

      return {
        customer: customerWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Register customer
  static async registerCustomer(customerData) {
    try {
      // Check if email already exists
      const existingCustomer = await Customer.findByEmail(customerData.email);
      if (existingCustomer) {
        throw new Error('Email already exists');
      }

      // Check if phone already exists (if provided)
      if (customerData.phone) {
        const existingPhone = await Customer.findByPhone(customerData.phone);
        if (existingPhone) {
          throw new Error('Phone number already exists');
        }
      }

      // Create customer
      const customer = await Customer.create(customerData);

      // Generate token
      const token = this.generateToken({
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        type: 'customer'
      });

      // Return customer data without password
      const { password: _, ...customerWithoutPassword } = customer;

      return {
        customer: customerWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  static async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      // Generate new token with same payload
      const newToken = this.generateToken({
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        full_name: decoded.full_name,
        type: decoded.type
      });

      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword, userType = 'admin') {
    try {
      let user;
      
      if (userType === 'admin') {
        user = await Account.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        await Account.changePassword(userId, newPassword);
      } else {
        user = await Customer.findById(userId);
        if (!user) {
          throw new Error('Customer not found');
        }

        // Verify current password
        const isValidPassword = await Customer.verifyPassword(user, currentPassword);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        await Customer.changePassword(userId, newPassword);
      }

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Reset password (for forgot password functionality)
  static async resetPassword(email, newPassword, userType = 'customer') {
    try {
      let user;
      
      if (userType === 'admin') {
        user = await Account.findByEmail(email);
        if (!user) {
          throw new Error('User not found');
        }
        await Account.changePassword(user.id, newPassword);
      } else {
        user = await Customer.findByEmail(email);
        if (!user) {
          throw new Error('Customer not found');
        }
        await Customer.changePassword(user.id, newPassword);
      }

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Logout (invalidate token - in a real app, you'd maintain a blacklist)
  static async logout(token) {
    try {
      // In a production app, you would:
      // 1. Add token to blacklist in Redis/database
      // 2. Set token expiry to current time
      // For now, we'll just verify the token is valid
      this.verifyToken(token);
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Validate token and get user info
  static async validateToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      let user;
      if (decoded.type === 'admin') {
        user = await Account.findById(decoded.id);
        if (!user || user.status !== 'active') {
          throw new Error('User not found or inactive');
        }
      } else {
        user = await Customer.findById(decoded.id);
        if (!user || user.status !== 'active') {
          throw new Error('Customer not found or inactive');
        }
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        decoded
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
