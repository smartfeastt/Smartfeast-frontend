import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ArrowLeft } from 'react-feather'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManagerOutlet() {
  const { outletId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [outlet, setOutlet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchOutlet()
  }, [outletId, token])

  const fetchOutlet = async () => {
    try {
      const response = await fetch(`${API_URL}/outlet/${outletId}`)
      const data = await response.json()
      if (data.success) {
        setOutlet(data.outlet)
      }
    } catch (error) {
      console.error('Error fetching outlet:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!outlet) {
    return <div className="min-h-screen flex items-center justify-center">Outlet not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="text-sm text-gray-300 hover:text-white mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">{outlet.name}</h1>
          {outlet.restaurantId && (
            <p className="text-gray-300 text-sm">{outlet.restaurantId.name}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Menu Management</h2>
            <p className="text-gray-600 mb-4">Manage menu items, prices, and availability</p>
            <button
              onClick={() => navigate(`/manager/menu/${outletId}`)}
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Manage Menu
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Outlet Information</h2>
            <div className="space-y-2 text-sm">
              {outlet.location && (
                <p className="text-gray-600">
                  <span className="font-medium">Location:</span> {outlet.location}
                </p>
              )}
              {outlet.restaurantId && (
                <p className="text-gray-600">
                  <span className="font-medium">Restaurant:</span> {outlet.restaurantId.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

