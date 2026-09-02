import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  minSimilarity: number;
  onAccuracyChange: (val: number) => void;
  onSaveToast: (title: string, desc: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  minSimilarity,
  onAccuracyChange,
  onSaveToast
}) => {
  const [localAccuracy, setLocalAccuracy] = useState<number>(minSimilarity);

  useEffect(() => {
    setLocalAccuracy(minSimilarity);
  }, [minSimilarity, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onAccuracyChange(localAccuracy);
    onSaveToast(
      'Accuracy Threshold Updated',
      localAccuracy > 0 
        ? `Jobs feed will strictly filter to postings matching at least ${localAccuracy}% accuracy.`
        : 'Jobs feed will show all matches.'
    );
    onClose();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalAccuracy(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in divide-y divide-[#1f1f1f]">
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#c8c2ac]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Matcher Settings</h3>
              <p className="text-xs text-slate-400">Configure AI matching accuracy cutoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Section: Accuracy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#c8c2ac]" />
                <span className="text-sm font-semibold">Accuracy</span>
              </span>
              <span className="font-mono font-bold text-[#c8c2ac] bg-[#c8c2ac]/10 px-2.5 py-1 rounded-lg border border-[#c8c2ac]/30 text-xs shadow-sm">
                {localAccuracy === 0 ? 'All Fits (0%)' : `${localAccuracy}% Minimum`}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Set the minimum semantic vector and technical skill alignment threshold. Job postings scoring below this value will be excluded from your feed.
            </p>

            {/* Slider */}
            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={localAccuracy}
                onChange={handleSliderChange}
                className="w-full h-2.5 bg-[#000000] border border-[#1f1f1f] rounded-lg appearance-none cursor-pointer accent-[#c8c2ac]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <button
                  type="button"
                  onClick={() => setLocalAccuracy(0)}
                  className={`hover:text-white transition-colors cursor-pointer ${localAccuracy === 0 ? 'text-[#c8c2ac] font-bold' : ''}`}
                >
                  0% (All Fits)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalAccuracy(50)}
                  className={`hover:text-white transition-colors cursor-pointer ${localAccuracy === 50 ? 'text-[#c8c2ac] font-bold' : ''}`}
                >
                  50% (Broad)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalAccuracy(75)}
                  className={`hover:text-white transition-colors cursor-pointer ${localAccuracy === 75 ? 'text-[#c8c2ac] font-bold' : ''}`}
                >
                  75% (Balanced)
                </button>
                <button
                  type="button"
                  onClick={() => setLocalAccuracy(90)}
                  className={`hover:text-white transition-colors cursor-pointer ${localAccuracy === 90 ? 'text-[#c8c2ac] font-bold' : ''}`}
                >
                  90% (Top Tier)
                </button>
              </div>
            </div>

            {/* Live Filter Indicator Box */}
            <div className="p-3.5 rounded-xl bg-[#000000] border border-[#1f1f1f] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#c8c2ac] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-200 font-semibold">Active Filter Integration</p>
                <p>
                  {localAccuracy === 0 ? (
                    'Currently showing all jobs ranked by similarity.'
                  ) : (
                    <>
                      Only jobs with at least <strong className="text-white font-bold">{localAccuracy}%</strong> compatibility with <span className="text-[#c8c2ac]">{profile.targetJobTitle || profile.currentTitle || 'your profile'}</span> will be displayed.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f0f0f] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
