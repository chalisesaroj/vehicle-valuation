import React from 'react';
import { ValuationDocument, TableBlock } from '../../types/document';

interface TabComponentsProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
}

export const TabComponents: React.FC<TabComponentsProps> = ({ document, onUpdateDocument }) => {
  const condSec = document.sections.find((s) => s.id === 'sec-condition');
  const condTable = condSec?.blocks.find((b) => b.type === 'table') as TableBlock | undefined;

  const rows = condTable?.rows || [];

  const handleRowChange = (rIdx: number, cIdx: number, val: string) => {
    if (!condSec || !condTable) return;
    const newRows = rows.map((r, i) => {
      if (i !== rIdx) return r;
      const newRow = [...r];
      newRow[cIdx] = val;
      return newRow;
    });

    const newBlocks = condSec.blocks.map((b) => (b.id === condTable.id ? { ...condTable, rows: newRows } : b));
    const newSections = document.sections.map((s) => (s.id === condSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleAddRow = () => {
    if (!condSec || !condTable) return;
    const newRow = [`${rows.length + 1}`, 'Additional Assembly', '4', 'Good', 'Inspected and operational.'];
    const newBlocks = condSec.blocks.map((b) => (b.id === condTable.id ? { ...condTable, rows: [...rows, newRow] } : b));
    const newSections = document.sections.map((s) => (s.id === condSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteRow = (rIdx: number) => {
    if (!condSec || !condTable) return;
    const newRows = rows.filter((_, i) => i !== rIdx).map((r, i) => [String(i + 1), r[1], r[2], r[3], r[4]]);
    const newBlocks = condSec.blocks.map((b) => (b.id === condTable.id ? { ...condTable, rows: newRows } : b));
    const newSections = document.sections.map((s) => (s.id === condSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Component-Wise Technical Condition Audit &amp; Ratings</h2>
        <div className="sbd-hint">
          Standard 5-point rating scale (5: Excellent, 4: Good, 3: Fair/Average, 2: Poor, 1: Defective). Every row is directly reflected in the PDF report table.
        </div>

        <div className="overflow-x-auto border border-slate-300">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 w-10 text-center">S.N.</th>
                <th className="p-2 w-48">Assembly / Component</th>
                <th className="p-2 w-24 text-center">Rating (1-5)</th>
                <th className="p-2 w-28 text-center">Grade</th>
                <th className="p-2">Observed Technical Findings &amp; Wear Status</th>
                <th className="p-2 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  <td className="p-2 text-center font-mono text-slate-500">{rIdx + 1}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row[1] || ''}
                      onChange={(e) => handleRowChange(rIdx, 1, e.target.value)}
                      className="w-full px-1.5 py-1 font-semibold border border-slate-300 focus:outline-none"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      value={row[2] || '4'}
                      onChange={(e) => {
                        handleRowChange(rIdx, 2, e.target.value);
                        const grades: Record<string, string> = {
                          '5': 'Excellent',
                          '4': 'Good',
                          '3': 'Fair',
                          '2': 'Poor',
                          '1': 'Critical',
                        };
                        handleRowChange(rIdx, 3, grades[e.target.value] || 'Good');
                      }}
                      className="w-full text-center px-1 py-1 font-bold border border-slate-300"
                    >
                      <option value="5">5 ★</option>
                      <option value="4">4 ★</option>
                      <option value="3">3 ★</option>
                      <option value="2">2 ★</option>
                      <option value="1">1 ★</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      value={row[3] || 'Good'}
                      onChange={(e) => handleRowChange(rIdx, 3, e.target.value)}
                      className="w-full text-center px-1.5 py-1 border border-slate-300"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row[4] || ''}
                      onChange={(e) => handleRowChange(rIdx, 4, e.target.value)}
                      className="w-full px-1.5 py-1 border border-slate-300"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(rIdx)}
                      className="text-slate-400 hover:text-rose-600 px-1 font-bold"
                      title="Delete row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 flex justify-between items-center">
          <button
            type="button"
            onClick={handleAddRow}
            className="sbd-btn mini"
          >
            + Add Inspection Component
          </button>
          <span className="text-xs text-slate-500">
            {rows.length} mechanical components inspected
          </span>
        </div>
      </div>
    </div>
  );
};
