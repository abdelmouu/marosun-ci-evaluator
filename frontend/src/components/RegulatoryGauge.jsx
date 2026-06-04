import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PSH, DEFAULT_PR, TARIFF_INJECTION } from '../config/constants';

export default function RegulatoryGauge({ pKwp, alphaSelf, apiData }) {
  const { t, i18n } = useTranslation();
  const [isActive, setIsActive] = useState(false);

  const totalAc = apiData?.metrics?.summary?.total_generated_kwh ?? (pKwp * DEFAULT_PSH * DEFAULT_PR);
  const surplusRaw = apiData?.metrics?.splits?.surplus_generated_kwh ?? (totalAc * (1 - (alphaSelf / 100)));
  const surplusLost = apiData?.metrics?.splits?.surplus_lost_curtailed_kwh ?? Math.max(0, surplusRaw - (totalAc * 0.20));

  const surplusRatioPct = totalAc > 0 ? (surplusRaw / totalAc) * 100 : 0;
  const lossMad = surplusLost * TARIFF_INJECTION;

  let fillColor = '#059669';
  let message = t('regulatory.optimal_zone');
  let msgColorClass = "text-[#059669]";

  if (surplusRatioPct >= 15 && surplusRatioPct <= 20) {
    fillColor = '#D97706';
    message = t('regulatory.warning_approaching');
    msgColorClass = "text-[#D97706]";
  } else if (surplusRatioPct > 20) {
    fillColor = '#DC2626';
    message = t('regulatory.alert_excess');
    msgColorClass = "text-[#DC2626] font-semibold";
  }

  return (
    <div className="bg-card-surface border border-card-border rounded-sm p-5 w-full flex flex-col gap-2">

      {/* Card Header with Built-in Toggle */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-[10px] font-sans font-semibold text-text-heading tracking-[0.15em] uppercase">
          {t('regulatory.gauge_title')}
        </h3>
        <div className="flex p-0.5 bg-canvas-base border border-card-border rounded-sm shrink-0">
          <button
            onClick={() => setIsActive(true)}
            className={`px-3 py-1 text-[9px] font-bold uppercase transition-colors rounded-sm ${isActive ? 'bg-card-surface border border-card-border shadow-sm text-text-heading' : 'text-text-muted hover:text-text-heading'}`}
          >
            {t('common.enabled')}
          </button>
          <button
            onClick={() => setIsActive(false)}
            className={`px-3 py-1 text-[9px] font-bold uppercase transition-colors rounded-sm ${!isActive ? 'bg-card-surface border border-card-border shadow-sm text-text-heading' : 'text-text-muted hover:text-text-heading'}`}
          >
            {t('common.disabled')}
          </button>
        </div>
      </div>

      {/* Faded Body State */}
      <div className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none select-none'}`}>

        {/* Loss Indicator Wrapper (Keeps fixed height to prevent jumping) */}
        <div className="flex justify-end items-center mt-2 h-[26px]">
          {lossMad > 0 && (
            <div className="text-[10px] font-sans font-medium px-2 py-1 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-sm">
              {t('regulatory.estimated_loss')} <span className="font-mono font-bold ml-1">{lossMad.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} MAD</span>
            </div>
          )}
        </div>

        <div className="relative w-full mt-4 mb-2">
          <div className="h-4 w-full bg-canvas-base border border-card-border overflow-hidden relative">
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(surplusRatioPct, 100)}%`, backgroundColor: fillColor }}
            />
          </div>

          <div className="absolute top-[-6px] bottom-[-6px] w-[2px] bg-[#DC2626] z-10" style={{ left: '20%' }} />
          <span className="absolute -top-5 text-[10px] font-sans font-semibold text-[#DC2626] tracking-wider" style={{ left: 'calc(20% - 12px)' }}>
            {t('regulatory.cap_20')}
          </span>
        </div>

        <p className={`text-[11px] font-sans font-medium mt-2 ${msgColorClass}`}>
          {message}
        </p>
      </div>
    </div>
  );
}