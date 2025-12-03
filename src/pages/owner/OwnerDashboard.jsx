import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  BarChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus
} from "react-feather";
import { Store } from "lucide-react";

import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function OwnerDashboardNew() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalRestaurants: 0,
    totalOutlets: 0,
    monthlyGrowth: 0,
    orderGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Fetch restaurants to get counts
      const restaurantsResponse = await fetch(`${API_URL}/api/restaurant/owner/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const restaurantsData = await restaurantsResponse.json();
      
      let totalRestaurants = 0;
      let totalOutlets = 0;
      let totalRevenue = 0;
      let totalOrders = 0;
      const recentOrdersList = [];
      
      if (restaurantsData.success) {
        totalRestaurants = restaurantsData.restaurants?.length || 0;
        
        // Get outlets and orders for each restaurant
        for (const restaurant of restaurantsData.restaurants || []) {
          const outletsResponse = await fetch(`${API_URL}/api/outlet/restaurant/${restaurant._id}`);
          const outletsData = await outletsResponse.json();
          
          if (outletsData.success) {
            totalOutlets += outletsData.outlets?.length || 0;
            
            // Fetch orders for each outlet
            for (const outlet of outletsData.outlets || []) {
              try {
                const ordersResponse = await fetch(`${API_URL}/api/order/outlet/${outlet._id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                const ordersData = await ordersResponse.json();
                
                if (ordersData.success) {
                  const paidOrders = (ordersData.orders || []).filter(o => o.paymentStatus === 'paid');
                  totalOrders += paidOrders.length;
                  totalRevenue += paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                  
                  // Add recent orders
                  paidOrders.slice(0, 3).forEach(order => {
                    recentOrdersList.push({
                      id: order.orderNumber || order._id,
                      customerName: order.userId?.name || order.customerInfo?.name || 'Guest',
                      restaurant: restaurant.name,
                      outlet: outlet.name,
                      amount: order.totalPrice,
                      status: order.status,
                      time: new Date(order.createdAt).toLocaleString(),
                    });
                  });
                }
              } catch (error) {
                console.error(`Error fetching orders for outlet ${outlet._id}:`, error);
              }
            }
          }
        }
      }
      
      setStats({
        totalRevenue,
        totalOrders,
        totalRestaurants,
        totalOutlets,
        monthlyGrowth: 0, // Calculate from previous month data
        orderGrowth: 0, // Calculate from previous period data
      });

      setRecentOrders(recentOrdersList.slice(0, 5));
      setTopRestaurants([]); // Can be calculated from restaurant data
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, growth, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowUpRight className="text-green-500" size={16} />
              ) : (
                <ArrowDownRight className="text-red-500" size={16} />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your restaurants today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            growth={stats.monthlyGrowth}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={Package}
            growth={stats.orderGrowth}
            color="blue"
          />
          <StatCard
            title="Restaurants"
            value={stats.totalRestaurants}
            icon={Store}
            color="purple"
          />
          <StatCard
            title="Outlets"
            value={stats.totalOutlets}
            icon={Users}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link
                  to="/owner/orders"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View all <Eye size={16} />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.restaurant} - {order.outlet}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Restaurants */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Top Restaurants</h2>
                <Link
                  to="/owner/analytics"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View analytics <BarChart size={16} />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">{restaurant.outlets} outlets</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{restaurant.revenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="text-green-500" size={12} />
                        <span className="text-xs text-green-600">{restaurant.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/owner/restaurant/new"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Restaurant</p>
                <p className="text-sm text-gray-600">Create a new restaurant</p>
              </div>
            </Link>
            
            <Link
              to="/owner/analytics"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Detailed performance reports</p>
              </div>
            </Link>
            
            <Link
              to="/owner/payments"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Payments</p>
                <p className="text-sm text-gray-600">Manage payouts & settlements</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
