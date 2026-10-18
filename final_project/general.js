'use strict';

// Axios client used for the rubric's four asynchronous book-retrieval methods.
// Start the Express server in another terminal before running this file.
const axios = require('axios');
const BASE_URL = (process.env.BOOK_REVIEW_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    reportError(error);
    return null;
  }
}

function getBooksByISBN(isbn) {
  return axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => {
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    })
    .catch((error) => {
      reportError(error);
      return null;
    });
}

async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    reportError(error);
    return null;
  }
}

async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    reportError(error);
    return null;
  }
}

function reportError(error) {
  if (error.response) {
    console.error(`HTTP ${error.response.status}:`, error.response.data);
  } else {
    console.error('Request failed:', error.message);
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch ((command || '').toLowerCase()) {
    case 'all':
      await getAllBooks();
      break;
    case 'isbn':
      if (!args[0]) return usage();
      await getBooksByISBN(args[0]);
      break;
    case 'author':
      if (!args.length) return usage();
      await getBooksByAuthor(args.join(' '));
      break;
    case 'title':
      if (!args.length) return usage();
      await getBooksByTitle(args.join(' '));
      break;
    default:
      usage();
  }
}

function usage() {
  console.log('Usage: node general.js all | isbn <id> | author <name> | title <title>');
}

if (require.main === module) main();

module.exports = { getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle };
