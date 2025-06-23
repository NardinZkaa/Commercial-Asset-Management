import { DashboardData } from '../types/dashboard';

export const dashboardData: Record<string, DashboardData> = {
  all: {
    lifecycle: { inUse: 75, underMaintenance: 15, retired: 10, avgLifespanYears: 5 },
    assetStatus: [
      { status: "Active", count: 120 },
      { status: "Inactive", count: 30 },
      { status: "Under Maintenance", count: 20 },
      { status: "Retired", count: 10 }
    ],
    ownershipChanges: [
      { branch: "Main Branch", count: 15 },
      { branch: "North Branch", count: 8 },
      { branch: "East Branch", count: 5 }
    ],
    ownershipPeriod: [
      { branch: "Main Branch", avgPeriod: 3.5 },
      { branch: "North Branch", avgPeriod: 2.8 },
      { branch: "East Branch", avgPeriod: 4.0 }
    ]
  },
  Electronics: {
    lifecycle: { inUse: 80, underMaintenance: 10, retired: 10, avgLifespanYears: 4 },
    assetStatus: [
      { status: "Active", count: 80 },
      { status: "Inactive", count: 10 },
      { status: "Under Maintenance", count: 5 },
      { status: "Retired", count: 5 }
    ],
    ownershipChanges: [
      { branch: "Main Branch", count: 10 },
      { branch: "North Branch", count: 5 },
      { branch: "East Branch", count: 3 }
    ],
    ownershipPeriod: [
      { branch: "Main Branch", avgPeriod: 3.0 },
      { branch: "North Branch", avgPeriod: 2.5 },
      { branch: "East Branch", avgPeriod: 3.8 }
    ]
  },
  Furniture: {
    lifecycle: { inUse: 70, underMaintenance: 20, retired: 10, avgLifespanYears: 6 },
    assetStatus: [
      { status: "Active", count: 35 },
      { status: "Inactive", count: 5 },
      { status: "Under Maintenance", count: 5 },
      { status: "Retired", count: 5 }
    ],
    ownershipChanges: [
      { branch: "Main Branch", count: 4 },
      { branch: "North Branch", count: 2 },
      { branch: "East Branch", count: 1 }
    ],
    ownershipPeriod: [
      { branch: "Main Branch", avgPeriod: 4.0 },
      { branch: "North Branch", avgPeriod: 3.0 },
      { branch: "East Branch", avgPeriod: 4.5 }
    ]
  },
  Vehicles: {
    lifecycle: { inUse: 60, underMaintenance: 30, retired: 10, avgLifespanYears: 7 },
    assetStatus: [
      { status: "Active", count: 12 },
      { status: "Inactive", count: 2 },
      { status: "Under Maintenance", count: 4 },
      { status: "Retired", count: 2 }
    ],
    ownershipChanges: [
      { branch: "Main Branch", count: 3 },
      { branch: "North Branch", count: 1 },
      { branch: "East Branch", count: 1 }
    ],
    ownershipPeriod: [
      { branch: "Main Branch", avgPeriod: 5.0 },
      { branch: "North Branch", avgPeriod: 4.0 },
      { branch: "East Branch", avgPeriod: 5.5 }
    ]
  }
};