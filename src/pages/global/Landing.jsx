import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Footer from '../../components/global/Footer'
import Header from '../../components/global/Header'
import UserHome from '../user/UserHome.jsx'

export default function Landing() {
  const { user } = useAuth();

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.type === 'user') {
      return <UserHome />;
    } else if (user.type === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    } else if (user.type === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    }
  }
  return (
    <>
    <Header/>
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              SmartFeast
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Order delicious food from your favorite restaurants or manage your business - all in one platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/user/signin"
                className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Order Food
              </Link>
              <Link
                to="/signin"
                className="bg-gray-800 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-700 transition border border-gray-700"
              >
                Business Login
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
            <div className="text-4xl mb-4">🍕</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Wide Selection</h3>
            <p className="text-gray-600">
              Choose from hundreds of restaurants and thousands of dishes to satisfy your cravings
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your food delivered hot and fresh to your doorstep in 30 minutes or less
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy Payment</h3>
            <p className="text-gray-600">
              Multiple payment options including cards, UPI, and cash on delivery
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of satisfied customers and start ordering your favorite food today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/user/signup"
              className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition inline-block"
            >
              Sign Up Now
            </Link>
            <Link
              to="/signup"
              className="bg-transparent text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition inline-block border border-white"
            >
              List Your Restaurant
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
    </>
  )
}

