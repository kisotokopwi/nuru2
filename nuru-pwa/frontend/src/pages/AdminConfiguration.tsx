import React, { useEffect, useState } from 'react';
import { http } from '../services/http';

export default function AdminConfiguration() {
  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    http.get('/admin/clients').then((r) => setClients(r.data));
  }, []);

  const addClient = async () => {
    if (!name) return;
    const res = await http.post('/admin/clients', { name });
    setClients((arr) => [...arr, res.data]);
    setName('');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Configuration</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" style={{ padding: 12 }} />
        <button onClick={addClient} style={{ padding: 12 }}>Add Client</button>
      </div>
      <ul>
        {clients.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}

