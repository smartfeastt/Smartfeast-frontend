import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../store/hooks.js";
import { setTable } from "../store/slices/cartSlice.js";

export default function useTableDetection() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const table = new URLSearchParams(location.search).get("table");
    if (table) dispatch(setTable(table));
  }, [location, dispatch]);
}
