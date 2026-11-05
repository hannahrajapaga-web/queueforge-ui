
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import api from "../services/api";

const STATUS_COLORS = { QUEUED: "#8b83f6", PROCESSING: "#e9a64b", COMPLETED: "#38b88a", FAILED: "#e36d7c" };

function StatCard({ label, value, tone = "violet", note }) {
  return <article className={`stat-card tone-${tone}`}><div className="stat-top"><span>{label}</span><i /></div><strong>{value ?? 0}</strong>{note && <small>{note}</small>}</article>;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [system, setSystem] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/api/jobs");
        setJobs(response.data);
        setError("");
      } catch {
        setError("Could not load jobs. Check your backend.");
      }

      if (isAdmin) {
        try {
          const stats = await api.get("/api/admin/stats");
          setSystem(stats.data);
        } catch { /* optional admin stats */ }

        try {
          const response = await api.get("/api/admin/users");
          setUsers(response.data);
          setUsersError("");
        } catch {
          setUsersError("Could not load users.");
        }
      }
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const completed = jobs.filter((j) => j.status === "COMPLETED").length;
  const processing = jobs.filter((j) => ["QUEUED", "PROCESSING"].includes(j.status)).length;
  const failed = jobs.filter((j) => j.status === "FAILED").length;
  const chartData = system ? Object.entries(system.jobsByStatus || {}).map(([name, count]) => ({ name, count })) : [];

  return <div className="page-stack">
    <div className="page-heading"><div><div className="eyebrow">OVERVIEW</div><h1>Dashboard</h1><p className="muted">Monitor your image processing activity and system health.</p></div><Link className="primary-button" to="/jobs">＋ New upload</Link></div>

    {error && <div className="notice error-notice">{error}</div>}

    <section>
      <div className="section-heading">
        <div><h2>Your workspace</h2><p className="muted">A live view of your submitted jobs.</p></div>
        <span className="live-label"><i /> LIVE UPDATES</span>
      </div>
      <div className="stats-grid">
        <StatCard label="Total jobs" value={jobs.length} tone="violet" note="All submitted jobs" />
        <StatCard label="Completed" value={completed} tone="green" note="Successfully processed" />
        <StatCard label="In progress" value={processing} tone="amber" note="Queued or processing" />
        <StatCard label="Failed" value={failed} tone="red" note="Require attention" />
      </div>
    </section>

    {isAdmin && system && <>
      <section>
        <div className="section-heading">
          <div><h2>System operations</h2><p className="muted">Platform-wide processing metrics across all users.</p></div>
          <span className="admin-tag">ADMIN VIEW</span>
        </div>
        <div className="stats-grid system-grid">
          <StatCard label="All jobs" value={system.totalJobs} tone="violet" />
          <StatCard label="Pending queue" value={system.queues.pending} tone="amber" />
          <StatCard label="Processing now" value={system.queues.processing} tone="blue" />
          <StatCard label="Delayed retries" value={system.queues.delayedRetries} tone="amber" />
          <StatCard label="Dead letter" value={system.queues.deadLetter} tone="red" />
          <StatCard label="Completed / min" value={system.completedLastMinute} tone="green" />
          <StatCard label="Active workers" value={system.workers} tone="blue" />
        </div>
      </section>

      <section className="surface chart-panel">
        <div className="section-heading">
          <div><h2>Jobs by status</h2><p className="muted">Distribution of jobs across the system.</p></div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {chartData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#8b83f6"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface chart-panel">
        <div className="section-heading">
          <div>
            <h2>User Management</h2>
            <p className="muted">Registered users and their platform activity.</p>
          </div>
          <span className="admin-tag">{users.length} USERS</span>
        </div>

        {usersError ? (
          <div className="notice error-notice">{usersError}</div>
        ) : users.length === 0 ? (
          <p className="muted">No registered users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr>
                  {["Username", "Email", "Role", "Total jobs", "Joined"].map((heading) => (
                    <th key={heading} style={{ padding: "14px 12px", color: "var(--muted)", fontSize: "12px", fontWeight: 600, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{user.username}</td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)" }}>{user.email}</td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)" }}>
                      <span className="admin-tag">{user.role}</span>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)" }}>{user.totalJobs}</td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>}

    <section className="quick-links">
      <div><span className="quick-icon">▤</span><div><strong>Image processing jobs</strong><p className="muted">Upload images and follow every job through processing.</p></div></div>
      <Link to="/jobs" className="text-link">View jobs <span>→</span></Link>
    </section>
  </div>;
}
