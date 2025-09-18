import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Dynamically import App
const App = lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
    <App />
  </Suspense>
);
