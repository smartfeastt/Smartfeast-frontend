import { useState, useEffect } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  Download,
  RefreshCw
} from "react-feather";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    restaurant: "all",
    dateRange: "today",
    searchQuery: ""
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      // Mock orders data - in real app, fetch from API
      const mockOrders = [
        {
          id: "ORD001",
          customerName: "John Doe",
          customerPhone: "+91 9876543210",
          restaurant: "Pizza Palace",
          outlet: "Downtown Branch",
          items: [
            { name: "Margherita Pizza", quantity: 1, price: 299 },
            { name: "Garlic Bread", quantity: 2, price: 99 }
          ],
          total: 497,
          status: "preparing",
          orderDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          paymentMethod: "card",
          deliveryAddress: "123 Main St, Downtown"
        },
        {
          id: "ORD002",
          customerName: "Jane Smith",
          customerPhone: "+91 9876543211",
          restaurant: "Burger Hub",
          outlet: "Mall Road",
          items: [
            { name: "Classic Burger", quantity: 2, price: 199 },
            { name: "French Fries", quantity: 1, price: 89 }
          ],
          total: 487,
          status: "ready",
          orderDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          estimatedDelivery: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
          paymentMethod: "upi",
          deliveryAddress: "456 Mall Road, City Center"
        },
        {
          id: "ORD003",
          customerName: "Mike Johnson",
          customerPhone: "+91 9876543212",
          restaurant: "Pizza Palace",
          outlet: "City Center",
          items: [
            { name: "Cappuccino", quantity: 2, price: 120 },
            { name: "Chocolate Cake", quantity: 1, price: 180 }
          ],
          total: 420,
          status: "delivered",
          orderDate: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
          deliveredAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          paymentMethod: "cod",
          deliveryAddress: "789 Park Avenue, Uptown"
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Restaurant filter
    if (filters.restaurant !== "all") {
      filtered = filtered.filter(order => order.restaurant === filters.restaurant);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query)
      );
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filters.dateRange === "today") {
      filtered = filtered.filter(order => order.orderDate >= today);
    } else if (filters.dateRange === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => order.orderDate >= weekAgo);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // In real app, make API call to update status
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

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
        return "text-green-600 bg-green-50 border-green-200";
      case "ready":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "preparing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "preparing":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case "preparing":
        return "Mark Ready";
      case "ready":
        return "Mark Delivered";
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all orders across your restaurants</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filters.restaurant}
              onChange={(e) => setFilters(prev => ({ ...prev, restaurant: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="all">All Restaurants</option>
              <option value="Pizza Palace">Pizza Palace</option>
              <option value="Burger Hub">Burger Hub</option>
              <option value="Cafe Delight">Cafe Delight</option>
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">No orders match your current filters.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.restaurant} - {order.outlet}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">₹{order.total}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name} - ₹{item.price * item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <p className="text-sm text-gray-600">
                      Ordered: {order.orderDate.toLocaleString()}
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-sm text-gray-600">
                        ETA: {order.estimatedDelivery.toLocaleTimeString()}
                      </p>
                    )}
                    {order.deliveredAt && (
                      <p className="text-sm text-green-600">
                        Delivered: {order.deliveredAt.toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 capitalize">
                      Payment: {order.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  <div className="flex gap-2">
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                        {getNextStatus(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                            className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                          >
                            {getNextStatusLabel(order.status)}
                          </button>
                        )}
                      </>
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
