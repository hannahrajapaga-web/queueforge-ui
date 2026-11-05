
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge status-${(status || "queued").toLowerCase()}`}
    >
      <i />
      {status}
    </span>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [files, setFiles] = useState([]);
  const [simulateFailures, setSimulateFailures] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);

  // Controls the custom warning and confirmation dialogs.
  const [dialog, setDialog] = useState(null);

  const loadJobs = async () => {
    try {
      const response = await api.get("/api/jobs");
      setJobs(response.data);
    } catch {
      setMessage("Could not load jobs.");
    }
  };

  useEffect(() => {
    loadJobs();

    const interval = setInterval(loadJobs, 3000);

    return () => clearInterval(interval);
  }, []);

  const uploadFiles = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!files.length) {
      setMessage("Please select at least one image.");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));
    formData.append("simulateFailures", simulateFailures);

    setLoading(true);
    setMessage("");

    try {
      await api.post("/api/jobs", formData);

      setMessage(`${files.length} image(s) uploaded and queued.`);
      setFiles([]);
      form.reset();

      await loadJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Opens the appropriate custom dialog based on job status.
  const deleteJob = (job) => {
    if (job.status === "QUEUED") {
      setDialog({
        type: "warning",
        title: "Job cannot be deleted",
        message: "Queued jobs cannot be deleted. Please wait until processing is finished.",
      });
      return;
    }

    if (job.status === "PROCESSING") {
      setDialog({
        type: "warning",
        title: "Job is being processed",
        message: "This job is currently processing and cannot be deleted. Please try again after it finishes.",
      });
      return;
    }

    if (job.status !== "COMPLETED" && job.status !== "FAILED") {
      setDialog({
        type: "warning",
        title: "Job cannot be deleted",
        message: "This job cannot be deleted in its current state.",
      });
      return;
    }

    setDialog({
      type: "confirm",
      title: "Delete this job?",
      message: `Are you sure you want to delete job #${job.id} (${job.originalFilename})? This action cannot be undone.`,
      job,
    });
  };

  // Runs only after the user confirms deletion.
  const confirmDelete = async () => {
    const job = dialog?.job;

    if (!job) return;

    setDialog(null);
    setDeletingId(job.id);
    setMessage("");

    try {
      await api.delete(`/api/jobs/${job.id}`);

      setMessage(`Job #${job.id} deleted successfully.`);

      await loadJobs();
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Could not delete this job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const visibleJobs =
    filter === "ALL"
      ? jobs
      : jobs.filter((job) => job.status === filter);

  return (
    <div className="page-stack">

      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1>Image jobs</h1>
          <p className="muted">
            Upload images and track processing from queue to completion.
          </p>
        </div>

        <span className="live-label">
          <i /> AUTO-REFRESH · 3 SEC
        </span>
      </div>

      <form className="surface upload-panel" onSubmit={uploadFiles}>

        <div className="panel-title">
          <div className="upload-icon">↑</div>

          <div>
            <h2>Upload images</h2>
            <p className="muted">
              Select one or more images to add to the processing queue.
            </p>
          </div>
        </div>

        <label className="drop-zone">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setFiles(Array.from(e.target.files))
            }
          />

          <span className="drop-icon">↥</span>

          <strong>
            {files.length
              ? `${files.length} file(s) selected`
              : "Choose images to upload"}
          </strong>

          <small>
            {files.length
              ? files.map((file) => file.name).join(" · ")
              : "Click to browse · Multiple images supported"}
          </small>
        </label>

        <div className="upload-options">
          <div>
            <label htmlFor="failure-count">
              Simulate failures
            </label>

            <p className="muted">
              For testing retry and dead-letter handling.
            </p>
          </div>

          <input
            id="failure-count"
            className="small-number"
            type="number"
            min="0"
            value={simulateFailures}
            onChange={(e) =>
              setSimulateFailures(e.target.value)
            }
          />

          <span className="muted option-hint">
            0 = normal · 2 = retry then succeed · 9 = dead-letter
          </span>
        </div>

        <div className="form-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Uploading…" : "Upload to queue"} <span>→</span>
          </button>

          {message && (
            <span className="form-message">
              {message}
            </span>
          )}
        </div>

      </form>

      <section className="surface jobs-panel">

        <div className="section-heading">
          <div>
            <h2>
              All jobs <span className="count-pill">{jobs.length}</span>
            </h2>

            <p className="muted">
              Your submitted image processing tasks.
            </p>
          </div>

          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="QUEUED">Queued</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {visibleJobs.length === 0 ? (

          <div className="empty-state">
            <span>▤</span>

            <strong>
              {jobs.length
                ? "No jobs match this filter"
                : "No jobs yet"}
            </strong>

            <p className="muted">
              Upload an image above to get started.
            </p>
          </div>

        ) : (

          <div className="table-scroll">
            <table className="data-table">

              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>FILE NAME</th>
                  <th>STATUS</th>
                  <th>ATTEMPTS</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {visibleJobs.map((job) => (

                  <tr key={job.id}>

                    <td className="id-cell">
                      #{job.id}
                    </td>

                    <td className="filename-cell">
                      {job.originalFilename}
                    </td>

                    <td>
                      <StatusBadge status={job.status} />
                    </td>

                    <td>
                      {job.attempts}
                    </td>

                    <td>
                      <Link
                        className="table-link"
                        to={`/jobs/${job.id}`}
                      >
                        Details <span>↗</span>
                      </Link>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="table-link delete-link"
                        onClick={() => deleteJob(job)}
                        disabled={deletingId === job.id}
                      >
                        {deletingId === job.id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </td>

                  </tr>

                ))}
              </tbody>

            </table>
          </div>

        )}

      </section>

      {/* Custom QueueForge dialog */}
      {dialog && (
        <div
          className="dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDialog(null);
            }
          }}
        >
          <div
            className="queue-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
          >
            <div className={`dialog-icon ${dialog.type}`}>
              {dialog.type === "confirm" ? "?" : "!"}
            </div>

            <h2 id="dialog-title">{dialog.title}</h2>

            <p id="dialog-message">{dialog.message}</p>

            <div className="dialog-actions">
              {dialog.type === "confirm" ? (
                <>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDialog(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="dialog-delete-button"
                    onClick={confirmDelete}
                  >
                    Delete job
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setDialog(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
