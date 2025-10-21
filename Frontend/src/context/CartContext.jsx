import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const TAX_RATE = 0.08

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action
      const key = item.title
      const existing = state.items[key]
      const qty = existing ? existing.qty + (item.qty || 1) : (item.qty || 1)
      return { ...state, items: { ...state.items, [key]: { ...item, qty } } }
    }
    case 'REMOVE': {
      const next = { ...state.items }
      delete next[action.key]
      return { ...state, items: next }
    }
    case 'QTY': {
      const { key, qty } = action
      if (qty <= 0) {
        const next = { ...state.items }
        delete next[key]
        return { ...state, items: next }
      }
      return { ...state, items: { ...state.items, [key]: { ...state.items[key], qty } } }
    }
    case 'NOTE': return { ...state, note: action.note }
    case 'TABLE': return { ...state, table: action.table }
    case 'CLEAR': return { items: {}, note: '', table: '' }
    case 'LOAD': return action.payload || state
    default: return state
  }
}

const initialState = { items: {}, note: '', table: '' }

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qr_cart')
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    try { localStorage.setItem('qr_cart', JSON.stringify(state)) } catch {}
  }, [state])

  const api = useMemo(() => {
    const list = Object.values(state.items)
    const count = list.reduce((n, it) => n + it.qty, 0)
    const subtotal = list.reduce((sum, it) => sum + it.price * it.qty, 0)
    const tax = +(subtotal * TAX_RATE).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)

    return {
      items: list, count, subtotal: +subtotal.toFixed(2), tax, total,
      note: state.note, table: state.table,
      add: (item) => dispatch({ type: 'ADD', item }),
      remove: (key) => dispatch({ type: 'REMOVE', key }),
      setQty: (key, qty) => dispatch({ type: 'QTY', key, qty }),
      setNote: (note) => dispatch({ type: 'NOTE', note }),
      setTable: (table) => dispatch({ type: 'TABLE', table }),
      clear: () => dispatch({ type: 'CLEAR' })
    }
  }, [state])

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
