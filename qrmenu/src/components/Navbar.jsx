import { Grid } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Navbar({ title = 'QRMenu', right, restaurant, backTo }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {backTo ? (
              <Link to={backTo} className="text-gray-600 hover:text-gray-900">
                <span className="mr-2">←</span>
              </Link>
            ) : (
              <Grid className="text-gray-600 mr-2" />
            )}
            <span className="text-lg md:text-xl font-medium text-gray-800">{title}</span>
          </div>
          <div className="flex items-center space-x-4">
            {restaurant && <span className="text-sm text-gray-600">{restaurant}</span>}
            {right}
          </div>
        </div>
      </div>
    </nav>
  )
}
