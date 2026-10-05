import React from 'react';
import { useDwm } from '../context/DwmContext';
import {
  Calendar,
  Users,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  onOpenLogModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogModal }) => {
  const { activeView, positions, resetToDefaults } = useDwm();

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'organogram':
        return 'Department Organogram & Headcount';
      case 'rolesheets':
        return 'Daily Routine Management (DRM) Role Sheets';
      case 'kpitree':
        return 'Left-to-Right Hierarchical KPI Tree';
      case 'controlgraph':
        return 'Statistical Process Control (SPC) Graphs';
      case 'stability_matrix':
        return 'Stability vs. Capability 2×2 Matrix';
      case 'checksheet':
        return 'Daily Routine Shift Checksheet';
      default:
        return 'Billing Operations';
    }
  };

  const totalHeadcount = positions.reduce((acc, p) => acc + p.headcount, 0);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Contextual Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-800">
            Kauvery Hospital Billing
          </span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-blue-700 font-bold">{getBreadcrumb()}</span>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-slate-500 font-mono text-[11px] pr-2">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalHeadcount} Total Staff</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Shift: General &amp; Morning A</span>
            </span>
          </div>

          <button
            onClick={resetToDefaults}
            title="Reset to hospital default structure"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Log Reading</span>
          </button>
        </div>
      </div>
    </header>
  );
};
