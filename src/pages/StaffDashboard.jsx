import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { useState } from "react";

export default function StaffDashboard() {
  const [orders, setOrders] = useState([
    { id: 1, table: "12", items: [{ title: "Pizza" }], status: "Pending" },
    { id: 2, table: "5", items: [{ title: "Pasta" }], status: "Preparing" },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders((os) => os.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <>
      <Navbar title="Staff Dashboard" />
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-4">
        {orders.map(o => (
          <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
        ))}
      </div>
    </>
  );
}
