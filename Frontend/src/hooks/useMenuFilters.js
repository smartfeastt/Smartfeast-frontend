import { useMemo, useState } from 'react'

/**
 * items shape expected:
 * {
 *  title, desc, price, category,
 *  rating (number 0-5),
 *  dietary: ['vegan','gluten-free', ...],
 *  spicy: 0|1|2|3,
 *  tags?: ['truffle','cheese', ...]
 * }
 */
export default function useMenuFilters(items) {
  const [q, setQ] = useState('')
  const [maxPrice, setMaxPrice] = useState(null) // number | null
  const [minRating, setMinRating] = useState(0)  // 0..5
  const [diet, setDiet] = useState(new Set())    // Set<string>
  const [spicy, setSpicy] = useState(null)       // null or 0..3

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter(i => {
      const textMatch =
        !needle ||
        i.title.toLowerCase().includes(needle) ||
        i.desc.toLowerCase().includes(needle) ||
        (i.tags?.some(t => t.toLowerCase().includes(needle)))

      const priceOk = !maxPrice || i.price <= maxPrice
      const ratingOk = (i.rating ?? 0) >= minRating
      const dietOk = diet.size === 0 || [...diet].every(d => i.dietary?.includes(d))
      const spicyOk = spicy === null || (i.spicy ?? 0) === spicy

      return textMatch && priceOk && ratingOk && dietOk && spicyOk
    })
  }, [items, q, maxPrice, minRating, diet, spicy])

  return {
    q, setQ,
    maxPrice, setMaxPrice,
    minRating, setMinRating,
    diet, setDiet,
    spicy, setSpicy,
    visible
  }
}
