import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

function CustomTooltip({ active, payload, label }) {
  const { t, i18n } = useTranslation();

  if (active && payload && payload.length) {
    const ghiData     = payload.find(p => p.dataKey === 'ghi');
    const benefitData = payload.find(p => p.dataKey === 'benefit');
    const prData      = payload.find(p => p.dataKey === 'pr');

    return (
      <div className="bg-text-heading border border-text-muted rounded-none p-3 flex flex-col gap-2 min-w-[200px] z-50">
        <span className="text-[10px] font-sans font-semibold text-text-faint uppercase tracking-wider">
          {t('tooltip.month')}: {label}
        </span>
        <div className="flex flex-col gap-1.5">
          {ghiData && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-sans text-white/80">{t('chart.avg_ghi')}</span>
              <span className="text-sm font-bold font-mono text-white tabular-nums">{ghiData.value.toFixed(2)}</span>
            </div>
          )}
          {prData && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-sans text-white/80">{t('chart.monthly_pr')}</span>
              <span className="text-sm font-bold font-mono text-white tabular-nums">{prData.value.toFixed(3)}</span>
            </div>
          )}
          {benefitData && (
            <div className="flex items-center justify-between gap-4 border-t border-text-muted pt-2 mt-1">
              <span className="text-[10px] font-sans text-white/80">{t('chart.cumulative_benefit')}</span>
              <span className="text-sm font-bold font-mono text-brand tabular-nums">
                {Number(benefitData.value).toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US')} MAD
              </span>
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
  const { monthlyCalculations = [] } = useAppContext();

  const formatCurrency = (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val;

  return (
    <div className="w-full h-full bg-card-surface border border-card-border rounded-sm p-6 flex flex-col relative min-h-[300px]">

      {/* Chart header */}
      <div className="w-full mb-4">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-[10px] font-sans font-semibold text-text-muted tracking-[0.15em] uppercase">
            {t('chart.thermal_monetary_yield')}
          </h3>
          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-data-bar" />
              <span className="text-[10px] font-sans text-text-muted">{t('chart.avg_ghi')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 border-t-2 border-dashed border-text-faint" />
              <span className="text-[10px] font-sans text-text-muted">{t('chart.performance_pr')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[1.5px] bg-data-line" />
              <span className="text-[10px] font-sans text-text-muted">{t('chart.cumulative_benefit')}</span>
            </div>
          </div>
        </div>
        <div className="border-b border-card-border mt-3" />
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-canvas-base/60 z-10 flex items-center justify-center">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-[0.15em] animate-pulse">
            {t('chart.recalculating')}
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyCalculations} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>

            <CartesianGrid stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }}
            />

            {/* Hidden axis to normalise the PR curve between 0.65 and 0.90 */}
            <YAxis yAxisId="pr" orientation="right" hide={true} domain={[0.65, 0.90]} />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />

            <Bar
              yAxisId="left"
              dataKey="ghi"
              fill="#D97706"
              fillOpacity={0.85}
              radius={[2, 2, 0, 0]}
              barSize={28}
              activeBar={{ fill: '#F59E0B', fillOpacity: 1 }}
            />

            <Line
              yAxisId="pr"
              type="monotone"
              dataKey="pr"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#94A3B8', stroke: '#FFF' }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="benefit"
              stroke="#64748B"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#FFFFFF', stroke: '#64748B', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#B45309', stroke: '#FFFFFF', strokeWidth: 2 }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}