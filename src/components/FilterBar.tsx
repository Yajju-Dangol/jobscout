import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { FilterState, CATEGORIES } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalJobs: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeAdvancedCount = 
    (filters.category !== 'All Categories' ? 1 : 0) +
    (filters.minSimilarity > 0 ? 1 : 0) +
    (filters.sortBy !== 'similarity' ? 1 : 0);

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.category !== 'All Categories' ||
    filters.remoteOnly !== false ||
    filters.minSimilarity > 0 ||
    filters.sortBy !== 'similarity';

  return (
    <div className="w-full bg-[#0f0f0f] p-3 sm:p-4 rounded-2xl border border-[#1c1c1c] shadow-sm space-y-3">
      {/* Primary Top Bar: Search Input, Remote Toggle & Filters Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Search Input */}
        <div className="flex-1 min-w-0 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by job title, company, or tech stack..."
            className="w-full bg-[#141414] border border-[#222222] hover:border-[#333333] focus:border-slate-400 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Remote Only Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange({ remoteOnly: !filters.remoteOnly })}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer select-none ${
              filters.remoteOnly
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-[#141414] border-[#222222] text-slate-300 hover:text-white hover:border-[#333333]'
            }`}
          >
            <span>Remote Only</span>
            <div
              className={`w-6 h-3.5 rounded-full relative transition-colors ${
                filters.remoteOnly ? 'bg-black' : 'bg-[#2a2a2a]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${
                  filters.remoteOnly ? 'bg-white right-0.5' : 'bg-slate-400 left-0.5'
                }`}
              />
            </div>
          </button>

          {/* Filters Toggle Button right beside Remote toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              showFilters || activeAdvancedCount > 0
                ? 'bg-[#1c1c1c] text-white border-[#333333]'
                : 'bg-[#141414] border-[#222222] text-slate-300 hover:text-white hover:border-[#333333]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeAdvancedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#c8c2ac] text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {activeAdvancedCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Collapsible Filters Tray */}
      {showFilters && (
        <div className="pt-3 border-t border-[#1a1a1a] space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Category Dropdown */}
            <div className="sm:col-span-4 relative">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Role Category</label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="w-full appearance-none bg-[#141414] border border-[#222222] hover:border-[#333333] focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer pr-8"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0f0f0f] text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-4 relative">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Sort Order</label>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                  className="w-full appearance-none bg-[#141414] border border-[#222222] hover:border-[#333333] focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer pr-8"
                >
                  <option value="similarity" className="bg-[#0f0f0f] text-slate-200">Match Accuracy</option>
                  <option value="recent" className="bg-[#0f0f0f] text-slate-200">Most Recent</option>
                  <option value="salary" className="bg-[#0f0f0f] text-slate-200">Highest Salary</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Reset Action */}
            <div className="sm:col-span-4 flex items-end sm:justify-end h-full pt-4 sm:pt-0">
              {isFiltered && (
                <button
                  onClick={onResetFilters}
                  className="text-xs text-[#c8c2ac] hover:underline font-medium cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Accuracy Filter Pills */}
          <div className="pt-2 border-t border-[#1a1a1a]">
            <label className="block text-[11px] font-medium text-slate-400 mb-2">Match Accuracy Threshold</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'All (0%)', val: 0 },
                { label: '≥50% Broad', val: 50 },
                { label: '≥70% Good', val: 70 },
                { label: '≥80% High', val: 80 },
                { label: '≥90% Exact', val: 90 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onFilterChange({ minSimilarity: item.val })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filters.minSimilarity === item.val
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#141414] border border-[#222222] text-slate-400 hover:text-white hover:border-[#333333]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
