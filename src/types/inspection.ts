
export type Shift = 'morning' | 'afternoon' | 'evening';
export type InspectionType = 'routine' | 'maintenance' | 'repair';
export type BACheck = 'red' | 'yellow' | 'green';
export type InspectorRole = 'inspector' | 'manager';
export type UserRole = 'inspector' | 'admin' | 'master' | 'viewer';

export interface Unit {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Area {
  id: string;
  unitId: string;
  name: string;
  code: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspector {
  id: string;
  name: string;
  role: InspectorRole;
  unitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  unitId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: string;
  deviceNumber: string;
  location: string;
  baCheck: BACheck;
  managerNotes: string;
  areaId: string;
  unitId: string;
  lastInspected?: Date;
}

export interface InspectionForm {
  id: string;
  shift: Shift;
  inspectorName: string;
  areaId: string;
  unitId: string;
  startTime: Date;
  endTime?: Date;
  devices: InspectedDevice[];
  expectedDeviceCount: number;
}

export interface InspectedDevice extends Device {
  inspectionType: InspectionType;
  notes?: string;
  inspectedAt: Date;
}
