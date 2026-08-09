
import { create } from 'zustand';
import { api } from '../config/api';
import {
  InspectionForm,
  Device,
  Inspector,
  InspectorRole,
  Unit,
  Area,
  User,
  UserRole,
} from '../types/inspection';

/** ---------------- API paths ---------------- */

const API = {
  forms: 'Form/forms',
  formsDevices: (formId: string) => `Form/forms/${formId}/devices`,
  updateDeviceInForm: (formId: string) => `Form/forms/${formId}/update-device-in-form`,
  deleteInspectedDevice: (formId: string, deviceId: string) =>
    `Form/forms/${formId}/devices/${deviceId}`,

  devices: 'Device/devices',
  deviceById: (id: string) => `Device/devices/${id}`,
  deviceCheckNumber: 'Device/devices/check-device-number',

  inspectors: 'Inspector/inspectors',
  inspectorById: (id: string) => `Inspector/inspectors/${id}`,

  units: 'unit/units',
  unitById: (id: string) => `unit/units/${id}`,

  areas: 'Area/areas',
  areaById: (id: string) => `Area/areas/${id}`,

  /** Auth (UTA) */
  auth: { adLogin: '/Auth' }, // נשלח כנתיב מלא -> /api/Auth בשרת שלך

  /** Master-only (ניהול משתמשים) */
  masterUsers: 'master/users',
  masterUserById: (id: string) => `master/users/${id}`,
};

/** ---------------- ManagedUser type ---------------- */

export type ManagedUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  unit?: string | null;
  unitId: string | null;
  role: string;
  active: number; // 0/1
  admin: number; // 0/1
  department?: string | null;
  phone?: string | null;
  mobile?: string | null;
  team?: string | null;
  status?: string | null;
  createDt?: number | null;
  lastModDt?: number | null;
};

/** ---------------- Store interface ---------------- */

interface InspectionState {
  currentForm: InspectionForm | null;
  forms: InspectionForm[];
  devices: Device[];
  inspectors: Inspector[];
  units: Unit[];
  areas: Area[];
  currentUser: User | null;

  /** Master users management */
  managedUsers: ManagedUser[];
  isLoadingUsers: boolean;
  usersError: string | null;

  selectedUnitId: string | null;
  formsDateRange: { startDate: Date; endDate: Date };
  hasMoreForms: boolean;
  isLoadingMoreForms: boolean;

  isLoading: boolean;
  error: string | null;

  isLoadingInspectors: boolean;
  inspectorsError: string | null;

  getCurrentUser: () => User | null;
  isAdmin: () => boolean;
  isMaster: () => boolean;
  setSelectedUnit: (unitId: string | null) => void;
  getEffectiveUnitId: () => string | null;

  initializeApp: () => Promise<void>;
  selectUnitAndReload: (unitId: string | null) => Promise<void>;

  setCurrentForm: (form: InspectionForm | null) => void;
  addForm: (form: InspectionForm) => Promise<void>;
  updateForm: (form: InspectionForm) => Promise<void>;
  deleteForm: (formId: string) => Promise<void>;
  loadForms: () => Promise<void>;
  loadMoreForms: () => Promise<void>;
  resetFormsDateRange: () => void;

  updateDeviceInForm: (formId: string, device: any) => Promise<void>;
  uninspectDeviceInForm: (formId: string, deviceId: string) => Promise<void>;

  loadDevices: (areaId: string) => Promise<void>;
  loadAllDevices: () => Promise<void>;
  loadDevicesByArea: (areaId: string) => Promise<void>;
  updateDevice: (device: Device) => Promise<void>;
  addDevice: (device: Device) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  checkDeviceNumberExists: (
    deviceNumber: string,
    unitId: string,
    excludeDeviceId?: string
  ) => Promise<boolean>;

  loadInspectors: () => Promise<void>;
  addInspector: (
    inspector: Omit<Inspector, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateInspector: (inspector: Inspector) => Promise<void>;
  deleteInspector: (inspectorId: string) => Promise<void>;

  loadUnits: () => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUnit: (unit: Unit) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<void>;

  loadAreas: () => Promise<void>;
  addArea: (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateArea: (area: Area) => Promise<void>;
  deleteArea: (areaId: string) => Promise<void>;

  /** Auth */
  loadCurrentUser: () => Promise<void>;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    unitId: string
  ) => Promise<void>;

  /** Master users management (client actions) */

  loadManagedUsers: (args?: {
    unitId?: string | null;
    includeInactive?: boolean;
    search?: string;
    limit?: number;
  }) => Promise<void>;

  /** הוספת משתמש: רק לפי username + בחירת unitId/role בצד לקוח */
  addManagedUser: (args: {
    username: string;
    unitId: string;
    role: string;
    active?: boolean;
    admin?: boolean;
    actor?: string;
  }) => Promise<void>;

  updateManagedUser: (
    id: string,
    patch: Partial<{
      username: string;
      name: string;
      email: string;
      unit: string | null;
      unitId: string | null;
      role: string;
      active: number | boolean;
      admin: number | boolean;
      department: string | null;
      phone: string | null;
      mobile: string | null;
      team: string | null;
      status: string | null;
      description: string | null;
    }> & { actor?: string }
  ) => Promise<void>;

  deleteManagedUser: (id: string) => Promise<void>;
}

/** ---------------- localStorage helpers ---------------- */

const LS_KEY = 'isAuth';
const LS_VALIDITY_KEY = 'validity';
const LS_SELECTED_UNIT_KEY = 'selectedUnitId';

function safeParse<T = any>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLocalUser(): User | null {
  const wrapper = safeParse<any>(localStorage.getItem(LS_KEY));
  const validity = Number(localStorage.getItem(LS_VALIDITY_KEY) || 0);
  const now = Math.floor(Date.now() / 1000);
  if (!wrapper?.user__ || !validity || now > validity) return null;

  const u = wrapper.user__;
  return {
    id: String(u.id ?? ''),
    email: String(u.email ?? ''),
    name: String(u.name ?? ''),
    unitId: String(u.unitId ?? ''),
    role: (u.role as UserRole) || 'user',
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
  };
}

function writeLocalUser(user: User, validitySeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  localStorage.setItem(LS_KEY, JSON.stringify({ user__: user }));
  localStorage.setItem(LS_VALIDITY_KEY, String(now + validitySeconds));
}

function clearLocalUser() {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_VALIDITY_KEY);
}

function readSelectedUnitId(): string | null {
  const v = localStorage.getItem(LS_SELECTED_UNIT_KEY);
  return v && v !== 'null' ? v : null;
}

function writeSelectedUnitId(unitId: string | null) {
  if (unitId === null) localStorage.removeItem(LS_SELECTED_UNIT_KEY);
  else localStorage.setItem(LS_SELECTED_UNIT_KEY, unitId);
}

/** ---------------- utils ---------------- */

function parseMaybeStringJson<T = any>(data: unknown): T | null {
  try {
    if (typeof data === 'string') return JSON.parse(data) as T;
    if (data && typeof data === 'object') return data as T;
    return null;
  } catch {
    return null;
  }
}

function normalizeIsValid(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  if (typeof val === 'number') return val !== 0;
  return false;
}

function trimRole(val: any): string {
  return typeof val === 'string' ? val.trim() : val ?? '';
}

function userFromAdPayload(
  payload: any,
  fallbackId: string,
  fallbackEmail: string,
  nameOverride?: string,
  unitIdOverride?: string
): User {
  const fullName =
    nameOverride ||
    payload?.name ||
    `${payload?.first_english_name ?? ''} ${
      payload?.last_english_name ?? ''
    }`.trim();

  return {
    id:
      payload?.employeenumber ||
      payload?.contact_num ||
      payload?.email ||
      fallbackId,
    email: payload?.mail || payload?.email || fallbackEmail,
    name: fullName || fallbackEmail,
    unitId: unitIdOverride || payload?.unitId || '',
    role: (payload?.role as UserRole) || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function mapManagedUser(row: any): ManagedUser {
  return {
    id: String(row.id ?? ''),
    username: String(row.username ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    unit: row.unit ?? null,
    unitId:
      row.UnitId != null
        ? String(row.UnitId)
        : row.unitId != null
        ? String(row.unitId)
        : null,
    role: trimRole(row.Role ?? row.role),
    active: Number(row.active ?? 0),
    admin: Number(row.admin ?? 0),
    department: row.department ?? null,
    phone: row.phone ?? null,
    mobile: row.mobile ?? null,
    team: row.team ?? null,
    status: row.status ?? null,
    createDt:
      row.create_dt != null
        ? Number(row.create_dt)
        : row.createDt != null
        ? Number(row.createDt)
        : null,
    lastModDt:
      row.last_mod_dt != null
        ? Number(row.last_mod_dt)
        : row.lastModDt != null
        ? Number(row.lastModDt)
        : null,
  };
}

/** ---------------- Store ---------------- */

export const useInspectionStore = create<InspectionState>((set, get) => ({
  currentForm: null,
  forms: [],
  devices: [],
  inspectors: [],
  units: [],
  areas: [],
  currentUser: null,

  managedUsers: [],
  isLoadingUsers: false,
  usersError: null,

  selectedUnitId: readSelectedUnitId(),
  formsDateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  },
  hasMoreForms: true,
  isLoadingMoreForms: false,

  isLoading: false,
  error: null,

  isLoadingInspectors: false,
  inspectorsError: null,

  getCurrentUser: () => {
    const s = get().currentUser;
    if (s) return s;
    const fromLS = readLocalUser();
    if (fromLS) set({ currentUser: fromLS });
    return fromLS;
  },

  isAdmin: () => {
    const u = get().getCurrentUser();
    const r = u?.role?.trimEnd();
    return r === 'admin' || r === 'master';
  },

  isMaster: () => {
    const u = get().getCurrentUser();
    return u?.role?.trimEnd() === 'master';
  },

  setSelectedUnit: (unitId) => {
    writeSelectedUnitId(unitId);
    set({ selectedUnitId: unitId });
  },

  getEffectiveUnitId: () => {
    const u = get().getCurrentUser();
    const selected = get().selectedUnitId;
    if (!u) return null;
    if (u.role.trimEnd() === 'master') return selected ?? null;
    return u.unitId || null;
  },

  selectUnitAndReload: async (unitId) => {
    writeSelectedUnitId(unitId);
    set({ selectedUnitId: unitId, isLoading: true, error: null });
    try {
      const tasks: Promise<any>[] = [
        get().loadUnits(),
        get().loadAreas(),
        get().loadInspectors(),
        get().loadAllDevices(),
      ];
      const u = get().getCurrentUser();
      if (u && (u.role.trimEnd() === 'admin' || u.role.trimEnd() === 'master')) {
        tasks.push(get().loadForms());
        if (u.role.trimEnd() === 'master') {
          tasks.push(
            get().loadManagedUsers({
              unitId: unitId ?? undefined,
            })
          );
        }
      }
      await Promise.all(tasks);
    } catch (e: any) {
      set({
        error: e?.message ?? 'Failed to reload after unit change',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  initializeApp: async () => {
    set({ isLoading: true, error: null });
    try {
      const u = get().getCurrentUser();
      if (u) {
        const promises: Promise<any>[] = [
          get().loadUnits(),
          get().loadAreas(),
          get().loadInspectors(),
          get().loadAllDevices(),
          get().loadForms(),
        ];
        if (u.role.trimEnd() === 'master') {
          promises.push(
            get().loadManagedUsers({
              unitId: get().getEffectiveUnitId() ?? undefined,
            })
          );
        }
        await Promise.allSettled(promises);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentForm: (form) => set({ currentForm: form }),

  addForm: async (form) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.forms, form);
      if ((form as any).devices?.length) {
        await api.post(API.formsDevices((form as any).id), (form as any).devices);
      }
      await get().loadForms();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to add form' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateForm: async (form) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`${API.forms}/${(form as any).id}`, form);
      await get().loadForms();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update form' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteForm: async (formId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API.forms}/${formId}`);
      await get().loadForms();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete form' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadForms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { formsDateRange, getEffectiveUnitId } = get();
      const params: any = {
        startDate: formsDateRange.startDate.toISOString(),
        endDate: formsDateRange.endDate.toISOString(),
      };
      const unitId = getEffectiveUnitId();
      if (unitId) params.unitId = unitId;

      const { data } = await api.get(API.forms, { params });
      const list: InspectionForm[] = Array.isArray(data) ? data : [];

      set({
        forms: list,
        hasMoreForms: list.length === 50,
      });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load forms' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMoreForms: async () => {
    const {
      isLoadingMoreForms,
      hasMoreForms,
      forms,
      formsDateRange,
      getEffectiveUnitId,
    } = get();
    if (isLoadingMoreForms || !hasMoreForms) return;

    set({ isLoadingMoreForms: true, error: null });
    try {
      const currentStart = formsDateRange.startDate;
      const newEnd = new Date(currentStart);
      newEnd.setDate(newEnd.getDate() - 1);
      const newStart = new Date(newEnd.getFullYear(), newEnd.getMonth(), 1);

      const params: any = {
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
        limit: 50,
      };
      const unitId = getEffectiveUnitId();
      if (unitId) params.unitId = unitId;

      const { data } = await api.get(API.forms, { params });
      const newForms: InspectionForm[] = Array.isArray(data) ? data : [];
      set({
        forms: [...forms, ...newForms],
        formsDateRange: {
          startDate: newStart,
          endDate: formsDateRange.endDate,
        },
        hasMoreForms: newForms.length === 50,
      });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load more forms' });
    } finally {
      set({ isLoadingMoreForms: false });
    }
  },

  resetFormsDateRange: () => {
    set({
      formsDateRange: {
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ),
        endDate: new Date(),
      },
      hasMoreForms: true,
      forms: [],
    });
  },

  updateDeviceInForm: async (formId, device) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(API.updateDeviceInForm(formId), {
        deviceId: device.id,
        inspectionType: device.inspectionType,
        notes: device.notes || '',
        inspectedAt: device.inspectedAt || new Date(),
      });
      await get().loadForms();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update device in form' });
    } finally {
      set({ isLoading: false });
    }
  },

  uninspectDeviceInForm: async (formId, deviceId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API.deleteInspectedDevice(formId, deviceId));
      const cf = get().currentForm;
      if (cf) {
        const updated = {
          ...cf,
          devices: cf.devices.filter(
            (d: any) => (d.id ?? d.deviceId) !== deviceId
          ),
        };
        set({ currentForm: updated });
      }
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to uninspect device' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadDevices: async (areaId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(API.devices, { params: { areaId } });
      set({ devices: Array.isArray(data) ? data : [] });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load devices' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadDevicesByArea: async (areaId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(API.devices, { params: { areaId } });
      set({ devices: Array.isArray(data) ? data : [] });
    } catch (e: any) {
      set({
        error: e?.message ?? 'Failed to load devices by area',
        devices: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAllDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(API.devices);
      set({ devices: Array.isArray(data) ? data : [] });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load devices' });
    } finally {
      set({ isLoading: false });
    }
  },

  addDevice: async (device) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.devices, device);
      await get().loadAllDevices();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to add device' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateDevice: async (device) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(API.deviceById((device as any).id), device);
      await get().loadAllDevices();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update device' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDevice: async (deviceId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API.deviceById(deviceId));
      set((state) => ({
        devices: state.devices.filter((d: any) => d.id !== deviceId),
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete device' });
    } finally {
      set({ isLoading: false });
    }
  },

  checkDeviceNumberExists: async (
    deviceNumber: string,
    unitId: string,
    excludeDeviceId?: string
  ) => {
    try {
      const params: any = { deviceNumber, unitId };
      if (excludeDeviceId) params.excludeDeviceId = excludeDeviceId;
      const { data } = await api.get(API.deviceCheckNumber, { params });
      return !!data?.exists;
    } catch (e) {
      console.error('Error in checkDeviceNumberExists:', e);
      return false;
    }
  },

  loadInspectors: async () => {
    set({ isLoadingInspectors: true, inspectorsError: null });

    try {
      const unitId = get().getEffectiveUnitId();

      const params: any = {};
      if (unitId) params.unitId = unitId;

      const { data } = await api.get(API.inspectors, { params });

      const list: Inspector[] = (Array.isArray(data) ? data : []).map(
        (ins: any) => ({
          id: String(ins.id),
          name: String(ins.name),
          role: (ins.role as InspectorRole) ?? 'inspector',
          unitId: ins.unitId ? String(ins.unitId) : undefined,
          createdAt: ins.createdAt ? new Date(ins.createdAt) : new Date(),
          updatedAt: ins.updatedAt ? new Date(ins.updatedAt) : new Date(),
        })
      );

      set({ inspectors: list });
    } catch (e: any) {
      set({
        inspectorsError: e?.message ?? 'Failed to load inspectors',
      });
    } finally {
      set({ isLoadingInspectors: false });
    }
  },

  addInspector: async (inspector) => {
    set({ isLoadingInspectors: true, inspectorsError: null });

    try {
      await api.post(API.inspectors, inspector);
      await get().loadInspectors();
    } catch (e: any) {
      set({
        inspectorsError: e?.message ?? 'Failed to add inspector',
      });
    } finally {
      set({ isLoadingInspectors: false });
    }
  },

  updateInspector: async (inspector) => {
    set({ isLoadingInspectors: true, inspectorsError: null });

    try {
      await api.put(API.inspectorById((inspector as any).id), inspector);
      await get().loadInspectors();
    } catch (e: any) {
      set({
        inspectorsError: e?.message ?? 'Failed to update inspector',
      });
    } finally {
      set({ isLoadingInspectors: false });
    }
  },

  deleteInspector: async (inspectorId) => {
    set({ isLoadingInspectors: true, inspectorsError: null });
    try {
      await api.delete(API.inspectorById(inspectorId));
      set((state) => ({
        inspectors: state.inspectors.filter(
          (i: any) => i.id !== inspectorId
        ),
      }));
    } catch (e: any) {
      set({
        inspectorsError: e?.message ?? 'Failed to delete inspector',
      });
    } finally {
      set({ isLoadingInspectors: false });
    }
  },

  loadUnits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(API.units);
      const list: Unit[] = (Array.isArray(data) ? data : []).map((u: any) => ({
        id: String(u.id),
        name: String(u.name),
        code: String(u.code),
        description: String(u.description ?? ''),
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
      }));
      set({ units: list });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load units', units: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addUnit: async (unit) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.units, unit);
      await get().loadUnits();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to add unit' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUnit: async (unit) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(API.unitById((unit as any).id), unit);
      await get().loadUnits();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update unit' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUnit: async (unitId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API.unitById(unitId));
      set((state) => ({
        units: state.units.filter((u: any) => u.id !== unitId),
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete unit' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAreas: async () => {
    set({ isLoading: true, error: null });
    try {
      const effectiveUnitId = get().getEffectiveUnitId();
      const params: any = {};
      if (effectiveUnitId) params.unitId = effectiveUnitId;
      const { data } = await api.get(API.areas, { params });
      const list: Area[] = (Array.isArray(data) ? data : []).map((a: any) => ({
        id: String(a.id),
        unitId: String(a.unitId),
        name: String(a.name),
        code: String(a.code),
        description: String(a.description ?? ''),
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
      }));
      set({ areas: list });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load areas' });
    } finally {
      set({ isLoading: false });
    }
  },

  addArea: async (area) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API.areas, area as any);
      await get().loadAreas();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to add area' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateArea: async (area) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(API.areaById((area as any).id), area as any);
      await get().loadAreas();
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to update area' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteArea: async (areaId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API.areaById(areaId));
      set((state) => ({
        areas: state.areas.filter((a: any) => a.id !== areaId),
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to delete area' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Auth */

  loadCurrentUser: async () => {
    const u = readLocalUser();
    set({ currentUser: u });
  },

  signIn: async (usernameOrEmail, password) => {
    const resp = await api.post(API.auth.adLogin, {
      Username: usernameOrEmail,
      Password: password,
    });
    const payload = parseMaybeStringJson<any>(resp.data);
    if (!payload || !normalizeIsValid(payload.isValid)) {
      throw new Error('Invalid username or password');
    }
    const user = userFromAdPayload(payload, usernameOrEmail, usernameOrEmail);
    writeLocalUser(user, 60 * 60 * 24);
    set({ currentUser: user });
  },

  signUp: async (email, _password, name, unitId) => {
    const resp = await api.post(API.auth.adLogin, {
      Username: email,
      Password: 'check',
    });
    const payload = parseMaybeStringJson<any>(resp.data);
    if (!payload || !normalizeIsValid(payload.isValid)) {
      throw new Error('User not found in AD');
    }
    const user = userFromAdPayload(payload, email, email, name, unitId);
    writeLocalUser(user, 60 * 60 * 24);
    set({ currentUser: user });
  },

  signOut: async () => {
    clearLocalUser();
    set({ currentUser: null });
  },

  /** Master Users Management */

  loadManagedUsers: async (args) => {
    const u = get().getCurrentUser();
    if (!u || u.role.trimEnd() !== 'master') {
      set({ usersError: 'Forbidden', managedUsers: [] });
      return;
    }
    const { unitId, includeInactive = false, search, limit } = args || {};
    set({ isLoadingUsers: true, usersError: null });
    try {
      const params: any = {};
      if (unitId !== undefined && unitId !== null) params.unitId = unitId;
      if (includeInactive) params.includeInactive = true;
      if (search) params.search = search;
      if (limit) params.limit = limit;

      const { data } = await api.get(API.masterUsers, { params });
      const list: ManagedUser[] = (Array.isArray(data) ? data : []).map(
        mapManagedUser
      );
      set({ managedUsers: list });
    } catch (e: any) {
      set({ usersError: e?.message ?? 'Failed to load users' });
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  addManagedUser: async (args) => {
    const current = get().getCurrentUser();
    if (!current || current.role.trimEnd() !== 'master') {
      set({ usersError: 'Forbidden' });
      return;
    }

    const { username, unitId, role } = args;
    const active = args.active ?? true;
    const admin = args.admin ?? false;

    if (!username) {
      set({ usersError: 'Username is required' });
      return;
    }
    if (!unitId) {
      set({ usersError: 'UnitId is required' });
      return;
    }
    if (!role) {
      set({ usersError: 'Role is required' });
      return;
    }

    set({ isLoadingUsers: true, usersError: null });

    try {
      // 1. להביא נתוני משתמש מארגון (AD) בלי סיסמה – באמצעות "check"
      const authResp = await api.post(API.auth.adLogin, {
        Username: username,
        Password: 'check',
      });

      const payload = parseMaybeStringJson<any>(authResp.data);
      if (!payload || !normalizeIsValid(payload.isValid)) {
        throw new Error('User not found in organization directory');
      }

      const fullName =
        payload.name ||
        `${payload.first_english_name ?? ''} ${
          payload.last_english_name ?? ''
        }`.trim() ||
        username;

      const email = payload.mail || payload.email;
      if (!email) {
        throw new Error('Email missing for this user in directory');
      }

      const department = payload.department ?? null;
      const phone = payload.phone ?? null;
      const mobile = payload.mobile ?? null;

      const units = get().units;
      const unitName =
        units.find((u) => u.id === unitId)?.name || null;

      const id =
        payload.employeenumber ||
        payload.contact_num ||
        payload.email ||
        crypto.randomUUID();

      // 2. לבנות DTO ל-MasterUsersLegacyController.AddUser
      const apiPayload = {
        Id: id,
        Username: username,
        Name: fullName,
        Email: email,
        Unit: unitName,
        UnitId: unitId,
        Role: role,
        Active: active ? 1 : 0,
        Admin: admin ? 1 : 0,
        Department: department,
        Phone: phone,
        Mobile: mobile,
        Team: null,
        Description: null,
        Actor:
          args.actor ||
          current.name ||
          current.email ||
          'client',
      };

      await api.post(API.masterUsers, apiPayload);
      await get().loadManagedUsers({});
    } catch (e: any) {
      console.error('addManagedUser error', e);
      set({
        usersError:
          e?.message ??
          'Failed to add user (check username / directory details)',
      });
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  updateManagedUser: async (id, patch) => {
    const current = get().getCurrentUser();
    if (!current || current.role.trimEnd() !== 'master') {
      set({ usersError: 'Forbidden' });
      return;
    }
    set({ isLoadingUsers: true, usersError: null });

    try {
      const payload: any = {
        Username: patch.username ?? null,
        Name: patch.name ?? null,
        Email: patch.email ?? null,
        Unit: patch.unit ?? null,
        UnitId: patch.unitId ?? null,
        Role: patch.role ?? null,
        Active:
          typeof patch.active === 'boolean'
            ? patch.active
              ? 1
              : 0
            : patch.active ?? null,
        Admin:
          typeof patch.admin === 'boolean'
            ? patch.admin
              ? 1
              : 0
            : patch.admin ?? null,
        Department: patch.department ?? null,
        Phone: patch.phone ?? null,
        Mobile: patch.mobile ?? null,
        Team: patch.team ?? null,
        Description: patch.description ?? null,
        Actor:
          patch.actor ||
          current.name ||
          current.email ||
          'client',
      };

      await api.put(API.masterUserById(id), payload);

      // עדכון לוקאלי
      set((state) => ({
        managedUsers: state.managedUsers.map((mu) =>
          mu.id === id
            ? {
                ...mu,
                username:
                  patch.username !== undefined
                    ? String(patch.username)
                    : mu.username,
                name:
                  patch.name !== undefined
                    ? String(patch.name)
                    : mu.name,
                email:
                  patch.email !== undefined
                    ? String(patch.email)
                    : mu.email,
                unit:
                  patch.unit !== undefined
                    ? patch.unit
                    : mu.unit,
                unitId:
                  patch.unitId !== undefined
                    ? patch.unitId
                    : mu.unitId,
                role:
                  patch.role !== undefined
                    ? String(patch.role)
                    : mu.role,
                active:
                  patch.active !== undefined
                    ? typeof patch.active === 'boolean'
                      ? patch.active
                        ? 1
                        : 0
                      : Number(patch.active)
                    : mu.active,
                admin:
                  patch.admin !== undefined
                    ? typeof patch.admin === 'boolean'
                      ? patch.admin
                        ? 1
                        : 0
                      : Number(patch.admin)
                    : mu.admin,
                department:
                  patch.department !== undefined
                    ? patch.department
                    : mu.department,
                phone:
                  patch.phone !== undefined
                    ? patch.phone
                    : mu.phone,
                mobile:
                  patch.mobile !== undefined
                    ? patch.mobile
                    : mu.mobile,
                team:
                  patch.team !== undefined
                    ? patch.team
                    : mu.team,
                status:
                  patch.status !== undefined
                    ? patch.status
                    : mu.status,
              }
            : mu
        ),
      }));
    } catch (e: any) {
      console.error('updateManagedUser error', e);
      set({ usersError: e?.message ?? 'Failed to update user' });
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  deleteManagedUser: async (id) => {
    const current = get().getCurrentUser();
    if (!current || current.role.trimEnd() !== 'master') {
      set({ usersError: 'Forbidden' });
      return;
    }
    set({ isLoadingUsers: true, usersError: null });
    try {
      await api.delete(API.masterUserById(id));
      set((state) => ({
        managedUsers: state.managedUsers.filter(
          (mu) => mu.id !== id
        ),
      }));
    } catch (e: any) {
      console.error('deleteManagedUser error', e);
      set({ usersError: e?.message ?? 'Failed to delete user' });
    } finally {
      set({ isLoadingUsers: false });
    }
  },
}));
