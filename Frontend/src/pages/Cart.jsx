import Navbar from '../components/Navbar'
import { Trash2 } from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, setQty, remove, subtotal, tax, total, note, setNote, table, setTable } = useCart()
  const nav = useNavigate()

  return (
    <>
      <Navbar title="Your Order" backTo="/menu" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              Your cart is empty. <Link to="/menu" className="text-gray-800 underline">Browse the menu</Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.title} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex gap-4">
                    {it.img && <img src={it.img} alt={it.title} className="w-20 h-16 object-cover rounded" />}
                    <div>
                      <h3 className="font-medium text-gray-900">{it.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{it.desc}</p>
                    </div>
                  </div>
                  <div className="text-gray-900 font-medium">${it.price.toFixed(2)}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-900" onClick={() => setQty(it.title, it.qty - 1)}>-</button>
                    <span className="px-3">{it.qty}</span>
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-900" onClick={() => setQty(it.title, it.qty + 1)}>+</button>
                  </div>
                  <button className="text-red-500 hover:text-red-700" onClick={() => remove(it.title)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Order Notes */}
          <div className="p-4 border-b border-gray-200">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
            <textarea
              id="notes"
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Special requests, allergies, etc."
            />
          </div>

          {/* Table Number */}
          <div className="p-4">
            <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
            <input
              id="table"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Enter your table number"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm mt-6 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Place Order */}
        <div className="mt-8">
          <button
            onClick={() => nav('/payment')}
            className="w-full flex justify-center py-3 px-4 rounded-md text-lg font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
            disabled={items.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  )
}
