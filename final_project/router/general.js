const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!isValid(username)) {
    return res.status(400).json({ message: 'Invalid username.' })
  }

  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: 'User already exists.' })
  }

  users.push({ username, password })
  return res.status(201).json({ message: 'User registered successfully.' })
})

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).json(books)
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params
  if (books[isbn]) {
    return res.status(200).json(books[isbn])
  }
  return res.status(404).json({ message: 'Book not found.' })
})

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params
  const results = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  )

  if (results.length) {
    return res.status(200).json(results)
  }
  return res.status(404).json({ message: 'No books found by this author.' })
})

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params
  const results = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title.toLowerCase())
  )

  if (results.length) {
    return res.status(200).json(results)
  }
  return res.status(404).json({ message: 'No books found with this title.' })
})

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews)
  }
  return res.status(404).json({ message: 'Book not found.' })
})

module.exports.general = public_users;
