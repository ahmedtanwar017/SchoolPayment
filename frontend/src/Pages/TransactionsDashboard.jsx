import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../Services/Axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Transactions Dashboard with filters, sorting, realtime polling, dark mode, URL persistence
export default function TransactionsDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filters / UI state (persisted to URL)
  const [searchOrderId, setSearchOrderId] = useState("");
  const [statusFilter, setStatusFilter] = useState([]); // multi-select
  const [schoolFilter, setSchoolFilter] = useState([]); // multi-select
  const [dateFilter, setDateFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Sorting
  const [sortKey, setSortKey] = useState("payment_time");
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // url search params (persist filters)
  const [searchParams, setSearchParams] = useSearchParams();

  // For polling (realtime-ish)
  const pollingRef = useRef(null);

  // Handle logout
  const handleLogout = async () => {
  try {
    // 1️⃣ Call backend logout endpoint if you use cookies
    await api.get("/logout");

    // 2️⃣ Clear token from localStorage (if using token auth)
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken"); // optional, if you have separate tokens

    // 3️⃣ Redirect to login page
    navigate("/auth/login", { replace: true });
  } catch (err) {
    console.error("Logout failed:", err);
    
    // Ensure local cleanup & redirect happens even if API fails
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
    navigate("/auth/login", { replace: true });
  }
};


  // fetch (used by initial load and polling)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/transactions");
      // assume data.data is array
      setTransactions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Populate filters from URL on mount
  useEffect(() => {
    const q = Object.fromEntries([...searchParams]);
    if (q.orderId) setSearchOrderId(q.orderId);
    if (q.status) setStatusFilter(q.status.split(",").filter(Boolean));
    if (q.school) setSchoolFilter(q.school.split(",").filter(Boolean));
    if (q.date) setDateFilter(q.date);
    if (q.pageSize) setPageSize(Number(q.pageSize));
    if (q.page) setPage(Number(q.page));
    if (q.sortKey) setSortKey(q.sortKey);
    if (q.sortOrder) setSortOrder(q.sortOrder);
    if (q.theme === "dark") setDarkMode(true);
  }, []); // run once

  // push filters to URL whenever they change
  useEffect(() => {
    const params = {};
    if (searchOrderId) params.orderId = searchOrderId;
    if (statusFilter.length) params.status = statusFilter.join(",");
    if (schoolFilter.length) params.school = schoolFilter.join(",");
    if (dateFilter) params.date = dateFilter;
    if (pageSize !== 10) params.pageSize = String(pageSize);
    if (page !== 1) params.page = String(page);
    if (sortKey) params.sortKey = sortKey;
    if (sortOrder) params.sortOrder = sortOrder;
    if (darkMode) params.theme = "dark";
    setSearchParams(params, { replace: true });
  }, [searchOrderId, statusFilter, schoolFilter, dateFilter, pageSize, page, sortKey, sortOrder, darkMode, setSearchParams]);

  // initial fetch + start polling
  useEffect(() => {
    fetchTransactions();
    // polling every 10s for near-realtime updates
    pollingRef.current = setInterval(fetchTransactions, 10000);
    return () => clearInterval(pollingRef.current);
  }, []);

  // Derived lists for UI filters
  const uniqueSchools = useMemo(() => {
    const s = new Set(transactions.map((t) => t.school_id).filter(Boolean));
    return [...s];
  }, [transactions]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set(transactions.map((t) => t.status).filter(Boolean));
    return [...s];
  }, [transactions]);

  // Filtering
  const filteredTransactions = useMemo(() => {
    const bySearch = transactions.filter((t) =>
      (t.collect_request_id || "").toLowerCase().includes(searchOrderId.toLowerCase())
    );

    const byStatus = statusFilter.length
      ? bySearch.filter((t) => statusFilter.includes(t.status))
      : bySearch;

    const bySchool = schoolFilter.length
      ? byStatus.filter((t) => schoolFilter.includes(t.school_id))
      : byStatus;

    const byDate = dateFilter
      ? bySchool.filter((t) => {
          try {
            const filterDate = new Date(dateFilter);
            const paymentDate = new Date(t.payment_time);
            return paymentDate.toDateString() === filterDate.toDateString();
          } catch (e) {
            return true;
          }
        })
      : bySchool;

    // Sorting
    const sorted = [...byDate].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (!aVal && !bVal) return 0;
      if (sortOrder === "asc") return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });

    return sorted;
  }, [transactions, searchOrderId, statusFilter, schoolFilter, dateFilter, sortKey, sortOrder]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Chart data: group by date and count/sum
  const chartData = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const d = new Date(t.payment_time || t.created_at || Date.now());
      const key = d.toISOString().slice(0, 10);
      const cur = map.get(key) || { date: key, count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += Number(t.transaction_amount || 0);
      map.set(key, cur);
    });
    return [...map.values()].slice(-30); // last 30 days-ish
  }, [transactions]);

  // Helpers for UI interactions
  const toggleStatusOption = (value) => {
    setPage(1);
    setStatusFilter((prev) => (prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]));
  };

  const toggleSchoolOption = (value) => {
    setPage(1);
    setSchoolFilter((prev) => (prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]));
  };

  const changeSort = (key) => {
    if (key === sortKey) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={`dashboard ${darkMode ? "dashboard--dark" : "dashboard--light"}`}>
      <div className="dashboard__content">
        {/* Top Navbar with logout */}
        <div className="dashboard__top-nav">
          <h1 className="dashboard__title">Transactions Dashboard</h1>
          <div className="dashboard__nav-controls">
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="dashboard__theme-toggle"
              title="Toggle theme"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={handleLogout} className="dashboard__logout-btn">
              Logout
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="dashboard__error-message">
            <span>{error}</span>
            <button onClick={fetchTransactions} className="dashboard__retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="dashboard__filters-section">
          <div className="dashboard__filter-group">
            <label className="dashboard__filter-label">Order ID (Collection ID)</label>
            <input
              className="dashboard__search-input"
              placeholder="Search Order ID"
              value={searchOrderId}
              onChange={(e) => {
                setPage(1);
                setSearchOrderId(e.target.value);
              }}
            />
          </div>

          <div className="dashboard__filter-group">
            <label className="dashboard__filter-label">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setPage(1);
                setDateFilter(e.target.value);
              }}
              className="dashboard__date-filter"
            />
          </div>

          <div className="dashboard__filter-group">
            <label className="dashboard__filter-label">Status</label>
            <select
              value={statusFilter.join(",")}
              onChange={(e) => {
                setPage(1);
                const val = e.target.value ? e.target.value.split(",") : [];
                setStatusFilter(val);
              }}
              className="dashboard__status-filter"
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="dashboard__filter-group">
            <label className="dashboard__filter-label">Institute</label>
            <select
              value={schoolFilter.join(",")}
              onChange={(e) => {
                setPage(1);
                const val = e.target.value ? e.target.value.split(",") : [];
                setSchoolFilter(val);
              }}
              className="dashboard__school-filter"
            >
              <option value="">All Institutes</option>
              {uniqueSchools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Line: rows per page and chart */}
        <div className="dashboard__subheader">
          <div className="dashboard__page-size-control">
            <span className="dashboard__page-size-label">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
              className="dashboard__page-size-select"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* small realtime visualization */}
          <div className="dashboard__chart-container">
            <div className="dashboard__chart-title">Recent transactions (count)</div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#e2e8f0" : "#f1f5f9"} />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={darkMode ? { 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    color: '#f1f5f9',
                    borderRadius: '6px'
                  } : {
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    borderRadius: '6px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={darkMode ? "#6366f1" : "#4f46e5"} 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4, fill: darkMode ? "#818cf8" : "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3rd Line: table */}
        <div className="dashboard__table-container">
          <table className="dashboard__table">
            <thead>
              <tr className="dashboard__table-header-row">
                {[
                  { k: "sr", label: "Sr. No", sortable: false },
                  { k: "school_id", label: "Institute Name", sortable: true },
                  { k: "collect_request_id", label: "OrderId", sortable: true },
                  { k: "order_amount", label: "Order Amount", sortable: true },
                  { k: "transaction_amount", label: "Transaction Amount", sortable: true },
                  { k: "payment_mode", label: "Payment Method", sortable: true },
                  { k: "status", label: "Status", sortable: true },
                  { k: "student_name", label: "Student Name", sortable: true },
                  { k: "student_phone", label: "Phone Number", sortable: true },
                ].map((col) => (
                  <th
                    key={col.k}
                    className="dashboard__table-header"
                    onClick={() => col.sortable && changeSort(col.k === "sr" ? "payment_time" : col.k)}
                    title={col.sortable ? "Click to sort" : ""}
                  >
                    <div className="dashboard__header-content">
                      <span>{col.label}</span>
                      {col.sortable && sortKey === (col.k === "sr" ? "payment_time" : col.k) && (
                        <span className="dashboard__sort-indicator">{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="dashboard__loading-cell">
                    <div className="dashboard__loading-spinner"></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="dashboard__no-data-cell">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t, idx) => (
                  <tr key={t.collect_request_id || idx} className="dashboard__table-row">
                    <td className="dashboard__table-cell dashboard__table-cell--center">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="dashboard__table-cell">{t.school_id || "-"}</td>
                    <td className="dashboard__table-cell dashboard__table-cell--mono">{t.collect_request_id}</td>
                    <td className="dashboard__table-cell dashboard__table-cell--numeric">{t.order_amount ? `₹${t.order_amount}` : "-"}</td>
                    <td className="dashboard__table-cell dashboard__table-cell--numeric">{t.transaction_amount ? `₹${t.transaction_amount}` : "-"}</td>
                    <td className="dashboard__table-cell">{t.payment_mode || "-"}</td>
                    <td className="dashboard__table-cell">
                      <span className={`dashboard__status-badge dashboard__status-badge--${t.status?.toLowerCase() || 'unknown'}`}>
                        {t.status || "-"}
                      </span>
                    </td>
                    <td className="dashboard__table-cell">{t.student_info?.name || "-"}</td>
                    <td className="dashboard__table-cell">{t.student_info?.phone || t.student_info?.id || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="dashboard__pagination-controls">
          <div className="dashboard__pagination-buttons">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="dashboard__pagination-button"
            >
              Previous
            </button>
            <span className="dashboard__pagination-info">
              Page {page} of {Math.max(1, Math.ceil(filteredTransactions.length / pageSize))}
            </span>
            <button
              disabled={page * pageSize >= filteredTransactions.length}
              onClick={() => setPage((p) => p + 1)}
              className="dashboard__pagination-button"
            >
              Next
            </button>
          </div>

          <div className="dashboard__total-count">Total Results: {filteredTransactions.length}</div>
        </div>
      </div>

      <style jsx>{`
        /* CSS Variables for consistent theming - Using lighter grey shades */
        :root {
          /* Light theme */
          --light-bg-primary: #ffffff;
          --light-bg-secondary: #fafafa;
          --light-bg-tertiary: #f5f5f5;
          --light-text-primary: #333333;
          --light-text-secondary: #666666;
          --light-border: #e0e0e0;
          --light-accent: #3b82f6;
          --light-hover: #f0f0f0;
          
          /* Dark theme */
          --dark-bg-primary: #121212;
          --dark-bg-secondary: #1e1e1e;
          --dark-bg-tertiary: #2d2d2d;
          --dark-text-primary: #e0e0e0;
          --dark-text-secondary: #a0a0a0;
          --dark-border: #404040;
          --dark-accent: #6366f1;
          --dark-hover: #3d3d3d;
          
          /* Status colors */
          --status-success: #e8f5e9;
          --status-success-text: #2e7d32;
          --status-pending: #fff3e0;
          --status-pending-text: #ef6c00;
          --status-failed: #ffebee;
          --status-failed-text: #c62828;
          --status-unknown: #f5f5f5;
          --status-unknown-text: #757575;
          
          /* Spacing */
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 0.75rem;
          --spacing-lg: 1rem;
          --spacing-xl: 1.5rem;
          --spacing-2xl: 2rem;
          
          /* Border radius */
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
        }
        
        /* Base dashboard styles */
        .dashboard {
          min-height: 100vh;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        .dashboard--light {
          background-color: var(--light-bg-secondary);
          color: var(--light-text-primary);
        }
        
        .dashboard--dark {
          background-color: var(--dark-bg-primary);
          color: var(--dark-text-primary);
        }
        
        .dashboard__content {
          max-width: 100rem;
          margin: 0 auto;
          padding: var(--spacing-xl);
        }
        
        /* Top navigation */
        .dashboard__top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__top-nav {
          border-bottom-color: var(--dark-border);
        }
        
        .dashboard__title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--light-text-primary);
        }
        
        .dashboard--dark .dashboard__title {
          color: var(--dark-text-primary);
        }
        
        .dashboard__nav-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .dashboard__logout-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-border);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #ef4444;
          color: white;
          font-weight: 500;
        }
        
        .dashboard__logout-btn:hover {
          background-color: #dc2626;
        }
        
        .dashboard--dark .dashboard__logout-btn {
          border-color: var(--dark-border);
        }
        
        /* Error message */
        .dashboard__error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          border-radius: var(--radius-sm);
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }
        
        .dashboard--dark .dashboard__error-message {
          background-color: #2d0004;
          color: #ff8a80;
          border-color: #5c0a12;
        }
        
        .dashboard__retry-btn {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          border: 1px solid currentColor;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .dashboard__retry-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Filters section */
        .dashboard__filters-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          background-color: var(--light-bg-primary);
          border: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__filters-section {
          background-color: var(--dark-bg-secondary);
          border: 1px solid var(--dark-border);
        }
        
        .dashboard__filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .dashboard__filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__filter-label {
          color: var(--dark-text-secondary);
        }
        
        .dashboard__search-input, 
        .dashboard__date-filter, 
        .dashboard__status-filter, 
        .dashboard__school-filter {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-border);
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background-color: var(--light-bg-primary);
          color: var(--light-text-primary);
        }
        
        .dashboard--dark .dashboard__search-input, 
        .dashboard--dark .dashboard__date-filter, 
        .dashboard--dark .dashboard__status-filter, 
        .dashboard--dark .dashboard__school-filter {
          background-color: var(--dark-bg-tertiary);
          border-color: var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .dashboard__search-input:focus, 
        .dashboard__date-filter:focus, 
        .dashboard__status-filter:focus, 
        .dashboard__school-filter:focus {
          outline: none;
          border-color: var(--light-accent);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .dashboard--dark .dashboard__search-input:focus, 
        .dashboard--dark .dashboard__date-filter:focus, 
        .dashboard--dark .dashboard__status-filter:focus, 
        .dashboard--dark .dashboard__school-filter:focus {
          border-color: var(--dark-accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        
        .dashboard__theme-toggle {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-border);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: var(--light-bg-primary);
        }
        
        .dashboard--dark .dashboard__theme-toggle {
          background-color: var(--dark-bg-secondary);
          border-color: var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .dashboard__theme-toggle:hover {
          background-color: var(--light-hover);
        }
        
        .dashboard--dark .dashboard__theme-toggle:hover {
          background-color: var(--dark-hover);
        }
        
        /* Subheader section */
        .dashboard__subheader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        
        .dashboard__page-size-control {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .dashboard__page-size-label {
          font-size: 0.875rem;
          white-space: nowrap;
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__page-size-label {
          color: var(--dark-text-secondary);
        }
        
        .dashboard__page-size-select {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-border);
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background-color: var(--light-bg-primary);
          color: var(--light-text-primary);
        }
        
        .dashboard--dark .dashboard__page-size-select {
          background-color: var(--dark-bg-secondary);
          border-color: var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .dashboard__chart-container {
          width: 18rem;
          height: 5rem;
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          background-color: var(--light-bg-primary);
          border: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__chart-container {
          background-color: var(--dark-bg-secondary);
          border: 1px solid var(--dark-border);
        }
        
        .dashboard__chart-title {
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__chart-title {
          color: var(--dark-text-secondary);
        }
        
        /* Table styles */
        .dashboard__table-container {
          overflow-x: auto;
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-xl);
          background-color: var(--light-bg-primary);
          border: 1px solid var(--light-border);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .dashboard--dark .dashboard__table-container {
          background-color: var(--dark-bg-secondary);
          border: 1px solid var(--dark-border);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard__table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 800px;
        }
        
        .dashboard__table-header-row {
          border-bottom: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__table-header-row {
          border-bottom-color: var(--dark-border);
        }
        
        .dashboard__table-header {
          padding: var(--spacing-md);
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
          background-color: var(--light-bg-tertiary);
          color: var(--light-text-secondary);
          position: sticky;
          top: 0;
          border-bottom: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__table-header {
          background-color: var(--dark-bg-tertiary);
          color: var(--dark-text-secondary);
          border-bottom-color: var(--dark-border);
        }
        
        .dashboard__table-header:hover {
          background-color: var(--light-hover);
        }
        
        .dashboard--dark .dashboard__table-header:hover {
          background-color: var(--dark-hover);
        }
        
        .dashboard__header-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        .dashboard__sort-indicator {
          font-size: 0.75rem;
        }
        
        .dashboard__loading-cell, 
        .dashboard__no-data-cell {
          padding: var(--spacing-2xl);
          text-align: center;
          font-size: 0.875rem;
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__loading-cell,
        .dashboard--dark .dashboard__no-data-cell {
          color: var(--dark-text-secondary);
        }
        
        .dashboard__loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-radius: 50%;
          border-top-color: currentColor;
          animation: spin 1s linear infinite;
          margin-right: var(--spacing-sm);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .dashboard__table-row {
          border-bottom: 1px solid var(--light-border);
          transition: background-color 0.2s ease;
        }
        
        .dashboard--dark .dashboard__table-row {
          border-bottom-color: var(--dark-border);
        }
        
        .dashboard__table-row:hover {
          background-color: var(--light-hover);
        }
        
        .dashboard--dark .dashboard__table-row:hover {
          background-color: var(--dark-hover);
        }
        
        .dashboard__table-cell {
          padding: var(--spacing-md);
          font-size: 0.875rem;
          color: var(--light-text-primary);
          border-bottom: 1px solid var(--light-border);
        }
        
        .dashboard--dark .dashboard__table-cell {
          color: var(--dark-text-primary);
          border-bottom-color: var(--dark-border);
        }
        
        .dashboard__table-cell--center {
          text-align: center;
        }
        
        .dashboard__table-cell--numeric {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        
        .dashboard__table-cell--mono {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 0.8125rem;
        }
        
        .dashboard__status-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
          min-width: 70px;
          text-align: center;
        }
        
        .dashboard__status-badge--success {
          background-color: var(--status-success);
          color: var(--status-success-text);
        }
        
        .dashboard__status-badge--pending {
          background-color: var(--status-pending);
          color: var(--status-pending-text);
        }
        
        .dashboard__status-badge--failed {
          background-color: var(--status-failed);
          color: var(--status-failed-text);
        }
        
        .dashboard__status-badge--unknown {
          background-color: var(--status-unknown);
          color: var(--status-unknown-text);
        }
        
        /* Pagination */
        .dashboard__pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }
        
        .dashboard__pagination-buttons {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .dashboard__pagination-button {
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-sm);
          border: 1px solid var(--light-border);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: var(--light-bg-primary);
          color: var(--light-text-primary);
        }
        
        .dashboard--dark .dashboard__pagination-button {
          background-color: var(--dark-bg-secondary);
          border-color: var(--dark-border);
          color: var(--dark-text-primary);
        }
        
        .dashboard__pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .dashboard__pagination-button:not(:disabled):hover {
          background-color: var(--light-hover);
        }
        
        .dashboard--dark .dashboard__pagination-button:not(:disabled):hover {
          background-color: var(--dark-hover);
        }
        
        .dashboard__pagination-info {
          font-size: 0.875rem;
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__pagination-info {
          color: var(--dark-text-secondary);
        }
        
        .dashboard__total-count {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--light-text-secondary);
        }
        
        .dashboard--dark .dashboard__total-count {
          color: var(--dark-text-secondary);
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .dashboard__top-nav {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-lg);
          }
          
          .dashboard__nav-controls {
            width: 100%;
            justify-content: flex-end;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard__content {
            padding: var(--spacing-lg);
          }
          
          .dashboard__filters-section {
            grid-template-columns: 1fr;
          }
          
          .dashboard__subheader {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-lg);
          }
          
          .dashboard__pagination-controls {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .dashboard__chart-container {
            width: 100%;
          }
        }
        
        @media (max-width: 640px) {
          .dashboard__content {
            padding: var(--spacing-md);
          }
          
          .dashboard__filters-section {
            padding: var(--spacing-md);
          }
          
          .dashboard__table-cell {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
}