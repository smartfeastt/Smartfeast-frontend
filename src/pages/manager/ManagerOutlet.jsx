import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.js'
import { ArrowLeft, Truck } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManagerOutlet() {
  const { outletId } = useParams()
  const { token } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const [outlet, setOutlet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingDelivery, setUpdatingDelivery] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchOutlet()
  }, [outletId, token])

  const fetchOutlet = async () => {
    try {
      const response = await fetch(`${API_URL}/api/outlet/${outletId}`)
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

  const handleToggleDelivery = async () => {
    try {
      setUpdatingDelivery(true);
      const response = await fetch(`${API_URL}/api/outlet/update/${outletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          deliveryEnabled: !outlet.deliveryEnabled,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOutlet(data.outlet);
      } else {
        alert(data.message || 'Failed to update delivery settings');
      }
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      alert('Failed to update delivery settings');
    } finally {
      setUpdatingDelivery(false);
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
            onClick={() => navigate('/manager/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{outlet.name}</h1>
          {outlet.restaurantId && (
            <p className="text-gray-600 text-sm">{outlet.restaurantId.name}</p>
          )}
        </div>
      </div>

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

        {/* Delivery Settings Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Truck size={20} />
              Delivery Settings
            </h2>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Enable Delivery</p>
              <p className="text-sm text-gray-600">
                When disabled, customers can see the delivery option but cannot select it
              </p>
            </div>
            <button
              onClick={handleToggleDelivery}
              disabled={updatingDelivery}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                outlet.deliveryEnabled ? 'bg-black' : 'bg-gray-200'
              } ${updatingDelivery ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  outlet.deliveryEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

