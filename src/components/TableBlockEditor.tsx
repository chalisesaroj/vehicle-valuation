import React, { useState } from 'react';
import { TableBlock } from '../types/document';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (updated: TableBlock) => void;
}

export const TableBlockEditor: React.FC<TableBlockEditorProps> = ({ block, onChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  const headers = block.headers || ['Col 1', 'Col 2'];
  const rows = block.rows || [];

  const handleHeaderChange = (cIdx: number, val: string) => {
    const newHeaders = [...headers];
    newHeaders[cIdx] = val;
    onChange({ ...block, headers: newHeaders });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = rows.map((r, i) => {
      if (i !== rIdx) return r;
      const newRow = [...r];
      newRow[cIdx] = val;
      return newRow;
    });
    onChange({ ...block, rows: newRows });
  };

  const addRow = () => {
    const emptyRow = Array(headers.length).fill('');
    onChange({ ...block, rows: [...rows, emptyRow] });
  };

  const deleteRow = (rIdx: number) => {
    const newRows = rows.filter((_, i) => i !== rIdx);
    onChange({ ...block, rows: newRows });
  };

  const moveRow = (rIdx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && rIdx === 0) return;
    if (direction === 'down' && rIdx === rows.length - 1) return;
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    const newRows = [...rows];
    const temp = newRows[rIdx];
    newRows[rIdx] = newRows[targetIdx];
    newRows[targetIdx] = temp;
    onChange({ ...block, rows: newRows });
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Col ${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, '']);
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  const deleteColumn = (cIdx: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== cIdx);
    const newRows = rows.map((r) => r.filter((_, i) => i !== cIdx));
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  return (
    <div className="space-y-3">
      {/* Caption & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Table Caption (Optional, e.g. Component-Wise Audit)"
          className="text-xs font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 max-w-sm"
        />

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border border-slate-300 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Col</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            title="Table styling settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="flex items-center gap-4 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={block.striped !== false}
              onChange={(e) => onChange({ ...block, striped: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Zebra Striping</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={block.hasBorders !== false}
              onChange={(e) => onChange({ ...block, hasBorders: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Grid Borders</span>
          </label>
        </div>
      )}

      {/* Spreadsheet-like Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-md bg-white shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="w-8 px-2 py-1.5 text-center text-slate-400 font-mono">#</th>
              {headers.map((h, cIdx) => (
                <th key={cIdx} className="px-2 py-1.5 border-r border-slate-200 relative group min-w-[120px]">
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      className="font-semibold text-slate-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 w-full"
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(cIdx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                        title="Delete this column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-12 px-2 py-1.5 text-center text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`hover:bg-blue-50/40 transition-colors ${
                  block.striped && rIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                }`}
              >
                <td className="px-2 py-1 text-center font-mono text-slate-400 text-[11px]">
                  {rIdx + 1}
                </td>
                {headers.map((_, cIdx) => (
                  <td key={cIdx} className="px-2 py-1 border-r border-slate-100">
                    <input
                      type="text"
                      value={row[cIdx] || ''}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 text-slate-700"
                    />
                  </td>
                ))}
                <td className="px-2 py-1 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveRow(rIdx, 'up')}
                      disabled={rIdx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      title="Move row up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(rIdx, 'down')}
                      disabled={rIdx === rows.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      title="Move row down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRow(rIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="p-4 text-center border border-dashed border-slate-300 rounded text-xs text-slate-500">
          Table has no rows.{' '}
          <button type="button" onClick={addRow} className="text-blue-600 font-medium hover:underline">
            Add first row
          </button>
        </div>
      )}
    </div>
  );
};
