const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'db.json');

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify({ users: [], movies: [] }, null, 2),
      'utf8'
    );
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function createId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

module.exports = {
  ensureDb,
  readDb,
  writeDb,
  createId,
  now,
  dataFile
};
