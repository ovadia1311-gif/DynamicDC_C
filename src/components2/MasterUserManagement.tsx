
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';
import {
  Users,
  UserPlus,
  Pencil,
  Save,
  X,
  Trash2,
  Search,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type Role = 'master' | 'admin' | 'inspector' | 'viewer';

const ROLES: Role[] = ['master', 'admin', 'inspector', 'viewer'];

export default function MasterUserManagement() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();

  const {
    getCurrentUser,
    isMaster,
    units,
    managedUsers,
    isLoadingUsers,
    usersError,
    loadUnits,
    loadManagedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
  } = useInspectionStore();

  const currentUser = getCurrentUser();
  const isMasterUser = isMaster();

  // הגנה – רק מאסטר
  useEffect(() => {
    if (!currentUser || !isMasterUser) {
      navigate.push('/management');
    }
  }, [currentUser, isMasterUser, navigate]);

  // טעינת נתונים
  useEffect(() => {
    if (isMasterUser) {
      loadUnits().catch(() => {});
      loadManagedUsers({}).catch(() => {});
    }
  }, [isMasterUser, loadUnits, loadManagedUsers]);

  // סטייט UI
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<any | null>(null);

  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addUnitId, setAddUnitId] = useState('');
  const [addRole, setAddRole] = useState<Role>('inspector');
  const [addActive, setAddActive] = useState(true);
  const [addAdmin, setAddAdmin] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  // סינון
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return managedUsers;

    return managedUsers.filter((u) => {
      const unitName =
        units.find((x) => x.id === u.unitId)?.name || u.unit || '';
      return (
        (u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.username || '').toLowerCase().includes(s) ||
        (u.role || '').toLowerCase().includes(s) ||
        unitName.toLowerCase().includes(s)
      );
    });
  }, [managedUsers, units, search]);

  // עימוד
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [search, itemsPerPage]);

  const unitName = (id?: string | null) =>
    units.find((u) => u.id === id)?.name || '';

  // התחלת עריכה
  const beginEdit = (u: any) => {
    setEditingId(u.id);
    setValidationError(null);
    setEditingDraft({
      id: u.id,
      username: u.username || '',
      name: u.name || '',
      email: u.email || '',
      unitId: u.unitId || '',
      role: (u.role || 'inspector') as Role,
      active: u.active === 1 || u.active === true,
      admin: u.admin === 1 || u.admin === true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
    setValidationError(null);
  };

  const saveEdit = async () => {
    if (!editingDraft || !editingId) return;

    if (!editingDraft.unitId) {
      setValidationError('יש לבחור יחידה');
      return;
    }

    if (!editingDraft.role) {
      setValidationError('יש לבחור תפקיד');
      return;
    }

    try {
      await updateManagedUser(editingId, {
        unitId: editingDraft.unitId,
        role: editingDraft.role,
        active: editingDraft.active,
        admin: editingDraft.admin,
      });
      cancelEdit();
    } catch (e) {
      console.error(e);
      setValidationError('שמירת השינויים נכשלה');
    }
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await deleteManagedUser(toDeleteId);
      setToDeleteId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const openAdd = () => {
    setAddUsername('');
    setAddUnitId('');
    setAddRole('inspector');
    setAddActive(true);
    setAddAdmin(false);
    setValidationError(null);
    setShowAddDialog(true);
  };

  const saveNew = async () => {
    if (!addUsername.trim()) {
      setValidationError('יש להזין שם משתמש (Username)');
      return;
    }
    if (!addUnitId) {
      setValidationError('יש לבחור יחידה למשתמש');
      return;
    }
    if (!addRole) {
      setValidationError('יש לבחור תפקיד');
      return;
    }

    try {
      await addManagedUser({
        username: addUsername.trim(),
        unitId: addUnitId,
        role: addRole,
        active: addActive,
        admin: addAdmin,
      });
      setShowAddDialog(false);
      setValidationError(null);
    } catch (e: any) {
      console.error(e);
      setValidationError(
        e?.message || 'יצירת המשתמש נכשלה (בדוק שה-Username קיים ב-AD)'
      );
    }
  };

  if (!currentUser || !isMasterUser) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-3`}
            >
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t?.master?.userManagementTitle || 'Master · ניהול משתמשים'}
              </h1>
            </div>
            <div
              className={`flex items-center ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-3`}
            >
              <LanguageToggle />
              <UnitSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div
              className={`flex items-center ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-2`}
            >
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t?.master?.usersList || 'רשימת משתמשים'}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? 'right-0 pr-3' : 'left-0 pl-3'
                  } flex items-center pointer-events-none`}
                >
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t?.common?.search || 'חיפוש'}
                  className={`block w-full ${
                    isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
                  } py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  {t?.common?.itemsPerPage || 'שורות לעמוד'}:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                onClick={openAdd}
                className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {t?.master?.addUser || 'הוסף משתמש'}
              </button>
            </div>
          </div>

          {usersError && (
            <div
              className={`mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-2`}
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p
                className={`text-sm text-red-700 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                {usersError}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      Username
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      {t?.common?.name || 'שם'}
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      Email
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      <Building2 className="inline w-4 h-4 mr-1" />
                      {t?.dashboard?.unit || 'יחידה'}
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      <Shield className="inline w-4 h-4 mr-1" />
                      {t?.common?.role || 'תפקיד'}
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-right' : 'text-left'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      {t?.common?.status || 'סטטוס'}
                    </th>
                    <th
                      className={`px-6 py-3 ${
                        isRTL ? 'text-left' : 'text-right'
                      } text-xs font-medium text-gray-500 uppercase`}
                    >
                      {t?.common?.actions || 'פעולות'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((u) => {
                    const isEditing = editingId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="font-medium text-gray-900">
                            {u.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <select
                              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              value={editingDraft?.unitId || ''}
                              onChange={(e) =>
                                setEditingDraft((d: any) =>
                                  d
                                    ? { ...d, unitId: e.target.value }
                                    : d
                                )
                              }
                            >
                              <option value="">
                                {t?.unitAreaManagement?.selectUnit ||
                                  'בחר יחידה'}
                              </option>
                              {units.map((un) => (
                                <option key={un.id} value={un.id}>
                                  {un.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-700">
                              {unitName(u.unitId)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          {isEditing ? (
                            <select
                              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              value={editingDraft?.role || 'inspector'}
                              onChange={(e) =>
                                setEditingDraft((d: any) =>
                                  d
                                    ? {
                                        ...d,
                                        role: e.target.value as Role,
                                      }
                                    : d
                                )
                              }
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-700">{u.role}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <label className="inline-flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={!!editingDraft?.active}
                                onChange={(e) =>
                                  setEditingDraft((d: any) =>
                                    d
                                      ? {
                                          ...d,
                                          active: e.target.checked,
                                        }
                                      : d
                                  )
                                }
                              />
                              <span>
                                {editingDraft?.active
                                  ? t?.common?.active || 'פעיל'
                                  : t?.common?.inactive || 'לא פעיל'}
                              </span>
                            </label>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                u.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {u.active
                                ? t?.common?.active || 'פעיל'
                                : t?.common?.inactive || 'לא פעיל'}
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap ${
                            isRTL ? 'text-left' : 'text-right'
                          } text-sm`}
                        >
                          {isEditing ? (
                            <div
                              className={`flex items-center justify-end ${
                                isRTL ? 'space-x-reverse' : ''
                              } space-x-2`}
                            >
                              <button
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`flex items-center justify-end ${
                                isRTL ? 'space-x-reverse' : ''
                              } space-x-2`}
                            >
                              <button
                                onClick={() => beginEdit(u)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setToDeleteId(u.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pageItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {t?.common?.noResults || 'אין תוצאות'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {validationError && (
                <div
                  className={`m-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center ${
                    isRTL ? 'space-x-reverse' : ''
                  } space-x-2`}
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p
                    className={`text-sm text-red-700 ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    {validationError}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-sm text-gray-700 ${
                        isRTL ? 'text-right' : 'text-left'
                      }`}
                    >
                      {(t?.common?.showing || 'מציג')}{' '}
                      {total === 0 ? 0 : start + 1}{' '}
                      {(t?.common?.to || 'עד')}{' '}
                      {Math.min(end, total)}{' '}
                      {(t?.common?.of || 'מתוך')} {total}
                    </div>
                    <div
                      className={`flex items-center ${
                        isRTL ? 'space-x-reverse' : ''
                      } space-x-2`}
                    >
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum = 0;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (page <= 3) pageNum = i + 1;
                            else if (page >= totalPages - 2)
                              pageNum = totalPages - 4 + i;
                            else pageNum = page - 2 + i;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  page === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* דיאלוג הוספת משתמש */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t?.master?.addUser || 'הוסף משתמש'}
              </h3>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setValidationError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Username</label>
                <input
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="לדוגמה: c19liov"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t?.dashboard?.unit || 'יחידה'}
                </label>
                <select
                  value={addUnitId}
                  onChange={(e) => setAddUnitId(e.target.value)}
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    {t?.unitAreaManagement?.selectUnit || 'בחר יחידה'}
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t?.common?.role || 'תפקיד'}
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as Role)}
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center space-x-3">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={addActive}
                    onChange={(e) => setAddActive(e.target.checked)}
                  />
                  <span className="text-sm">
                    {addActive
                      ? t?.common?.active || 'פעיל'
                      : t?.common?.inactive || 'לא פעיל'}
                  </span>
                </label>
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={addAdmin}
                    onChange={(e) => setAddAdmin(e.target.checked)}
                  />
                  <span className="text-sm">Admin</span>
                </label>
              </div>
            </div>

            <div
              className={`mt-6 flex items-center justify-end ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-3`}
            >
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setValidationError(null);
                }}
                className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
              >
                {t?.common?.cancel || 'בטל'}
              </button>
              <button
                onClick={saveNew}
                className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {t?.common?.save || 'שמור'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מחיקת משתמש */}
      {toDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t?.common?.delete || 'מחיקה'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {t?.deviceManagement?.deleteConfirm ||
                'האם אתה בטוח שברצונך למחוק משתמש זה?'}
            </p>
            <div
              className={`flex items-center justify-end ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-3`}
            >
              <button
                onClick={() => setToDeleteId(null)}
                className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
              >
                {t?.common?.cancel || 'בטל'}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                {t?.common?.delete || 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
