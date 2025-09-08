import crypto from 'crypto';

export function generateReferenceId(date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `NRU-${ymd}-${rand}`;
}

