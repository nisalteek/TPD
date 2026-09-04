import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

// Public page — no login required. This is what a certificate's QR code
// links to, so anyone can confirm authenticity without an account.
export default function Verify() {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/certificates/verify/${certificateId}`)
      .then((res) => setResult(res.data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [certificateId]);

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-brand">
          <i className="fa-solid fa-graduation-cap"></i>
          <h1>Certificate Verification</h1>
          <p>Teacher Performance &amp; Development Tracking System</p>
        </div>

        {loading && <p className="muted" style={{ textAlign: 'center' }}>Checking certificate…</p>}

        {!loading && result?.valid && (
          <div className="verify-result verify-valid">
            <i className="fa-solid fa-circle-check"></i>
            <h3>Valid Certificate</h3>
            <p className="muted">This certificate is authentic and on record.</p>
            <div className="verify-details">
              <div><span>Issued to</span><strong>{result.teacherName}</strong></div>
              <div><span>Course</span><strong>{result.courseTitle}</strong></div>
              <div><span>Completed</span><strong>{new Date(result.completionDate).toLocaleDateString()}</strong></div>
              {result.hours ? <div><span>Hours</span><strong>{result.hours}</strong></div> : null}
              <div><span>Certificate ID</span><strong>{result.certificateId}</strong></div>
            </div>
          </div>
        )}

        {!loading && result && !result.valid && (
          <div className="verify-result verify-invalid">
            <i className="fa-solid fa-circle-xmark"></i>
            <h3>Certificate Not Found</h3>
            <p className="muted">This certificate ID could not be verified. It may be invalid or revoked.</p>
          </div>
        )}

        <p className="auth-switch"><Link to="/login">Back to TPD System</Link></p>
      </div>
    </div>
  );
}
