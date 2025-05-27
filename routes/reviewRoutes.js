const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { updateReview, deleteReview } = require('../controller/bookController');

router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
