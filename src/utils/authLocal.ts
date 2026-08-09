
// src/utils/authLocal.ts
export type UserRole = 'inspector' | 'admin' | 'master' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  unitId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const LS_AUTH = 'isAuth';
const LS_VALIDITY = 'validity';

// כמה זמן הסשן המקומי תקף (בדקות)
const DEFAULT_VALID_MINUTES = 480; // 8 שעות

export function saveLocalUser(u: User, validMinutes = DEFAULT_VALID_MINUTES) {
  const payload = { user__: { ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() } };
  localStorage.setItem(LS_AUTH, JSON.stringify(payload));
  const validUntil = Math.floor(Date.now() / 1000) + validMinutes * 60;
  localStorage.setItem(LS_VALIDITY, String(validUntil));
}

export function readLocalUser(): User | null {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const maybe = parsed?.user__;
    if (!maybe) return null;
    const u: User = {
      id: String(maybe.id ?? ''),
      email: String(maybe.email ?? ''),
      name: String(maybe.name ?? ''),
      unitId: String(maybe.unitId ?? ''),
      role: (maybe.role as UserRole) ?? 'user',
      createdAt: maybe.createdAt ? new Date(maybe.createdAt) : new Date(),
      updatedAt: maybe.updatedAt ? new Date(maybe.updatedAt) : new Date(),
    };
    return u;
  } catch {
    return null;
  }
}

export function isLocalValid(): boolean {
  const v = localStorage.getItem(LS_VALIDITY);
  if (!v) return false;
  const now = Math.floor(Date.now() / 1000);
  return Number(v) > now;
}

export function clearLocalUser() {
  localStorage.removeItem(LS_AUTH);
  localStorage.removeItem(LS_VALIDITY);
}
