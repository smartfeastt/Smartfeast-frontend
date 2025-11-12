import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Plus, MapPin, Users, ArrowLeft } from 'react-feather'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerRestaurant() {
  const { restaurantId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOutletName, setNewOutletName] = useState('')
  const [newOutletLocation, setNewOutletLocation] = useState('')

  useEffect(() => {
    fetchRestaurant()
    fetchOutlets()
  }, [restaurantId])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setRestaurant(data.restaurant)
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
    }
  }

  const fetchOutlets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/restaurant/${restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setOutlets(data.outlets || [])
      }
    } catch (error) {
      console.error('Error fetching outlets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOutlet = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/outlet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          restaurantId,
          name: newOutletName,
          location: newOutletLocation,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        setNewOutletName('')
        setNewOutletLocation('')
        fetchOutlets()
        fetchRestaurant()
      } else {
        alert(data.message || 'Failed to create outlet')
      }
    } catch (error) {
      console.error('Error creating outlet:', error)
      alert('Failed to create outlet')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>
  }

  const canCreateOutlet = outlets.length < restaurant.outlet_count

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="text-sm text-gray-300 hover:text-white mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outlets</h2>
            <p className="text-sm text-gray-600">
              {outlets.length} / {restaurant.outlet_count} outlets
            </p>
          </div>
          {canCreateOutlet ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <Plus size={20} />
              Create Outlet
            </button>
          ) : (
            <p className="text-sm text-gray-600">Outlet limit reached</p>
          )}
        </div>

        {outlets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No outlets yet. Create your first outlet!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{outlet.name}</h3>
                {outlet.location && (
                  <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                    <MapPin size={14} />
                    {outlet.location}
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{outlet.managers?.length || 0} Manager(s)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/owner/outlet/${outlet._id}`)}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => navigate(`/view/${restaurant.name}/${outlet.name}`)}
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

      {/* Create Outlet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Outlet</h3>
            <form onSubmit={handleCreateOutlet}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outlet Name
                </label>
                <input
                  type="text"
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newOutletLocation}
                  onChange={(e) => setNewOutletLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
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

