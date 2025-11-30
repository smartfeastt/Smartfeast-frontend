import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Search, Plus } from "react-feather";
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { addToCart } from "../store/slices/cartSlice.js";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function ViewOutlet() {
  const { restaurantName, outletName } = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // -------------------------------
  // ALL HOOKS (ALWAYS IN SAME ORDER)
  // -------------------------------
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState("All");

  // Dynamic tabs based on categories from both Category model and actual items
  const tabs = useMemo(() => {
    // Get category names from Category model
    const categoryNames = new Set(categories.map(cat => cat.name.trim()));
    
    // Also get unique categories from items
    items.forEach(item => {
      if (item.category && item.category.trim()) {
        categoryNames.add(item.category.trim());
      }
    });
    
    // Convert to array and sort
    const categoryTabs = Array.from(categoryNames).sort();
    return ["All", ...categoryTabs];
  }, [categories, items]);

  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [spicy, setSpicy] = useState(null);
  const [diet, setDiet] = useState(new Set());

  // -------------------------------
  // FETCH OUTLET ITEMS AND CATEGORIES
  // -------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch items and outlet
        const response = await fetch(
          `${API_URL}/api/item/view/${restaurantName}/${outletName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setItems(data.items || []);
          setOutlet(data.outlet || null);
          
          // Store outletId in items for cart reference
          if (data.outlet?._id && data.items) {
            data.items = data.items.map(item => ({
              ...item,
              outletId: data.outlet._id
            }));
            setItems(data.items);
          }

          // Fetch categories if we have outlet ID
          if (data.outlet?._id) {
            try {
              const catResponse = await fetch(
                `${API_URL}/api/category/outlet/${data.outlet._id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              
              const catData = await catResponse.json();
              if (catData.success) {
                setCategories(catData.categories || []);
              }
            } catch (catErr) {
              console.error("Error loading categories:", catErr);
            }
          }
        } else {
          console.error("Failed to load items:", data.message);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantName, outletName]);

  // -------------------------------
  // FILTERS & CATEGORIES (HOOK SAFE)
  // -------------------------------
  const filteredByCategory = useMemo(() => {
    if (active === "All") return items;

    return items.filter((m) => {
      const itemCategory = (m.category || "").trim().toLowerCase();
      const activeCategory = active.trim().toLowerCase();
      return itemCategory === activeCategory;
    });
  }, [active, items]);

  const visible = useMemo(() => {
    return filteredByCategory.filter((m) => {
      if (q && !m.itemName.toLowerCase().includes(q.toLowerCase())) return false;
      if (maxPrice !== null && m.itemPrice > maxPrice) return false;
      if (minRating > 0 && (m.rating || 0) < minRating) return false;
      if (spicy !== null && m.spicyLevel !== spicy) return false;
      if (diet.size > 0 && !diet.has(m.diet?.toLowerCase())) return false;
      return m.isAvailable !== false;
    });
  }, [filteredByCategory, q, maxPrice, minRating, spicy, diet]);

  // Group visible items by category
  const itemsByCategory = useMemo(() => {
    if (visible.length === 0) return {};
    
    const grouped = visible.reduce((acc, item) => {
      // Handle empty, null, or undefined categories
      let category = item.category;
      if (!category || typeof category !== 'string' || category.trim() === '') {
        category = "Other";
      } else {
        category = category.trim();
      }
      
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
    
    // Sort categories alphabetically when "All" is selected
    if (active === "All") {
      const sorted = {};
      Object.keys(grouped).sort().forEach(key => {
        sorted[key] = grouped[key];
      });
      return sorted;
    }
    return grouped;
  }, [visible, active]);

  const toggleDiet = (key) =>
    setDiet((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // -------------------------------
  // SAFE EARLY RETURN (AFTER HOOKS)
  // -------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  // -------------------------------
  // UI RENDER
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            to={`/view/${restaurantName}`}
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to {restaurantName}
          </Link>
        </div>
      </div>

      {/* BANNER LIKE MENU PAGE */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={outlet?.image || "https://via.placeholder.com/300"}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="md:pl-8 w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-2xl font-bold">{outlet?.name}</h1>

            <div className="flex items-center mt-2">
              <div className="flex items-center text-sm text-gray-500 mr-4">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{outlet?.rating || "4.5"} Rating</span>
              </div>
              <div className="text-sm text-gray-500">
                ₹₹ • {outlet?.type || "Cafe"}
              </div>
            </div>

            <p className="mt-4 text-gray-600">
              {outlet?.description ||
                "Delicious food served fresh. Enjoy the best taste in town!"}
            </p>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{outlet?.timings || "Open • 10:00 AM – 11:00 PM"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto space-x-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`py-4 px-1 text-sm font-medium whitespace-nowrap ${
                active === t
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 border rounded-md"
            />
          </div>

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice ?? ""}
            className="border rounded-md px-2 py-2"
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : null)
            }
          />

          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="Min Rating"
            value={minRating}
            className="border rounded-md px-2 py-2"
            onChange={(e) => setMinRating(Number(e.target.value))}
          />

          <select
            value={spicy ?? ""}
            className="border rounded-md px-2 py-2"
            onChange={(e) =>
              setSpicy(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">Spicy (Any)</option>
            <option value="0">Mild</option>
            <option value="1">Low</option>
            <option value="2">Medium</option>
            <option value="3">Hot</option>
          </select>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4 flex flex-wrap gap-2">
          {["vegetarian", "vegan", "gluten-free"].map((d) => (
            <button
              key={d}
              onClick={() => toggleDiet(d)}
              className={`text-sm px-3 py-1.5 rounded-full border ${
                diet.has(d)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* GRID - Grouped by Category */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 && !loading ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">No menu items available.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">No items match your filters.</p>
            <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        ) : Object.keys(itemsByCategory).length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">No items to display.</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                  >
                    {m.itemPhoto && (
                      <img
                        src={m.itemPhoto}
                        alt={m.itemName}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{m.itemName}</h3>
                      {m.itemDescription && (
                        <p className="text-sm text-gray-600 mb-2">
                          {m.itemDescription}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold">₹{m.itemPrice}</span>
                        <button
                          onClick={() => dispatch(addToCart({ item: m, quantity: 1, outletId: outlet?._id }))}
                          className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                        >
                          <Plus size={16} />
                          Add to Cart
                        </button>
                      </div>
                      {m.itemQuantity !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {m.itemQuantity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
