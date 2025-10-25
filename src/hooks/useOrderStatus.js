import { useEffect, useState } from "react";

export default function useOrderStatus(orderId) {
  const [status, setStatus] = useState("Preparing");

  useEffect(() => {
    const ws = new WebSocket("wss://example.com/orders");
    ws.onopen = () => ws.send(JSON.stringify({ subscribe: orderId }));
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) setStatus(data.status);
      } catch {}
    };
    return () => ws.close();
  }, [orderId]);

  return status;
}
