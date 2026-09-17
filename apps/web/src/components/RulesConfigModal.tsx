import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { api, RulesetConfig, CohortImpactPreview } from '../api';

interface RulesConfigModalProps {
  onClose: () => void;
  onRulesUpdated: () => void;
}

export const RulesConfigModal: React.FC<RulesConfigModalProps> = ({ onClose, onRulesUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [rules, setRules] = useState<RulesetConfig>({
    id: 'default',
    name: 'Standard Campus Scoring Model',
    version: 1,
    cgpaMax: 30,
    skillsMax: 30,
    projectsMax: 20,
    internshipMax: 10,
    certificationMax: 10,
    strongThreshold: 75,
    averageThreshold: 50,
    nonTechnicalSkills: ['ms office', 'ms word', 'excel', 'powerpoint', 'word', 'communication', 'english'],
  });
  const [preview, setPreview] = useState<CohortImpactPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/rules');
      if (res.data?.rules) {
        setRules(res.data.rules);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load current ruleset');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      setError(null);
      const res = await api.post('/api/rules/preview', rules);
      setPreview(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate impact preview');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put('/api/rules', rules);
      setSuccessMsg(`Ruleset updated to v${(rules.version || 1) + 1}! All student scores have been recalculated.`);
      onRulesUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset scoring model to default rules (30/30/20/10/10, Strong>=75, Avg>=50)?')) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await api.post('/api/rules/reset');
      setRules(res.data.rules);
      setPreview(null);
      setSuccessMsg('Ruleset reset to factory defaults!');
      onRulesUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset rules');
    } finally {
      setSaving(false);
    }
  };

  const totalMaxPoints = rules.cgpaMax + rules.skillsMax + rules.projectsMax + rules.internshipMax + rules.certificationMax;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge rules">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="modal-title">Scoring Model & Ruleset Configuration</h2>
              <p className="modal-subtitle">
                Adjust dimension weights and categorization cutoffs. Version <strong>v{rules.version || 1}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert-box error mb-4">{error}</div>}
          {successMsg && <div className="alert-box success mb-4">{successMsg}</div>}


          {loading ? (
            <div className="p-8 text-center text-muted">Loading current scoring configuration...</div>
          ) : (
            <div className="rules-grid">
              {/* Left Column: Sliders */}
              <div className="rules-sliders-col">
                <div className="card mb-4">
                  <div className="card-header flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Dimension Max Point Weights</h3>
                    <span className={`badge ${totalMaxPoints === 100 ? 'badge-strong' : 'badge-needs'}`}>
                      Total Max: {totalMaxPoints} pts {totalMaxPoints !== 100 && '(Recommended: 100)'}
                    </span>
                  </div>
                  <div className="card-body">
                    {/* CGPA Slider */}
                    <div className="slider-group mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">Academic Performance (CGPA)</label>
                        <span className="font-bold text-sm text-primary">{rules.cgpaMax} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={rules.cgpaMax}
                        onChange={(e) => setRules({ ...rules, cgpaMax: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted">Calculated as: (CGPA / 10) * {rules.cgpaMax}</div>
                    </div>

                    {/* Skills Slider */}
                    <div className="slider-group mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">Technical Skills Count</label>
                        <span className="font-bold text-sm text-primary">{rules.skillsMax} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={rules.skillsMax}
                        onChange={(e) => setRules({ ...rules, skillsMax: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted">4 pts per unique technical skill (max {rules.skillsMax})</div>
                    </div>

                    {/* Projects Slider */}
                    <div className="slider-group mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">Projects Count</label>
                        <span className="font-bold text-sm text-primary">{rules.projectsMax} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="5"
                        value={rules.projectsMax}
                        onChange={(e) => setRules({ ...rules, projectsMax: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted">5 pts per portfolio project (max {rules.projectsMax})</div>
                    </div>

                    {/* Internships Slider */}
                    <div className="slider-group mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">Internship Experience</label>
                        <span className="font-bold text-sm text-primary">{rules.internshipMax} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="5"
                        value={rules.internshipMax}
                        onChange={(e) => setRules({ ...rules, internshipMax: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted">5 pts per verified internship (max {rules.internshipMax})</div>
                    </div>

                    {/* Certifications Slider */}
                    <div className="slider-group">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">Certifications</label>
                        <span className="font-bold text-sm text-primary">{rules.certificationMax} pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="5"
                        value={rules.certificationMax}
                        onChange={(e) => setRules({ ...rules, certificationMax: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted">2.5 pts per credential (max {rules.certificationMax})</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold text-sm">Categorization Thresholds</h3>
                  </div>
                  <div className="card-body">
                    <div className="slider-group mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">
                          <span className="badge badge-strong mr-1">Strong</span> Score Cutoff (≥)
                        </label>
                        <span className="font-bold text-sm text-emerald-600">{rules.strongThreshold} pts</span>
                      </div>
                      <input
                        type="range"
                        min={rules.averageThreshold + 5}
                        max="95"
                        step="1"
                        value={rules.strongThreshold}
                        onChange={(e) => setRules({ ...rules, strongThreshold: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                    </div>

                    <div className="slider-group">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-muted">
                          <span className="badge badge-average mr-1">Average</span> Score Cutoff (≥)
                        </label>
                        <span className="font-bold text-sm text-amber-600">{rules.averageThreshold} pts</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max={rules.strongThreshold - 5}
                        step="1"
                        value={rules.averageThreshold}
                        onChange={(e) => setRules({ ...rules, averageThreshold: Number(e.target.value) })}
                        className="range-slider w-full"
                      />
                      <div className="text-2xs text-muted mt-1">
                        Candidates below {rules.averageThreshold} pts are categorized as <span className="badge badge-needs">Needs Improvement</span>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Cohort Impact Preview */}
              <div className="rules-preview-col">
                <div className="card h-full flex flex-col">
                  <div className="card-header flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Live Cohort Impact Simulation</h3>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={handlePreview}
                      disabled={previewing}
                    >
                      {previewing ? 'Simulating...' : '🔍 Simulate Impact'}
                    </button>
                  </div>
                  <div className="card-body flex-1 flex flex-col">
                    {!preview ? (
                      <div className="text-center py-10 text-muted flex-1 flex flex-col justify-center items-center">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="font-medium text-sm">Preview changes before saving</p>
                        <p className="text-xs text-muted max-w-xs mt-1">
                          Click <strong>Simulate Impact</strong> to see how these weight and threshold changes will shift candidate scores and categories across the cohort.
                        </p>
                        <button className="btn btn-primary btn-sm mt-4" onClick={handlePreview} disabled={previewing}>
                          Run Simulation Now
                        </button>
                      </div>
                    ) : (
                      <div className="preview-results flex-1 flex flex-col">
                        <div className="impact-kpis grid grid-cols-3 gap-2 mb-4">
                          <div className="impact-kpi-card bg-emerald-50 p-3 rounded border border-emerald-200 text-center">
                            <div className="text-2xs font-semibold text-emerald-800">STRONG DELTA</div>
                            <div className={`text-lg font-black ${preview.strongDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {preview.strongDelta > 0 ? `+${preview.strongDelta}` : preview.strongDelta}
                            </div>
                          </div>
                          <div className="impact-kpi-card bg-amber-50 p-3 rounded border border-amber-200 text-center">
                            <div className="text-2xs font-semibold text-amber-800">AVERAGE DELTA</div>
                            <div className={`text-lg font-black ${preview.averageDelta >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {preview.averageDelta > 0 ? `+${preview.averageDelta}` : preview.averageDelta}
                            </div>
                          </div>
                          <div className="impact-kpi-card bg-rose-50 p-3 rounded border border-rose-200 text-center">
                            <div className="text-2xs font-semibold text-rose-800">NEEDS IMPR. DELTA</div>
                            <div className={`text-lg font-black ${preview.needsImprovementDelta >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {preview.needsImprovementDelta > 0 ? `+${preview.needsImprovementDelta}` : preview.needsImprovementDelta}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-muted mb-2 flex justify-between">
                          <span>Shifting Candidates ({preview.students.filter(s => s.categoryChanged).length} total)</span>
                          <span className="text-2xs text-muted">{preview.totalStudents} students evaluated</span>
                        </div>

                        <div className="table-responsive flex-1 max-h-64 border rounded overflow-y-auto">
                          <table className="table table-sm text-xs">
                            <thead className="sticky top-0 bg-slate-100">
                              <tr>
                                <th>Candidate</th>
                                <th>Current</th>
                                <th>New Score</th>
                                <th>Category Shift</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preview.students.filter(s => s.categoryChanged).length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="text-center py-6 text-muted">
                                    No category changes detected under this proposed configuration.
                                  </td>
                                </tr>
                              ) : (
                                preview.students.filter(s => s.categoryChanged).map(st => (
                                  <tr key={st.externalId}>
                                    <td className="font-semibold">{st.name} <span className="text-muted font-normal">({st.externalId})</span></td>
                                    <td>{st.currentScore} <span className="text-2xs text-muted">({st.currentCategory})</span></td>
                                    <td>
                                      <strong>{st.newScore}</strong>{' '}
                                      <span className={st.scoreDelta >= 0 ? 'text-emerald-600 text-2xs' : 'text-rose-600 text-2xs'}>
                                        ({st.scoreDelta > 0 ? `+${st.scoreDelta}` : st.scoreDelta})
                                      </span>
                                    </td>
                                    <td>
                                      <span className="badge badge-sm badge-secondary mr-1">{st.currentCategory}</span>
                                      ➔ <span className={`badge badge-sm ${st.newCategory === 'STRONG' ? 'badge-strong' : st.newCategory === 'AVERAGE' ? 'badge-average' : 'badge-needs'} ml-1`}>
                                        {st.newCategory}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t text-2xs text-muted">
                      <strong>Rule Note:</strong> Non-technical skills ({rules.nonTechnicalSkills?.join(', ') || 'Word, Excel'}) are ignored in scoring calculations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer flex justify-between">
          <button className="btn btn-outline-danger btn-sm" onClick={handleReset} disabled={saving}>
            ↺ Reset Defaults
          </button>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving & Recalculating...' : '💾 Save & Recalculate Cohort'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
