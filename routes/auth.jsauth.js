const express = require('express');
const User = require('../models/User');
const { isGuest } = require('../middleware/auth');

const router = express.Router();

router.get('/register', isGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    errors: [],
    old: {}
  });
});

router.post('/register', isGuest, async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const errors = [];

    if (!name || !name.trim()) errors.push('Name is required.');
    if (!email || !email.trim()) errors.push('Email is required.');
    if (!password) errors.push('Password is required.');
    if (password && password.length < 6) errors.push('Password must be at least 6 characters long.');
    if (password !== confirmPassword) errors.push('Passwords do not match.');

    const existingUser = await User.findOne({ email: email?.toLowerCase().trim() });
    if (existingUser) errors.push('An account with that email already exists.');

    if (errors.length > 0) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        errors,
        old: { name, email }
      });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    req.flash('success', 'Registration successful. Welcome!');
    res.redirect('/movies');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        errors: ['An account with that email already exists.'],
        old: { name: req.body.name, email: req.body.email }
      });
    }
    next(error);
  }
});

router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    errors: [],
    old: {}
  });
});

router.post('/login', isGuest, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !email.trim()) errors.push('Email is required.');
    if (!password) errors.push('Password is required.');

    if (errors.length > 0) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors,
        old: { email }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: ['Invalid email or password.'],
        old: { email }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: ['Invalid email or password.'],
        old: { email }
      });
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    req.flash('success', 'Login successful.');
    res.redirect('/movies');
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
