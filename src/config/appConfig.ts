
export type AppConfig = {
  API_BASE: string;
};

let cfg: AppConfig | null = null;
let resolvedApiBase = '';

/** טוען config.json מ-public ומיישם כלל IAADOM *////
export async function loadAppConfig(): Promise<void> {
  if (cfg) return;

  const res = await fetch(process.env.PUBLIC_URL + '/config.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load /config.json from public');
  }
  cfg = (await res.json()) as AppConfig;

  const base = (cfg.API_BASE || '').replace(/\/+$/, '');
  const hasIAADOM =
    window.location.href.toUpperCase().includes('IAADOM') ||
    window.location.host.toUpperCase().includes('IAADOM');

  resolvedApiBase = hasIAADOM ? `${base}/IAADOM` : base;
}

export function getApiBase(): string {
  if (!cfg) throw new Error('Config not loaded yet. Call loadAppConfig() first.');
  return resolvedApiBase;
}
