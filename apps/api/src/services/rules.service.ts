import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_RULES, RulesetConfig, categorize } from './categorization.service.js';
import { audit } from './audit.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const RULES_FILE = path.join(DATA_DIR, 'rules.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getActiveRuleset(): RulesetConfig {
  ensureDataDir();
  if (fs.existsSync(RULES_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
      return { ...DEFAULT_RULES, ...data };
    } catch (_) {}
  }
  return { ...DEFAULT_RULES };
}

export async function saveRuleset(
  newRules: Partial<RulesetConfig>,
  userId?: string
): Promise<RulesetConfig> {
  ensureDataDir();
  const current = getActiveRuleset();
  const updated: RulesetConfig = {
    ...current,
    ...newRules,
    id: `ruleset-v${(current.version || 1) + 1}`,
    version: (current.version || 1) + 1,
    cgpaMax: Number(newRules.cgpaMax ?? current.cgpaMax),
    skillsMax: Number(newRules.skillsMax ?? current.skillsMax),
    projectsMax: Number(newRules.projectsMax ?? current.projectsMax),
    internshipMax: Number(newRules.internshipMax ?? current.internshipMax),
    certificationMax: Number(newRules.certificationMax ?? current.certificationMax),
    strongThreshold: Number(newRules.strongThreshold ?? current.strongThreshold),
    averageThreshold: Number(newRules.averageThreshold ?? current.averageThreshold),
    nonTechnicalSkills: newRules.nonTechnicalSkills ?? current.nonTechnicalSkills,
  };

  fs.writeFileSync(RULES_FILE, JSON.stringify(updated, null, 2), 'utf8');

  if (userId) {
    await audit(userId, 'UPDATE_RULES', 'RULES', updated.id, {
      version: updated.version,
      strongThreshold: updated.strongThreshold,
      averageThreshold: updated.averageThreshold,
    });
  }

  return updated;
}

export async function resetRulesetToDefault(userId?: string): Promise<RulesetConfig> {
  ensureDataDir();
  const reset = { ...DEFAULT_RULES, version: (getActiveRuleset().version || 1) + 1 };
  fs.writeFileSync(RULES_FILE, JSON.stringify(reset, null, 2), 'utf8');

  if (userId) {
    await audit(userId, 'RESET_RULES', 'RULES', reset.id);
  }

  return reset;
}

export interface ImpactPreviewItem {
  id?: number;
  externalId: string;
  name: string;
  currentScore: number;
  currentCategory: string;
  newScore: number;
  newCategory: string;
  scoreDelta: number;
  categoryChanged: boolean;
}

export interface CohortImpactPreview {
  currentRules: RulesetConfig;
  previewRules: RulesetConfig;
  totalStudents: number;
  strongDelta: number;
  averageDelta: number;
  needsImprovementDelta: number;
  students: ImpactPreviewItem[];
}

export function previewCohortImpact(
  proposedRules: Partial<RulesetConfig>,
  students: any[]
): CohortImpactPreview {
  const currentRules = getActiveRuleset();
  const mergedRules: RulesetConfig = { ...currentRules, ...proposedRules };

  let currentStrong = 0;
  let currentAvg = 0;
  let currentNeeds = 0;

  let newStrong = 0;
  let newAvg = 0;
  let newNeeds = 0;

  const items: ImpactPreviewItem[] = students.map((s) => {
    const currentEval = categorize(s, currentRules);
    const newEval = categorize(s, mergedRules);

    if (currentEval.category === 'STRONG') currentStrong++;
    else if (currentEval.category === 'AVERAGE') currentAvg++;
    else currentNeeds++;

    if (newEval.category === 'STRONG') newStrong++;
    else if (newEval.category === 'AVERAGE') newAvg++;
    else newNeeds++;

    return {
      id: s.id,
      externalId: s.externalId,
      name: s.name,
      currentScore: currentEval.score,
      currentCategory: currentEval.category,
      newScore: newEval.score,
      newCategory: newEval.category,
      scoreDelta: Number((newEval.score - currentEval.score).toFixed(2)),
      categoryChanged: currentEval.category !== newEval.category,
    };
  });

  return {
    currentRules,
    previewRules: mergedRules,
    totalStudents: students.length,
    strongDelta: newStrong - currentStrong,
    averageDelta: newAvg - currentAvg,
    needsImprovementDelta: newNeeds - currentNeeds,
    students: items,
  };
}
