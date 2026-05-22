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

  // Compute track filled/unfilled percentages for seamless linear-gradient injection
  const pKwpPercentage = ((pKwp - 10) / (500 - 10)) * 100;
  const alphaPercentage = ((alphaSelf - 60) / (95 - 60)) * 100;

  const sliderTrackStyle1 = {
    background: `linear-gradient(to right, #E8A020 0%, #E8A020 ${pKwpPercentage}%, rgba(100,130,170,0.20) ${pKwpPercentage}%, rgba(100,130,170,0.20) 100%)`
  };

  const sliderTrackStyle2 = {
    background: `linear-gradient(to right, #E8A020 0%, #E8A020 ${alphaPercentage}%, rgba(100,130,170,0.20) ${alphaPercentage}%, rgba(100,130,170,0.20) 100%)`
  };

  const sliderInputClass = "w-full appearance-none h-1 rounded-full outline-none cursor-pointer transition-all duration-150 ease-out " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E8A020] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(232,160,32,0.40)] [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-out hover:[&::-webkit-slider-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:shadow-[0_2px_12px_rgba(232,160,32,0.60)] " +
    "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#E8A020] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(232,160,32,0.40)] [&::-moz-range-thumb]:cursor-grab active:[&::-moz-range-thumb]:cursor-grabbing [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-out hover:[&::-moz-range-thumb]:scale-110 hover:[&::-moz-range-thumb]:shadow-[0_2px_12px_rgba(232,160,32,0.60)] [&::-moz-range-thumb]:border-none";

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-canvas-from to-canvas-to text-text-body flex overflow-hidden antialiased font-sans select-none">
      
      {/* SIDEBAR CONTAINER */}
      <aside className="w-[260px] bg-white/60 backdrop-blur-xl saturate-[180%] border-r border-[rgba(200,215,235,0.80)] shadow-[4px_0_20px_rgba(50,80,130,0.06)] px-5 py-6 flex flex-col shrink-0 justify-between">
        <div className="flex flex-col">
          
          {/* Brand Block */}
          <div>
            <h1 className="text-sm font-bold tracking-tight text-text-heading">
              <span className="text-[#E8A020]">MaroSun</span> C&I Evaluator
            </h1>
            <p className="text-[10px] font-medium text-text-faint tracking-[0.05em] mt-0.5">
              v1.0.0 • Industrial Framework
            </p>
          </div>
          
          <div className="border-t border-[rgba(200,215,235,0.50)] mt-6 print:hidden" />
          
          {/* City list Chrome hidden during print */}
          <div className="mt-6 print:hidden">
            <HubSelector selectedCity={selectedCity} onSelectCity={setSelectedCity} />
          </div>
          
          <div className="border-t border-[rgba(200,215,235,0.50)] mt-6 print:hidden" />
          
          {/* Interactive slider parameters hidden during print */}
          <div className="flex flex-col gap-5 mt-6 print:hidden">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium text-text-body">Target Size (P_kWp)</span>
                <span className="text-sm font-bold text-brand tabular-nums">{pKwp} kWp</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                step="5" 
                value={pKwp} 
                onChange={(e) => setPKwp(Number(e.target.value))}
                className={sliderInputClass}
                style={sliderTrackStyle1}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium text-text-body">Self-Consumption (α)</span>
                <span className="text-sm font-bold text-brand tabular-nums">{alphaSelf}%</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="95" 
                step="1" 
                value={alphaSelf} 
                onChange={(e) => setAlphaSelf(Number(e.target.value))}
                className={sliderInputClass}
                style={sliderTrackStyle2}
              />
            </div>
          </div>
        </div>

        {/* System status node indicators hidden during print */}
        <div className="mt-auto pt-4 border-t border-[rgba(200,215,235,0.50)] flex flex-col gap-1 font-mono text-[10px] text-text-muted print:hidden">
          {loading && <span className="text-brand animate-pulse">⚡ Requesting data...</span>}
          {error && <span className="text-rose-600 font-semibold">❌ Status: {error}</span>}
          {!loading && !error && <span className="text-emerald-600 font-medium">✓ System Synced (Live)</span>}
          <div className="text-text-faint text-[9px] leading-relaxed mt-1.5">
            ANRE Tariff: 1.10 MAD/kWh <br />
            Surplus Cap: 20% (Law 82-21)
          </div>
        </div>
      </aside>

      {/* DASHBOARD WORKSPACE CANVAS VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden px-7 py-6">
        
        {/* COMPREHENSIVE PRINT ONLY AUDIT HEADER BLOCK */}
        <div className="hidden print:block border-b-2 border-[#C8D0DC] pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-black m-0">MaroSun C&I Evaluator — Solar Pre-Feasibility Audit</h1>
              <p className="text-xs text-[#555555] mt-1 m-0">
                Commercial & Industrial Solar Valuation Technical Profile Report
              </p>
            </div>
            <div className="text-right text-xs text-[#555555]">
              <div><strong>Evaluation Zone Hub:</strong> {selectedCity.name}</div>
              <div><strong>Spatial Markers Coordinates:</strong> {selectedCity.lat.toFixed(4)}°N, {selectedCity.lon.toFixed(4)}°W</div>
              <div><strong>Generation Audit Timestamp:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Standard UI display view dashboard header hidden during print */}
        <header className="flex justify-between items-center border-b border-card-border pb-2 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-text-heading leading-[1.2] tracking-tight">
              Solar Appraisal Dashboard
            </h2>
            <p className="text-xs font-normal text-text-muted leading-[1.5] mt-1">
              Evaluating configuration profiles for <span className="text-brand font-semibold">{selectedCity.name}</span> (<span className="tabular-nums">{selectedCity.lat.toFixed(4)}</span>°N, <span className="tabular-nums">{selectedCity.lon.toFixed(4)}</span>°W)
            </p>
          </div>
          <div className="print:hidden">
            <PrintButton />
          </div>
        </header>

        <div className="mt-5">
          <KpiCards yields={liveYield} savings={liveSavings} co2={liveCo2} />
        </div>

        <section className="flex-1 min-h-0 mt-4 h-[340px] relative">
          <SolarChart 
            ghiDaily={ghiDailyVector} 
            pKwp={pKwp} 
            alphaSelf={alphaSelf} 
            isLoading={loading}
          />
        </section>

        {/* COMPREHENSIVE PRINT ONLY FOOTER METADATA BLOCK */}
        <div className="hidden print:block mt-auto pt-4 border-t border-[#C8D0DC] text-center text-[10px] text-[#555555] font-mono tracking-wide">
          ANRE Tariff: 1.10 MAD/kWh | Surplus Cap: 20% (Law 82-21) | MaroSun C&I Evaluator v1.0.0
        </div>
      </main>
    </div>
  );
}