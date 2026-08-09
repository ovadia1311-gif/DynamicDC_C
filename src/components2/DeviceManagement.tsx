
import React, { useEffect, useMemo, useState } from 'react';
import { useInspectionStore } from '../store/inspectionStore';
import { Device, BACheck } from '../types/inspection';
import { useTranslation } from '../i18n/useTranslations';
import { Plus, X, Pencil, Trash2, Save, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DeviceManagement() {
  const { t, isRTL } = useTranslation();

  const {
    // data
    devices,
    areas,
    currentUser,
    selectedUnitId,

    // actions
    loadAreas,
    loadDevicesByArea,
    loadAllDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    checkDeviceNumberExists,

    // state
    isLoading,
    error,

    // helpers
    getEffectiveUnitId,
  } = useInspectionStore();

  const isMasterUser = useInspectionStore.getState().isMaster();

  // בחירת אזור לסינון/טעינה
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  // UI states
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [newDevice, setNewDevice] = useState<Omit<Device, 'id'>>({
    deviceNumber: '',
    location: '',
    baCheck: 'green',
    managerNotes: '',
    areaId: '',
    unitId: '',
  });

  const effectiveUnitId = getEffectiveUnitId();

  /** טעינה ראשונית של אזורים (לפי יחידה אפקטיבית), ואז טעינת מכשירים לפי האזור הראשון */
  useEffect(() => {
    (async () => {
      await loadAreas();
      // קבע אזור ראשון אם קיים
      const firstArea = effectiveUnitId
        ? areas.find(a => a.unitId === effectiveUnitId) || areas[0]
        : areas[0];

      if (firstArea) {
        setSelectedAreaId(firstArea.id);
        await loadDevicesByArea(firstArea.id);
      } else {
        // אין אזורים? נטען רשימת מכשירים כללית כ־fallback
        await loadAllDevices();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  /** כאשר מתחלפת יחידה (מאסטר) נטען אזורים חדשים ונתקדם לאזור ראשון */
  useEffect(() => {
    if (!currentUser || !isMasterUser) return;

    (async () => {
      await loadAreas();
      const firstArea = effectiveUnitId
        ? areas.find(a => a.unitId === effectiveUnitId) || areas[0]
        : areas[0];

      if (firstArea) {
        setSelectedAreaId(firstArea.id);
        await loadDevicesByArea(firstArea.id);
      } else {
        await loadAllDevices();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId, isMasterUser, currentUser]);

  /** כשהמשתמש בוחר אזור — נטען מכשירים עבורו */
  useEffect(() => {
    if (!selectedAreaId) return;
    loadDevicesByArea(selectedAreaId);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaId]);

  /** אזורים רלוונטיים למשתמש */
  const userAreas = useMemo(() => {
    if (!currentUser) return [];
    if (isMasterUser) {
      return effectiveUnitId ? areas.filter(a => a.unitId === effectiveUnitId) : areas;
    }
    return areas.filter(a => a.unitId === currentUser.unitId);
  }, [areas, currentUser, isMasterUser, effectiveUnitId]);

  /** סינון תצוגה בצד לקוח (חיפוש) */
  const filteredDevices = useMemo(() => {
    const inArea = selectedAreaId
      ? devices.filter(d => d.areaId === selectedAreaId)
      : devices;

    if (!searchTerm) return inArea;

    const q = searchTerm.toLowerCase();
    const areaNameById = new Map(userAreas.map(a => [a.id, a.name.toLowerCase()]));
    return inArea.filter(d =>
      d.deviceNumber.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      (d.managerNotes || '').toLowerCase().includes(q) ||
      (areaNameById.get(d.areaId) || '').includes(q)
    );
  }, [devices, selectedAreaId, searchTerm, userAreas]);

  // Pagination
  const totalItems = filteredDevices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  // helpers
  const validateDeviceNumber = (number: string) => {
    const regex = /^[0-9]{5}$/; // שמרתי את הכלל שלך
    if (!regex.test(number)) return t.deviceManagement.deviceNumberError;
    return null;
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setValidationError(null);
  };

  const handleCancel = () => {
    setEditingDevice(null);
    setValidationError(null);
  };

  const handleSave = async () => {
    if (!editingDevice) return;

    const formatError = validateDeviceNumber(editingDevice.deviceNumber);
    if (formatError) {
      setValidationError(formatError);
      return;
    }

    const original = devices.find(d => d.id === editingDevice.id);
    const numberChanged = original && original.deviceNumber !== editingDevice.deviceNumber;

    if (numberChanged) {
      const exists = await checkDeviceNumberExists(
        editingDevice.deviceNumber,
        editingDevice.unitId,
        editingDevice.id
      );
      if (exists) {
        setValidationError(t.deviceManagement.deviceExists);
        return;
      }
    }

    try {
      // ודא שה־unitId נשאב מהאזור הנוכחי
      const area = userAreas.find(a => a.id === editingDevice.areaId);
      const withUnit: Device = { ...editingDevice, unitId: area?.unitId || editingDevice.unitId || '' };
      await updateDevice(withUnit);
      setEditingDevice(null);
      setValidationError(null);
      // רענון קל אחרי עדכון — מושג דרך store.updateDevice->loadAllDevices,
      // אבל כדי להישאר מדויק לאזור הנבחר:
      await loadDevicesByArea(selectedAreaId);
    } catch (err) {
      console.error('Failed to update device:', err);
      setValidationError(t.deviceManagement.updateFailed);
    }
  };

  const handleDelete = async () => {
    if (!deviceToDelete) return;
    try {
      await deleteDevice(deviceToDelete);
      setDeviceToDelete(null);
      await loadDevicesByArea(selectedAreaId);
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  const handleCreateNew = () => {
    setNewDevice({
      deviceNumber: '',
      location: '',
      baCheck: 'green',
      managerNotes: '',
      areaId: selectedAreaId || '',
      unitId: (userAreas.find(a => a.id === selectedAreaId)?.unitId) || '',
    });
    setValidationError(null);
    setShowAddDialog(true);
  };

  const handleSaveNewDevice = async () => {
    const formatError = validateDeviceNumber(newDevice.deviceNumber);
    if (formatError) {
      setValidationError(formatError);
      return;
    }

    if (!newDevice.areaId) {
      setValidationError(t.unitAreaManagement?.selectArea || 'Please select an area first');
      return;
    }

    const selectedArea = userAreas.find(a => a.id === newDevice.areaId);
    if (!selectedArea) {
      setValidationError('Invalid area selected');
      return;
    }

    const exists = await checkDeviceNumberExists(newDevice.deviceNumber, selectedArea.unitId);
    if (exists) {
      setValidationError(t.deviceManagement.deviceExists);
      return;
    }

    try {
      const deviceToCreate: Device = {
        id: crypto.randomUUID(),
        ...newDevice,
        unitId: selectedArea.unitId,
      };
      await addDevice(deviceToCreate);
      setShowAddDialog(false);
      setValidationError(null);
      // איפוס טופס
      setNewDevice({
        deviceNumber: '',
        location: '',
        baCheck: 'green',
        managerNotes: '',
        areaId: selectedAreaId || '',
        unitId: selectedArea.unitId,
      });
      await loadDevicesByArea(selectedAreaId);
    } catch (err) {
      console.error('Failed to create device:', err);
      setValidationError(t.deviceManagement.createFailed);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Toolbar/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
            {/* Area filter */}
            <div className="flex items-center">
              <label className={`mr-2 text-sm text-gray-600 ${isRTL ? 'ml-2 mr-0' : ''}`}>
                {t.dashboard.area}
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {/* מאפשר גם "כל האזורים" אם תרצה */}
                {/* <option value="">{t.unitAreaManagement.allAreas || 'All areas'}</option> */}
                {userAreas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder={t.common.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
            <div className="flex items-center space-x-2">
              <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.common.itemsPerPage || 'Items per page'}:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              onClick={handleCreateNew}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
            >
              <Plus className="w-5 h-5" />
              {t.deviceManagement.addDevice}
            </button>
          </div>
        </div>

        {(error || validationError) && (
          <div className={`mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error || validationError}</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.deviceManagement.deviceNumber}</th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.deviceManagement.location}</th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.deviceManagement.baCheck}</th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.dashboard.area}</th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.deviceManagement.managerNotes}</th>
              <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>{t.deviceManagement.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDevices.map(device => (
              <tr key={device.id}>
                {/* Device Number */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingDevice?.id === device.id ? (
                    <input
                      type="text"
                      value={editingDevice.deviceNumber}
                      onChange={(e) => setEditingDevice({ ...editingDevice, deviceNumber: e.target.value })}
                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  ) : (
                    <span className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{device.deviceNumber}</span>
                  )}
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingDevice?.id === device.id ? (
                    <input
                      type="text"
                      value={editingDevice.location}
                      onChange={(e) => setEditingDevice({ ...editingDevice, location: e.target.value })}
                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  ) : (
                    <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{device.location}</span>
                  )}
                </td>

                {/* BA Check */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingDevice?.id === device.id ? (
                    <select
                      value={editingDevice.baCheck}
                      onChange={(e) => setEditingDevice({ ...editingDevice, baCheck: e.target.value as BACheck })}
                      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <option value="green">{t.deviceManagement.green}</option>
                      <option value="yellow">{t.deviceManagement.yellow}</option>
                      <option value="red">{t.deviceManagement.red}</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${device.baCheck === 'green' ? 'bg-green-100 text-green-800'
                        : device.baCheck === 'yellow' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'}`}
                    >
                      {t.baCheck[device.baCheck as keyof typeof t.baCheck] || device.baCheck}
                    </span>
                  )}
                </td>

                {/* Area */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingDevice?.id === device.id ? (
                    <select
                      value={editingDevice.areaId}
                      onChange={(e) => {
                        const selectedArea = userAreas.find(a => a.id === e.target.value);
                        setEditingDevice({
                          ...editingDevice,
                          areaId: e.target.value,
                          unitId: selectedArea?.unitId || ''
                        });
                      }}
                      className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      {userAreas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {userAreas.find(a => a.id === device.areaId)?.name || ''}
                    </span>
                  )}
                </td>

                {/* Notes */}
                <td className="px-6 py-4 text-sm">
                  {editingDevice?.id === device.id ? (
                    <input
                      type="text"
                      value={editingDevice.managerNotes}
                      onChange={(e) => setEditingDevice({ ...editingDevice, managerNotes: e.target.value })}
                      className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  ) : (
                    <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{device.managerNotes || '-'}</span>
                  )}
                </td>

                {/* Actions */}
                <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} text-sm font-medium space-x-2`}>
                  {editingDevice?.id === device.id ? (
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <button onClick={handleSave} className="text-green-600 hover:text-green-900" title={t.common.save}>
                        <Save className="w-5 h-5" />
                      </button>
                      <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900">
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                      <button onClick={() => handleEdit(device)} className="text-blue-600 hover:text-blue-900" title={t.common.edit}>
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => setDeviceToDelete(device.id)} className="text-red-600 hover:text-red-900" title={t.common.delete}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!paginatedDevices.length && !isLoading && (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={6}>
                  {t.common.noResults || 'No results'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {(t.common.showing || 'Showing')} {totalItems ? startIndex + 1 : 0} {(t.common.to || 'to')} {Math.min(endIndex, totalItems)} {(t.common.of || 'of')} {totalItems} {(t.common.results || 'results')}
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = 0;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {t.deviceManagement.addNewDevice}
              </h3>
              <button
                onClick={() => { setShowAddDialog(false); setValidationError(null); }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {validationError && (
              <div className={`mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{validationError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.deviceManagement.deviceNumber}</label>
                <input
                  type="text"
                  value={newDevice.deviceNumber}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceNumber: e.target.value })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t.deviceManagement.enterDeviceNumber}
                  maxLength={6}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.deviceManagement.location}</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t.deviceManagement.enterLocation}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.deviceManagement.baCheck}</label>
                <select
                  value={newDevice.baCheck}
                  onChange={(e) => setNewDevice({ ...newDevice, baCheck: e.target.value as BACheck })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="green">{t.deviceManagement.green}</option>
                  <option value="yellow">{t.deviceManagement.yellow}</option>
                  <option value="red">{t.deviceManagement.red}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.dashboard.area}</label>
                <select
                  value={newDevice.areaId}
                  onChange={(e) => {
                    const area = userAreas.find(a => a.id === e.target.value);
                    setNewDevice({
                      ...newDevice,
                      areaId: e.target.value,
                      unitId: area?.unitId || ''
                    });
                  }}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="">{t.unitAreaManagement?.selectArea || 'Select area'}</option>
                  {userAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.deviceManagement.managerNotes}</label>
                <input
                  type="text"
                  value={newDevice.managerNotes}
                  onChange={(e) => setNewDevice({ ...newDevice, managerNotes: e.target.value })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t.deviceManagement.enterNotes}
                />
              </div>
            </div>

            <div className={`flex ${isRTL ? 'justify-start space-x-reverse' : 'justify-end'} space-x-3`}>
              <button
                onClick={() => { setShowAddDialog(false); setValidationError(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveNewDevice}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.deviceManagement.addDevice}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deviceToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">{t.deviceManagement.deleteDevice}</h3>
            <p className={`text-sm text-gray-500 my-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.deviceManagement.deleteConfirm}
            </p>
            <div className={`flex ${isRTL ? 'justify-start space-x-reverse' : 'justify-end'} space-x-3`}>
              <button
                onClick={() => setDeviceToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
