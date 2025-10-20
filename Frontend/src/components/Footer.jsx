import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">QRMenu</h3>
            <p className="text-sm text-gray-500">Simplifying restaurant ordering with QR technology.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">For Customers</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Browse Restaurants</span></li>
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">How It Works</span></li>
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">FAQ</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">For Restaurants</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Get Started</span></li>
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Pricing</span></li>
              <li><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Resources</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Connect</h3>
            <div className="flex space-x-4 text-gray-400">
              <span className="hover:text-gray-500 cursor-pointer">Facebook</span>
              <span className="hover:text-gray-500 cursor-pointer">Instagram</span>
              <span className="hover:text-gray-500 cursor-pointer">Twitter</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
          <p>© 2023 QRMenu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
