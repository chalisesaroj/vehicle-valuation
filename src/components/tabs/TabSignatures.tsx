import React from 'react';
import { ValuationDocument, SignatureBlock, SignerItem } from '../../types/document';

interface TabSignaturesProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
}

export const TabSignatures: React.FC<TabSignaturesProps> = ({ document, onUpdateDocument }) => {
  const sigSec = document.sections.find((s) => s.id === 'sec-signatures');
  const sigBlock = sigSec?.blocks.find((b) => b.type === 'signature') as SignatureBlock | undefined;

  const signers = sigBlock?.signers || [];

  const handleSignerChange = (idx: number, updates: Partial<SignerItem>) => {
    if (!sigSec || !sigBlock) return;
    const newSigners = signers.map((s, i) => (i === idx ? { ...s, ...updates } : s));
    const newBlocks = sigSec.blocks.map((b) => (b.id === sigBlock.id ? { ...sigBlock, signers: newSigners } : b));
    const newSections = document.sections.map((s) => (s.id === sigSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleAddSigner = () => {
    if (!sigSec || !sigBlock) return;
    const newSigner: SignerItem = {
      id: `sig-${Date.now()}`,
      name: 'Authorized Signatory',
      designation: 'Reviewer / Branch Manager',
      org: document.meta.clientName,
      license: '',
      signatureDate: document.meta.valuationDate,
      hasStamp: true,
    };
    const newSigners = [...signers, newSigner];
    const newBlocks = sigSec.blocks.map((b) => (b.id === sigBlock.id ? { ...sigBlock, signers: newSigners } : b));
    const newSections = document.sections.map((s) => (s.id === sigSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteSigner = (idx: number) => {
    if (!sigSec || !sigBlock) return;
    const newSigners = signers.filter((_, i) => i !== idx);
    const newBlocks = sigSec.blocks.map((b) => (b.id === sigBlock.id ? { ...sigBlock, signers: newSigners } : b));
    const newSections = document.sections.map((s) => (s.id === sigSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Engineering Certification &amp; Authorized Signatures</h2>
        <div className="sbd-hint">
          Signatory blocks printed at the end of the report with engineer registration credentials, date, and official stamp.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signers.map((s, idx) => (
            <div key={s.id || idx} className="p-4 bg-slate-50 border border-slate-300 space-y-3 relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  Signatory #{idx + 1}
                </span>
                {signers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSigner(idx)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <label className="sbd-f">
                <span>Full Name</span>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => handleSignerChange(idx, { name: e.target.value })}
                  placeholder="e.g. Er. Saroj Chalise"
                  className="font-bold"
                />
              </label>

              <label className="sbd-f">
                <span>Designation / Professional Title</span>
                <input
                  type="text"
                  value={s.designation}
                  onChange={(e) => handleSignerChange(idx, { designation: e.target.value })}
                  placeholder="e.g. Mechanical Engineer"
                />
              </label>

              <label className="sbd-f">
                <span>Organization / Firm</span>
                <input
                  type="text"
                  value={s.org || ''}
                  onChange={(e) => handleSignerChange(idx, { org: e.target.value })}
                  placeholder="e.g. SAANSA ENGINEERING AND TECH SOLUTION"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="sbd-f">
                  <span>License / Council Registration</span>
                  <input
                    type="text"
                    value={s.license || ''}
                    onChange={(e) => handleSignerChange(idx, { license: e.target.value })}
                    placeholder="e.g. NEC Reg. No: 14289-Mech"
                  />
                </label>

                <label className="sbd-f">
                  <span>Signature Date</span>
                  <input
                    type="date"
                    value={s.signatureDate || ''}
                    onChange={(e) => handleSignerChange(idx, { signatureDate: e.target.value })}
                  />
                </label>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={s.hasStamp !== false}
                    onChange={(e) => handleSignerChange(idx, { hasStamp: e.target.checked })}
                  />
                  <span>Include Official Seal / Stamp Box</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleAddSigner}
            className="sbd-btn"
          >
            + Add Additional Signatory / Approval Block
          </button>
        </div>
      </div>
    </div>
  );
};
