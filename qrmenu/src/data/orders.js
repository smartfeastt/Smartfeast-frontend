export const staffOrders = [
  {
    id: 'QRM-28495',
    time: '12:45 PM',
    status: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
    table: 12,
    minutesAgo: 5,
    items: [
      { name: 'Truffle Arancini', meta: '1 × $12.00', price: '$12.00' },
      { name: 'Burrata Salad', meta: '1 × $14.00', price: '$14.00' },
      { note: 'No onions in the salad, please' }
    ],
    total: '$26.00',
    type: 'pending',
  },
  {
    id: 'QRM-28496',
    time: '12:30 PM',
    status: { label: 'Preparing', classes: 'bg-green-100 text-green-800' },
    table: 8,
    minutesAgo: 20,
    items: [
      { name: 'Filet Mignon', meta: '1 × $32.00', price: '$32.00' },
      { name: 'Chocolate Soufflé', meta: '1 × $10.00', price: '$10.00' },
    ],
    total: '$44.20',
    type: 'preparing',
  },
  {
    id: 'QRM-28497',
    time: '12:15 PM',
    status: { label: 'Ready', classes: 'bg-blue-100 text-blue-800' },
    table: 5,
    minutesAgo: 35,
    items: [
      { name: 'Mushroom Risotto', meta: '2 × $22.00', price: '$44.00' },
      { name: 'House Salad', meta: '1 × $8.00', price: '$8.00' },
    ],
    total: '$54.40',
    type: 'ready',
  },
]
