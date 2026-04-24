const express = require('express');
const Movie = require('../models/Movie');
const { isAuthenticated, isMovieOwner } = require('../middleware/auth');

const router = express.Router();

function normalizeGenres(genresInput) {
  if (!genresInput) return [];
  return genresInput
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
}

function validateMovieInput(body) {
  const errors = [];

  if (!body.name || !body.name.trim()) errors.push('Movie name is required.');
  if (!body.description || !body.description.trim()) errors.push('Description is required.');
  if (!body.year) errors.push('Year is required.');
  if (body.year && (Number(body.year) < 1888 || Number(body.year) > 2100)) {
    errors.push('Year must be between 1888 and 2100.');
  }
  if (!body.rating) errors.push('Rating is required.');
  if (body.rating && (Number(body.rating) < 0 || Number(body.rating) > 10)) {
    errors.push('Rating must be between 0 and 10.');
  }
  if (normalizeGenres(body.genres).length === 0) {
    errors.push('Enter at least one genre.');
  }

  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.find();

    res.render('movies/index', {
      title: 'All Movies',
      movies
    });
  } catch (error) {
    next(error);
  }
});

router.get('/new', isAuthenticated, (req, res) => {
  res.render('movies/new', {
    title: 'Add Movie',
    errors: [],
    old: {}
  });
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const errors = validateMovieInput(req.body);

    if (errors.length > 0) {
      return res.status(400).render('movies/new', {
        title: 'Add Movie',
        errors,
        old: req.body
      });
    }

    const movie = await Movie.create({
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      year: Number(req.body.year),
      genres: normalizeGenres(req.body.genres),
      rating: Number(req.body.rating),
      posterUrl: req.body.posterUrl?.trim() || undefined,
      owner: req.session.user.id
    });

    req.flash('success', 'Movie added successfully.');
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      req.flash('error', 'Movie not found.');
      return res.redirect('/movies');
    }

    res.render('movies/show', {
      title: movie.name,
      movie
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/edit', isAuthenticated, isMovieOwner, (req, res) => {
  res.render('movies/edit', {
    title: 'Edit Movie',
    errors: [],
    movie: req.movie,
    old: {
      name: req.movie.name,
      description: req.movie.description,
      year: req.movie.year,
      genres: req.movie.genres.join(', '),
      rating: req.movie.rating,
      posterUrl: req.movie.posterUrl
    }
  });
});

router.put('/:id', isAuthenticated, isMovieOwner, async (req, res, next) => {
  try {
    const errors = validateMovieInput(req.body);

    if (errors.length > 0) {
      return res.status(400).render('movies/edit', {
        title: 'Edit Movie',
        errors,
        movie: req.movie,
        old: req.body
      });
    }

    req.movie.name = req.body.name.trim();
    req.movie.description = req.body.description.trim();
    req.movie.year = Number(req.body.year);
    req.movie.genres = normalizeGenres(req.body.genres);
    req.movie.rating = Number(req.body.rating);
    req.movie.posterUrl = req.body.posterUrl?.trim() || req.movie.posterUrl;

    await req.movie.save();

    req.flash('success', 'Movie updated successfully.');
    res.redirect(`/movies/${req.movie._id}`);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', isAuthenticated, isMovieOwner, async (req, res, next) => {
  try {
    await req.movie.deleteOne();
    req.flash('success', 'Movie deleted successfully.');
    res.redirect('/movies');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
