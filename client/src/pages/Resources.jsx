import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const CATEGORY_LABELS = {
  policy: 'Policy',
  template: 'Template',
  handout: 'Handout',
  'training-material': 'Training Material',
  other: 'Other',
};

const CATEGORY_ICONS = {
  policy: 'fa-scale-balanced',
  template: 'fa-file-lines',
  handout: 'fa-book-open',
  'training-material': 'fa-graduation-cap',
  other: 'fa-file-pdf',
};

function formatSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'handout', file: null });
  const [error, setError] = useState('');

  const load = () => api.get('/resources').then((res) => setResources(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.file) return setError('Please choose a PDF file.');
    setError('');
    setUploading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('file', form.file);
      await api.post('/resources', data);
      setForm({ title: '', description: '', category: 'handout', file: null });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Make sure the file is a PDF under 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const download = async (resource) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resources/${resource._id}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tpd_token')}` },
    });
    if (!res.ok) return alert('Unable to download this file.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resource.fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const remove = async (id) => {
    await api.delete(`/resources/${id}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Resource Library</h1>
        <p>Shared policies, templates, and training materials — real, downloadable PDFs.</p>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <i className="fa-solid fa-plus"></i> Upload PDF
          </button>
        )}
      </div>

      {showForm && (
        <GlassCard style={{ marginBottom: 20 }}>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={submit} className="form-grid">
            <div className="full-span"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Classroom Safety Policy" /></div>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label>PDF File</label>
              <input type="file" accept="application/pdf" required onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
            </div>
            <div className="full-span"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <button className="btn-primary full-span" type="submit" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </GlassCard>
      )}

      <div className="card-grid">
        {resources.map((r) => (
          <GlassCard key={r._id} className="resource-card">
            <div className="resource-icon"><i className={`fa-solid ${CATEGORY_ICONS[r.category]}`}></i></div>
            <h4>{r.title}</h4>
            <p className="muted small">{CATEGORY_LABELS[r.category]} · {formatSize(r.size)}</p>
            {r.description && <p>{r.description}</p>}
            <p className="muted small">Uploaded by {r.uploadedBy?.name || 'Admin'}</p>
            <div className="row-actions">
              <button className="btn-secondary" onClick={() => download(r)}>
                <i className="fa-solid fa-download"></i> Download
              </button>
              {user.role === 'admin' && (
                <button className="btn-ghost" onClick={() => remove(r._id)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
      {resources.length === 0 && <p className="muted">No resources uploaded yet.</p>}
    </div>
  );
}
