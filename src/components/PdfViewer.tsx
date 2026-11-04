import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PdfViewerProps {
  pdfBlobUrl: string | null;
  isCompiling: boolean;
  compileError: string | null;
  compileLog?: string | null;
  onRecompile: () => void;
  onExportPdf: () => void;
  lastCompileDurationMs?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfBlobUrl,
  isCompiling,
  compileError,
  compileLog,
  onRecompile,
  onExportPdf,
  lastCompileDurationMs,
}) => {
  const [showFullLog, setShowFullLog] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Viewer Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>LaTeX Compiled PDF</span>
          </div>

          {lastCompileDurationMs && !isCompiling && !compileError && (
            <span className="text-[11px] text-slate-400">
              · Compiled in {(lastCompileDurationMs / 1000).toFixed(1)}s
            </span>
          )}

          {isCompiling && (
            <span className="text-[11px] text-blue-400 animate-pulse flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Compiling TeX...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pdfBlobUrl && (
            <button
              type="button"
              onClick={() => window.open(pdfBlobUrl, '_blank')}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              title="Open PDF in full browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Tab</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRecompile}
            disabled={isCompiling}
            className="flex items-center gap-1 px-2.5 py-1 text-blue-300 hover:text-white bg-blue-950/80 hover:bg-blue-900 rounded border border-blue-800 transition disabled:opacity-50"
            title="Recompile LaTeX source"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>Recompile</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={!pdfBlobUrl}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-xs transition disabled:opacity-40"
            title="Download the compiled PDF file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative bg-slate-950 flex flex-col min-h-[500px]">
        {/* Loading Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <h4 className="text-sm font-semibold">Compiling PDF with pdfTeX Engine...</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Rendering tabular structures, vectors, and typography directly through TeX Live.
            </p>
          </div>
        )}

        {/* Error Notification Banner */}
        {compileError && (
          <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 p-3 text-xs space-y-2 shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>LaTeX Compilation Encountered an Issue: {compileError}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullLog(!showFullLog)}
                className="text-rose-300 hover:text-white flex items-center gap-0.5 underline text-[11px]"
              >
                <span>{showFullLog ? 'Hide Log' : 'View TeX Log'}</span>
                {showFullLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showFullLog && compileLog && (
              <pre className="p-2.5 bg-black/60 rounded border border-rose-900/60 font-mono text-[10px] text-rose-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {compileLog}
              </pre>
            )}
          </div>
        )}

        {/* Embedded PDF iframe / object */}
        {pdfBlobUrl ? (
          <iframe
            src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
            title="Compiled LaTeX Valuation PDF Preview"
            className="w-full flex-1 border-0"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <FileCheck2 className="w-12 h-12 text-slate-600 opacity-60" />
            <h4 className="text-sm font-medium text-slate-300">No PDF Compiled Yet</h4>
            <p className="text-xs max-w-sm text-slate-500">
              Click &quot;Compile PDF&quot; in the navigation bar to produce the official LaTeX PDF document.
            </p>
            <button
              type="button"
              onClick={onRecompile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              Compile Initial PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
