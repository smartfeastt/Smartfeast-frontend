import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Star, RotateCcw } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all");

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

  // Filter orders by active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "pay_now") return order.paymentType === 'pay_now';
    if (activeTab === "pay_later") return order.paymentType === 'pay_later';
    return order.status === activeTab;
  });

  const handleReorder = async (order) => {
    try {
      if (!token) {
        alert('Please login to reorder');
        return;
      }

      // Check if order allows reordering (not cancelled, not delivered long ago, etc.)
      if (order.status === 'cancelled') {
        alert('Cannot reorder a cancelled order');
        return;
      }

      // If parent order is Pay Later, add items directly to that order
      if (order.paymentType === 'pay_later') {
        const confirmed = window.confirm(
          `This order was "Pay Later". Adding items will be added directly to Order #${order.orderNumber}. Continue?`
        );
        
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/api/order/${order._id}/add-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: order.items.map(item => ({
              itemId: item.itemId || item._id,
              itemName: item.itemName,
              itemPrice: item.itemPrice,
              quantity: item.quantity,
              itemPhoto: item.itemPhoto,
            })),
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(`Items added to Order #${order.orderNumber} successfully!`);
          dispatch(fetchUserOrders(token)); // Refresh orders
        } else {
          alert(data.message || 'Failed to add items to order');
        }
      } else {
        // Pay Now: require payment for new items
        // For now, we'll add items to the order and redirect to payment
        const confirmed = window.confirm(
          `This order was "Pay Now". You will need to pay for the reordered items. Continue?`
        );
        
        if (!confirmed) return;

        const response = await fetch(`${API_URL}/api/order/${order._id}/add-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: order.items.map(item => ({
              itemId: item.itemId || item._id,
              itemName: item.itemName,
              itemPrice: item.itemPrice,
              quantity: item.quantity,
              itemPhoto: item.itemPhoto,
            })),
          }),
        });

        const data = await response.json();
        if (data.success && data.requiresPayment) {
          // Redirect to payment for the new items
          alert(`Items added. You need to pay ₹${data.newItemsTotal.toFixed(2)} for the new items.`);
          // TODO: Navigate to payment page for new items amount
          dispatch(fetchUserOrders(token)); // Refresh orders
        } else if (data.success) {
          alert(`Items added to Order #${order.orderNumber} successfully!`);
          dispatch(fetchUserOrders(token)); // Refresh orders
        } else {
          alert(data.message || 'Failed to add items to order');
        }
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { key: "all", label: "All Orders", count: orders.length },
                { key: "pay_now", label: "Pay Now", count: orders.filter(o => o.paymentType === 'pay_now').length },
                { key: "pay_later", label: "Pay Later", count: orders.filter(o => o.paymentType === 'pay_later').length },
                { key: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
                { key: "confirmed", label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
                { key: "preparing", label: "Preparing", count: orders.filter(o => o.status === "preparing").length },
                { key: "ready", label: "Ready", count: orders.filter(o => o.status === "ready").length },
                { key: "out_for_delivery", label: "Out for Delivery", count: orders.filter(o => o.status === "out_for_delivery").length },
                { key: "delivered", label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
                { key: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {activeTab === "all" 
                  ? "You haven't placed any orders yet." 
                  : `No ${activeTab} orders found.`}
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