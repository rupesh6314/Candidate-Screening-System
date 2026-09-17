import React from 'react';
import {
  Search,
  Filter,
  X,
  Sliders,
  Sparkles,
  Check,
  BriefcaseBusiness,
  Award,
  Layers,
} from 'lucide-react';

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  minCgpa: string;
  setMinCgpa: (val: string) => void;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  skillsMatchMode: 'AND' | 'OR';
  setSkillsMatchMode: (mode: 'AND' | 'OR') => void;
  category: string;
  setCategory: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  hasInternship: boolean;
  setHasInternship: (val: boolean) => void;
  hasCertification: boolean;
  setHasCertification: (val: boolean) => void;
  isOverriddenOnly: boolean;
  setIsOverriddenOnly: (val: boolean) => void;
  availableBranches: string[];
  availableSkills: string[];
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  setSearch,
  minCgpa,
  setMinCgpa,
  selectedSkills,
  onToggleSkill,
  skillsMatchMode,
  setSkillsMatchMode,
  category,
  setCategory,
  branch,
  setBranch,
  hasInternship,
  setHasInternship,
  hasCertification,
  setHasCertification,
  isOverriddenOnly,
  setIsOverriddenOnly,
  availableBranches,
  availableSkills,
  onClearFilters,
  activeFilterCount,
}) => {
  return (
    <div className="filter-panel-card">
      <div className="filter-header-row">
        <div className="filter-title-wrap">
          <Filter size={18} />
          <h2 className="filter-title">Cohort Multi-Filter & Search</h2>
          {activeFilterCount > 0 && (
            <span className="active-filters-pill">{activeFilterCount} active</span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button type="button" className="btn-clear-filters" onClick={onClearFilters}>
            <X size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Primary Filter Grid */}
      <div className="filter-grid">
        {/* Search Input */}
        <div className="filter-group span-2">
          <label className="filter-label">Search Candidate Profile</label>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="filter-input search-input"
              placeholder="Search by student name, email, ID, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Branch Filter */}
        <div className="filter-group">
          <label className="filter-label">Engineering Branch</label>
          <select
            className="filter-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {availableBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Readiness Category</label>
          <div className="category-btn-group">
            <button
              type="button"
              className={`cat-btn ${category === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              All
            </button>
            <button
              type="button"
              className={`cat-btn strong ${category === 'STRONG' ? 'active' : ''}`}
              onClick={() => setCategory(category === 'STRONG' ? '' : 'STRONG')}
            >
              Strong
            </button>
            <button
              type="button"
              className={`cat-btn average ${category === 'AVERAGE' ? 'active' : ''}`}
              onClick={() => setCategory(category === 'AVERAGE' ? '' : 'AVERAGE')}
            >
              Average
            </button>
            <button
              type="button"
              className={`cat-btn needs ${category === 'NEEDS_IMPROVEMENT' ? 'active' : ''}`}
              onClick={() => setCategory(category === 'NEEDS_IMPROVEMENT' ? '' : 'NEEDS_IMPROVEMENT')}
            >
              Needs Imp.
            </button>
          </div>
        </div>

        {/* Minimum CGPA Slider & Number */}
        <div className="filter-group span-2">
          <div className="cgpa-label-row">
            <label className="filter-label">Minimum CGPA Cutoff</label>
            <span className="cgpa-val-display">
              {minCgpa && Number(minCgpa) > 0 ? `≥ ${Number(minCgpa).toFixed(1)}` : 'Any CGPA'}
            </span>
          </div>
          <div className="cgpa-slider-wrap">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              className="cgpa-range-slider"
              value={minCgpa || '0'}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMinCgpa(val === 0 ? '' : val.toFixed(1));
              }}
            />
            <div className="cgpa-ticks-wrapper">
              {[0, 2, 4, 6, 7, 8, 9, 10].map((val) => {
                const isCurrent = minCgpa ? Math.abs(Number(minCgpa) - val) < 0.05 : val === 0;
                return (
                  <button
                    key={val}
                    type="button"
                    className={`cgpa-tick-item ${isCurrent ? 'active' : ''}`}
                    style={{ left: `${(val / 10) * 100}%` }}
                    onClick={() => setMinCgpa(val === 0 ? '' : val.toFixed(1))}
                    title={`Set CGPA cutoff to ≥ ${val.toFixed(1)}`}
                  >
                    <span className="tick-mark" />
                    <span className="tick-label">{val.toFixed(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Experience & Status Checkboxes */}
        <div className="filter-group span-2">
          <label className="filter-label">Experience & Status Criteria</label>
          <div className="toggle-checkbox-row">
            <label className={`toggle-checkbox-label ${hasInternship ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={hasInternship}
                onChange={(e) => setHasInternship(e.target.checked)}
              />
              <BriefcaseBusiness size={14} />
              <span>Internship Required</span>
            </label>

            <label className={`toggle-checkbox-label ${hasCertification ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={hasCertification}
                onChange={(e) => setHasCertification(e.target.checked)}
              />
              <Award size={14} />
              <span>Certified Only</span>
            </label>

            <label className={`toggle-checkbox-label ${isOverriddenOnly ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={isOverriddenOnly}
                onChange={(e) => setIsOverriddenOnly(e.target.checked)}
              />
              <Layers size={14} />
              <span>Manual Overrides Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Multi-Skill Chips with AND / OR Mode Toggle */}
      <div className="skills-filter-section">
        <div className="skills-filter-header">
          <div className="skills-filter-title">
            <Sparkles size={14} />
            <span>Filter by Core Technical Skills:</span>
          </div>

          {/* AND / OR Logic Switch */}
          {selectedSkills.length > 1 && (
            <div className="match-mode-switch">
              <span className="match-mode-label">Logic:</span>
              <button
                type="button"
                className={`mode-btn ${skillsMatchMode === 'OR' ? 'active' : ''}`}
                onClick={() => setSkillsMatchMode('OR')}
                title="Candidates possessing ANY of the selected skills"
              >
                Match ANY (OR)
              </button>
              <button
                type="button"
                className={`mode-btn ${skillsMatchMode === 'AND' ? 'active' : ''}`}
                onClick={() => setSkillsMatchMode('AND')}
                title="Candidates possessing ALL of the selected skills"
              >
                Match ALL (AND)
              </button>
            </div>
          )}
        </div>

        <div className="skill-pills-wrap">
          {availableSkills.map((sk) => {
            const isSelected = selectedSkills.includes(sk);
            return (
              <button
                key={sk}
                type="button"
                className={`skill-pill-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggleSkill(sk)}
              >
                {isSelected && <Check size={12} />}
                <span>{sk}</span>
              </button>
            );
          })}
          {selectedSkills.length > 0 && (
            <button
              type="button"
              className="skill-pill-clear"
              onClick={() => {
                for (const sk of [...selectedSkills]) onToggleSkill(sk);
              }}
            >
              Clear Skills
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
