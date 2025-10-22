export const menuItems = [
  {
    title: "Truffle Arancini",
    desc: "Crispy risotto balls with black truffle and mozzarella",
    price: 12, category: "Starters", rating: 4.6, spicy: 0,
    dietary: ["vegetarian"], tags: ["truffle","cheese","rice"],
    img: "https://images.unsplash.com/photo-1604908177522-cae4b0bce52b?auto=format&fit=crop&w=800&q=80",
    options: {
      size: [
        { label: "Regular", delta: 0 },
        { label: "Large", delta: 3 }
      ],
      extras: [
        { label: "Extra Mozzarella", delta: 1.5 },
        { label: "Garlic Aioli", delta: 0.75 }
      ]
    }
  },
  {
    title: "Burrata Salad",
    desc: "Creamy burrata with heirloom tomatoes and basil",
    price: 14, category: "Starters", rating: 4.7, spicy: 0,
    dietary: ["vegetarian","gluten-free"], tags: ["burrata","tomato","basil"],
    img: "https://images.unsplash.com/photo-1601924638867-3ec4c8e6e9f7?auto=format&fit=crop&w=800&q=80",
    options: { extras: [{ label: "Balsamic Glaze", delta: 0.5 }] }
  },
  {
    title: "Grilled Octopus",
    desc: "Tender octopus with lemon aioli and smoked paprika",
    price: 18, category: "Mains", rating: 4.8, spicy: 1,
    dietary: [], tags: ["seafood","grill"],
    img: "https://images.unsplash.com/photo-1601050690597-98f34a359d09?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Filet Mignon",
    desc: "8oz grass-fed beef with truffle mashed potatoes",
    price: 32, category: "Mains", rating: 4.9, spicy: 0,
    dietary: [], tags: ["steak","beef","truffle"],
    img: "https://images.unsplash.com/photo-1606755962773-8d60c82bcb84?auto=format&fit=crop&w=800&q=80",
    options: {
      doneness: [
        { label: "Rare", delta: 0 },
        { label: "Medium", delta: 0 },
        { label: "Well Done", delta: 0 }
      ],
      side: [
        { label: "Truffle Mash", delta: 0 },
        { label: "Seasonal Veg", delta: 0 },
        { label: "Fries", delta: 0 }
      ],
      extras: [{ label: "Peppercorn Sauce", delta: 2 }]
    }
  },
  {
    title: "Mushroom Risotto",
    desc: "Creamy arborio rice with wild mushrooms and parmesan",
    price: 22, category: "Mains", rating: 4.6, spicy: 0,
    dietary: ["vegetarian","gluten-free"], tags: ["mushroom","rice","cheese"],
    img: "https://images.unsplash.com/photo-1598514982651-6c1dbd4b7b67?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Chocolate Soufflé",
    desc: "Warm chocolate dessert with vanilla bean ice cream",
    price: 10, category: "Desserts", rating: 4.7, spicy: 0,
    dietary: ["vegetarian"], tags: ["dessert","chocolate"],
    img: "https://images.unsplash.com/photo-1599785209790-0889a8a27d8b?auto=format&fit=crop&w=800&q=80",
    options: { extras: [{ label: "Extra Ice Cream", delta: 1 }] }
  }
]
