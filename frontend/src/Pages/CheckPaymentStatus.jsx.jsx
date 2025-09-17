// src/Pages/CheckPaymentStatus.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";

const CheckPaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [collectRequestId, setCollectRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = async (id) => {
    if (!id) return;

    setLoading(true);
    setStatusData(null);
    setError(null);

    try {
      const response = await api.get(`/payments/status/${id}`);
      setStatusData(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch payment status");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = (e) => {
    e.preventDefault();
    if (!collectRequestId.trim()) {
      setError("Please enter a valid collect_request_id");
      return;
    }
    fetchPaymentStatus(collectRequestId.trim());
  };

  useEffect(() => {
    const id = searchParams.get("collect_request_id");
    if (id) {
      setCollectRequestId(id);
      fetchPaymentStatus(id);
    }
  }, [searchParams]);

  // Helper function to format status with appropriate colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'failed':
      case 'rejected':
        return 'text-red-700 bg-red-100';
      case 'pending':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Check Payment Status</h2>
          <p className="text-gray-500 mt-2">Enter your collect request ID to view payment details</p>
        </div>

        <form onSubmit={handleCheckStatus} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="collectRequestId">
              Collect Request ID
            </label>
            <input
              id="collectRequestId"
              type="text"
              placeholder="e.g., pay_abc123def456"
              value={collectRequestId}
              onChange={(e) => setCollectRequestId(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none transition"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
          >
            {loading ? <Spinner /> : "Check Status"}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        {statusData && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-2 border-gray-200">Payment Details</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium px-2 py-1 rounded-md inline-block ${getStatusColor(statusData.status)}`}>
                  {statusData.status}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Capture Status</p>
                <p className="font-medium text-gray-800">{statusData.capture_status || "N/A"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-gray-800">₹{statusData.amount}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Transaction Amount</p>
                <p className="font-medium text-gray-800">₹{statusData.transaction_amount}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Payment Mode</p>
                <p className="font-medium text-gray-800">{statusData.details?.payment_mode || "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Bank Reference</p>
                <p className="font-medium text-gray-800">{statusData.details?.bank_ref || "N/A"}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-semibold">View Raw Response</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto border border-gray-200">
                  {JSON.stringify(statusData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckPaymentStatus;