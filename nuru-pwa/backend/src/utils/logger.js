const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, meta = {}) => {
    const logEntry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      meta,
    };
    
    console.log(`[INFO] ${logEntry.timestamp}: ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  error: (message, error = {}) => {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message || error,
      stack: error.stack,
    };
    
    console.error(`[ERROR] ${logEntry.timestamp}: ${message}`, error);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  warn: (message, meta = {}) => {
    const logEntry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      meta,
    };
    
    console.warn(`[WARN] ${logEntry.timestamp}: ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta);
    }
  },
};

module.exports = logger;