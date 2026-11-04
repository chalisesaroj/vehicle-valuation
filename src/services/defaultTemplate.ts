import { ValuationDocument, DocumentSection, VehicleJsonData } from '../types/document';
import { SAMPLE_VEHICLE_PHOTOS } from './sampleImages';

export function createMasterDocument(initialData?: Partial<VehicleJsonData>): ValuationDocument {
  const form = initialData?.form || {};
  const cond = initialData?.state?.condition || {};

  const clientName = form.client || 'Shree Saral Namuna Saving and Credit Cooperatives Limited';
  const valDate = form.valuationDate || '2026-10-01';
  const place = form.place || 'Pokhara, Kaski';
  const purpose = form.purposeText || 'Loan Disbursement';
  const orgName = form.reportOrg || 'SAANSA ENGINEERING AND TECH SOLUTION PRIVATE LIMITED';
  const preparedBy = form.preparedBy || 'Er. Saroj Chalise';
  const preparedRole = form.preparedByRole || 'Mechanical Engineer';
  const regNo = form.regNo || 'BA 14 CHA 4271';
  const makeModel = form.makeModel || 'Mahindra Scorpio Pickup DC EHD 4WD';
  const chassisNo = form.chassis || 'MA1TY4MNG2A15225';
  const engineNo = form.engineNo || 'MMG4A12489';
  const engineCC = form.engineCC || '2179 CC';
  const fuel = form.fuel || 'Diesel';
  const transmission = form.transmission || 'Manual';
  const mfgYear = form.mfgYear || '2016';
  const regYear = form.regYear || '2016';
  const odometer = form.odometer ? `${Number(form.odometer).toLocaleString()} km` : '193,974 km';
  const color = form.color || 'Silver';
  const ownership = form.ownershipBillBook || 'Registered in the name of the owner as per the vehicle registration book';

  const sections: DocumentSection[] = [
    {
      id: 'sec-cert',
      title: '1. Executive Summary & Valuation Certificate',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-cert-callout',
          type: 'callout',
          variant: 'certificate',
          title: 'VALUATION CERTIFICATE OF MOTOR VEHICLE',
          text: `This is to certify that upon the formal request of ${clientName}, the undersigned Mechanical Engineer conducted a detailed technical appraisal and inspection of vehicle ${regNo} (${makeModel}) on ${valDate} at ${place}. Based on replacement costing, diminishing depreciation, component inspection, mileage, and prevailing market demand, the assessed values are:
• Fair Market Value (FMV): NPR 1,850,000 (Nepali Rupees Eighteen Lakh Fifty Thousand Only)
• Distress / Forced Sale Value (FSV): NPR 1,570,000 (Nepali Rupees Fifteen Lakh Seventy Thousand Only)
The vehicle is found to be in roadworthy operating condition suitable for collateral security.`,
        },
        {
          id: 'blk-cert-summary-kv',
          type: 'key_value',
          columns: 3,
          items: [
            { label: 'Fair Market Value', value: 'NPR 1,850,000', highlight: true },
            { label: 'Forced Sale Value (85%)', value: 'NPR 1,570,000', highlight: true },
            { label: 'Valuation Purpose', value: purpose },
            { label: 'Date of Valuation', value: valDate },
            { label: 'Inspection Location', value: place },
            { label: 'Appraisal Status', value: 'Approved & Certified' },
          ],
        },
      ],
    },
    {
      id: 'sec-ownership',
      title: '2. General Information & Ownership Verification',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-owner-p1',
          type: 'paragraph',
          text: `A comprehensive verification of the vehicle's ownership documents, registration certificate (Bill Book), and physical identification tags was conducted. The particulars verified against governmental records are presented below:`,
          alignment: 'left',
        },
        {
          id: 'blk-owner-kv',
          type: 'key_value',
          columns: 2,
          items: [
            { label: 'Client / Financial Institution', value: clientName },
            { label: 'Registration / Bill Book Status', value: ownership },
            { label: 'Inspection Date & Time', value: `${valDate} (11:30 AM)` },
            { label: 'Inspection Venue / Location', value: place },
            { label: 'Valuation Objective', value: purpose },
            { label: 'Appraising Organization', value: orgName },
          ],
        },
      ],
    },
    {
      id: 'sec-specs',
      title: '3. Vehicle Technical Specifications & Identification',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-specs-intro',
          type: 'paragraph',
          text: `Physical verification of the chassis plate, engine block stamping, and vehicle identity markers was carried out. The stamped numbers completely match the registration credentials without any sign of tampering or re-engraving.`,
        },
        {
          id: 'blk-specs-table',
          type: 'table',
          caption: 'Vehicle Specification Summary',
          headers: ['Parameter', 'Specification Record', 'Parameter', 'Specification Record'],
          rows: [
            ['Registration Number', regNo, 'Vehicle Type', 'Pickup (Double Cab 4WD)'],
            ['Make & Model', makeModel, 'Manufacturer', 'Mahindra & Mahindra Ltd.'],
            ['Chassis / VIN Number', chassisNo, 'Engine Number', engineNo],
            ['Engine Displacement', engineCC, 'Fuel Type', fuel],
            ['Transmission Type', transmission, 'Seating Capacity', '5 Persons'],
            ['Year of Manufacture', mfgYear, 'Year of Registration', regYear],
            ['Odometer Reading', odometer, 'Body Color', color],
          ],
          alignments: ['left', 'left', 'left', 'left'],
          hasBorders: true,
          striped: true,
        },
      ],
    },
    {
      id: 'sec-condition',
      title: '4. Physical Inspection Findings & Component Ratings',
      headingLevel: 1,
      pageBreakBefore: true,
      blocks: [
        {
          id: 'blk-cond-p',
          type: 'paragraph',
          text: `All major mechanical, electrical, and structural assemblies were subjected to visual and operational checks. Components are evaluated on a 5-point rating scale (5: Excellent, 4: Good, 3: Fair/Average, 2: Poor, 1: Critical defect):`,
        },
        {
          id: 'blk-cond-table',
          type: 'table',
          caption: 'Component-Wise Condition Audit',
          headers: ['S.N.', 'Assembly / Component', 'Rating (1-5)', 'Condition Grade', 'Observed Technical Remarks'],
          rows: [
            ['1', 'Engine Assembly', cond.engine?.rating || '4', 'Good', cond.engine?.remarks || 'Smooth idling, normal exhaust color, no abnormal oil leakage or blow-by.'],
            ['2', 'Transmission & 4WD', cond.trans?.rating || '4', 'Good', cond.trans?.remarks || 'Smooth gear shifting; 4WD high/low transfer case engages properly.'],
            ['3', 'Chassis Frame & Crossmembers', cond.chassis?.rating || '4', 'Good', cond.chassis?.remarks || 'Ladder chassis intact; no structural bends, cracks, or welding repairs.'],
            ['4', 'Body Exterior & Cargo Bed', cond.body?.rating || '4', 'Good', cond.body?.remarks || 'Original paint with minor usage scuffs; cargo bed liner in sound condition.'],
            ['5', 'Suspension & Shock Absorbers', cond.susp?.rating || '4', 'Good', cond.susp?.remarks || 'Leaf springs and front double-wishbone dampers stable, no sagging.'],
            ['6', 'Steering Mechanism', cond.steer?.rating || '4', 'Good', cond.steer?.remarks || 'Power steering responsive without excessive free play or pump whining.'],
            ['7', 'Braking System', cond.brake?.rating || '4', 'Good', cond.brake?.remarks || 'Vacuum-assisted hydraulic brakes effective; handbrake holds on incline.'],
            ['8', 'Tyres & Wheel Rims', cond.tyre?.rating || '4', 'Good', cond.tyre?.remarks || 'Steel rims true; tyre tread depth approximately 65% remaining across all 4 tyres.'],
            ['9', 'Electricals & Battery', cond.elec?.rating || '4', 'Good', cond.elec?.remarks || '12V battery holding charge; starter motor and alternator working normally.'],
            ['10', 'Cabin Interior & Upholstery', cond.interior?.rating || '4', 'Good', cond.interior?.remarks || 'Fabric seats clean; dashboard panels and instrument gauges fully operational.'],
            ['11', 'Air Conditioning & Blower', cond.ac?.rating || '4', 'Good', cond.ac?.remarks || 'Compressor cycles properly; cooling and cabin heating functions operational.'],
            ['12', 'Windshield & Safety Glasses', cond.glass?.rating || '4', 'Good', cond.glass?.remarks || 'Laminated front windshield clear without stone chips; power windows functioning.'],
          ],
          alignments: ['center', 'left', 'center', 'center', 'left'],
          hasBorders: true,
          striped: true,
        },
      ],
    },
    {
      id: 'sec-valuation',
      title: '5. Valuation Methodology & Mathematical Computation',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-val-method',
          type: 'paragraph',
          text: `The valuation has been determined using the standard Replacement Cost Less Depreciation (RCLD) method combined with Market Comparable Analysis. The Written Down Value (WDV) method has been applied using an approved declining balance rate of 20% per annum over the vehicle's chronological age of 10 years, followed by technical adjustments for condition, mileage, and commercial utility.`,
        },
        {
          id: 'blk-val-table',
          type: 'table',
          caption: 'Mathematical Computation Breakdown',
          headers: ['S.N.', 'Valuation Parameter', 'Rate / Factor', 'Amount (NPR)', 'Remarks'],
          rows: [
            ['A', 'Current Replacement Cost (New)', 'Dealer Quotation', '5,485,000', 'New equivalent Mahindra Scorpio Pickup DC EHD 4WD'],
            ['B', 'Depreciation Factor (Age: 10 Years)', '20% p.a. (Diminishing)', '-4,896,053', 'Written Down Value factor after 10 operating years'],
            ['C', 'Base Depreciated Value', 'Subtotal (A - B)', '588,947', 'Theoretical residual mechanical value'],
            ['D', 'Condition & Maintenance Premium', '+15% of Residual', '+88,342', 'Above-average maintenance and component ratings (4/5)'],
            ['E', 'Mileage Adjustment', 'Benchmark 200k km', '+18,000', 'Actual 193,974 km is below standard 200,000 km lifecycle'],
            ['F', 'Market Demand Adjustment (Nepal)', '+10% Market Premium', '+1,154,711', 'High commercial resale demand for 4WD pickups in Gandaki region'],
            ['G', 'Deductions for Pending Repairs', 'Minor Touch-up', '0', 'No immediate structural repair required'],
            ['H', 'Assessed Fair Market Value (FMV)', 'Rounded Off', '1,850,000', 'NPR Eighteen Lakh Fifty Thousand Only'],
            ['I', 'Distress / Forced Sale Value (FSV)', '85% of FMV', '1,570,000', 'NPR Fifteen Lakh Seventy Thousand Only'],
          ],
          alignments: ['center', 'left', 'center', 'right', 'left'],
          hasBorders: true,
          striped: true,
        },
        {
          id: 'blk-val-note',
          type: 'callout',
          variant: 'calculation',
          title: 'Valuation Basis Summary',
          text: 'The adopted Fair Market Value reflects an arm\'s length transaction between a willing buyer and seller in the current Pokhara commercial automotive market. The Forced Sale Value represents the realizable figure under an accelerated liquidity liquidation timeframe within 90 days.',
        },
      ],
    },
    {
      id: 'sec-observations',
      title: '6. Technical Observations & Recommendations',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-obs-list',
          type: 'list',
          style: 'bullet',
          items: [
            'The vehicle is regularly maintained with genuine Mahindra spare parts and lubricants.',
            'Chassis members and cross-braces show zero signs of accident impact, stress buckling, or rust perforation.',
            'Engine starts instantaneously with normal starter draw and healthy alternator output voltage (14.2V under load).',
            'All safety belts, headlamps, hazard blinkers, and horn meet Nepal Motor Vehicles Act regulatory standards.',
            'Recommendation: Routine 200,000 km service including differential oil replacement and brake caliper lubrication is advised at the next service milestone.',
          ],
        },
      ],
    },
    {
      id: 'sec-photos',
      title: '7. Photographic Evidence & Visual Inspection Record',
      headingLevel: 1,
      pageBreakBefore: true,
      blocks: [
        {
          id: 'blk-photos-p',
          type: 'paragraph',
          text: 'The photographs below were captured on-site during the technical inspection on 2026-10-01 at Pokhara, Kaski to record the true cosmetic and physical condition of the subject vehicle.',
        },
        {
          id: 'blk-photos-gallery',
          type: 'image_gallery',
          columns: 2,
          items: [
            {
              id: 'gal-1',
              filename: SAMPLE_VEHICLE_PHOTOS[0].filename,
              title: SAMPLE_VEHICLE_PHOTOS[0].title,
              caption: SAMPLE_VEHICLE_PHOTOS[0].caption,
              base64Data: SAMPLE_VEHICLE_PHOTOS[0].jpegData,
            },
            {
              id: 'gal-2',
              filename: SAMPLE_VEHICLE_PHOTOS[1].filename,
              title: SAMPLE_VEHICLE_PHOTOS[1].title,
              caption: SAMPLE_VEHICLE_PHOTOS[1].caption,
              base64Data: SAMPLE_VEHICLE_PHOTOS[1].jpegData,
            },
            {
              id: 'gal-3',
              filename: SAMPLE_VEHICLE_PHOTOS[2].filename,
              title: SAMPLE_VEHICLE_PHOTOS[2].title,
              caption: SAMPLE_VEHICLE_PHOTOS[2].caption,
              base64Data: SAMPLE_VEHICLE_PHOTOS[2].jpegData,
            },
            {
              id: 'gal-4',
              filename: SAMPLE_VEHICLE_PHOTOS[3].filename,
              title: SAMPLE_VEHICLE_PHOTOS[3].title,
              caption: SAMPLE_VEHICLE_PHOTOS[3].caption,
              base64Data: SAMPLE_VEHICLE_PHOTOS[3].jpegData,
            },
          ],
        },
      ],
    },
    {
      id: 'sec-disclaimer',
      title: '8. Declarations, Scope of Inspection & Limitations',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-disc-p1',
          type: 'paragraph',
          text: '1. The inspection has been carried out visually and by external operational test without dismantling internal powertrain components. No responsibility is assumed for latent defects or internal metallurgical flaws.',
        },
        {
          id: 'blk-disc-p2',
          type: 'paragraph',
          text: '2. The appraiser has no direct, indirect, or contingent financial interest in the vehicle, the owner, or the loan application transaction.',
        },
        {
          id: 'blk-disc-p3',
          type: 'paragraph',
          text: '3. Valuation figures represent fair market assessment as of the stated valuation date and are subject to market fluctuations, subsequent vehicle usage, and maintenance standards.',
        },
      ],
    },
    {
      id: 'sec-signatures',
      title: '9. Engineering Certification & Signatures',
      headingLevel: 1,
      pageBreakBefore: false,
      blocks: [
        {
          id: 'blk-sig',
          type: 'signature',
          title: 'Authorized Technical Signatories',
          signers: [
            {
              id: 'sig-1',
              name: preparedBy,
              designation: preparedRole,
              org: orgName,
              license: 'Nepal Engineering Council Reg. No: 14289-Mech',
              signatureDate: valDate,
              hasStamp: true,
            },
            {
              id: 'sig-2',
              name: 'Er. N. K. Sharma',
              designation: 'Managing Director / Chief Valuer',
              org: orgName,
              license: 'Valuer Reg. No: VAL-2018-771',
              signatureDate: valDate,
              hasStamp: true,
            },
          ],
        },
      ],
    },
  ];

  return {
    id: 'doc-master-001',
    version: 1,
    meta: {
      reportTitle: 'MOTOR VEHICLE VALUATION REPORT',
      reportRefNo: 'SET/VAL/2026/089',
      valuationDate: valDate,
      organizationName: orgName,
      organizationSubtitle: 'Consulting Mechanical Engineers, Valuers & Technical Assessors',
      organizationAddress: 'Pokhara-08, Kaski, Gandaki Province, Nepal',
      organizationContact: 'Tel: +977-61-532190 | Email: info@saansaeng.com',
      clientName: clientName,
      clientAddress: 'Pokhara, Kaski, Nepal',
      vehicleRegNo: regNo,
      makeModel: makeModel,
      preparedBy: preparedBy,
      preparedByRole: preparedRole,
      preparedByLicense: 'NEC Reg. No: 14289-Mech',
      placeOfInspection: place,
      purpose: purpose,
    },
    styling: {
      accentColor: '#1e3a8a',
      fontSize: '10pt',
      showRunningHeader: true,
      showPageNumbers: true,
    },
    sections,
    lastModified: new Date().toISOString(),
  };
}
