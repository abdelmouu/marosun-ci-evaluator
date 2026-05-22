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
  
  // Transform daily timeseries inputs into monthly aggregates
  const monthlyCalculations = useMemo(() => {
    const keys = Object.keys(ghiDaily);
    
    // If no live data is fetched yet, generate empty mock distributions for immediate rendering
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseGrid = Array.from({ length: 12 }, (_, i) => ({
      name: monthLabels[i],
      ghiSum: 0,
      dayCount: 0,
    }));

    if (keys.length === 0) {
      // Approximate distribution map for display before data arrives
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

    // Process live daily keys (Format: "YYYYMMDD")
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
      
      // Engineering calculations matching backend engine specifications
      const monthlyTotalYieldKwh = pKwp * m.ghiSum * 0.78;
      const selfConsumedKwh = monthlyTotalYieldKwh * (alphaSelf / 100);
      const surplusRawKwh = monthlyTotalYieldKwh * (1 - alphaSelf / 100);
      const surplusAllowedGridKwh = Math.min(surplusRawKwh, monthlyTotalYieldKwh * 0.20); // Law 82-21 20% limit

      const monthlyFinancialBenefit = (selfConsumedKwh * 1.10) + (surplusAllowedGridKwh * 0.195);
      cumulativeFinancialRunningSum += monthlyFinancialBenefit;

      return {
        name: m.name,
        "Average GHI": parseFloat(avgDailyGhi.toFixed(2)),
        "Cumulative Benefit (MAD)": parseFloat(cumulativeFinancialRunningSum.toFixed(0)),
      };
    });
  }, [ghiDaily, pKwp, alphaSelf]);

  return (
    <div className="w-full h-full relative min-h-[300px]">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
          <span className="text-xs bg-slate-900 border border-slate-800 text-amber-400 font-mono px-3 py-1.5 rounded shadow-xl tracking-wide animate-pulse">
            Recalculating Regional Arrays...
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={monthlyCalculations}
          margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#334155' }}
          />
          
          {/* LEFT Y-AXIS: RADIATION METRICS */}
          <YAxis 
            yAxisId="left"
            orientation="left"
            stroke="#f59e0b"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={{ stroke: '#334155' }}
            label={{ value: 'GHI (kWh/m²/day)', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 10, offset: 0 }}
          />

          {/* RIGHT Y-AXIS: FINANCIAL METRICS */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#10b981"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={{ stroke: '#334155' }}
            label={{ value: 'Cumulative Value (MAD)', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 10, offset: 0 }}
          />

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

          {/* Monthly average GHI (Bar) mapped to the Left Axis */}
          <Bar 
            yAxisId="left"
            dataKey="Average GHI" 
            fill="#d97706" 
            radius={[2, 2, 0, 0]}
            maxBarSize={35}
          />

          {/* Running cumulative benefits (Line) mapped to the Right Axis */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="Cumulative Benefit (MAD)" 
            stroke="#10b981" 
            strokeWidth={2.5}
            dot={{ r: 2, fill: '#10b981' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}