const pool = require("../config/db");

const addBook = async (req, res) => {
    const { title, author, genre } = req.body;
    const userId = req.user.id;
    const result = await pool.query(
        'INSERT INTO public.books (title, author, genre, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, author, genre, userId]
    );
    res.status(201).json(result.rows[0]);
};

const getBooks = async (req, res) => {
    const { page = 1, limit = 10, author, genre } = req.query;
    const offset = (page - 1) * limit;
    let baseQuery = 'SELECT * FROM public.books';
    const filters = [];
    const values = [];

    if (author) {
        values.push(`%${author.toLowerCase()}%`);
        filters.push(`LOWER(author) LIKE $${values.length}`);
    }

    if (genre) {
        values.push(genre);
        filters.push(`genre = $${values.length}`);
    }

    if (filters.length > 0) {
        baseQuery += ' WHERE ' + filters.join(' AND ');
    }

    values.push(limit, offset);
    baseQuery += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
};

const getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const bookResult = await pool.query(
            'SELECT * FROM public.books WHERE id = $1',
            [bookId]
        );

        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const ratingResult = await pool.query(
            'SELECT AVG(rating)::numeric(2,1) as avg_rating FROM public.reviews WHERE book_id = $1',
            [bookId]
        );

        const reviewsResult = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, u.username 
             FROM public.reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.book_id = $1 
             ORDER BY r.created_at DESC 
             LIMIT $2 OFFSET $3`,
            [bookId, limit, offset]
        );

        const totalReviewsResult = await pool.query(
            'SELECT COUNT(*) FROM public.reviews WHERE book_id = $1',
            [bookId]
        );
        const totalReviews = parseInt(totalReviewsResult.rows[0].count);

        res.json({
            ...bookResult.rows[0],
            avg_rating: ratingResult.rows[0].avg_rating,
            reviews: reviewsResult.rows,
            review_page: {
                total: totalReviews,
                page,
                totalPages: Math.ceil(totalReviews / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const submitReview = async (req, res) => {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;

    try {
        const existing = await pool.query(
            'SELECT * FROM public.reviews WHERE user_id = $1 AND book_id = $2',
            [userId, bookId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this book.' });
        }

        const result = await pool.query(
            'INSERT INTO public.reviews (user_id, book_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, bookId, rating, comment]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const searchBooks = async (req, res) => {
    const query = req.query.query?.toLowerCase() || '';
    const result = await pool.query(
        'SELECT * FROM public.books WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1',
        [`%${query}%`]
    );
    res.json(result.rows);
};

const updateReview = async (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await pool.query('SELECT * FROM public.reviews WHERE id = $1', [reviewId]);
    if (review.rows.length === 0 || review.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
        'UPDATE public.reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *',
        [rating, comment, reviewId]
    );

    res.json(result.rows[0]);
};

const deleteReview = async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await pool.query('SELECT * FROM public.reviews WHERE id = $1', [reviewId]);
    if (review.rows.length === 0 || review.rows[0].user_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM public.reviews WHERE id = $1', [reviewId]);
    res.json({ message: 'Review deleted successfully' });
};


module.exports = { addBook, getBooks, getBookById, submitReview, searchBooks, updateReview, deleteReview };
