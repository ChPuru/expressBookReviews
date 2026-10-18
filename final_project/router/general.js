'use strict';

const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const publicUsers = express.Router();

// Register a new user. The course starter keeps users in memory for simplicity.
publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (isValid(username.trim())) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  users.push({ username: username.trim(), password });
  return res.status(201).json({ message: 'User successfully registered. You can now log in.' });
});

// Get every book in the catalog.
publicUsers.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get a single book by the catalog identifier (called ISBN by the course routes).
publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  return res.status(200).json(book);
});

// Get books whose author matches the supplied term (case-insensitive substring).
publicUsers.get('/author/:author', (req, res) => {
  const search = req.params.author.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.author.toLocaleLowerCase().includes(search)
  ));
  return res.status(200).json(matches);
});

// Get books whose title matches the supplied term (case-insensitive substring).
publicUsers.get('/title/:title', (req, res) => {
  const search = req.params.title.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.title.toLocaleLowerCase().includes(search)
  ));
  return res.status(200).json(matches);
});

// Retrieve all reviews for a book; a new book begins with an empty reviews object.
publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  return res.status(200).json(book.reviews);
});

module.exports.general = publicUsers;
