
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import type { InspectionType } from '../types/inspection';

export default function DeviceDetails() {
  const history = useHistory();
  const { t, isRTL } = useTranslation();
  const { deviceId } = useParams<{ deviceId: string }>();

  const {
    devices,
    currentUser,
    currentForm,
    loadDevices,
    updateDeviceInForm,
    setCurrentForm,
    areas,
  } = useInspectionStore();

  // מצא את המכשיר לפי GUID; אם (במקרי קצה) הגיע מספר מכשיר ב־URL — בצע fallback
  const device = useMemo(
    () =>
      devices.find(d => d.id === deviceId) ||
      devices.find(d => d.deviceNumber === deviceId),
    [devices, deviceId]
  );

  // מצא אם כבר סומן בטופס (לפי id ואם אין אז לפי deviceNumber)
  const inspectedDevice = useMemo(() => {
    if (!currentForm || !device) return undefined;
    return (
      currentForm.devices.find((d: any) => d.id && d.id === device.id) ||
      currentForm.devices.find((d: any) => d.deviceNumber === device.deviceNumber)
    );
  }, [currentForm, device]);

  const [inspectionType, setInspectionType] = useState<InspectionType>(
    (inspectedDevice?.inspectionType as InspectionType) || 'routine'
  );
  const [notes, setNotes] = useState(inspectedDevice?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // guard: אם אין טופס נוכחי – חזור לסריקה
  useEffect(() => {
    if (!currentForm) {
      history.replace('/inspection/scan');
    }
  }, [currentForm, history]);

  // אם נכנסתי ישירות / רעננתי – טען מכשירים לפי האזור של הטופס
  useEffect(() => {
    if (currentForm && !device) {
      // נטען את המכשירים של האזור כדי שיימצא
      if (currentForm.areaId) {
        loadDevices(currentForm.areaId).catch(() => {});
      }
    }
  }, [currentForm, device, loadDevices]);

  if (!currentForm || !device) {
    // מצב ביניים — או שאין טופס (כבר בוצע redirect), או שטוענים מכשירים
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1) עדכון בשרת: שמירת בדיקה למכשיר בתוך הטופס
      await updateDeviceInForm(currentForm.id, {
        id: device.id, // חשוב! ה־store ישלח כ-DeviceId
        inspectionType,
        notes,
        inspectedAt: new Date(),
      });

      // 2) עדכון מקומי של currentForm כדי שה־UI יתעדכן מיד (לא לחכות לריענון כללי)
      const updatedDeviceEntry = {
        ...device,
        inspectionType,
        notes,
        inspectedAt: new Date(),
      };

      const already = inspectedDevice ? true : false;
      const updatedDevices = already
        ? currentForm.devices.map((d: any) => {
            if (d.id && device.id) return d.id === device.id ? updatedDeviceEntry : d;
            return d.deviceNumber === device.deviceNumber ? updatedDeviceEntry : d;
          })
        : [...currentForm.devices, updatedDeviceEntry];

      setCurrentForm({ ...currentForm, devices: updatedDevices });

      // 3) חזרה לסורק
      history.push('/inspection/scan');
    } catch (err) {
      console.error('Error updating device inspection:', err);
      setError(t.errors?.savingDevice || 'אירעה שגיאה בשמירת הבדיקה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const areaName =
    areas.find(a => a.id === currentForm.areaId)?.name || '';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => history.push('/inspection/scan')}
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
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.deviceDetails.title}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {inspectedDevice ? t.deviceDetails.updateDetails : t.deviceDetails.completeInspection}
            </p>
            {areaName && (
              <p className={`text-sm text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.dashboard.area}: {areaName}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <p className={`text-base font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.deviceDetails.deviceNumber}
              </p>
              <p className={`text-xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {device.deviceNumber}
              </p>
            </div>

            <div className="space-y-3">
              <p className={`text-base font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.deviceDetails.location}
              </p>
              <p className={`text-xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {device.location}
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-200 space-y-6">
              <div>
                <label className={`block text-base font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.deviceDetails.inspectionType}
                </label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-3 px-4 text-base transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                  disabled={isSubmitting}
                >
                  <option value="routine">{t.deviceDetails.routine}</option>
                  <option value="maintenance">{t.deviceDetails.maintenance}</option>
                  <option value="repair">{t.deviceDetails.repair}</option>
                </select>
              </div>

              <div>
                <label className={`block text-base font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.deviceDetails.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-3 px-4 text-base transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t.deviceDetails.notesPlaceholder}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl active:scale-95 ${isRTL ? 'space-x-reverse' : ''} space-x-3`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    {t.deviceDetails.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 flex-shrink-0" />
                    {inspectedDevice ? t.deviceDetails.updateInspection : t.deviceDetails.completeInspectionBtn}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
