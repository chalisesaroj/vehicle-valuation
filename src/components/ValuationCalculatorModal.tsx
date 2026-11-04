import React, { useState, useMemo } from 'react';
import { X, Calculator, Check, Flame, TrendingDown, GitCompare, Scale } from 'lucide-react';
import {
  computeValuation,
  formatNPR,
  ValuationInputs,
  ValuationResults,
  ValuationMethodology,
  DepreciationSubMethod,
  DEFAULT_SCRAP_INPUTS,
  DEFAULT_MARKET_COMP_INPUTS,
  DEFAULT_RECONCILIATION_INPUTS,
} from '../services/valuationMath';
import { ValuationDocument } from '../types/document';

interface ValuationCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ValuationDocument;
  onApplyValuation: (results: ValuationResults, inputs: ValuationInputs) => void;
}

export const ValuationCalculatorModal: React.FC<ValuationCalculatorModalProps> = ({
  isOpen,
  onClose,
  document,
  onApplyValuation,
}) => {
  const [methodology, setMethodology] = useState<ValuationMethodology>('depreciation');

  // Depreciation
  const [replacementPrice, setReplacementPrice] = useState<number>(5485000);
  const [depreciationMethod, setDepreciationMethod] = useState<DepreciationSubMethod>('diminishing');
  const [depreciationRatePct, setDepreciationRatePct] = useState<number>(20);
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(10);
  const [mfgYear, setMfgYear] = useState<number>(2016);
  const [valuationYear, setValuationYear] = useState<number>(2026);
  const [actualMileage, setActualMileage] = useState<number>(193974);
  const [benchmarkMileage, setBenchmarkMileage] = useState<number>(200000);
  const [mileageRatePct, setMileageRatePct] = useState<number>(2);
  const [marketDemandPct, setMarketDemandPct] = useState<number>(10);
  const [conditionAdjustmentPct, setConditionAdjustmentPct] = useState<number>(15);
  const [repairDeductionAmount, setRepairDeductionAmount] = useState<number>(0);
  const [distressFactorPct, setDistressFactorPct] = useState<number>(85);

  // Scrap
  const [scrapKerbWeight, setScrapKerbWeight] = useState<number>(DEFAULT_SCRAP_INPUTS.kerbWeightKg);
  const [oxidationLossPct, setOxidationLossPct] = useState<number>(DEFAULT_SCRAP_INPUTS.oxidationLossPct);
  const [transportDeduction, setTransportDeduction] = useState<number>(DEFAULT_SCRAP_INPUTS.transportHandlingDeduction);

  const inputs: ValuationInputs = useMemo(
    () => ({
      methodology,
      replacementPrice,
      depreciationMethod,
      depreciationRatePct,
      usefulLifeYears,
      mfgYear,
      valuationYear,
      actualMileage,
      benchmarkMileage,
      mileageRatePct,
      marketDemandPct,
      conditionAdjustmentPct,
      repairDeductionAmount,
      distressFactorPct,
      scrap: {
        ...DEFAULT_SCRAP_INPUTS,
        kerbWeightKg: scrapKerbWeight,
        oxidationLossPct,
        transportHandlingDeduction: transportDeduction,
      },
      marketComp: DEFAULT_MARKET_COMP_INPUTS,
      reconciliation: DEFAULT_RECONCILIATION_INPUTS,
    }),
    [
      methodology,
      replacementPrice,
      depreciationMethod,
      depreciationRatePct,
      usefulLifeYears,
      mfgYear,
      valuationYear,
      actualMileage,
      benchmarkMileage,
      mileageRatePct,
      marketDemandPct,
      conditionAdjustmentPct,
      repairDeductionAmount,
      distressFactorPct,
      scrapKerbWeight,
      oxidationLossPct,
      transportDeduction,
    ]
  );

  const results: ValuationResults = useMemo(() => computeValuation(inputs), [inputs]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyValuation(results, inputs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Vehicle Valuation Calculator &amp; Methodology Selector
              </h3>
              <p className="text-xs text-slate-400">
                Cost Approach (WDV/DDB), Scrap Valuation, Market Comparable &amp; Reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Method Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setMethodology('depreciation')}
              className={`p-2.5 text-left border rounded text-xs transition ${
                methodology === 'depreciation'
                  ? 'bg-blue-900 text-white border-blue-950 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Cost Approach</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethodology('scrap')}
              className={`p-2.5 text-left border rounded text-xs transition ${
                methodology === 'scrap'
                  ? 'bg-amber-800 text-white border-amber-950 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Scrap Valuation</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethodology('market_comparable')}
              className={`p-2.5 text-left border rounded text-xs transition ${
                methodology === 'market_comparable'
                  ? 'bg-emerald-800 text-white border-emerald-950 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Market Comp.</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethodology('reconciliation')}
              className={`p-2.5 text-left border rounded text-xs transition ${
                methodology === 'reconciliation'
                  ? 'bg-purple-900 text-white border-purple-950 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Reconciliation</span>
              </div>
            </button>
          </div>

          {/* Rationale Display */}
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800">
            <span className="font-bold text-slate-900 uppercase text-[10px] block">
              1-Sentence Engineering Rationale:
            </span>
            <span className="italic">{results.rationale}</span>
          </div>

          {/* Result Highlight Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                {methodology === 'scrap' ? 'Assessed Net Scrap Value' : 'Assessed Fair Market Value (FMV)'}
              </span>
              <div className="text-2xl font-extrabold text-blue-950">
                NPR {formatNPR(results.fairMarketValue)}
              </div>
              <p className="text-[11px] text-blue-800 italic leading-snug">
                {results.fairMarketValueInWords}
              </p>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-blue-200 sm:pl-4 pt-2 sm:pt-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {methodology === 'scrap'
                  ? 'Recommended Minimum Auction Reserve Bid'
                  : `Forced Sale / Distress Value (${distressFactorPct}%)`}
              </span>
              <div className="text-xl font-bold text-slate-900">
                NPR {formatNPR(results.forcedSaleValue)}
              </div>
              <p className="text-[11px] text-slate-600 italic leading-snug">
                {results.forcedSaleValueInWords}
              </p>
            </div>
          </div>

          {/* Method-Specific Inputs */}
          {methodology === 'depreciation' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Replacement Cost (NPR)
                </label>
                <input
                  type="number"
                  value={replacementPrice}
                  onChange={(e) => setReplacementPrice(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Depreciation Method
                </label>
                <select
                  value={depreciationMethod}
                  onChange={(e) => setDepreciationMethod(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                >
                  <option value="diminishing">Diminishing Balance (WDV)</option>
                  <option value="double_declining">Double Declining Balance (DDB)</option>
                  <option value="straight_line">Straight Line Method</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {depreciationMethod === 'double_declining' ? 'Useful Life (Years)' : 'Annual Dep. Rate (%)'}
                </label>
                {depreciationMethod === 'double_declining' ? (
                  <input
                    type="number"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(Number(e.target.value) || 1)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                  />
                ) : (
                  <input
                    type="number"
                    value={depreciationRatePct}
                    onChange={(e) => setDepreciationRatePct(Number(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manufacture Year
                </label>
                <input
                  type="number"
                  value={mfgYear}
                  onChange={(e) => setMfgYear(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valuation Year (Age: {results.depreciation.ageYears} yrs)
                </label>
                <input
                  type="number"
                  value={valuationYear}
                  onChange={(e) => setValuationYear(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Mileage (km)
                </label>
                <input
                  type="number"
                  value={actualMileage}
                  onChange={(e) => setActualMileage(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>
            </div>
          )}

          {methodology === 'scrap' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unladen Kerb Weight (kg)
                </label>
                <input
                  type="number"
                  value={scrapKerbWeight}
                  onChange={(e) => setScrapKerbWeight(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thermal Oxidation Loss (%)
                </label>
                <input
                  type="number"
                  value={oxidationLossPct}
                  onChange={(e) => setOxidationLossPct(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handling &amp; Transport Deduction (NPR)
                </label>
                <input
                  type="number"
                  value={transportDeduction}
                  onChange={(e) => setTransportDeduction(Number(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply &amp; Sync to Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
