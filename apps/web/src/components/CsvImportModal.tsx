import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
} from 'lucide-react';
import { api, IngestionSummaryReport } from '../api';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<IngestionSummaryReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
      setReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setImporting(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.report) {
        setReport(res.data.report);
      }
      onImportSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse and import CSV.');
      if (err.response?.data?.report) {
        setReport(err.response.data.report);
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = `ID,Name,Email,Phone,Branch,CGPA,Skills,Projects,Internships,Certifications
16,Priyanka Das,priyanka.d@gmail.com,9876501234,Computer Science,8.8,"React, Node.js, TypeScript","E-Commerce App, AI Chatbot",SDE Intern at Flipkart,AWS Certified Developer
17,Harish Verma,harish.v@gmail.com,8765401234,Information Technology,7.9,"Python, SQL, Django",Sales Analytics Dashboard,None,Google Data Analytics
18,Ananya Roy,ananya.r@gmail.com,7654301234,Mechanical,6.2,MS Excel,None,None,None`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'placement_screening_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Upload size={20} />
            <h2>Batch Ingest Student Cohort CSV</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="import-notice-box">
            <Info size={16} />
            <div className="notice-text">
              <strong>Dirty-Data Resilient Parsing Engine:</strong> Supports dirty data including
              unformatted CGPA (e.g. <code>8.5/10</code>), negative indicator values (e.g. <code>None</code>, <code>N/A</code>, <code>-</code>),
              mixed delimiters, and duplicate IDs with transparent row-by-row audit reporting.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={downloadSampleTemplate}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Download size={14} />
              <span>Download Template</span>
            </button>
          </div>

          {error && (
            <div className="alert-box error" style={{ margin: '14px 0' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Dropzone */}
          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet size={40} className="dropzone-icon" />
            <span className="dropzone-text">
              {file ? file.name : 'Click or Drag & Drop Student Cohort CSV Here'}
            </span>
            <span className="dropzone-subtext">
              Expected headers: ID, Name, Email, Phone, Branch, CGPA, Skills, Projects, Internships, Certifications
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Ingestion Report Table */}
          {report && (
            <div className="ingest-report-section">
              <div className="report-summary-bar">
                <span className="report-badge total">Total Rows: {report.totalRows}</span>
                <span className="report-badge clean">Clean Accepted: {report.acceptedCount}</span>
                <span className="report-badge warning">Sanitized Warnings: {report.warningCount}</span>
                {report.rejectedCount > 0 && (
                  <span className="report-badge rejected">Rejected: {report.rejectedCount}</span>
                )}
              </div>

              <h4 className="report-table-title">Row-by-Row Ingestion Audit</h4>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Row</th>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Candidate Name</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th>Sanitization Issues & Normalized Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rowReports.map((row) => (
                      <tr key={row.rowNumber} className={`report-row ${row.status.toLowerCase()}`}>
                        <td>#{row.rowNumber}</td>
                        <td><code>{row.externalId}</code></td>
                        <td><strong>{row.name}</strong></td>
                        <td>
                          <span className={`status-pill ${row.status.toLowerCase()}`}>
                            {row.status === 'ACCEPTED' ? (
                              <><CheckCircle2 size={12} /> Clean</>
                            ) : row.status === 'WARNING' ? (
                              <><AlertTriangle size={12} /> Sanitized</>
                            ) : (
                              <><AlertCircle size={12} /> Rejected</>
                            )}
                          </span>
                        </td>
                        <td>
                          {row.issues && row.issues.length > 0 ? (
                            <ul className="issue-list">
                              {row.issues.map((iss, idx) => (
                                <li key={idx}>
                                  <strong>[{iss.field}]</strong> {iss.message}
                                  {iss.originalValue && (
                                    <span className="issue-diff"> (from <code>"{iss.originalValue}"</code>)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted">All columns matched template schema cleanly.</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {report ? 'Close Report' : 'Cancel'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || importing}
          >
            {importing ? 'Processing CSV...' : 'Parse & Ingest Cohort'}
          </button>
        </div>
      </div>
    </div>
  );
};
