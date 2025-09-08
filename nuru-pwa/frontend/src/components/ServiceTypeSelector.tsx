import React from 'react';

export function ServiceTypeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: 12, width: '100%' }}>
      <option value="WAREHOUSE">Warehouse</option>
      <option value="CARGO">Cargo</option>
      <option value="FERTILIZER">Fertilizer</option>
      <option value="EQUIPMENT">Equipment</option>
      <option value="TRANSPORT">Transport</option>
    </select>
  );
}

