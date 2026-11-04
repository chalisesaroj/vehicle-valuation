import React, { useState } from 'react';
import { X, Save, Bookmark, Trash2, RotateCcw, Check, Plus, FolderOpen } from 'lucide-react';
import { ValuationDocument } from '../types/document';

export interface SavedVariation {
  id: string;
  name: string;
  description: string;
  savedAt: string;
  document: ValuationDocument;
}

interface VariationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocument: ValuationDocument;
  onLoadVariation: (doc: ValuationDocument) => void;
  onResetToMaster: () => void;
}

const STORAGE_KEY = 'saansa_valuation_variations_v1';

export const VariationManagerModal: React.FC<VariationManagerModalProps> = ({
  isOpen,
  onClose,
  currentDocument,
  onLoadVariation,
  onResetToMaster,
}) => {
  const [variations, setVariations] = useState<SavedVariation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Ignore
    }
    return [];
  });

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newVariation: SavedVariation = {
      id: `var-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom report layout and content overrides',
      savedAt: new Date().toISOString(),
      document: JSON.parse(JSON.stringify(currentDocument)),
    };

    const updated = [newVariation, ...variations];
    setVariations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setNewName('');
    setNewDesc('');
    setShowSaveForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = variations.filter((v) => v.id !== id);
    setVariations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoad = (variation: SavedVariation) => {
    onLoadVariation(JSON.parse(JSON.stringify(variation.document)));
    onClose();
  };

  const handleReset = () => {
    onResetToMaster();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Reusable Report Variations & Templates
              </h3>
              <p className="text-xs text-slate-400">
                Preserve the master baseline or save customized report variants for reuse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Master Reset Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                Original Master Template (Word Document Baseline)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The canonical 9-section vehicle valuation engineering layout is always safely preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold rounded border border-slate-300 hover:border-rose-300 transition shrink-0"
            >
              Reset to Master
            </button>
          </div>

          {/* Save Current Variation Toggle / Form */}
          {!showSaveForm ? (
            <button
              type="button"
              onClick={() => setShowSaveForm(true)}
              className="w-full py-2.5 px-3 border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Save Current Report Layout as a Reusable Variation</span>
            </button>
          ) : (
            <form onSubmit={handleSaveCurrent} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">Save Current Variation</span>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Variation Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Commercial 4WD Audit Format, Cooperative Loan Brief"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Description / Remarks
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Custom 3-column specs, additional approval block for branch manager"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Variation</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Variations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saved User Variations ({variations.length})
            </h4>

            {variations.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center border border-slate-100 rounded">
                No custom variations saved yet. You can edit any section or table and save it here.
              </p>
            ) : (
              variations.map((v) => (
                <div
                  key={v.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{v.name}</h5>
                    <p className="text-[11px] text-slate-500 truncate">{v.description}</p>
                    <span className="text-[10px] text-slate-400">
                      Saved {new Date(v.savedAt).toLocaleDateString()} · {v.document.sections.length} sections
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoad(v)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded border border-blue-200 transition"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Load</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                      title="Delete saved variation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
