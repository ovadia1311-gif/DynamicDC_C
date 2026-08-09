
import React from 'react';
import { Building2 } from 'lucide-react';
import { useInspectionStore } from '../../store/inspectionStore';
import { useTranslation } from '../../i18n/useTranslations';

interface UnitSelectorProps {
  className?: string;
}

export default function UnitSelector({ className = '' }: UnitSelectorProps) {
  const { t, isRTL } = useTranslation();
  const {
    units,
    selectUnitAndReload,
    selectedUnitId,
    setSelectedUnit,
    currentUser,
    isMaster,
    loadAreas,
    loadInspectors,
    loadAllDevices,
    loadForms
  } = useInspectionStore();

  // Only show for master users
  if (!currentUser || !isMaster()) {
    return null;
  }

  const handleUnitChange = async (unitId: string) => {
    const newUnitId = unitId === 'all' ? null : unitId;
    setSelectedUnit(newUnitId);

    // Reload data for the selected unit
    await Promise.all([
      loadAreas(),
      loadInspectors(),
      loadAllDevices(),
      loadForms()
    ]);
  };

  return (
    <div className={`flex items-center space-x-3 ${className} ${isRTL ? 'space-x-reverse' : ''}`}>
      <Building2 className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <select
        value={selectedUnitId || 'all'}
        onChange={(e) => selectUnitAndReload(e.target.value)}
        className={`text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <option value="all">{t.dashboard.allUnits}</option>
        {units.map((unit: any) => (
          <option key={unit.id} value={unit.id}>{unit.name}</option>
        ))}
      </select>
    </div>
  );
}
