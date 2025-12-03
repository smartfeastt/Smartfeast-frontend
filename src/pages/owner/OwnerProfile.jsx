import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks.js'
import { logout } from '../../store/slices/authSlice.js'
import { ArrowLeft, LogOut, Trash2 } from 'react-feather'
import DynamicHeader from '../../components/headers/DynamicHeader.jsx'

const API_URL = import.meta.env.VITE_API_URL;

export default function OwnerProfile() {
  const { user, token } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your restaurants, outlets, and data will be permanently deleted."
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch(logout());
        navigate('/');
        alert('Your account has been deleted successfully.');
      } else {
        alert(data.message || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <p className="text-gray-900 capitalize">{user?.type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurants Owned
              </label>
              <p className="text-gray-900">{user?.ownedRestaurants?.length || 0}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Deleting your account will permanently remove all your restaurants, outlets, and associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

