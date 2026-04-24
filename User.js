const bcrypt = require('bcryptjs');
const { readDb, writeDb, createId, now } = require('../dataStore');

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findOne(query) {
    const db = readDb();
    const found = db.users.find((user) => {
      return Object.entries(query).every(([key, value]) => user[key] === value);
    });
    return found ? new User(found) : null;
  }

  static async create({ name, email, password }) {
    const db = readDb();
    const normalizedEmail = email.toLowerCase().trim();

    if (db.users.some((user) => user.email === normalizedEmail)) {
      const error = new Error('Duplicate email');
      error.code = 11000;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: createId(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: now(),
      updatedAt: now()
    };

    db.users.push(user);
    writeDb(db);
    return new User(user);
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

module.exports = User;
