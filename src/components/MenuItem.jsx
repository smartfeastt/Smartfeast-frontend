import { useState } from "react"
import { useAppDispatch } from "../store/hooks.js"
import { addToCart } from "../store/slices/cartSlice.js"
import OptionsModal from "./OptionsModal"

export default function MenuItem({ title, desc, price, img, options }) {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const addSimple = () => dispatch(addToCart({ item: { title, desc, price, img, itemName: title, itemPrice: price, itemPhoto: img }, quantity: 1 }))

  const addWithOptions = ({ optionsSelected }) => {
    const lineId = JSON.stringify({ title, options: optionsSelected })
    dispatch(addToCart({ item: { title, desc, price, img, options, optionsSelected, lineId, itemName: title, itemPrice: price, itemPhoto: img }, quantity: 1 }))
  }

  return (
    <div className="menu-item bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition">
      {img && <img src={img} alt={title} className="w-full h-48 object-cover" loading="lazy" />}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gray-900 font-medium">${price.toFixed(2)}</div>
          {options ? (
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
            >
              Customize
            </button>
          ) : (
            <button
              onClick={addSimple}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
            >
              Add
            </button>
          )}
        </div>
      </div>

      <OptionsModal
        open={open}
        onClose={() => setOpen(false)}
        item={{ title, price, options }}
        onAdd={addWithOptions}
      />
    </div>
  )
}
