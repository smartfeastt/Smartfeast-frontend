import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, ArrowRight, ArrowLeft, Heart } from 'react-feather'
import { useAppSelector } from '../store/hooks.js'
import DynamicHeader from '../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function ViewRestaurant() {
  const { restaurantName } = useParams()
  const { token, user } = useAppSelector((state) => state.auth)
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    fetchRestaurant()
  }, [restaurantName])

  useEffect(() => {
    if (restaurant && token && user?.type === 'user') {
      checkFavorite()
    }
  }, [restaurant, token, user])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/name/${restaurantName}`)
      const data = await response.json()
      if (data.success) {
        setRestaurant(data.restaurant)
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    if (!restaurant?._id) return
    try {
      const response = await fetch(`${API_URL}/api/favorite/check/${restaurant._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!restaurant?._id || !token || user?.type !== 'user') {
      alert('Please sign in to add favorites')
      return
    }
    
    try {
      setFavoriteLoading(true)
      if (isFavorite) {
        const response = await fetch(`${API_URL}/api/favorite/${restaurant._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorite(false)
        }
      } else {
        const response = await fetch(`${API_URL}/api/favorite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantId: restaurant._id }),
        })
        const data = await response.json()
        if (data.success) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorite. Please try again.')
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
          <Link to="/view" className="text-blue-600 hover:underline">Back to restaurants</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* Restaurant Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Restaurant Image */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={restaurant?.restaurantImage || restaurant?.profilePhotoUrl || restaurant?.image || "https://via.placeholder.com/300"}
                  alt={restaurant?.name || "Restaurant"}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>
            </div>
            
            {/* Restaurant Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                {user?.type === 'user' && (
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Outlets</h2>
        
            {restaurant.outlets && restaurant.outlets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurant.outlets.map((outlet) => (
              <Link
                key={outlet._id}
                to={`/view/${restaurantName}/${outlet.name}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition block"
              >
                {/* Outlet Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={outlet?.outletImage || outlet?.profilePhotoUrl || outlet?.image || "https://via.placeholder.com/300"}
                    alt={outlet?.name || "Outlet"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{outlet.name}</h3>
                  </div>
                  {outlet.location && (
                    <p className="text-sm text-gray-600 mb-4">{outlet.location}</p>
                  )}
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">View Menu</span>
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No outlets available</p>
          </div>
        )}
      </div>
    </div>
  )
}

