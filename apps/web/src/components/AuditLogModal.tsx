import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  RefreshCw,
  Clock,
  User,
  Layers,
  SlidersHorizontal,
  Upload,
  ShieldAlert,
} from 'lucide-react';
import { api, AuditLog } from '../api';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/audit');
      setLogs(res.data?.logs || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch audit log');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterAction === 'ALL') return true;
    if (filterAction === 'OVERRIDE') {
      return l.action === 'MANUAL_OVERRIDE' || l.action === 'CLEAR_OVERRIDE' || l.action === 'STUDENT_CATEGORY_OVERRIDE';
    }
    if (filterAction === 'RULES') {
      return l.action.includes('RULE') || l.action === 'RULESET_UPDATE';
    }
    if (filterAction === 'CSV') {
      return l.action.includes('CSV') || l.action === 'CSV_IMPORT';
    }
    return l.action === filterAction;
  });

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge audit">
              <History size={20} />
            </div>
            <div>
              <h2 className="modal-title">Placement Coordinator Activity & Audit Log</h2>
              <p className="modal-subtitle">
                Immutable chronological timeline of rules modifications, manual overrides, and CSV ingestion runs.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert-box error mb-4">{error}</div>}

          <div className="audit-controls-bar mb-3">
            <div className="modal-tab-bar">
              <button
                type="button"
                className={`modal-tab-btn ${filterAction === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterAction('ALL')}
              >
                All Actions ({logs.length})
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${filterAction === 'OVERRIDE' ? 'active' : ''}`}
                onClick={() => setFilterAction('OVERRIDE')}
              >
                Category Overrides
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${filterAction === 'RULES' ? 'active' : ''}`}
                onClick={() => setFilterAction('RULES')}
              >
                Scoring Rule Changes
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${filterAction === 'CSV' ? 'active' : ''}`}
                onClick={() => setFilterAction('CSV')}
              >
                CSV Ingestions
              </button>
            </div>

            <button type="button" className="btn btn-sm btn-outline" onClick={fetchLogs}>
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh Log</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--slate-400)' }}>
              Loading audit log records...
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '380px' }}>
              <table className="student-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Timestamp</th>
                    <th style={{ width: '160px' }}>Action Type</th>
                    <th style={{ width: '130px' }}>Coordinator</th>
                    <th style={{ width: '120px' }}>Target Entity</th>
                    <th>Audit Details & Mandatory Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-400)' }}>
                        No audit log entries recorded for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="student-row">
                        <td>
                          <span className="audit-time-badge">
                            <Clock size={11} />
                            <span>{formatTime(log.createdAt)}</span>
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge-category ${
                              log.action === 'STUDENT_CATEGORY_OVERRIDE'
                                ? 'needs'
                                : log.action === 'RULESET_UPDATE'
                                ? 'average'
                                : log.action === 'CSV_IMPORT'
                                ? 'strong'
                                : 'default'
                            }`}
                          >
                            {log.action === 'STUDENT_CATEGORY_OVERRIDE' && <Layers size={11} />}
                            {log.action === 'RULESET_UPDATE' && <SlidersHorizontal size={11} />}
                            {log.action === 'CSV_IMPORT' && <Upload size={11} />}
                            <span>{log.action.replace(/_/g, ' ')}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div className="audit-user-avatar">
                              <User size={11} />
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--slate-700)' }}>
                              {log.userId || 'Coordinator'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-id">
                            {log.entity} {log.entityId ? `#${log.entityId}` : ''}
                          </span>
                        </td>
                        <td>
                          {log.metadata ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {log.metadata.reason && (
                                <div className="audit-reason-box">
                                  <strong>Reason:</strong> &ldquo;{log.metadata.reason}&rdquo;
                                </div>
                              )}
                              {log.metadata.newCategory && (
                                <div style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                                  Category shift:{' '}
                                  <span style={{ textDecoration: 'line-through', color: 'var(--slate-400)' }}>
                                    {log.metadata.previousCategory}
                                  </span>{' '}
                                  ➔ <strong>{log.metadata.newCategory}</strong>
                                </div>
                              )}
                              {log.metadata.version && (
                                <div style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                                  Scoring rules upgraded to <strong>v{log.metadata.version}</strong>
                                </div>
                              )}
                              {log.metadata.importedCount !== undefined && (
                                <div style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                                  Imported <strong>{log.metadata.importedCount}</strong> student record(s) (
                                  {log.metadata.warningCount} warnings, {log.metadata.rejectedCount} rejected)
                                </div>
                              )}
                              {log.metadata.studentIds && (
                                <div style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                                  Applied to <strong>{log.metadata.studentIds.length}</strong> candidate(s)
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

