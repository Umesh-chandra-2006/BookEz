import React from 'react'
import { Star } from 'lucide-react'

const StarRating = ({ rating = 0, onRatingChange, readonly = false, max = 5 }) => {
  const handleClick = (index) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1)
    }
  }

  return (
    <div className="flex items-center">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 cursor-pointer transition-colors ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          onClick={() => handleClick(i)}
          fill={i < rating ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default StarRating
