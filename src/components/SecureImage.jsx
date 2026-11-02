import { useEffect, useState } from "react";
import api from "../services/api";

export default function SecureImage({ jobId, size, alt, style }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  const [dims, setDims] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;
    api.get(`/api/jobs/${jobId}/image/${size}`, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [jobId, size]);

  if (failed) return <div className="image-placeholder">Image not available</div>;
  if (!src) return <div className="image-placeholder">Loading image…</div>;
  return <div className="secure-image-wrap"><img src={src} alt={alt} style={{ maxWidth: "100%", ...style }} onLoad={(e) => setDims(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight} px`)} />{dims && <div className="image-dimensions">{dims}</div>}</div>;
}
