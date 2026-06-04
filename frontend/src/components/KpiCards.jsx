import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function KpiCards({ yields = 0, selfConsumed = 0, gridSurplus = 0, revenue = 0, co2 = 0 }) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const formatNum = (val, decimals = 0) => val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const cards = useMemo(() => [
    { id: 'yield', title: t('kpi.annualYield'), value: formatNum(yields, 0), unit: 'kWh', color: 'border-t-brand', flex: 'flex-[1.2]' },
    { id: 'self', title: t('kpi.selfConsumed'), value: formatNum(selfConsumed, 0), unit: 'kWh', color: 'border-t-brand', flex: 'flex-1' },
    { id: 'surplus', title: t('kpi.gridSurplus'), value: formatNum(gridSurplus, 0), unit: 'kWh', color: 'border-t-brand', flex: 'flex-1' },
    { id: 'revenue', title: t('kpi.netRevenue'), value: formatNum(revenue, 0), unit: 'MAD', color: 'border-t-brand', flex: 'flex-1' },
    { id: 'co2', title: t('kpi.co2Offset'), value: formatNum(co2, 1), unit: 't', color: 'border-t-[#059669]', flex: 'flex-1' }
  ], [yields, selfConsumed, gridSurplus, revenue, co2, t]);

  return (
    <div className="flex flex-row w-full gap-4">
      {cards.map((card) => {
        const isExpanded = expandedId === card.id;
        return (
          <div key={card.id} className={`${card.flex} relative min-w-0 min-h-[100px]`}>
            
            {/* Invisible click-away overlay when expanded */}
            {isExpanded && (
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setExpandedId(null)} 
              />
            )}

            {/* The Card */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
              className={`bg-card-surface border border-card-border rounded-sm border-t-2 ${card.color} flex flex-col justify-between cursor-pointer transition-all duration-150 ${
                isExpanded
                  ? 'absolute -inset-x-4 -top-3 z-50 h-auto p-5 shadow-[0_8px_24px_rgba(15,23,42,0.12)] border-card-border'
                  : 'w-full h-full p-4 hover:border-text-faint'
              }`}
              title={!isExpanded ? card.value : undefined}
            >
              <span className={`font-sans font-semibold uppercase tracking-[0.15em] text-text-muted ${isExpanded ? 'text-xs whitespace-normal' : 'text-[10px] truncate'}`}>
                {card.title}
              </span>
              
              <div className="flex flex-col mt-2">
                <span className={`font-mono font-medium text-text-heading tabular-nums lining-nums ${isExpanded ? 'text-3xl whitespace-normal break-all' : 'text-2xl truncate'}`}>
                  {card.value}
                </span>
                <span className="font-mono text-[11px] text-text-muted mt-1">
                  {card.unit}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}