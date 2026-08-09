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
  updateDeviceInForm: (formId: string) =>
    `Form/forms/${formId}/update-device-in-form`,
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

  auth: { adLogin: '/Auth' },

  masterUsers: 'master/users',
  masterUserById: (id: string) => `master/users/${id}`,
};

/** ---------------- ManagedUser ---------------- */

export type ManagedUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  unit?: string | null;
  unitId: string | null;
  role: string;
  active: number;
  admin: number;
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

  managedUsers: ManagedUser[];
  isLoadingUsers: boolean;
  usersError: string | null;

  selectedUnitId: string | null;

  formsDateRange: {
    startDate: Date;
    endDate: Date;
  };
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
  selectUnitAndReload: (unitId: string | null) => Promise<void>;
  initializeApp: () => Promise<void>;

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
  loadDevicesByArea: (areaId: string) => Promise<void>;
  loadAllDevices: () => Promise<void>;
  addDevice: (device: Device) => Promise<void>;
  updateDevice: (device: Device) => Promise<void>;
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
  addUnit: (
    unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateUnit: (unit: Unit) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<void>;

  loadAreas: () => Promise<void>;
  addArea: (
    area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateArea: (area: Area) => Promise<void>;
  deleteArea: (areaId: string) => Promise<void>;

  loadCurrentUser: () => Promise<void>;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    unitId: string
  ) => Promise<void>;

  loadManagedUsers: (args?: {
    unitId?: string | null;
    includeInactive?: boolean;
    search?: string;
    limit?: number;
  }) => Promise<void>;

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

/** ---------------- localStorage ---------------- */

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

function normalizeRole(value: any): UserRole {
  const role = String(value ?? 'user').trim().toLowerCase();

  if (role === 'master') return 'master' as UserRole;
  if (role === 'admin') return 'admin' as UserRole;

  return 'user' as UserRole;
}

function readLocalUser(): User | null {
  const wrapper = safeParse<any>(localStorage.getItem(LS_KEY));
  const validity = Number(localStorage.getItem(LS_VALIDITY_KEY) || 0);
  const now = Math.floor(Date.now() / 1000);

  if (!wrapper?.user__ || !validity || now > validity) {
    return null;
  }

  const u = wrapper.user__;

  return {
    id: String(u.id ?? u.Id ?? ''),
    email: String(u.email ?? u.Email ?? ''),
    name: String(u.name ?? u.Name ?? ''),
    unitId: String(u.unitId ?? u.UnitId ?? ''),
    role: normalizeRole(u.role ?? u.Role),
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
  };
}

function writeLocalUser(user: User, validitySeconds: number) {
  const now = Math.floor(Date.now() / 1000);

  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      user__: user,
    })
  );

  localStorage.setItem(
    LS_VALIDITY_KEY,
    String(now + validitySeconds)
  );
}

function clearLocalUser() {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_VALIDITY_KEY);
}

function readSelectedUnitId(): string | null {
  const value = localStorage.getItem(LS_SELECTED_UNIT_KEY);

  return value && value !== 'null'
    ? value
    : null;
}

function writeSelectedUnitId(unitId: string | null) {
  if (!unitId) {
    localStorage.removeItem(LS_SELECTED_UNIT_KEY);
    return;
  }

  localStorage.setItem(
    LS_SELECTED_UNIT_KEY,
    String(unitId)
  );
}

/** ---------------- helpers ---------------- */

function parseMaybeStringJson<T = any>(data: unknown): T | null {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as T;
    }

    if (data && typeof data === 'object') {
      return data as T;
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeIsValid(value: any): boolean {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    return (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes'
    );
  }

  return false;
}

function trimRole(value: any): string {
  return typeof value === 'string'
    ? value.trim()
    : value ?? '';
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
    payload?.Name ||
    `${payload?.first_english_name ?? ''} ${
      payload?.last_english_name ?? ''
    }`.trim();

  return {
    id: String(
      payload?.employeenumber ||
        payload?.contact_num ||
        payload?.id ||
        payload?.Id ||
        payload?.email ||
        fallbackId
    ),
    email:
      payload?.mail ||
      payload?.email ||
      payload?.Email ||
      fallbackEmail,
    name: fullName || fallbackEmail,
    unitId: String(
      unitIdOverride ||
        payload?.unitId ||
        payload?.UnitId ||
        ''
    ),
    role: normalizeRole(payload?.role ?? payload?.Role),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function mapManagedUser(row: any): ManagedUser {
  return {
    id: String(row.id ?? row.Id ?? ''),
    username: String(row.username ?? row.Username ?? ''),
    name: String(row.name ?? row.Name ?? ''),
    email: String(row.email ?? row.Email ?? ''),
    unit: row.unit ?? row.Unit ?? null,
    unitId:
      row.UnitId != null
        ? String(row.UnitId)
        : row.unitId != null
        ? String(row.unitId)
        : null,
    role: trimRole(row.Role ?? row.role),
    active: Number(row.active ?? row.Active ?? 0),
    admin: Number(row.admin ?? row.Admin ?? 0),
    department: row.department ?? row.Department ?? null,
    phone: row.phone ?? row.Phone ?? null,
    mobile: row.mobile ?? row.Mobile ?? null,
    team: row.team ?? row.Team ?? null,
    status: row.status ?? row.Status ?? null,
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

function getItemUnitId(item: any): string | null {
  const value =
    item?.unitId ??
    item?.UnitId ??
    item?.unitID ??
    item?.UnitID ??
    item?.unit?.id ??
    item?.Unit?.Id ??
    item?.area?.unitId ??
    item?.Area?.UnitId;

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return String(value);
}

function getItemAreaId(item: any): string | null {
  const value =
    item?.areaId ??
    item?.AreaId ??
    item?.area?.id ??
    item?.Area?.Id;

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  return String(value);
}

/**
 * Client-side defense in depth.
 *
 * אם אפשר לזהות unitId ישירות - בודקים אותו.
 * אחרת בודקים את ה-areaId מול רשימת האזורים שכבר נטענה ליחידה.
 *
 * אם אי אפשר להוכיח שהרשומה שייכת ליחידה - לא מציגים אותה.
 */
function belongsToUnit(
  item: any,
  unitId: string,
  areas: Area[]
): boolean {
  const directUnitId = getItemUnitId(item);

  if (directUnitId) {
    return directUnitId === String(unitId);
  }

  const areaId = getItemAreaId(item);

  if (areaId) {
    return areas.some(
      (area) =>
        String(area.id) === areaId &&
        String(area.unitId) === String(unitId)
    );
  }

  return false;
}

function emptyScopedData() {
  return {
    currentForm: null,
    forms: [] as InspectionForm[],
    devices: [] as Device[],
    inspectors: [] as Inspector[],
    areas: [] as Area[],
    managedUsers: [] as ManagedUser[],
  };
}

/** ---------------- Store ---------------- */

const initialUser = readLocalUser();

export const useInspectionStore = create<InspectionState>(
  (set, get) => ({
    currentForm: null,

    forms: [],
    devices: [],
    inspectors: [],
    units: [],
    areas: [],

    currentUser: initialUser,

    managedUsers: [],
    isLoadingUsers: false,
    usersError: null,

    selectedUnitId:
      initialUser &&
      normalizeRole(initialUser.role) === 'master'
        ? readSelectedUnitId()
        : null,

    formsDateRange: {
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ),
      endDate: new Date(),
    },

    hasMoreForms: true,
    isLoadingMoreForms: false,

    isLoading: false,
    error: null,

    isLoadingInspectors: false,
    inspectorsError: null,

    /** ---------------- permission helpers ---------------- */

    getCurrentUser: () => {
      const current = get().currentUser;

      if (current) {
        return current;
      }

      const stored = readLocalUser();

      if (stored) {
        set({
          currentUser: stored,
        });
      }

      return stored;
    },

    isAdmin: () => {
      const user = get().getCurrentUser();

      if (!user) return false;

      const role = normalizeRole(user.role);

      return (
        role === 'admin' ||
        role === 'master'
      );
    },

    isMaster: () => {
      const user = get().getCurrentUser();

      return (
        !!user &&
        normalizeRole(user.role) === 'master'
      );
    },

    /**
     * רק MASTER רשאי לשנות selectedUnitId.
     * USER / ADMIN תמיד נעולים ל-currentUser.unitId.
     */
    setSelectedUnit: (unitId) => {
      const user = get().getCurrentUser();

      if (
        !user ||
        normalizeRole(user.role) !== 'master'
      ) {
        return;
      }

      writeSelectedUnitId(unitId);

      set({
        selectedUnitId: unitId,
      });
    },

    /**
     * מקור אמת אחד ליחידה הפעילה.
     *
     * USER  -> user.unitId
     * ADMIN -> user.unitId
     * MASTER -> selectedUnitId
     */
    getEffectiveUnitId: () => {
      const user = get().getCurrentUser();

      if (!user) {
        return null;
      }

      if (
        normalizeRole(user.role) === 'master'
      ) {
        return get().selectedUnitId || null;
      }

      return user.unitId
        ? String(user.unitId)
        : null;
    },

    /**
     * MASTER - החלפת יחידה מלאה.
     *
     * הנתונים הישנים נמחקים לפני תחילת הטעינה,
     * כדי שלא יוצגו לרגע נתונים מהיחידה הקודמת.
     */
    selectUnitAndReload: async (unitId) => {
      const user = get().getCurrentUser();

      if (
        !user ||
        normalizeRole(user.role) !== 'master'
      ) {
        return;
      }

      if (!unitId) {
        writeSelectedUnitId(null);

        set({
          selectedUnitId: null,
          ...emptyScopedData(),
          error: 'יש לבחור יחידה',
        });

        return;
      }

      const unitExists = get().units.some(
        (unit) =>
          String(unit.id) === String(unitId)
      );

      if (!unitExists) {
        set({
          error:
            'היחידה שנבחרה אינה קיימת',
        });

        return;
      }

      writeSelectedUnitId(String(unitId));

      set({
        selectedUnitId: String(unitId),
        ...emptyScopedData(),

        formsDateRange: {
          startDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
          endDate: new Date(),
        },

        hasMoreForms: true,
        isLoading: true,
        error: null,
        inspectorsError: null,
        usersError: null,
      });

      try {
        /**
         * Areas נטענים ראשונים כי מכשירים/טפסים
         * יכולים להיות משויכים ליחידה דרך areaId.
         */
        await get().loadAreas();

        await Promise.all([
          get().loadInspectors(),
          get().loadForms(),
        ]);

        await get().loadAllDevices();

        await get().loadManagedUsers({
          unitId: String(unitId),
        });
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to reload data after unit change',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    /**
     * טעינה ראשונית אחרי Login / Refresh.
     *
     * USER / ADMIN:
     * היחידה נקבעת אך ורק מהמשתמש.
     *
     * MASTER:
     * נשמרת היחידה האחרונה אם היא עדיין קיימת,
     * אחרת נבחרת היחידה הראשונה.
     */
    initializeApp: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const user = get().getCurrentUser();

        if (!user) {
          set({
            units: [],
            ...emptyScopedData(),
          });

          return;
        }

        const role = normalizeRole(user.role);

        await get().loadUnits();

        let effectiveUnitId: string | null = null;

        if (role === 'master') {
          const persisted =
            readSelectedUnitId();

          const persistedIsValid =
            !!persisted &&
            get().units.some(
              (unit) =>
                String(unit.id) ===
                String(persisted)
            );

          effectiveUnitId =
            persistedIsValid
              ? String(persisted)
              : get().units.length > 0
              ? String(get().units[0].id)
              : null;

          writeSelectedUnitId(
            effectiveUnitId
          );

          set({
            selectedUnitId:
              effectiveUnitId,
          });
        } else {
          /**
           * חשוב במחשב משותף:
           * selection של Master קודם לא משפיע על user/admin.
           */
          writeSelectedUnitId(null);

          set({
            selectedUnitId: null,
          });

          effectiveUnitId = user.unitId
            ? String(user.unitId)
            : null;
        }

        /**
         * FAIL CLOSED:
         * אין unitId = אין מידע.
         * לעולם לא מפרשים unitId חסר כ-"הבא הכול".
         */
        if (!effectiveUnitId) {
          set({
            ...emptyScopedData(),
            error:
              'למשתמש לא משויכת יחידה תקינה',
          });

          return;
        }

        set({
          ...emptyScopedData(),
        });

        await get().loadAreas();

        await Promise.all([
          get().loadInspectors(),
          get().loadForms(),
        ]);

        await get().loadAllDevices();

        if (role === 'master') {
          await get().loadManagedUsers({
            unitId: effectiveUnitId,
          });
        }
      } catch (error: any) {
        set({
          ...emptyScopedData(),
          error:
            error?.message ??
            'Failed to initialize application',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    setCurrentForm: (form) => {
      set({
        currentForm: form,
      });
    },

    /** ---------------- Forms ---------------- */

    addForm: async (form) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          throw new Error(
            'No active unit'
          );
        }

        await api.post(API.forms, form);

        if ((form as any).devices?.length) {
          await api.post(
            API.formsDevices((form as any).id),
            (form as any).devices
          );
        }

        await get().loadForms();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to add form',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    updateForm: async (form) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.put(
          `${API.forms}/${(form as any).id}`,
          form
        );

        await get().loadForms();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to update form',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    deleteForm: async (formId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.delete(
          `${API.forms}/${formId}`
        );

        await get().loadForms();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to delete form',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    loadForms: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          set({
            forms: [],
            hasMoreForms: false,
          });

          return;
        }

        const { formsDateRange } = get();

        const params = {
          startDate:
            formsDateRange.startDate.toISOString(),
          endDate:
            formsDateRange.endDate.toISOString(),
          unitId,
        };

        const { data } = await api.get(
          API.forms,
          {
            params,
          }
        );

        const rawForms: InspectionForm[] =
          Array.isArray(data)
            ? data
            : [];

        const scopedForms =
          rawForms.filter((form: any) =>
            belongsToUnit(
              form,
              unitId,
              get().areas
            )
          );

        set({
          forms: scopedForms,
          hasMoreForms:
            rawForms.length === 50,
        });
      } catch (error: any) {
        set({
          forms: [],
          error:
            error?.message ??
            'Failed to load forms',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    loadMoreForms: async () => {
      const {
        isLoadingMoreForms,
        hasMoreForms,
        forms,
        formsDateRange,
      } = get();

      if (
        isLoadingMoreForms ||
        !hasMoreForms
      ) {
        return;
      }

      const unitId =
        get().getEffectiveUnitId();

      if (!unitId) {
        set({
          hasMoreForms: false,
        });

        return;
      }

      set({
        isLoadingMoreForms: true,
        error: null,
      });

      try {
        const currentStart =
          formsDateRange.startDate;

        const newEnd =
          new Date(currentStart);

        newEnd.setDate(
          newEnd.getDate() - 1
        );

        const newStart = new Date(
          newEnd.getFullYear(),
          newEnd.getMonth(),
          1
        );

        const params = {
          startDate:
            newStart.toISOString(),
          endDate:
            newEnd.toISOString(),
          limit: 50,
          unitId,
        };

        const { data } = await api.get(
          API.forms,
          {
            params,
          }
        );

        const rawForms: InspectionForm[] =
          Array.isArray(data)
            ? data
            : [];

        const scopedForms =
          rawForms.filter((form: any) =>
            belongsToUnit(
              form,
              unitId,
              get().areas
            )
          );

        set({
          forms: [
            ...forms,
            ...scopedForms,
          ],

          formsDateRange: {
            startDate: newStart,
            endDate:
              formsDateRange.endDate,
          },

          hasMoreForms:
            rawForms.length === 50,
        });
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to load more forms',
        });
      } finally {
        set({
          isLoadingMoreForms: false,
        });
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

    updateDeviceInForm: async (
      formId,
      device
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.put(
          API.updateDeviceInForm(formId),
          {
            deviceId: device.id,
            inspectionType:
              device.inspectionType,
            notes: device.notes || '',
            inspectedAt:
              device.inspectedAt ||
              new Date(),
          }
        );

        await get().loadForms();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to update device in form',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    uninspectDeviceInForm: async (
      formId,
      deviceId
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.delete(
          API.deleteInspectedDevice(
            formId,
            deviceId
          )
        );

        const currentForm =
          get().currentForm;

        if (currentForm) {
          set({
            currentForm: {
              ...currentForm,
              devices:
                currentForm.devices.filter(
                  (device: any) =>
                    (device.id ??
                      device.deviceId) !==
                    deviceId
                ),
            },
          });
        }
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to uninspect device',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    /** ---------------- Devices ---------------- */

    loadDevices: async (areaId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          set({
            devices: [],
          });

          return;
        }

        const areaAllowed =
          get().areas.some(
            (area) =>
              String(area.id) ===
                String(areaId) &&
              String(area.unitId) ===
                String(unitId)
          );

        if (!areaAllowed) {
          set({
            devices: [],
          });

          return;
        }

        const { data } = await api.get(
          API.devices,
          {
            params: {
              areaId,
              unitId,
            },
          }
        );

        const devices: Device[] =
          (
            Array.isArray(data)
              ? data
              : []
          ).filter((device: any) =>
            belongsToUnit(
              device,
              unitId,
              get().areas
            )
          );

        set({
          devices,
        });
      } catch (error: any) {
        set({
          devices: [],
          error:
            error?.message ??
            'Failed to load devices',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    loadDevicesByArea: async (
      areaId
    ) => {
      await get().loadDevices(areaId);
    },

    loadAllDevices: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          set({
            devices: [],
          });

          return;
        }

        const { data } = await api.get(
          API.devices,
          {
            params: {
              unitId,
            },
          }
        );

        const devices: Device[] =
          (
            Array.isArray(data)
              ? data
              : []
          ).filter((device: any) =>
            belongsToUnit(
              device,
              unitId,
              get().areas
            )
          );

        set({
          devices,
        });
      } catch (error: any) {
        set({
          devices: [],
          error:
            error?.message ??
            'Failed to load devices',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    addDevice: async (device) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.post(
          API.devices,
          device
        );

        await get().loadAllDevices();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to add device',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    updateDevice: async (device) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.put(
          API.deviceById(
            (device as any).id
          ),
          device
        );

        await get().loadAllDevices();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to update device',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    deleteDevice: async (deviceId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.delete(
          API.deviceById(deviceId)
        );

        set((state) => ({
          devices:
            state.devices.filter(
              (device: any) =>
                device.id !== deviceId
            ),
        }));
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to delete device',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    checkDeviceNumberExists: async (
      deviceNumber,
      unitId,
      excludeDeviceId
    ) => {
      try {
        const effectiveUnitId =
          get().getEffectiveUnitId();

        /**
         * USER/ADMIN לא יכולים לבדוק מספר
         * במרחב של יחידה אחרת.
         */
        if (!effectiveUnitId) {
          return false;
        }

        const role = normalizeRole(
          get().getCurrentUser()?.role
        );

        const scopedUnitId =
          role === 'master'
            ? effectiveUnitId
            : effectiveUnitId;

        if (
          String(unitId) !==
          String(scopedUnitId)
        ) {
          return false;
        }

        const params: any = {
          deviceNumber,
          unitId: scopedUnitId,
        };

        if (excludeDeviceId) {
          params.excludeDeviceId =
            excludeDeviceId;
        }

        const { data } = await api.get(
          API.deviceCheckNumber,
          {
            params,
          }
        );

        return !!data?.exists;
      } catch (error) {
        console.error(
          'Error in checkDeviceNumberExists:',
          error
        );

        return false;
      }
    },

    /** ---------------- Inspectors ---------------- */

    loadInspectors: async () => {
      set({
        isLoadingInspectors: true,
        inspectorsError: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          set({
            inspectors: [],
          });

          return;
        }

        const { data } = await api.get(
          API.inspectors,
          {
            params: {
              unitId,
            },
          }
        );

        const inspectors: Inspector[] =
          (
            Array.isArray(data)
              ? data
              : []
          )
            .map((inspector: any) => ({
              id: String(
                inspector.id ??
                  inspector.Id ??
                  ''
              ),
              name: String(
                inspector.name ??
                  inspector.Name ??
                  ''
              ),
              role:
                (inspector.role ??
                  inspector.Role ??
                  'inspector') as InspectorRole,
              unitId:
                inspector.unitId != null
                  ? String(
                      inspector.unitId
                    )
                  : inspector.UnitId != null
                  ? String(
                      inspector.UnitId
                    )
                  : undefined,
              createdAt:
                inspector.createdAt
                  ? new Date(
                      inspector.createdAt
                    )
                  : new Date(),
              updatedAt:
                inspector.updatedAt
                  ? new Date(
                      inspector.updatedAt
                    )
                  : new Date(),
            }))
            .filter((inspector: any) =>
              belongsToUnit(
                inspector,
                unitId,
                get().areas
              )
            );

        set({
          inspectors,
        });
      } catch (error: any) {
        set({
          inspectors: [],
          inspectorsError:
            error?.message ??
            'Failed to load inspectors',
        });
      } finally {
        set({
          isLoadingInspectors: false,
        });
      }
    },

    addInspector: async (
      inspector
    ) => {
      set({
        isLoadingInspectors: true,
        inspectorsError: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          throw new Error(
            'No active unit'
          );
        }

        /**
         * לא סומכים על unitId שמגיע מהטופס.
         */
        await api.post(
          API.inspectors,
          {
            ...inspector,
            unitId,
          }
        );

        await get().loadInspectors();
      } catch (error: any) {
        set({
          inspectorsError:
            error?.message ??
            'Failed to add inspector',
        });
      } finally {
        set({
          isLoadingInspectors: false,
        });
      }
    },

    updateInspector: async (
      inspector
    ) => {
      set({
        isLoadingInspectors: true,
        inspectorsError: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          throw new Error(
            'No active unit'
          );
        }

        await api.put(
          API.inspectorById(
            (inspector as any).id
          ),
          {
            ...inspector,
            unitId,
          }
        );

        await get().loadInspectors();
      } catch (error: any) {
        set({
          inspectorsError:
            error?.message ??
            'Failed to update inspector',
        });
      } finally {
        set({
          isLoadingInspectors: false,
        });
      }
    },

    deleteInspector: async (
      inspectorId
    ) => {
      set({
        isLoadingInspectors: true,
        inspectorsError: null,
      });

      try {
        if (!get().getEffectiveUnitId()) {
          throw new Error(
            'No active unit'
          );
        }

        await api.delete(
          API.inspectorById(inspectorId)
        );

        set((state) => ({
          inspectors:
            state.inspectors.filter(
              (inspector: any) =>
                inspector.id !==
                inspectorId
            ),
        }));
      } catch (error: any) {
        set({
          inspectorsError:
            error?.message ??
            'Failed to delete inspector',
        });
      } finally {
        set({
          isLoadingInspectors: false,
        });
      }
    },

    /** ---------------- Units ---------------- */

    loadUnits: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const user =
          get().getCurrentUser();

        if (!user) {
          set({
            units: [],
          });

          return;
        }

        const role =
          normalizeRole(user.role);

        const { data } = await api.get(
          API.units,
          role === 'master'
            ? undefined
            : {
                params: {
                  unitId: user.unitId,
                },
              }
        );

        let units: Unit[] =
          (
            Array.isArray(data)
              ? data
              : []
          ).map((unit: any) => ({
            id: String(
              unit.id ??
                unit.Id ??
                ''
            ),
            name: String(
              unit.name ??
                unit.Name ??
                ''
            ),
            code: String(
              unit.code ??
                unit.Code ??
                ''
            ),
            description: String(
              unit.description ??
                unit.Description ??
                ''
            ),
            createdAt:
              unit.createdAt
                ? new Date(
                    unit.createdAt
                  )
                : new Date(),
            updatedAt:
              unit.updatedAt
                ? new Date(
                    unit.updatedAt
                  )
                : new Date(),
          }));

        /**
         * גם אם השרת החזיר בטעות את כל היחידות,
         * USER / ADMIN שומרים ב-store רק את שלהם.
         */
        if (role !== 'master') {
          const ownUnitId = user.unitId
            ? String(user.unitId)
            : null;

          units = ownUnitId
            ? units.filter(
                (unit) =>
                  String(unit.id) ===
                  ownUnitId
              )
            : [];
        }

        set({
          units,
        });
      } catch (error: any) {
        set({
          units: [],
          error:
            error?.message ??
            'Failed to load units',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    addUnit: async (unit) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        await api.post(
          API.units,
          unit
        );

        await get().loadUnits();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to add unit',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    updateUnit: async (unit) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        await api.put(
          API.unitById(
            (unit as any).id
          ),
          unit
        );

        await get().loadUnits();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to update unit',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    deleteUnit: async (unitId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        await api.delete(
          API.unitById(unitId)
        );

        set((state) => ({
          units:
            state.units.filter(
              (unit: any) =>
                unit.id !== unitId
            ),
        }));
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to delete unit',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    /** ---------------- Areas ---------------- */

    loadAreas: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          set({
            areas: [],
          });

          return;
        }

        const { data } = await api.get(
          API.areas,
          {
            params: {
              unitId,
            },
          }
        );

        const areas: Area[] =
          (
            Array.isArray(data)
              ? data
              : []
          )
            .map((area: any) => ({
              id: String(
                area.id ??
                  area.Id ??
                  ''
              ),
              unitId: String(
                area.unitId ??
                  area.UnitId ??
                  ''
              ),
              name: String(
                area.name ??
                  area.Name ??
                  ''
              ),
              code: String(
                area.code ??
                  area.Code ??
                  ''
              ),
              description: String(
                area.description ??
                  area.Description ??
                  ''
              ),
              createdAt:
                area.createdAt
                  ? new Date(
                      area.createdAt
                    )
                  : new Date(),
              updatedAt:
                area.updatedAt
                  ? new Date(
                      area.updatedAt
                    )
                  : new Date(),
            }))
            .filter(
              (area) =>
                String(area.unitId) ===
                String(unitId)
            );

        set({
          areas,
        });
      } catch (error: any) {
        set({
          areas: [],
          error:
            error?.message ??
            'Failed to load areas',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    addArea: async (area) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        const unitId =
          get().getEffectiveUnitId();

        if (!unitId) {
          throw new Error(
            'No active unit'
          );
        }

        await api.post(
          API.areas,
          {
            ...area,
            unitId,
          } as any
        );

        await get().loadAreas();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to add area',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    updateArea: async (area) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        const unitId =
          get().getEffectiveUnitId();

        if (
          !unitId ||
          String(
            (area as any).unitId
          ) !== String(unitId)
        ) {
          throw new Error(
            'Area is outside active unit'
          );
        }

        await api.put(
          API.areaById(
            (area as any).id
          ),
          area as any
        );

        await get().loadAreas();
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to update area',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    deleteArea: async (areaId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        if (!get().isMaster()) {
          throw new Error('Forbidden');
        }

        const unitId =
          get().getEffectiveUnitId();

        const areaAllowed =
          get().areas.some(
            (area) =>
              String(area.id) ===
                String(areaId) &&
              String(area.unitId) ===
                String(unitId)
          );

        if (!areaAllowed) {
          throw new Error(
            'Area is outside active unit'
          );
        }

        await api.delete(
          API.areaById(areaId)
        );

        set((state) => ({
          areas:
            state.areas.filter(
              (area: any) =>
                area.id !== areaId
            ),
        }));
      } catch (error: any) {
        set({
          error:
            error?.message ??
            'Failed to delete area',
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    /** ---------------- Auth ---------------- */

    loadCurrentUser: async () => {
      const user = readLocalUser();

      if (!user) {
        writeSelectedUnitId(null);

        set({
          currentUser: null,
          selectedUnitId: null,
          units: [],
          ...emptyScopedData(),
        });

        return;
      }

      const isMaster =
        normalizeRole(user.role) ===
        'master';

      if (!isMaster) {
        writeSelectedUnitId(null);
      }

      set({
        currentUser: user,
        selectedUnitId: isMaster
          ? readSelectedUnitId()
          : null,
      });
    },

    signIn: async (
      usernameOrEmail,
      password
    ) => {
      const response = await api.post(
        API.auth.adLogin,
        {
          Username: usernameOrEmail,
          Password: password,
        }
      );

      const payload =
        parseMaybeStringJson<any>(
          response.data
        );

      if (
        !payload ||
        !normalizeIsValid(
          payload.isValid
        )
      ) {
        throw new Error(
          'Invalid username or password'
        );
      }

      const user =
        userFromAdPayload(
          payload,
          usernameOrEmail,
          usernameOrEmail
        );

      writeLocalUser(
        user,
        60 * 60 * 24
      );

      const isMaster =
        normalizeRole(user.role) ===
        'master';

      if (!isMaster) {
        writeSelectedUnitId(null);
      }

      /**
       * מחשב משותף:
       * מידע של המשתמש הקודם נמחק מיד.
       */
      set({
        currentUser: user,
        selectedUnitId: isMaster
          ? readSelectedUnitId()
          : null,
        units: [],
        ...emptyScopedData(),
        error: null,
        inspectorsError: null,
        usersError: null,
      });
    },

    signUp: async (
      email,
      _password,
      name,
      unitId
    ) => {
      const response = await api.post(
        API.auth.adLogin,
        {
          Username: email,
          Password: 'check',
        }
      );

      const payload =
        parseMaybeStringJson<any>(
          response.data
        );

      if (
        !payload ||
        !normalizeIsValid(
          payload.isValid
        )
      ) {
        throw new Error(
          'User not found in AD'
        );
      }

      const user =
        userFromAdPayload(
          payload,
          email,
          email,
          name,
          unitId
        );

      writeLocalUser(
        user,
        60 * 60 * 24
      );

      writeSelectedUnitId(null);

      set({
        currentUser: user,
        selectedUnitId: null,
        units: [],
        ...emptyScopedData(),
      });
    },

    signOut: async () => {
      clearLocalUser();
      writeSelectedUnitId(null);

      set({
        currentUser: null,
        selectedUnitId: null,
        units: [],
        ...emptyScopedData(),

        error: null,
        inspectorsError: null,
        usersError: null,

        hasMoreForms: true,
      });
    },

    /** ---------------- Master Users ---------------- */

    loadManagedUsers: async (
      args
    ) => {
      const currentUser =
        get().getCurrentUser();

      if (
        !currentUser ||
        normalizeRole(
          currentUser.role
        ) !== 'master'
      ) {
        set({
          managedUsers: [],
          usersError: 'Forbidden',
        });

        return;
      }

      const unitId =
        args?.unitId ??
        get().getEffectiveUnitId();

      if (!unitId) {
        set({
          managedUsers: [],
          usersError: null,
        });

        return;
      }

      const {
        includeInactive = false,
        search,
        limit,
      } = args || {};

      set({
        isLoadingUsers: true,
        usersError: null,
      });

      try {
        const params: any = {
          unitId: String(unitId),
        };

        if (includeInactive) {
          params.includeInactive = true;
        }

        if (search) {
          params.search = search;
        }

        if (limit) {
          params.limit = limit;
        }

        const { data } = await api.get(
          API.masterUsers,
          {
            params,
          }
        );

        const users =
          (
            Array.isArray(data)
              ? data
              : []
          )
            .map(mapManagedUser)
            .filter(
              (user) =>
                String(
                  user.unitId ?? ''
                ) ===
                String(unitId)
            );

        set({
          managedUsers: users,
        });
      } catch (error: any) {
        set({
          managedUsers: [],
          usersError:
            error?.message ??
            'Failed to load users',
        });
      } finally {
        set({
          isLoadingUsers: false,
        });
      }
    },

    addManagedUser: async (
      args
    ) => {
      const currentUser =
        get().getCurrentUser();

      if (
        !currentUser ||
        normalizeRole(
          currentUser.role
        ) !== 'master'
      ) {
        set({
          usersError: 'Forbidden',
        });

        return;
      }

      const {
        username,
        unitId,
        role,
      } = args;

      const active =
        args.active ?? true;

      const admin =
        args.admin ?? false;

      if (!username) {
        set({
          usersError:
            'Username is required',
        });

        return;
      }

      if (!unitId) {
        set({
          usersError:
            'UnitId is required',
        });

        return;
      }

      if (!role) {
        set({
          usersError:
            'Role is required',
        });

        return;
      }

      set({
        isLoadingUsers: true,
        usersError: null,
      });

      try {
        const authResponse =
          await api.post(
            API.auth.adLogin,
            {
              Username: username,
              Password: 'check',
            }
          );

        const payload =
          parseMaybeStringJson<any>(
            authResponse.data
          );

        if (
          !payload ||
          !normalizeIsValid(
            payload.isValid
          )
        ) {
          throw new Error(
            'User not found in organization directory'
          );
        }

        const fullName =
          payload.name ||
          payload.Name ||
          `${
            payload.first_english_name ??
            ''
          } ${
            payload.last_english_name ??
            ''
          }`.trim() ||
          username;

        const email =
          payload.mail ||
          payload.email ||
          payload.Email;

        if (!email) {
          throw new Error(
            'Email missing for this user in directory'
          );
        }

        const unitName =
          get().units.find(
            (unit) =>
              String(unit.id) ===
              String(unitId)
          )?.name || null;

        const id =
          payload.employeenumber ||
          payload.contact_num ||
          payload.id ||
          payload.Id ||
          payload.email ||
          crypto.randomUUID();

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
          Department:
            payload.department ??
            null,
          Phone:
            payload.phone ??
            null,
          Mobile:
            payload.mobile ??
            null,
          Team: null,
          Description: null,
          Actor:
            args.actor ||
            currentUser.name ||
            currentUser.email ||
            'client',
        };

        await api.post(
          API.masterUsers,
          apiPayload
        );

        await get().loadManagedUsers({
          unitId:
            get().getEffectiveUnitId(),
        });
      } catch (error: any) {
        console.error(
          'addManagedUser error',
          error
        );

        set({
          usersError:
            error?.message ??
            'Failed to add user',
        });
      } finally {
        set({
          isLoadingUsers: false,
        });
      }
    },

    updateManagedUser: async (
      id,
      patch
    ) => {
      const currentUser =
        get().getCurrentUser();

      if (
        !currentUser ||
        normalizeRole(
          currentUser.role
        ) !== 'master'
      ) {
        set({
          usersError: 'Forbidden',
        });

        return;
      }

      set({
        isLoadingUsers: true,
        usersError: null,
      });

      try {
        const payload: any = {
          Username:
            patch.username ?? null,
          Name: patch.name ?? null,
          Email: patch.email ?? null,
          Unit: patch.unit ?? null,
          UnitId:
            patch.unitId ?? null,
          Role: patch.role ?? null,
          Active:
            typeof patch.active ===
            'boolean'
              ? patch.active
                ? 1
                : 0
              : patch.active ?? null,
          Admin:
            typeof patch.admin ===
            'boolean'
              ? patch.admin
                ? 1
                : 0
              : patch.admin ?? null,
          Department:
            patch.department ?? null,
          Phone: patch.phone ?? null,
          Mobile:
            patch.mobile ?? null,
          Team: patch.team ?? null,
          Description:
            patch.description ?? null,
          Actor:
            patch.actor ||
            currentUser.name ||
            currentUser.email ||
            'client',
        };

        await api.put(
          API.masterUserById(id),
          payload
        );

        /**
         * Reload כדי לוודא שהרשימה עדיין
         * משויכת ליחידה הפעילה בלבד.
         */
        await get().loadManagedUsers({
          unitId:
            get().getEffectiveUnitId(),
        });
      } catch (error: any) {
        console.error(
          'updateManagedUser error',
          error
        );

        set({
          usersError:
            error?.message ??
            'Failed to update user',
        });
      } finally {
        set({
          isLoadingUsers: false,
        });
      }
    },

    deleteManagedUser: async (
      id
    ) => {
      const currentUser =
        get().getCurrentUser();

      if (
        !currentUser ||
        normalizeRole(
          currentUser.role
        ) !== 'master'
      ) {
        set({
          usersError: 'Forbidden',
        });

        return;
      }

      set({
        isLoadingUsers: true,
        usersError: null,
      });

      try {
        await api.delete(
          API.masterUserById(id)
        );

        set((state) => ({
          managedUsers:
            state.managedUsers.filter(
              (user) =>
                user.id !== id
            ),
        }));
      } catch (error: any) {
        console.error(
          'deleteManagedUser error',
          error
        );

        set({
          usersError:
            error?.message ??
            'Failed to delete user',
        });
      } finally {
        set({
          isLoadingUsers: false,
        });
      }
    },
  })
);
