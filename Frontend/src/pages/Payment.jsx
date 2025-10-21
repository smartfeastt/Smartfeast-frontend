import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Payment() {
  const { total, clear } = useCart()
  const nav = useNavigate()

  return (
    <>
      <Navbar title="Payment" backTo="/cart" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Total</h2>
            <div className="flex justify-between border-t border-gray-200 pt-3 mt-2">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); clear(); nav('/confirmation') }}>
              <input className="block w-full px-4 py-3 border border-gray-300 rounded-md" placeholder="Card Number" />
              <div className="grid grid-cols-2 gap-4">
                <input className="block w-full px-4 py-3 border border-gray-300 rounded-md" placeholder="MM/YY" />
                <input className="block w-full px-4 py-3 border border-gray-300 rounded-md" placeholder="CVC" />
              </div>
              <input className="block w-full px-4 py-3 border border-gray-300 rounded-md" placeholder="Name on Card" />
              <button className="w-full py-3 px-4 rounded-md text-white bg-gray-800 hover:bg-gray-700">Pay ${total.toFixed(2)}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
