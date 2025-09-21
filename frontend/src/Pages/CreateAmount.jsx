import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";

const InputField = ({ label, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none transition"
    />
  </div>
);

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  // Prevent going back to payment page
  useEffect(() => {
    const handlePopState = () => {
      navigate("/dashboard", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  // Polling payment status
  useEffect(() => {
    let intervalId;
    if (paymentData?.collect_request_id && showModal) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/payments/status/${paymentData.collect_request_id}`);
          const status = response.data.data.status;

          if (status === "SUCCESS" || status === "COMPLETED") {
            setPaymentStatus("completed");
            clearInterval(intervalId);
            setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
          } else if (status === "FAILED" || status === "ERROR") {
            setPaymentStatus("failed");
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Error checking payment status:", err);
        }
      }, 3000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [paymentData, showModal, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPaymentData(null);
    setPaymentStatus(null);

    if (!studentName.trim() || !studentId.trim() || !studentEmail.trim() || !amount) {
      setError("Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const student_info = {
        name: studentName.trim(),
        id: studentId.trim(),
        email: studentEmail.trim(),
      };
      const response = await api.post("/payments/create-payment", { amount, student_info });
      const { payment_url, collect_request_id } = response.data;
      setPaymentData({ payment_url, collect_request_id });
      setShowModal(true);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Payment creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background SVG */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNlMmU2ZmYiIHN0cm9rZS13aWR0aD0iMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiLz48L2c+PC9zdmc+')]"></div>

      <div className="absolute top-10 left-10 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-10 border border-gray-100 z-10">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Create Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField label="Student Name" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name" />
          <InputField label="Phone Number" type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Enter student phone number" />
          <InputField label="Student Email" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="Enter student email" />
          <InputField label="Amount (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 bg-gray-200 text-gray-800 font-semibold rounded-lg flex items-center justify-center shadow-sm transition-colors ${
              loading ? "cursor-not-allowed opacity-80" : "hover:bg-gray-300 hover:shadow-md"
            }`}
          >
            {loading ? (
              <>
                <Spinner className="w-5 h-5 mr-2" />
                Creating Payment...
              </>
            ) : (
              "Create Payment"
            )}
          </button>
        </form>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center">
              <Spinner className="w-10 h-10 mb-2" />
              <p className="text-gray-700 font-medium">Creating Payment...</p>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showModal && paymentData && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={() => !paymentStatus && setShowModal(false)}></div>

            <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-sm transform transition-transform duration-300 scale-95 opacity-0 animate-fadeIn">
              {!paymentStatus ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Created!</h3>
                  <p className="mb-2">
                    <span className="font-medium">Collect Request ID:</span> {paymentData.collect_request_id}
                  </p>
                  <p className="mb-4 text-sm text-gray-600">You will be redirected to dashboard after successful payment</p>
                  <a href={paymentData.payment_url} target="_blank" rel="noopener noreferrer" className="inline-block w-full text-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition mb-4">
                    Pay Now
                  </a>
                  <button onClick={() => navigate("/dashboard", { replace: true })} className="w-full text-center border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100 transition">
                    Finish Payment
                  </button>
                </>
              ) : paymentStatus === "completed" ? (
                <>
                  <h3 className="text-lg font-semibold text-green-600 mb-4">Payment Successful!</h3>
                  <p className="mb-4">Redirecting to dashboard...</p>
                  <div className="flex justify-center">
                    <Spinner className="w-6 h-6" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Payment Failed</h3>
                  <p className="mb-4">Please try again</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setPaymentStatus(null);
                    }}
                    className="w-full text-center bg-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes fadeIn {0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); }}
            .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
          `}
        </style>
      </div>
    </div>
  );
};

export default PaymentForm;
