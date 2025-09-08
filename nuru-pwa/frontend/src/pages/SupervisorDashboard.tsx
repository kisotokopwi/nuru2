import React, { useEffect, useState } from 'react';
import { http } from '../services/http';

type Report = { id: string; workDate: string; totalAmount: string };

export default function SupervisorDashboard() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    http.get('/my-reports').then((r) => setReports(r.data));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>My Reports</h2>
      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            {new Date(r.workDate).toLocaleDateString()} — ${Number(r.totalAmount).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

