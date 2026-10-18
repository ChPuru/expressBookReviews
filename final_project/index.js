'use strict';

const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = Number(process.env.PORT || 5000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'development-only-change-this-session-secret';
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-this-jwt-secret';

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Keep the session middleware on /customer so login and protected endpoints share a session.
app.use('/customer', session({
  name: 'bookreview.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
  }
}));

// Protected endpoints accept the JWT stored in the login session, or a Bearer token.
app.use('/customer/auth', (req, res, next) => {
  const sessionToken = req.session && req.session.authorization
    ? req.session.authorization.accessToken
    : null;
  const authorization = req.get('Authorization') || '';
  const bearerToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : null;
  const token = sessionToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'User not logged in. Please log in to access this resource.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || !decoded.username) {
      return res.status(401).json({ message: 'User not authenticated. Please log in again.' });
    }
    req.user = decoded;
    next();
  });
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Book review API is running at http://localhost:${PORT}`));
}

module.exports = app;
