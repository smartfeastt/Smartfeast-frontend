import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MapPin, LogOut, Menu } from 'react-feather'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManagerDashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== 'manager') {
      navigate('/login')
      return
    }
    fetchOutlets()
  }, [user, token])

  const fetchOutlets = async () => {
    try {
      // Fetch each outlet that the manager is assigned to
      const outletPromises = (user.managedOutlets || []).map(async (outletId) => {
        const response = await fetch(`${API_URL}/outlet/${outletId}`)
        const data = await response.json()
        return data.outlet
      })
      const outletsData = await Promise.all(outletPromises)
      setOutlets(outletsData.filter(Boolean))
    } catch (error) {
      console.error('Error fetching outlets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">SmartFeast - Manager Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Outlets</h2>

        {outlets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No outlets assigned yet. Contact the owner to get assigned to an outlet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {outlet.restaurantId?.name || 'Restaurant'}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{outlet.name}</span>
                  </div>
                  {outlet.location && (
                    <p className="text-xs text-gray-500">{outlet.location}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/manager/outlet/${outlet._id}`)}
                  className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Menu size={18} />
                  Manage Menu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

