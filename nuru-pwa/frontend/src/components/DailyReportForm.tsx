import React, { useEffect, useState } from 'react';
import { http } from '../services/http';
import { WorkerEntry, WorkerEntryForm } from './WorkerEntryForm';

type Site = { id: string; name: string; serviceType: string };
type WorkerType = { id: string; name: string };

export default function DailyReportForm() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState('');
  const [workerTypes, setWorkerTypes] = useState<WorkerType[]>([]);
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<WorkerEntry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    http.get('/admin/sites').then((r) => setSites(r.data));
  }, []);

  useEffect(() => {
    if (siteId) {
      http.get(`/admin/sites/${siteId}/worker-types`).then((r) => setWorkerTypes(r.data));
      setEntries([]);
    }
  }, [siteId]);

  const addEntry = () => {
    const wt = workerTypes[0];
    if (!wt) return;
    setEntries((arr) => [...arr, { workerTypeId: wt.id, count: 1, hours: 8, overtimeHours: 0 }]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await http.post('/daily-reports', { siteId, workDate, entries });
      setMsg('Report submitted');
      setEntries([]);
    } catch (err) {
      setMsg('Failed to submit');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, padding: 16 }}>
      <h3>Daily Report</h3>
      <label>
        Site
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ padding: 12 }}>
          <option value="">Select a site</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.serviceType})
            </option>
          ))}
        </select>
      </label>
      <label>
        Work Date
        <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} style={{ padding: 12 }} />
      </label>
      <div>
        <button type="button" onClick={addEntry} style={{ padding: 12 }}>
          Add Entry
        </button>
        <div style={{ display: 'grid', gap: 16, marginTop: 12 }}>
          {entries.map((entry, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <label>
                Worker Type
                <select
                  value={entry.workerTypeId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEntries((arr) => arr.map((it, i) => (i === idx ? { ...it, workerTypeId: v } : it)));
                  }}
                  style={{ padding: 12 }}
                >
                  {workerTypes.map((wt) => (
                    <option key={wt.id} value={wt.id}>
                      {wt.name}
                    </option>
                  ))}
                </select>
              </label>
              <WorkerEntryForm
                value={entry}
                onChange={(v) => setEntries((arr) => arr.map((it, i) => (i === idx ? v : it)))}
              />
            </div>
          ))}
        </div>
      </div>
      <button type="submit" disabled={!siteId || entries.length === 0} style={{ padding: 12 }}>
        Submit Report
      </button>
      {msg && <div>{msg}</div>}
    </form>
  );
}

