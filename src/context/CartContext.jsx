import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react"

const CartContext = createContext(null)
const TAX_RATE = 0.08

function lineKey(title, options) {
  return JSON.stringify({ title, options: options || {} })
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item } = action
      const key = item.lineId || lineKey(item.title, item.optionsSelected)
      const existing = state.items[key]
      const qty = existing ? existing.qty + (item.qty || 1) : (item.qty || 1)
      return { ...state, items: { ...state.items, [key]: { ...item, lineId: key, qty } } }
    }
    case "REMOVE": {
      const next = { ...state.items }
      delete next[action.key]
      return { ...state, items: next }
    }
    case "QTY": {
      const { key, qty } = action
      if (qty <= 0) {
        const next = { ...state.items }
        delete next[key]
        return { ...state, items: next }
      }
      return { ...state, items: { ...state.items, [key]: { ...state.items[key], qty } } }
    }
    case "NOTE": return { ...state, note: action.note }
    case "TABLE": return { ...state, table: action.table }
    case "CLEAR": return { ...state, items: {}, note: "", table: "" }
    case "LOAD": return action.payload || state
    default: return state
  }
}

const initialState = { items: {}, note: "", table: "" }

const COUPONS = {
  WELCOME10: { type: "percent", value: 0.10 },
  FLAT5: { type: "flat", value: 5 }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [coupon, setCoupon] = useState(null)
  const [tip, setTip] = useState(0)
  const [shareCount, setShareCount] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qr_cart")
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: "LOAD", payload: parsed.state })
        setCoupon(parsed.coupon ?? null)
        setTip(parsed.tip ?? 0)
        setShareCount(parsed.shareCount ?? 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("qr_cart", JSON.stringify({ state, coupon, tip, shareCount }))
    } catch {}
  }, [state, coupon, tip, shareCount])

  const api = useMemo(() => {
    const list = Object.values(state.items)
    const count = list.reduce((n, it) => n + it.qty, 0)

    const lineTotal = (it) => {
      let delta = 0
      const sel = it.optionsSelected || {}
      if (sel.size?.delta) delta += sel.size.delta
      if (sel.doneness?.delta) delta += sel.doneness.delta
      if (sel.side?.delta) delta += sel.side.delta
      if (Array.isArray(sel.extras)) delta += sel.extras.reduce((s, e) => s + (e.delta || 0), 0)
      return (it.price + delta) * it.qty
    }

    const subtotal = +list.reduce((sum, it) => sum + lineTotal(it), 0).toFixed(2)
    const tax = +(subtotal * TAX_RATE).toFixed(2)

    const discount = (() => {
      if (!coupon) return 0
      if (coupon.type === "percent") return +(subtotal * coupon.value).toFixed(2)
      if (coupon.type === "flat") return Math.min(subtotal, coupon.value)
      return 0
    })()

    const total = +(subtotal - discount + tax + tip).toFixed(2)
    const perHead = shareCount > 0 ? +(total / shareCount).toFixed(2) : total

    const add = (item) => dispatch({ type: "ADD", item })
    const remove = (key) => dispatch({ type: "REMOVE", key })
    const setQty = (key, qty) => dispatch({ type: "QTY", key, qty })
    const setNote = (note) => dispatch({ type: "NOTE", note })
    const setTable = (table) => dispatch({ type: "TABLE", table })
    const clear = () => dispatch({ type: "CLEAR" })

    const applyCoupon = (code) => {
      const c = COUPONS[code?.trim().toUpperCase()]
      if (!c) return { ok: false, message: "Invalid code" }
      setCoupon({ code: code.toUpperCase(), ...c })
      return { ok: true }
    }
    const removeCoupon = () => setCoupon(null)

    return {
      items: list, count, subtotal, tax, total, perHead,
      note: state.note, table: state.table,
      coupon, applyCoupon, removeCoupon,
      tip, setTip,
      shareCount, setShareCount,
      add, remove, setQty, setNote, setTable, clear
    }
  }, [state, coupon, tip, shareCount])

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
