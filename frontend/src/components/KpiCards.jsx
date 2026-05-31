import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function KpiCards({ yields = 0, savings = 0, co2 = 0 }) {
  const { t } = useTranslation();

  const splitNumber = (value, decimals) => {
    const parts = value.toFixed(decimals).split('.');
    const integerPart = Number(parts[0]).toLocaleString('en-US');
    const decimalPart = parts[1] ? `.${parts[1]}` : '';
    return { integerPart, decimalPart };
  };

  const yieldParts = useMemo(() => splitNumber(yields, 0), [yields]);
  const savingsParts = useMemo(() => splitNumber(savings, 2), [savings]);
  const co2Parts = useMemo(() => splitNumber(co2, 1), [co2]);

  return (
    /* Main KPI structural container locked at 16px row spacing (gap-4) */
    <div className="grid grid-cols-3 gap-4 w-full">
      
      {/* ANNUAL AC YIELD CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-6 min-h-[100px] flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1A2540] shrink-0" />
          <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
            {t('kpi.annual_yield')}
          </span>
        </div>
        <div className="flex flex-row items-baseline gap-1 mt-2 flex-wrap">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#1A2540]">
            {yieldParts.integerPart}
          </span>
          {yieldParts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#1A2540]">
              {yieldParts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            {t('common.kwh_yr')}
          </span>
        </div>
      </div>

      {/* ANNUAL SAVINGS CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-6 min-h-[100px] flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E8A020] shrink-0" />
          <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
            {t('kpi.annual_savings')}
          </span>
        </div>
        <div className="flex flex-row items-baseline gap-1 mt-2 flex-wrap">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#E8A020]">
            {savingsParts.integerPart}
          </span>
          {savingsParts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#E8A020]">
              {savingsParts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            {t('common.mad_yr')}
          </span>
        </div>
      </div>

      {/* AVOIDED CO₂ CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-6 min-h-[100px] flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2D7D5B] shrink-0" />
          <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
            {t('kpi.avoided_co2')}
          </span>
        </div>
        <div className="flex flex-row items-baseline gap-1 mt-2 flex-wrap">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#2D7D5B]">
            {co2Parts.integerPart}
          </span>
          {co2Parts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#2D7D5B]">
              {co2Parts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            {t('common.tons_yr')}
          </span>
        </div>
      </div>

    </div>
  );
}