import React, { useState } from 'react';
import { http } from '../services/http';
import { InvoicePreview } from '../components/InvoicePreview';

export default function InvoiceSearch() {
  const [reference, setReference] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const search = async () => {
    const res = await http.get('/invoices', { params: { reference } });
    setInvoices(res.data);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Invoice Search</h2>
      <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Reference" style={{ padding: 12 }} />
      <button onClick={search} style={{ padding: 12, marginLeft: 8 }}>Search</button>
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id}>
            {inv.referenceId} — {inv.type}
            <button style={{ marginLeft: 8 }} onClick={() => setSelected(inv)}>Preview</button>
          </li>
        ))}
      </ul>
      {selected && (
        <InvoicePreview url={`${import.meta.env.VITE_API_BASE_URL}/invoices/${selected.id}/${selected.type === 'CLIENT' ? 'client' : 'internal'}`} />
      )}
    </div>
  );
}

