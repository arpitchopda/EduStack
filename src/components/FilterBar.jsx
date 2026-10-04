import { Filter, RotateCcw, Calendar, Building2, Award, Users } from 'lucide-react';

export default function FilterBar({ 
  availableBatches = [], 
  availableDepartments = [], 
  filters, 
  onFilterChange, 
  onResetFilters 
}) {
  const hasActiveFilters = filters.batch !== 'ALL' || filters.department !== 'ALL' || filters.cgpaBand !== 'ALL' || filters.gender !== 'ALL';

  return (
    <div className="bg-sand-50/80 dark:bg-storm-900/80 backdrop-blur-xl rounded-2xl p-5 border border-sand-200 dark:border-storm-800 shadow-sm mb-8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sand-200 dark:bg-storm-800 rounded-lg text-sand-700 dark:text-storm-300">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-sand-900 dark:text-storm-100 uppercase tracking-wider">
              Faculty Filter Controls
            </h3>
            <p className="text-xs text-sand-500 dark:text-storm-400">Segment analytics and rosters dynamically</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center space-x-1 text-xs font-semibold text-sand-600 dark:text-storm-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg bg-sand-200/50 dark:bg-storm-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Batch Filter */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-sand-600 dark:text-storm-400 mb-1 flex items-center gap-1">
            <Calendar size={13} />
            Academic Batch
          </label>
          <select
            value={filters.batch}
            onChange={(e) => onFilterChange('batch', e.target.value)}
            className="w-full bg-sand-100 dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-sand-600 dark:focus:ring-storm-500 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Batches</option>
            {availableBatches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-sand-600 dark:text-storm-400 mb-1 flex items-center gap-1">
            <Building2 size={13} />
            Department / Branch
          </label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="w-full bg-sand-100 dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-sand-600 dark:focus:ring-storm-500 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {availableDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* CGPA Band Filter */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-sand-600 dark:text-storm-400 mb-1 flex items-center gap-1">
            <Award size={13} />
            Performance Level
          </label>
          <select
            value={filters.cgpaBand}
            onChange={(e) => onFilterChange('cgpaBand', e.target.value)}
            className="w-full bg-sand-100 dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-sand-600 dark:focus:ring-storm-500 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Performance Levels</option>
            <option value="9-10">9.00 – 10.00 (O - Outstanding)</option>
            <option value="8-9">8.00 – 8.99 (A+ - Excellent)</option>
            <option value="7-8">7.00 – 7.99 (A - Very Good)</option>
            <option value="6-7">6.00 – 6.99 (B+ - Good)</option>
            <option value="5.5-6">5.50 – 5.99 (B - Above Average)</option>
            <option value="5-5.5">5.00 – 5.49 (C - Average)</option>
            <option value="4-5">4.00 – 4.99 (P - Pass)</option>
            <option value="0-4">Below 4.00 (F - Fail)</option>
            <option value="DROP">Dropped / Missing (DROP)</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-sand-600 dark:text-storm-400 mb-1 flex items-center gap-1">
            <Users size={13} />
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="w-full bg-sand-100 dark:bg-storm-950 border border-sand-300 dark:border-storm-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-sand-900 dark:text-storm-100 focus:ring-2 focus:ring-sand-600 dark:focus:ring-storm-500 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-storm-800/60 flex flex-wrap items-center gap-2">
          <span className="text-xs text-sand-500 dark:text-storm-500 font-medium">Active Filters:</span>
          {filters.batch !== 'ALL' && (
            <span className="px-2.5 py-1 bg-sand-700 dark:bg-storm-700 text-white rounded-full text-xs font-medium">
              Batch: {filters.batch}
            </span>
          )}
          {filters.department !== 'ALL' && (
            <span className="px-2.5 py-1 bg-sand-700 dark:bg-storm-700 text-white rounded-full text-xs font-medium">
              Dept: {filters.department}
            </span>
          )}
          {filters.cgpaBand !== 'ALL' && (
            <span className="px-2.5 py-1 bg-sand-700 dark:bg-storm-700 text-white rounded-full text-xs font-medium">
              CGPA: {filters.cgpaBand}
            </span>
          )}
          {filters.gender !== 'ALL' && (
            <span className="px-2.5 py-1 bg-sand-700 dark:bg-storm-700 text-white rounded-full text-xs font-medium">
              Gender: {filters.gender}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
