// middleware/logger.js
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  const requestLog = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
  };

  // Don't log sensitive data
  if (requestLog.body && requestLog.body.password) {
    requestLog.body = { ...requestLog.body, password: '[HIDDEN]' };
  }

  console.log(`${timestamp} ${req.method} ${req.originalUrl} - ${req.ip}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
    };

    console.log(`${responseLog.timestamp} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);

    // Write to log file in production
    if (process.env.NODE_ENV === 'production') {
      const logEntry = JSON.stringify({ request: requestLog, response: responseLog }) + '\n';
      fs.appendFile(path.join(logsDir, 'app.log'), logEntry, (err) => {
        if (err) console.error('Failed to write to log file:', err);
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = logger;
