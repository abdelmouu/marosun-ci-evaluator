import { useMemo } from 'react';

export default function KpiCards({ yields = 0, savings = 0, co2 = 0 }) {
  /**
   * Helper function to safely split integers from fractional decimals 
   * while adhering to English localized thousands separation formatting.
   */
  const splitNumber = (value, decimals) => {
    const parts = value.toFixed(decimals).split('.');
    const integerPart = Number(parts[0]).toLocaleString('en-US');
    const decimalPart = parts[1] ? `.${parts[1]}` : '';
    return { integerPart, decimalPart };
  };

  // Compute precise sub-string token slices using exact design decimal constraints
  const yieldParts = useMemo(() => splitNumber(yields, 0), [yields]);
  const savingsParts = useMemo(() => splitNumber(savings, 2), [savings]);
  const co2Parts = useMemo(() => splitNumber(co2, 1), [co2]);

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      
      {/* ANNUAL AC YIELD CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] border-l-[3px] border-l-[#1A2540] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-5 min-h-[100px] flex flex-col justify-between">
        <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
          Annual AC Yield
        </span>
        <div className="flex flex-row items-baseline gap-1 mt-2">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#1A2540]">
            {yieldParts.integerPart}
          </span>
          {yieldParts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#1A2540]">
              {yieldParts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            kWh/yr
          </span>
        </div>
      </div>

      {/* ANNUAL SAVINGS CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] border-l-[3px] border-l-[#E8A020] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-5 min-h-[100px] flex flex-col justify-between">
        <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
          Annual Savings
        </span>
        <div className="flex flex-row items-baseline gap-1 mt-2">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#E8A020]">
            {savingsParts.integerPart}
          </span>
          {savingsParts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#E8A020]">
              {savingsParts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            MAD/yr
          </span>
        </div>
      </div>

      {/* AVOIDED CO₂ CARD */}
      <div className="bg-white/75 backdrop-blur-lg border border-[rgba(210,222,240,0.90)] border-l-[3px] border-l-[#2D7D5B] rounded-2xl shadow-[0_2px_8px_rgba(50,80,130,0.06)] hover:bg-white/92 hover:shadow-[0_8px_24px_rgba(50,80,130,0.10)] transition-all duration-150 ease-out py-5 pr-6 pl-5 min-h-[100px] flex flex-col justify-between">
        <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-text-muted truncate max-w-full">
          Avoided CO₂
        </span>
        <div className="flex flex-row items-baseline gap-1 mt-2">
          <span className="text-[38px] font-bold leading-none tabular-nums text-[#2D7D5B]">
            {co2Parts.integerPart}
          </span>
          {co2Parts.decimalPart && (
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#2D7D5B]">
              {co2Parts.decimalPart}
            </span>
          )}
          <span className="text-sm font-medium text-text-muted ml-1">
            Tons/yr
          </span>
        </div>
      </div>

    </div>
  );
}