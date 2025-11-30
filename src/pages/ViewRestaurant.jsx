import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, ArrowRight, ArrowLeft } from 'react-feather'
import DynamicHeader from '../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function ViewRestaurant() {
  const { restaurantName } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurant()
  }, [restaurantName])

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
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
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
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
              >
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

