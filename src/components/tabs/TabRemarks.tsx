import React from 'react';
import { ValuationDocument, ListBlock } from '../../types/document';

interface TabRemarksProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
}

export const TabRemarks: React.FC<TabRemarksProps> = ({ document, onUpdateDocument }) => {
  const obsSec = document.sections.find((s) => s.id === 'sec-observations');
  const obsList = obsSec?.blocks.find((b) => b.type === 'list') as ListBlock | undefined;

  const items = obsList?.items || [];

  const handleItemChange = (idx: number, val: string) => {
    if (!obsSec || !obsList) return;
    const newItems = [...items];
    newItems[idx] = val;

    const newBlocks = obsSec.blocks.map((b) => (b.id === obsList.id ? { ...obsList, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === obsSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleAddItem = () => {
    if (!obsSec || !obsList) return;
    const newItems = [...items, 'New technical observation point...'];
    const newBlocks = obsSec.blocks.map((b) => (b.id === obsList.id ? { ...obsList, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === obsSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteItem = (idx: number) => {
    if (!obsSec || !obsList) return;
    const newItems = items.filter((_, i) => i !== idx);
    const newBlocks = obsSec.blocks.map((b) => (b.id === obsList.id ? { ...obsList, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === obsSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Technical Observations, Roadworthiness &amp; Recommendations</h2>
        <div className="sbd-hint">
          Specific findings noted by the mechanical engineer during physical inspection and road trial.
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="font-mono text-slate-500 text-xs mt-2 w-6 text-right">
                {idx + 1}.
              </span>
              <textarea
                rows={2}
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                className="flex-1 p-2 border border-slate-300 text-xs resize-y"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem(idx)}
                className="text-slate-400 hover:text-rose-600 font-bold p-1 mt-1"
                title="Delete observation"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={handleAddItem}
            className="sbd-btn mini"
          >
            + Add Observation Point
          </button>
        </div>
      </div>
    </div>
  );
};
