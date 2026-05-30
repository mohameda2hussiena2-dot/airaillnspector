/**
 * Types for Railway Track Vision
 */

export enum DefectType {
  CRACK = 'CRACK',
  EROSION = 'EROSION',
  MISSING_BOLT = 'MISSING_BOLT',
  WEAR = 'WEAR',
  VEGETATION = 'VEGETATION',
  CORROSION = 'CORROSION',
  TRACK_MISALIGNMENT = 'TRACK_MISALIGNMENT',
  DEBRIS = 'DEBRIS'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedDefect {
  id: string;
  type: DefectType;
  severity: Severity;
  confidence: number;
  description: string;
  box: BoundingBox;
}

export interface GPSLocation {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface TrackInspection {
  id: string;
  timestamp: string;
  imageUrl: string;
  location: GPSLocation;
  defects: DetectedDefect[];
  summary: string;
  reviewed?: boolean;
  isFastScan?: boolean;
}

export interface UserPermissions {
  pageAccess: string[]; // ['dashboard', 'map', 'logs', 'tasks', 'reports', 'live', 'admin-users']
  actions: {
    canDownload: boolean;
    canUpload: boolean;
  };
  isAdmin: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: UserPermissions;
  isCustom?: boolean;
}

export interface User {
  id: string | number;
  email: string;
  username: string;
  roleId?: string;
  permissions: UserPermissions;
  profile_picture?: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  department?: string;
}
