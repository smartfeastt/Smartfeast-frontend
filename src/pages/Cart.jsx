import Navbar from "../components/Navbar"
import { Trash2 } from "react-feather"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

export default function Cart() {
  const {
    items, setQty, remove, subtotal, tax, total, perHead,
    note, setNote, table, setTable,
    coupon, applyCoupon, removeCoupon,
    tip, setTip, shareCount, setShareCount
  } = useCart()
  const nav = useNavigate()

  const tryCoupon = (e) => {
    e.preventDefault()
    const code = new FormData(e.currentTarget).get("code")
    const res = applyCoupon(code)
    if (!res.ok) alert(res.message)
  }

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
              <div key={it.lineId ?? it.title} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 flex gap-4">
                    {it.img && <img src={it.img} alt={it.title} className="w-20 h-16 object-cover rounded" />}
                    <div>
                      <h3 className="font-medium text-gray-900">{it.title}</h3>
                      <p className="text-sm text-gray-500">{it.desc}</p>
                      {it.optionsSelected && (
                        <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                          {it.optionsSelected.size && <li>Size: {it.optionsSelected.size.label}</li>}
                          {it.optionsSelected.doneness && <li>Doneness: {it.optionsSelected.doneness.label}</li>}
                          {it.optionsSelected.side && <li>Side: {it.optionsSelected.side.label}</li>}
                          {Array.isArray(it.optionsSelected.extras) && it.optionsSelected.extras.length>0 && (
                            <li>Extras: {it.optionsSelected.extras.map(e => e.label).join(", ")}</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-900 font-medium">${it.price.toFixed(2)}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-900" onClick={() => setQty(it.lineId ?? it.title, it.qty - 1)}>-</button>
                    <span className="px-3">{it.qty}</span>
                    <button className="px-3 py-1 text-gray-600 hover:text-gray-900" onClick={() => setQty(it.lineId ?? it.title, it.qty + 1)}>+</button>
                  </div>
                  <button className="text-red-500 hover:text-red-700" onClick={() => remove(it.lineId ?? it.title)}>
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

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm mt-6 p-4 space-y-4">
          {/* Coupons */}
          <form onSubmit={tryCoupon} className="flex gap-2 items-center">
            <input name="code" placeholder="Promo code"
              className="flex-1 border rounded-md px-3 py-2" defaultValue={coupon?.code ?? ""}/>
            {coupon ? (
              <button type="button" onClick={() => removeCoupon()} className="px-3 py-2 rounded-md border">Remove</button>
            ) : (
              <button className="px-3 py-2 rounded-md bg-gray-900 text-white">Apply</button>
            )}
            {coupon && <span className="text-sm text-green-700 ml-2">Applied: {coupon.code}</span>}
          </form>

          {/* Tips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Tip:</span>
            {[0, 0.05, 0.1, 0.15].map(p => (
              <button key={p}
                onClick={() => setTip(p === 0 ? 0 : Math.round((subtotal * p) * 100)/100)}
                className={`px-3 py-1.5 rounded-full border text-sm ${((p===0 && tip===0) || (p>0 && Math.abs(tip - subtotal*p) < 0.01)) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300'}`}>
                {p===0 ? "No Tip" : `${Math.round(p*100)}%`}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-600">$</span>
              <input type="number" min="0" step="0.5" value={tip}
                onChange={e => setTip(Number(e.target.value))}
                className="w-24 border rounded-md px-2 py-1.5 text-sm"/>
            </div>
          </div>

          {/* Split */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Split among</label>
            <input type="number" min="0" step="1" value={shareCount}
              onChange={e => setShareCount(Number(e.target.value))}
              className="w-20 border rounded-md px-2 py-1.5 text-sm"/>
            <span className="text-sm text-gray-600">{shareCount>0 ? `(per person: $${perHead.toFixed(2)})` : "(enter >0 to split)"}</span>
          </div>

          {/* Totals */}
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
            {shareCount>0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Per person</span>
                <span className="text-gray-900">${perHead.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Place Order */}
        <div className="mt-8">
          <button
            onClick={() => nav("/payment")}
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
