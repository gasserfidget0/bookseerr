# Bookseerr API Documentation

## Authentication

All API endpoints except `/api/auth/login` and `/api/auth/register` require authentication. Authentication is handled via JWT tokens sent as HTTP-only cookies or Bearer tokens in the Authorization header.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Books API

### Search Books
```http
GET /api/books?query=dune&page=1&limit=20
```

### Get Book Details
```http
GET /api/books/[bookId]
```

### Add Book (Admin Only)
```http
POST /api/books
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "9781234567890",
  "description": "Book description..."
}
```

## Requests API

### List Requests
```http
GET /api/requests?status=pending
```

### Create Request
```http
POST /api/requests
Content-Type: application/json

{
  "bookId": "book_id_here",
  "notes": "Optional request notes"
}
```

### Update Request Status (Admin Only)
```http
PUT /api/requests/[requestId]
Content-Type: application/json

{
  "status": "approved",
  "rejectionReason": "Optional rejection reason"
}
```

For complete API documentation, see the OpenAPI schema at `/api-docs` when running the application.
