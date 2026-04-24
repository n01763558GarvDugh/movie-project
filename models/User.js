const { readDb, writeDb, createId, now } = require('../dataStore');

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function attachOwner(movie, users) {
  const owner = users.find((user) => user._id === movie.owner);
  return {
    ...movie,
    owner: owner
      ? { _id: owner._id, name: owner.name, email: owner.email }
      : null
  };
}

class Movie {
  constructor(data) {
    Object.assign(this, data);
  }

  static async find() {
    const db = readDb();
    const movies = db.movies
      .map((movie) => attachOwner(movie, db.users))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return movies.map((movie) => new Movie(movie));
  }

  static async create({ name, description, year, genres, rating, posterUrl, owner }) {
    const db = readDb();
    const movie = {
      _id: createId(),
      name,
      description,
      year,
      genres,
      rating,
      posterUrl: posterUrl || DEFAULT_POSTER,
      owner,
      createdAt: now(),
      updatedAt: now()
    };

    db.movies.push(movie);
    writeDb(db);
    return new Movie(attachOwner(movie, db.users));
  }

  static async findById(id) {
    const db = readDb();
    const movie = db.movies.find((item) => item._id === id);
    if (!movie) return null;
    return new Movie(attachOwner(clone(movie), db.users));
  }

  populate() {
    return this;
  }

  async save() {
    const db = readDb();
    const index = db.movies.findIndex((item) => item._id === this._id);
    if (index === -1) throw new Error('Movie not found');

    db.movies[index] = {
      _id: this._id,
      name: this.name,
      description: this.description,
      year: Number(this.year),
      genres: this.genres,
      rating: Number(this.rating),
      posterUrl: this.posterUrl || DEFAULT_POSTER,
      owner: this.owner && typeof this.owner === 'object' ? this.owner._id : this.owner,
      createdAt: this.createdAt || db.movies[index].createdAt,
      updatedAt: now()
    };

    writeDb(db);

    const owner = db.users.find((user) => user._id === db.movies[index].owner);
    Object.assign(this, attachOwner(db.movies[index], owner ? [owner] : []));
    return this;
  }

  async deleteOne() {
    const db = readDb();
    db.movies = db.movies.filter((item) => item._id !== this._id);
    writeDb(db);
  }
}

module.exports = Movie;
