import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Plus, Users, ArrowLeft, UserPlus, X } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerOutlet() {
  const { outletId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [outlet, setOutlet] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')

  useEffect(() => {
    fetchOutlet()
    // fetchItems()
  }, [outletId])

  const fetchOutlet = async () => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
      });
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

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/item/outlet/${outletId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ✅ include token here
        },
      })
      
      const data = await response.json()
      if (data.success) {
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleAssignManager = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}/assign-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          managerEmail,
          managerPassword,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowAssignModal(false)
        setManagerEmail('')
        setManagerPassword('')
        fetchOutlet()
      } else {
        alert(data.message || 'Failed to assign manager')
      }
    } catch (error) {
      console.error('Error assigning manager:', error)
      alert('Failed to assign manager')
    }
  }

  const handleRemoveManager = async (managerId) => {
    if (!confirm('Are you sure you want to remove this manager?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}/remove-manager/${managerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()
      if (data.success) {
        fetchOutlet()
      } else {
        alert(data.message || 'Failed to remove manager')
      }
    } catch (error) {
      console.error('Error removing manager:', error)
      alert('Failed to remove manager')
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
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/owner/restaurant/${outlet.restaurantId?._id || outlet.restaurantId}`)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Restaurant
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{outlet.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Managers Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Managers</h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              <UserPlus size={18} />
              Assign Manager
            </button>
          </div>
          {outlet.managers && outlet.managers.length > 0 ? (
            <div className="space-y-2">
              {outlet.managers.map((manager) => (
                <div
                  key={manager._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">{manager.name}</p>
                    <p className="text-sm text-gray-600">{manager.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveManager(manager._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No managers assigned</p>
          )}
        </div>

        {/* Menu Items Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
            <button
              onClick={() => navigate(`/owner/menu/${outletId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              <Plus size={18} />
              Manage Menu
            </button>
          </div>
          <p className="text-sm text-gray-600">{items.length} items</p>
        </div>
      </div>

      {/* Assign Manager Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Assign Manager</h3>
            <form onSubmit={handleAssignManager}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Email
                </label>
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Password
                </label>
                <input
                  type="password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  If manager doesn't exist, a new account will be created
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

