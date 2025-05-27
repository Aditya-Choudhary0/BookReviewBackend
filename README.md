# 📚 Book Review Backend API

A RESTful API built with **Node.js**, **Express**, **PostgreSQL**, and **JWT** for managing books and user-submitted reviews. Users can sign up, authenticate, add books, and post/edit/delete their own reviews.

---

## 🚀 Features

- User registration and login with JWT authentication
- CRUD operations for books and reviews
- Pagination and filtering for book listings
- One review per user per book
- Book search by title or author (case-insensitive)
- Secure routes for authenticated users only

---

## 🛠️ Project Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/book-review-api.git
cd book-review-api

### 📦 **2. How to Run Locally**

#### 🔧 Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/book-review-api.git
cd book-review-api
```

#### 📦 Step 2: Install Dependencies

```bash
npm install
```

#### 🔑 Step 3: Set Up Environment Variables

Create a `.env` file in the root of your project:

```bash
touch .env
```

And add the following content (replace with your actual DB credentials):

```env
DB_USER = 'user'
DB_HOST = 'host'
DB_NAME = 'database_name'
DB_PASSWORD = 'password'
DB_PORT = 5432

PORT = 3000

JWT_SECRET= 'your_secret_key'
```

#### 🗃️ Step 4: Create the PostgreSQL Database

Run this schema in your PostgreSQL client (e.g. pgAdmin or `psql` CLI):

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    book_id INTEGER REFERENCES books(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, book_id)
);
```

#### 🚀 Step 5: Start the Server

```bash
npm run dev
# or
npm start
```

By default, the server will be running at:
`http://localhost:3000`

---

### 📮 **3. Example API Requests (with curl)**

#### ✅ Signup

```bash
curl -X POST http://localhost:3000/signup \
-H "Content-Type: application/json" \
-d '{"username":"alice","password":"password123"}'
```

#### ✅ Login

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username":"alice","password":"password123"}'
```

#### 📘 Add a Book (Authenticated)

```bash
curl -X POST http://localhost:3000/books \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"title":"1984", "author":"George Orwell", "genre":"Dystopian"}'
```

#### 🔍 Get All Books with Filter

```bash
curl "http://localhost:3000/books?page=1&limit=5&author=Orwell"
```

#### 📖 Get Book by ID

```bash
curl http://localhost:3000/books/1
```

#### ✍️ Submit a Review

```bash
curl -X POST http://localhost:3000/books/1/reviews \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"rating":5, "comment":"Loved it!"}'
```

#### 🛠️ Update a Review

```bash
curl -X PUT http://localhost:3000/reviews/1 \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"rating":4, "comment":"Still great!"}'
```

#### ❌ Delete a Review

```bash
curl -X DELETE http://localhost:3000/reviews/1 \
-H "Authorization: Bearer <JWT_TOKEN>"
```

#### 🔎 Search Books

```bash
curl "http://localhost:3000/books/search?query=george"
```

---

## 🧱 API Endpoints Summary

| Method | Endpoint                | Description                             | Auth Required |
| ------ | ----------------------- | --------------------------------------- | ------------- |
| POST   | /signup                 | Register a new user                     | ❌             |
| POST   | /login                  | Authenticate user and get token         | ❌             |
| POST   | /books                  | Add a new book                          | ✅             |
| GET    | /books                  | List all books (with pagination/filter) | ❌             |
| GET    | /books/\:id             | Get book details + reviews              | ❌             |
| POST   | /books/\:id/reviews     | Submit a review (1 per book/user)       | ✅             |
| PUT    | /reviews/\:id           | Update own review                       | ✅             |
| DELETE | /reviews/\:id           | Delete own review                       | ✅             |
| GET    | /books/search?query=... | Search books by title or author         | ❌             |

---


## 💡 Design Decisions & Assumptions

* **Authentication:** All data-changing operations (POST/PUT/DELETE) require a JWT.
* **Reviews:** A user can only review a book once (enforced with a unique constraint).
* **Ratings:** Allowed values range from 1 to 5.
* **Security:** Passwords are hashed with bcrypt before being stored.
* **Database:** PostgreSQL is used via `pg` module. DB URL comes from `.env`.
* **Pagination Defaults:** 10 items per page if not specified.

---

## 📌 To Do / Improvements

* Rate limiting and input validation
* Swagger/OpenAPI documentation
* Unit and integration tests
* Support for updating books
* Like/dislike or vote system for reviews

---

## 👨‍💻 Author

Aditya Choudhary.

Built for educational and practice purposes.

