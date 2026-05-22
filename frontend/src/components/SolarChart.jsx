import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const ghiData = payload.find((p) => p.dataKey === "Average GHI");
    const benefitData = payload.find((p) => p.dataKey === "Cumulative Benefit (MAD)");

    return (
      <div className="bg-[rgba(20,35,65,0.92)] backdrop-blur-lg border border-[rgba(232,160,32,0.40)] rounded-xl p-3 shadow-[0_8px_24px_rgba(10,20,50,0.25)] flex flex-col gap-2 min-w-[200px] font-sans">
        <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex flex-col gap-1.5">
          {ghiData && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F7CAC]" />
                <span className="text-[10px] text-white/60">Average GHI</span>
              </div>
              <span className="text-sm font-bold text-[#4F7CAC] tabular-nums">
                {ghiData.value.toFixed(2)}
              </span>
            </div>
          )}
          {benefitData && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020]" />
                <span className="text-[10px] text-white/60">Cumulative Benefit</span>
              </div>
              <span className="text-sm font-bold text-[#E8A020] tabular-nums">
                {Number(benefitData.value).toLocaleString('en-US')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function SolarChart({ ghiDaily = {}, pKwp, alphaSelf, isLoading }) {
  
  const monthlyCalculations = useMemo(() => {
    const keys = Object.keys(ghiDaily);
    
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseGrid = Array.from({ length: 12 }, (_, i) => ({
      name: monthLabels[i],
      ghiSum: 0,
      dayCount: 0,
    }));

    if (keys.length === 0) {
      const defaultPshDistribution = [3.2, 4.1, 5.5, 6.4, 7.2, 7.8, 7.5, 6.9, 5.8, 4.4, 3.5, 2.9];
      let mockCumulativeBenefit = 0;
      return baseGrid.map((month, idx) => {
        const avgGhi = defaultPshDistribution[idx];
        const monthlyYield = pKwp * (avgGhi * 30.5) * 0.78;
        const savings = (monthlyYield * (alphaSelf / 100) * 1.10) + (Math.min(monthlyYield * (1 - alphaSelf / 100), monthlyYield * 0.20) * 0.195);
        mockCumulativeBenefit += savings;
        return {
          name: month.name,
          "Average GHI": parseFloat(avgGhi.toFixed(2)),
          "Cumulative Benefit (MAD)": parseFloat(mockCumulativeBenefit.toFixed(0)),
        };
      });
    }

    keys.forEach((dateStr) => {
      const val = ghiDaily[dateStr];
      if (val >= 0) {
        const monthIdx = parseInt(dateStr.substring(4, 6), 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          baseGrid[monthIdx].ghiSum += val;
          baseGrid[monthIdx].dayCount += 1;
        }
      }
    });

    let cumulativeFinancialRunningSum = 0;

    return baseGrid.map((m) => {
      const avgDailyGhi = m.dayCount > 0 ? m.ghiSum / m.dayCount : 0;
      
      const monthlyTotalYieldKwh = pKwp * m.ghiSum * 0.78;
      const selfConsumedKwh = monthlyTotalYieldKwh * (alphaSelf / 100);
      const surplusRawKwh = monthlyTotalYieldKwh * (1 - alphaSelf / 100);
      const surplusAllowedGridKwh = Math.min(surplusRawKwh, monthlyTotalYieldKwh * 0.20);

      const monthlyFinancialBenefit = (selfConsumedKwh * 1.10) + (surplusAllowedGridKwh * 0.195);
      cumulativeFinancialRunningSum += monthlyFinancialBenefit;

      return {
        name: m.name,
        "Average GHI": parseFloat(avgDailyGhi.toFixed(2)),
        "Cumulative Benefit (MAD)": parseFloat(cumulativeFinancialRunningSum.toFixed(0)),
      };
    });
  }, [ghiDaily, pKwp, alphaSelf]);

  const formatCurrencyAbbreviation = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  return (
    <div className="w-full h-full bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_4px_16px_rgba(50,80,130,0.08)] p-5 flex flex-col relative min-h-[300px]">
      
      <div className="w-full">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-xs font-semibold text-text-muted tracking-wide uppercase">
            Monthly GHI & Cumulative Financial Benefit
          </h3>
          
          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-[2px] bg-[#4F7CAC]" />
              <span className="text-[11px] font-medium text-text-muted">Average GHI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-[2.5px] bg-[#E8A020]" />
              <span className="text-[11px] font-medium text-text-muted">Cumulative Benefit</span>
            </div>
          </div>
        </div>
        <div className="border-b border-[rgba(210,222,240,0.40)] mb-4 mt-2" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none rounded-2xl">
          <span className="text-xs bg-white/90 border border-[rgba(210,222,240,0.90)] text-brand font-sans font-semibold px-4 py-2 rounded-xl shadow-md tracking-wide animate-pulse">
            Recalculating Regional Arrays...
          </span>
        </div>
      )}

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={monthlyCalculations}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="4 6" 
              stroke="rgba(100,130,170,0.12)" 
              horizontal={true} 
              vertical={false} 
            />
            
            {/* Axis Typography aligned to exactly 10px Sora */}
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={{ stroke: 'rgba(100,130,170,0.15)', strokeWidth: 1 }}
              tick={{ fill: '#8A9DBB', fontSize: 10, fontFamily: 'Sora, sans-serif' }}
            />
            
            <YAxis 
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8A9DBB', fontSize: 10, fontFamily: 'Sora, sans-serif' }}
              label={{ 
                value: 'GHI (kWh/m²/day)', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#8A9DBB', 
                fontSize: 10, 
                fontFamily: 'Sora, sans-serif',
                offset: 0 
              }}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrencyAbbreviation}
              tick={{ fill: '#E8A020', fontSize: 10, fontFamily: 'Sora, sans-serif' }}
              label={{ 
                value: 'Cumulative Value (MAD)', 
                angle: 90, 
                position: 'insideRight', 
                fill: '#E8A020', 
                fontSize: 10, 
                fontFamily: 'Sora, sans-serif',
                offset: 0 
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar 
              yAxisId="left"
              dataKey="Average GHI" 
              fill="#4F7CAC" 
              radius={[6, 6, 0, 0]}
              barSize={28}
              activeBar={{ fill: '#3A6090' }}
            />

            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="Cumulative Benefit (MAD)" 
              stroke="#E8A020" 
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#C4851A', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#E8A020', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}