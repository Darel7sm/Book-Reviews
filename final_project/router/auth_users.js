const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username is at least 3 characters and doesn't contain spaces
  return (
    typeof username === 'string' &&
    username.length >= 3 &&
    !username.includes(' ')
  )
}

const authenticatedUser = (username, password) => {
  // Check if user exists and the password matches
  const user = users.find((user) => user.username === username)
  return user && user.password === password
}

regd_users.post('/register', (req, res) => {
  const { username, password } = req.body

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' })
  }

  // Validate username
  if (!isValid(username)) {
    return res
      .status(400)
      .json({
        message:
          'Invalid username. Must be at least 3 characters long and cannot contain spaces.',
      })
  }

  // Check if user already exists
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: 'User already exists.' })
  }

  // Create a new user
  users.push({ username, password }) // Note: In a real application, hash the password before storing it
  return res.status(201).json({ message: 'User registered successfully.' })
})


// Only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!isValid(username) || !password) {
    return res.status(400).json({ message: 'Invalid username or password.' })
  }

  if (authenticatedUser(username, password)) {
    // Generate a token (you may want to use a secret key from environment variables)
    const token = jwt.sign({ username }, 'your_jwt_secret')
    return res.status(200).json({ message: 'Login successful', token })
  }

  return res.status(401).json({ message: 'Invalid username or password.' })
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params
  const { review } = req.body // Expecting review text in body
  const token = req.headers['authorization']

  if (!token) {
    return res.status(403).json({ message: 'User not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret')
    const username = decoded.username

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' })
    }

    if (!books[isbn].reviews[username]) {
      books[isbn].reviews[username] = []
    }

    books[isbn].reviews[username].push(review)
    return res
      .status(200)
      .json({ message: 'Review added', reviews: books[isbn].reviews })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
