import React, { useState } from 'react';
import { http } from '../services/http';

export default function InvoiceGeneration() {
  const [reportId, setReportId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const generate = async () => {
    setMsg(null);
    try {
      const res = await http.post('/invoices/generate', { reportId });
      setMsg(`Generated reference ${res.data.reference}`);
    } catch (e) {
      setMsg('Generation failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Generate Invoice</h2>
      <input value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="Daily Report ID" style={{ padding: 12 }} />
      <button onClick={generate} style={{ padding: 12, marginLeft: 8 }}>Generate</button>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}

