import { useState, useCallback } from 'react';
import { AppContext } from './AppContext';

export function AppProvider({ children }) {
  const [appPhase, setAppPhase] = useState('onboarding');
  
  const [onboardingData, setOnboardingData] = useState({
    city: { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
    profile: '',
    monthlyBillMAD: 0,
    estimatedKwp: 100,
  });
  
  const [dashboardParams, setDashboardParams] = useState({
    pKwp: 100,
    alphaSelf: 75,
    useDynamicThermal: false,
    activeProfile: '',
  });
  
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchSolarData = async (city, pKwp, alphaSelf, useDynamicThermal = false, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch("http://localhost:8000/api/solar-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.name,
          lat: city.lat,
          lon: city.lon,
          system_size_kwp: pKwp,
          self_consumption_ratio: alphaSelf / 100,
          use_dynamic_pr: useDynamicThermal
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Server status fault: ${response.status} Error`);
      
      const responseData = await response.json();
      setApiData(responseData);
      setApiError(null);
    } catch (err) {
      clearTimeout(timeoutId);
      setApiError(err.name === 'AbortError' ? 'Request timed out.' : (err.message || "Failed to communicate with calculation service."));
    }
  };

  const completeOnboarding = useCallback((data) => {
    setOnboardingData(data);
    setAppPhase('loading');
    setApiData(null);
    setApiError(null);
    
    const alphaMap = {
      'factory_24_7': 88,
      'office_8_18': 65,
      'hotel_seasonal': 72,
      'weekend_closed': 60,
    };
    const alphaSelfVal = alphaMap[data.profile] || 75;
    const pKwpVal = data.estimatedKwp || 100;

    setDashboardParams({
      pKwp: pKwpVal,
      alphaSelf: alphaSelfVal,
      useDynamicThermal: false,
      activeProfile: data.profile,
    });

    fetchSolarData(data.city, pKwpVal, alphaSelfVal, false, 8000);
  }, []);

  const updateDashboardParams = useCallback(async (newParams) => {
    const updatedParams = { ...dashboardParams, ...newParams };
    setDashboardParams(updatedParams);
    setIsRefetching(true);
    await fetchSolarData(onboardingData.city, updatedParams.pKwp, updatedParams.alphaSelf, updatedParams.useDynamicThermal);
    setIsRefetching(false);
  }, [dashboardParams, onboardingData.city]);

  const updateCity = useCallback(async (newCity) => {
    setOnboardingData(prev => ({ ...prev, city: newCity }));
    setIsRefetching(true);
    await fetchSolarData(newCity, dashboardParams.pKwp, dashboardParams.alphaSelf, dashboardParams.useDynamicThermal);
    setIsRefetching(false);
  }, [dashboardParams]);

  return (
    <AppContext.Provider value={{
      appPhase,
      setAppPhase,
      onboardingData,
      dashboardParams,
      apiData,
      apiError,
      isRefetching,
      completeOnboarding,
      updateDashboardParams,
      updateCity
    }}>
      {children}
    </AppContext.Provider>
  );
}