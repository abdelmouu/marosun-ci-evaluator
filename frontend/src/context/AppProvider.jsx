import { useState, useCallback, useMemo } from 'react';
import { AppContext } from './AppContext';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PR, TARIFF_SELF_CONSUMPTION, TARIFF_INJECTION } from '../config/constants';

export function AppProvider({ children }) {
  const { t, i18n } = useTranslation();
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

  const fetchSolarData = useCallback(async (city, pKwp, alphaSelf, useDynamicThermal = false, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE}/api/solar-data`, {
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
      if (!response.ok) throw new Error(t('api_errors.server_fault', { status: response.status }));
      
      const responseData = await response.json();
      setApiData(responseData);
      setApiError(null);
    } catch (err) {
      clearTimeout(timeoutId);
      setApiError(err.name === 'AbortError' ? t('api_errors.timeout') : (err.message || t('api_errors.communication')));
    }
  }, [t]);

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
  }, [fetchSolarData]);

  const updateDashboardParams = useCallback(async (newParams) => {
    setDashboardParams(prev => {
      const updatedParams = { ...prev, ...newParams };
      setIsRefetching(true);
      fetchSolarData(
        onboardingData.city,
        updatedParams.pKwp,
        updatedParams.alphaSelf,
        updatedParams.useDynamicThermal
      ).then(() => setIsRefetching(false));
      return updatedParams;
    });
  }, [onboardingData.city, fetchSolarData]);

  const updateCity = useCallback(async (newCity) => {
    setOnboardingData(prev => ({ ...prev, city: newCity }));
    setIsRefetching(true);
    await fetchSolarData(
      newCity,
      dashboardParams.pKwp,
      dashboardParams.alphaSelf,
      dashboardParams.useDynamicThermal
    );
    setIsRefetching(false);
  }, [dashboardParams.pKwp, dashboardParams.alphaSelf, dashboardParams.useDynamicThermal, fetchSolarData]);

  const monthlyCalculations = useMemo(() => {
    if (!apiData || !apiData.raw_data_hourly_or_daily) return [];

    const ghiDaily = apiData?.raw_data_hourly_or_daily?.ghi_daily || {};
    const keys = Object.keys(ghiDaily);
    const monthLabels = Array.from({ length: 12 }, (_, i) =>
      new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(2000, i, 1))
    );
    
    const baseGrid = Array.from({ length: 12 }, (_, i) => ({
      name: monthLabels[i], ghiSum: 0, prSum: 0, yieldSum: 0, dayCount: 0
    }));

    const prDaily = apiData?.raw_data_hourly_or_daily?.pr_daily || {};
    const pKwp = dashboardParams.pKwp;
    const alphaSelf = dashboardParams.alphaSelf;

    if (keys.length === 0) return [];

    keys.forEach((dateStr) => {
      const ghi = ghiDaily[dateStr];
      const pr = prDaily[dateStr] || DEFAULT_PR;
      if (ghi >= 0) {
        const monthIdx = parseInt(dateStr.substring(4, 6), 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          baseGrid[monthIdx].ghiSum += ghi;
          baseGrid[monthIdx].prSum += pr;
          baseGrid[monthIdx].yieldSum += (pKwp * ghi * pr);
          baseGrid[monthIdx].dayCount += 1;
        }
      }
    });

    let cumulativeFinancialRunningSum = 0;

    return baseGrid.map((m) => {
      const avgDailyGhi = m.dayCount > 0 ? m.ghiSum / m.dayCount : 0;
      const avgPr = m.dayCount > 0 ? m.prSum / m.dayCount : DEFAULT_PR;

      const selfConsumedKwh = m.yieldSum * (alphaSelf / 100);
      const surplusRawKwh = m.yieldSum * (1 - alphaSelf / 100);
      const allowedRatio = apiData?.metrics?.splits?.surplus_generated_kwh > 0
        ? (apiData.metrics.splits.surplus_allowed_grid_kwh / apiData.metrics.splits.surplus_generated_kwh)
        : 0;
      const surplusAllowedGridKwh = surplusRawKwh * allowedRatio;

      const monthlyFinancialBenefit = (selfConsumedKwh * TARIFF_SELF_CONSUMPTION) + (surplusAllowedGridKwh * TARIFF_INJECTION);
      cumulativeFinancialRunningSum += monthlyFinancialBenefit;
      return {
        name: m.name,
        ghi: parseFloat(avgDailyGhi.toFixed(2)),
        pr: parseFloat(avgPr.toFixed(3)),
        benefit: parseFloat(cumulativeFinancialRunningSum.toFixed(0)),
      };
    });
  }, [apiData, dashboardParams.pKwp, dashboardParams.alphaSelf, i18n.language]);

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
      updateCity,
      monthlyCalculations
    }}>
      {children}
    </AppContext.Provider>
  );
}