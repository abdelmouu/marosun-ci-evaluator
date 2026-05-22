import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function SolarChart({ ghiDaily = {}, pKwp, alphaSelf, isLoading }) {
  
  // Transform daily timeseries inputs into monthly aggregates (Maintained core logic)
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

  /**
   * Premium Unit Abbreviation Formatter Rule
   * Scales large valuations cleanly into thousands notation (e.g., 450000 → "450K")
   */
  const formatCurrencyAbbreviation = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  return (
    <div className="w-full h-full bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] rounded-2xl shadow-[0_4px_16px_rgba(50,80,130,0.08)] p-5 flex flex-col relative min-h-[300px]">
      
      {/* CARD INTERNAL HEADER */}
      <div className="w-full">
        <h3 className="text-xs font-semibold text-text-muted tracking-wide uppercase">
          Monthly GHI & Cumulative Financial Benefit
        </h3>
        <div className="border-b border-[rgba(210,222,240,0.40)] mb-4 mt-2" />
      </div>

      {/* LOADING OVERLAY STATE */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none rounded-2xl">
          <span className="text-xs bg-white/90 border border-[rgba(210,222,240,0.90)] text-brand font-sans font-semibold px-4 py-2 rounded-xl shadow-md tracking-wide animate-pulse">
            Recalculating Regional Arrays...
          </span>
        </div>
      )}

      {/* RECHARTS CANVAS BODY */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={monthlyCalculations}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            {/* COMPOSITE INNER GRID CONFIGURATION */}
            <CartesianGrid 
              strokeDasharray="4 6" 
              stroke="rgba(100,130,170,0.12)" 
              horizontal={true} 
              vertical={false} 
            />
            
            {/* AXIS SYSTEMS */}
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={{ stroke: 'rgba(100,130,170,0.15)', strokeWidth: 1 }}
              tick={{ fill: '#8A9DBB', fontSize: 10, fontFamily: 'Sora, sans-serif' }}
            />
            
            {/* LEFT Y-AXIS: SOLAR RADIATION Resource TRACKING */}
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
                fontSize: 9, 
                fontFamily: 'Sora, sans-serif',
                offset: 0 
              }}
            />

            {/* RIGHT Y-AXIS: CUMULATIVE MONETARY VALUATION MATRIX */}
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
                fontSize: 9, 
                fontFamily: 'Sora, sans-serif',
                offset: 0 
              }}
            />

            {/* UNTOUCHED INTERACTIVE TOOLTIPS & LEGENDS PER SPECIFICATION */}
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
              itemStyle={{ fontSize: '11px', padding: '2px 0' }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              verticalAlign="bottom"
              height={36}
            />

            {/* MONTHLY RADIATION DATA VECTOR (SLATE INDIGO BARS) */}
            <Bar 
              yAxisId="left"
              dataKey="Average GHI" 
              fill="#4F7CAC" 
              radius={[6, 6, 0, 0]}
              barSize={28}
              activeBar={{ fill: '#3A6090' }}
            />

            {/* FINANCIAL RUNNING GAIN GRAPH LINE (AMBER GLOW) */}
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