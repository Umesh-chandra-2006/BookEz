import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  BookOpen, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        setSuccess(`Welcome back, ${result.user.name}!`)
        setFormData({ email: '', password: '' })
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpen className={`h-16 w-16 ${theme.text.accent}`} />
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${theme.text.primary}`}>
            Welcome Back to BookEz
          </h2>
          <p className={`mt-2 text-sm ${theme.text.secondary}`}>
            Sign in to your account and discover amazing books
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`
                  appearance-none relative block w-full px-4 py-3 border
                  ${theme.border.primary} placeholder-gray-500 ${theme.text.primary}
                  ${theme.bg.secondary} rounded-lg focus:outline-none focus:ring-2
                  focus:ring-blue-500 focus:border-transparent transition-all
                  duration-200 text-sm
                `}
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${theme.text.primary} mb-2`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    appearance-none relative block w-full px-4 py-3 pr-12 border
                    ${theme.border.primary} placeholder-gray-500 ${theme.text.primary}
                    ${theme.bg.secondary} rounded-lg focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent transition-all
                    duration-200 text-sm
                  `}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`
                    absolute inset-y-0 right-0 pr-3 flex items-center
                    ${theme.text.secondary} hover:${theme.text.primary}
                    transition-colors duration-200
                  `}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center py-3 px-4 border border-transparent
                text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                duration-200 transform hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className={`${theme.text.accent} hover:underline transition-colors duration-200`}
            >
              Forgot your password?
            </Link>
            <div className={`${theme.text.secondary}`}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className={`${theme.text.accent} hover:underline font-medium transition-colors duration-200`}
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
