import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DepartmentObjective,
  PositionInfo,
  TeamMember,
  Responsibility,
  KPI,
  ControlDataPoint,
  PositionId,
  FrequencyType,
  TaskStatus,
  RoleSheetEntry,
} from '../types/dwm';
import {
  departmentInfo as defaultDept,
  initialPositions as defaultPositions,
  initialTeamMembers as defaultMembers,
  initialResponsibilities as defaultResponsibilities,
  initialKPIs as defaultKPIs,
  generateInitialControlPoints,
  generateInitialRoleSheetEntries,
} from '../data/initialData';

export type AppView =
  | 'organogram'
  | 'rolesheets'
  | 'kpitree'
  | 'controlgraph'
  | 'stability_matrix'
  | 'checksheet';

interface DwmContextType {
  department: DepartmentObjective;
  positions: PositionInfo[];
  teamMembers: TeamMember[];
  responsibilities: Responsibility[];
  kpis: KPI[];
  controlPoints: ControlDataPoint[];
  roleSheetEntries: RoleSheetEntry[];
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedPositionId: PositionId;
  setSelectedPositionId: (posId: PositionId) => void;
  selectedKpiId: string;
  setSelectedKpiId: (kpiId: string) => void;
  selectedMemberId: string | 'all';
  setSelectedMemberId: (memberId: string | 'all') => void;
  controlGraphFrequency: FrequencyType;
  setControlGraphFrequency: (freq: FrequencyType) => void;
  toast: { title: string; message: string; timestamp: number } | null;
  clearToast: () => void;
  reassignKpiPosition: (
    kpiId: string,
    targetPositionId: PositionId,
    newParentKpiId?: string | null
  ) => void;
  updateResponsibilityStatus: (
    respId: string,
    status: TaskStatus,
    notes?: string
  ) => void;
  addResponsibility: (newResp: Omit<Responsibility, 'id' | 'sNo'>) => void;
  addControlPoint: (point: Omit<ControlDataPoint, 'id'>) => void;
  updateControlPoint: (pointId: string, updates: Partial<ControlDataPoint>) => void;
  deleteControlPoint: (pointId: string) => void;
  updatePosition: (posId: PositionId, updates: Partial<PositionInfo>) => void;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => void;
  addTeamMember: (newMember: Omit<TeamMember, 'id'>) => void;
  deleteTeamMember: (memberId: string) => void;
  updateResponsibility: (respId: string, updates: Partial<Responsibility>) => void;
  deleteResponsibility: (respId: string) => void;
  updateKpi: (kpiId: string, updates: Partial<KPI>) => void;
  addKpi: (newKpi: Omit<KPI, 'id'>) => void;
  deleteKpi: (kpiId: string) => void;
  updateRoleSheetEntry: (id: string, updates: Partial<RoleSheetEntry>) => void;
  addRoleSheetEntry: (entry: Omit<RoleSheetEntry, 'id'>) => void;
  deleteRoleSheetEntry: (id: string) => void;
  resetToDefaults: () => void;
  getKpisForPosition: (posId: PositionId) => KPI[];
  getResponsibilitiesForPosition: (posId: PositionId) => Responsibility[];
  getTeamMembersForPosition: (posId: PositionId) => TeamMember[];
  navigateToPositionRoleSheet: (posId: PositionId) => void;
  navigateToControlGraphForKpi: (kpiId: string, posId?: PositionId, memberId?: string) => void;
}

const DwmContext = createContext<DwmContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'kauvery_dwm_v1_';

export const DwmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [department] = useState<DepartmentObjective>(defaultDept);

  const [positions, setPositions] = useState<PositionInfo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}positions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultPositions;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}members`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultMembers;
  });

  const [responsibilities, setResponsibilities] = useState<Responsibility[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}responsibilities`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultResponsibilities;
  });

  const [kpis, setKpis] = useState<KPI[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}kpis`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return defaultKPIs;
  });

  const [controlPoints, setControlPoints] = useState<ControlDataPoint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}points`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialControlPoints();
  });

  const [roleSheetEntries, setRoleSheetEntries] = useState<RoleSheetEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}role_entries`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialRoleSheetEntries();
  });

  const [activeView, setActiveView] = useState<AppView>('organogram');
  const [selectedPositionId, setSelectedPositionId] = useState<PositionId>('billing_incharge');
  const [selectedKpiId, setSelectedKpiId] = useState<string>('kpi_inc_1');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [controlGraphFrequency, setControlGraphFrequency] = useState<FrequencyType>('Daily');
  const [toast, setToast] = useState<{ title: string; message: string; timestamp: number } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}positions`, JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}members`, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}kpis`, JSON.stringify(kpis));
  }, [kpis]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}responsibilities`, JSON.stringify(responsibilities));
  }, [responsibilities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}points`, JSON.stringify(controlPoints));
  }, [controlPoints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}role_entries`, JSON.stringify(roleSheetEntries));
  }, [roleSheetEntries]);

  const clearToast = () => setToast(null);

  const getKpisForPosition = (posId: PositionId) => {
    return kpis.filter((k) => k.positionId === posId);
  };

  const getResponsibilitiesForPosition = (posId: PositionId) => {
    return responsibilities.filter((r) => r.positionId === posId);
  };

  const getTeamMembersForPosition = (posId: PositionId) => {
    return teamMembers.filter((m) => m.positionId === posId);
  };

  // Position updates
  const updatePosition = (posId: PositionId, updates: Partial<PositionInfo>) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === posId ? { ...p, ...updates } : p))
    );
    setToast({
      title: updates.isFinalized ? 'Organogram Finalised' : 'Position Updated',
      message: `${updates.title || posId} details successfully updated.`,
      timestamp: Date.now(),
    });
  };

  // Staff / Team Member updates
  const updateTeamMember = (memberId: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
    setToast({
      title: 'Staff Record Updated',
      message: `Staff member ${updates.name || memberId} details updated.`,
      timestamp: Date.now(),
    });
  };

  const addTeamMember = (newMember: Omit<TeamMember, 'id'>) => {
    const id = `mem_${Date.now()}`;
    const member: TeamMember = { ...newMember, id };
    setTeamMembers((prev) => [...prev, member]);
    // Also update position headcount
    setPositions((prev) =>
      prev.map((p) =>
        p.id === newMember.positionId ? { ...p, headcount: p.headcount + 1 } : p
      )
    );
    setToast({
      title: 'Staff Member Assigned',
      message: `${newMember.name} (Emp No: ${newMember.employeeCode}) assigned to team.`,
      timestamp: Date.now(),
    });
  };

  const deleteTeamMember = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    setPositions((prev) =>
      prev.map((p) =>
        p.id === member.positionId
          ? { ...p, headcount: Math.max(0, p.headcount - 1) }
          : p
      )
    );
    setToast({
      title: 'Staff Member Removed',
      message: `${member.name} removed from roster.`,
      timestamp: Date.now(),
    });
  };

  // Responsibility updates
  const updateResponsibility = (respId: string, updates: Partial<Responsibility>) => {
    setResponsibilities((prev) =>
      prev.map((r) => (r.id === respId ? { ...r, ...updates } : r))
    );
    setToast({
      title: 'Role Sheet Updated',
      message: `Responsibility updated in role sheet.`,
      timestamp: Date.now(),
    });
  };

  const deleteResponsibility = (respId: string) => {
    setResponsibilities((prev) => prev.filter((r) => r.id !== respId));
    setToast({
      title: 'Responsibility Removed',
      message: 'Item deleted from role sheet.',
      timestamp: Date.now(),
    });
  };

  // KPI updates
  const updateKpi = (kpiId: string, updates: Partial<KPI>) => {
    setKpis((prev) =>
      prev.map((k) => (k.id === kpiId ? { ...k, ...updates } : k))
    );
    setToast({
      title: 'KPI & Role Sheet Updated',
      message: `KPI "${updates.name || kpiId}" specifications and limits updated.`,
      timestamp: Date.now(),
    });
  };

  const addKpi = (newKpi: Omit<KPI, 'id'>) => {
    const id = `kpi_${Date.now()}`;
    const kpi: KPI = { ...newKpi, id };
    setKpis((prev) => [...prev, kpi]);
    setToast({
      title: 'New KPI Created',
      message: `"${newKpi.name}" created and added to Role Sheet & KPI Tree.`,
      timestamp: Date.now(),
    });
  };

  const deleteKpi = (kpiId: string) => {
    const target = kpis.find((k) => k.id === kpiId);
    setKpis((prev) => prev.filter((k) => k.id !== kpiId));
    setToast({
      title: 'KPI Removed',
      message: target ? `"${target.name}" removed from Role Sheet.` : 'KPI deleted.',
      timestamp: Date.now(),
    });
  };

  // Control points editing
  const updateControlPoint = (pointId: string, updates: Partial<ControlDataPoint>) => {
    setControlPoints((prev) =>
      prev.map((pt) => (pt.id === pointId ? { ...pt, ...updates } : pt))
    );
    setToast({
      title: 'Actual Value Updated',
      message: 'Control graph updated in real time.',
      timestamp: Date.now(),
    });
  };

  const deleteControlPoint = (pointId: string) => {
    setControlPoints((prev) => prev.filter((pt) => pt.id !== pointId));
    setToast({
      title: 'Reading Deleted',
      message: 'Control graph updated in real time.',
      timestamp: Date.now(),
    });
  };

  // Role Sheet Entries CRUD
  const updateRoleSheetEntry = (id: string, updates: Partial<RoleSheetEntry>) => {
    setRoleSheetEntries((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          // If kpiId or matching kpi exists and target or direction was updated, sync kpi
          if (updates.target !== undefined || updates.direction !== undefined) {
            const targetKpiId = updated.kpiId;
            if (targetKpiId) {
              setKpis((prevKpis) =>
                prevKpis.map((k) =>
                  k.id === targetKpiId
                    ? {
                        ...k,
                        ...(updates.target !== undefined ? { target: updates.target } : {}),
                        ...(updates.direction !== undefined ? { direction: updates.direction } : {}),
                      }
                    : k
                )
              );
            }
          }
          return updated;
        }
        return r;
      })
    );
    setToast({
      title: 'Role Sheet Updated',
      message: `Role sheet entry #${updates.sNo || ''} modified successfully.`,
      timestamp: Date.now(),
    });
  };

  const addRoleSheetEntry = (entry: Omit<RoleSheetEntry, 'id'>) => {
    const id = `rse_${Date.now()}`;
    const newEntry: RoleSheetEntry = { ...entry, id };
    setRoleSheetEntries((prev) => [...prev, newEntry]);
    setToast({
      title: 'Role Sheet Entry Added',
      message: `Added row for ${entry.roles} (${entry.kpi}).`,
      timestamp: Date.now(),
    });
  };

  const deleteRoleSheetEntry = (id: string) => {
    setRoleSheetEntries((prev) => prev.filter((r) => r.id !== id));
    setToast({
      title: 'Role Sheet Entry Removed',
      message: 'Row deleted from role sheet.',
      timestamp: Date.now(),
    });
  };

  // Reassign KPI Position (triggered when user drags & drops in KPI Tree or reassigns)
  const reassignKpiPosition = (
    kpiId: string,
    targetPositionId: PositionId,
    newParentKpiId?: string | null
  ) => {
    const targetKpi = kpis.find((k) => k.id === kpiId);
    if (!targetKpi) return;

    const oldPos = positions.find((p) => p.id === targetKpi.positionId);
    const newPos = positions.find((p) => p.id === targetPositionId);

    if (targetKpi.positionId === targetPositionId && targetKpi.parentKpiId === newParentKpiId) {
      return; // No change
    }

    setKpis((prev) =>
      prev.map((k) => {
        if (k.id === kpiId) {
          return {
            ...k,
            positionId: targetPositionId,
            ...(newParentKpiId !== undefined ? { parentKpiId: newParentKpiId } : {}),
          };
        }
        return k;
      })
    );

    const oldTitle = oldPos ? oldPos.shortTitle : 'Previous Position';
    const newTitle = newPos ? newPos.shortTitle : 'Target Position';

    setToast({
      title: 'KPI Hierarchy & Role Sheet Synchronized',
      message: `"${targetKpi.name}" has been transferred from [${oldTitle}] to [${newTitle}]. Both Role Sheets and the KPI Tree were dynamically updated.`,
      timestamp: Date.now(),
    });
  };

  const updateResponsibilityStatus = (
    respId: string,
    status: TaskStatus,
    notes?: string
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setResponsibilities((prev) =>
      prev.map((r) =>
        r.id === respId
          ? {
              ...r,
              currentStatus: status,
              lastCheckedAt: `Today, ${nowStr}`,
              ...(notes ? { notes } : {}),
            }
          : r
      )
    );
  };

  const addResponsibility = (newResp: Omit<Responsibility, 'id' | 'sNo'>) => {
    const currentForPos = getResponsibilitiesForPosition(newResp.positionId);
    const sNo = currentForPos.length + 1;
    const item: Responsibility = {
      ...newResp,
      id: `resp_custom_${Date.now()}`,
      sNo,
    };
    setResponsibilities((prev) => [...prev, item]);
    setToast({
      title: 'Responsibility Added',
      message: `Added new responsibility to ${newResp.positionId} Role Sheet.`,
      timestamp: Date.now(),
    });
  };

  const addControlPoint = (point: Omit<ControlDataPoint, 'id'>) => {
    const newPt: ControlDataPoint = {
      ...point,
      id: `pt_${Date.now()}`,
    };
    setControlPoints((prev) => [newPt, ...prev]);
    setToast({
      title: 'Control Graph Updated',
      message: `Logged new data point: ${point.value} for ${point.periodType} tracking.`,
      timestamp: Date.now(),
    });
  };

  const resetToDefaults = () => {
    setPositions(defaultPositions);
    setTeamMembers(defaultMembers);
    setResponsibilities(defaultResponsibilities);
    setKpis(defaultKPIs);
    setRoleSheetEntries(generateInitialRoleSheetEntries());
    setControlPoints(generateInitialControlPoints());
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}kpis`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}responsibilities`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}role_entries`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}points`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}positions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}members`);
    setToast({
      title: 'Reset to Hospital Default Structure',
      message: 'All Role Sheets, Organogram, and KPI Tree restored to default standard.',
      timestamp: Date.now(),
    });
  };

  const navigateToPositionRoleSheet = (posId: PositionId) => {
    setSelectedPositionId(posId);
    setActiveView('rolesheets');
  };

  const navigateToControlGraphForKpi = (
    kpiId: string,
    posId?: PositionId,
    memberId?: string
  ) => {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (kpi) {
      setSelectedKpiId(kpiId);
      if (posId) setSelectedPositionId(posId);
      else setSelectedPositionId(kpi.positionId);
    }
    if (memberId) {
      setSelectedMemberId(memberId);
    }
    setActiveView('controlgraph');
  };

  return (
    <DwmContext.Provider
      value={{
        department,
        positions,
        teamMembers,
        responsibilities,
        kpis,
        controlPoints,
        roleSheetEntries,
        activeView,
        setActiveView,
        selectedPositionId,
        setSelectedPositionId,
        selectedKpiId,
        setSelectedKpiId,
        selectedMemberId,
        setSelectedMemberId,
        controlGraphFrequency,
        setControlGraphFrequency,
        toast,
        clearToast,
        reassignKpiPosition,
        updateResponsibilityStatus,
        addResponsibility,
        updateResponsibility,
        deleteResponsibility,
        addKpi,
        updateKpi,
        deleteKpi,
        addRoleSheetEntry,
        updateRoleSheetEntry,
        deleteRoleSheetEntry,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        updatePosition,
        addControlPoint,
        updateControlPoint,
        deleteControlPoint,
        resetToDefaults,
        getKpisForPosition,
        getResponsibilitiesForPosition,
        getTeamMembersForPosition,
        navigateToPositionRoleSheet,
        navigateToControlGraphForKpi,
      }}
    >
      {children}
    </DwmContext.Provider>
  );
};

export const useDwm = () => {
  const context = useContext(DwmContext);
  if (!context) {
    throw new Error('useDwm must be used within a DwmProvider');
  }
  return context;
};
