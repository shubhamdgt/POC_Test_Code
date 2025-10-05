const usbDetect = require('usb-detection');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'device_log.json');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

// If file doesn't exist or is empty/invalid, create a default JSON array
if (!fs.existsSync(LOG_PATH)) {
  fs.writeFileSync(LOG_PATH, '[]');
}

let logs = [];
try {
  const fileData = fs.readFileSync(LOG_PATH, 'utf-8');
  logs = fileData.trim() ? JSON.parse(fileData) : [];
} catch (err) {
  console.warn('⚠️ Invalid JSON, resetting log file.');
  logs = [];
  fs.writeFileSync(LOG_PATH, '[]');
}

function saveLog() {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
}

usbDetect.startMonitoring();

usbDetect.on('add', device => {
  const entry = {
    id: `${device.vendorId}_${device.productId}_${Date.now()}`,
    vendorId: device.vendorId,
    productId: device.productId,
    manufacturer: device.manufacturer || '',
    deviceName: device.deviceName || '',
    serialNumber: device.serialNumber || '',
    connectionTime: new Date().toISOString(),
    disconnectionTime: null
  };
  logs.push(entry);
  saveLog();
  console.log('✅ Connected:', entry.deviceName || 'Unknown');
});

usbDetect.on('remove', device => {
  const found = [...logs].reverse().find(d =>
    d.vendorId === device.vendorId &&
    d.productId === device.productId &&
    !d.disconnectionTime
  );
  if (found) {
    found.disconnectionTime = new Date().toISOString();
    saveLog();
    console.log('❌ Disconnected:', found.deviceName || 'Unknown');
  }
});
