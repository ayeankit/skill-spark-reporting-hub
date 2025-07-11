import React, { useEffect, useState } from "react";

const TABS = [
  { key: "user-performance", label: "User Performance" },
  { key: "skill-gap", label: "Skill Gap" },
  { key: "time-performance", label: "Time Performance" },
];

const Report: React.FC = () => {
  const [tab, setTab] = useState("user-performance");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("week");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let url = `${API_URL}/reports/` + tab;
      if (tab === "time-performance") url += `?period=${period}`;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          let errorMsg = 'Failed to fetch report';
          try {
            const text = await res.text();
            errorMsg = text && JSON.parse(text).message ? JSON.parse(text).message : errorMsg;
          } catch {
            // If not JSON, keep default errorMsg
          }
          throw new Error(errorMsg);
        }
        const d = await res.json();
        setData(d);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, period]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex space-x-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded ${tab === t.key ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        {tab === "time-performance" && (
          <select value={period} onChange={e => setPeriod(e.target.value)} className="ml-2 px-2 py-1 border rounded">
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        )}
      </div>
      {loading ? (
        <div>Loading report...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {tab === "user-performance" && <>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Total Attempts</th>
                <th className="py-2 px-4 border-b">Avg Score</th>
              </>}
              {tab === "skill-gap" && <>
                <th className="py-2 px-4 border-b">Skill</th>
                <th className="py-2 px-4 border-b">Total Attempts</th>
                <th className="py-2 px-4 border-b">Avg Score</th>
              </>}
              {tab === "time-performance" && <>
                <th className="py-2 px-4 border-b">Period</th>
                <th className="py-2 px-4 border-b">Total Attempts</th>
                <th className="py-2 px-4 border-b">Avg Score</th>
              </>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4">No data</td></tr>
            ) : tab === "user-performance" ? (
              data.map((row: any) => (
                <tr key={row.user_id}>
                  <td className="py-2 px-4 border-b">{row.name}</td>
                  <td className="py-2 px-4 border-b">{row.email}</td>
                  <td className="py-2 px-4 border-b">{row.role}</td>
                  <td className="py-2 px-4 border-b">{row.total_attempts}</td>
                  <td className="py-2 px-4 border-b">{
                    row.avg_score === null || row.avg_score === undefined
                      ? 'N/A'
                      : `${Math.round(Number(row.avg_score) * 100)}%`
                  }</td>
                </tr>
              ))
            ) : tab === "skill-gap" ? (
              data.map((row: any) => (
                <tr key={row.skill_category_id}>
                  <td className="py-2 px-4 border-b">{row.skill_name}</td>
                  <td className="py-2 px-4 border-b">{row.total_attempts}</td>
                  <td className="py-2 px-4 border-b">{row.avg_score?.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              data.map((row: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 px-4 border-b">{row.period}</td>
                  <td className="py-2 px-4 border-b">{row.total_attempts}</td>
                  <td className="py-2 px-4 border-b">{row.avg_score?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Report; 