import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Clock, User, ShoppingCart, LogOut } from "react-feather";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import Cart from "../../components/Cart.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserHome() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { getTotalItems, toggleCart } = useCart();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/all`);
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                SmartFeast
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <User size={16} />
                    Welcome, {user.name || user.email.split('@')[0]}!
                  </span>
                  <button
                    onClick={toggleCart}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ShoppingCart size={24} />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/user/signin"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/user/signup"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Delicious Food, Delivered Fast
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Discover amazing restaurants and order your favorite meals with just a few clicks
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Restaurants"}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No restaurants found matching your search." : "No restaurants available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
                  to={`/view/${restaurant.name}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>4.5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>25-35 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.outlets?.length || 0} outlets</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      Delicious food and great service. Order now and enjoy!
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      <Cart />
    </div>
  );
}
