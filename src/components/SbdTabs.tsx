import React from 'react';

export type TabKey =
  | 'general'
  | 'specs'
  | 'components'
  | 'valuation'
  | 'remarks'
  | 'photos'
  | 'signatures'
  | 'overrides'
  | 'preview';

interface SbdTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const SbdTabs: React.FC<SbdTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'general', label: '1 · General & Ownership' },
    { key: 'specs', label: '2 · Vehicle Specs' },
    { key: 'components', label: '3 · Component Inspection' },
    { key: 'valuation', label: '4 · Valuation & Depreciation' },
    { key: 'remarks', label: '5 · Technical Remarks' },
    { key: 'photos', label: '6 · Photographic Evidence' },
    { key: 'signatures', label: '7 · Signatures & Stamp' },
    { key: 'overrides', label: '8 · Custom Sections & Blocks' },
    { key: 'preview', label: '9 · Document Preview & Live Edit' },
  ];

  return (
    <nav className="sbd-tabs no-print" id="tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTabChange(t.key)}
          className={activeTab === t.key ? 'active' : ''}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
};
