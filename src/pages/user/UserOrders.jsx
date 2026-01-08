import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Star, RotateCcw, Filter } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { fetchUserOrders, selectUserOrders, selectOrdersLoading } from "../../store/slices/ordersSlice.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

export default function UserOrders() {
  const { token, user } = useAppSelector((state) => state.auth);
  const orders = useAppSelector(selectUserOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({
    status: 'active', // active, completed
    dateRange: 'today', // today, week, month, all
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchUserOrders(token));
    }
  }, [token, dispatch]);

  // Socket.io for real-time order updates
  useEffect(() => {
    if (!token || !user?.userId) return;

    const socket = io(API_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected for orders');
      socket.emit('join-user', user.userId);
    });

    socket.on('order-created', (order) => {
      console.log('New order created:', order);
      dispatch(fetchUserOrders(token));
    });

    socket.on('order-updated', (order) => {
      console.log('Order updated:', order);
      dispatch(fetchUserOrders(token));
    });


    return () => {
      socket.disconnect();
    };
  }, [token, user?.userId, dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
      case "ready":
        return <Package className="text-blue-500" size={20} />;
      case "preparing":
        return <Clock className="text-yellow-500" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "ready":
        return "text-blue-600 bg-blue-50";
      case "preparing":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status, orderType) => {
    // Import utility function dynamically or inline the logic
    if (status === 'ready') {
      if (orderType === 'delivery') {
        return 'Out for Delivery';
      } else if (orderType === 'dine_in') {
        return 'Started Preparing';
      } else if (orderType === 'takeaway') {
        return 'Package Packed';
      }
    }
    if (status === 'out_for_delivery') {
      return 'Out for Delivery';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  // Helper to check if order is completed
  const isOrderCompleted = (order) => {
    return order.status === 'delivered' || order.status === 'cancelled';
  }

  // Filter orders based on filters
  const filteredOrders = orders.filter(order => {
    // Status filter (active vs completed)
    if (filters.status === 'active') {
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
      if (!activeStatuses.includes(order.status)) return false;
    } else {
      // completed
      const completedStatuses = ['delivered', 'cancelled'];
      if (!completedStatuses.includes(order.status)) return false;
    }

    // Date range filter
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filters.dateRange === 'today') {
      if (orderDate < today) return false;
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (orderDate < weekAgo) return false;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (orderDate < monthAgo) return false;
    }
    // 'all' doesn't filter by date

    return true;
  });

  const handleReorder = async (order) => {
    try {
      if (!token) {
        alert('Please login to reorder');
        return;
      }

      // Check if order allows reordering (not cancelled, not delivered long ago)
      if (order.status === 'cancelled') {
        alert('Cannot reorder a cancelled order');
        return;
      }

      // Check if order is from the same outlet (can only reorder from same outlet)
      const outletId = order.outletId?._id || order.outletId;
      if (!outletId) {
        alert('Cannot determine outlet for this order');
        return;
      }

      // Confirm with user
      const confirmed = window.confirm(
        `Add items from Order #${order.orderNumber} to the same order? The items will be added to your existing order.`
      );
      
      if (!confirmed) return;

      // Prepare items for the API
      const itemsToAdd = order.items.map(item => ({
        itemId: item.itemId?._id || item.itemId || item._id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        quantity: item.quantity,
        itemPhoto: item.itemPhoto,
      })).filter(item => item.itemId); // Filter out items without valid itemId

      if (itemsToAdd.length === 0) {
        alert('No valid items to add');
        return;
      }

      // Call API to add items to existing order
      const response = await fetch(`${API_URL}/api/order/${order._id}/add-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsToAdd,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders to show updated order
        dispatch(fetchUserOrders(token));
        
        if (data.requiresPayment) {
          // If Pay Now order, need to pay for new items
          alert(`Items added to Order #${order.orderNumber} successfully! You need to pay ₹${data.newItemsTotal.toFixed(2)} for the new items.`);
          // TODO: Navigate to payment page for new items amount
        } else {
          // Pay Later - items added directly
          alert(`Items added to Order #${order.orderNumber} successfully!`);
        }
      } else {
        alert(data.message || 'Failed to add items to order');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  const handleRateOrder = (orderId) => {
    // In real app, open rating modal
    alert(`Rating order ${orderId}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
            <Filter size={16} />
            Filters
          </div>
          
          <div className="flex flex-wrap items-end gap-4">
            {/* Order Status Filter - Horizontal Buttons */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: "active" }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === "active"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: "completed" }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === "completed"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Date Range Filter - Dropdown */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
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

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {filters.status === "active"
                  ? "You don't have any active orders."
                  : "You don't have any completed orders."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-gray-900">Order #{order.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status, order.orderType)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.restaurantId?.name || 'Restaurant'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.outletId?.name || 'Outlet'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{order.totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="text-gray-900">₹{(item.itemPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Info */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
                  </p>
                  {order.paymentType && (
                    <p className="text-sm text-gray-600">
                      <strong>Payment Type:</strong> <span className="capitalize">{order.paymentType.replace('_', ' ')}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Reorder
                    </button>
                    {order.status === "delivered" && (
                      <button
                        onClick={() => handleRateOrder(order._id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        <Star size={16} />
                        Rate Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}