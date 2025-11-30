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
  Clock,
  CheckCircle
} from "react-feather";
import { Store } from "lucide-react";

import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks.js";
import DynamicHeader from "../../components/headers/DynamicHeader.jsx";

export default function ManagerDashboardNew() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalOutlets: 0,
    activeOrders: 0,
    monthlyGrowth: 0,
    orderGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [outletPerformance, setOutletPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - in real app, fetch from API based on managed outlets
      setStats({
        totalRevenue: 45000,
        totalOrders: 380,
        totalOutlets: 2,
        activeOrders: 12,
        monthlyGrowth: 8.5,
        orderGrowth: 12.3
      });

      setRecentOrders([
        {
          id: "ORD001",
          customerName: "John Doe",
          outlet: "Downtown Branch",
          amount: 450,
          status: "preparing",
          time: "5 minutes ago",
          items: 3
        },
        {
          id: "ORD002",
          customerName: "Jane Smith",
          outlet: "Mall Road",
          amount: 320,
          status: "ready",
          time: "12 minutes ago",
          items: 2
        },
        {
          id: "ORD003",
          customerName: "Mike Johnson",
          outlet: "Downtown Branch",
          amount: 180,
          status: "delivered",
          time: "25 minutes ago",
          items: 1
        }
      ]);

      setOutletPerformance([
        {
          name: "Downtown Branch",
          revenue: 28000,
          orders: 220,
          growth: 15.2,
          activeOrders: 8,
          avgRating: 4.6
        },
        {
          name: "Mall Road",
          revenue: 17000,
          orders: 160,
          growth: 5.7,
          activeOrders: 4,
          avgRating: 4.4
        }
      ]);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "ready":
        return <Package className="text-blue-500" size={16} />;
      case "preparing":
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
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
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DynamicHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
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
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}! Here's your outlets' performance today.
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
            title="Managed Outlets"
            value={stats.totalOutlets}
            icon={Store}
            color="purple"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={Clock}
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
                  to="/manager/orders"
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
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.outlet} • {order.items} items</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outlet Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Outlet Performance</h2>
                <Link
                  to="/manager/reports"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View reports <BarChart3 size={16} />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {outletPerformance.map((outlet, index) => (
                  <div key={outlet.name} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{outlet.name}</h3>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="text-green-500" size={12} />
                        <span className="text-xs text-green-600">{outlet.growth}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-semibold text-gray-900">₹{outlet.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Orders</p>
                        <p className="font-semibold text-gray-900">{outlet.orders}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Orders</p>
                        <p className="font-semibold text-orange-600">{outlet.activeOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating</p>
                        <p className="font-semibold text-yellow-600">{outlet.avgRating} ⭐</p>
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
              to="/manager/orders"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-600">View and update order status</p>
              </div>
            </Link>
            
            <Link
              to="/manager/outlets"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">My Outlets</p>
                <p className="text-sm text-gray-600">Manage outlet information</p>
              </div>
            </Link>
            
            <Link
              to="/manager/reports"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Reports</p>
                <p className="text-sm text-gray-600">View detailed analytics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
