import { VillainRecord } from '../types';

const STORAGE_KEY = 'vs_villain_records';

export const getLocalRecords = (): VillainRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load records", e);
    return [];
  }
};

export const saveLocalRecord = (record: VillainRecord): VillainRecord[] => {
  const records = getLocalRecords();
  // Check if ID exists, update if so (though usually we create new)
  const existingIndex = records.findIndex(r => r.id === record.id);
  let newRecords;
  if (existingIndex >= 0) {
    newRecords = [...records];
    newRecords[existingIndex] = record;
  } else {
    // Add to top
    newRecords = [record, ...records];
  }
  
  // Optional: Limit history size to e.g. 50
  if (newRecords.length > 50) {
    newRecords = newRecords.slice(0, 50);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  return newRecords;
};

export const deleteLocalRecord = (id: string): VillainRecord[] => {
  const records = getLocalRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
};
