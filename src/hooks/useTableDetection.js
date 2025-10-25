import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function useTableDetection() {
  const location = useLocation();
  const { setTable } = useCart();

  useEffect(() => {
    const table = new URLSearchParams(location.search).get("table");
    if (table) setTable(table);
  }, [location]);
}
