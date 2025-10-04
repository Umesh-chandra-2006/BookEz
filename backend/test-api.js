const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, success, message = '', data = null) {
  const status = success 
    ? `${colors.green}✅ PASSED${colors.reset}` 
    : `${colors.red}❌ FAILED${colors.reset}`;
  
  console.log(`${status} - ${colors.bright}${testName}${colors.reset}${message ? ': ' + message : ''}`);
  
  if (data && process.env.VERBOSE_TESTS) {
    console.log(`   ${colors.blue}Response:${colors.reset}`, JSON.stringify(data, null, 2));
  }
  
  testResults.tests.push({ name: testName, success, message, data });
  testResults.total++;
  if (success) testResults.passed++;
  else testResults.failed++;
}

// Test data with realistic information
const testUser = {
  name: 'Alice Johnson',
  email: `test${Date.now()}@logiksutra.com`, // Unique email
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123'
};

const testBook = {
  title: 'The Art of Clean Code',
  author: 'Robert C. Martin',
  description: 'A comprehensive guide to writing clean, maintainable code that stands the test of time. This book teaches principles and practices for professional software development.',
  genre: 'Technology',
  publishedYear: 2020,
  pages: 464,
  language: 'English',
  publisher: 'Prentice Hall',
  tags: ['programming', 'software', 'development', 'clean code'],
  isbn: '978-0132350884'
};

const testReview = {
  rating: 5,
  reviewText: 'An absolutely fantastic book that every developer should read. The principles taught in this book have significantly improved my coding skills and code quality. Highly recommended for both beginners and experienced developers.',
  title: 'Must-read for every developer!',
  readingStatus: 'completed',
  spoilerAlert: false
};

let authToken = '';
let userId = '';
let bookId = '';
let reviewId = '';

// Helper function to make authenticated requests
const authHeaders = () => ({ headers: { Authorization: `Bearer ${authToken}` } });

async function runTests() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('🚀 LOGIKSUTRA BOOK REVIEW API TESTS');
  console.log('=====================================');
  console.log(`${colors.reset}\n`);

  try {
    // Test 1: Health Check
    console.log(`${colors.magenta}${colors.bright}=== 🏥 HEALTH CHECK ===${colors.reset}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      logTest('Health Check', 
        response.status === 200 && response.data.success, 
        response.data.message,
        { version: response.data.version, environment: response.data.environment }
      );
    } catch (error) {
      logTest('Health Check', false, error.response?.data?.message || error.message);
    }

    // Test 2: Root Endpoint
    try {
      const response = await axios.get('http://localhost:5000/');
      logTest('Root Endpoint', 
        response.status === 200 && response.data.success,
        'API documentation endpoint'
      );
    } catch (error) {
      logTest('Root Endpoint', false, error.response?.data?.message || error.message);
    }

    // Test 3: User Registration
    console.log(`\n${colors.magenta}${colors.bright}=== 👤 AUTHENTICATION TESTS ===${colors.reset}`);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);
      authToken = response.data.token;
      userId = response.data.data.user.id;
      logTest('User Registration', 
        response.status === 201 && response.data.success, 
        `User ${response.data.data.user.name} registered successfully`
      );
    } catch (error) {
      logTest('User Registration', false, error.response?.data?.message || error.message);
    }

    // Test 4: User Login
    try {
      const loginData = { email: testUser.email, password: testUser.password };
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      if (!authToken) {
        authToken = response.data.token;
        userId = response.data.data.user.id;
      }
      logTest('User Login', 
        response.status === 200 && response.data.success, 
        `Welcome back, ${response.data.data.user.name}!`
      );
    } catch (error) {
      logTest('User Login', false, error.response?.data?.message || error.message);
    }

    // Test 5: Get Current User (Protected)
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, authHeaders());
      logTest('Get Current User Profile', 
        response.status === 200 && response.data.success, 
        `Profile for ${response.data.data.user.name}`
      );
    } catch (error) {
      logTest('Get Current User Profile', false, error.response?.data?.message || error.message);
    }

    // Test 6: Get User Statistics
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/stats`, authHeaders());
      logTest('Get User Statistics', 
        response.status === 200 && response.data.success, 
        `Books: ${response.data.data.booksCount}, Reviews: ${response.data.data.reviewsCount}`
      );
    } catch (error) {
      logTest('Get User Statistics', false, error.response?.data?.message || error.message);
    }

    // Test 7: Get All Books (Public)
    console.log(`\n${colors.magenta}${colors.bright}=== 📚 BOOK MANAGEMENT TESTS ===${colors.reset}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/books?page=1&limit=5`);
      logTest('Get All Books (Paginated)', 
        response.status === 200 && response.data.success, 
        `Found ${response.data.count} books (Page ${response.data.pagination.page}/${response.data.pagination.totalPages})`
      );
    } catch (error) {
      logTest('Get All Books (Paginated)', false, error.response?.data?.message || error.message);
    }

    // Test 8: Get Genres
    try {
      const response = await axios.get(`${API_BASE_URL}/books/genres`);
      logTest('Get Book Genres', 
        response.status === 200 && response.data.success, 
        `Found ${response.data.data.genres.length} genres, Total books: ${response.data.data.totalBooks}`
      );
    } catch (error) {
      logTest('Get Book Genres', false, error.response?.data?.message || error.message);
    }

    // Test 9: Get Popular Books
    try {
      const response = await axios.get(`${API_BASE_URL}/books/popular?limit=5`);
      logTest('Get Popular Books', 
        response.status === 200 && response.data.success, 
        `Found ${response.data.count} popular books`
      );
    } catch (error) {
      logTest('Get Popular Books', false, error.response?.data?.message || error.message);
    }

    // Test 10: Create Book (Protected)
    try {
      const response = await axios.post(`${API_BASE_URL}/books`, testBook, authHeaders());
      bookId = response.data.data.book._id;
      logTest('Create Book', 
        response.status === 201 && response.data.success, 
        `Created "${response.data.data.book.title}" by ${response.data.data.book.author}`
      );
    } catch (error) {
      logTest('Create Book', false, error.response?.data?.message || error.message);
    }

    // Test 11: Get Single Book
    if (bookId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/books/${bookId}`);
        logTest('Get Single Book', 
          response.status === 200 && response.data.success, 
          `Retrieved "${response.data.data.book.title}" - ${response.data.data.book.estimatedReadingTime || 'No reading time available'}`
        );
      } catch (error) {
        logTest('Get Single Book', false, error.response?.data?.message || error.message);
      }
    }

    // Test 12: Search Books
    try {
      const response = await axios.get(`${API_BASE_URL}/books/search?q=code&page=1&limit=5`);
      logTest('Search Books', 
        response.status === 200 && response.data.success, 
        `Found ${response.data.count} books matching "code"`
      );
    } catch (error) {
      logTest('Search Books', false, error.response?.data?.message || error.message);
    }

    // Test 13: Update Book (Protected)
    if (bookId) {
      try {
        const updatedBook = { 
          ...testBook, 
          description: 'UPDATED: ' + testBook.description,
          pages: 500
        };
        const response = await axios.put(`${API_BASE_URL}/books/${bookId}`, updatedBook, authHeaders());
        logTest('Update Book', 
          response.status === 200 && response.data.success, 
          'Book updated with new description and page count'
        );
      } catch (error) {
        logTest('Update Book', false, error.response?.data?.message || error.message);
      }
    }

    // Test 14: Create Review (Protected)
    console.log(`\n${colors.magenta}${colors.bright}=== ⭐ REVIEW MANAGEMENT TESTS ===${colors.reset}`);
    if (bookId) {
      try {
        const reviewData = { ...testReview, bookId };
        const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, authHeaders());
        reviewId = response.data.data.review._id;
        logTest('Create Review', 
          response.status === 201 && response.data.success, 
          `${testReview.rating}-star review: "${response.data.data.review.title}"`
        );
      } catch (error) {
        logTest('Create Review', false, error.response?.data?.message || error.message);
      }
    }

    // Test 15: Get Reviews for Book
    if (bookId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/reviews/book/${bookId}?page=1&limit=5`);
        logTest('Get Reviews for Book', 
          response.status === 200 && response.data.success, 
          `Found ${response.data.count} reviews. Avg rating: ${response.data.data.ratingStats.averageRating}`
        );
      } catch (error) {
        logTest('Get Reviews for Book', false, error.response?.data?.message || error.message);
      }
    }

    // Test 16: Get Average Rating
    if (bookId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/reviews/average/${bookId}`);
        logTest('Get Average Rating', 
          response.status === 200 && response.data.success, 
          `Average: ${response.data.data.averageRating}/5 (${response.data.data.totalReviews} reviews)`
        );
      } catch (error) {
        logTest('Get Average Rating', false, error.response?.data?.message || error.message);
      }
    }

    // Test 17: Check User Review
    if (bookId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/reviews/check/${bookId}`, authHeaders());
        logTest('Check User Review Status', 
          response.status === 200 && response.data.success, 
          `Has reviewed: ${response.data.data.hasReviewed}`
        );
      } catch (error) {
        logTest('Check User Review Status', false, error.response?.data?.message || error.message);
      }
    }

    // Test 18: Get My Reviews (Protected)
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/my/reviews?page=1&limit=5`, authHeaders());
      logTest('Get My Reviews', 
        response.status === 200 && response.data.success, 
        `Found ${response.data.count} of your reviews`
      );
    } catch (error) {
      logTest('Get My Reviews', false, error.response?.data?.message || error.message);
    }

    // Test 19: Update Review (Protected)
    if (reviewId) {
      try {
        const updatedReview = { 
          ...testReview, 
          reviewText: 'UPDATED: ' + testReview.reviewText,
          rating: 4
        };
        const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, updatedReview, authHeaders());
        logTest('Update Review', 
          response.status === 200 && response.data.success, 
          `Updated rating to ${updatedReview.rating} stars`
        );
      } catch (error) {
        logTest('Update Review', false, error.response?.data?.message || error.message);
      }
    }

    // Test 20: Get Books by User
    if (userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/books/user/${userId}?page=1&limit=5`);
        logTest('Get Books by User', 
          response.status === 200 && response.data.success, 
          `User ${response.data.data.user.name} has ${response.data.count} books`
        );
      } catch (error) {
        logTest('Get Books by User', false, error.response?.data?.message || error.message);
      }
    }

    // Test 21: Update User Profile
    try {
      const updateData = { name: 'Alice Updated Johnson' };
      const response = await axios.put(`${API_BASE_URL}/auth/updatedetails`, updateData, authHeaders());
      logTest('Update User Profile', 
        response.status === 200 && response.data.success, 
        `Name updated to: ${response.data.data.user.name}`
      );
    } catch (error) {
      logTest('Update User Profile', false, error.response?.data?.message || error.message);
    }

    // Test 22: Test Invalid Routes (404)
    console.log(`\n${colors.magenta}${colors.bright}=== 🚫 ERROR HANDLING TESTS ===${colors.reset}`);
    try {
      await axios.get(`${API_BASE_URL}/nonexistent`);
      logTest('404 Error Handling', false, 'Should have returned 404');
    } catch (error) {
      logTest('404 Error Handling', 
        error.response?.status === 404, 
        error.response?.data?.message || 'Route not found'
      );
    }

    // Test 23: Test Unauthorized Access
    try {
      await axios.post(`${API_BASE_URL}/books`, testBook); // No auth token
      logTest('Unauthorized Access Protection', false, 'Should have been blocked');
    } catch (error) {
      logTest('Unauthorized Access Protection', 
        error.response?.status === 401, 
        'Protected route properly secured'
      );
    }

    // Cleanup Tests
    console.log(`\n${colors.magenta}${colors.bright}=== 🧹 CLEANUP TESTS ===${colors.reset}`);
    
    // Test 24: Delete Review (Protected)
    if (reviewId) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, authHeaders());
        logTest('Delete Review', 
          response.status === 200 && response.data.success, 
          'Review deleted successfully'
        );
      } catch (error) {
        logTest('Delete Review', false, error.response?.data?.message || error.message);
      }
    }

    // Test 25: Delete Book (Protected)
    if (bookId) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/books/${bookId}`, authHeaders());
        logTest('Delete Book', 
          response.status === 200 && response.data.success, 
          'Book and associated reviews deleted'
        );
      } catch (error) {
        logTest('Delete Book', false, error.response?.data?.message || error.message);
      }
    }

    // Test 26: Logout (Protected)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, authHeaders());
      logTest('User Logout', 
        response.status === 200 && response.data.success, 
        'Successfully logged out'
      );
    } catch (error) {
      logTest('User Logout', false, error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Unexpected error during testing:${colors.reset}`, error.message);
  }

  // Print final results
  console.log(`\n${colors.cyan}${colors.bright}`);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.blue}📈 Total Tests: ${testResults.total}${colors.reset}`);
  console.log(`${colors.yellow}🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%${colors.reset}`);

  if (testResults.failed > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  FAILED TESTS DETAILS:${colors.reset}`);
    console.log(`${colors.red}========================${colors.reset}`);
    testResults.tests
      .filter(test => !test.success)
      .forEach((test, index) => {
        console.log(`${colors.red}${index + 1}. ${test.name}${colors.reset}`);
        console.log(`   ${colors.white}Error: ${test.message}${colors.reset}`);
      });
  }

  // Performance summary
  const passRate = (testResults.passed / testResults.total) * 100;
  if (passRate >= 90) {
    console.log(`\n${colors.green}${colors.bright}🎉 EXCELLENT! API is working perfectly!${colors.reset}`);
  } else if (passRate >= 75) {
    console.log(`\n${colors.yellow}${colors.bright}👍 GOOD! Minor issues to address.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️  NEEDS ATTENTION! Several issues detected.${colors.reset}`);
  }

  console.log(`\n${colors.cyan}${colors.bright}🚀 Logiksutra Book Review API Testing Complete!${colors.reset}\n`);
}

// Run tests with error handling
runTests().catch(error => {
  console.error(`${colors.red}❌ Test suite failed:${colors.reset}`, error.message);
  process.exit(1);
});
