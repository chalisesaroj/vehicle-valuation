import React from 'react';
import { ValuationDocument, TableBlock } from '../../types/document';

interface TabSpecsProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
}

export const TabSpecs: React.FC<TabSpecsProps> = ({ document, onUpdateDocument }) => {
  const meta = document.meta;

  // Find the specs table in section 3 if present
  const specsSec = document.sections.find((s) => s.id === 'sec-specs');
  const specsTable = specsSec?.blocks.find((b) => b.type === 'table') as TableBlock | undefined;

  // Helper to get spec from table rows
  const getSpecValue = (paramName: string, fallback = '') => {
    if (!specsTable || !specsTable.rows) return fallback;
    for (const r of specsTable.rows) {
      if (r[0] === paramName) return r[1];
      if (r[2] === paramName) return r[3];
    }
    return fallback;
  };

  const updateSpecValue = (paramName: string, newValue: string) => {
    let updatedRows = specsTable ? [...specsTable.rows] : [];
    let found = false;

    updatedRows = updatedRows.map((r) => {
      const row = [...r];
      if (row[0] === paramName) {
        row[1] = newValue;
        found = true;
      }
      if (row[2] === paramName) {
        row[3] = newValue;
        found = true;
      }
      return row;
    });

    if (specsSec && specsTable) {
      const newBlocks = specsSec.blocks.map((b) => (b.id === specsTable.id ? { ...specsTable, rows: updatedRows } : b));
      const newSections = document.sections.map((s) => (s.id === specsSec.id ? { ...s, blocks: newBlocks } : s));
      onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
    }
  };

  const handleMetaChange = (field: keyof typeof meta, val: string) => {
    onUpdateDocument({
      ...document,
      meta: {
        ...document.meta,
        [field]: val,
      },
      lastModified: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Vehicle Identity &amp; Physical Credentials</h2>
        <div className="sbd-hint">
          All specifications are mapped into the official specification matrix and cross-checked against bill book records.
        </div>

        <div className="sbd-grid c3">
          <label className="sbd-f">
            <span>
              Vehicle Registration Number
              <span className="auto">SYNCED</span>
            </span>
            <input
              type="text"
              value={meta.vehicleRegNo}
              onChange={(e) => {
                handleMetaChange('vehicleRegNo', e.target.value);
                updateSpecValue('Registration Number', e.target.value);
              }}
              placeholder="e.g. BA 14 CHA 4271"
              className="font-bold"
            />
          </label>

          <label className="sbd-f">
            <span>Make &amp; Commercial Model</span>
            <input
              type="text"
              value={meta.makeModel}
              onChange={(e) => {
                handleMetaChange('makeModel', e.target.value);
                updateSpecValue('Make & Model', e.target.value);
              }}
              placeholder="Mahindra Scorpio Pickup DC EHD 4WD"
            />
          </label>

          <label className="sbd-f">
            <span>Vehicle Type / Classification</span>
            <input
              type="text"
              value={getSpecValue('Vehicle Type', 'Pickup (Double Cab 4WD)')}
              onChange={(e) => updateSpecValue('Vehicle Type', e.target.value)}
              placeholder="e.g. Pickup (Double Cab 4WD)"
            />
          </label>
        </div>

        <div className="sbd-grid c3">
          <label className="sbd-f">
            <span>Chassis / VIN Number</span>
            <input
              type="text"
              value={getSpecValue('Chassis / VIN Number', 'MA1TY4MNG2A15225')}
              onChange={(e) => updateSpecValue('Chassis / VIN Number', e.target.value)}
              placeholder="MA1TY4MNG2A15225"
              className="font-mono uppercase"
            />
          </label>

          <label className="sbd-f">
            <span>Engine Number</span>
            <input
              type="text"
              value={getSpecValue('Engine Number', 'MMG4A12489')}
              onChange={(e) => updateSpecValue('Engine Number', e.target.value)}
              placeholder="MMG4A12489"
              className="font-mono uppercase"
            />
          </label>

          <label className="sbd-f">
            <span>Engine Displacement (CC)</span>
            <input
              type="text"
              value={getSpecValue('Engine Displacement', '2179 CC')}
              onChange={(e) => updateSpecValue('Engine Displacement', e.target.value)}
              placeholder="2179 CC"
            />
          </label>
        </div>

        <div className="sbd-grid c4">
          <label className="sbd-f">
            <span>Fuel Type</span>
            <select
              value={getSpecValue('Fuel Type', 'Diesel')}
              onChange={(e) => updateSpecValue('Fuel Type', e.target.value)}
            >
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric (EV)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>

          <label className="sbd-f">
            <span>Transmission</span>
            <select
              value={getSpecValue('Transmission Type', 'Manual')}
              onChange={(e) => updateSpecValue('Transmission Type', e.target.value)}
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </label>

          <label className="sbd-f">
            <span>Mfg. Year</span>
            <input
              type="text"
              value={getSpecValue('Year of Manufacture', '2016')}
              onChange={(e) => updateSpecValue('Year of Manufacture', e.target.value)}
            />
          </label>

          <label className="sbd-f">
            <span>Reg. Year</span>
            <input
              type="text"
              value={getSpecValue('Year of Registration', '2016')}
              onChange={(e) => updateSpecValue('Year of Registration', e.target.value)}
            />
          </label>
        </div>

        <div className="sbd-grid c3">
          <label className="sbd-f">
            <span>Odometer Mileage (km)</span>
            <input
              type="text"
              value={getSpecValue('Odometer Reading', '193,974 km')}
              onChange={(e) => updateSpecValue('Odometer Reading', e.target.value)}
              placeholder="193,974 km"
              className="font-semibold"
            />
          </label>

          <label className="sbd-f">
            <span>Body Exterior Color</span>
            <input
              type="text"
              value={getSpecValue('Body Color', 'Silver')}
              onChange={(e) => updateSpecValue('Body Color', e.target.value)}
              placeholder="Silver"
            />
          </label>

          <label className="sbd-f">
            <span>Seating Capacity</span>
            <input
              type="text"
              value={getSpecValue('Seating Capacity', '5 Persons')}
              onChange={(e) => updateSpecValue('Seating Capacity', e.target.value)}
              placeholder="5 Persons"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
