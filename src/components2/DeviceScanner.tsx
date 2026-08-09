
import React, { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import { QrCode, ClipboardCheck, ClipboardList, LogOut, Building2, Clock, Camera, RefreshCw, CameraOff } from 'lucide-react';

export default function DeviceScanner() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();
  const { currentForm, addForm, updateForm, devices, areas } = useInspectionStore();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanning, setScanning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);
  const scanInterval = useRef<NodeJS.Timeout>();

  const capture = useCallback(() => {
    const webcam = webcamRef.current;
    if (!webcam || !isScanning) return;

    const imageSrc = webcam.getScreenshot();
    if (!imageSrc) return;

    // Create an image to draw to canvas
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      // Create canvas and get context
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw image to canvas
      ctx.drawImage(image, 0, 0);

      // Get image data for QR code scanning
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const scannedNumber = parseInt(code.data, 10);

          if (isNaN(scannedNumber) || scannedNumber < 1 || scannedNumber > 99999) {
            setError(t.scanner.invalidDevice);
            return;
          }
          const deviceNumber = scannedNumber.toString().padStart(5, '0');
          const device = devices.find(d => d.deviceNumber === deviceNumber);

          if (!device) {
            setError(t.scanner.deviceNotFound);
            return;
          }

          setIsScanning(false);
          if (scanInterval.current) {
            clearInterval(scanInterval.current);
          }
          navigate.push(`/inspection/device/${device.id}`);
        } catch (err) {
          console.error('QR code processing error:', err);
          setError(t.scanner.processingError);
        }
      }
      setScanning(false);
    };
  }, [isScanning, devices, navigate]);

  // Start/stop scanning
  React.useEffect(() => {
    if (isScanning) {
      scanInterval.current = setInterval(() => {
        setScanning(true);
        capture();
      }, 200); // Scan every 200ms
    } else {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    }
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, [capture, isScanning]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleFinish = async () => {
    if (currentForm) {
      setIsFinishing(true);
      try {
        await updateForm({
          ...currentForm,
          endTime: new Date()
        });
        navigate.push('/', { replace: true });
      } catch (err) {
        console.error('Error finishing inspection:', err);
        setError(t.errors.savingForm);
        setIsFinishing(false);
      }
    }
  };

  if (!currentForm) {
    return null;
  }

  // Calculate progress
  const currentAreaDevices = devices.filter(d => d.areaId === currentForm.areaId);
  const inspectedDeviceIds = currentForm.devices.map(d => d.deviceNumber);
  const remainingDevices = currentAreaDevices.filter(d => !inspectedDeviceIds.includes(d.deviceNumber));
  const totalDevices = currentAreaDevices.length;
  const inspectedCount = inspectedDeviceIds.length;
  const progress = totalDevices > 0 ? (inspectedCount / totalDevices) * 100 : 0;
  const isComplete = remainingDevices.length === 0 && totalDevices > 0;

  const formatShift = (shift: string) => {
    return shift.charAt(0).toUpperCase() + shift.slice(1);
  };

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode,
    aspectRatio: 16 / 9
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-16 sm:mt-8">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold flex items-center justify-center gap-3 text-gray-900 ${isRTL ? 'space-x-reverse' : ''}`}>
              <QrCode className="w-8 h-8 text-blue-600 flex-shrink-0" />
              {t.scanner.currentSession}
            </h2>
            <div className="mt-6 space-y-3">
              <p className={`text-gray-700 flex items-center justify-center gap-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <ClipboardCheck className="w-6 h-6 text-gray-500 flex-shrink-0" />
                {t.dashboard.inspector}: {currentForm.inspectorName}
              </p>
              <p className={`text-gray-700 flex items-center justify-center gap-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Building2 className="w-6 h-6 text-gray-500 flex-shrink-0" />
                {t.dashboard.area}: {areas.find(area => area.id === currentForm.areaId)?.name || ''}
              </p>
              <p className={`text-gray-700 flex items-center justify-center gap-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Clock className="w-6 h-6 text-gray-500 flex-shrink-0" />
                {t.dashboard.shift}: {t.dashboard[currentForm.shift as keyof typeof t.dashboard] || currentForm.shift}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <p className={`text-sm text-red-700 flex-grow ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className={`${isRTL ? 'mr-2' : 'ml-2'} p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100 transition-colors duration-200`}
                  title={t.common.refresh}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.dashboard.devicesInspected}
                </span>
                <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-blue-600'} ${isRTL ? 'text-left' : 'text-right'}`}>
                  {inspectedCount} / {totalDevices}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isComplete && (
                <div className={`mt-2 text-center text-sm font-medium text-green-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  🎉 {t.dashboard.completed}! כל המכשירים נבדקו
                </div>
              )}
            </div>

            <div className="bg-black rounded-xl overflow-hidden relative shadow-lg">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full"
                style={{ height: '320px', objectFit: 'cover' }}
              />
              {scanning && (
                <div className="absolute inset-0 border-4 border-blue-500 animate-pulse pointer-events-none rounded-xl">
                  <div className="absolute inset-0 bg-blue-500/10"></div>
                </div>
              )}
              <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <button
                  onClick={toggleCamera}
                  className="p-3 bg-white/90 rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  title={t.scanner.switchCamera}
                >
                  <Camera className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className="p-3 bg-white/90 rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  title={isScanning ? t.scanner.pauseScanner : t.scanner.resumeScanner}
                >
                  {isScanning ? (
                    <CameraOff className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </div>
            </div>

            <div className={`text-center text-base text-gray-600 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
              {isScanning ? t.scanner.pointCamera : t.scanner.scannerPaused}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate.push('/inspection/inspected')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 gap-3 group active:scale-95"
          >
            <ClipboardCheck className="w-8 h-8 text-green-600 group-hover:text-green-700 flex-shrink-0" />
            <span className="text-base font-semibold text-gray-700 text-center">{t.scanner.inspectedDevices}</span>
          </button>

          <button
            onClick={() => navigate.push('/inspection/uninspected')}
            className={`flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 gap-3 group active:scale-95 relative ${remainingDevices.length > 0 ? 'ring-2 ring-amber-200' : 'opacity-50'
              }`}
          >
            <ClipboardList className={`w-8 h-8 ${remainingDevices.length > 0 ? 'text-amber-600 group-hover:text-amber-700' : 'text-gray-400'} flex-shrink-0`} />
            <span className="text-base font-semibold text-gray-700 text-center">{t.scanner.pendingInspections}</span>
            {remainingDevices.length > 0 && (
              <div className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center`}>
                {remainingDevices.length}
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className={`w-full py-4 px-6 border border-gray-300 rounded-xl shadow-lg text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-xl active:scale-95 ${isRTL ? 'space-x-reverse' : ''}`}
        >
          {isFinishing ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
              {t.common.loading}
            </>
          ) : (
            <>
              <LogOut className="w-6 h-6 flex-shrink-0" />
              {t.scanner.finishInspection}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
