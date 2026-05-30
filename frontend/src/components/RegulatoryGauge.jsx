import { useTranslation } from 'react-i18next';

export default function RegulatoryGauge({ pKwp, alphaSelf, apiData }) {
  const { t, i18n } = useTranslation();

  // Déclaration sans assignation de valeur par défaut pour satisfaire ESLint
  let totalAc;
  let surplusRaw;
  let surplusLost;

  if (apiData?.metrics) {
    totalAc = apiData.metrics.summary.total_generated_kwh;
    surplusRaw = apiData.metrics.splits.surplus_generated_kwh;
    surplusLost = apiData.metrics.splits.surplus_lost_curtailed_kwh;
  } else {
    // Fallback Frontend basé sur une moyenne PSH
    const defaultPsh = 1820;
    const performanceRatio = 0.78;
    totalAc = pKwp * defaultPsh * performanceRatio;
    surplusRaw = totalAc * (1 - (alphaSelf / 100));
    surplusLost = Math.max(0, surplusRaw - (totalAc * 0.20));
  }

  // Ratio d'injection brut et monétisation de la perte
  const surplusRatioPct = totalAc > 0 ? (surplusRaw / totalAc) * 100 : 0;
  const lossMad = surplusLost * 0.195;

  // Détermination des états de la jauge
  let fillColor = '#2D7D5B';
  let message = t('regulatory.optimal_zone');
  let msgColorClass = "text-[#2D7D5B]";

  if (surplusRatioPct >= 15 && surplusRatioPct <= 20) {
    fillColor = '#D4892A';
    message = t('regulatory.warning_approaching');
    msgColorClass = "text-orange-600";
  } else if (surplusRatioPct > 20) {
    fillColor = '#C0392B';
    message = t('regulatory.alert_excess');
    msgColorClass = "text-red-600 font-semibold";
  }

  return (
    <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] p-5 w-full flex flex-col gap-1 transition-all duration-150">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold text-text-heading tracking-wide">
          {t('regulatory.gauge_title')}
        </h3>
        {lossMad > 0 && (
          <div className="text-[11px] font-medium px-2.5 py-1 bg-red-50/80 border border-red-200 rounded-lg text-red-600 tabular-nums shadow-sm">
            {t('regulatory.estimated_loss')} <span className="font-bold">{lossMad.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 })} {t('common.mad_yr')}</span>
          </div>
        )}
      </div>

      <div className="relative w-full mt-3 mb-1">
        {/* Conteneur Track Horizontal */}
        <div className="h-3 w-full bg-[rgba(100,130,170,0.15)] rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(surplusRatioPct, 100)}%`, backgroundColor: fillColor }}
          />
        </div>
        
        {/* Marqueur 20% Indépendant (sibling) */}
        <div 
          className="absolute top-[-2px] h-[16px] w-px bg-text-muted/60 z-10"
          style={{ left: '20%' }}
        />
        <span 
          className="absolute -top-4 text-[9px] text-text-faint font-medium whitespace-nowrap"
          style={{ left: 'calc(20% - 15px)' }}
        >
          {t('regulatory.cap_20')}
        </span>
      </div>

      <p className={`text-[11px] mt-1.5 ${msgColorClass}`}>
        {message}
      </p>
    </div>
  );
}