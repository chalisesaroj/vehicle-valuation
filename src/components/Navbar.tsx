import React from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  Code2,
  Calculator,
  RotateCcw,
  Upload,
  Save,
  Columns,
  Eye,
  FileCode,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { ValuationDocument } from '../types/document';

interface NavbarProps {
  document: ValuationDocument;
  viewMode: 'editor' | 'preview' | 'split';
  setViewMode: (mode: 'editor' | 'preview' | 'split') => void;
  isCompiling: boolean;
  onRecompile: () => void;
  onExportPdf: () => void;
  onOpenLatex: () => void;
  onOpenCalculator: () => void;
  onOpenVariations: () => void;
  onResetMaster: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
  onAddSection: () => void;
  lastCompileTime?: string;
  hasPdf: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  document,
  viewMode,
  setViewMode,
  isCompiling,
  onRecompile,
  onExportPdf,
  onOpenLatex,
  onOpenCalculator,
  onOpenVariations,
  onResetMaster,
  onImportJson,
  onExportJson,
  onAddSection,
  lastCompileTime,
  hasPdf,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Vehicle Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner font-bold text-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-slate-100">
                {document.meta.reportTitle}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono border border-blue-700/50">
                {document.meta.vehicleRegNo}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
              {document.meta.organizationName} · {document.meta.reportRefNo}
            </p>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live PDF</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            onClick={onAddSection}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            title="Add a new section to report"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Section</span>
          </button>

          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            title="Vehicle Valuation Math & Calculation Tool"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Valuation Math</span>
          </button>

          <button
            onClick={onOpenLatex}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            title="Inspect LaTeX code"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>LaTeX</span>
          </button>

          <button
            onClick={onOpenVariations}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            title="Manage saved variations and templates"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Variations</span>
          </button>

          {/* Hidden JSON input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportJson}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Import vehicle JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>

          <button
            onClick={onResetMaster}
            className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 rounded border border-slate-700 hover:border-rose-800 transition"
            title="Reset document to Master Word template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Recompile Button */}
          <button
            onClick={onRecompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium rounded shadow transition"
            title="Compile LaTeX to PDF"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Compiling...' : 'Compile PDF'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={!hasPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded shadow transition"
            title="Download the compiled LaTeX PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
