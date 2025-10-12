import Navbar from '../components/Navbar'
import { Trash2 } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Cart() {
  return (
    <>
      <Navbar title="Your Order" restaurant="The Urban Eatery" backTo="/menu" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Item 1 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Truffle Arancini</h3>
                <p className="text-sm text-gray-500 mt-1">Crispy risotto balls with black truffle</p>
              </div>
              <div className="text-gray-900 font-medium">$12</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">-</button>
                <span className="px-2">1</span>
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">+</button>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Burrata Salad</h3>
                <p className="text-sm text-gray-500 mt-1">Creamy burrata with heirloom tomatoes</p>
              </div>
              <div className="text-gray-900 font-medium">$14</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">-</button>
                <span className="px-2">1</span>
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">+</button>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Chocolate Soufflé</h3>
                <p className="text-sm text-gray-500 mt-1">Warm chocolate dessert</p>
              </div>
              <div className="text-gray-900 font-medium">$10</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">-</button>
                <span className="px-2">1</span>
                <button className="px-3 py-1 text-gray-600 hover:text-gray-900">+</button>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="p-4 border-b border-gray-200">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
            <textarea id="notes" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="Special requests, allergies, etc."></textarea>
          </div>

          {/* Table */}
          <div className="p-4">
            <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
            <input id="table" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="Enter your table number" />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm mt-6 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">$36.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">$2.88</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">$38.88</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="radio" name="payment" className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300" defaultChecked />
              <span className="ml-3 block text-sm font-medium text-gray-700">Pay at Table</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="payment" className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300" />
              <span className="ml-3 block text-sm font-medium text-gray-700">Credit/Debit Card</span>
            </label>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Link to="/payment" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Place Order
          </Link>
        </div>
      </div>
    </>
  )
}
