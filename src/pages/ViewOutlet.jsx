import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Search, Plus } from "react-feather";
import { useAppSelector, useAppDispatch } from "../store/hooks.js";
import { addToCart } from "../store/slices/cartSlice.js";
import {
  fetchMenuItems,
  fetchCategories,
  setCurrentOutlet,
  setSearch,
  setMaxPrice,
  setMinRating,
  setSpicy,
  toggleDiet as toggleDietAction,
  setCategory,
  selectMenuItems,
  selectCategories,
  selectOutlet,
  selectMenuLoading,
  selectMenuFilters,
  selectFilteredItems,
  selectHasOutletData,
} from "../store/slices/menuSlice.js";
import DynamicHeader from "../components/headers/DynamicHeader.jsx";

export default function ViewOutlet() {
  const { restaurantName, outletName } = useParams();
  const dispatch = useAppDispatch();

  // Get data from Redux
  const items = useAppSelector(selectMenuItems);
  const categories = useAppSelector(selectCategories);
  const outlet = useAppSelector(selectOutlet);
  const loading = useAppSelector(selectMenuLoading);
  const filters = useAppSelector(selectMenuFilters);
  const filteredItems = useAppSelector(selectFilteredItems);
  const hasData = useAppSelector(selectHasOutletData(restaurantName, outletName));

  // Local state for active tab
  const [active, setActive] = useState("All");

  // Dynamic tabs based on categories
  const tabs = useMemo(() => {
    const categoryNames = new Set(categories.map(cat => cat.name.trim()));
    
    items.forEach(item => {
      if (item.category && item.category.trim()) {
        categoryNames.add(item.category.trim());
      }
    });
    
    const categoryTabs = Array.from(categoryNames).sort();
    return ["All", ...categoryTabs];
  }, [categories, items]);

  // Set current outlet and fetch data if needed
  useEffect(() => {
    dispatch(setCurrentOutlet({ restaurantName, outletName }));
    
    // Fetch data if not cached
    if (!hasData) {
      dispatch(fetchMenuItems({ restaurantName, outletName })).then((result) => {
        if (result.payload?.outlet?._id) {
          dispatch(fetchCategories({
            outletId: result.payload.outlet._id,
            restaurantName,
            outletName,
          }));
        }
      });
    }
  }, [restaurantName, outletName, dispatch, hasData]);

  // Update category filter when tab changes
  useEffect(() => {
    dispatch(setCategory(active));
  }, [active, dispatch]);

  // Filter items by active category
  const visible = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  // Group visible items by category
  const itemsByCategory = useMemo(() => {
    if (visible.length === 0) return {};
    
    const grouped = visible.reduce((acc, item) => {
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
    
    if (active === "All") {
      const sorted = {};
      Object.keys(grouped).sort().forEach(key => {
        sorted[key] = grouped[key];
      });
      return sorted;
    }
    return grouped;
  }, [visible, active]);

  // Handle diet toggle
  const handleToggleDiet = (diet) => {
    dispatch(toggleDietAction(diet));
  };

  // Loading state
  if (loading && !hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

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

      {/* Banner */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={outlet?.outletImage || outlet?.profilePhotoUrl || outlet?.image || "https://via.placeholder.com/300"}
                alt={outlet?.name || "Outlet"}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300";
                }}
              />
            </div>
          </div>

          <div className="md:pl-8 w-full md:w-2/3 lg:w-3/4 mt-4 md:mt-0">
            <h1 className="text-2xl font-bold">{outlet?.name || outletName}</h1>

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

      {/* Tabs */}
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

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search || ''}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 border rounded-md"
            />
          </div>

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice ?? ""}
            className="border rounded-md px-2 py-2"
            onChange={(e) =>
              dispatch(setMaxPrice(e.target.value ? Number(e.target.value) : null))
            }
          />

          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="Min Rating"
            value={filters.minRating || 0}
            className="border rounded-md px-2 py-2"
            onChange={(e) => dispatch(setMinRating(Number(e.target.value)))}
          />

          <select
            value={filters.spicy ?? ""}
            className="border rounded-md px-2 py-2"
            onChange={(e) =>
              dispatch(setSpicy(e.target.value === "" ? null : Number(e.target.value)))
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
              onClick={() => handleToggleDiet(d)}
              className={`text-sm px-3 py-1.5 rounded-full border ${
                filters.diet?.includes(d)
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid - Grouped by Category */}
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
                          onClick={() => dispatch(addToCart({ 
                            item: m, 
                            quantity: 1, 
                            outletId: outlet?._id 
                          }))}
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
}