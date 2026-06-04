import { useTranslation } from 'react-i18next';

const CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898, psh: 5.2 },
  { name: 'Rabat',      lat: 34.0209, lon: -6.8416, psh: 5.1 },
  { name: 'Tangier',    lat: 35.7595, lon: -5.8340, psh: 4.9 },
  { name: 'Agadir',     lat: 30.4278, lon: -9.5981, psh: 5.6 },
  { name: 'Marrakech',  lat: 31.6295, lon: -7.9811, psh: 5.5 },
  { name: 'Fes',        lat: 34.0331, lon: -5.0003, psh: 5.3 },
];

export default function HubSelector({ selectedCity, onSelectCity }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <h3 className="text-[10px] font-sans font-semibold text-text-muted tracking-[0.15em] uppercase mb-2">
        {t('hubs.title')}
      </h3>

      <div className="flex flex-col border border-card-border rounded-sm bg-card-surface overflow-hidden">
        {CITIES.map((city, index) => {
          const isSelected = selectedCity?.name === city.name;
          const isLast = index === CITIES.length - 1;

          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={`w-full flex flex-col text-left py-2 px-3 transition-colors duration-150 ${
                isSelected
                  ? 'border-l-2 border-l-brand bg-canvas-base'
                  : 'border-l-2 border-l-transparent hover:bg-canvas-base hover:border-l-card-border'
              } ${!isLast ? 'border-b border-card-border' : ''}`}
            >
              <span
                className={`text-[13px] font-medium font-sans ${
                  isSelected ? 'text-text-heading' : 'text-text-muted'
                }`}
              >
                {city.name}
              </span>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[10px] font-mono text-text-faint">
                  {city.lat.toFixed(2)}°N, {Math.abs(city.lon).toFixed(2)}°W
                </span>
                <span className="text-[10px] font-mono text-text-muted font-medium">
                  {t('hub.peakSunHours', { value: city.psh.toFixed(1) })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}