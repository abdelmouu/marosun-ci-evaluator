"""
MaroSun C&I Evaluator - Solar Calculation Engine
Processes timeseries data to evaluate system performance, grid interaction restrictions, 
financial yields, and carbon offsets within the Moroccan regulatory ecosystem.
"""
from typing import Dict, Any
from app.constants import (
    ANRE_SELF_CONSUMPTION_TARIFF_MAD_KWH,
    ANRE_INJECTION_CREDIT_AVG_MAD_KWH,
    MOROCCAN_GRID_CO2_FACTOR_KG_KWH,
    LAW_82_21_SURPLUS_INJECTION_CAP
)

def calculate_dynamic_pr(ghi_val: float, t2m_val: float, noct: float = 45.0, gamma: float = -0.004, pr_base: float = 0.82):
    """Calcule le PR dynamique basé sur la T2M et l'irradiance (Loi thermique NOCT simplifiée)"""
    if ghi_val <= 0:
        return pr_base, t2m_val
    # Approx irradiance moyenne W/m² (hypothèse : ~10h d'ensoleillement effectif/jour)
    avg_irradiance_w_m2 = (ghi_val * 1000) / 10.0
    t_cell = t2m_val + (noct - 20) * (avg_irradiance_w_m2 / 800.0)
    temp_loss_factor = 1 + gamma * (t_cell - 25)
    return pr_base * temp_loss_factor, t_cell

def calculate_solar_metrics(
    ghi_daily: Dict[str, float], 
    t2m_daily: Dict[str, float],
    p_kwp: float, 
    alpha_self: float,
    use_dynamic_pr: bool = False
) -> Dict[str, Any]:
    
    valid_ghi = []
    e_ac = 0.0
    total_t_cell = 0.0
    total_pr = 0.0
    valid_days = 0

    # 1 & 2. Calculate PSH and Annual Yield applying thermal mechanics day by day
    for date_str, ghi in ghi_daily.items():
        if ghi < 0: continue
        
        t2m = t2m_daily.get(date_str, 20.0)
        if t2m < -50: t2m = 20.0 # Clean NASA fill values
        
        if use_dynamic_pr:
            pr_dyn, t_cell = calculate_dynamic_pr(ghi, t2m)
        else:
            pr_dyn, t_cell = 0.78, t2m
            
        e_ac += p_kwp * ghi * pr_dyn
        
        valid_ghi.append(ghi)
        total_t_cell += t_cell
        total_pr += pr_dyn
        valid_days += 1

    annual_psh = sum(valid_ghi)
    avg_cell_temp = total_t_cell / valid_days if valid_days else 0
    avg_pr = total_pr / valid_days if valid_days else 0.78
    
    # 3. Allocation Splits
    e_self_raw = alpha_self * e_ac
    e_surplus_raw = (1.0 - alpha_self) * e_ac
    
    # 4. Law 82-21 Surplus Cap
    surplus_cap_limit = LAW_82_21_SURPLUS_INJECTION_CAP * e_ac
    e_surplus_allowed = min(e_surplus_raw, surplus_cap_limit)
    e_surplus_lost = e_surplus_raw - e_surplus_allowed
    e_utilized = e_self_raw + e_surplus_allowed
    
    # 5. Financial Returns
    annual_savings_self_mad = e_self_raw * ANRE_SELF_CONSUMPTION_TARIFF_MAD_KWH
    annual_revenue_surplus_mad = e_surplus_allowed * ANRE_INJECTION_CREDIT_AVG_MAD_KWH
    total_annual_benefit_mad = annual_savings_self_mad + annual_revenue_surplus_mad
    
    # 6. Environmental Assessment
    avoided_co2_tons = (e_utilized * MOROCCAN_GRID_CO2_FACTOR_KG_KWH) / 1000.0
    
    result = {
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
    
    if use_dynamic_pr:
        result["thermal_model"] = {
            "pr_used_avg": round(avg_pr, 3),
            "avg_cell_temp_c": round(avg_cell_temp, 1)
        }
        
    return result
