import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../Services/Axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Transactions Dashboard with filters, sorting, realtime polling, dark mode, URL persistence
export default function TransactionsDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // fetch (used by initial load and polling)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/transactions");
      // assume data.data is array
      setTransactions(data.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
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
    <div className={darkMode ? "min-h-screen bg-gray-900 text-gray-100" : "min-h-screen bg-gray-50 text-gray-900"}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Top Navbar (first line) */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">OrderId (collection id)</div>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1 bg-white/80 dark:bg-gray-800"
                placeholder="Search OrderId"
                value={searchOrderId}
                onChange={(e) => {
                  setPage(1);
                  setSearchOrderId(e.target.value);
                }}
              />
              <div className="text-xs px-2 py-1 rounded border">Filter by ▾</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setPage(1);
                setDateFilter(e.target.value);
              }}
              className="border rounded px-2 py-1 bg-white/80 dark:bg-gray-800"
            />

            {/* status single-select quick */}
            <select
              value={statusFilter.join(",")}
              onChange={(e) => {
                setPage(1);
                const val = e.target.value ? e.target.value.split(",") : [];
                setStatusFilter(val);
              }}
              className="border rounded px-2 py-1 bg-white/80 dark:bg-gray-800"
            >
              <option value="">All Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>

            <input
              placeholder="Institute Name"
              value={schoolFilter.join(",")}
              onChange={(e) => setSchoolFilter(e.target.value ? e.target.value.split(",") : [])}
              className="border rounded px-2 py-1 bg-white/80 dark:bg-gray-800"
            />

            <button
              onClick={() => setDarkMode((d) => !d)}
              className="px-3 py-1 border rounded"
              title="Toggle theme"
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Second Line: rows per page */}
        <div className="flex items-center justify-start gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
              className="border rounded px-2 py-1 bg-white/80 dark:bg-gray-800"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* small realtime visualization */}
          <div className="ml-6 w-72 h-20 bg-white/90 dark:bg-gray-800 border rounded p-2">
            <div className="text-xs font-medium mb-1">Recent transactions (count)</div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3rd Line: table */}
        <div className="overflow-x-auto rounded bg-white/90 dark:bg-gray-800 border">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {[
                  { k: "sr", label: "Sr. No" },
                  { k: "school_id", label: "Institute Name" },
                  { k: "collect_request_id", label: "OrderId" },
                  { k: "order_amount", label: "Order Amount" },
                  { k: "transaction_amount", label: "Transaction Amount" },
                  { k: "payment_mode", label: "Payment Method" },
                  { k: "status", label: "Status" },
                  { k: "student_name", label: "Student Name" },
                  { k: "student_phone", label: "Phone Number" },
                ].map((col) => (
                  <th
                    key={col.k}
                    className="p-3 text-left text-sm border-b cursor-pointer select-none"
                    onClick={() => changeSort(col.k === "sr" ? "payment_time" : col.k)}
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {sortKey === (col.k === "sr" ? "payment_time" : col.k) && (
                        <span className="text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>

              {/* extra row for multi-select filters under headers (compact) */}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="p-2" />
                <th className="p-2">
                  <div className="text-xs">Schools:</div>
                  <div className="flex gap-1 flex-wrap">
                    {uniqueSchools.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSchoolOption(s)}
                        className={`text-xs px-2 py-0.5 rounded border ${schoolFilter.includes(s) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </th>

                <th className="p-2">
                  <div className="text-xs">—</div>
                </th>

                <th className="p-2" />
                <th className="p-2" />
                <th className="p-2" />

                <th className="p-2">
                  <div className="text-xs">Statuses:</div>
                  <div className="flex gap-1">
                    {uniqueStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleStatusOption(s)}
                        className={`text-xs px-2 py-0.5 rounded border ${statusFilter.includes(s) ? "bg-gray-200 dark:bg-gray-600" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </th>

                <th className="p-2" />
                <th className="p-2" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-6">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t, idx) => (
                  <tr key={t.collect_request_id || idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2">{t.school_id || "-"}</td>
                    <td className="p-2">{t.collect_request_id}</td>
                    <td className="p-2">{t.order_amount ?? "-"}</td>
                    <td className="p-2">{t.transaction_amount ?? "-"}</td>
                    <td className="p-2">{t.payment_mode || "-"}</td>
                    <td className="p-2">{t.status || "-"}</td>
                    <td className="p-2">{t.student_info?.name || "-"}</td>
                    <td className="p-2">{t.student_info?.phone || t.student_info?.id || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(filteredTransactions.length / pageSize))}
            </span>
            <button
              disabled={page * pageSize >= filteredTransactions.length}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="text-sm">Total: {filteredTransactions.length}</div>
        </div>
      </div>
    </div>
  );
}



