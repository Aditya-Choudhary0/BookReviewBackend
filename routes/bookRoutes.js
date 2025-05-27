const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { searchBooks, submitReview, getBookById, getBooks, addBook } = require('../controller/bookController');

router.post('/', authenticate, addBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/:id/reviews', authenticate, submitReview);
router.get('/search', searchBooks);

module.exports = router;
