const { readDb, writeDb, createId, now } = require('../dataStore');

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findOne(query) {
    const db = readDb();

    let user = null;

    if (query.email) {
      user = db.users.find((item) => item.email === query.email);
    }

    if (!user) return null;

    return new User(user);
  }

  static async create({ name, email, password }) {
    const db = readDb();

    const user = {
      _id: createId(),
      name,
      email,
      password,
      createdAt: now(),
      updatedAt: now()
    };

    db.users.push(user);
    writeDb(db);

    return new User(user);
  }
}

module.exports = User;
