import crypto from 'crypto';

const getKey = () => {
  const key = process.env.INVOICE_SIGNING_SECRET;
  if (!key) throw new Error('INVOICE_SIGNING_SECRET not set');
  return key;
};

export function signInvoicePayload(payload) {
  const hmac = crypto.createHmac('sha256', getKey());
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

export function verifyInvoiceSignature(payload, signature) {
  return signInvoicePayload(payload) === signature;
}

