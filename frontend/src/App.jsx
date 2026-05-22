import { useState, useEffect } from 'react';
import HubSelector from './components/HubSelector';
import KpiCards from './components/KpiCards';
import SolarChart from './components/SolarChart';
import PrintButton from './components/PrintButton';

export default function App() {
  const [selectedCity, setSelectedCity] = useState({ name: 'Casablanca', lat: 33.5731, lon: -7.5898 });
  const [pKwp, setPKwp] = useState(100);
  const [alphaSelf, setAlphaSelf] = useState(75);

  // Live HTTP response states
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Asynchronous API network bridge execution
  useEffect(() => {
    let isMounted = true;
    
    const fetchSolarMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/api/solar-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city: selectedCity.name,
            lat: selectedCity.lat,
            lon: selectedCity.lon,
            system_size_kwp: pKwp,
            self_consumption_ratio: alphaSelf / 100,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server status fault: ${response.status} Error`);
        }

        const data = await response.json();
        if (isMounted) {
          setApiData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to communicate with calculation service.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSolarMetrics();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, pKwp, alphaSelf]);

  // Fallback calculations for seamless UI display if backend is loading or unreachable
  const defaultPsh = 1820;
  const performanceRatio = 0.78;
  const annualYieldKwh = pKwp * defaultPsh * performanceRatio;
  const simulatedSavingsMad = (annualYieldKwh * (alphaSelf / 100)) * 1.10;
  const simulatedAvoidedCo2Tons = (annualYieldKwh * 0.604) / 1000;

  // Resolve metrics: Prefer live calculated backend aggregates, default to simulated models
  const liveYield = apiData?.metrics?.summary?.total_generated_kwh ?? annualYieldKwh;
  const liveSavings = apiData?.metrics?.financials?.total_annual_benefit_mad ?? simulatedSavingsMad;
  const liveCo2 = apiData?.metrics?.environmental?.avoided_co2_tons_per_year ?? simulatedAvoidedCo2Tons;
  const ghiDailyVector = apiData?.raw_data_hourly_or_daily?.ghi_daily ?? {};

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden antialiased select-none">
      
      {/* CONFIGURATION SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 no-print shrink-0">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-sm font-bold text-amber-400 tracking-tight">MaroSun C&I Evaluator</h1>
            <p className="text-[10px] text-slate-500 font-medium">v1.0.0 • Industrial Framework</p>
          </div>
          
          <HubSelector selectedCity={selectedCity} onSelectCity={setSelectedCity} />
          
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            {/* Sizing Controller */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Target Size (P_kWp)</span>
                <span className="font-mono text-amber-400 font-bold">{pKwp} kWp</span>
              </div>
              <input 
                type="range" min="10" max="500" step="5" value={pKwp} 
                onChange={(e) => setPKwp(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Self-Consumption Optimization */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Self-Consumption (α)</span>
                <span className="font-mono text-amber-400 font-bold">{alphaSelf}%</span>
              </div>
              <input 
                type="range" min="60" max="95" step="1" value={alphaSelf} 
                onChange={(e) => setAlphaSelf(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Real-time Loading and Error Tickers */}
        <div className="flex flex-col gap-1 font-mono text-[10px]">
          {loading && <span className="text-amber-400 animate-pulse">⚡ Requesting data...</span>}
          {error && <span className="text-rose-500 font-semibold">❌ Status: {error}</span>}
          {!loading && !error && <span className="text-emerald-500">✓ System Synced (Live)</span>}
          <div className="text-slate-600 mt-2">
            ANRE Tariff: 1.10 MAD/kWh <br />
            Surplus Cap: 20% (Law 82-21)
          </div>
        </div>
      </aside>

      {/* DASHBOARD WORKSPACE MAIN VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-4 gap-4">
        <header className="flex justify-between items-center border-b border-slate-900 pb-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Solar Appraisal Dashboard
            </h2>
            <p className="text-xs text-slate-400">
              Evaluating configuration profiles for <span className="text-amber-400 font-semibold">{selectedCity.name}</span> ({selectedCity.lat.toFixed(4)}°N, {selectedCity.lon.toFixed(4)}°W)
            </p>
          </div>
          <div className="no-print">
            <PrintButton />
          </div>
        </header>

        {/* KPI Cards row fed by live numbers */}
        <KpiCards yields={liveYield} savings={liveSavings} co2={liveCo2} />

        <section className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded p-3 relative">
          <SolarChart 
            ghiDaily={ghiDailyVector} 
            pKwp={pKwp} 
            alphaSelf={alphaSelf} 
            isLoading={loading}
          />
        </section>
      </main>
    </div>
  );
}