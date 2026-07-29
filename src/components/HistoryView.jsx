import { useEffect, useState } from 'react';
import { listSessions, deleteSession } from '../lib/supabase.js';

export default function HistoryView({ onOpen, onBackHome }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listSessions();
        if (active) setSessions(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await deleteSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div><p>Loading your study sets…</p></div>;
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h2>Your study sets</h2>
        <button className="btn btn-secondary" onClick={onBackHome}>+ New study set</button>
      </div>

      {error && <div className="error-banner"><span>⚠</span> {error}</div>}

      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No study sets yet</h3>
          <p>Create your first study set to see it here.</p>
        </div>
      ) : (
        <div className="history-list">
          {sessions.map((s) => (
            <div key={s.id} className="history-item" onClick={() => onOpen(s.id)}>
              <div className="history-info">
                <div className="history-topic">{s.topic}</div>
                <div className="history-date">{formatDate(s.created_at)}</div>
              </div>
              <div className="history-actions">
                <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onOpen(s.id); }}>
                  Study →
                </button>
                <button className="btn btn-ghost" onClick={(e) => handleDelete(s.id, e)} aria-label="Delete">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
