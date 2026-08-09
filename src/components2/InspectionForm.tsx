

import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Clipboard, Sun, Sunset, Moon, ChevronLeft, User } from 'lucide-react';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';
import type { Shift } from '../types/inspection';

export default function InspectionForm() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();

  const {
    // store actions/state
    addForm,
    setCurrentForm,
    loadDevices,
    isLoading,
    error,
    devices,
    inspectors,
    isLoadingInspectors: loadingInspectors,
    inspectorsError,
    areas,
    currentUser,
    initializeApp,
    loadAreas,             // נטען אזורים מחדש כשיחידה משתנה (למאסטר)
  } = useInspectionStore();

  // נגזרות הרשאות/יחידה
  const isMasterUser = useInspectionStore.getState().isMaster();
  const effectiveUnitId = useInspectionStore.getState().getEffectiveUnitId(); // אם מאסטר – זו היחידה שנבחרה; אחרת יחידת המשתמש

  // בחירות משתמש בעמוד
  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [shift, setShift] = useState<Shift>('morning');
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // אתחול כללי
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // כשיחידה אפקטיבית משתנה (למשל מאסטר בחר יחידה), נטען אזורים ונאפס אזור נבחר
  useEffect(() => {
    // איפוס בחירות תלויות-יחידה
    setSelectedAreaId('');
    // נטען אזורים מחדש (ה־store שלך כבר מסנן בשרת/בקליינט לפי unitId אפקטיבי)
    loadAreas().catch(() => {});
  }, [effectiveUnitId, loadAreas]);

  // אזורים זמינים למשתמש/ליחידה הנוכחית
  const userAreas = useMemo(() => {
    if (!currentUser) return [];
    if (isMasterUser) {
      return effectiveUnitId ? areas.filter(a => a.unitId?.toUpperCase() === effectiveUnitId?.toUpperCase()) : areas;
    }
    return areas.filter(a => a.unitId?.toUpperCase() === currentUser.unitId?.toUpperCase());
  }, [areas, currentUser, isMasterUser, effectiveUnitId]);

  // בודקים זמינים למשתמש/יחידה (נסנן בקליינט; אפשר גם לעשות טעינת Inspectors פר-יחידה אם תרצה אח"כ)
  const userInspectors = useMemo(() => {
    if (!currentUser) return [];
    if (isMasterUser) {
      return effectiveUnitId ? inspectors.filter(i => i.unitId?.toUpperCase() === effectiveUnitId.toUpperCase()) : inspectors;
    }
    return inspectors.filter(i => i.unitId?.toUpperCase() === currentUser.unitId.toUpperCase());
  }, [inspectors, currentUser, isMasterUser, effectiveUnitId]);

  // טעינת מכשירים בעת בחירת אזור
  const handleAreaChange = async (newAreaId: string) => {
    setSelectedAreaId(newAreaId);
    if (!newAreaId) return;
    try {
      // ה־backend שלך תומך ב־areaId; (אם הרחבת גם ל-unitId זה תקין ו־optional)
      await loadDevices(newAreaId);
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  const handleStartInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspectorId || !selectedAreaId) return;

    const selectedInspector = userInspectors.find(i => i.id?.toUpperCase() === selectedInspectorId?.toUpperCase());
    if (!selectedInspector) return;

    // לוודא שמכשירים נטענו לאזור הזה
    if (!devices || devices.length === 0) {
      // ננסה טעינה מיידית (edge case – אם המשתמש לחץ מהר לפני שהמכשירים הגיעו)
      await loadDevices(selectedAreaId);
      if (!useInspectionStore.getState().devices.length) {
        console.error('No devices found for selected area');
        return;
      }
    }

    const area = userAreas.find(a => a.id === selectedAreaId);
    const unitIdForForm = area?.unitId || effectiveUnitId || '';

    const newForm = {
      id: crypto.randomUUID(),
      inspectorName: selectedInspector.name,
      shift,
      areaId: selectedAreaId,
      unitId: unitIdForForm,
      startTime: new Date(),
      devices: [],
      expectedDeviceCount: useInspectionStore.getState().devices.length, // מספר המכשירים באזור
    };

    setCurrentForm(newForm);
    addForm(newForm)
    navigate.push('/inspection/scan');
  };

  const getAreaName = (areaId: string) =>
    userAreas.find(area => area.id === areaId)?.name || '';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate.push('/')}
              className={`flex items-center text-gray-600 hover:text-gray-900 ${isRTL ? 'space-x-reverse' : ''} space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200`}
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>{t.inspectionForm.backToDashboard}</span>
            </button>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              {/* מאסטר בוחר יחידה כאן; שאר המשתמשים יראו את יחידתם */}
              <UnitSelector />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className={`flex items-center justify-center mb-8 ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
            <Clipboard className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">{t.inspectionForm.title}</h1>
          </div>

          {(error || inspectorsError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error || inspectorsError}</p>
            </div>
          )}

          <form onSubmit={handleStartInspection} className="space-y-8">
            {/* Inspector */}
            <div>
              <label className={`block text-base font-semibold text-gray-700 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.inspectionForm.selectInspector}
              </label>
              {loadingInspectors ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedInspectorId}
                    onChange={(e) => setSelectedInspectorId(e.target.value)}
                    className={`block w-full ${isRTL ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'} py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200`}
                    required
                  >
                    <option value="">{t.inspectionForm.selectInspectorPlaceholder}</option>
                    {userInspectors.map((inspector) => (
                      <option key={inspector.id} value={inspector.id}>
                        {inspector.name} ({t.inspectorManagement[inspector.role as keyof typeof t.inspectorManagement] || inspector.role})
                      </option>
                    ))}
                  </select>
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Area */}
            <div className="space-y-4">
              <label className={`block text-base font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.dashboard.area}
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => handleAreaChange(e.target.value)}
                className={`block w-full ${isRTL ? 'pr-4 pl-4 text-right' : 'pl-4 pr-4 text-left'} py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-colors duration-200`}
                required
              >
                <option value="">{t.unitAreaManagement.selectUnit}</option>
                {userAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div className="space-y-4">
              <label className={`block text-base font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.inspectionForm.shift}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: 'morning' as Shift, label: t.dashboard.morning, icon: Sun },
                  { value: 'afternoon' as Shift, label: t.dashboard.afternoon, icon: Sunset },
                  { value: 'evening' as Shift, label: t.dashboard.evening, icon: Moon }
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    onClick={() => setShift(value)}
                    className={`
                      relative flex items-center justify-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-md
                      ${shift === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="shift"
                      value={value}
                      checked={shift === value}
                      onChange={() => setShift(value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-1">
                      <Icon className={`w-6 h-6 flex-shrink-0 ${shift === value ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices counter */}
            {devices.length > 0 && (
              <div className={`text-sm text-gray-600 bg-blue-50 p-4 rounded-lg flex items-center justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
                {devices.length} {t.inspectionForm.devicesAvailable} {getAreaName(selectedAreaId)}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || loadingInspectors || devices.length === 0 || !selectedInspectorId || !selectedAreaId}
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl active:scale-95"
            >
              {isLoading || loadingInspectors ? t.common.loading : t.inspectionForm.startInspection}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
