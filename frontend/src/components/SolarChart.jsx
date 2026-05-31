import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

function CustomTooltip({ active, payload, label }) {
  const { t, i18n } = useTranslation();

  if (active && payload && payload.length) {
    const ghiData = payload.find(p => p.dataKey === "ghi");
    const benefitData = payload.find(p => p.dataKey === "benefit");
    const prData = payload.find(p => p.dataKey === "pr");

    return (
      <div className="bg-[rgba(20,35,65,0.92)] backdrop-blur-lg border border-[rgba(232,160,32,0.40)] rounded-xl p-3 shadow-[0_8px_24px_rgba(10,20,50,0.25)] flex flex-col gap-2 min-w-[200px] font-sans z-50">
        <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{label}</span>
        <div className="flex flex-col gap-1.5">
          {ghiData && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F7CAC]" />
                <span className="text-[10px] text-white/60">{t('chart.avg_ghi')}</span>
              </div>
              <span className="text-sm font-bold text-[#4F7CAC] tabular-nums">{ghiData.value.toFixed(2)}</span>
            </div>
          )}
          {prData && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span className="text-[10px] text-white/60">{t('chart.monthly_pr')}</span>
              </div>
              <span className="text-sm font-bold text-[#EF4444] tabular-nums">{prData.value.toFixed(3)}</span>
            </div>
          )}
          {benefitData && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-1.5 mt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
                <span className="text-[10px] text-white/60">{t('chart.cumulative_benefit')}</span>
              </div>
              <span className="text-sm font-bold text-[#E8A020] tabular-nums">{Number(benefitData.value).toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US')} {t('common.mad')}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function SolarChart({ isLoading }) {
  const { t } = useTranslation();
  const { monthlyCalculations = [], apiData = {} } = useAppContext();

  const formatCurrency = (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val;

  return (
    <div className="w-full h-full bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_4px_16px_rgba(50,80,130,0.08)] p-5 flex flex-col relative min-h-[300px]">
      
      <div className="w-full">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-xs font-semibold text-text-muted tracking-wide uppercase">
            {t('chart.thermal_monetary_yield')}
          </h3>
          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-[2px] bg-[#4F7CAC]" />
              <span className="text-[11px] font-medium text-text-muted">{t('chart.avg_ghi')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 border-t-2 border-dashed border-[#EF4444]" />
              <span className="text-[11px] font-medium text-text-muted">{t('chart.performance_pr')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[2.5px] bg-[#E8A020]" />
              <span className="text-[11px] font-medium text-text-muted">{t('chart.cumulative_benefit')}</span>
            </div>
          </div>
        </div>
        <div className="border-b border-[rgba(210,222,240,0.40)] mb-4 mt-2" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
          <span className="text-xs bg-white/90 border border-brand/40 text-brand font-semibold px-4 py-2 rounded-xl shadow-md animate-pulse">
            {t('chart.recalculating')}
          </span>
        </div>
      )}

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyCalculations} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="rgba(100,130,170,0.12)" horizontal={true} vertical={false} />
            
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'rgba(100,130,170,0.15)' }} tick={{ fill: '#8A9DBB', fontSize: 10 }} />
            
            <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tick={{ fill: '#8A9DBB', fontSize: 10 }} />
            
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickFormatter={formatCurrency} tick={{ fill: '#E8A020', fontSize: 10 }} />
            
            {/* Axe caché pour normaliser la courbe PR entre 0.65 et 0.90 */}
            <YAxis yAxisId="pr" orientation="right" hide={true} domain={[0.65, 0.90]} />

            <Tooltip content={<CustomTooltip />} />

            <Bar yAxisId="left" dataKey="ghi" fill="#4F7CAC" radius={[6, 6, 0, 0]} barSize={28} />
            
            <Line yAxisId="pr" type="monotone" dataKey="pr" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 4, fill: '#EF4444', stroke: '#FFF' }} />
            
            <Line yAxisId="right" type="monotone" dataKey="benefit" stroke="#E8A020" strokeWidth={2.5} dot={{ r: 4, fill: '#C4851A', stroke: '#FFF' }} activeDot={{ r: 6, fill: '#E8A020', stroke: '#FFF' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}