import { Link } from 'react-router-dom'
import { Search } from 'react-feather'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              SmartFeast
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Restaurant Management Platform - Manage your restaurants, outlets, and menus all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/view"
                className="bg-gray-800 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-700 transition border border-gray-700"
              >
                Browse Restaurants
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Restaurant Management</h3>
            <p className="text-gray-600">
              Create and manage multiple restaurants with multiple outlets from a single dashboard
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Role-Based Access</h3>
            <p className="text-gray-600">
              Assign managers to specific outlets with granular permissions
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Menu Management</h3>
            <p className="text-gray-600">
              Manage menus, prices, availability, and item photos for each outlet
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Contact SmartFeast admin to get your credentials and start managing your restaurants today.
          </p>
          <Link
            to="/login"
            className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

