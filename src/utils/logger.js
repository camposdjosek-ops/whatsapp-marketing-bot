const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'bot.log');

function formatLog(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

function writeLog(level, message) {
  const logMessage = formatLog(level, message);
  
  // Console output
  console.log(logMessage);
  
  // File output
  fs.appendFileSync(logFile, logMessage + '\n', 'utf8');
}

const logger = {
  info: (message) => writeLog('INFO', message),
  error: (message) => writeLog('ERROR', message),
  warn: (message) => writeLog('WARN', message),
  debug: (message) => writeLog('DEBUG', message)
};

module.exports = { logger };
