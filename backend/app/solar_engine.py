"""
MaroSun C&I Evaluator - Solar Calculation Engine
Processes timeseries data to evaluate system performance, grid interaction restrictions, 
financial yields, and carbon offsets within the Moroccan regulatory ecosystem.
"""

from typing import Dict, Any

def calculate_solar_metrics(
    ghi_daily: Dict[str, float], 
    p_kwp: float, 
    alpha_self: float
) -> Dict[str, Any]:
    """
    Performs comprehensive tech-economic solar appraisals on a daily GHI timeseries dataset.
    
    Formulas Applied:
    - PSH = daily GHI value (kWh/m²/day)
    - E_AC = P_kWp * PSH_annual * 0.78 (Performance Ratio)
    - Law 82-21 Grid Injection Cap = 20% of annual generation
    """
    # 1. Calculate Peak Sun Hours (PSH)
    # Filter out NASA POWER null values (-999 or negative flags if any)
    valid_ghi = [val for val in ghi_daily.values() if val >= 0]
    annual_psh = sum(valid_ghi)
    
    # 2. Annual AC Energy Yield (kWh/year)
    performance_ratio = 0.78
    e_ac = p_kwp * annual_psh * performance_ratio
    
    # 3. Allocation Splits (Self-consumed vs Surplus)
    e_self_raw = alpha_self * e_ac
    e_surplus_raw = (1.0 - alpha_self) * e_ac
    
    # 4. Law 82-21 Surplus Cap (Strict 20% limit of total production)
    surplus_cap_limit = 0.20 * e_ac
    e_surplus_allowed = min(e_surplus_raw, surplus_cap_limit)
    e_surplus_lost = e_surplus_raw - e_surplus_allowed
    
    # Net energy effectively utilized by the customer or the grid mix
    e_utilized = e_self_raw + e_surplus_allowed
    
    # 5. Financial Returns (MAD)
    tariff_self_consumption = 1.10  # MAD/kWh saved
    tariff_injection = 0.195       # MAD/kWh average credit
    
    annual_savings_self_mad = e_self_raw * tariff_self_consumption
    annual_revenue_surplus_mad = e_surplus_allowed * tariff_injection
    total_annual_benefit_mad = annual_savings_self_mad + annual_revenue_surplus_mad
    
    # 6. Environmental Assessment (Tons of CO2 avoided/year)
    # Base calculation on effective green energy utilized (excluding curtailed surplus)
    co2_factor_kg_kwh = 0.604
    avoided_co2_tons = (e_utilized * co2_factor_kg_kwh) / 1000.0
    
    return {
        "summary": {
            "system_size_kwp": p_kwp,
            "self_consumption_ratio_alpha": alpha_self,
            "annual_psh_hours": round(annual_psh, 2),
            "total_generated_kwh": round(e_ac, 2),
            "effectively_utilized_kwh": round(e_utilized, 2)
        },
        "splits": {
            "self_consumed_kwh": round(e_self_raw, 2),
            "surplus_generated_kwh": round(e_surplus_raw, 2),
            "surplus_allowed_grid_kwh": round(e_surplus_allowed, 2),
            "surplus_lost_curtailed_kwh": round(e_surplus_lost, 2)
        },
        "financials": {
            "self_consumption_savings_mad": round(annual_savings_self_mad, 2),
            "surplus_injection_revenue_mad": round(annual_revenue_surplus_mad, 2),
            "total_annual_benefit_mad": round(total_annual_benefit_mad, 2)
        },
        "environmental": {
            "avoided_co2_tons_per_year": round(avoided_co2_tons, 3)
        }
    }