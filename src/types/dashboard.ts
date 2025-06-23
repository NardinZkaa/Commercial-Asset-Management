export interface AssetStatus {
  status: string;
  count: number;
}

export interface OwnershipChange {
  branch: string;
  count: number;
}

export interface OwnershipPeriod {
  branch: string;
  avgPeriod: number;
}

export interface Lifecycle {
  inUse: number;
  underMaintenance: number;
  retired: number;
  avgLifespanYears: number;
}

export interface DashboardData {
  lifecycle: Lifecycle;
  assetStatus: AssetStatus[];
  ownershipChanges: OwnershipChange[];
  ownershipPeriod: OwnershipPeriod[];
}

export type FilterType = 'all' | 'Electronics' | 'Furniture' | 'Vehicles';
export type BranchType = 'all' | 'Main Branch' | 'North Branch' | 'East Branch';
export type StatusType = 'all' | 'Active' | 'Inactive' | 'Under Maintenance' | 'Retired';