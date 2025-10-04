const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    minlength: [1, 'Author name must be at least 1 character long'],
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: {
      values: [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
        'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
        'Thriller', 'Horror', 'Children', 'Young Adult', 'Poetry',
        'Philosophy', 'Psychology', 'Health', 'Travel', 'Cooking',
        'Art', 'Religion', 'Politics', 'Technology', 'Education', 'Other'
      ],
      message: 'Please select a valid genre'
    },
    index: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be after 1000'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: 'Published year must be a whole number'
    },
    index: true
  },
  isbn: {
    type: String,
    trim: true,
    match: [/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/, 'Please enter a valid ISBN'],
    sparse: true // Allow multiple null values but unique non-null values
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
    max: [10000, 'Pages cannot exceed 10,000']
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Book must have an owner']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    index: true
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  coverImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1, averageRating: -1 });
bookSchema.index({ publishedYear: -1, averageRating: -1 });
bookSchema.index({ addedBy: 1, createdAt: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isActive: 1, averageRating: -1 });

// Virtual for reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bookId'
});

// Virtual for review count (alternative to totalReviews field)
bookSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bookId',
  count: true
});

// Pre-save middleware to ensure data consistency
bookSchema.pre('save', function(next) {
  // Ensure averageRating is within bounds
  if (this.averageRating < 0) this.averageRating = 0;
  if (this.averageRating > 5) this.averageRating = 5;
  
  // Ensure totalReviews is not negative
  if (this.totalReviews < 0) this.totalReviews = 0;
  
  // Convert tags to lowercase for consistency
  if (this.tags && this.tags.length > 0) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  }
  
  next();
});

// Static method to find popular books
bookSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .populate('addedBy', 'name');
};

// Static method to find recent books
bookSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('addedBy', 'name');
};

// Static method to find books by genre
bookSchema.statics.findByGenre = function(genre, limit = 10) {
  return this.find({ genre, isActive: true })
    .sort({ averageRating: -1 })
    .limit(limit)
    .populate('addedBy', 'name');
};

// Instance method to calculate reading time (assuming 200 words per minute)
bookSchema.methods.estimatedReadingTime = function() {
  if (!this.pages) return null;
  
  const wordsPerPage = 250;
  const wordsPerMinute = 200;
  const totalWords = this.pages * wordsPerPage;
  const minutes = Math.ceil(totalWords / wordsPerMinute);
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
