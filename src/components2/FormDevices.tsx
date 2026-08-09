
import React, { useMemo, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Download,
  ClipboardList,
  Menu,
  LayoutGrid,
  ChevronLeft,
  X,
  FilePlus,
  Users,
  Building2,
  LogOut,
  Settings,
} from 'lucide-react';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';
import * as XLSX from 'xlsx';
import type { InspectionForm } from '../types/inspection';

type RouteParams = { formId: string };

export default function FormDevices() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();
  const { formId } = useParams<RouteParams>();

  const {
    forms,
    devices,
    areas,
    signOut,
    isAdmin,
    isMaster,
    isLoading,
    error,
  } = useInspectionStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // מאתרים את הטופס לפי formId (normalize למחרוזת)
  const form = useMemo(() => {
    return forms.find(
      (f) =>
        String(f.id).toLowerCase() === String(formId).toLowerCase()
    );
  }, [forms, formId]);

  // אם אין טופס אחרי טעינה – חוזרים לניהול
  useEffect(() => {
    if (!isLoading && !form) {
      navigate.push('/management');
    }
  }, [isLoading, form, navigate]);

  if (isLoading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  const areaName =
    areas.find((area) => area.id === form.areaId)?.name || '';

  const formatShift = (shift: string) =>
    shift.charAt(0).toUpperCase() + shift.slice(1);

  const shiftLabel =
    t?.dashboard?.[form.shift as keyof typeof t.dashboard] ||
    formatShift(form.shift);

  const getFormStatus = (frm: InspectionForm) => {
    if (!frm.endTime) return 'In Progress';
    return frm.devices.length === frm.expectedDeviceCount
      ? 'Completed'
      : 'Incomplete';
  };

  const status = getFormStatus(form);
  const inspectedDevices = form.devices.length;
  const totalDevices = form.expectedDeviceCount || 0;
  const progress =
    totalDevices > 0
      ? Math.round((inspectedDevices / totalDevices) * 100)
      : 0;

  const handleNewForm = () => {
    navigate.push('/management/new-form');
    setIsMenuOpen(false);
  };

  const handleInspectorManagement = () => {
    navigate.push('/management/inspectors');
    setIsMenuOpen(false);
  };

  const handleUnitAreaManagement = () => {
    navigate.push('/management/units-areas');
    setIsMenuOpen(false);
  };

  const handleViewChange = () => {
    navigate.push('/management');
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setIsMenuOpen(false);
  };

  // התאמת מכשיר מקורי לרשומת הטופס
  const findOriginalDevice = (d: any) =>
    devices.find(
      (x) =>
        String(x.id).toLowerCase() === String(d.id).toLowerCase() ||
        String(x.deviceNumber).toLowerCase() ===
          String(d.deviceNumber).toLowerCase()
    ) || d;

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const formDetailsData: (string | number)[][] = [
      ['INSPECTION FORM DETAILS', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Inspector Name:', form.inspectorName, '', '', '', '', ''],
      ['Area:', areaName, '', '', '', '', ''],
      ['Shift:', shiftLabel, '', '', '', '', ''],
      [
        'Start Time:',
        new Date(form.startTime).toLocaleString(),
        '',
        '',
        '',
        '',
        '',
      ],
      [
        'End Time:',
        form.endTime
          ? new Date(form.endTime).toLocaleString()
          : 'Not Completed',
        '',
        '',
        '',
        '',
        '',
      ],
      ['Status:', status, '', '', '', '', ''],
      [
        'Progress:',
        `${inspectedDevices} / ${totalDevices} devices inspected`,
        '',
        '',
        '',
        '',
        '',
      ],
      ['', '', '', '', '', '', ''],
      ['INSPECTED DEVICES', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      [
        'Device Number',
        'Location',
        'BA Check',
        'Manager Notes',
        'Inspection Type',
        'Inspection Time',
        'Inspection Notes',
      ],
    ];

    form.devices.forEach((d) => {
      const original: any = findOriginalDevice(d);
      formDetailsData.push([
        d.deviceNumber,
        original.location || '',
        String(original.baCheck || '').toUpperCase(),
        original.managerNotes || '-',
        d.inspectionType || '',
        d.inspectedAt
          ? new Date(d.inspectedAt).toLocaleString()
          : '',
        d.notes || '-',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(formDetailsData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 10, c: 0 }, e: { r: 10, c: 6 } },
    ];
    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 18 },
      { wch: 22 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');

    const fileName = `inspection-report-${form.areaId}-${new Date(
      form.startTime
    )
      .toISOString()
      .split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const statusBadge = () => {
    const base =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
    if (status === 'Completed') {
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          {t?.forms?.completed || 'הושלם'}
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          {t?.forms?.inProgress || 'בתהליך'}
        </span>
      );
    }
    return (
      <span className={`${base} bg-amber-100 text-amber-700`}>
        {t?.forms?.incomplete || 'לא הושלם'}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate.push('/management')}
            className={`flex items-center text-gray-600 hover:text-gray-900 ${
              isRTL ? 'space-x-reverse' : ''
            } space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors`}
          >
            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">
              {t?.forms?.backToManagement || 'חזרה לניהול'}
            </span>
          </button>

          <div
            className={`flex items-center ${
              isRTL ? 'space-x-reverse' : ''
            } space-x-3`}
          >
            <UnitSelector />
            <LanguageToggle />
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Side menu (mobile) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className={`relative bg-white w-72 max-w-full h-full shadow-xl p-4 flex flex-col ${
              isRTL ? 'ml-0 mr-auto' : 'mr-0 ml-auto'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="w-6 h-6 text-blue-600" />
                <span className="font-semibold">
                  {t?.common?.menu || 'תפריט'}
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2 flex-1">
              <button
                onClick={handleViewChange}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
              >
                <LayoutGrid className="w-5 h-5 mr-2" />
                {t?.dashboard?.title || 'לוח ניהול'}
              </button>

              {(isAdmin() || isMaster()) && (
                <>
                  <button
                    onClick={handleNewForm}
                    className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FilePlus className="w-5 h-5 mr-2" />
                    {t?.forms?.newForm || 'טופס חדש'}
                  </button>

                  <button
                    onClick={handleInspectorManagement}
                    className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {t?.inspectorManagement?.title || 'ניהול בודקים'}
                  </button>

                  <button
                    onClick={handleUnitAreaManagement}
                    className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    {t?.unitAreaManagement?.title || 'יחידות ואזורים'}
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 mt-4"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t?.nav?.logout || 'התנתקות'}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title + export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div
            className={`flex items-center ${
              isRTL ? 'space-x-reverse' : ''
            } space-x-3`}
          >
            <ClipboardList className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t?.forms?.detailsTitle || 'פרטי טופס בדיקה'}
              </h1>
              <p className="text-sm text-gray-500">
                {t?.forms?.formIdLabel || 'מספר טופס'}: {form.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToExcel}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-5 h-5 mr-2" />
              {t?.forms?.exportExcel || 'ייצוא לאקסל'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p
              className={`text-sm text-red-700 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {error}
            </p>
          </div>
        )}

        {/* Form summary card */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div
                className={`flex flex-wrap items-center ${
                  isRTL ? 'space-x-reverse' : ''
                } space-x-2 gap-2`}
              >
                <span className="text-sm font-medium text-gray-500">
                  {t?.common?.status || 'סטטוס'}:
                </span>
                {statusBadge()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {t?.dashboard?.inspector || 'בודק'}:
                  </span>
                  <span>{form.inspectorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {t?.dashboard?.area || 'אזור'}:
                  </span>
                  <span>{areaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {t?.inspectionForm?.shift || 'משמרת'}:
                  </span>
                  <span>{shiftLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {t?.forms?.devicesCount || 'כמות מכשירים'}:
                  </span>
                  <span>
                    {inspectedDevices} / {totalDevices}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full md:w-72">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>
                  {t?.forms?.progress || 'התקדמות הבדיקה'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    status === 'Completed'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  } transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 border-t border-gray-100 pt-4">
            <div>
              <span className="font-medium block mb-1">
                {t?.forms?.startTime || 'שעת התחלה'}:
              </span>
              <span>
                {new Date(form.startTime).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium block mb-1">
                {t?.forms?.endTime || 'שעת סיום'}:
              </span>
              <span>
                {form.endTime
                  ? new Date(form.endTime).toLocaleString()
                  : t?.forms?.notCompleted || 'טרם הסתיים'}
              </span>
            </div>
          </div>
        </div>

        {/* Devices list */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center ${
                isRTL ? 'space-x-reverse' : ''
              } space-x-2`}
            >
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t?.forms?.inspectedDevicesTitle ||
                  'מכשירים שנבדקו'}
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {inspectedDevices}{' '}
              {t?.forms?.devices || 'מכשירים'}
            </span>
          </div>

          {form.devices.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              {t?.forms?.noDevices || 'לא נמצאו מכשירים בטופס זה'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.deviceNumber || 'מספר מכשיר'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.location || 'מיקום'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      BA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.managerNotes || 'הערות מנהל'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.inspectionType || 'סוג בדיקה'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.inspectionTime || 'זמן בדיקה'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t?.forms?.inspectionNotes || 'הערות בדיקה'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {form.devices.map((d: any) => {
                    const original: any = findOriginalDevice(d);

                    return (
                      <tr key={`${d.deviceNumber}-${d.inspectedAt || ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {d.deviceNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {original.location || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {String(original.baCheck || '')
                            .toUpperCase()
                            .trim() || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 max-w-xs">
                          <span className="line-clamp-2">
                            {original.managerNotes || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {d.inspectionType || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {d.inspectedAt
                            ? new Date(
                                d.inspectedAt
                              ).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 max-w-xs">
                          <span className="line-clamp-2">
                            {d.notes || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
