# 🚀 Logiksutra Book Review API - Postman Testing Guide

## 📋 Overview
This guide provides step-by-step instructions for testing the Logiksutra Book Review Platform API using Postman. The collection includes all 26 endpoints with automatic variable management and comprehensive test scenarios.

## 📁 Files Included
- `Logiksutra-Book-Review-API.postman_collection.json` - Complete API collection
- `Logiksutra-Book-Review-Local.postman_environment.json` - Local environment variables

## 🔧 Setup Instructions

### 1. Import Collection and Environment
1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Logiksutra-Book-Review-API.postman_collection.json`
   - `Logiksutra-Book-Review-Local.postman_environment.json`
4. Select the "Logiksutra Book Review - Local" environment

⚠️ **SECURITY NOTE**: The Postman collection contains example credentials (e.g., `password: "password123"`). These are for testing purposes only and should NEVER be used in production or with real user data. Always use unique, strong passwords for actual user accounts.

### 2. Start the API Server
```bash
cd backend
npm start
```
Server should be running on `http://localhost:5000`

## 📊 API Endpoints Overview

### 🏥 Health Check (2 endpoints)
- **Health Check** - `GET /api/health`
- **Root Endpoint** - `GET /api/`

### 👤 Authentication (6 endpoints)
- **Register User** - `POST /api/auth/register`
- **Login User** - `POST /api/auth/login`
- **Get Current User Profile** - `GET /api/auth/profile`
- **Update User Profile** - `PUT /api/auth/profile`
- **Get User Statistics** - `GET /api/auth/stats`
- **Logout User** - `POST /api/auth/logout`

### 📚 Book Management (9 endpoints)
- **Get All Books (Paginated)** - `GET /api/books`
- **Search Books** - `GET /api/books/search`
- **Get Book Genres** - `GET /api/books/genres`
- **Get Popular Books** - `GET /api/books/popular`
- **Create Book** - `POST /api/books`
- **Get Single Book** - `GET /api/books/:id`
- **Update Book** - `PUT /api/books/:id`
- **Get Books by User** - `GET /api/books/user/:userId`
- **Delete Book** - `DELETE /api/books/:id`

### ⭐ Review Management (11 endpoints)
- **Create Review** - `POST /api/reviews`
- **Get Reviews for Book** - `GET /api/reviews/book/:bookId`
- **Get Reviews by User** - `GET /api/reviews/user/:userId`
- **Get My Reviews** - `GET /api/reviews/my/reviews`
- **Get Single Review** - `GET /api/reviews/:id`
- **Update Review** - `PUT /api/reviews/:id`
- **Get Average Rating** - `GET /api/reviews/average/:bookId`
- **Check User Review Status** - `GET /api/reviews/check/:bookId`
- **Mark Review as Helpful** - `POST /api/reviews/:id/helpful`
- **Get Helpful Reviews** - `GET /api/reviews/helpful`
- **Delete Review** - `DELETE /api/reviews/:id`

### 🚫 Error Handling (4 endpoints)
- **404 - Route Not Found**
- **401 - Unauthorized Access**
- **400 - Invalid Book ID**
- **400 - Invalid Review Data**

## 🎯 Testing Workflow

### Step 1: Authentication Flow
1. **Register User** - Creates a new user account
   - Automatically sets `authToken` and `userId` variables
2. **Login User** - Login with existing credentials
   - Updates `authToken` and `userId` variables
3. **Get Current User Profile** - Verify authentication

### Step 2: Book Management Flow
1. **Create Book** - Add a new book
   - Automatically sets `bookId` variable
2. **Get All Books** - View paginated book list
3. **Search Books** - Test search functionality
4. **Get Single Book** - View book details
5. **Update Book** - Modify book information

### Step 3: Review Management Flow
1. **Create Review** - Add a review for the book
   - Automatically sets `reviewId` variable
2. **Get Reviews for Book** - View all reviews for the book
3. **Get My Reviews** - View current user's reviews
4. **Update Review** - Modify the review
5. **Mark Review as Helpful** - Test helpful voting

### Step 4: Clean Up (Optional)
1. **Delete Review** - Remove the test review
2. **Delete Book** - Remove the test book
3. **Logout User** - End the session

## 🔐 Authentication
The collection uses Bearer Token authentication. After successful registration or login, the `authToken` variable is automatically set and used for protected endpoints.

## 📝 Variable Management
The collection automatically manages these variables:
- `baseUrl` - API base URL (http://localhost:5000/api)
- `authToken` - JWT authentication token
- `userId` - Current user ID
- `bookId` - Current book ID for testing
- `reviewId` - Current review ID for testing

## 🔍 Testing Tips

### 1. Sequential Testing
Run requests in the suggested order for the best experience, as later requests depend on data created by earlier ones.

### 2. Environment Variables
Variables are automatically updated after successful requests. You can also manually set them in the environment.

### 3. Error Testing
The "Error Handling & Edge Cases" folder contains requests designed to test error scenarios and validation.

### 4. Pagination Testing
Many endpoints support pagination. Test with different `page`, `limit`, `sortBy`, and `sortOrder` parameters.

### 5. Search Testing
Test the search functionality with various queries:
- Book title keywords
- Author names
- Genre filters
- Tag searches

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // For validation errors
}
```

## 🐛 Troubleshooting

### Common Issues
1. **Server not running** - Ensure the API server is started on port 5000
2. **Authentication failed** - Check if `authToken` is set correctly
3. **404 errors** - Verify the endpoint URLs match the API routes
4. **Validation errors** - Check request body format and required fields

### Debug Steps
1. Check server console for error messages
2. Verify environment variables are set
3. Test with Postman Console for detailed request/response info
4. Compare with the automated test results (`node test-api.js`)

## 🎉 Happy Testing!
This collection provides comprehensive coverage of all API endpoints. Use it to validate functionality, test edge cases, and ensure the API meets your requirements.

For any issues or questions, refer to the API documentation or check the server logs for detailed error information.
