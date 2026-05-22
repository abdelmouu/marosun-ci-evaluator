
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
        Moroccan Industrial Hubs
      </h3>
      {CITIES.map((city) => {
        const isSelected = selectedCity?.name === city.name;
        return (
          <button
            key={city.name}
            onClick={() => onSelectCity(city)}
            className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded transition-all ${
              isSelected ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{city.name}</span>
              <span className={`font-mono text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                {city.lat.toFixed(2)}°N
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}