import React from 'react';

export type WorkerEntry = {
  workerTypeId: string;
  count: number;
  hours: number;
  overtimeHours: number;
  productionMetrics?: Record<string, any>;
};

export function WorkerEntryForm({ value, onChange }: { value: WorkerEntry; onChange: (v: WorkerEntry) => void }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label>
        Count
        <input type="number" min={1} value={value.count} onChange={(e) => onChange({ ...value, count: Number(e.target.value) })} style={{ padding: 12 }} />
      </label>
      <label>
        Hours
        <select value={value.hours} onChange={(e) => onChange({ ...value, hours: Number(e.target.value) })} style={{ padding: 12 }}>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
        </select>
      </label>
      <label>
        Overtime Hours
        <input type="number" min={0} value={value.overtimeHours} onChange={(e) => onChange({ ...value, overtimeHours: Number(e.target.value) })} style={{ padding: 12 }} />
      </label>
    </div>
  );
}

