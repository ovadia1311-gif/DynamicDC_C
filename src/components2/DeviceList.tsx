
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, Building2, Search, RotateCcw } from 'lucide-react';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';

export default function DeviceList() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();
  const location = useLocation();
  const { currentForm, devices, areas, updateForm, uninspectDeviceInForm } = useInspectionStore();
  const isInspected = location.pathname === '/inspection/inspected';
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentForm) {
      navigate.push('/');
    }
  }, [currentForm, navigate]);

  if (!currentForm) {
    return null;
  }

  // Filter devices by current terminal and inspection status
  const currentAreaDevices = devices.filter(d => d.areaId === currentForm.areaId);
  const inspectedDeviceIds = currentForm.devices.map(d => d.deviceNumber);

  const filteredDevices = isInspected
    ? currentAreaDevices.filter(d => inspectedDeviceIds.includes(d.deviceNumber))
    : currentAreaDevices.filter(d => !inspectedDeviceIds.includes(d.deviceNumber));

  // Apply search filter
  const displayDevices = filteredDevices.filter(device => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    return device.deviceNumber.toLowerCase().includes(searchLower) ||
      device.location.toLowerCase().includes(searchLower) ||
      device.managerNotes.toLowerCase().includes(searchLower);
  });

  const getBaCheckColor = (baCheck: string) => {
    switch (baCheck) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAreaName = (areaId: string) => {
    return areas.find(area => area.id === areaId)?.name || '';
  };

  const handleUninspect = async (deviceId: string) => {
    if (!currentForm) return;

    try {
      const updatedDevices = currentForm.devices.filter(d => d.id !== deviceId);
      const updatedForm = {
        ...currentForm,
        devices: updatedDevices,
      };
      await uninspectDeviceInForm(currentForm.id,deviceId);
    } catch (err) {
      console.error('Error uninspecting device:', err);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate.push('/inspection/scan')}
              className={`flex items-center text-gray-600 hover:text-gray-900 ${isRTL ? 'space-x-reverse' : ''} space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200`}
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>{t.deviceDetails.backToScanner}</span>
            </button>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isInspected ? t.deviceList.inspectedDevices : t.deviceList.pendingInspections}
              </h2>
              <div className={`flex items-center gap-3 text-sm text-gray-600 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Building2 className="w-5 h-5 flex-shrink-0" />
                {getAreaName(currentForm.areaId)}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t.common.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                />
              </div>
            </div>

            <p className={`text-base text-gray-500 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {displayDevices.length} {t.dashboard.devices} {searchTerm && `(${t.common.filtered || 'filtered'})`}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {displayDevices.map((device) => (
              <div
                key={device.id}
                className="p-4 sm:p-6 hover:bg-blue-50 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-base font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.deviceDetails.deviceNumber} {device.deviceNumber}
                    </h3>
                    <p className={`text-base text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{device.location}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBaCheckColor(device.baCheck)}`}>
                        {t.deviceList.baCheck}: {t.baCheck[device.baCheck as keyof typeof t.baCheck] || device.baCheck.toUpperCase()}
                      </span>
                      {device.managerNotes && (
                        <span className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t.deviceList.note}: {device.managerNotes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    {!isInspected ? (
                      <button
                        onClick={() => navigate.push(`/inspection/device/${device.id}`)}
                        className={`flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                      >
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <span>{t.deviceList.inspect}</span>
                      </button>
                    ) : (
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                        <button
                          onClick={() => navigate.push(`/inspection/device/${device.id}`)}
                          className={`flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                        >
                          {t.common.edit}
                          <ChevronRight className="w-5 h-5 flex-shrink-0" />
                        </button>
                        <button
                          onClick={() => handleUninspect(device.id)}
                          className="flex items-center text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-100 transition-colors duration-200"
                          title={t.deviceList.uninspect || 'Cancel inspection'}
                        >
                          <RotateCcw className="w-5 h-5 flex-shrink-0" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {displayDevices.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                {isInspected ? t.deviceList.noDevicesInspected : t.deviceList.noDevicesPending} {getAreaName(currentForm.areaId)}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
