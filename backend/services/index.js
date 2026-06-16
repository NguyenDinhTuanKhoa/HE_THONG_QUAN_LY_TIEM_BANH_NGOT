// services/index.js
// Central export file for all services

const AuthService = require('./authService');
const EmailService = require('./emailService');

module.exports = {
  AuthService,
  EmailService
};
