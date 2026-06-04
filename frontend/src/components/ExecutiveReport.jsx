import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_PSH, DEFAULT_PR, TARIFF_INJECTION, TARIFF_SELF_CONSUMPTION } from '../config/constants';

export default function ExecutiveReport() {
  const { t, i18n } = useTranslation();
  const { onboardingData = {}, dashboardParams = {}, apiData = {}, monthlyCalculations = [] } = useAppContext();

  if (!apiData || Object.keys(apiData).length === 0) return null;

  const city = onboardingData?.city || {};
  const pKwp = dashboardParams?.pKwp || 100;
  const alphaSelf = dashboardParams?.alphaSelf || 75;
  const useDynamicThermal = dashboardParams?.useDynamicThermal || false;

  // Calculations
  let totalAc = apiData?.metrics?.summary?.total_generated_kwh || 0;
  let surplusRaw = apiData?.metrics?.splits?.surplus_generated_kwh || 0;
  let surplusAllowed = apiData?.metrics?.splits?.surplus_allowed_grid_kwh || 0;
  let surplusLost = apiData?.metrics?.splits?.surplus_lost_curtailed_kwh || 0;
  let savingsMad = apiData?.metrics?.financials?.total_annual_benefit_mad || 0;
  let co2 = apiData?.metrics?.environmental?.avoided_co2_tons_per_year || 0;
  let psh = apiData?.metrics?.summary?.annual_psh_hours || DEFAULT_PSH;
  let pr = apiData?.metrics?.thermal_model?.pr_used_avg || DEFAULT_PR;

  // 25-Year Projection Logic
  const projections = useMemo(() => {
    const data = [];
    if (!totalAc) return data;
    let cumulative = 0;
    for (let year = 1; year <= 25; year++) {
      const degradationFactor = Math.pow(0.995, year - 1);
      const yieldYear = totalAc * degradationFactor;
      
      const selfConsumed = yieldYear * (alphaSelf / 100);
      const surplus = yieldYear * (1 - (alphaSelf / 100));
      const allowed = Math.min(surplus, yieldYear * 0.20);
      
      const revYear = (selfConsumed * TARIFF_SELF_CONSUMPTION) + (allowed * TARIFF_INJECTION);
      cumulative += revYear;
      
      data.push({ year, yield: yieldYear, revenue: revYear, cumulative });
    }
    return data;
  }, [totalAc, alphaSelf]);

  const lossMad = surplusLost * TARIFF_INJECTION;
  const isExceeded = surplusLost > 0;
  const generatedDate = new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const projectId = `MARO-${new Date().getFullYear()}-${city?.name?.toUpperCase()?.replace(/\s+/g, '-') || 'PROJECT'}`;

  return (
    <div
      id="executive-report-content"
      className="hidden print:block print:w-full print:static bg-white text-text-body font-sans p-8"
    >
      {/* Section 1: Cover */}
      <div className="border-b-2 border-black pb-6 mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{t('report.cover_title')}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>{t('report.date')}:</strong> {generatedDate}</p>
          <p><strong>{t('report.location')}:</strong> {city?.name} ({city?.lat.toFixed(4)}°N, {city?.lon.toFixed(4)}°W)</p>
          <p><strong>{t('report.project_id')}:</strong> {projectId}</p>
        </div>
      </div>

      {/* Section 2: Executive Summary */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">{t('report.exec_summary_title')}</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-canvas-base border border-card-border rounded-sm">
            <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold">{t('report.capacity')}</p>
            <p className="text-2xl font-bold font-mono text-text-heading mt-2 tabular-nums">{pKwp} <span className="text-sm font-normal">kWp</span></p>
          </div>
          <div className="p-4 bg-canvas-base border border-card-border rounded-sm">
            <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold">{t('report.annual_yield')}</p>
            <p className="text-2xl font-bold font-mono text-text-heading mt-2 tabular-nums">{totalAc.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} <span className="text-sm font-normal">kWh/yr</span></p>
          </div>
          <div className="p-4 bg-canvas-base border border-card-border rounded-sm">
            <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold">{t('report.annual_benefit')}</p>
            <p className="text-2xl font-bold font-mono text-text-heading mt-2 tabular-nums">{savingsMad.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} <span className="text-sm font-normal">MAD/yr</span></p>
          </div>
          <div className="p-4 bg-canvas-base border border-card-border rounded-sm">
            <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold">{t('report.avoided_co2')}</p>
            <p className="text-2xl font-bold font-mono text-text-heading mt-2 tabular-nums">{co2.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 1 })} <span className="text-sm font-normal">Tons/yr</span></p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">
          {t('report.summary_text')
            .replace('{{kwp}}', pKwp)
            .replace('{{city}}', city?.name)
            .replace('{{yield}}', totalAc.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 }))
            .replace('{{mad}}', savingsMad.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 }))
            .replace('{{co2}}', co2.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 1 }))}
        </p>
      </div>

      {/* Section 3: Law 82-21 Table */}
      <div className="mb-10 page-break-inside-avoid">
        <div className="flex justify-between items-end mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-2xl font-bold">{t('report.law_table_title')}</h2>
          <span className={`font-bold ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
            {isExceeded ? t('report.status_exceeded') : t('report.status_compliant')}
          </span>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-3 px-4 font-semibold">{t('report.metric')}</th>
              <th className="py-3 px-4 font-semibold text-right">{t('report.value')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4">{t('report.surplus_cap')}</td>
              <td className="py-3 px-4 text-right">20%</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4">{t('report.surplus_generated')}</td>
              <td className="py-3 px-4 text-right">{surplusRaw.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} kWh</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4">{t('report.surplus_allowed')}</td>
              <td className="py-3 px-4 text-right">{surplusAllowed.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} kWh</td>
            </tr>
            <tr className={`border-b border-gray-200 ${isExceeded ? 'bg-red-50' : ''}`}>
              <td className="py-3 px-4 font-medium">{t('report.curtailed_surplus')}</td>
              <td className="py-3 px-4 text-right font-medium text-red-600">
                {surplusLost.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} kWh 
                ( -{lossMad.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} MAD )
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Technical Params */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">{t('report.tech_params_title')}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
            <span className="text-gray-600">{t('report.pr')}</span>
            <span className="font-medium">{pr.toFixed(3)}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
            <span className="text-gray-600">{t('report.psh')}</span>
            <span className="font-medium">{psh.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} h</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
            <span className="text-gray-600">{t('report.noct')}</span>
            <span className="font-medium">{useDynamicThermal ? t('common.enabled') : t('common.disabled')}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
            <span className="text-gray-600">{t('report.alpha')}</span>
            <span className="font-medium">{alphaSelf}%</span>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-center text-sm border border-gray-200">
          {t('report.formula')}
        </div>
      </div>

      {/* Section 5: Monthly Breakdown */}
      {monthlyCalculations && monthlyCalculations.length > 0 && (
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">{t('report.monthly_title')}</h2>
          <table className="w-full text-xs text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-canvas-base border-b border-card-border">
                <th className="py-2 px-3 font-semibold font-sans text-[10px] uppercase tracking-wider border-b border-card-border text-text-muted">{t('report.month')}</th>
                <th className="py-2 px-3 font-semibold font-sans text-[10px] uppercase tracking-wider border-b border-card-border text-text-muted text-right">{t('report.ghi')}</th>
                <th className="py-2 px-3 font-semibold font-sans text-[10px] uppercase tracking-wider border-b border-card-border text-text-muted text-right">{t('report.pr_col')}</th>
                <th className="py-2 px-3 font-semibold font-sans text-[10px] uppercase tracking-wider border-b border-card-border text-text-muted text-right">{t('report.yield')}</th>
                <th className="py-2 px-3 font-semibold font-sans text-[10px] uppercase tracking-wider border-b border-card-border text-text-muted text-right">{t('report.benefit')}</th>
              </tr>
            </thead>
            <tbody>
              {monthlyCalculations?.map((m, i) => {
                const monthlyYield = (pKwp * m.ghi * m.pr * (365/12));
                const prevBenefit = i > 0 ? monthlyCalculations[i-1].benefit : 0;
                const monthlyRevenue = m.benefit - prevBenefit;

                return (
                  <tr key={i} className="border-b border-card-border even:bg-canvas-base">
                    <td className="py-2 px-3 border-b border-card-border text-sm text-text-body">{m.name}</td>
                    <td className="py-2 px-3 text-right border-b border-card-border font-mono text-sm">{m.ghi.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right border-b border-card-border font-mono text-sm">{m.pr.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right border-b border-card-border font-mono text-sm">{monthlyYield.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} kWh</td>
                    <td className="py-2 px-3 text-right border-b border-card-border font-mono text-sm">{monthlyRevenue.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} MAD</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 6: 25-Year Projection */}
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">{t('report.projection_title')}</h2>
        <p className="text-xs text-gray-600 mb-4">{t('report.projection_desc')}</p>
        <table className="w-full text-xs text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-2 px-3 font-semibold border-r border-gray-300">{t('report.year')}</th>
              <th className="py-2 px-3 font-semibold border-r border-gray-300 text-right">{t('report.annual_yield')}</th>
              <th className="py-2 px-3 font-semibold border-r border-gray-300 text-right">{t('report.annual_revenue')}</th>
              <th className="py-2 px-3 font-semibold text-right">{t('report.cumulative_revenue')}</th>
            </tr>
          </thead>
          <tbody>
            {projections?.map((p) => (
              <tr key={p.year} className="border-b border-gray-200 even:bg-gray-50">
                <td className="py-1 px-3 border-r border-gray-300">{t('report.year')} {p.year}</td>
                <td className="py-1 px-3 text-right border-r border-gray-300">{p.yield.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} kWh</td>
                <td className="py-1 px-3 text-right border-r border-gray-300">{p.revenue.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} MAD</td>
                <td className="py-1 px-3 text-right font-semibold">{p.cumulative.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} MAD</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 7: Disclaimers */}
      <div className="mt-16 pt-6 border-t border-gray-300 text-[9px] text-gray-600 space-y-3 leading-relaxed page-break-inside-avoid">
        <p><strong>{t('report.disc_data_title')}</strong> {t('report.disc_data_text')}</p>
        <p><strong>{t('report.disc_method_title')}</strong> {t('report.disc_method_text')}</p>
        <p><strong>{t('report.disc_legal_title')}</strong> {t('report.disc_legal_text')}</p>
      </div>

    </div>
  );
}
