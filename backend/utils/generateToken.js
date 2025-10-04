const jwt = require('jsonwebtoken');

// Generate JWT token with additional payload
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || 'user'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'logiksutra-book-review',
    audience: 'logiksutra-users'
  });
};

// Send token response with enhanced security
const sendTokenResponse = (user, statusCode, res, message = '') => {
  // Create token
  const token = generateToken(user);

  // Cookie options with enhanced security
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // CSRF protection
    path: '/' // Cookie available for entire domain
  };

  // Update user's last login
  if (user.updateLastLogin) {
    user.updateLastLogin().catch(err => {
      console.error('Error updating last login:', err);
    });
  }

  // Prepare user data (without sensitive information)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    isActive: user.isActive,
    booksCount: user.booksCount || 0,
    reviewsCount: user.reviewsCount || 0,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message: message || 'Authentication successful',
      token,
      expiresIn: process.env.JWT_EXPIRE || '7d',
      data: {
        user: userData
      }
    });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'logiksutra-book-review',
      audience: 'logiksutra-users'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate refresh token (for future implementation)
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'logiksutra-book-review',
    audience: 'logiksutra-users'
  });
};

// Clear authentication cookie
const clearTokenCookie = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

// Generate password reset token (for future implementation)
const generatePasswordResetToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'password-reset',
    timestamp: Date.now()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h', // Short expiry for security
    issuer: 'logiksutra-book-review',
    audience: 'logiksutra-users'
  });
};

module.exports = {
  generateToken,
  sendTokenResponse,
  verifyToken,
  generateRefreshToken,
  clearTokenCookie,
  generatePasswordResetToken
};
