const Movie = require('../models/Movie');

function isGuest(req, res, next) {
  if (!req.session.user) return next();
  req.flash('error', 'You are already logged in.');
  return res.redirect('/');
}

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.flash('error', 'Please login first to continue.');
  return res.redirect('/login');
}

async function isMovieOwner(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      req.flash('error', 'Movie not found.');
      return res.redirect('/movies');
    }

    const ownerId = movie.owner && typeof movie.owner === 'object' ? movie.owner._id : movie.owner;

    if (ownerId !== req.session.user.id) {
      req.flash('error', 'You are not allowed to edit or delete this movie.');
      return res.redirect(`/movies/${movie._id}`);
    }

    req.movie = movie;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  isGuest,
  isAuthenticated,
  isMovieOwner
};
