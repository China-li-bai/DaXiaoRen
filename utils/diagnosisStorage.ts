import { Diagnosis } from './bazi';

const STORAGE_KEY = 'savedDiagnoses';

export interface SavedDiagnosis extends Diagnosis {
  id: string;
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

export function saveDiagnosis(diagnosis: Diagnosis): SavedDiagnosis {
  const saved = getSavedDiagnoses();
  
  const newDiagnosis: SavedDiagnosis = {
    ...diagnosis,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    lastUsed: Date.now(),
    useCount: 0
  };
  
  const updated = [...saved, newDiagnosis];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return newDiagnosis;
}

export function getSavedDiagnoses(): SavedDiagnosis[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved diagnoses:', e);
      return [];
    }
  }
  return [];
}

export function updateDiagnosisUse(id: string): void {
  const saved = getSavedDiagnoses();
  const updated = saved.map(d => 
    d.id === id ? { ...d, lastUsed: Date.now(), useCount: d.useCount + 1 } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteDiagnosis(id: string): void {
  const saved = getSavedDiagnoses();
  const updated = saved.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getMostUsedDiagnosis(): SavedDiagnosis | null {
  const saved = getSavedDiagnoses();
  if (saved.length === 0) return null;
  
  return saved.reduce((most, current) => 
    current.useCount > most.useCount ? current : most
  );
}

export function getRecentDiagnosis(limit: number = 5): SavedDiagnosis[] {
  const saved = getSavedDiagnoses();
  return saved
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, limit);
}
