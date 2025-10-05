# 🚀 Logiksutra Book Review Platform - Frontend

A modern React frontend for the Book Review Platform built with Vite, Tailwind CSS, and modern React patterns.

## 🛠 Tech Stack

- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd "D:/Logiksutra- Book Review/frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx      ✅ Complete
│   │   ├── Register.jsx   ✅ Complete
│   │   ├── Dashboard.jsx  ✅ Complete
│   │   ├── Books.jsx      🚧 Placeholder
│   │   ├── BookDetails.jsx 🚧 Placeholder
│   │   ├── AddBook.jsx    🚧 Placeholder
│   │   └── Profile.jsx    🚧 Placeholder
│   ├── services/         # API services
│   │   └── api.js        ✅ Complete
│   ├── utils/            # Utility functions
│   ├── App.jsx          ✅ Complete
│   ├── main.jsx         ✅ Complete
│   └── index.css        ✅ Complete
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Features Implemented

### ✅ **Completed Features:**
- **Authentication System**
  - User registration with validation
  - User login with secure token handling
  - Protected routes with authentication checks
  - Automatic token management and refresh

- **Navigation**
  - Responsive navbar with user menu
  - Dynamic navigation based on auth state
  - Clean, modern UI with Tailwind CSS

- **Dashboard**
  - User statistics display
  - Recent books and reviews
  - Quick action buttons
  - Responsive grid layout

- **API Integration**
  - Complete API service layer
  - Axios interceptors for auth
  - Error handling and loading states
  - Token management

### 🚧 **In Progress:**
- Books listing and search
- Book details and reviews
- Add/Edit book functionality
- User profile management

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Custom color palette** with primary brand colors
- **Responsive design** for mobile and desktop
- **Dark/Light mode support** (configured in CSS)

## 🔐 Authentication Flow

1. **Registration/Login** → JWT token stored in localStorage
2. **API Requests** → Token automatically added via Axios interceptors
3. **Route Protection** → ProtectedRoute component checks authentication
4. **Token Expiry** → Automatic redirect to login on 401 errors

## 🌐 API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`:

- **Auth Endpoints** - Login, register, profile management
- **Books Endpoints** - CRUD operations, search, filtering
- **Reviews Endpoints** - Create, read, update, delete reviews
- **Error Handling** - Centralized error handling with user feedback

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind CSS
- **Breakpoint system** for tablet and desktop
- **Touch-friendly** interfaces for mobile users
- **Accessible** components with proper ARIA labels

## 🚀 Next Steps

1. **Complete remaining pages:**
   - Books listing with search and filters
   - Book details with reviews section
   - Add/Edit book forms
   - User profile management

2. **Enhanced features:**
   - Image upload for book covers
   - Advanced search filters
   - User avatars and preferences
   - Real-time notifications

3. **Performance optimizations:**
   - Code splitting
   - Image optimization
   - Caching strategies
   - Bundle analysis

## 🤝 Development Workflow

1. **Start backend server** on port 5000
2. **Start frontend server** on port 3000
3. **API proxy** configured in vite.config.js
4. **Hot reload** enabled for development
5. **ESLint** configured for code quality

## 🎯 Current Status

**Frontend Status: 70% Complete**
- ✅ Core authentication system
- ✅ Basic navigation and routing
- ✅ Dashboard with user stats
- ✅ API integration layer
- 🚧 Books and reviews UI (in progress)
- 🚧 Advanced features (planned)

The frontend is ready for development and testing of authentication features. The dashboard provides a good overview of user activity and the foundation is solid for building out the remaining features.

## 🔗 Related

- **Backend API**: `../backend/` - Node.js + Express + MongoDB
- **API Documentation**: `../backend/POSTMAN_TESTING_GUIDE.md`
- **Postman Collection**: `../backend/Logiksutra-Book-Review-API.postman_collection.json`

# Frontend folder for React app
