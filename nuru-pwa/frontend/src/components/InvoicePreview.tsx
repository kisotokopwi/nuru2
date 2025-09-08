import React from 'react';

export function InvoicePreview({ url }: { url: string }) {
  return (
    <div style={{ border: '1px solid #ddd', height: 600 }}>
      <iframe title="Invoice Preview" src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
}

