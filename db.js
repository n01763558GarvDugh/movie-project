const { ensureDb, dataFile } = require('./dataStore');

async function connectDB() {
  ensureDb();
  console.log(`Local JSON database ready at ${dataFile}`);
}

module.exports = connectDB;
