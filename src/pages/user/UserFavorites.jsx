import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Clock, Trash2, Loader } from "react-feather";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserFavorites() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (token && user?.type === 'user') {
      fetchFavorites();
    }
  }, [token, user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/favorite`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (restaurantId) => {
    try {
      setRemoving(restaurantId);
      const response = await fetch(`${API_URL}/api/favorite/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFavorites(prev => prev.filter(fav => fav._id !== restaurantId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-2">Your favorite restaurants</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">
              Start exploring restaurants and add them to your favorites!
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <Link to={`/view/${restaurant.name}`}>
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                    {(restaurant?.restaurantImage || restaurant?.profilePhotoUrl || restaurant?.image) && (
                      <img
                        src={restaurant.restaurantImage || restaurant.profilePhotoUrl || restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{restaurant.name}</h3>
                    </div>
                  </div>
                </Link>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(restaurant._id);
                      }}
                      disabled={removing === restaurant._id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove from favorites"
                    >
                      {removing === restaurant._id ? (
                        <Loader className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                  
                  <Link to={`/view/${restaurant.name}`}>
                    <button className="w-full mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                      View Menu
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

