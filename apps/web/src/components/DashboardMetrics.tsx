import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  Layers,
} from 'lucide-react';
import { DashboardSummary } from '../api';

interface DashboardMetricsProps {
  summary: DashboardSummary | null;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  summary,
  onClearFilters,
  isFiltered,
}) => {
  if (!summary) return null;

  const {
    totalCohortCount,
    total,
    strong,
    strongPct,
    average,
    avgPct,
    needsImprovement,
    needsPct,
    averageCgpa,
    maxCgpa,
    minCgpa,
    withInternship,
    internshipRate,
    withCertification,
    certificationRate,
    overriddenCount = 0,
    cgpaHistogram,
  } = summary;

  // Donut SVG circumference calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strongStroke = (strongPct / 100) * circumference;
  const avgStroke = (avgPct / 100) * circumference;
  const needsStroke = (needsPct / 100) * circumference;

  const histogramEntries = cgpaHistogram
    ? Object.entries(cgpaHistogram)
    : [
        ['<6.0', 0],
        ['6.0–6.9', 0],
        ['7.0–7.9', 0],
        ['8.0–8.9', 0],
        ['9.0–10.0', 0],
      ];

  const maxHistCount = Math.max(1, ...histogramEntries.map(([, count]) => Number(count) || 0));

  return (
    <div className="dashboard-metrics-section">
      {/* Live Filter Banner if filtered */}
      {isFiltered && (
        <div className="filtered-status-banner">
          <div className="filtered-status-info">
            <Filter size={16} />
            <span>
              <strong>Filtered Cohort View:</strong> Showing metrics for <strong>{total}</strong> active candidate(s) out of <strong>{totalCohortCount}</strong> total in batch.
            </span>
          </div>
          <button type="button" className="btn-clear-inline" onClick={onClearFilters}>
            Reset to Full Cohort
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Candidates */}
        <div className="kpi-card total">
          <div className="kpi-header">
            <span className="kpi-title">Evaluated Cohort</span>
            <div className="kpi-icon-wrap total">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{total}</span>
            <span className="kpi-subtext">Students in view</span>
          </div>
          <div className="kpi-footer">
            <span>Avg CGPA: <strong>{(Number(averageCgpa) || 0).toFixed(2)}</strong></span>
            <span className="kpi-divider">•</span>
            <span>Range: {(Number(minCgpa) || 0).toFixed(1)}–{(Number(maxCgpa) || 0).toFixed(1)}</span>
          </div>
        </div>

        {/* Strong Tier */}
        <div className="kpi-card strong">
          <div className="kpi-header">
            <span className="kpi-title">Strong (Ready)</span>
            <div className="kpi-icon-wrap strong">
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{strong}</span>
            <span className="kpi-badge strong">{strongPct}%</span>
          </div>
          <div className="kpi-footer">
            <span>Score ≥ 8.0/10</span>
            <span className="kpi-subtext">Tier-1 Shortlist Ready</span>
          </div>
        </div>

        {/* Average Tier */}
        <div className="kpi-card average">
          <div className="kpi-header">
            <span className="kpi-title">Average (Capable)</span>
            <div className="kpi-icon-wrap average">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{average}</span>
            <span className="kpi-badge average">{avgPct}%</span>
          </div>
          <div className="kpi-footer">
            <span>Score 5.0–7.9/10</span>
            <span className="kpi-subtext">Domain Competent</span>
          </div>
        </div>

        {/* Needs Improvement Tier */}
        <div className="kpi-card needs">
          <div className="kpi-header">
            <span className="kpi-title">Needs Improvement</span>
            <div className="kpi-icon-wrap needs">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-value-wrap">
            <span className="kpi-value">{needsImprovement}</span>
            <span className="kpi-badge needs">{needsPct}%</span>
          </div>
          <div className="kpi-footer">
            <span>Score &lt; 5.0/10</span>
            <span className="kpi-subtext">Target Remediation</span>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Row */}
      <div className="analytics-row">
        {/* Category Distribution Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Placement Readiness Breakdown</h3>
            <span className="chart-subtitle">Real-time cohort distribution</span>
          </div>
          <div className="donut-chart-container">
            <div className="donut-svg-wrap">
              <svg width="120" height="120" viewBox="0 0 100 100" className="donut-svg">
                {/* Background Ring */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Strong Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="12"
                  strokeDasharray={`${strongStroke} ${circumference}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
                {/* Average Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="12"
                  strokeDasharray={`${avgStroke} ${circumference}`}
                  strokeDashoffset={`-${strongStroke}`}
                  transform="rotate(-90 50 50)"
                />
                {/* Needs Improvement Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="12"
                  strokeDasharray={`${needsStroke} ${circumference}`}
                  strokeDashoffset={`-${strongStroke + avgStroke}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="donut-center-label">
                <span className="donut-center-number">{total}</span>
                <span className="donut-center-sub">Total</span>
              </div>
            </div>

            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot strong" />
                <span className="legend-name">Strong:</span>
                <strong className="legend-count">{strong}</strong>
                <span className="legend-pct">({strongPct}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot average" />
                <span className="legend-name">Average:</span>
                <strong className="legend-count">{average}</strong>
                <span className="legend-pct">({avgPct}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot needs" />
                <span className="legend-name">Needs Imp:</span>
                <strong className="legend-count">{needsImprovement}</strong>
                <span className="legend-pct">({needsPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CGPA Distribution Histogram */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Academic CGPA Histogram</h3>
            <span className="chart-subtitle">Grade bracket distribution across cohort</span>
          </div>
          <div className="histogram-container">
            {histogramEntries.map(([bracket, count]) => {
              const heightPct = Math.round(((Number(count) || 0) / maxHistCount) * 100);
              return (
                <div key={bracket} className="hist-bar-col">
                  <span className="hist-count-top">{count}</span>
                  <div className="hist-bar-track">
                    <div
                      className={`hist-bar-fill ${bracket === '9.0–10.0' || bracket === '8.0–8.9' ? 'high' : bracket === '<6.0' ? 'low' : 'mid'}`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                  <span className="hist-label">{bracket}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industry Readiness Indicators */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Industry Credentials Rate</h3>
            <span className="chart-subtitle">Field experience metrics</span>
          </div>
          <div className="readiness-metrics-grid">
            <div className="readiness-metric-box">
              <div className="readiness-icon-wrap">
                <BriefcaseBusiness size={18} />
              </div>
              <div className="readiness-details">
                <span className="readiness-label">Internship Verified</span>
                <div className="readiness-val-row">
                  <span className="readiness-val">{withInternship} / {total}</span>
                  <span className="readiness-badge">{internshipRate}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${internshipRate}%`, backgroundColor: '#3b82f6' }} />
                </div>
              </div>
            </div>

            <div className="readiness-metric-box">
              <div className="readiness-icon-wrap">
                <CheckCircle2 size={18} />
              </div>
              <div className="readiness-details">
                <span className="readiness-label">Certified Credentials</span>
                <div className="readiness-val-row">
                  <span className="readiness-val">{withCertification} / {total}</span>
                  <span className="readiness-badge">{certificationRate}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${certificationRate}%`, backgroundColor: '#8b5cf6' }} />
                </div>
              </div>
            </div>

            {overriddenCount > 0 && (
              <div className="readiness-metric-box override-box">
                <div className="readiness-icon-wrap override">
                  <Layers size={18} />
                </div>
                <div className="readiness-details">
                  <span className="readiness-label">Manual Overrides</span>
                  <span className="readiness-val override-text">{overriddenCount} student(s) overridden by coordinator</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
