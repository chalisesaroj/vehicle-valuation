import React, { useState, useMemo } from 'react';
import { ValuationDocument } from '../../types/document';
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
  ScrapNonMetallicItem,
  ScrapMetalRateItem,
  MarketComparableItem,
} from '../../services/valuationMath';
import {
  Calculator,
  Flame,
  Scale,
  GitCompare,
  TrendingDown,
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface TabValuationProps {
  document: ValuationDocument;
  onApplyValuation: (results: ValuationResults, inputs: ValuationInputs) => void;
  onLoadScrapSample?: () => void;
}

export const TabValuation: React.FC<TabValuationProps> = ({
  document,
  onApplyValuation,
  onLoadScrapSample,
}) => {
  // Active Methodology
  const [methodology, setMethodology] = useState<ValuationMethodology>('depreciation');

  // 1. Depreciation (Cost Approach)
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

  // 2. Scrap Valuation
  const [scrapKerbWeight, setScrapKerbWeight] = useState<number>(DEFAULT_SCRAP_INPUTS.kerbWeightKg);
  const [nonMetallicDeductions, setNonMetallicDeductions] = useState<ScrapNonMetallicItem[]>(
    DEFAULT_SCRAP_INPUTS.nonMetallicDeductions
  );
  const [oxidationLossPct, setOxidationLossPct] = useState<number>(DEFAULT_SCRAP_INPUTS.oxidationLossPct);
  const [metalRates, setMetalRates] = useState<ScrapMetalRateItem[]>(DEFAULT_SCRAP_INPUTS.metalRates);
  const [transportHandlingDeduction, setTransportHandlingDeduction] = useState<number>(
    DEFAULT_SCRAP_INPUTS.transportHandlingDeduction
  );
  const [auctionMinBid, setAuctionMinBid] = useState<number>(DEFAULT_SCRAP_INPUTS.auctionMinBid);
  const [deregistrationStatus, setDeregistrationStatus] = useState<string>(
    DEFAULT_SCRAP_INPUTS.deregistrationStatus
  );

  // 3. Market Comparable
  const [comparables, setComparables] = useState<MarketComparableItem[]>(
    DEFAULT_MARKET_COMP_INPUTS.comparables
  );
  const [marketDistressPct, setMarketDistressPct] = useState<number>(
    DEFAULT_MARKET_COMP_INPUTS.distressFactorPct
  );

  // 4. Reconciliation
  const [costVal, setCostVal] = useState<number>(1850000);
  const [costWeight, setCostWeight] = useState<number>(50);
  const [marketVal, setMarketVal] = useState<number>(1890000);
  const [marketWeight, setMarketWeight] = useState<number>(50);
  const [reconDistressPct, setReconDistressPct] = useState<number>(85);

  // Assembled Inputs
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
        kerbWeightKg: scrapKerbWeight,
        nonMetallicDeductions,
        oxidationLossPct,
        metalRates,
        transportHandlingDeduction,
        auctionMinBid,
        deregistrationStatus,
        conditionDescription:
          'Total fire loss vehicle; structural assemblies thermally distorted and fit only for scrap metal recycling.',
      },
      marketComp: {
        comparables,
        distressFactorPct: marketDistressPct,
      },
      reconciliation: {
        costApproachValue: costVal,
        costApproachWeightPct: costWeight,
        marketApproachValue: marketVal,
        marketApproachWeightPct: marketWeight,
        distressFactorPct: reconDistressPct,
      },
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
      nonMetallicDeductions,
      oxidationLossPct,
      metalRates,
      transportHandlingDeduction,
      auctionMinBid,
      deregistrationStatus,
      comparables,
      marketDistressPct,
      costVal,
      costWeight,
      marketVal,
      marketWeight,
      reconDistressPct,
    ]
  );

  const results: ValuationResults = useMemo(() => computeValuation(inputs), [inputs]);

  // Handlers for Scrap Deductions
  const handleUpdateDeduction = (id: string, field: keyof ScrapNonMetallicItem, value: any) => {
    setNonMetallicDeductions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddDeduction = () => {
    const newItem: ScrapNonMetallicItem = {
      id: `sc-${Date.now()}`,
      component: 'Additional non-metallic assembly',
      weightKg: 10,
      remarks: 'Thermal loss',
    };
    setNonMetallicDeductions((prev) => [...prev, newItem]);
  };

  const handleDeleteDeduction = (id: string) => {
    setNonMetallicDeductions((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Metal Rates
  const handleUpdateMetalRate = (id: string, field: keyof ScrapMetalRateItem, value: any) => {
    setMetalRates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handlers for Market Comparables
  const handleUpdateComp = (id: string, field: keyof MarketComparableItem, value: any) => {
    setComparables((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        // Recalculate indicated value: askingPrice + mileageAdj + conditionAdj
        const asking = Number(field === 'askingPrice' ? value : updated.askingPrice) || 0;
        const milAdj = Number(field === 'mileageAdj' ? value : updated.mileageAdj) || 0;
        const condAdj = Number(field === 'conditionAdj' ? value : updated.conditionAdj) || 0;
        updated.indicatedValue = asking + milAdj + condAdj;
        return updated;
      })
    );
  };

  const handleAddComp = () => {
    const newComp: MarketComparableItem = {
      id: `mc-${Date.now()}`,
      vehicleRef: `${document.meta.makeModel || 'Similar Vehicle'} (Secondary Market)`,
      source: 'Auto Trade Listing',
      modelYear: mfgYear,
      askingPrice: 1950000,
      mileageAdj: 0,
      conditionAdj: 0,
      indicatedValue: 1950000,
    };
    setComparables((prev) => [...prev, newComp]);
  };

  const handleDeleteComp = (id: string) => {
    setComparables((prev) => prev.filter((c) => c.id !== id));
  };

  const handleApply = () => {
    onApplyValuation(results, inputs);
  };

  return (
    <div className="space-y-4">
      {/* Valuation Methodology Selection Header */}
      <div className="sbd-card border-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Vehicle Valuation Methodology Selection
            </h2>
            <div className="text-xs text-slate-600 mt-0.5">
              Select the governing appraisal method appropriate for the physical condition and intended disposal.
            </div>
          </div>

          {onLoadScrapSample && (
            <button
              type="button"
              onClick={onLoadScrapSample}
              className="sbd-btn secondary text-xs flex items-center gap-1.5 border-amber-600 text-amber-900 bg-amber-50 hover:bg-amber-100"
              title="Loads Bhimsenthapa Rural Municipality Bolero Pickup fire loss sample report"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Scrap Sample (BAB 0236)</span>
            </button>
          )}
        </div>

        {/* 4 Methodology Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setMethodology('depreciation')}
            className={`p-3 text-left border rounded transition ${
              methodology === 'depreciation'
                ? 'bg-blue-900 text-white border-blue-950 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <TrendingDown className="w-4 h-4" />
              <span>1. Cost Approach</span>
            </div>
            <div className={`text-[11px] mt-1 ${methodology === 'depreciation' ? 'text-blue-200' : 'text-slate-500'}`}>
              Depreciation (WDV, Straight Line, Double Declining)
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethodology('scrap')}
            className={`p-3 text-left border rounded transition ${
              methodology === 'scrap'
                ? 'bg-amber-800 text-white border-amber-950 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <Flame className="w-4 h-4" />
              <span>2. Scrap Valuation</span>
            </div>
            <div className={`text-[11px] mt-1 ${methodology === 'scrap' ? 'text-amber-200' : 'text-slate-500'}`}>
              Kerb weight, non-metallic deductions & metal rates
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethodology('market_comparable')}
            className={`p-3 text-left border rounded transition ${
              methodology === 'market_comparable'
                ? 'bg-emerald-800 text-white border-emerald-950 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <GitCompare className="w-4 h-4" />
              <span>3. Market Comparable</span>
            </div>
            <div className={`text-[11px] mt-1 ${methodology === 'market_comparable' ? 'text-emerald-200' : 'text-slate-500'}`}>
              Recent marketplace transactions & adjustment factors
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethodology('reconciliation')}
            className={`p-3 text-left border rounded transition ${
              methodology === 'reconciliation'
                ? 'bg-purple-900 text-white border-purple-950 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
              <Scale className="w-4 h-4" />
              <span>4. Reconciliation</span>
            </div>
            <div className={`text-[11px] mt-1 ${methodology === 'reconciliation' ? 'text-purple-200' : 'text-slate-500'}`}>
              Weighted synthesis of Cost & Market Approaches
            </div>
          </button>
        </div>

        {/* 1-Sentence Rationale Bar */}
        <div className="mt-3 p-2.5 bg-slate-100 border border-slate-300 rounded text-xs text-slate-800">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-0.5">
            Adopted Engineering Rationale (1 Sentence):
          </span>
          <span className="italic font-serif">{results.rationale}</span>
        </div>
      </div>

      {/* Adopted Valuation Figures Banner */}
      <div className="sbd-card border-black">
        <h2>Adopted Assessment Figures (Figures &amp; Words)</h2>
        <div className="sbd-grid c2 my-2 p-3 bg-slate-50 border border-slate-300">
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase">
              {methodology === 'scrap' ? 'Assessed Net Scrap Value' : 'Fair Market Value (FMV)'}
            </div>
            <div className="text-xl font-extrabold text-blue-900">
              NPR {formatNPR(results.fairMarketValue)}
            </div>
            <div className="text-xs text-slate-700 italic mt-0.5">
              {results.fairMarketValueInWords}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase">
              {methodology === 'scrap'
                ? 'Recommended Minimum Auction Reserve Bid'
                : `Forced Sale / Distress Value (${distressFactorPct}%)`}
            </div>
            <div className="text-lg font-bold text-slate-900">
              NPR {formatNPR(results.forcedSaleValue)}
            </div>
            <div className="text-xs text-slate-700 italic mt-0.5">
              {results.forcedSaleValueInWords}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <div className="text-xs text-slate-600">
            Click to sync these calculated figures and technical tables into the active document sections.
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="sbd-btn primary flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply &amp; Sync to Document Report</span>
          </button>
        </div>
      </div>

      {/* METHOD 1: COST APPROACH / DEPRECIATION */}
      {methodology === 'depreciation' && (
        <div className="sbd-card">
          <h2>1. Cost Approach: Depreciation &amp; Lifecycle Parameters</h2>
          <div className="sbd-hint">
            Calculates residual mechanical value with provisions for diminishing balance, straight-line, or double declining balance methods adjusted for mileage and operational condition.
          </div>

          <div className="sbd-grid c3">
            <label className="sbd-f">
              <span>New Replacement Cost (NPR)</span>
              <input
                type="number"
                value={replacementPrice}
                onChange={(e) => setReplacementPrice(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Depreciation Method</span>
              <select
                value={depreciationMethod}
                onChange={(e) => setDepreciationMethod(e.target.value as any)}
              >
                <option value="diminishing">Diminishing Balance (Written Down Value)</option>
                <option value="double_declining">Double Declining Balance (DDB)</option>
                <option value="straight_line">Straight Line Method</option>
              </select>
            </label>

            <label className="sbd-f">
              <span>
                {depreciationMethod === 'double_declining'
                  ? 'Useful Economic Life (Years)'
                  : 'Annual Depreciation Rate (%)'}
              </span>
              {depreciationMethod === 'double_declining' ? (
                <input
                  type="number"
                  value={usefulLifeYears}
                  onChange={(e) => setUsefulLifeYears(Number(e.target.value) || 1)}
                />
              ) : (
                <input
                  type="number"
                  value={depreciationRatePct}
                  onChange={(e) => setDepreciationRatePct(Number(e.target.value) || 0)}
                />
              )}
            </label>
          </div>

          <div className="sbd-grid c4">
            <label className="sbd-f">
              <span>Mfg. Year</span>
              <input
                type="number"
                value={mfgYear}
                onChange={(e) => setMfgYear(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Valuation Year (Age: {results.depreciation.ageYears} yrs)</span>
              <input
                type="number"
                value={valuationYear}
                onChange={(e) => setValuationYear(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Actual Odometer (km)</span>
              <input
                type="number"
                value={actualMileage}
                onChange={(e) => setActualMileage(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Benchmark Lifecycle (km)</span>
              <input
                type="number"
                value={benchmarkMileage}
                onChange={(e) => setBenchmarkMileage(Number(e.target.value) || 0)}
              />
            </label>
          </div>

          <div className="sbd-grid c4">
            <label className="sbd-f">
              <span>Condition Rating Factor (%)</span>
              <input
                type="number"
                value={conditionAdjustmentPct}
                onChange={(e) => setConditionAdjustmentPct(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Market Demand Factor (%)</span>
              <input
                type="number"
                value={marketDemandPct}
                onChange={(e) => setMarketDemandPct(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Pending Repairs Deduction (NPR)</span>
              <input
                type="number"
                value={repairDeductionAmount}
                onChange={(e) => setRepairDeductionAmount(Number(e.target.value) || 0)}
              />
            </label>

            <label className="sbd-f">
              <span>Distress / Forced Sale Factor (%)</span>
              <input
                type="number"
                value={distressFactorPct}
                onChange={(e) => setDistressFactorPct(Number(e.target.value) || 0)}
              />
            </label>
          </div>

          {/* Quick Depreciation Math Breakdown Table */}
          <div className="mt-3 border border-slate-300 rounded overflow-hidden text-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300">
              Calculation Breakdown ({depreciationMethod.toUpperCase()})
            </div>
            <table className="w-full text-left">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-1.5 text-slate-700">Base Depreciated Mechanical Value (Age {results.depreciation.ageYears} yrs)</td>
                  <td className="px-3 py-1.5 font-mono text-right">NPR {formatNPR(results.depreciation.baseDepreciatedValue)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-1.5 text-slate-700">Condition Rating Adjustment (+{conditionAdjustmentPct}%)</td>
                  <td className="px-3 py-1.5 font-mono text-right text-emerald-700">+NPR {formatNPR(results.depreciation.conditionAdjustmentAmount)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-1.5 text-slate-700">Mileage Adjustment (Actual {actualMileage.toLocaleString()} km vs Benchmark {benchmarkMileage.toLocaleString()} km)</td>
                  <td className="px-3 py-1.5 font-mono text-right text-emerald-700">{results.depreciation.mileageAdjustmentAmount >= 0 ? '+' : ''}NPR {formatNPR(results.depreciation.mileageAdjustmentAmount)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-1.5 text-slate-700">Regional Market Demand Adjustment (+{marketDemandPct}%)</td>
                  <td className="px-3 py-1.5 font-mono text-right text-emerald-700">+NPR {formatNPR(results.depreciation.marketDemandAdjustmentAmount)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-1.5 text-slate-700">Pending Mechanical Repair Allowance</td>
                  <td className="px-3 py-1.5 font-mono text-right text-red-700">-NPR {formatNPR(repairDeductionAmount)}</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="px-3 py-2 text-blue-950">Fair Market Value (Rounded)</td>
                  <td className="px-3 py-2 font-mono text-right text-blue-900">NPR {formatNPR(results.fairMarketValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* METHOD 2: SCRAP VALUATION (FOR DESTROYED / BURNT / DECOMMISSIONED VEHICLES) */}
      {methodology === 'scrap' && (
        <div className="space-y-4">
          <div className="sbd-card">
            <h2>2. Scrap Valuation: Kerb Weight &amp; Metal Recovery Assessment</h2>
            <div className="sbd-hint">
              Used when vehicle is destroyed, burnt, de-registered, or beyond economical repair. Computes net recoverable metal weight minus non-metallic and oxidation loss, weighted against local scrap rates.
            </div>

            <div className="sbd-grid c3">
              <label className="sbd-f">
                <span>Vehicle Unladen / Kerb Weight (kg)</span>
                <input
                  type="number"
                  value={scrapKerbWeight}
                  onChange={(e) => setScrapKerbWeight(Number(e.target.value) || 0)}
                />
              </label>

              <label className="sbd-f">
                <span>Thermal Oxidation / Rust Scale Loss (%)</span>
                <input
                  type="number"
                  value={oxidationLossPct}
                  onChange={(e) => setOxidationLossPct(Number(e.target.value) || 0)}
                />
              </label>

              <label className="sbd-f">
                <span>Handling, Dismantling &amp; Transport (NPR)</span>
                <input
                  type="number"
                  value={transportHandlingDeduction}
                  onChange={(e) => setTransportHandlingDeduction(Number(e.target.value) || 0)}
                />
              </label>
            </div>

            <div className="sbd-grid c2 mt-2">
              <label className="sbd-f">
                <span>Registration Status</span>
                <input
                  type="text"
                  value={deregistrationStatus}
                  onChange={(e) => setDeregistrationStatus(e.target.value)}
                  placeholder="e.g. Already De-registered (Transport Office records updated)"
                />
              </label>

              <label className="sbd-f">
                <span>Recommended Minimum Auction Reserve Bid (NPR)</span>
                <input
                  type="number"
                  value={auctionMinBid}
                  onChange={(e) => setAuctionMinBid(Number(e.target.value) || 0)}
                />
              </label>
            </div>
          </div>

          {/* Non-Metallic Deductions Table */}
          <div className="sbd-card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                Step 1 &amp; 2: Non-Metallic / Burned-Out Component Deductions
              </h3>
              <button
                type="button"
                onClick={handleAddDeduction}
                className="sbd-btn secondary text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2">Component / Assembly</th>
                    <th className="px-3 py-2 w-28">Weight (kg)</th>
                    <th className="px-3 py-2">Inspection Remarks / Condition</th>
                    <th className="px-2 py-2 w-12 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {nonMetallicDeductions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.component}
                          onChange={(e) => handleUpdateDeduction(item.id, 'component', e.target.value)}
                          className="w-full text-xs p-1 border border-slate-300 rounded bg-white"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={item.weightKg}
                          onChange={(e) => handleUpdateDeduction(item.id, 'weightKg', Number(e.target.value) || 0)}
                          className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleUpdateDeduction(item.id, 'remarks', e.target.value)}
                          className="w-full text-xs p-1 border border-slate-300 rounded bg-white"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteDeduction(item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td className="px-3 py-2 text-slate-800">Total Non-Metallic Deductions</td>
                    <td className="px-3 py-2 font-mono text-right text-red-700">
                      -{results.scrap.totalNonMetallicDeductionKg} kg
                    </td>
                    <td className="px-3 py-2 text-slate-600" colSpan={2}>
                      Remaining Gross Metallic Weight: {results.scrap.grossMetallicWeightKg} kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Metal Categories and Rates Table */}
          <div className="sbd-card">
            <h3 className="text-xs font-bold text-slate-800 uppercase mb-2">
              Step 3 &amp; 4: Metal Composition &amp; Weighted Scrap Rates
            </h3>

            <div className="border border-slate-300 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2">Metal Category / Fraction</th>
                    <th className="px-3 py-2 w-28 text-right">Share (%)</th>
                    <th className="px-3 py-2 w-36 text-right">Rate (NPR/kg)</th>
                    <th className="px-3 py-2 w-36 text-right">Rate Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {metalRates.map((mr) => {
                    const contrib = ((mr.sharePct / 100) * mr.ratePerKg).toFixed(2);
                    return (
                      <tr key={mr.id} className="hover:bg-slate-50">
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={mr.metalType}
                            onChange={(e) => handleUpdateMetalRate(mr.id, 'metalType', e.target.value)}
                            className="w-full text-xs p-1 border border-slate-300 rounded bg-white"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={mr.sharePct}
                            onChange={(e) => handleUpdateMetalRate(mr.id, 'sharePct', Number(e.target.value) || 0)}
                            className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={mr.ratePerKg}
                            onChange={(e) => handleUpdateMetalRate(mr.id, 'ratePerKg', Number(e.target.value) || 0)}
                            className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-700">
                          NPR {contrib}/kg
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-semibold border-t border-slate-300">
                    <td className="px-3 py-2 text-slate-800">Weighted Average Scrap Metal Rate</td>
                    <td className="px-3 py-2 text-right">100%</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-blue-900" colSpan={2}>
                      NPR {results.scrap.weightedRatePerKg.toFixed(2)} / kg
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-3 py-2 text-slate-700">Net Recoverable Metallic Weight (after {oxidationLossPct}% scale loss)</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900" colSpan={3}>
                      {results.scrap.netScrapWeightKg.toLocaleString()} kg
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-3 py-2 text-slate-700">Gross Scrap Value ({results.scrap.netScrapWeightKg} kg @ NPR {results.scrap.weightedRatePerKg}/kg)</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900" colSpan={3}>
                      NPR {formatNPR(results.scrap.grossScrapValue)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-3 py-2 text-slate-700">Less: Handling, Gas Cutting &amp; Site Transportation</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-red-700" colSpan={3}>
                      -NPR {formatNPR(transportHandlingDeduction)}
                    </td>
                  </tr>
                  <tr className="bg-amber-50 font-bold border-t-2 border-amber-600">
                    <td className="px-3 py-2.5 text-amber-950">Net Assessed Scrap Value (Rounded)</td>
                    <td className="px-3 py-2.5 text-right font-mono text-base text-amber-900" colSpan={3}>
                      NPR {formatNPR(results.fairMarketValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: MARKET COMPARABLE METHOD */}
      {methodology === 'market_comparable' && (
        <div className="sbd-card">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2>3. Market Comparable Method (Transaction Benchmarking)</h2>
              <div className="sbd-hint">
                Based on active secondary transactions and listings adjusted for mileage differences, year of manufacture, and condition.
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddComp}
              className="sbd-btn secondary text-xs flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Comparable</span>
            </button>
          </div>

          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2">Comparable Vehicle Reference</th>
                  <th className="px-2 py-2 w-20">Year</th>
                  <th className="px-2 py-2 w-32 text-right">Listing / Sale (NPR)</th>
                  <th className="px-2 py-2 w-28 text-right">Mileage Adj.</th>
                  <th className="px-2 py-2 w-28 text-right">Condition Adj.</th>
                  <th className="px-3 py-2 w-32 text-right">Indicated (NPR)</th>
                  <th className="px-2 py-2 w-10 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparables.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={c.vehicleRef}
                        onChange={(e) => handleUpdateComp(c.id, 'vehicleRef', e.target.value)}
                        className="w-full text-xs p-1 border border-slate-300 rounded bg-white"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        value={c.modelYear}
                        onChange={(e) => handleUpdateComp(c.id, 'modelYear', Number(e.target.value) || 0)}
                        className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-center"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        value={c.askingPrice}
                        onChange={(e) => handleUpdateComp(c.id, 'askingPrice', Number(e.target.value) || 0)}
                        className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        value={c.mileageAdj}
                        onChange={(e) => handleUpdateComp(c.id, 'mileageAdj', Number(e.target.value) || 0)}
                        className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        value={c.conditionAdj}
                        onChange={(e) => handleUpdateComp(c.id, 'conditionAdj', Number(e.target.value) || 0)}
                        className="w-full text-xs p-1 border border-slate-300 rounded bg-white text-right font-mono"
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">
                      NPR {formatNPR(c.indicatedValue)}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteComp(c.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td className="px-3 py-2 text-slate-800" colSpan={5}>
                    Average Indicated Market Value ({comparables.length} comparables)
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-900" colSpan={2}>
                    NPR {formatNPR(results.marketComp.averageIndicatedValue)}
                  </td>
                </tr>
                <tr className="bg-emerald-50 font-bold border-t border-emerald-300">
                  <td className="px-3 py-2 text-emerald-950" colSpan={5}>
                    Assessed Fair Market Value (FMV Rounded)
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-900 text-sm" colSpan={2}>
                    NPR {formatNPR(results.fairMarketValue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sbd-grid c2 mt-3">
            <label className="sbd-f">
              <span>Distress / Forced Sale Factor (%)</span>
              <input
                type="number"
                value={marketDistressPct}
                onChange={(e) => setMarketDistressPct(Number(e.target.value) || 0)}
              />
            </label>
            <div className="flex flex-col justify-end">
              <div className="text-xs text-slate-600 font-semibold">Forced Sale Value:</div>
              <div className="text-sm font-bold text-slate-900">NPR {formatNPR(results.forcedSaleValue)}</div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 4: RECONCILIATION METHOD */}
      {methodology === 'reconciliation' && (
        <div className="sbd-card">
          <h2>4. Reconciliation Method (Blended Cost &amp; Market Approaches)</h2>
          <div className="sbd-hint">
            Blends the Cost Approach (depreciated replacement value) with the Market Comparable Approach to derive a reconciled fair market value.
          </div>

          <div className="sbd-grid c2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-xs font-bold text-slate-800 uppercase mb-2">
                Cost Approach (Depreciation)
              </div>
              <label className="sbd-f mb-2">
                <span>Cost Approach Indicated Value (NPR)</span>
                <input
                  type="number"
                  value={costVal}
                  onChange={(e) => setCostVal(Number(e.target.value) || 0)}
                />
              </label>
              <label className="sbd-f">
                <span>Weighting Assigned (%)</span>
                <input
                  type="number"
                  value={costWeight}
                  onChange={(e) => {
                    const w = Number(e.target.value) || 0;
                    setCostWeight(w);
                    setMarketWeight(100 - w);
                  }}
                />
              </label>
              <div className="text-xs font-mono text-slate-700 mt-1">
                Weighted Contribution: NPR {formatNPR((costVal * costWeight) / 100)}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="text-xs font-bold text-slate-800 uppercase mb-2">
                Market Comparable Approach
              </div>
              <label className="sbd-f mb-2">
                <span>Market Approach Indicated Value (NPR)</span>
                <input
                  type="number"
                  value={marketVal}
                  onChange={(e) => setMarketVal(Number(e.target.value) || 0)}
                />
              </label>
              <label className="sbd-f">
                <span>Weighting Assigned (%)</span>
                <input
                  type="number"
                  value={marketWeight}
                  onChange={(e) => {
                    const w = Number(e.target.value) || 0;
                    setMarketWeight(w);
                    setCostWeight(100 - w);
                  }}
                />
              </label>
              <div className="text-xs font-mono text-slate-700 mt-1">
                Weighted Contribution: NPR {formatNPR((marketVal * marketWeight) / 100)}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-purple-950 uppercase">
                  Reconciled Fair Market Value
                </div>
                <div className="text-lg font-extrabold text-purple-900">
                  NPR {formatNPR(results.fairMarketValue)}
                </div>
                <div className="text-xs text-purple-800 italic">{results.fairMarketValueInWords}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Forced Sale Value ({reconDistressPct}%)
                </div>
                <div className="text-base font-bold text-slate-900">
                  NPR {formatNPR(results.forcedSaleValue)}
                </div>
                <div className="text-xs text-slate-600 italic">{results.forcedSaleValueInWords}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
