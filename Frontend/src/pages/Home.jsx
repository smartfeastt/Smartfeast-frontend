import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Link } from 'react-router-dom'
import { Search, Star, Heart } from 'react-feather'

export default function Home() {
  useEffect(() => {
    AOS.init()
  }, [])

  return (
    <>
      <Navbar
        title="QRMenu"
        right={
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Log In
            </Link>
            <Link to="/signup" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700">
              Sign Up
            </Link>
          </div>
        }
      />

      {/* Hero */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Discover local restaurants</span>
              <span className="block text-gray-600">Scan & Order with QR</span>
            </h1>
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  className="focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 pr-12 py-4 border-gray-300 rounded-md"
                  placeholder="Search restaurants..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700">Search</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: '☕', label: 'Café' },
            { icon: '🍕', label: 'Italian' },
            { icon: '🍗', label: 'Fast Food' },
            { icon: '🍽️', label: 'Fine Dining' },
            { icon: '🌞', label: 'Vegan' },
            { icon: '🏅', label: 'Premium' },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div className="text-gray-600 w-8 h-8 mb-2 text-2xl leading-none">{c.icon}</div>
              <span className="text-sm font-medium text-gray-700">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nearby Restaurants</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">Filter</button>
            <button className="px-3 py-1 bg-gray-800 text-white rounded-md text-sm">Sort</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            className="restaurant-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            data-aos="fade-up"
          >
            <div className="relative h-48 bg-gray-200">
              <img
                src="http://static.photos/restaurant/640x360/1"
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                <Heart className="text-gray-600 w-4 h-4" />
              </div>
              <div className="qr-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-center mt-2 text-gray-600">Tap to view</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">The Urban Eatery</h3>
                  <p className="text-sm text-gray-500">Modern • American • $$</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.5</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Contemporary dining with locally sourced ingredients and craft cocktails.
              </p>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">32 items</span>
                <Link to="/menu" className="text-gray-800 font-medium hover:text-gray-900">
                  View Menu
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="restaurant-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            data-aos="fade-up"
            data-aos-delay="50"
          >
            <div className="relative h-48 bg-gray-200">
              <img
                src="http://static.photos/restaurant/640x360/2"
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                <Heart className="text-gray-600 w-4 h-4" />
              </div>
              <div className="qr-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-center mt-2 text-gray-600">Tap to view</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">Pasta Palace</h3>
                  <p className="text-sm text-gray-500">Italian • $$</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.7</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Authentic Italian cuisine with homemade pasta and wood-fired pizzas.
              </p>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">28 items</span>
                <Link to="/menu" className="text-gray-800 font-medium hover:text-gray-900">
                  View Menu
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="restaurant-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="relative h-48 bg-gray-200">
              <img
                src="http://static.photos/restaurant/640x360/3"
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                <Heart className="text-gray-600 w-4 h-4" />
              </div>
              <div className="qr-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-center mt-2 text-gray-600">Tap to view</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">Green Leaf Café</h3>
                  <p className="text-sm text-gray-500">Vegan • Healthy • $</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.8</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Plant-based dishes with organic ingredients and cold-pressed juices.
              </p>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">24 items</span>
                <Link to="/menu" className="text-gray-800 font-medium hover:text-gray-900">
                  View Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Own a Restaurant?</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Get started with QR Menu for free and provide your customers with a seamless digital ordering experience.
          </p>
          <button className="bg-white text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-100">
            Get Started Free
          </button>
        </div>
      </div>

      <Footer />
    </>
  )
}
