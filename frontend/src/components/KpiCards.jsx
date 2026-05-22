import React from 'react';

export default function KpiCards({ yields = 0, savings = 0, co2 = 0 }) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Annual AC Yield</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono tracking-tight text-white">{yields.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-500">kWh/yr</span>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Annual Savings</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono tracking-tight text-amber-400">{savings.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-500">MAD/yr</span>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avoided CO₂</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono tracking-tight text-emerald-400">{co2.toFixed(1)}</span>
          <span className="text-[10px] font-medium text-slate-500">Tons/yr</span>
        </div>
      </div>
    </div>
  );
}