import React from 'react';

export default function SolarChart({ cityName }) {
  return (
    <div className="w-full h-full bg-slate-950 border border-dashed border-slate-800 rounded flex flex-col items-center justify-center p-4 text-center">
      <div className="p-2 rounded-full bg-amber-500/10 text-amber-400 mb-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h4 className="text-xs font-semibold text-slate-300">Irradiance Timeseries Matrix Placeholder</h4>
      <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
        Active target location: {cityName || "None Selected"}. Ready for integration with custom charting frameworks.
      </p>
    </div>
  );
}