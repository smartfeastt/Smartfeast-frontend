import Navbar from '../components/Navbar'
import { Check } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Confirm() {
  return (
    <>
      <Navbar title="QRMenu" right={<Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2">Home</Link>} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">Order Confirmed!</h1>
          <p className="mt-4 text-lg text-gray-600">Your order has been placed successfully at <span className="font-medium text-gray-900">The Urban Eatery</span>.</p>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order #</span>
                <span className="text-gray-900">QRM-28495</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table</span>
                <span className="text-gray-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="text-gray-900">12:45 PM</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-medium text-gray-900">$38.88</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-gray-600">Your food will be served shortly. Thank you for your order!</p>
          </div>

          <div className="mt-10">
            <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
