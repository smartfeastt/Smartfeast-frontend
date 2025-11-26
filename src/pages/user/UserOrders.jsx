import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Star, RotateCcw } from "react-feather";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Mock orders data - in real app, fetch from API
    const mockOrders = [
      {
        id: "ORD001",
        restaurantName: "Pizza Palace",
        outletName: "Downtown Branch",
        items: [
          { name: "Margherita Pizza", quantity: 1, price: 299 },
          { name: "Garlic Bread", quantity: 2, price: 99 }
        ],
        total: 497,
        status: "delivered",
        orderDate: "2024-01-15T10:30:00Z",
        deliveryDate: "2024-01-15T11:15:00Z",
        rating: 5
      },
      {
        id: "ORD002",
        restaurantName: "Burger Hub",
        outletName: "Mall Road",
        items: [
          { name: "Classic Burger", quantity: 2, price: 199 },
          { name: "French Fries", quantity: 1, price: 89 }
        ],
        total: 487,
        status: "preparing",
        orderDate: "2024-01-16T14:20:00Z",
        estimatedDelivery: "2024-01-16T15:00:00Z"
      },
      {
        id: "ORD003",
        restaurantName: "Cafe Delight",
        outletName: "City Center",
        items: [
          { name: "Cappuccino", quantity: 2, price: 120 },
          { name: "Chocolate Cake", quantity: 1, price: 180 }
        ],
        total: 420,
        status: "cancelled",
        orderDate: "2024-01-14T16:45:00Z",
        cancelReason: "Restaurant unavailable"
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
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
      case "preparing":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const handleReorder = (order) => {
    // In real app, add items to cart and redirect to restaurant
    alert(`Reordering from ${order.restaurantName}...`);
  };

  const handleRateOrder = (orderId) => {
    // In real app, open rating modal
    alert(`Rating order ${orderId}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "all", label: "All Orders", count: orders.length },
                { key: "preparing", label: "Active", count: orders.filter(o => o.status === "preparing").length },
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
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-gray-900">Order #{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.restaurantName}</h3>
                    <p className="text-sm text-gray-600">{order.outletName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{order.total}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Info */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  {order.status === "delivered" && order.deliveryDate && (
                    <p className="text-sm text-gray-600">
                      Delivered on {new Date(order.deliveryDate).toLocaleString()}
                    </p>
                  )}
                  {order.status === "preparing" && order.estimatedDelivery && (
                    <p className="text-sm text-gray-600">
                      Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString()}
                    </p>
                  )}
                  {order.status === "cancelled" && order.cancelReason && (
                    <p className="text-sm text-red-600">
                      Cancelled: {order.cancelReason}
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
                    {order.status === "delivered" && !order.rating && (
                      <button
                        onClick={() => handleRateOrder(order.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        <Star size={16} />
                        Rate Order
                      </button>
                    )}
                  </div>
                  
                  {order.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm text-gray-600">Rated {order.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
