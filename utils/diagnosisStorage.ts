import { Diagnosis } from './bazi';
import { encryptAndStore, decryptAndRetrieve, isEncryptionEnabled, migrateToEncryption } from './encryption';

const STORAGE_KEY = 'savedDiagnoses';

export interface SavedDiagnosis extends Diagnosis {
  id: string;
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

export async function saveDiagnosis(diagnosis: Diagnosis): Promise<SavedDiagnosis> {
  const saved = await getSavedDiagnoses();
  
  const newDiagnosis: SavedDiagnosis = {
    ...diagnosis,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    lastUsed: Date.now(),
    useCount: 0
  };
  
  const updated = [...saved, newDiagnosis];
  await encryptAndStore(STORAGE_KEY, updated);
  
  return newDiagnosis;
}

export async function getSavedDiagnoses(): Promise<SavedDiagnosis[]> {
  const saved = await decryptAndRetrieve<SavedDiagnosis[]>(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  
  const plainData = localStorage.getItem(STORAGE_KEY);
  if (plainData) {
    try {
      const parsed = JSON.parse(plainData);
      if (isEncryptionEnabled()) {
        await migrateToEncryption(STORAGE_KEY);
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing saved diagnoses:', e);
      return [];
    }
  }
  return [];
}

export async function updateDiagnosisUse(id: string): Promise<void> {
  const saved = await getSavedDiagnoses();
  const updated = saved.map(d => 
    d.id === id ? { ...d, lastUsed: Date.now(), useCount: d.useCount + 1 } : d
  );
  await encryptAndStore(STORAGE_KEY, updated);
}

export async function deleteDiagnosis(id: string): Promise<void> {
  const saved = await getSavedDiagnoses();
  const updated = saved.filter(d => d.id !== id);
  await encryptAndStore(STORAGE_KEY, updated);
}

export async function getMostUsedDiagnosis(): Promise<SavedDiagnosis | null> {
  const saved = await getSavedDiagnoses();
  if (saved.length === 0) return null;
  
  return saved.reduce((most, current) => 
    current.useCount > most.useCount ? current : most
  );
}

export async function getRecentDiagnosis(limit: number = 5): Promise<SavedDiagnosis[]> {
  const saved = await getSavedDiagnoses();
  return saved
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, limit);
}

export async function deleteAllDiagnoses(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}
