import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks.js'
import { fetchOutletOrders, updateOrderStatus } from '../../store/slices/ordersSlice.js'
import { Plus, Users, ArrowLeft, UserPlus, X, Package, Clock, CheckCircle, Truck } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'
import io from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerOutlet() {
  const { outletId } = useParams()
  const { token } = useAppSelector((state) => state.auth)
  const { outletOrders, loading: ordersLoading } = useAppSelector((state) => state.orders)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [outlet, setOutlet] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [updatingDelivery, setUpdatingDelivery] = useState(false)

  useEffect(() => {
    fetchOutlet()
    if (token && outletId) {
      dispatch(fetchOutletOrders({ outletId, token }))
    }
  }, [outletId, token, dispatch])

  // Socket.io for real-time order updates
  useEffect(() => {
    if (!token || !outletId) return;

    const socket = io(API_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-outlet', outletId);
    });

    socket.on('new-order', (order) => {
      console.log('New order received:', order);
      dispatch(fetchOutletOrders({ outletId, token }));
    });

    socket.on('order-updated', (order) => {
      console.log('Order updated:', order);
      dispatch(fetchOutletOrders({ outletId, token }));
    });

    return () => {
      socket.disconnect();
    };
  }, [outletId, token, dispatch])

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

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status, token })).unwrap();
    } catch (error) {
      alert(error || 'Failed to update order status');
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        {/* Delivery Settings Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} />
              Orders ({outletOrders.length})
            </h2>
          </div>
          
          {ordersLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : outletOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outletOrders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'preparing'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'delivered'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.orderType === 'dine_in'
                              ? 'bg-blue-100 text-blue-800'
                              : order.orderType === 'takeaway'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.orderType === 'dine_in'
                            ? 'Dine-In'
                            : order.orderType === 'takeaway'
                            ? 'Takeaway'
                            : 'Delivery'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.userId?.name || order.userId?.email || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.itemName} x {item.quantity}
                          </span>
                          <span>₹{(item.itemPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Delivery:</strong> {order.deliveryAddress}
                    </p>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'preparing')}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ready')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                          className="flex-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                        >
                          Out for Delivery
                        </button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'delivered')}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

