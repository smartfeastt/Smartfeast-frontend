import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingCart,
  LogOut,
  Settings,
  CreditCard,
  Package,
  BarChart,
  Users,
  Menu,
  X,
  Home,
  Heart,
  Clock
} from "react-feather";
import { Store } from "lucide-react";


import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { logout } from "../../store/slices/authSlice.js";
import { selectTotalItems } from "../../store/slices/cartSlice.js";

export default function DynamicHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const totalItems = useAppSelector(selectTotalItems);
  const dispatch = useAppDispatch();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Guest Header (Not logged in)
  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              SmartFeast
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link
                to="/user/signin"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/user/signup"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // User Header (Customer)
  if (user.type === 'user') {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              SmartFeast
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Home size={18} />
                Home
              </Link>
              <Link to="/user/orders" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Package size={18} />
                Orders
              </Link>
              <Link to="/user/favorites" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Heart size={18} />
                Favorites
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:block">{user.name || user.email.split('@')[0]}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                    <div className="py-1">
                      <Link
                        to="/user/profile"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/user/orders"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      <Link
                        to="/user/settings"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="space-y-2">
                <Link to="/" className="block py-2 text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/user/orders" className="block py-2 text-gray-600 hover:text-gray-900">Orders</Link>
                <Link to="/user/favorites" className="block py-2 text-gray-600 hover:text-gray-900">Favorites</Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    );
  }

  // Owner Header
  if (user.type === 'owner') {
    return (
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/owner/dashboard" className="text-2xl font-bold">
              SmartFeast <span className="text-sm font-normal text-gray-300">Owner</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/owner/dashboard" className="text-gray-300 hover:text-white flex items-center gap-1">
                <BarChart size={18} />
                Dashboard
              </Link>
              <Link to="/owner/restaurants" className="text-gray-300 hover:text-white flex items-center gap-1">
                <Store size={18} />
                Restaurants
              </Link>
              <Link to="/owner/analytics" className="text-gray-300 hover:text-white flex items-center gap-1">
                <BarChart size={18} />
                Analytics
              </Link>
              <Link to="/owner/payments" className="text-gray-300 hover:text-white flex items-center gap-1">
                <CreditCard size={18} />
                Payments
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:block">{user.name || user.email.split('@')[0]}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border text-gray-900">
                    <div className="py-1">
                      <Link
                        to="/owner/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/owner/settings"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <Link
                        to="/owner/billing"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <CreditCard size={16} />
                        Billing
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
              <div className="space-y-2">
                <Link to="/owner/dashboard" className="block py-2 text-gray-300 hover:text-white">Dashboard</Link>
                <Link to="/owner/restaurants" className="block py-2 text-gray-300 hover:text-white">Restaurants</Link>
                <Link to="/owner/analytics" className="block py-2 text-gray-300 hover:text-white">Analytics</Link>
                <Link to="/owner/payments" className="block py-2 text-gray-300 hover:text-white">Payments</Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    );
  }

  // Manager Header
  if (user.type === 'manager') {
    return (
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/manager/dashboard" className="text-2xl font-bold">
              SmartFeast <span className="text-sm font-normal text-blue-300">Manager</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/manager/dashboard" className="text-blue-300 hover:text-white flex items-center gap-1">
                <BarChart size={18} />
                Dashboard
              </Link>
              <Link to="/manager/outlets" className="text-blue-300 hover:text-white flex items-center gap-1">
                <Store size={18} />
                My Outlets
              </Link>
              <Link to="/manager/orders" className="text-blue-300 hover:text-white flex items-center gap-1">
                <Package size={18} />
                Orders
              </Link>
              <Link to="/manager/reports" className="text-blue-300 hover:text-white flex items-center gap-1">
                <BarChart size={18} />
                Reports
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 text-blue-300 hover:text-white transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:block">{user.name || user.email.split('@')[0]}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border text-gray-900">
                    <div className="py-1">
                      <Link
                        to="/manager/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/manager/settings"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-blue-300 hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-blue-700 pt-4">
              <div className="space-y-2">
                <Link to="/manager/dashboard" className="block py-2 text-blue-300 hover:text-white">Dashboard</Link>
                <Link to="/manager/outlets" className="block py-2 text-blue-300 hover:text-white">My Outlets</Link>
                <Link to="/manager/orders" className="block py-2 text-blue-300 hover:text-white">Orders</Link>
                <Link to="/manager/reports" className="block py-2 text-blue-300 hover:text-white">Reports</Link>
              </div>
            </nav>
          )}
        </div>
      </header>
    );
  }

  return null;
}
