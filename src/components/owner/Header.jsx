import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks.js'
import { logout } from '../../store/slices/authSlice.js'
import { useState, useEffect } from 'react'
import { LogOut } from "lucide-react";


const Header = ()=>{
  const navigate = useNavigate()
  const { user, token, loading: authLoading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }
  
  
  useEffect(() => {
  if (authLoading) return

  if (!user || user.type !== 'owner') {
    console.log("user is not an owner")
    navigate('/login')
    return
  }

}, [user, token, authLoading])

  
  // if (loading) {
  //   return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  // }

  return(
    <header className="bg-black text-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">SmartFeast - Owner Dashboard</h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{user?.email}</span>
                  <button
                    onClick={() => navigate('/owner/profile')}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
  );
};

export default Header;