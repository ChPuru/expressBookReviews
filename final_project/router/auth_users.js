'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const authenticatedRoutes = express.Router();
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-this-jwt-secret';

const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) => users.some((user) =>
  user.username === username && user.password === password
);

// Registered users log in here. A JWT is stored in the session and also returned.
authenticatedRoutes.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken };
  req.session.save((err) => {
    if (err) return res.status(500).json({ message: 'Could not create login session.' });
    return res.status(200).json({ message: 'User successfully logged in.', username, accessToken });
  });
});

// Add a review or replace the review previously written by this same user.
authenticatedRoutes.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  const review = (req.body && req.body.review !== undefined) ? req.body.review : req.query.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'A non-empty review is required.' });
  }

  const username = req.user.username;
  book.reviews[username] = review.trim();
  return res.status(200).json({
    message: 'Review added/updated successfully.',
    isbn: req.params.isbn,
    reviews: book.reviews
  });
});

// Users can only delete their own review.
authenticatedRoutes.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  const username = req.user.username;
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: 'No review found for this user and book.' });
  }

  delete book.reviews[username];
  return res.status(200).json({
    message: 'Review deleted successfully.',
    isbn: req.params.isbn,
    reviews: book.reviews
  });
});

module.exports.authenticated = authenticatedRoutes;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
