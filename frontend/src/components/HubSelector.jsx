const CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { name: 'Tangier', lat: 35.7595, lon: -5.8340 },
  { name: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { name: 'Fes', lat: 34.0331, lon: -5.0003 }
];

export default function HubSelector({ selectedCity, onSelectCity }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <h3 className="text-[9px] font-semibold text-text-muted tracking-[0.12em] uppercase mb-3 px-1">
        Moroccan Industrial Hubs
      </h3>
      
      <div className="flex flex-col gap-1.5">
        {CITIES.map((city) => {
          const isSelected = selectedCity?.name === city.name;
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={`w-full flex justify-between items-center py-2 px-3 transition-all duration-150 ease-out rounded-[10px] border ${
                isSelected
                  ? 'bg-[#E8A020] border-[#C4851A] shadow-[0_2px_8px_rgba(232,160,32,0.30)]'
                  : 'bg-transparent border-transparent hover:bg-brand/10 hover:border-brand/20 group'
              }`}
            >
              <span
                className={`text-sm font-medium transition-colors duration-150 ${
                  isSelected ? 'text-white font-semibold' : 'text-text-body group-hover:text-brand'
                }`}
              >
                {city.name}
              </span>
              <span
                className={`text-[11px] tabular-nums transition-colors duration-150 ${
                  isSelected ? 'text-white/70' : 'text-text-faint'
                }`}
              >
                {city.lat.toFixed(2)}°N
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}