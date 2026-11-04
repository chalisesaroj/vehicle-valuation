import React, { useRef } from 'react';
import {
  Printer,
  FileText,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Download,
  Upload,
  Code2,
  Trash2,
  Eye,
  FileCheck,
  Flame,
} from 'lucide-react';
import { ValuationDocument } from '../types/document';

interface SbdTopBarProps {
  document: ValuationDocument;
  completedFieldsCount: number;
  totalFieldsCount: number;
  isCompiling: boolean;
  onPrintSavePdf: () => void;
  onLoadSample: () => void;
  onLoadScrapSample?: () => void;
  onClear: () => void;
  onResetDefaults: () => void;
  onRecalculate: () => void;
  onValidate: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenLatex: () => void;
  onSwitchToPreview: () => void;
  validationIssueCount?: number;
}

export const SbdTopBar: React.FC<SbdTopBarProps> = ({
  document,
  completedFieldsCount,
  totalFieldsCount,
  isCompiling,
  onPrintSavePdf,
  onLoadSample,
  onLoadScrapSample,
  onClear,
  onResetDefaults,
  onRecalculate,
  onValidate,
  onExportJson,
  onImportJson,
  onOpenLatex,
  onSwitchToPreview,
  validationIssueCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressPct = totalFieldsCount > 0 ? Math.round((completedFieldsCount / totalFieldsCount) * 100) : 100;

  return (
    <header className="sbd-top-bar no-print">
      {/* Title & Description */}
      <div className="title-wrap">
        <h1>Vehicle Valuation Report Generator — Professional Appraisal</h1>
        <p>
          Enter vehicle and appraisal facts once — technical parameters, condition ratings, and depreciation formulas compute automatically.
        </p>
      </div>

      {/* Progress Bar */}
      <div
        className="sbd-progress-wrap"
        title="Fields with valid data are counted as complete"
      >
        <div className="sbd-progress-bar">
          <div
            className="sbd-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span id="progressText" className="text-[11px] text-slate-700 whitespace-nowrap font-mono">
          {completedFieldsCount} / {totalFieldsCount} fields complete ({progressPct}%)
        </span>
      </div>

      {/* Top Actions */}
      <div className="sbd-top-actions">
        <button
          type="button"
          onClick={onPrintSavePdf}
          disabled={isCompiling}
          className="sbd-btn primary"
          title="Compile LaTeX into professional vector PDF (not an image screenshot)"
        >
          {isCompiling ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSwitchToPreview}
          className="sbd-btn"
          title="Jump directly to Document Preview & Live Edit"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Preview &amp; Edit</span>
        </button>

        <button
          type="button"
          onClick={onLoadSample}
          className="sbd-btn"
          title="Load default commercial vehicle dataset (Mahindra Scorpio BA 14 CHA 4271)"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sample Data</span>
        </button>

        {onLoadScrapSample && (
          <button
            type="button"
            onClick={onLoadScrapSample}
            className="sbd-btn border-amber-500 text-amber-900 bg-amber-50 hover:bg-amber-100"
            title="Load Scrap Valuation Sample (GA. PRA. BAB 0236 - Bhimsenthapa Rural Municipality Fire Loss)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Scrap Sample</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClear}
          className="sbd-btn"
          title="Clear form inputs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={onResetDefaults}
          className="sbd-btn"
          title="Reset to Master Document Baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onRecalculate}
          className="sbd-btn"
          title="Recalculate depreciation, market demand, and words"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>↻ Recalculate</span>
        </button>

        <button
          type="button"
          onClick={onValidate}
          className={`sbd-btn ${validationIssueCount > 0 ? 'border-rose-600 text-rose-600 font-bold' : ''}`}
          title="Validate required valuation & technical fields"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${validationIssueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
          <span>{validationIssueCount > 0 ? `Issues (${validationIssueCount})` : '✓ Validate'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenLatex}
          className="sbd-btn"
          title="Inspect LaTeX code"
        >
          <Code2 className="w-3.5 h-3.5 text-purple-600" />
          <span>LaTeX Source</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
          className="sbd-btn"
          title="Export current document model as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="sbd-btn"
          title="Import document JSON"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import JSON</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImportJson}
          className="hidden"
        />
      </div>
    </header>
  );
};
