/**
 * 📊 Request Logging Middleware
 * Provides comprehensive request/response logging for debugging
 */

const colors = require('colors');

// ANSI color codes for better terminal output
const COLORS = {
  GET: '\x1b[32m',     // Green
  POST: '\x1b[33m',    // Yellow  
  PUT: '\x1b[34m',     // Blue
  DELETE: '\x1b[31m',  // Red
  PATCH: '\x1b[35m',   // Magenta
  RESET: '\x1b[0m'     // Reset
};

// Status code color mapping
const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return '\x1b[32m'; // Green
  if (status >= 300 && status < 400) return '\x1b[33m'; // Yellow
  if (status >= 400 && status < 500) return '\x1b[31m'; // Red
  if (status >= 500) return '\x1b[35m'; // Magenta
  return '\x1b[37m'; // White
};

// Request duration formatter
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// IP address formatter
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
};

// User agent parser
const parseUserAgent = (userAgent) => {
  if (!userAgent) return 'Unknown';
  
  // Simple parsing for common patterns
  if (userAgent.includes('curl')) return 'cURL';
  if (userAgent.includes('Postman')) return 'Postman';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('axios')) return 'Axios';
  
  return userAgent.split(' ')[0] || 'Unknown';
};

// Request ID generator
const generateRequestId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Main logging middleware
const requestLogger = (options = {}) => {
  const config = {
    logBody: options.logBody !== false, // Default true
    logHeaders: options.logHeaders || false,
    logQuery: options.logQuery !== false, // Default true
    skipPaths: options.skipPaths || ['/health', '/favicon.ico'],
    maxBodyLength: options.maxBodyLength || 1000,
    logLevel: options.logLevel || 'info', // 'info', 'debug', 'error'
    includeResponseBody: options.includeResponseBody || false,
    ...options
  };

  return (req, res, next) => {
    // Skip logging for specified paths
    if (config.skipPaths.some(path => req.path.includes(path))) {
      return next();
    }

    const requestId = generateRequestId();
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Add request ID to request object for tracking
    req.requestId = requestId;
    
    // Get request info
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = getClientIP(req);
    const userAgent = parseUserAgent(req.headers['user-agent']);
    
    // Log incoming request
    const methodColor = COLORS[method] || COLORS.RESET;
    console.log(
      `${methodColor}➤ [${timestamp}] ${method} ${url}${COLORS.RESET} ` +
      `| ID: ${requestId} | IP: ${ip} | Agent: ${userAgent}`
    );

    // Log query parameters
    if (config.logQuery && Object.keys(req.query).length > 0) {
      console.log(`  📋 Query: ${JSON.stringify(req.query)}`);
    }

    // Log request headers (if enabled)
    if (config.logHeaders) {
      console.log(`  📤 Headers: ${JSON.stringify(req.headers, null, 2)}`);
    }

    // Log request body (if enabled and exists)
    if (config.logBody && req.body && Object.keys(req.body).length > 0) {
      let body = JSON.stringify(req.body, null, 2);
      
      // Mask sensitive data
      body = body.replace(/"password":\s*"[^"]*"/g, '"password": "***MASKED***"');
      body = body.replace(/"token":\s*"[^"]*"/g, '"token": "***MASKED***"');
      
      // Truncate long bodies
      if (body.length > config.maxBodyLength) {
        body = body.substring(0, config.maxBodyLength) + '... [TRUNCATED]';
      }
      
      console.log(`  📦 Body: ${body}`);
    }

    // Store original json method to intercept response
    const originalJson = res.json;
    let responseBody = null;

    // Override res.json to capture response
    res.json = function(data) {
      responseBody = data;
      return originalJson.call(this, data);
    };

    // Log response when request finishes
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusColor = getStatusColor(res.statusCode);
      
      // Log response
      console.log(
        `${statusColor}◀ [${new Date().toISOString()}] ${res.statusCode}${COLORS.RESET} ` +
        `| ID: ${requestId} | ${formatDuration(duration)} | ${method} ${url}`
      );

      // Log response body if enabled
      if (config.includeResponseBody && responseBody) {
        let body = JSON.stringify(responseBody, null, 2);
        
        // Truncate long responses
        if (body.length > config.maxBodyLength) {
          body = body.substring(0, config.maxBodyLength) + '... [TRUNCATED]';
        }
        
        console.log(`  📦 Response: ${body}`);
      }

      // Log slow requests
      if (duration > 1000) {
        console.log(`  ⚠️  Slow request detected: ${formatDuration(duration)}`.yellow);
      }

      // Log errors
      if (res.statusCode >= 400) {
        console.log(`  ❌ Error response: ${res.statusCode}`.red);
      }

      // Add divider for readability
      if (config.logLevel === 'debug') {
        console.log('─'.repeat(80).gray);
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.requestId || 'unknown';
  
  console.error(
    `💥 [${timestamp}] ERROR | ID: ${requestId} | ${req.method} ${req.originalUrl}`.red
  );
  console.error(`  📍 Stack: ${err.stack}`.red);
  console.error(`  📋 Message: ${err.message}`.red);
  
  if (err.statusCode) {
    console.error(`  🔢 Status Code: ${err.statusCode}`.red);
  }
  
  console.error('─'.repeat(80).red);
  
  next(err);
};

// Performance monitoring middleware
const performanceMonitor = () => {
  const stats = {
    totalRequests: 0,
    averageResponseTime: 0,
    requestTimes: [],
    errorCount: 0,
    statusCodes: {}
  };

  return {
    middleware: (req, res, next) => {
      const startTime = process.hrtime.bigint();
      
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Update statistics
        stats.totalRequests++;
        stats.requestTimes.push(duration);
        
        // Keep only last 1000 request times for average calculation
        if (stats.requestTimes.length > 1000) {
          stats.requestTimes.shift();
        }
        
        // Calculate average response time
        stats.averageResponseTime = stats.requestTimes.reduce((a, b) => a + b, 0) / stats.requestTimes.length;
        
        // Track status codes
        stats.statusCodes[res.statusCode] = (stats.statusCodes[res.statusCode] || 0) + 1;
        
        // Count errors
        if (res.statusCode >= 400) {
          stats.errorCount++;
        }
        
        originalEnd.call(this, chunk, encoding);
      };
      
      next();
    },
    
    getStats: () => ({
      ...stats,
      averageResponseTime: Math.round(stats.averageResponseTime * 100) / 100,
      errorRate: stats.totalRequests > 0 ? (stats.errorCount / stats.totalRequests * 100).toFixed(2) : 0
    })
  };
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor
};
