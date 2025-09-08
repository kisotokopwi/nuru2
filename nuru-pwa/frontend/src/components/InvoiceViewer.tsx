import React from 'react';

export function InvoiceViewer({ src }: { src: string }) {
  return <iframe title="Invoice" src={src} style={{ width: '100%', height: '80vh', border: 'none' }} />;
}

