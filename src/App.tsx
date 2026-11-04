/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ValuationDocument, DocumentSection, BlockType } from './types/document';
import { createMasterDocument } from './services/defaultTemplate';
import { generateLatexFromDocument, extractDocumentImages } from './services/latexGenerator';
import {
  ValuationResults,
  ValuationInputs,
  computeValuation,
  formatNPR,
  DEFAULT_SCRAP_INPUTS,
  DEFAULT_MARKET_COMP_INPUTS,
  DEFAULT_RECONCILIATION_INPUTS,
} from './services/valuationMath';
import { SbdTopBar } from './components/SbdTopBar';
import { SbdTabs, TabKey } from './components/SbdTabs';
import { TabGeneral } from './components/tabs/TabGeneral';
import { TabSpecs } from './components/tabs/TabSpecs';
import { TabComponents } from './components/tabs/TabComponents';
import { TabValuation } from './components/tabs/TabValuation';
import { TabRemarks } from './components/tabs/TabRemarks';
import { TabPhotos } from './components/tabs/TabPhotos';
import { TabSignatures } from './components/tabs/TabSignatures';
import { TabOverrides } from './components/tabs/TabOverrides';
import { TabPreviewEditable } from './components/TabPreviewEditable';
import { LatexSourceModal } from './components/LatexSourceModal';
import { ValuationCalculatorModal } from './components/ValuationCalculatorModal';
import { VariationManagerModal } from './components/VariationManagerModal';
import { AddBlockModal } from './components/AddBlockModal';

export default function App() {
  const [document, setDocument] = useState<ValuationDocument>(() => createMasterDocument());
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationPanel, setShowValidationPanel] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warn' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Modals state
  const [latexModalOpen, setLatexModalOpen] = useState(false);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [variationsModalOpen, setVariationsModalOpen] = useState(false);
  const [addBlockModal, setAddBlockModal] = useState<{
    isOpen: boolean;
    sectionId: string;
    atIndex?: number;
  }>({
    isOpen: false,
    sectionId: '',
  });

  const generatedLatex = useMemo(() => {
    return generateLatexFromDocument(document);
  }, [document]);

  // Compute field completion stats
  const { completedFieldsCount, totalFieldsCount } = useMemo(() => {
    const meta = document.meta;
    const fields = [
      meta.clientName,
      meta.clientAddress,
      meta.purpose,
      meta.valuationDate,
      meta.reportRefNo,
      meta.placeOfInspection,
      meta.organizationName,
      meta.organizationAddress,
      meta.organizationContact,
      meta.vehicleRegNo,
      meta.makeModel,
      meta.preparedBy,
    ];
    const total = fields.length + 8; // core meta + essential sections
    let completed = fields.filter((f) => f && f.trim().length > 0).length;
    // Add completed sections
    if (document.sections.length >= 7) completed += 8;
    else completed += document.sections.length;

    return { completedFieldsCount: completed, totalFieldsCount: total };
  }, [document]);

  // Compile PDF via backend pdflatex (vector, real text, never raster image)
  const handleCompilePdf = useCallback(async (shouldDownload = false): Promise<string | null> => {
    setIsCompiling(true);
    setCompileError(null);

    try {
      const latex = generateLatexFromDocument(document);
      const images = extractDocumentImages(document);

      const response = await fetch('/api/compile-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex, images }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        setCompileError(errorData.error || `HTTP ${response.status}`);
        setCompileLog(errorData.log || null);
        return null;
      } else {
        const blob = await response.blob();
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
        const newUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(newUrl);
        setCompileError(null);
        setCompileLog(null);

        if (shouldDownload) {
          const a = window.document.createElement('a');
          a.href = newUrl;
          const safeRegNo = (document.meta.vehicleRegNo || 'Vehicle').replace(/[^a-zA-Z0-9_-]/g, '_');
          a.download = `${safeRegNo}_Valuation_Report.pdf`;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
        }
        return newUrl;
      }
    } catch (err: any) {
      setCompileError(err.message || 'Failed to communicate with LaTeX compiler service');
      return null;
    } finally {
      setIsCompiling(false);
    }
  }, [document, pdfBlobUrl]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompilePdf(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Print / Save PDF (LaTeX vector PDF download)
  const handlePrintSavePdf = async () => {
    if (pdfBlobUrl) {
      // Direct download of existing compiled vector PDF
      const a = window.document.createElement('a');
      a.href = pdfBlobUrl;
      const safeRegNo = (document.meta.vehicleRegNo || 'Vehicle').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeRegNo}_Valuation_Report.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Recompile and download
      await handleCompilePdf(true);
    }
  };

  // Load sample dataset
  const handleLoadSample = async () => {
    try {
      const res = await fetch('/api/default-data');
      if (res.ok) {
        const rawJson = await res.json();
        const masterDoc = createMasterDocument(rawJson);
        setDocument(masterDoc);
        showToast('Sample data loaded for Mahindra Scorpio BA 14 CHA 4271.', 'success');
      } else {
        setDocument(createMasterDocument());
        showToast('Loaded standard master vehicle baseline.', 'info');
      }
    } catch (e) {
      setDocument(createMasterDocument());
    }
  };

  // Load Scrap Valuation Sample (GA. PRA. BAB 0236 - Bhimsenthapa Rural Municipality)
  const handleLoadScrapSample = () => {
    const scrapDoc: ValuationDocument = {
      id: `doc-scrap-${Date.now()}`,
      version: 1,
      meta: {
        reportTitle: 'Valuation Report of Vehicle for Scrap Disposal',
        reportRefNo: 'BTRM/DISP/2082-83/04',
        valuationDate: '2026-10-15',
        organizationName: 'भीमसेन थापा गाउँपालिका (BHIMSENTHAPA RURAL MUNICIPALITY)',
        organizationSubtitle: 'Office of the Rural Municipal Executive, Khanchok, Gorkha',
        organizationAddress: 'Khanchok, Gorkha, Gandaki Province, Nepal',
        organizationContact: 'Tel: +977-64-420101 | info@bhimsenmun.gov.np',
        clientName: 'Bhimsenthapa Gaupalika, Gau Karyapalikako Karyalaya',
        clientAddress: 'Khanchok, Gorkha',
        vehicleRegNo: 'GA. PRA. BAB 0236',
        makeModel: '4WD Single Cab Pickup (Mahindra Bolero)',
        preparedBy: 'Er. Saroj Chalise',
        preparedByRole: 'Mechanical Engineer',
        preparedByLicense: 'NEC License: 2016, Mechanical "A" Category',
        placeOfInspection: 'Bhimsen Thapa Rural Municipality Office Premises, Khanchok, Gorkha',
        purpose: 'Government Vehicle Scrap Disposal (Post De-registration)',
      },
      styling: {
        accentColor: '#92400e',
        fontSize: '10pt',
        showRunningHeader: true,
        showPageNumbers: true,
      },
      sections: [
        {
          id: 'sec-cert',
          title: '1. Scrap Valuation Certificate & Executive Summary',
          headingLevel: 1,
          pageBreakBefore: false,
          blocks: [
            {
              id: 'blk-cert-callout',
              type: 'callout',
              variant: 'certificate',
              title: 'VALUATION CERTIFICATE OF VEHICLE FOR SCRAP DISPOSAL',
              text: `This is to certify that upon the formal requisition of Bhimsenthapa Gaupalika, Gau Karyapalikako Karyalaya, the undersigned Mechanical Engineer conducted an on-site physical appraisal of government vehicle GA. PRA. BAB 0236 (Mahindra Bolero Single Cab Pickup) on 2026-10-15 at Khanchok, Gorkha.

Subject: Scrap Value Assessment of Government Vehicle BAB 0236 (Total Fire Loss – Post De-registration)

Based on confirmed total fire loss, thermal distortion, weight deductions for non-metallic items, and prevailing scrap steel/cast iron melting rates in Gandaki Province:
• Assessed Net Scrap Value: NPR 47,000 (Nepali Rupees Forty-Seven Thousand Only)
• Recommended Minimum Auction Reserve Bid: NPR 47,000 (Nepali Rupees Forty-Seven Thousand Only)
• Registration Status: Already De-registered (Transport Office records updated)

The vehicle has been rendered completely dysfunctional beyond economical repair and is approved strictly for scrap disposal.`,
            },
            {
              id: 'blk-cert-summary-kv',
              type: 'key_value',
              columns: 3,
              items: [
                { label: 'Net Realizable Scrap Value', value: 'NPR 47,000', highlight: true },
                { label: 'Minimum Auction Bid', value: 'NPR 47,000', highlight: true },
                { label: 'Registration Status', value: 'Already De-registered' },
                { label: 'Unladen Kerb Weight', value: '1,720 kg' },
                { label: 'Net Scrap Metal Weight', value: '1,241 kg' },
                { label: 'Appraisal Status', value: 'Approved for Auction' },
              ],
            },
          ],
        },
        {
          id: 'sec-specs',
          title: '2. Vehicle Identification Details',
          headingLevel: 1,
          pageBreakBefore: false,
          blocks: [
            {
              id: 'blk-specs-intro',
              type: 'paragraph',
              text: 'Physical verification of the chassis plate and engine block was conducted on site. Identification details correspond with transport office records as follows:',
            },
            {
              id: 'blk-specs-table',
              type: 'table',
              caption: 'Vehicle Identification Details',
              headers: ['Field', 'Official Record Details', 'Parameter', 'Status / Verification'],
              rows: [
                ['Vehicle Registration Number', 'GA. PRA. BAB 0236', 'Vehicle Type', '4 WD Single Cab Pickup (Mahindra Bolero)'],
                ['Chassis No', 'MA1ZC4TBKS1C33937', 'Engine No', 'TBS1C80458'],
                ['Model / Year', '2025', 'Previous Owner', 'Bhimsenthapa Gaupalika, Gau Karyapalikako Karyalaya'],
                ['Registration Status', 'Already De-registered (Transport Office records updated)', 'Disposal Basis', 'Scrap Metal Auction (As-is, Where-is)'],
              ],
              alignments: ['left', 'left', 'left', 'left'],
              hasBorders: true,
              striped: true,
            },
          ],
        },
        {
          id: 'sec-condition',
          title: '3. Vehicle Condition as Found During Physical Inspection',
          headingLevel: 1,
          pageBreakBefore: true,
          blocks: [
            {
              id: 'blk-cond-p',
              type: 'paragraph',
              text: 'The vehicle was physically inspected on site. The assemblies were confirmed in total fire loss state as observed below:',
            },
            {
              id: 'blk-cond-table',
              type: 'table',
              caption: 'Assembly Condition & Metallurgical Observation',
              headers: ['Assembly / Component', 'Condition Observed During Inspection', 'Salvage Feasibility'],
              rows: [
                ['Chassis Frame', 'Severe fire distortion and thermal weakening; structural integrity lost; fit only for scrap melting.', 'Scrap Metal Only'],
                ['Engine & Transmission', 'Cylinder block cracked/melted aluminum parts; transmission casing burnt out; internal components seized.', 'Scrap Metal Only'],
                ['Body, Cabin & Cargo Bed', 'Sheet metal completely warped, oxidized, and heavily scaled from intense fire; paint incinerated; total loss.', 'Scrap Metal Only'],
                ['Electrical & Wiring', '100% incinerated; copper wire melted/fused into ash; battery case destroyed.', 'Nil (Burned Out)'],
                ['Suspension & Axles', 'Leaf springs de-tempered (annealed) due to extreme heat, losing elasticity; axles distorted.', 'Scrap Metal Only'],
                ['Wheels & Tyres', 'All 4 tyres completely burnt down to bead wire; rims warped from heat exposure.', 'Steel Scrap Only'],
              ],
              alignments: ['left', 'left', 'center'],
              hasBorders: true,
              striped: true,
            },
          ],
        },
        {
          id: 'sec-valuation',
          title: '4. Scrap Valuation Methodology and Calculations',
          headingLevel: 1,
          pageBreakBefore: false,
          blocks: [
            {
              id: 'blk-val-method',
              type: 'paragraph',
              text: 'The vehicle was physically inspected and confirmed as a total loss beyond economical repair; hence scrap metal salvage valuation has been adopted on unladen kerb weight.',
            },
            {
              id: 'blk-val-step1-2',
              type: 'table',
              caption: 'Step 1 & 2: Kerb Weight & Non-Metallic Component Deductions',
              headers: ['S.N.', 'Component / Deduction Description', 'Weight (kg)', 'Technical Observation / Fire Impact'],
              rows: [
                ['0', 'Vehicle Unladen / Kerb Weight (Manufacturer Spec)', '1,720', 'Mahindra Bolero Single Cab Pickup standard specification'],
                ['1', 'Tyres (4 nos. rubber burned away, bead wire remains)', '60', 'All 4 tyre rubbers incinerated in fire'],
                ['2', 'Glass (windshield, door windows shattered/melted)', '25', 'Thermal shatter / molten residue'],
                ['3', 'Dashboard, fascia, steering wheel & plastic trim', '35', 'Completely incinerated in fire'],
                ['4', 'Seats, foam, upholstery & interior trim', '45', '100% destroyed by fire'],
                ['5', 'Battery (casing destroyed, lead plates damaged/lost)', '15', 'Acid drained and casing destroyed'],
                ['6', 'Wiring harness, electrical components & insulation', '10', 'Melted copper wire / ash residue'],
                ['7', 'Fluids (engine oil, gear oil, coolant, brake fluid)', '20', 'Boiled off and drained on site'],
                ['8', 'Rubber bushings, hoses, belts & miscellaneous items', '50', 'Destroyed by intense fire'],
                ['Total', 'Total Deductions', '260', 'Deducted from gross unladen weight'],
                ['Gross', 'Gross Metallic Weight (1,720 kg - 260 kg)', '1,460', 'Remaining metallic material on chassis'],
              ],
              alignments: ['center', 'left', 'center', 'left'],
              hasBorders: true,
              striped: true,
            },
            {
              id: 'blk-val-step3-5',
              type: 'table',
              caption: 'Step 3, 4 & 5: Metal Recovery, Weighted Scrap Rates & Net Realizable Value',
              headers: ['Metal Category / Parameter', 'Weight / Share', 'Rate (NPR/kg)', 'Value Contribution (NPR)'],
              rows: [
                ['Gross Metallic Weight', '1,460 kg', 'Baseline', 'Unscaled metallic mass'],
                ['Metal Loss Adjustment (Due to Fire / Rust / Scaling @ 15%)', '-219 kg', 'Scale Loss', '15% scale loss due to intense oxidation'],
                ['Net Recoverable Scrap Metal Weight', '1,241 kg', 'Net Scrap', 'Effective recoverable weight (~1,240 kg)'],
                ['Heavy Melting Steel (HMS: chassis frame, axles, block)', '70% share', '50.00', '35.00 / kg contribution'],
                ['Cast Iron (engine head, brake drums, differential)', '20% share', '35.00', '7.00 / kg contribution'],
                ['Light Gauge Sheet / Burnt Thin Metal (low recovery)', '10% share', '0.00', '0.00 / kg contribution'],
                ['Weighted Average Scrap Metal Rate', '100%', '42.00', 'Combined rate per kg of scrap'],
                ['Gross Scrap Value (1,241 kg @ NPR 42.00/kg)', '1,241 kg', 'NPR 42.00', '52,122.00'],
                ['Less: Gas Cutting, Dismantling & Transportation Deductions', 'Lump Sum', 'Deduction', '-5,000.00'],
                ['Net Realizable Scrap Value', 'Calculated', 'Net Realizable', '47,122.00'],
                ['Assessed Net Scrap Value (Rounded Off)', 'Final Value', 'NPR 47,000', 'Nepali Rupees Forty-Seven Thousand Only'],
                ['Recommended Minimum Auction Reserve Bid', 'Reserve Price', 'NPR 47,000', 'Nepali Rupees Forty-Seven Thousand Only'],
              ],
              alignments: ['left', 'center', 'center', 'right'],
              hasBorders: true,
              striped: true,
            },
            {
              id: 'blk-val-note',
              type: 'callout',
              variant: 'calculation',
              title: 'Summary / Valuation Certificate',
              text: 'The assessed net scrap value of NPR 47,000 (Nepali Rupees Forty-Seven Thousand Only) is based on 1,241 kg net recoverable scrap metal at a weighted rate of NPR 42.00/kg minus NPR 5,000 handling/transportation deduction. The recommended minimum auction reserve bid is NPR 47,000.',
            },
          ],
        },
        {
          id: 'sec-observations',
          title: '5. Recommendations for Disposal / Action',
          headingLevel: 1,
          pageBreakBefore: false,
          blocks: [
            {
              id: 'blk-obs-list',
              type: 'list',
              style: 'numbered',
              items: [
                'Method of Disposal: The vehicle should be disposed of through public auction on an "as is, where is" basis in accordance with the Public Procurement Act, 2063 and Local Government Operation Act, 2074.',
                'Minimum Bid Price: The recommended minimum reserve bid price for the auction is NPR 47,000.00 (Nepali Rupees Forty-Seven Thousand Only). Bids below this amount should not be accepted.',
                'Buyer Responsibility: Gas cutting, dismantling, crane loading, and transportation from the Bhimsen Thapa Rural Municipality premises shall be the sole responsibility and cost of the successful bidder.',
                'Transport Office Records: Since de-registration has already been completed, the vehicle cannot be re-registered for road use and shall be handed over strictly as scrap metal.',
              ],
            },
          ],
        },
        {
          id: 'sec-signatures',
          title: '6. Report Prepared & Signed By',
          headingLevel: 1,
          pageBreakBefore: false,
          blocks: [
            {
              id: 'blk-sig',
              type: 'signature',
              title: 'Official Technical Sign-off',
              signers: [
                {
                  id: 'sig-1',
                  name: 'Saroj Chalise',
                  designation: 'Mechanical Engineer',
                  org: 'Appraisal Consultant to Bhimsen Thapa Rural Municipality',
                  license: 'NEC License: 2016, Mechanical "A" Category',
                  signatureDate: '2026-10-15',
                  hasStamp: true,
                },
              ],
            },
          ],
        },
      ],
      lastModified: new Date().toISOString(),
    };

    setDocument(scrapDoc);
    showToast('Loaded Total Fire Loss Scrap Valuation Sample (GA. PRA. BAB 0236)', 'success');
  };

  // Clear form
  const handleClear = () => {
    setDocument((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        clientName: '',
        clientAddress: '',
        vehicleRegNo: '',
        makeModel: '',
        reportRefNo: '',
      },
      lastModified: new Date().toISOString(),
    }));
    showToast('Vehicle and client inputs cleared.', 'info');
  };

  // Reset defaults
  const handleResetDefaults = () => {
    const master = createMasterDocument();
    setDocument(master);
    showToast('Reset to Master Document Baseline template.', 'info');
  };

  // Recalculate
  const handleRecalculate = () => {
    const inputs: ValuationInputs = {
      methodology: 'depreciation',
      replacementPrice: 5485000,
      depreciationMethod: 'diminishing',
      depreciationRatePct: 20,
      usefulLifeYears: 10,
      mfgYear: 2016,
      valuationYear: 2026,
      actualMileage: 193974,
      benchmarkMileage: 200000,
      mileageRatePct: 2,
      marketDemandPct: 10,
      conditionAdjustmentPct: 15,
      repairDeductionAmount: 0,
      distressFactorPct: 85,
      scrap: DEFAULT_SCRAP_INPUTS,
      marketComp: DEFAULT_MARKET_COMP_INPUTS,
      reconciliation: DEFAULT_RECONCILIATION_INPUTS,
    };
    const res = computeValuation(inputs);
    handleApplyValuation(res, inputs);
    showToast(`Recalculated: Fair Market Value NPR ${formatNPR(res.fairMarketValue)} (${res.fairMarketValueInWords})`, 'success');
  };

  // Validate required fields
  const handleValidate = () => {
    const issues: string[] = [];
    const meta = document.meta;
    if (!meta.clientName) issues.push('Client / Cooperative Institution Name is missing (Tab 1).');
    if (!meta.vehicleRegNo) issues.push('Vehicle Registration Number is missing (Tab 2).');
    if (!meta.makeModel) issues.push('Make and Model is missing (Tab 2).');
    if (!meta.reportRefNo) issues.push('Valuation Report Reference Number is missing (Tab 1).');
    if (!meta.preparedBy) issues.push('Prepared By (Engineer name) is missing (Tab 7).');

    setValidationErrors(issues);
    setShowValidationPanel(true);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2));
    const a = window.document.createElement('a');
    a.href = dataStr;
    const safeRegNo = (document.meta.vehicleRegNo || 'Vehicle').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeRegNo}_Valuation_Data.json`;
    a.click();
    showToast('Document JSON exported successfully.', 'success');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.sections && parsed.meta) {
          setDocument(parsed);
          showToast('Valuation document successfully imported.', 'success');
        } else if (parsed.form) {
          setDocument(createMasterDocument(parsed));
          showToast('Vehicle data imported from raw format.', 'success');
        } else {
          showToast('Unrecognized JSON format.', 'warn');
        }
      } catch (err: any) {
        showToast('Failed to parse JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Meta change helper
  const handleMetaChange = (field: keyof typeof document.meta, val: string) => {
    setDocument((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: val,
      },
      lastModified: new Date().toISOString(),
    }));
  };

  // Add Section
  const handleAddSection = () => {
    const title = prompt('Enter title for the new section:', 'Additional Technical Findings & Annexures');
    if (!title || !title.trim()) return;

    const newSection: DocumentSection = {
      id: `sec-${Date.now()}`,
      title: title.trim(),
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: `blk-${Date.now()}-1`,
          type: 'paragraph',
          text: 'Enter detailed findings, descriptions, or regulatory declarations here.',
          alignment: 'left',
        },
      ],
    };

    setDocument((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      lastModified: new Date().toISOString(),
    }));
  };

  // Add Block Modal handling
  const handleOpenAddBlockModal = (sectionId: string, atIndex?: number) => {
    setAddBlockModal({
      isOpen: true,
      sectionId,
      atIndex,
    });
  };

  const handleSelectBlockType = (type: BlockType) => {
    const { sectionId, atIndex } = addBlockModal;
    if (!sectionId) return;

    let newBlock: any;
    const now = Date.now();

    switch (type) {
      case 'heading':
        newBlock = { id: `blk-${now}`, type: 'heading', level: 2, text: 'New Subsection Title' };
        break;
      case 'paragraph':
        newBlock = { id: `blk-${now}`, type: 'paragraph', text: 'Enter observation remarks or findings...', alignment: 'left' };
        break;
      case 'table':
        newBlock = {
          id: `blk-${now}`,
          type: 'table',
          caption: 'Audit Data Table',
          headers: ['Item', 'Description', 'Value', 'Remarks'],
          rows: [
            ['1', 'Sample Observation', 'Compliant', 'No defects noted'],
            ['2', 'Component Inspection', 'Satisfactory', 'Regular wear only'],
          ],
          hasBorders: true,
          striped: true,
        };
        break;
      case 'key_value':
        newBlock = {
          id: `blk-${now}`,
          type: 'key_value',
          title: 'Technical Particulars',
          columns: 2,
          items: [
            { label: 'Inspection Parameter', value: 'Standard Rating' },
            { label: 'Assessed By', value: 'Mechanical Engineer' },
          ],
        };
        break;
      case 'callout':
        newBlock = {
          id: `blk-${now}`,
          type: 'callout',
          variant: 'certificate',
          title: 'TECHNICAL DECLARATION',
          text: 'The vehicle is certified roadworthy and structurally compliant with governmental standards.',
        };
        break;
      case 'list':
        newBlock = {
          id: `blk-${now}`,
          type: 'list',
          style: 'bullet',
          items: ['First technical observation point', 'Second recommendation or maintenance advisory'],
        };
        break;
      case 'image':
        newBlock = {
          id: `blk-${now}`,
          type: 'image',
          filename: 'inspection_detail.jpg',
          caption: 'Detailed view of chassis crossmember and drivetrain',
          widthPct: 80,
        };
        break;
      case 'image_gallery':
        newBlock = {
          id: `blk-${now}`,
          type: 'image_gallery',
          columns: 2,
          items: [
            { id: `img-${now}-1`, filename: 'photo_angle1.jpg', title: 'Perspective View 1', caption: 'Exterior bodywork' },
            { id: `img-${now}-2`, filename: 'photo_angle2.jpg', title: 'Perspective View 2', caption: 'Undercarriage view' },
          ],
        };
        break;
      case 'signature':
        newBlock = {
          id: `blk-${now}`,
          type: 'signature',
          title: 'Authorized Verification',
          signers: [
            {
              id: `sig-${now}`,
              name: document.meta.preparedBy || 'Er. Saroj Chalise',
              designation: 'Mechanical Engineer',
              org: document.meta.organizationName,
              license: 'NEC Reg. No: 14289-Mech',
              signatureDate: document.meta.valuationDate,
              hasStamp: true,
            },
          ],
        };
        break;
      case 'page_break':
        newBlock = { id: `blk-${now}`, type: 'page_break' };
        break;
      default:
        newBlock = { id: `blk-${now}`, type: 'paragraph', text: 'New content block', alignment: 'left' };
    }

    setDocument((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newBlocks = [...sec.blocks];
        if (atIndex !== undefined && atIndex >= 0 && atIndex <= newBlocks.length) {
          newBlocks.splice(atIndex, 0, newBlock);
        } else {
          newBlocks.push(newBlock);
        }
        return { ...sec, blocks: newBlocks };
      });
      return { ...prev, sections: newSections, lastModified: new Date().toISOString() };
    });
  };

  // Sync valuation calculation results to document
  const handleApplyValuation = (results: ValuationResults, inputs: ValuationInputs) => {
    setDocument((prev) => {
      const newSections = prev.sections.map((sec) => {
        // 1. Update Certificate Section callout
        if (sec.id === 'sec-cert') {
          const newBlocks = sec.blocks.map((b) => {
            if (b.type === 'callout') {
              if (inputs.methodology === 'scrap') {
                return {
                  ...b,
                  title: 'VALUATION CERTIFICATE OF VEHICLE FOR SCRAP DISPOSAL',
                  text: `This is to certify that upon the formal requisition of ${prev.meta.clientName}, the undersigned Mechanical Engineer conducted an on-site physical appraisal and salvage evaluation of vehicle ${prev.meta.vehicleRegNo} (${prev.meta.makeModel}) on ${prev.meta.valuationDate} at ${prev.meta.placeOfInspection}.
Based on confirmed total fire/destructive loss, unladen kerb weight deductions, metal loss due to thermal scaling, and prevailing scrap steel/cast iron melting rates in Nepal:
• Assessed Net Scrap Value: NPR ${formatNPR(results.fairMarketValue)} (${results.fairMarketValueInWords})
• Recommended Minimum Auction Reserve Bid: NPR ${formatNPR(results.forcedSaleValue)} (${results.forcedSaleValueInWords})
• Registration Status: ${inputs.scrap?.deregistrationStatus || 'Already De-registered (Transport Office records updated)'}
The vehicle is permanently dysfunctional beyond economical repair and is approved strictly for scrap disposal.`,
                };
              } else if (inputs.methodology === 'market_comparable') {
                return {
                  ...b,
                  title: 'MARKET COMPARABLE VALUATION CERTIFICATE',
                  text: `This is to certify that upon the formal request of ${prev.meta.clientName}, the undersigned Mechanical Engineer conducted a market appraisal of vehicle ${prev.meta.vehicleRegNo} (${prev.meta.makeModel}) on ${prev.meta.valuationDate} at ${prev.meta.placeOfInspection}. Based on benchmarked secondary market transactions with adjustments for mileage and condition:
• Fair Market Value (FMV): NPR ${formatNPR(results.fairMarketValue)} (${results.fairMarketValueInWords})
• Distress / Forced Sale Value (FSV): NPR ${formatNPR(results.forcedSaleValue)} (${results.forcedSaleValueInWords})
The vehicle is found to be in roadworthy operating condition suitable for commercial transfer or security.`,
                };
              } else if (inputs.methodology === 'reconciliation') {
                return {
                  ...b,
                  title: 'RECONCILED VEHICLE VALUATION CERTIFICATE',
                  text: `This is to certify that upon the formal request of ${prev.meta.clientName}, the undersigned Mechanical Engineer conducted a comprehensive appraisal of vehicle ${prev.meta.vehicleRegNo} (${prev.meta.makeModel}) on ${prev.meta.valuationDate} at ${prev.meta.placeOfInspection}. Based on reconciled synthesis weighting the Cost Approach and Market Comparable Method:
• Reconciled Fair Market Value (FMV): NPR ${formatNPR(results.fairMarketValue)} (${results.fairMarketValueInWords})
• Distress / Forced Sale Value (FSV): NPR ${formatNPR(results.forcedSaleValue)} (${results.forcedSaleValueInWords})
The vehicle represents sound collateral security backed by both technical life and active secondary market transactions.`,
                };
              } else {
                return {
                  ...b,
                  title: 'VALUATION CERTIFICATE OF MOTOR VEHICLE',
                  text: `This is to certify that upon the formal request of ${prev.meta.clientName}, the undersigned Mechanical Engineer conducted a detailed technical appraisal and inspection of vehicle ${prev.meta.vehicleRegNo} (${prev.meta.makeModel}) on ${prev.meta.valuationDate} at ${prev.meta.placeOfInspection}. Based on replacement costing, ${inputs.depreciationMethod === 'double_declining' ? 'double declining balance depreciation' : inputs.depreciationMethod === 'straight_line' ? 'straight line depreciation' : 'diminishing balance depreciation'}, component inspection, mileage, and prevailing market demand, the assessed values are:
• Fair Market Value (FMV): NPR ${formatNPR(results.fairMarketValue)} (${results.fairMarketValueInWords})
• Distress / Forced Sale Value (FSV): NPR ${formatNPR(results.forcedSaleValue)} (${results.forcedSaleValueInWords})
The vehicle is found to be in roadworthy operating condition suitable for collateral security.`,
                };
              }
            }

            if (b.type === 'key_value') {
              const kv = b as any;
              if (inputs.methodology === 'scrap') {
                return {
                  ...kv,
                  items: [
                    { label: 'Net Realizable Scrap Value', value: `NPR ${formatNPR(results.fairMarketValue)}`, highlight: true },
                    { label: 'Minimum Auction Bid', value: `NPR ${formatNPR(results.forcedSaleValue)}`, highlight: true },
                    { label: 'Unladen Kerb Weight', value: `${results.scrap.kerbWeightKg} kg` },
                    { label: 'Net Scrap Metal Weight', value: `${results.scrap.netScrapWeightKg} kg` },
                    { label: 'Weighted Scrap Rate', value: `NPR ${results.scrap.weightedRatePerKg} / kg` },
                    { label: 'Registration Status', value: inputs.scrap?.deregistrationStatus || 'De-registered' },
                  ],
                };
              } else {
                const newItems = kv.items.map((item: any) => {
                  if (item.label.includes('Fair Market Value') || item.label.includes('Scrap Value')) {
                    return { ...item, label: 'Fair Market Value', value: `NPR ${formatNPR(results.fairMarketValue)}` };
                  }
                  if (item.label.includes('Forced Sale') || item.label.includes('Auction Bid')) {
                    return { ...item, label: 'Forced Sale Value', value: `NPR ${formatNPR(results.forcedSaleValue)}` };
                  }
                  return item;
                });
                return { ...kv, items: newItems };
              }
            }
            return b;
          });
          return { ...sec, blocks: newBlocks };
        }

        // 2. Update Valuation Math computation section
        if (sec.id === 'sec-valuation') {
          if (inputs.methodology === 'scrap') {
            const scrap = results.scrap;
            const nonMetallicRows = inputs.scrap.nonMetallicDeductions.map((d, i) => [
              String(i + 1),
              d.component,
              String(d.weightKg),
              d.remarks,
            ]);

            const metalRateRows = inputs.scrap.metalRates.map((mr) => [
              mr.metalType,
              `${mr.sharePct}% share`,
              `NPR ${mr.ratePerKg.toFixed(2)}`,
              `NPR ${((mr.sharePct / 100) * mr.ratePerKg).toFixed(2)} / kg contribution`,
            ]);

            return {
              ...sec,
              title: '5. Scrap Valuation Methodology & Salvage Computation',
              blocks: [
                {
                  id: 'blk-val-method',
                  type: 'paragraph',
                  text: results.rationale,
                },
                {
                  id: 'blk-val-step1-2',
                  type: 'table',
                  caption: 'Step 1 & 2: Kerb Weight & Non-Metallic Component Deductions',
                  headers: ['S.N.', 'Component / Deduction Description', 'Weight (kg)', 'Technical Observation / Fire Impact'],
                  rows: [
                    ['0', 'Vehicle Unladen / Kerb Weight (Manufacturer Spec)', String(scrap.kerbWeightKg), 'Standard manufacturer kerb weight'],
                    ...nonMetallicRows,
                    ['Total', 'Total Non-Metallic Deductions', String(scrap.totalNonMetallicDeductionKg), 'Deducted from gross weight'],
                    ['Gross', `Gross Metallic Weight (${scrap.kerbWeightKg} kg - ${scrap.totalNonMetallicDeductionKg} kg)`, String(scrap.grossMetallicWeightKg), 'Remaining metallic material on chassis'],
                  ],
                  alignments: ['center', 'left', 'center', 'left'],
                  hasBorders: true,
                  striped: true,
                },
                {
                  id: 'blk-val-step3-5',
                  type: 'table',
                  caption: 'Step 3, 4 & 5: Metal Recovery, Weighted Scrap Rates & Net Value',
                  headers: ['Metal Category / Parameter', 'Weight / Share', 'Rate (NPR/kg)', 'Value Contribution (NPR)'],
                  rows: [
                    ['Gross Metallic Weight', `${scrap.grossMetallicWeightKg} kg`, 'Baseline', 'Unscaled metallic mass'],
                    [`Metal Loss (Fire Oxidation & Scale Deduction @ ${inputs.scrap.oxidationLossPct}%)`, `-${scrap.oxidationLossKg} kg`, 'Scale Loss', `${inputs.scrap.oxidationLossPct}% loss due to intense oxidation`],
                    ['Net Recoverable Scrap Metal Weight', `${scrap.netScrapWeightKg} kg`, 'Net Scrap', 'Effective recoverable weight (~1,240 kg)'],
                    ...metalRateRows,
                    ['Weighted Average Scrap Metal Rate', '100%', `NPR ${scrap.weightedRatePerKg.toFixed(2)}`, `NPR ${scrap.weightedRatePerKg.toFixed(2)} / kg combined`],
                    [`Gross Scrap Value (${scrap.netScrapWeightKg} kg @ NPR ${scrap.weightedRatePerKg.toFixed(2)}/kg)`, `${scrap.netScrapWeightKg} kg`, `NPR ${scrap.weightedRatePerKg.toFixed(2)}`, formatNPR(scrap.grossScrapValue)],
                    ['Less: Gas Cutting, Dismantling & Transport to Mill', 'Lump Sum', 'Deduction', `-${formatNPR(inputs.scrap.transportHandlingDeduction)}`],
                    ['Assessed Net Scrap Value (Rounded Off)', 'Final Value', `NPR ${formatNPR(results.fairMarketValue)}`, results.fairMarketValueInWords],
                    ['Recommended Minimum Auction Reserve Bid', 'Reserve Price', `NPR ${formatNPR(results.forcedSaleValue)}`, results.forcedSaleValueInWords],
                  ],
                  alignments: ['left', 'center', 'center', 'right'],
                  hasBorders: true,
                  striped: true,
                },
                {
                  id: 'blk-val-note',
                  type: 'callout',
                  variant: 'calculation',
                  title: 'Scrap Valuation Basis Summary',
                  text: `The assessed net scrap value of NPR ${formatNPR(results.fairMarketValue)} (${results.fairMarketValueInWords}) reflects net metal recovery of ${scrap.netScrapWeightKg} kg at NPR ${scrap.weightedRatePerKg}/kg less NPR ${formatNPR(inputs.scrap.transportHandlingDeduction)} transport. Recommended minimum reserve bid for auction: NPR ${formatNPR(results.forcedSaleValue)}.`,
                },
              ],
            };
          } else if (inputs.methodology === 'market_comparable') {
            const compRows = inputs.marketComp.comparables.map((c) => [
              c.vehicleRef,
              String(c.modelYear),
              c.source,
              formatNPR(c.askingPrice),
              (c.mileageAdj >= 0 ? '+' : '') + formatNPR(c.mileageAdj),
              (c.conditionAdj >= 0 ? '+' : '') + formatNPR(c.conditionAdj),
              formatNPR(c.indicatedValue),
            ]);

            return {
              ...sec,
              title: '5. Market Comparable Valuation Methodology',
              blocks: [
                {
                  id: 'blk-val-method',
                  type: 'paragraph',
                  text: results.rationale,
                },
                {
                  id: 'blk-val-table',
                  type: 'table',
                  caption: 'Comparable Market Transactions & Indicated Values',
                  headers: ['Comparable Reference', 'Year', 'Market Source', 'Quoted Price', 'Mileage Adj.', 'Condition Adj.', 'Indicated Value (NPR)'],
                  rows: [
                    ...compRows,
                    ['Average Indicated Market Value', 'Avg', '-', formatNPR(results.marketComp.averageIndicatedValue), '-', '-', formatNPR(results.marketComp.averageIndicatedValue)],
                    ['Assessed Fair Market Value (FMV)', 'Rounded', '-', formatNPR(results.fairMarketValue), '-', '-', results.fairMarketValueInWords],
                    ['Distress / Forced Sale Value (FSV)', `${inputs.marketComp.distressFactorPct}%`, '-', formatNPR(results.forcedSaleValue), '-', '-', results.forcedSaleValueInWords],
                  ],
                  alignments: ['left', 'center', 'left', 'right', 'right', 'right', 'right'],
                  hasBorders: true,
                  striped: true,
                },
                {
                  id: 'blk-val-note',
                  type: 'callout',
                  variant: 'calculation',
                  title: 'Market Analysis Summary',
                  text: `Valuation is grounded on active secondary market listings of identical vehicles in Gandaki / Bagmati province, adjusted for odometer variance and mechanical grading.`,
                },
              ],
            };
          } else if (inputs.methodology === 'reconciliation') {
            return {
              ...sec,
              title: '5. Reconciliation Valuation Methodology',
              blocks: [
                {
                  id: 'blk-val-method',
                  type: 'paragraph',
                  text: results.rationale,
                },
                {
                  id: 'blk-val-table',
                  type: 'table',
                  caption: 'Valuation Synthesis & Reconciliation Matrix',
                  headers: ['Appraisal Approach', 'Indicated Value (NPR)', 'Weight (%)', 'Weighted Value (NPR)', 'Remarks'],
                  rows: [
                    ['Cost Approach (Depreciated Replacement Cost)', formatNPR(inputs.reconciliation.costApproachValue), `${inputs.reconciliation.costApproachWeightPct}%`, formatNPR((inputs.reconciliation.costApproachValue * inputs.reconciliation.costApproachWeightPct) / 100), 'Reflects technical wear, age, and component condition ratings'],
                    ['Market Comparable Approach', formatNPR(inputs.reconciliation.marketApproachValue), `${inputs.reconciliation.marketApproachWeightPct}%`, formatNPR((inputs.reconciliation.marketApproachValue * inputs.reconciliation.marketApproachWeightPct) / 100), 'Reflects buyer demand and active secondary market transactions'],
                    ['Reconciled Fair Market Value (FMV)', formatNPR(results.fairMarketValue), '100%', formatNPR(results.fairMarketValue), results.fairMarketValueInWords],
                    ['Distress / Forced Sale Value (FSV)', formatNPR(results.forcedSaleValue), `${inputs.reconciliation.distressFactorPct}%`, formatNPR(results.forcedSaleValue), results.forcedSaleValueInWords],
                  ],
                  alignments: ['left', 'right', 'center', 'right', 'left'],
                  hasBorders: true,
                  striped: true,
                },
                {
                  id: 'blk-val-note',
                  type: 'callout',
                  variant: 'calculation',
                  title: 'Reconciliation Basis Summary',
                  text: `Cost and Market approaches have been harmonized using engineering weights to provide balanced valuation security for financial underwriting.`,
                },
              ],
            };
          } else {
            // Standard Depreciation (Diminishing / Straight Line / Double Declining)
            const depMethodName = inputs.depreciationMethod === 'double_declining'
              ? `Double Declining Balance (${Math.round(2 * 100 / Math.max(1, inputs.usefulLifeYears))}% p.a.)`
              : inputs.depreciationMethod === 'straight_line'
              ? `${inputs.depreciationRatePct}% p.a. (Straight Line)`
              : `${inputs.depreciationRatePct}% p.a. (Diminishing / WDV)`;

            const newBlocks = sec.blocks.map((b) => {
              if (b.type === 'paragraph' && b.id === 'blk-val-method') {
                return { ...b, text: results.rationale };
              }
              if (b.type === 'table') {
                const tb = b as any;
                const newRows = [
                  ['A', 'Current Replacement Cost (New)', 'Dealer Quotation', formatNPR(inputs.replacementPrice), `New equivalent ${prev.meta.makeModel}`],
                  ['B', `Depreciation Factor (Age: ${results.depreciation.ageYears} Years)`, depMethodName, `-${formatNPR(inputs.replacementPrice - results.depreciation.baseDepreciatedValue)}`, `Depreciation factor after ${results.depreciation.ageYears} operating years`],
                  ['C', 'Base Depreciated Value', 'Subtotal (A - B)', formatNPR(results.depreciation.baseDepreciatedValue), 'Theoretical residual mechanical value'],
                  ['D', 'Condition & Maintenance Premium', `+${inputs.conditionAdjustmentPct}% of Residual`, `+${formatNPR(results.depreciation.conditionAdjustmentAmount)}`, 'Mechanical and structural rating adjustments'],
                  ['E', 'Mileage Adjustment', `Benchmark ${inputs.benchmarkMileage.toLocaleString()} km`, (results.depreciation.mileageAdjustmentAmount >= 0 ? '+' : '') + formatNPR(results.depreciation.mileageAdjustmentAmount), `Actual ${inputs.actualMileage.toLocaleString()} km vs benchmark`],
                  ['F', 'Market Demand Adjustment (Nepal)', `+${inputs.marketDemandPct}% Market Premium`, `+${formatNPR(results.depreciation.marketDemandAdjustmentAmount)}`, 'Commercial resale demand factor in regional market'],
                  ['G', 'Deductions for Pending Repairs', 'Deduction', `-${formatNPR(inputs.repairDeductionAmount)}`, inputs.repairDeductionAmount > 0 ? 'Mechanical repair allowance' : 'No major repair required'],
                  ['H', 'Assessed Fair Market Value (FMV)', 'Rounded Off', formatNPR(results.fairMarketValue), results.fairMarketValueInWords],
                  ['I', 'Distress / Forced Sale Value (FSV)', `${inputs.distressFactorPct}% of FMV`, formatNPR(results.forcedSaleValue), results.forcedSaleValueInWords],
                ];
                return { ...tb, rows: newRows };
              }
              return b;
            });
            return {
              ...sec,
              title: '5. Valuation Methodology & Mathematical Computation',
              blocks: newBlocks,
            };
          }
        }

        // 3. Update Observations & Recommendations for scrap if scrap was chosen
        if (sec.id === 'sec-observations' && inputs.methodology === 'scrap') {
          return {
            ...sec,
            title: '6. Technical Observations & Recommendations for Disposal',
            blocks: [
              {
                id: 'blk-obs-list',
                type: 'list',
                style: 'numbered',
                items: [
                  'Method of Disposal: The vehicle should be disposed of through public auction on an "as is, where is" basis in accordance with the Public Procurement Act, 2063 and Local Government Operation Act, 2074.',
                  `Minimum Bid Price: Recommended minimum auction reserve bid price is NPR ${formatNPR(results.forcedSaleValue)} (${results.forcedSaleValueInWords}). Bids below this figure should not be accepted.`,
                  'Buyer Responsibility: Gas cutting, dismantling, crane loading, and transportation from the site shall be the sole responsibility and cost of the successful bidder.',
                  `Transport Office Records: Registration status is recorded as ${inputs.scrap?.deregistrationStatus || 'Already De-registered'}; the vehicle cannot be re-registered for road use and is handed over strictly as scrap metal.`,
                ],
              },
            ],
          };
        }

        return sec;
      });

      return { ...prev, sections: newSections, lastModified: new Date().toISOString() };
    });

    showToast(`Valuation applied (${inputs.methodology.toUpperCase()}): NPR ${formatNPR(results.fairMarketValue)}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-black font-sans flex flex-col">
      {/* SBD-SQ Top Bar */}
      <SbdTopBar
        document={document}
        completedFieldsCount={completedFieldsCount}
        totalFieldsCount={totalFieldsCount}
        isCompiling={isCompiling}
        onPrintSavePdf={handlePrintSavePdf}
        onLoadSample={handleLoadSample}
        onLoadScrapSample={handleLoadScrapSample}
        onClear={handleClear}
        onResetDefaults={handleResetDefaults}
        onRecalculate={handleRecalculate}
        onValidate={handleValidate}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onOpenLatex={() => setLatexModalOpen(true)}
        onSwitchToPreview={() => setActiveTab('preview')}
        validationIssueCount={validationErrors.length}
      />

      {/* Validation Banner if active */}
      {showValidationPanel && (
        <div className="sbd-info mx-4 mt-3 bg-rose-50 border-rose-300 text-rose-950 flex items-start justify-between">
          <div>
            <div className="font-bold text-xs mb-1">Validation Audit Results:</div>
            {validationErrors.length === 0 ? (
              <div className="text-emerald-700 font-semibold text-xs">
                ✓ All essential technical and valuation fields are complete!
              </div>
            ) : (
              <ul className="list-disc pl-5 text-xs space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowValidationPanel(false)}
            className="text-xs font-bold text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>
      )}

      {/* SBD-SQ Tabs */}
      <SbdTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Panels */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
        {activeTab === 'general' && (
          <TabGeneral document={document} onMetaChange={handleMetaChange} />
        )}

        {activeTab === 'specs' && (
          <TabSpecs document={document} onUpdateDocument={setDocument} />
        )}

        {activeTab === 'components' && (
          <TabComponents document={document} onUpdateDocument={setDocument} />
        )}

        {activeTab === 'valuation' && (
          <TabValuation
            document={document}
            onApplyValuation={handleApplyValuation}
            onLoadScrapSample={handleLoadScrapSample}
          />
        )}

        {activeTab === 'remarks' && (
          <TabRemarks document={document} onUpdateDocument={setDocument} />
        )}

        {activeTab === 'photos' && (
          <TabPhotos document={document} onUpdateDocument={setDocument} />
        )}

        {activeTab === 'signatures' && (
          <TabSignatures document={document} onUpdateDocument={setDocument} />
        )}

        {activeTab === 'overrides' && (
          <TabOverrides
            document={document}
            onUpdateDocument={setDocument}
            onOpenAddBlockModal={handleOpenAddBlockModal}
            onAddSection={handleAddSection}
          />
        )}

        {activeTab === 'preview' && (
          <TabPreviewEditable
            document={document}
            onUpdateDocument={setDocument}
            onPrintSavePdf={handlePrintSavePdf}
            isCompiling={isCompiling}
            pdfBlobUrl={pdfBlobUrl}
            onOpenAddBlockModal={handleOpenAddBlockModal}
          />
        )}
      </main>

      {/* Modals */}
      <AddBlockModal
        isOpen={addBlockModal.isOpen}
        onClose={() => setAddBlockModal({ isOpen: false, sectionId: '' })}
        onSelectType={handleSelectBlockType}
        targetSectionTitle={
          document.sections.find((s) => s.id === addBlockModal.sectionId)?.title
        }
      />

      <LatexSourceModal
        isOpen={latexModalOpen}
        onClose={() => setLatexModalOpen(false)}
        latexCode={generatedLatex}
      />

      <ValuationCalculatorModal
        isOpen={calculatorModalOpen}
        onClose={() => setCalculatorModalOpen(false)}
        document={document}
        onApplyValuation={handleApplyValuation}
      />

      <VariationManagerModal
        isOpen={variationsModalOpen}
        onClose={() => setVariationsModalOpen(false)}
        currentDocument={document}
        onLoadVariation={(loaded) => setDocument(loaded)}
        onResetToMaster={handleResetDefaults}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded shadow-xl text-xs font-medium border ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-600'
              : toast.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-600'
              : toast.type === 'warn'
              ? 'bg-amber-900 text-amber-100 border-amber-600'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 text-sm leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
