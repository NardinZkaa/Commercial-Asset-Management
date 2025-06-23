import { useMemo } from 'react';
import { dashboardData } from '../data/dashboardData';
import { DashboardData, FilterType, BranchType, StatusType } from '../types/dashboard';

export function useFilteredData(category: FilterType, branch: BranchType, status: StatusType): DashboardData {
  return useMemo(() => {
    let data = JSON.parse(JSON.stringify(dashboardData[category === 'all' ? 'all' : category])) as DashboardData;

    // Apply branch filter
    if (branch !== 'all') {
      data.ownershipChanges = data.ownershipChanges.filter(item => item.branch === branch);
      data.ownershipPeriod = data.ownershipPeriod.filter(item => item.branch === branch);
      
      // Scale down asset status data for specific branch
      const scaleFactor = 0.3;
      data.assetStatus = data.assetStatus.map(item => ({
        status: item.status,
        count: Math.round(item.count * scaleFactor)
      }));
      
      // Adjust lifecycle percentages
      data.lifecycle = {
        ...data.lifecycle,
        inUse: Math.round(data.lifecycle.inUse * 0.9),
        underMaintenance: Math.round(data.lifecycle.underMaintenance * 1.1),
        retired: Math.round(data.lifecycle.retired * 1.2)
      };
    }

    // Apply status filter
    if (status !== 'all') {
      data.assetStatus = data.assetStatus.filter(item => item.status === status);
      data.lifecycle = {
        inUse: status === 'Active' ? 100 : 0,
        underMaintenance: status === 'Under Maintenance' ? 100 : 0,
        retired: status === 'Retired' ? 100 : 0,
        avgLifespanYears: data.lifecycle.avgLifespanYears
      };
    }

    return data;
  }, [category, branch, status]);
}