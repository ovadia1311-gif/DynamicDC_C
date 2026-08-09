// src/components2/shared/UnitSelector.tsx
import React from 'react';
import { Building2 } from 'lucide-react';
import { useInspectionStore } from '../../store/inspectionStore';

/**
 * בורר יחידה מוצג למאסטר בלבד.
 *
 * user / admin מקובעים ל-unitId שלהם ואין להם אפשרות להחליף יחידה.
 * מאסטר מבצע selectUnitAndReload ולכן כל הנתונים של היחידה הקודמת
 * מתנקים ונטענים מחדש לפי היחידה החדשה.
 */
export default function UnitSelector() {
  const currentUser = useInspectionStore((state) => state.currentUser);
  const units = useInspectionStore((state) => state.units);
  const selectedUnitId = useInspectionStore((state) => state.selectedUnitId);
  const selectUnitAndReload = useInspectionStore(
    (state) => state.selectUnitAndReload
  );
  const isLoading = useInspectionStore((state) => state.isLoading);

  const role = String(currentUser?.role ?? '')
    .trim()
    .toLowerCase();

  if (!currentUser || role !== 'master') {
    return null;
  }

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const unitId = event.target.value;
    if (!unitId || unitId === selectedUnitId) return;
    await selectUnitAndReload(unitId);
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <select
        aria-label="בחר יחידה"
        value={selectedUnitId ?? ''}
        onChange={handleChange}
        disabled={isLoading || units.length === 0}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {selectedUnitId === null && (
          <option value="" disabled>
            בחר יחידה
          </option>
        )}

        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name}
          </option>
        ))}
      </select>
    </div>
  );
}
