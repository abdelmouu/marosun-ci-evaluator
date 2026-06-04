import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { TARIFF_SELF_CONSUMPTION, DEFAULT_PR } from '../config/constants';

const CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { name: 'Tangier', lat: 35.7595, lon: -5.8340 },
  { name: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { name: 'Fes', lat: 34.0331, lon: -5.0003 },
  { name: 'Oujda', lat: 34.6867, lon: -1.9114 },
  { name: 'Kenitra', lat: 34.2599, lon: -6.5802 },
  { name: 'Safi', lat: 32.2994, lon: -9.2372 },
  { name: 'Laayoune', lat: 27.1418, lon: -13.1879 }
];

const PROFILES = [
  {
    id: 'factory_24_7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4F7CAC]">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      </svg>
    )
  },
  {
    id: 'office_8_18',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4F7CAC]">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
      </svg>
    )
  },
  {
    id: 'hotel_seasonal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4F7CAC]">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
    )
  },
  {
    id: 'weekend_closed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#4F7CAC]">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  }
];

export default function OnboardingWizard() {
  const { completeOnboarding } = useAppContext();
  const { t, i18n } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = CITIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Bill-to-Size Logic
  const billValue = parseFloat(monthlyBill);
  const isBillValid = !isNaN(billValue) && billValue > 0;
  const estimatedMonthlyKwh = isBillValid ? billValue / TARIFF_SELF_CONSUMPTION : 0;
  const estimatedKwp = isBillValid ? estimatedMonthlyKwh / (30 * 5.2 * DEFAULT_PR) : 0;

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
    setStep(2);
  };

  const handleNext = () => {
    if (step === 2 && selectedCity) setStep(3);
    else if (step === 3 && selectedProfile) setStep(4);
    else if (step === 4 && isBillValid) {
      completeOnboarding({
        city: selectedCity,
        profile: selectedProfile,
        monthlyBillMAD: billValue,
        estimatedKwp: Math.round(estimatedKwp)
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = 
    (step === 2 && !selectedCity) || 
    (step === 3 && !selectedProfile) || 
    (step === 4 && !isBillValid);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-[640px] bg-card-surface border border-card-border rounded-sm p-8 flex flex-col">
        
        {/* Progress Bar (Now 4 Steps) */}
        <div className="flex items-center justify-center mb-8 relative">
          <div className="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-card-border -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex-1 flex justify-center z-10">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-mono font-medium transition-colors duration-150 ${
                step >= num
                  ? 'bg-brand text-white'
                  : 'bg-canvas-base text-text-muted border border-card-border'
              }`}>
                {num}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-text-heading mb-1 text-center">{t('onboarding.step1_title', 'Select Language / Choisissez votre langue')}</h2>
            <p className="text-sm text-text-muted mb-8 text-center">{t('onboarding.step1_subtitle', 'Technical Solar Valuation Framework')}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => handleLanguageSelect('en')} 
                className="p-8 rounded-sm border border-card-border bg-canvas-base hover:border-brand hover:bg-card-surface transition-colors flex items-center justify-center"
              >
                <span className="font-sans font-semibold text-text-heading tracking-wide">English</span>
              </button>
              <button 
                onClick={() => handleLanguageSelect('fr')} 
                className="p-8 rounded-sm border border-card-border bg-canvas-base hover:border-brand hover:bg-card-surface transition-colors flex items-center justify-center"
              >
                <span className="font-sans font-semibold text-text-heading tracking-wide">Français</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-text-heading mb-1">{t('onboarding.hub_title', 'Sélectionnez votre hub industriel')}</h2>
            <p className="text-sm text-text-muted mb-6">{t('onboarding.hub_desc', 'Données météo NASA POWER adaptées à votre région.')}</p>
            
            <div className="relative" ref={dropdownRef}>
              <div 
                className="w-full bg-white/60 border border-[rgba(210,222,240,0.90)] rounded-xl px-4 py-3 text-text-body cursor-pointer flex justify-between items-center transition-all duration-150 hover:border-brand/40"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedCity ? selectedCity.name : t('onboarding.choose_city', 'Choisir une ville...')}</span>
                <svg className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-[rgba(210,222,240,0.90)] rounded-xl shadow-lg z-20 overflow-hidden flex flex-col max-h-60">
                  <input 
                    type="text" 
                    placeholder={t('onboarding.search', 'Rechercher...')}
                    className="w-full px-4 py-3 border-b border-[rgba(210,222,240,0.50)] bg-transparent outline-none text-sm text-text-body placeholder:text-text-faint focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="overflow-y-auto custom-scrollbar">
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        className="w-full text-left px-4 py-3 hover:bg-brand/10 transition-colors flex justify-between items-center group"
                        onClick={() => {
                          setSelectedCity(city);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <span className="text-sm font-medium text-text-body group-hover:text-brand transition-colors">{city.name}</span>
                        <span className="text-xs text-text-faint tabular-nums">{city.lat.toFixed(4)}°N, {city.lon.toFixed(4)}°W</span>
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="px-4 py-3 text-sm text-text-muted text-center">{t('onboarding.no_results', 'Aucun résultat')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 3 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-text-heading mb-6">{t('onboarding.profile_title', 'Quel est le rythme opérationnel ?')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {PROFILES.map((profile) => {
                const isSelected = selectedProfile === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`p-5 rounded-sm border cursor-pointer transition-colors duration-150 flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-canvas-base border-brand'
                        : 'bg-card-surface border-card-border hover:bg-canvas-base hover:border-text-muted'
                    }`}
                  >
                    {profile.icon}
                    <div>
                      <h3 className={`text-sm mb-1 ${isSelected ? 'text-brand font-semibold' : 'text-text-heading font-medium'}`}>
                        {t(`onboarding.profiles.${profile.id}.title`, profile.id)}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {t(`onboarding.profiles.${profile.id}.desc`, '')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Bill-to-Size */}
        {step === 4 && (
          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-text-heading mb-1">{t('onboarding.bill_title', 'Dimensionnement par facture')}</h2>
            <p className="text-sm text-text-muted mb-6">{t('onboarding.bill_desc', 'Nous estimons la puissance cible à partir de votre consommation ONEE.')}</p>
            
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-semibold text-text-muted mb-2 uppercase tracking-[0.15em]">
                  {t('onboarding.monthly_bill_label', 'Facture mensuelle moyenne (MAD)')}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 25000"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(e.target.value)}
                  className="w-full bg-canvas-base border border-card-border rounded-sm px-4 py-3 text-text-body focus:ring-2 focus:ring-brand/30 outline-none transition-all placeholder:text-text-faint font-mono tabular-nums"
                />
              </div>

              <div className="bg-canvas-base border border-card-border rounded-sm p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-body font-medium">{t('onboarding.est_consumption', 'Consommation estimée :')}</span>
                  <span className="font-mono text-sm text-brand font-bold tabular-nums">
                    {isBillValid ? estimatedMonthlyKwh.toLocaleString(i18n.language === 'fr' ? 'fr-MA' : 'en-US', { maximumFractionDigits: 0 }) : '0'} <span className="text-xs text-text-muted font-normal">kWh/{t('onboarding.month_short', 'mois')}</span>
                  </span>
                </div>
                <div className="border-t border-card-border"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-body font-medium">{t('onboarding.est_kwp', 'Puissance cible suggérée :')}</span>
                  <span className="font-mono text-lg text-brand font-bold tabular-nums">
                    {isBillValid ? Math.round(estimatedKwp) : '0'} <span className="text-xs text-text-muted font-normal">kWp</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation (Hidden on Step 1) */}
        {step > 1 && (
          <div className="mt-8 pt-6 border-t border-card-border flex justify-between items-center">
            <button
              onClick={handleBack}
              className={`text-sm font-medium transition-colors duration-150 ${step > 1 ? 'text-text-muted hover:text-text-body' : 'text-transparent pointer-events-none'}`}
            >
              {t('onboarding.back', 'Retour')}
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`px-6 py-2.5 rounded-sm text-sm font-semibold transition-colors duration-150 ${
                isNextDisabled
                  ? 'bg-text-faint text-white/70 opacity-50 cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand-dim'
              }`}
            >
              {step === 4 ? t('onboarding.generate', "Générer l'audit") : t('onboarding.continue', 'Continuer')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}