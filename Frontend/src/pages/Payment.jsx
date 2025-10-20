import Navbar from '../components/Navbar'
import { CreditCard } from 'react-feather'
import { Link } from 'react-router-dom'

export default function Payment() {
  return (
    <>
      <Navbar title="Payment" restaurant="The Urban Eatery" backTo="/cart" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Truffle Arancini</span>
                <span className="text-gray-900">$12.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Burrata Salad</span>
                <span className="text-gray-900">$14.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chocolate Soufflé</span>
                <span className="text-gray-900">$10.00</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-medium text-gray-900">$38.88</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input id="card-number" className="focus:ring-gray-500 focus:border-gray-500 block w-full pl-4 pr-12 py-3 border-gray-300 rounded-md" placeholder="1234 5678 9012 3456" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CreditCard className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input id="expiry" className="focus:ring-gray-500 focus:border-gray-500 block w-full px-4 py-3 border-gray-300 rounded-md" placeholder="MM/YY" />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                  <input id="cvc" className="focus:ring-gray-500 focus:border-gray-500 block w-full px-4 py-3 border-gray-300 rounded-md" placeholder="CVC" />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name on Card</label>
                <input id="name" className="focus:ring-gray-500 focus:border-gray-500 block w-full px-4 py-3 border-gray-300 rounded-md" placeholder="Full Name" />
              </div>

              <label className="flex items-center">
                <input id="save-card" type="checkbox" className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                <span className="ml-2 block text-sm text-gray-700">Save card for future payments</span>
              </label>
            </form>
          </div>
        </div>

        {/* Pay Now */}
        <div className="mt-8">
          <Link to="/confirmation" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Pay $38.88
          </Link>
        </div>
      </div>
    </>
  )
}
