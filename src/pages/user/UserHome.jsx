import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Clock, Map, Grid } from "react-feather";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";
import GoogleMap from "../../components/maps/GoogleMap.jsx";
import {
  fetchPublicRestaurants,
  setSearchQuery,
  selectFilteredRestaurants,
  selectPublicRestaurantLoading,
  selectPublicRestaurantError,
  selectSearchQuery,
  selectIsDataStale,
} from "../../store/slices/publicRestaurantSlice.js";

const API_URL = import.meta.env.VITE_API_URL;

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function UserHome() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [outlets, setOutlets] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingOutlets, setLoadingOutlets] = useState(false);

  // Redux state
  const filteredRestaurants = useAppSelector(selectFilteredRestaurants);
  const loading = useAppSelector(selectPublicRestaurantLoading);
  const error = useAppSelector(selectPublicRestaurantError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const isDataStale = useAppSelector(selectIsDataStale);

  // Fetch restaurants on mount or if data is stale
  useEffect(() => {
    if (isDataStale) {
      dispatch(fetchPublicRestaurants());
    }
  }, [dispatch, isDataStale]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch outlets for map
  useEffect(() => {
    if (viewMode === 'map') {
      fetchOutletsForMap();
    }
  }, [viewMode, userLocation]);

  const fetchOutletsForMap = async () => {
    try {
      setLoadingOutlets(true);
      let url = `${API_URL}/api/outlet/all/map`;
      if (userLocation) {
        url += `?latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setOutlets(data.outlets || []);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setLoadingOutlets(false);
    }
  };

  const handleOutletClick = (outlet) => {
    if (outlet.restaurantId?.name) {
      navigate(`/view/${outlet.restaurantId.name}/${outlet.name}`);
    }
  };

  // Sort restaurants by distance if user location available
  const sortedRestaurants = [...filteredRestaurants].map(restaurant => {
    if (userLocation && restaurant.outlets?.length > 0) {
      // Find nearest outlet
      const nearestOutlet = restaurant.outlets
        .filter(outlet => outlet.coordinates?.latitude && outlet.coordinates?.longitude)
        .map(outlet => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            outlet.coordinates.latitude,
            outlet.coordinates.longitude
          );
          return { ...outlet, distance };
        })
        .sort((a, b) => a.distance - b.distance)[0];
      
      return { ...restaurant, distance: nearestOutlet?.distance };
    }
    return restaurant;
  }).sort((a, b) => {
    if (a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DynamicHeader />

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
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Restaurants"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Map View"
              >
                <Map size={20} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
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
          ) : viewMode === 'map' ? (
            <div className="bg-white rounded-lg shadow-lg p-4">
              {loadingOutlets ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              ) : (
                <GoogleMap
                  outlets={outlets}
                  onOutletClick={handleOutletClick}
                  userLocation={userLocation}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRestaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
                  to={`/view/${restaurant.name}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                    {(restaurant?.restaurantImage || restaurant?.profilePhotoUrl || restaurant?.image) ? (
                      <img
                        src={restaurant.restaurantImage || restaurant.profilePhotoUrl || restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '';
                        }}
                      />
                    ) : null}
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
                      {restaurant.distance && (
                        <div className="flex items-center gap-1 text-green-600">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.distance.toFixed(1)} km away</span>
                        </div>
                      )}
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
    </div>
  );
}