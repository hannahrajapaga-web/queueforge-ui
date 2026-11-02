
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import SecureImage from "../components/SecureImage";

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${(status || "queued").toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Could not load job", error);
      }
    };

    loadJob();
    const interval = setInterval(loadJob, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const downloadImage = async (size) => {
    try {
      setDownloading(size);

      const response = await api.get(
        `/api/jobs/${id}/image/${size}`,
        { responseType: "blob" }
      );

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      const originalName = job.originalFilename || "image";
      const dotIndex = originalName.lastIndexOf(".");
      const fileName = dotIndex > 0
        ? originalName.substring(0, dotIndex)
        : originalName;
      const extension = dotIndex > 0
        ? originalName.substring(dotIndex)
        : ".jpg";

      link.href = blobUrl;
      link.download = size === "original"
        ? originalName
        : `${fileName}-${size}${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Image download failed", error);
      alert(`Could not download the ${size} image. Please try again.`);
    } finally {
      setDownloading("");
    }
  };

  if (!job) {
    return <div className="surface loading-panel">Loading job details…</div>;
  }

  const sizes = ["original", "small", "medium", "large"];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">JOB MONITOR</div>
          <h1>Job #{job.id}</h1>
          <p className="muted">
            Inspect task information and processed image outputs.
          </p>
        </div>
        <Link className="secondary-button" to="/jobs">
          ← Back to jobs
        </Link>
      </div>

      <section className="surface detail-panel">
        <div className="section-heading">
          <div>
            <h2>Job information</h2>
            <p className="muted">
              Current processing state and execution details.
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="detail-grid">
          <div>
            <span>FILE NAME</span>
            <strong>{job.originalFilename}</strong>
          </div>
          <div>
            <span>JOB ID</span>
            <strong>#{job.id}</strong>
          </div>
          <div>
            <span>PROCESSING ATTEMPTS</span>
            <strong>{job.attempts}</strong>
          </div>
          <div>
            <span>ERROR MESSAGE</span>
            <strong className={job.errorMessage ? "error-text" : ""}>
              {job.errorMessage || "No errors reported"}
            </strong>
          </div>
        </div>
      </section>

      {job.status === "COMPLETED" && (
        <section>
          <div className="section-heading">
            <div>
              <h2>Processed images</h2>
              <p className="muted">
                Available output sizes generated for this job.
              </p>
            </div>
          </div>

          <div className="image-variants">
            {sizes.map((size) => (
              <article className="surface image-variant" key={size}>
                <div className="variant-heading">
                  <h3>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </h3>
                  <span>OUTPUT</span>
                </div>

                <SecureImage
                  jobId={id}
                  size={size}
                  alt={`${size} version`}
                  style={{
                    width: "auto",
                    maxWidth: "100%",
                    height: "auto",
                    maxHeight: 280,
                    borderRadius: 9,
                    objectFit: "contain"
                  }}
                />

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => downloadImage(size)}
                  disabled={downloading !== "" || downloading === size}
                  style={{ marginTop: 14 }}
                >
                  {downloading === size
                    ? "Downloading…"
                    : `↓ Download ${size}`}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
