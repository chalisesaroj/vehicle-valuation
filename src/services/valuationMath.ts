/**
 * Mathematical calculations for vehicle valuation according to standard engineering
 * and appraisal practices in Nepal:
 * 1. Cost Approach (Depreciation: Diminishing Balance, Straight Line, Double Declining Balance)
 * 2. Scrap Valuation (Kerb weight deduction, thermal oxidation loss, weighted scrap rates, transport)
 * 3. Market Comparable Method (Transaction benchmarking with mileage and condition adjustments)
 * 4. Reconciliation Method (Blended Cost + Market Comparable weighting)
 */

export type ValuationMethodology = 'depreciation' | 'scrap' | 'market_comparable' | 'reconciliation';

export type DepreciationSubMethod = 'diminishing' | 'straight_line' | 'double_declining';

export interface ValuationInputs {
  methodology: ValuationMethodology;
  // 1. Depreciation (Cost Approach)
  replacementPrice: number;
  depreciationMethod: DepreciationSubMethod;
  depreciationRatePct: number; // e.g. 20%
  usefulLifeYears: number; // e.g. 10
  mfgYear: number;
  valuationYear: number;
  actualMileage: number;
  benchmarkMileage: number;
  mileageRatePct: number; // e.g. 2% per 10k km
  marketDemandPct: number; // e.g. +10%
  conditionAdjustmentPct: number; // e.g. +15%
  repairDeductionAmount: number;
  distressFactorPct: number; // e.g. 85% of FMV

  // 2. Scrap Valuation
  scrap: ScrapInputs;

  // 3. Market Comparable Method
  marketComp: MarketComparableInputs;

  // 4. Reconciliation Method
  reconciliation: ReconciliationInputs;
}

export interface ScrapNonMetallicItem {
  id: string;
  component: string;
  weightKg: number;
  remarks: string;
}

export interface ScrapMetalRateItem {
  id: string;
  metalType: string;
  sharePct: number;
  ratePerKg: number;
}

export interface ScrapInputs {
  kerbWeightKg: number;
  nonMetallicDeductions: ScrapNonMetallicItem[];
  oxidationLossPct: number; // e.g. 15%
  metalRates: ScrapMetalRateItem[];
  transportHandlingDeduction: number; // e.g. 5000
  auctionMinBid: number; // recommended minimum reserve price
  deregistrationStatus: string;
  conditionDescription: string;
}

export interface ScrapResults {
  kerbWeightKg: number;
  totalNonMetallicDeductionKg: number;
  grossMetallicWeightKg: number;
  oxidationLossKg: number;
  netScrapWeightKg: number;
  weightedRatePerKg: number;
  grossScrapValue: number;
  transportHandlingDeduction: number;
  netRealizableScrapValue: number;
  netRealizableScrapValueInWords: string;
  auctionMinBid: number;
  auctionMinBidInWords: string;
  rationale: string;
}

export interface MarketComparableItem {
  id: string;
  vehicleRef: string;
  source: string;
  modelYear: number;
  askingPrice: number;
  mileageKm?: number;
  mileageAdj: number;
  conditionAdj: number;
  indicatedValue: number;
}

export interface MarketComparableInputs {
  comparables: MarketComparableItem[];
  distressFactorPct: number;
}

export interface MarketComparableResults {
  averageIndicatedValue: number;
  fairMarketValue: number;
  forcedSaleValue: number;
  fairMarketValueInWords: string;
  forcedSaleValueInWords: string;
  rationale: string;
}

export interface ReconciliationInputs {
  costApproachValue: number;
  costApproachWeightPct: number;
  marketApproachValue: number;
  marketApproachWeightPct: number;
  distressFactorPct: number;
}

export interface ReconciliationResults {
  reconciledFairMarketValue: number;
  forcedSaleValue: number;
  fairMarketValueInWords: string;
  forcedSaleValueInWords: string;
  rationale: string;
}

export interface ValuationResults {
  methodology: ValuationMethodology;
  rationale: string; // 1-sentence engineering rationale
  // Primary values for certificate / summary
  fairMarketValue: number;
  forcedSaleValue: number;
  fairMarketValueInWords: string;
  forcedSaleValueInWords: string;

  // Method specific results
  depreciation: {
    ageYears: number;
    baseDepreciatedValue: number;
    mileageAdjustmentAmount: number;
    conditionAdjustmentAmount: number;
    marketDemandAdjustmentAmount: number;
    subtotalBeforeRepairs: number;
    fairMarketValue: number;
    forcedSaleValue: number;
  };
  scrap: ScrapResults;
  marketComp: MarketComparableResults;
  reconciliation: ReconciliationResults;
}

export const DEFAULT_SCRAP_INPUTS: ScrapInputs = {
  kerbWeightKg: 1720,
  nonMetallicDeductions: [
    { id: 'sc-1', component: 'Tyres (rubber burned away, bead wire remains)', weightKg: 60, remarks: 'All 4 tyres incinerated' },
    { id: 'sc-2', component: 'Glass (windshields & side door glass shattered)', weightKg: 25, remarks: 'Thermal shatter / melted' },
    { id: 'sc-3', component: 'Dashboard, fascia, steering wheel & plastic trims', weightKg: 35, remarks: 'Completely incinerated' },
    { id: 'sc-4', component: 'Seats, foam cushions, upholstery & roof lining', weightKg: 45, remarks: '100% burned out' },
    { id: 'sc-5', component: 'Battery (casing destroyed, acid/plates lost)', weightKg: 15, remarks: 'Total destruction' },
    { id: 'sc-6', component: 'Wiring harness, electrical components & insulation', weightKg: 10, remarks: 'Melted copper ash' },
    { id: 'sc-7', component: 'Fluids (engine/gear oil, coolant, brake fluid)', weightKg: 20, remarks: 'Boiled off and drained' },
    { id: 'sc-8', component: 'Rubber bushings, hoses, belts & miscellaneous items', weightKg: 50, remarks: 'Destroyed by fire' },
  ],
  oxidationLossPct: 15,
  metalRates: [
    { id: 'mr-1', metalType: 'Heavy Melting Steel (HMS: chassis, axles, block)', sharePct: 70, ratePerKg: 50 },
    { id: 'mr-2', metalType: 'Cast Iron (engine head, brake drums, differential)', sharePct: 20, ratePerKg: 35 },
    { id: 'mr-3', metalType: 'Light Gauge Sheet / Burnt Skin (low recovery)', sharePct: 10, ratePerKg: 0 },
  ],
  transportHandlingDeduction: 5000,
  auctionMinBid: 47000,
  deregistrationStatus: 'Already De-registered (Transport Office records updated)',
  conditionDescription: 'Total fire loss vehicle; structural assemblies thermally distorted, annealed, and unserviceable; fit exclusively for scrap metal recycling.',
};

export const DEFAULT_MARKET_COMP_INPUTS: MarketComparableInputs = {
  comparables: [
    { id: 'mc-1', vehicleRef: 'Mahindra Scorpio DC 2017 (Gandaki)', source: 'Hamrobazaar Verified Listing', modelYear: 2017, askingPrice: 2100000, mileageAdj: -75000, conditionAdj: -50000, indicatedValue: 1975000 },
    { id: 'mc-2', vehicleRef: 'Mahindra Scorpio DC 2016 (Pokhara)', source: 'Local Dealer Transaction', modelYear: 2016, askingPrice: 1900000, mileageAdj: 15000, conditionAdj: -30000, indicatedValue: 1885000 },
    { id: 'mc-3', vehicleRef: 'Mahindra Scorpio DC 2015 (Bagmati)', source: 'Secondary Market Benchmark', modelYear: 2015, askingPrice: 1750000, mileageAdj: 50000, conditionAdj: 40000, indicatedValue: 1840000 },
  ],
  distressFactorPct: 85,
};

export const DEFAULT_RECONCILIATION_INPUTS: ReconciliationInputs = {
  costApproachValue: 1850000,
  costApproachWeightPct: 50,
  marketApproachValue: 1900000,
  marketApproachWeightPct: 50,
  distressFactorPct: 85,
};

export function computeValuation(inputs: ValuationInputs): ValuationResults {
  // 1. Depreciation (Cost Approach)
  const ageYears = Math.max(0, inputs.valuationYear - inputs.mfgYear);
  const r = inputs.depreciationRatePct / 100;
  let baseDep = 0;

  if (inputs.depreciationMethod === 'diminishing') {
    // Written Down Value: V = V0 * (1 - r)^n
    baseDep = inputs.replacementPrice * Math.pow(Math.max(0, 1 - r), ageYears);
    baseDep = Math.max(baseDep, inputs.replacementPrice * 0.10);
  } else if (inputs.depreciationMethod === 'double_declining') {
    // Double Declining Balance: r_ddb = 2 * (1 / usefulLife)
    const usefulLife = Math.max(1, inputs.usefulLifeYears || 10);
    const ddbRate = Math.min(0.5, 2 * (1 / usefulLife));
    baseDep = inputs.replacementPrice * Math.pow(Math.max(0, 1 - ddbRate), ageYears);
    baseDep = Math.max(baseDep, inputs.replacementPrice * 0.10);
  } else {
    // Straight line: V = V0 - (V0 * r * n)
    const annualDep = inputs.replacementPrice * r;
    baseDep = Math.max(inputs.replacementPrice * 0.10, inputs.replacementPrice - (annualDep * ageYears));
  }

  const mileageDiff = inputs.benchmarkMileage - inputs.actualMileage;
  const mileageAdjPct = (mileageDiff / 10000) * (inputs.mileageRatePct / 100);
  const mileageAdjustmentAmount = baseDep * mileageAdjPct;

  const conditionAdjustmentAmount = baseDep * (inputs.conditionAdjustmentPct / 100);
  const marketDemandAdjustmentAmount = baseDep * (inputs.marketDemandPct / 100);

  const subtotalBeforeRepairs = baseDep + mileageAdjustmentAmount + conditionAdjustmentAmount + marketDemandAdjustmentAmount;
  const depFmv = Math.max(0, Math.round((subtotalBeforeRepairs - inputs.repairDeductionAmount) / 5000) * 5000);
  const depFsv = Math.round((depFmv * (inputs.distressFactorPct / 100)) / 5000) * 5000;

  // 2. Scrap Valuation
  const scrapIn = inputs.scrap || DEFAULT_SCRAP_INPUTS;
  const totalNonMetallicDeductionKg = scrapIn.nonMetallicDeductions.reduce((acc, item) => acc + (Number(item.weightKg) || 0), 0);
  const grossMetallicWeightKg = Math.max(0, scrapIn.kerbWeightKg - totalNonMetallicDeductionKg);
  const oxidationLossKg = Math.round(grossMetallicWeightKg * (scrapIn.oxidationLossPct / 100));
  const netScrapWeightKg = Math.max(0, grossMetallicWeightKg - oxidationLossKg);

  const totalSharePct = scrapIn.metalRates.reduce((acc, item) => acc + (Number(item.sharePct) || 0), 0) || 100;
  const weightedRatePerKg = scrapIn.metalRates.reduce((acc, item) => {
    return acc + ((Number(item.sharePct) || 0) / totalSharePct) * (Number(item.ratePerKg) || 0);
  }, 0);

  const grossScrapValue = Math.round(netScrapWeightKg * weightedRatePerKg);
  const netRealizableScrapValue = Math.max(0, Math.round((grossScrapValue - scrapIn.transportHandlingDeduction) / 1000) * 1000);
  const auctionMinBid = scrapIn.auctionMinBid || netRealizableScrapValue;

  const scrapResults: ScrapResults = {
    kerbWeightKg: scrapIn.kerbWeightKg,
    totalNonMetallicDeductionKg,
    grossMetallicWeightKg,
    oxidationLossKg,
    netScrapWeightKg,
    weightedRatePerKg: Math.round(weightedRatePerKg * 100) / 100,
    grossScrapValue,
    transportHandlingDeduction: scrapIn.transportHandlingDeduction,
    netRealizableScrapValue,
    netRealizableScrapValueInWords: numberToWordsNPR(netRealizableScrapValue),
    auctionMinBid,
    auctionMinBidInWords: numberToWordsNPR(auctionMinBid),
    rationale: 'The vehicle was physically inspected and confirmed as a total loss beyond economical repair; hence scrap metal salvage valuation has been adopted on unladen kerb weight.',
  };

  // 3. Market Comparable
  const mCompIn = inputs.marketComp || DEFAULT_MARKET_COMP_INPUTS;
  const comps = mCompIn.comparables || [];
  const sumIndicated = comps.reduce((acc, c) => acc + (Number(c.indicatedValue) || 0), 0);
  const avgIndicated = comps.length > 0 ? Math.round(sumIndicated / comps.length) : depFmv;
  const compFmv = Math.round(avgIndicated / 5000) * 5000;
  const compFsv = Math.round((compFmv * ((mCompIn.distressFactorPct || 85) / 100)) / 5000) * 5000;

  const marketCompResults: MarketComparableResults = {
    averageIndicatedValue: avgIndicated,
    fairMarketValue: compFmv,
    forcedSaleValue: compFsv,
    fairMarketValueInWords: numberToWordsNPR(compFmv),
    forcedSaleValueInWords: numberToWordsNPR(compFsv),
    rationale: 'Market comparable method is adopted by benchmarking verifiable secondary market transactions of similar vehicles with adjustments for age, mileage, and condition.',
  };

  // 4. Reconciliation
  const reconIn = inputs.reconciliation || DEFAULT_RECONCILIATION_INPUTS;
  const costVal = reconIn.costApproachValue || depFmv;
  const marketVal = reconIn.marketApproachValue || compFmv;
  const costWt = (reconIn.costApproachWeightPct || 50) / 100;
  const marketWt = (reconIn.marketApproachWeightPct || 50) / 100;
  const blendedFmv = Math.round((costVal * costWt + marketVal * marketWt) / 5000) * 5000;
  const blendedFsv = Math.round((blendedFmv * ((reconIn.distressFactorPct || 85) / 100)) / 5000) * 5000;

  const reconciliationResults: ReconciliationResults = {
    reconciledFairMarketValue: blendedFmv,
    forcedSaleValue: blendedFsv,
    fairMarketValueInWords: numberToWordsNPR(blendedFmv),
    forcedSaleValueInWords: numberToWordsNPR(blendedFsv),
    rationale: 'The final valuation is reconciled by weighting the Cost Approach (depreciated replacement cost) and Market Comparable Method to balance technical degradation with market reality.',
  };

  // Active selection selection
  let finalFmv = depFmv;
  let finalFsv = depFsv;
  let finalRationale = '';

  switch (inputs.methodology) {
    case 'scrap':
      finalFmv = netRealizableScrapValue;
      finalFsv = auctionMinBid;
      finalRationale = scrapResults.rationale;
      break;
    case 'market_comparable':
      finalFmv = compFmv;
      finalFsv = compFsv;
      finalRationale = marketCompResults.rationale;
      break;
    case 'reconciliation':
      finalFmv = blendedFmv;
      finalFsv = blendedFsv;
      finalRationale = reconciliationResults.rationale;
      break;
    case 'depreciation':
    default:
      finalFmv = depFmv;
      finalFsv = depFsv;
      finalRationale = inputs.depreciationMethod === 'double_declining'
        ? 'Cost approach via Double Declining Balance depreciation has been adopted to account for accelerated early-life mechanical degradation and physical wear.'
        : inputs.depreciationMethod === 'straight_line'
        ? 'Cost approach via Straight Line depreciation has been adopted over the vehicle operational lifespan.'
        : 'Cost approach via Written Down Value (diminishing balance) method has been adopted incorporating chronological age, component condition, and regional market demand.';
      break;
  }

  return {
    methodology: inputs.methodology,
    rationale: finalRationale,
    fairMarketValue: finalFmv,
    forcedSaleValue: finalFsv,
    fairMarketValueInWords: numberToWordsNPR(finalFmv),
    forcedSaleValueInWords: numberToWordsNPR(finalFsv),
    depreciation: {
      ageYears,
      baseDepreciatedValue: Math.round(baseDep),
      mileageAdjustmentAmount: Math.round(mileageAdjustmentAmount),
      conditionAdjustmentAmount: Math.round(conditionAdjustmentAmount),
      marketDemandAdjustmentAmount: Math.round(marketDemandAdjustmentAmount),
      subtotalBeforeRepairs: Math.round(subtotalBeforeRepairs),
      fairMarketValue: depFmv,
      forcedSaleValue: depFsv,
    },
    scrap: scrapResults,
    marketComp: marketCompResults,
    reconciliation: reconciliationResults,
  };
}

export function formatNPR(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);
}

export function numberToWordsNPR(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanOneThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let result = '';
  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thousand = Math.floor(num / 1000);
  num %= 1000;
  let remainder = num;

  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder) + ' ';
  }

  return 'Nepali Rupees ' + result.trim() + ' Only';
}
