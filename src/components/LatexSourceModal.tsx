import React, { useState } from 'react';
import { X, Copy, Download, Check, Code2 } from 'lucide-react';

interface LatexSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  latexCode: string;
}

export const LatexSourceModal: React.FC<LatexSourceModalProps> = ({
  isOpen,
  onClose,
  latexCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Vehicle_Valuation_Report.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Generated LaTeX Document Source</h3>
              <p className="text-xs text-slate-400">
                Pristine TeX source compiled by pdfTeX into the final PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy TeX'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .tex</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80 font-mono text-xs leading-relaxed text-slate-300">
          <pre className="whitespace-pre-wrap select-text">{latexCode}</pre>
        </div>
      </div>
    </div>
  );
};
