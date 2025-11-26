import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Plus, MapPin,Settings, LogOut } from 'react-feather'
import { Building2 } from 'lucide-react';
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const [outletCount, setOutletCount] = useState(3)

  const { user, token, loading: authLoading, logout } = useAuth()
const [dataLoading, setDataLoading] = useState(true)

useEffect(() => {
  if (authLoading) return

  if (!user || user.type !== 'owner') {
    console.log("user is not an owner")
    navigate('/login')
    return
  }

  fetchRestaurants()
}, [user, token, authLoading])


  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/owner/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      console.log("data received form backend");
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/restaurant/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: newRestaurantName,
          outlet_count: outletCount,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        setNewRestaurantName('')
        setOutletCount(3)
        fetchRestaurants()
      } else {
        alert(data.message || 'Failed to create restaurant')
      }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      alert('Failed to create restaurant')
    }
  }

  
  
  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Restaurant Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Restaurants</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <Plus size={20} />
            Create Restaurant
          </button>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No restaurants yet. Create your first restaurant!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                  <button
                    onClick={() => navigate(`/owner/restaurant/${restaurant._id}`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Settings size={18} />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{restaurant.outlets?.length || 0} Outlets</span>
                  </div>
                  <div>
                    <span>Limit: {restaurant.outlet_count} outlets</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/owner/restaurant/${restaurant._id}`)}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => navigate(`/view/${restaurant.name}`)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Restaurant</h3>
            <form onSubmit={handleCreateRestaurant}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outlet Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={outletCount}
                  onChange={(e) => setOutletCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

