import HubSelector from './HubSelector';
import KpiCards from './KpiCards';
import SolarChart from './SolarChart';
import PrintButton from './PrintButton';
import DataSourceBadge from './DataSourceBadge';
import RegulatoryGauge from './RegulatoryGauge';
import ExecutiveReport from './ExecutiveReport';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PSH, DEFAULT_PR, TARIFF_SELF_CONSUMPTION } from '../config/constants';

export default function Dashboard() {
  const { t } = useTranslation();
  const { 
    onboardingData, 
    dashboardParams, 
    apiData, 
    apiError, 
    isRefetching,
    updateDashboardParams,
    updateCity
  } = useAppContext();

  const PROFILES = [
    { id: 'factory_24_7', label: t('onboarding.profiles.factory_24_7.title'), alpha: 88 },
    { id: 'office_8_18', label: t('onboarding.profiles.office_8_18.title'), alpha: 65 },
    { id: 'hotel_seasonal', label: t('onboarding.profiles.hotel_seasonal.title'), alpha: 72 },
    { id: 'weekend_closed', label: t('onboarding.profiles.weekend_closed.title'), alpha: 60 }
  ];

  const selectedCity = onboardingData.city;
  const { pKwp, alphaSelf, activeProfile, useDynamicThermal = false } = dashboardParams;

  const annualYieldKwh = pKwp * DEFAULT_PSH * DEFAULT_PR;
  const simulatedSavingsMad = (annualYieldKwh * (alphaSelf / 100)) * TARIFF_SELF_CONSUMPTION;
  const simulatedAvoidedCo2Tons = (annualYieldKwh * 0.604) / 1000;

  const liveYield = apiData?.metrics?.summary?.total_generated_kwh ?? annualYieldKwh;
  const liveSavings = apiData?.metrics?.financials?.total_annual_benefit_mad ?? simulatedSavingsMad;
  const liveCo2 = apiData?.metrics?.environmental?.avoided_co2_tons_per_year ?? simulatedAvoidedCo2Tons;
  const ghiDailyVector = apiData?.raw_data_hourly_or_daily?.ghi_daily ?? {};

  const pKwpPercentage = ((pKwp - 10) / (500 - 10)) * 100;
  const alphaPercentage = ((alphaSelf - 60) / (95 - 60)) * 100;

  const sliderTrackStyle1 = {
    background: `linear-gradient(to right, #E8A020 0%, #E8A020 ${pKwpPercentage}%, rgba(100,130,170,0.20) ${pKwpPercentage}%, rgba(100,130,170,0.20) 100%)`
  };

  const sliderTrackStyle2 = {
    background: `linear-gradient(to right, #E8A020 0%, #E8A020 ${alphaPercentage}%, rgba(100,130,170,0.20) ${alphaPercentage}%, rgba(100,130,170,0.20) 100%)`
  };

  const sliderInputClass = "w-full appearance-none h-1 rounded-full outline-none cursor-pointer transition-all duration-150 ease-out " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E8A020] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(232,160,32,0.40)] [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-out hover:[&::-webkit-slider-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:shadow-[0_2px_12px_rgba(232,160,32,0.60)] " +
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#E8A020] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(232,160,32,0.40)] [&::-moz-range-thumb]:cursor-grab active:[&::-moz-range-thumb]:cursor-grabbing [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-out hover:[&::-webkit-slider-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:shadow-[0_2px_12px_rgba(232,160,32,0.60)] [&::-moz-range-thumb]:border-none";

  return (
    <div className="flex-1 w-full mx-auto flex flex-row min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-card-surface border-r border-card-border flex flex-col shrink-0 py-6 px-5 print:hidden">
        <div className="flex flex-col">

          <div className="mb-6">
            <h1 className="text-sm font-bold tracking-tight text-text-heading">
              <span className="text-brand">MaroSun</span> C&I Evaluator
            </h1>
            <p className="text-[10px] font-medium text-text-muted tracking-[0.05em] mt-0.5">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="border-t border-card-border mt-0 print:hidden" />

          <div className="mt-5 print:hidden">
            <HubSelector selectedCity={selectedCity} onSelectCity={updateCity} />
          </div>

          <div className="border-t border-card-border mt-5 print:hidden" />

          <div className="flex flex-col gap-5 mt-5 print:hidden">
            {/* Capacity Slider */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 gap-4">
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted leading-tight">
                  {t('slider.installedCapacity')}
                </label>
                <div className="flex items-center justify-between w-[90px] border border-card-border rounded-sm bg-canvas-base px-2 py-1.5 shadow-sm shrink-0">
                  <input
                    type="number"
                    value={pKwp === 0 ? '' : pKwp}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDashboardParams({ pKwp: val === '' ? 0 : Number(val) });
                    }}
                    className="w-full bg-transparent text-right font-mono text-sm text-text-heading outline-none focus:ring-0 appearance-none"
                  />
                  <span className="text-[11px] text-text-muted ml-1.5 font-mono shrink-0">kWp</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={pKwp}
                onChange={(e) => updateDashboardParams({ pKwp: Number(e.target.value) })}
                className={sliderInputClass}
                style={sliderTrackStyle1}
              />
            </div>

            {/* Self-Consumption Slider */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 gap-4 mt-6">
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted leading-tight">
                  {t('slider.selfConsumptionRate')}
                </label>
                <div className="flex items-center justify-between w-[90px] border border-card-border rounded-sm bg-canvas-base px-2 py-1.5 shadow-sm shrink-0">
                  <input
                    type="number"
                    value={alphaSelf === 0 ? '' : alphaSelf}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDashboardParams({ alphaSelf: val === '' ? 0 : Number(val), activeProfile: 'custom' });
                    }}
                    className="w-full bg-transparent text-right font-mono text-sm text-text-heading outline-none focus:ring-0 appearance-none"
                  />
                  <span className="text-[11px] text-text-muted ml-1.5 font-mono shrink-0">%</span>
                </div>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={alphaSelf}
                onChange={(e) => updateDashboardParams({ alphaSelf: Number(e.target.value), activeProfile: 'custom' })}
                className={sliderInputClass}
                style={sliderTrackStyle2}
              />
            </div>

            {/* Industry Presets */}
            <div className="flex flex-col mt-1">
              <div className="flex flex-wrap gap-2">
                {PROFILES.map(p => {
                  const isActive = activeProfile === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateDashboardParams({ alphaSelf: p.alpha, activeProfile: p.id })}
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
                        isActive
                          ? 'bg-brand/15 border-brand/40 text-brand shadow-sm'
                          : 'bg-white/40 border-[rgba(210,222,240,0.80)] text-text-muted hover:bg-white/80'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-card-border mt-2 print:hidden" />

            {/* NOCT Thermal Segmented Control */}
            <div className="flex flex-col mt-2 print:hidden">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                {t('dashboard.thermal_model')}
              </span>
              <div className="flex p-1 bg-canvas-base border border-card-border rounded-md">
                <button
                  onClick={() => updateDashboardParams({ useDynamicThermal: false })}
                  className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-sm transition-colors ${
                    !useDynamicThermal
                      ? 'bg-card-surface shadow-sm border border-card-border text-text-heading'
                      : 'bg-transparent text-text-muted hover:text-text-heading'
                  }`}
                >
                  {t('common.disabled')}
                </button>
                <button
                  onClick={() => updateDashboardParams({ useDynamicThermal: true })}
                  className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-sm transition-colors ${
                    useDynamicThermal
                      ? 'bg-card-surface shadow-sm border border-card-border text-text-heading'
                      : 'bg-transparent text-text-muted hover:text-text-heading'
                  }`}
                >
                  {t('common.enabled')}
                </button>
              </div>

              {/* Micro KPI Thermique */}
              {dashboardParams?.useDynamicThermal && apiData?.metrics?.thermal_model && (
                <div className="mt-3 bg-canvas-base p-2.5 border border-card-border flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-muted">{t('dashboard.effective_pr')}</span>
                    <span className="font-mono text-[11px] font-bold text-brand tabular-nums">{(apiData?.metrics?.thermal_model?.pr_used_avg || 0).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-text-muted">{t('dashboard.avg_cell_temp')}</span>
                    <span className="font-mono text-[10px] font-medium text-text-muted tabular-nums">{(apiData?.metrics?.thermal_model?.avg_cell_temp_c || 0).toFixed(1)} °C</span>
                  </div>
                </div>
              )}
            </div>



          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-[rgba(200,215,235,0.50)] flex flex-col gap-1 font-mono text-[10px] text-text-muted print:hidden">
          {isRefetching && <span className="text-brand animate-pulse">{t('dashboard.requesting_data')}</span>}
          {apiError && <span className="text-rose-600 font-semibold flex flex-wrap break-all">❌ {t('dashboard.status')} {apiError}</span>}
          {!isRefetching && !apiError && <span className="text-emerald-600 font-medium">{t('dashboard.system_synced')}</span>}
          <div className="text-text-faint text-[9px] leading-relaxed mt-1.5">
            {t('dashboard.anre_tariff')} <br />
            {t('dashboard.surplus_cap_desc')}
          </div>
        </div>
      </aside>

      {/* DASHBOARD WORKSPACE */}
      <main className="flex-1 flex flex-col px-8 py-8 gap-6 min-w-0 bg-canvas-base print:bg-white print:p-0">

        <header className="flex justify-between items-center border-b border-card-border pb-2 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-text-heading leading-[1.2] tracking-tight">
              {t('dashboard.appraisal_dashboard')}
            </h2>
            <p className="text-xs font-normal text-text-muted leading-[1.5] mt-1">
              {t('dashboard.evaluating_profiles')} <span className="text-brand font-semibold">{selectedCity?.name || 'Unknown'}</span> (<span className="tabular-nums">{(selectedCity?.lat || 0).toFixed(4)}</span>°N, <span className="tabular-nums">{(selectedCity?.lon || 0).toFixed(4)}</span>°W)
            </p>
          </div>

          <div className="flex items-center gap-4 print:hidden">
            {!isRefetching && (
              <DataSourceBadge
                source={apiData?.data_source}
                error={apiError}
              />
            )}
            <PrintButton />
          </div>
        </header>

        <div className="print:hidden">
          <KpiCards
            yields={apiData?.metrics?.summary?.total_generated_kwh || (pKwp * 1820 * 0.78)}
            selfConsumed={apiData?.metrics?.splits?.self_consumed_kwh || 0}
            gridSurplus={apiData?.metrics?.splits?.surplus_allowed_grid_kwh || 0}
            revenue={apiData?.metrics?.financials?.total_annual_benefit_mad || 0}
            co2={apiData?.metrics?.environmental?.avoided_co2_tons_per_year || 0}
          />
        </div>

        <div className="mt-4 print:hidden">
          <RegulatoryGauge pKwp={pKwp} alphaSelf={alphaSelf} apiData={apiData} />
        </div>

        <section className="flex-1 min-h-0 mt-4 h-full relative print:hidden">
          <SolarChart
            ghiDaily={ghiDailyVector}
            pKwp={pKwp}
            alphaSelf={alphaSelf}
            isLoading={isRefetching}
            apiData={apiData}
          />
        </section>

        <ExecutiveReport />
      </main>
    </div>
  );
}
