import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks.js'
import { fetchOutletOrders, updateOrderStatus, addOrUpdateOutletOrder, setCurrentOutlet } from '../../store/slices/ordersSlice.js'
import { Plus, Users, ArrowLeft, UserPlus, X, Package, Clock, CheckCircle, Truck, Printer, FileText, Settings, CreditCard, Filter } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'
import io from 'socket.io-client'
import { getOrderStatusLabel, getNextStatusAction } from '../../utils/orderStatus.js'

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
  const [updatingPayNow, setUpdatingPayNow] = useState(false)
  const [updatingPayLater, setUpdatingPayLater] = useState(false)
  const [orderFilters, setOrderFilters] = useState({
    paymentType: 'pay_later', // pay_now, pay_later
    dateRange: 'today', // today, week, month, all
    status: 'active', // active, completed
    orderType: 'dine_in', // dine_in, takeaway, delivery (no 'all')
  })

  const fetchOutlet = useCallback(async () => {
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
        // Debug: Log managers to check if they're populated
        if (data.outlet?.managers) {
          console.log('Outlet managers data:', JSON.stringify(data.outlet.managers, null, 2))
        }
      } else {
        console.error('Failed to fetch outlet:', data.message)
      }
    } catch (error) {
      console.error('Error fetching outlet:', error)
    } finally {
      setLoading(false)
    }
  }, [outletId, token])

  const fetchItems = useCallback(async () => {
    if (!token || !outletId) return;
    
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
      } else {
        console.error('Failed to fetch items:', data.message)
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setItems([])
    }
  }, [outletId, token])

  useEffect(() => {
    if (!token || !outletId) return;
    
    // Set current outlet in Redux to load cached orders
    dispatch(setCurrentOutlet(outletId));
    
    // Fetch fresh data
    fetchOutlet()
    fetchItems()
    
    // Fetch orders with retry logic
    const fetchOrdersWithRetry = async (retries = 3) => {
      try {
        await dispatch(fetchOutletOrders({ outletId, token })).unwrap();
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (retries > 0) {
          console.log(`Retrying... ${retries} attempts left`);
          setTimeout(() => fetchOrdersWithRetry(retries - 1), 1000);
        }
      }
    };
    
    fetchOrdersWithRetry();
    
    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      if (token && outletId) {
        dispatch(fetchOutletOrders({ outletId, token }));
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [outletId, token, dispatch, fetchOutlet, fetchItems])

  // Socket.io for real-time order updates
  useEffect(() => {
    if (!token || !outletId) return;

    // Get correct socket URL (remove /api suffix if present)
    let socketUrl = API_URL;
    if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.slice(0, -4);
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Allow fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[OwnerOutlet] Socket connected, joining outlet room:', outletId);
      socket.emit('join-outlet', outletId);
    });

    socket.on('new-order', (order) => {
      console.log('[OwnerOutlet] New order received:', order);
      console.log('[OwnerOutlet] Order outletId:', order.outletId);
      console.log('[OwnerOutlet] Current outletId:', outletId);
      
      // Check if order belongs to this outlet - handle different formats
      const orderOutletId = order.outletId?._id?.toString() || 
                           order.outletId?.toString() || 
                           order.outletId;
      const currentOutletId = outletId.toString();
      
      console.log('[OwnerOutlet] Comparing:', orderOutletId, '===', currentOutletId);
      
      if (orderOutletId === currentOutletId) {
        console.log('[OwnerOutlet] Adding order to Redux store - order:', order);
        // Note: Order might not be paid yet, but we add it anyway
        // The UI should handle filtering if needed, but usually orders show up once paid
        dispatch(addOrUpdateOutletOrder(order));
      } else {
        console.log('[OwnerOutlet] Order outletId does not match, ignoring. Expected:', currentOutletId, 'Got:', orderOutletId);
      }
    });

    socket.on('order-updated', (order) => {
      console.log('[OwnerOutlet] Order updated:', order);
      // Check if order belongs to this outlet
      const orderOutletId = order.outletId?._id?.toString() || 
                           order.outletId?.toString() || 
                           order.outletId;
      const currentOutletId = outletId.toString();
      
      if (orderOutletId === currentOutletId) {
        console.log('[OwnerOutlet] Updating order in Redux store');
        dispatch(addOrUpdateOutletOrder(order));
      }
    });

    socket.on('payment-updated', (order) => {
      console.log('[OwnerOutlet] Payment updated:', order);
      // Check if order belongs to this outlet
      const orderOutletId = order.outletId?._id?.toString() || 
                           order.outletId?.toString() || 
                           order.outletId;
      const currentOutletId = outletId.toString();
      
      if (orderOutletId === currentOutletId) {
        console.log('[OwnerOutlet] Payment updated - adding/updating order in Redux store');
        // Only add if payment is paid (matches what getOutletOrders returns)
        if (order.paymentStatus === 'paid') {
          dispatch(addOrUpdateOutletOrder(order));
        }
      }
    });

    socket.on('connect_error', (error) => {
      // Only log if it's not a normal disconnection
      if (error.message && !error.message.includes('xhr poll error')) {
        console.error('[OwnerOutlet] Socket connection error:', error.message);
      }
    });

    socket.on('disconnect', (reason) => {
      // Only log if it's not a normal client disconnect
      if (reason !== 'io client disconnect') {
        console.log('[OwnerOutlet] Socket disconnected:', reason);
      }
    });

    return () => {
      console.log('[OwnerOutlet] Cleaning up socket connection');
      socket.disconnect();
    };
  }, [outletId, token, dispatch])


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

  const handleTogglePayNow = async () => {
    try {
      setUpdatingPayNow(true);
      const response = await fetch(`${API_URL}/api/outlet/update/${outletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          payNowEnabled: !(outlet.payNowEnabled ?? true),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOutlet(data.outlet);
      } else {
        alert(data.message || 'Failed to update payment settings');
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      alert('Failed to update payment settings');
    } finally {
      setUpdatingPayNow(false);
    }
  }

  const handleTogglePayLater = async () => {
    try {
      setUpdatingPayLater(true);
      const response = await fetch(`${API_URL}/api/outlet/update/${outletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          payLaterEnabled: !(outlet.payLaterEnabled ?? true),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOutlet(data.outlet);
      } else {
        alert(data.message || 'Failed to update payment settings');
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      alert('Failed to update payment settings');
    } finally {
      setUpdatingPayLater(false);
    }
  }

  // Filter orders based on filters
  const filteredOrders = outletOrders.filter(order => {
    // Payment type filter
    if (order.paymentType !== orderFilters.paymentType) {
      return false;
    }

    // Order type filter
    if (order.orderType !== orderFilters.orderType) {
      return false;
    }

    // Date range filter
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (orderFilters.dateRange === 'today') {
      if (orderDate < today) return false;
    } else if (orderFilters.dateRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (orderDate < weekAgo) return false;
    } else if (orderFilters.dateRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (orderDate < monthAgo) return false;
    }
    // 'all' doesn't filter by date

    // Status filter (active vs completed)
    if (orderFilters.status === 'active') {
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
      if (!activeStatuses.includes(order.status)) return false;
    } else {
      // completed
      const completedStatuses = ['delivered', 'cancelled'];
      if (!completedStatuses.includes(order.status)) return false;
    }

    return true;
  })

  // Helper to check if order is completed
  const isOrderCompleted = (order) => {
    return order.status === 'delivered' || order.status === 'cancelled';
  }

  // Helper to get simplified status for dine-in orders
  const getSimplifiedStatus = (order) => {
    if (order.orderType === 'dine_in') {
      return isOrderCompleted(order) ? 'Completed' : 'Active';
    }
    return getOrderStatusLabel(order.status, order.orderType);
  }

  const handleGenerateKOT = async (orderId, itemIds = null) => {
    try {
      const response = await fetch(`${API_URL}/api/order/${orderId}/kot/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemIds: itemIds, // Optional: specific item IDs, or null for all unprepared items
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Open KOT in new window for printing
        window.open(`/kot/${orderId}`, '_blank');
        // Refresh orders to update KOT status
        dispatch(fetchOutletOrders({ outletId, token }));
      } else {
        alert(data.message || 'Failed to generate KOT');
      }
    } catch (error) {
      console.error('Error generating KOT:', error);
      alert('Failed to generate KOT');
    }
  };

  const handleGenerateBill = (orderId) => {
    window.open(`/bill/${orderId}`, '_blank');
  };

  // Helper function to check if item has KOT prepared
  const isItemKOTPrepared = (order, item) => {
    if (!order.kotItems || !order.kotItems.length) return false;
    const kotItem = order.kotItems.find(kot => 
      (kot.itemId?.toString() === item.itemId?.toString() || kot.itemId?.toString() === item._id?.toString()) &&
      kot.itemName === item.itemName &&
      kot.kotGenerated === true
    );
    return !!kotItem;
  };

  // Helper function to get unprepared items for an order
  const getUnpreparedItems = (order) => {
    if (!order.kotItems || !order.kotItems.length) return order.items || [];
    const unpreparedKotItems = order.kotItems.filter(kot => !kot.kotGenerated);
    // Match with order items
    return (order.items || []).filter(item => {
      return unpreparedKotItems.some(kot => 
        (kot.itemId?.toString() === item.itemId?.toString() || kot.itemId?.toString() === item._id?.toString()) &&
        kot.itemName === item.itemName
      );
    });
  };


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!outlet) {
    return <div className="min-h-screen flex items-center justify-center">Outlet not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(`/owner/restaurant/${outlet.restaurantId?._id || outlet.restaurantId}`)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-3 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Restaurant
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{outlet.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{outlet.location || 'No location set'}</p>
            </div>
            <button
              onClick={() => navigate(`/owner/menu/${outletId}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Manage Menu
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
              </div>
              <Package className="text-gray-400" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{outletOrders.length}</p>
              </div>
              <Clock className="text-gray-400" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{outlet.managers?.length || 0}</p>
              </div>
              <Users className="text-gray-400" size={32} />
            </div>
          </div>
        </div>
        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={20} className="text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Outlet Settings</h2>
          </div>
          
          <div className="space-y-4">
            {/* Delivery Setting */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={18} className="text-gray-600" />
                  <p className="font-semibold text-gray-900">Enable Delivery</p>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Allow customers to place delivery orders
                </p>
              </div>
              <button
                onClick={handleToggleDelivery}
                disabled={updatingDelivery}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  outlet.deliveryEnabled ? 'bg-black' : 'bg-gray-300'
                } ${updatingDelivery ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    outlet.deliveryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Pay Now Setting */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={18} className="text-gray-600" />
                  <p className="font-semibold text-gray-900">Enable Pay Now</p>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Allow customers to pay immediately at checkout
                </p>
              </div>
              <button
                onClick={handleTogglePayNow}
                disabled={updatingPayNow}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  (outlet.payNowEnabled ?? true) ? 'bg-black' : 'bg-gray-300'
                } ${updatingPayNow ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    (outlet.payNowEnabled ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Pay Later Setting */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={18} className="text-gray-600" />
                  <p className="font-semibold text-gray-900">Enable Pay Later</p>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Allow customers to pay at the restaurant or counter
                </p>
              </div>
              <button
                onClick={handleTogglePayLater}
                disabled={updatingPayLater}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  (outlet.payLaterEnabled ?? true) ? 'bg-black' : 'bg-gray-300'
                } ${updatingPayLater ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    (outlet.payLaterEnabled ?? true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Managers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Managers
            </h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <UserPlus size={18} />
              Assign Manager
            </button>
          </div>
          {outlet.managers && outlet.managers.length > 0 ? (
            <div className="space-y-2">
              {outlet.managers.map((manager) => {
                const managerId = typeof manager === 'string' ? manager : (manager._id || manager);
                const managerName = manager?.name || (manager?.email ? manager.email.split('@')[0] : 'Unknown');
                const managerEmail = manager?.email || '';
                
                return (
                  <div
                    key={managerId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{managerName}</p>
                      {managerEmail ? (
                        <p className="text-sm text-gray-600">{managerEmail}</p>
                      ) : (
                        <p className="text-xs text-red-500 italic">⚠ Email not populated</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveManager(managerId)}
                      className="text-red-600 hover:text-red-800 ml-4 transition-colors"
                      title="Remove manager"
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No managers assigned</p>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} />
              Orders ({filteredOrders.length})
            </h2>
            <button
              onClick={() => {
                if (token && outletId) {
                  dispatch(fetchOutletOrders({ outletId, token }));
                }
              }}
              disabled={ordersLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh orders"
            >
              <Clock size={16} />
              {ordersLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Order Filters - All in One Line */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
              <Filter size={16} />
              Filters
            </div>
            
            <div className="flex flex-wrap items-end gap-4">
              {/* Order Type Filter - Horizontal Buttons */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderFilters(prev => ({ ...prev, orderType: "dine_in" }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilters.orderType === "dine_in"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Dine-In
                  </button>
                  <button
                    onClick={() => setOrderFilters(prev => ({ ...prev, orderType: "takeaway" }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilters.orderType === "takeaway"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Takeaway
                  </button>
                  {outlet.deliveryEnabled && (
                    <button
                      onClick={() => setOrderFilters(prev => ({ ...prev, orderType: "delivery" }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilters.orderType === "delivery"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Delivery
                    </button>
                  )}
                </div>
              </div>

              {/* Order Status Filter - Horizontal Buttons */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderFilters(prev => ({ ...prev, status: "active" }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilters.status === "active"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setOrderFilters(prev => ({ ...prev, status: "completed" }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilters.status === "completed"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Payment Type Filter - Horizontal Buttons */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderFilters(prev => ({ ...prev, paymentType: "pay_later" }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      orderFilters.paymentType === "pay_later"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pay Later
                  </button>
                  {(outlet.payNowEnabled ?? true) && (
                    <button
                      onClick={() => setOrderFilters(prev => ({ ...prev, paymentType: "pay_now" }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilters.paymentType === "pay_now"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Date Range Filter - Dropdown */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={orderFilters.dateRange}
                  onChange={(e) => setOrderFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
          
          {ordersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        {order.orderType === 'dine_in' ? (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              isOrderCompleted(order)
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isOrderCompleted(order) ? 'Completed' : 'Active'}
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'preparing'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'ready' || order.status === 'out_for_delivery'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'delivered'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getOrderStatusLabel(order.status, order.orderType)}
                          </span>
                        )}
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
                      {order.tableNumber && (
                        <p className="text-xs font-semibold text-blue-600 mt-1">
                          Table #{order.tableNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                      {order.paymentType && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.paymentType === 'pay_now' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.paymentType === 'pay_now' ? 'Pay Now' : 'Pay Later'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => {
                        const isKOTPrepared = isItemKOTPrepared(order, item);
                        return (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">
                                {item.itemName} x {item.quantity}
                              </span>
                              {isKOTPrepared && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                  KOT Prepared
                                </span>
                              )}
                            </div>
                            <span className="text-gray-600">₹{(item.itemPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-3">
                    {/* KOT and Bill Actions - Prominent */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {getUnpreparedItems(order).length > 0 && (
                        <button
                          onClick={() => handleGenerateKOT(order._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          title="Generate KOT for unprepared items"
                        >
                          <Printer size={16} />
                          Generate KOT ({getUnpreparedItems(order).length} items)
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateBill(order._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        title="Generate Bill"
                      >
                        <FileText size={16} />
                        Generate Bill
                      </button>
                    </div>

                    {/* Order Status Actions */}
                    {order.orderType === 'dine_in' ? (
                      // For dine-in: Simple active/completed toggle
                      <div className="flex gap-2">
                        {!isOrderCompleted(order) ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Mark as Completed
                          </button>
                        ) : (
                          <div className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium text-center">
                            Order Completed
                          </div>
                        )}
                      </div>
                    ) : (
                      // For takeaway and delivery: Show complete button if not completed
                      <div className="flex gap-2">
                        {!isOrderCompleted(order) ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Mark as Completed
                          </button>
                        ) : (
                          <div className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium text-center">
                            Order Completed
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delivery Address (only for delivery orders) */}
                    {order.orderType === 'delivery' && (
                      <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                        <strong>Delivery Address:</strong> {order.deliveryAddress}
                      </p>
                    )}
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

