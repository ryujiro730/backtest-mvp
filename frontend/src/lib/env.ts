export function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const base = raw.startsWith('http') ? raw : `http://${raw}`;
  return base.replace(/\/+$/, '');
}
