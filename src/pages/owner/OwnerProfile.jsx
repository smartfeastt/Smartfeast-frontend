import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ArrowLeft, LogOut } from 'react-feather'
import Header from '../../components/owner/Header.jsx'

export default function OwnerProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="text-sm text-black-300 hover:text-white mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </header>

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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

