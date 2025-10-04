const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  isHelpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful votes cannot be negative']
  },
  isReported: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  readingStatus: {
    type: String,
    enum: ['completed', 'reading', 'want-to-read'],
    default: 'completed'
  },
  spoilerAlert: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true }); // One review per user per book
reviewSchema.index({ bookId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isActive: 1, createdAt: -1 });
reviewSchema.index({ bookId: 1, isActive: 1, rating: -1 });

// Virtual for days since review
reviewSchema.virtual('daysSinceReview').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Ensure rating is within bounds
  if (this.rating < 1) this.rating = 1;
  if (this.rating > 5) this.rating = 5;
  
  // Ensure helpful votes is not negative
  if (this.isHelpful < 0) this.isHelpful = 0;
  
  next();
});

// Static method to calculate and update average rating for a book
reviewSchema.statics.calcAverageRating = async function(bookId) {
  try {
    const stats = await this.aggregate([
      { 
        $match: { 
          bookId: new mongoose.Types.ObjectId(bookId),
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$bookId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length > 0) {
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      stats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });

      const Book = mongoose.model('Book');
      await Book.findByIdAndUpdate(bookId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews
      });

      return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution: distribution
      };
    } else {
      // No active reviews found, reset to 0
      const Book = mongoose.model('Book');
      await Book.findByIdAndUpdate(bookId, {
        averageRating: 0,
        totalReviews: 0
      });

      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
};

// Static method to get rating statistics for a book
reviewSchema.statics.getRatingStats = async function(bookId) {
  try {
    const stats = await this.aggregate([
      { 
        $match: { 
          bookId: new mongoose.Types.ObjectId(bookId),
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let totalRating = 0;

    stats.forEach(stat => {
      distribution[stat._id] = stat.count;
      totalReviews += stat.count;
      totalRating += stat._id * stat.count;
    });

    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

    return {
      averageRating,
      totalReviews,
      ratingDistribution: distribution
    };
  } catch (error) {
    console.error('Error getting rating stats:', error);
    throw error;
  }
};

// Static method to find helpful reviews
reviewSchema.statics.findHelpful = function(bookId, limit = 5) {
  return this.find({ bookId, isActive: true })
    .sort({ isHelpful: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name createdAt');
};

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = function() {
  this.isHelpful += 1;
  return this.save();
};

// Calculate average rating after save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.bookId);
});

// Calculate average rating after remove
reviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.bookId);
});

// Calculate average rating after findOneAndDelete
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.bookId);
  }
});

// Calculate average rating after findOneAndUpdate
reviewSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.bookId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
