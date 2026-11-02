import { useEffect, useState } from "react";
import api from "../services/api";

export default function DeadLetter() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [retrying, setRetrying] = useState(null);
  const loadFailedJobs = async () => {
    try { const response = await api.get("/api/admin/dead-letter"); setJobs(response.data); }
    catch { setMessage("Could not load dead-letter jobs. Admin access may be required."); }
  };
  useEffect(() => { loadFailedJobs(); }, []);
  const retryJob = async (id) => {
    setRetrying(id);
    try { await api.post(`/api/admin/dead-letter/${id}/retry`); setMessage(`Job ${id} sent for retry.`); await loadFailedJobs(); }
    catch { setMessage(`Could not retry job ${id}.`); }
    finally { setRetrying(null); }
  };

  return <div className="page-stack">
    <div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Dead letter queue</h1><p className="muted">Review jobs that exhausted their retry attempts and reprocess them when ready.</p></div><span className="admin-tag">ADMIN VIEW</span></div>
    <div className="dead-letter-summary"><div className="dead-letter-symbol">!</div><div><strong>{jobs.length} failed {jobs.length === 1 ? "job" : "jobs"}</strong><p>These tasks need attention before they can be processed successfully.</p></div></div>
    {message && <div className="notice">{message}</div>}
    <section className="surface jobs-panel"><div className="section-heading"><div><h2>Failed jobs <span className="count-pill">{jobs.length}</span></h2><p className="muted">Retry a job to send it back to the processing queue.</p></div></div>
      {!jobs.length ? <div className="empty-state"><span>✓</span><strong>Dead letter queue is clear</strong><p className="muted">There are no failed jobs requiring attention.</p></div> :
        <div className="dead-letter-list">{jobs.map((job) => <article className="dead-job" key={job.id}><div className="dead-job-main"><div className="dead-job-title"><strong>{job.originalFilename}</strong><span className="status-badge status-failed"><i />FAILED</span></div><div className="dead-job-meta"><span>Job #{job.id}</span><span>{job.attempts} attempts</span></div><p className="dead-error">{job.errorMessage || "No error details available."}</p></div><button className="primary-button retry-button" onClick={() => retryJob(job.id)} disabled={retrying === job.id}>{retrying === job.id ? "Retrying…" : "Retry job →"}</button></article>)}</div>}
    </section>
  </div>;
}
