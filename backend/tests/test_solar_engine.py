import pytest
from app.solar_engine import calculate_solar_metrics
from app.constants import LAW_82_21_SURPLUS_INJECTION_CAP

def test_baseline_yield_calculation():
    # 2 days with 5.0 GHI each = 10 PSH total
    ghi_daily = {"20250101": 5.0, "20250102": 5.0}
    t2m_daily = {"20250101": 20.0, "20250102": 20.0}
    p_kwp = 100.0
    alpha_self = 0.80 # 80%

    result = calculate_solar_metrics(ghi_daily, t2m_daily, p_kwp, alpha_self)
    
    # Expected e_ac = p_kwp * psh * pr = 100 * 10 * 0.78 = 780.0
    assert result["summary"]["total_generated_kwh"] == 780.0
    
    # Effectively utilized = 780 * 0.8 + min(780 * 0.2, 780 * 0.2) = 624 + 156 = 780.0
    assert result["summary"]["effectively_utilized_kwh"] == 780.0

def test_law_82_21_cap_enforces_exactly_20_percent():
    ghi_daily = {"20250101": 5.0, "20250102": 5.0}
    t2m_daily = {"20250101": 20.0, "20250102": 20.0}
    p_kwp = 100.0
    alpha_self = 0.50 # 50%
    
    result = calculate_solar_metrics(ghi_daily, t2m_daily, p_kwp, alpha_self)
    
    total_generated = result["summary"]["total_generated_kwh"] # 780.0
    surplus_generated = result["splits"]["surplus_generated_kwh"] # 390.0
    surplus_allowed = result["splits"]["surplus_allowed_grid_kwh"] # 156.0
    
    expected_allowed = round(total_generated * LAW_82_21_SURPLUS_INJECTION_CAP, 2)
    
    assert surplus_allowed == expected_allowed
    assert surplus_allowed < surplus_generated

def test_curtailment_loss_math_with_low_alpha():
    ghi_daily = {"20250101": 5.0, "20250102": 5.0}
    t2m_daily = {"20250101": 20.0, "20250102": 20.0}
    p_kwp = 100.0
    alpha_self = 0.0 # 0% self-consumption
    
    result = calculate_solar_metrics(ghi_daily, t2m_daily, p_kwp, alpha_self)
    
    total_generated = result["summary"]["total_generated_kwh"] # 780.0
    surplus_generated = result["splits"]["surplus_generated_kwh"] # 780.0
    surplus_allowed = result["splits"]["surplus_allowed_grid_kwh"] # 156.0
    surplus_lost = result["splits"]["surplus_lost_curtailed_kwh"] # 624.0
    
    expected_allowed = round(total_generated * LAW_82_21_SURPLUS_INJECTION_CAP, 2)
    expected_lost = round(surplus_generated - expected_allowed, 2)
    
    assert surplus_generated == total_generated
    assert surplus_allowed == expected_allowed
    assert surplus_lost == expected_lost
