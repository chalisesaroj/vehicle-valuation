import React from 'react';
import { ValuationDocument, DocumentMeta } from '../../types/document';

interface TabGeneralProps {
  document: ValuationDocument;
  onMetaChange: (field: keyof DocumentMeta, value: string) => void;
}

export const TabGeneral: React.FC<TabGeneralProps> = ({ document, onMetaChange }) => {
  const meta = document.meta;

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>General Valuation Particulars &amp; Client Information</h2>
        <div className="sbd-hint">
          Enter the client and organization facts once — they are automatically reused across the letterhead, certificate, declarations, and running headers.
        </div>

        <div className="sbd-grid c1">
          <label className="sbd-f">
            <span>
              Client / Financial Institution Name
              <span className="auto">REUSED ON COVER &amp; CERTIFICATE</span>
            </span>
            <input
              type="text"
              value={meta.clientName}
              onChange={(e) => onMetaChange('clientName', e.target.value)}
              placeholder="e.g. Shree Saral Namuna Saving and Credit Cooperatives Limited"
            />
          </label>
        </div>

        <div className="sbd-grid c2">
          <label className="sbd-f">
            <span>Client Location / Address</span>
            <input
              type="text"
              value={meta.clientAddress}
              onChange={(e) => onMetaChange('clientAddress', e.target.value)}
              placeholder="e.g. Pokhara, Kaski, Nepal"
            />
          </label>

          <label className="sbd-f">
            <span>Purpose of Valuation</span>
            <input
              type="text"
              value={meta.purpose}
              onChange={(e) => onMetaChange('purpose', e.target.value)}
              placeholder="e.g. Loan Disbursement / Collateral Security"
            />
          </label>
        </div>

        <div className="sbd-grid c3">
          <label className="sbd-f">
            <span>Date of Valuation (A.D.)</span>
            <input
              type="date"
              value={meta.valuationDate}
              onChange={(e) => onMetaChange('valuationDate', e.target.value)}
            />
          </label>

          <label className="sbd-f">
            <span>Valuation Report Ref. Number</span>
            <input
              type="text"
              value={meta.reportRefNo}
              onChange={(e) => onMetaChange('reportRefNo', e.target.value)}
              placeholder="e.g. SET/VAL/2026/089"
            />
          </label>

          <label className="sbd-f">
            <span>Inspection Venue / Place</span>
            <input
              type="text"
              value={meta.placeOfInspection}
              onChange={(e) => onMetaChange('placeOfInspection', e.target.value)}
              placeholder="e.g. Pokhara, Kaski"
            />
          </label>
        </div>
      </div>

      <div className="sbd-card">
        <h2>Appraising Engineering Organization / Firm Details</h2>
        <div className="sbd-hint">
          Official engineering firm credentials printed on report letterhead.
        </div>

        <div className="sbd-grid c1">
          <label className="sbd-f">
            <span>Firm / Organization Name</span>
            <input
              type="text"
              value={meta.organizationName}
              onChange={(e) => onMetaChange('organizationName', e.target.value)}
              placeholder="e.g. SAANSA ENGINEERING AND TECH SOLUTION PRIVATE LIMITED"
            />
          </label>
        </div>

        <div className="sbd-grid c2">
          <label className="sbd-f">
            <span>Subtitle / Professional Credentials</span>
            <input
              type="text"
              value={meta.organizationSubtitle}
              onChange={(e) => onMetaChange('organizationSubtitle', e.target.value)}
              placeholder="Consulting Mechanical Engineers, Valuers & Technical Assessors"
            />
          </label>

          <label className="sbd-f">
            <span>Registered Address</span>
            <input
              type="text"
              value={meta.organizationAddress}
              onChange={(e) => onMetaChange('organizationAddress', e.target.value)}
              placeholder="Pokhara-08, Kaski, Gandaki Province, Nepal"
            />
          </label>
        </div>

        <div className="sbd-grid c1">
          <label className="sbd-f">
            <span>Contact &amp; Telecommunication Information</span>
            <input
              type="text"
              value={meta.organizationContact}
              onChange={(e) => onMetaChange('organizationContact', e.target.value)}
              placeholder="Tel: +977-61-532190 | Email: info@saansaeng.com"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
