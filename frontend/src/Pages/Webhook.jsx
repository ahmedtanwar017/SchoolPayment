import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../Services/Axios";

const PaymentStatusPage = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const orderId = searchParams.get("EdvironCollectRequestId");
        const status = searchParams.get("status") || "pending";

        // ✅ Make sure frontend calls the exact URL with query params
        const res = await api.get("/webhooks", {
          params: { EdvironCollectRequestId: orderId, status },
        });

        console.log("✅ Backend Response:", res.data); // debug
        setStatusData(res.data.order_info);
      } catch (err) {
        console.error("❌ Error fetching payment status:", err);
        setStatusData({ status: "failed", error_message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [searchParams]);

  if (loading) return <p className="p-10 text-xl">Loading payment status...</p>;

  const status = statusData.status?.toLowerCase();

  return (
    <div className="p-10 flex flex-col items-center">
      {status === "success" && (
        <div className="text-center text-green-600">
          <h1 className="text-3xl font-bold">✅ Payment Successful</h1>
          <p>Order ID: {statusData.order_id}</p>
        </div>
      )}
      {(status === "failed" || status === "cancelled") && (
        <div className="text-center text-red-600">
          <h1 className="text-3xl font-bold">❌ Payment {status.toUpperCase()}</h1>
          <p>Order ID: {statusData.order_id}</p>
          <p>Reason: {statusData.error_message}</p>
        </div>
      )}
      {status === "pending" && (
        <div className="text-center text-yellow-600">
          <h1 className="text-3xl font-bold">⏳ Payment Pending</h1>
          <p>Order ID: {statusData.order_id}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusPage;
