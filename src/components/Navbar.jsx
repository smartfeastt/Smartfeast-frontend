import { Link } from 'react-router-dom'
import { Grid, LogOut, ShoppingCart } from 'react-feather'
import { useCart } from '../context/CartContext'

export default function Navbar({ title = 'QRMenu', right, backTo }) {
  const { count } = useCart()
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {backTo ? (
              <Link to={backTo} className="text-gray-600 hover:text-gray-900 mr-2">
                <span className="inline-block rotate-180">➜</span>
              </Link>
            ) : null}
            <Grid className="text-gray-600 mr-2" />
            <span className="text-xl font-medium text-gray-800">{title}</span>
          </div>

          <div className="flex items-center space-x-4">
            {right ? right : (
              <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
                <ShoppingCart />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            <button className="text-gray-600 hover:text-gray-900 hidden md:inline-flex">
              <LogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
