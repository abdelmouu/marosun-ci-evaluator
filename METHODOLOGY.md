# MaroSun C&I Evaluator: Engineering Methodology

This document outlines the deterministic models, thermodynamic approximations, and regulatory frameworks employed by the MaroSun C&I Evaluator calculation engine. The system is designed to provide high-fidelity pre-feasibility estimates for Commercial & Industrial (C&I) solar photovoltaic installations in Morocco.

## 1. Primary Yield Mechanics (AC Generation)

The core calculation for energy production relies on the industry-standard yield equation, computed on a granular daily basis.

**Formula:**
`E_AC = P_kWp × PSH × PR`

*   **`E_AC`**: Total Alternating Current (AC) energy generated (kWh).
*   **`P_kWp`**: The installed Direct Current (DC) capacity of the solar array under Standard Test Conditions (STC).
*   **`PSH`**: Peak Sun Hours. This represents the equivalent number of hours per day when solar irradiance equals 1,000 W/m². We derive this directly from the `ALLSKY_SFC_SW_DWN` (Global Horizontal Irradiance) satellite telemetry provided by the NASA POWER API.
*   **`PR`**: Performance Ratio. A dimensionless coefficient (typically 0.78 as a baseline) representing the aggregated system losses (inverter efficiency, wiring, soiling, mismatch, and ambient thermal losses).

## 2. Dynamic Thermal Approximation (NOCT)

To increase accuracy, the engine supports a dynamic Performance Ratio (PR) adjustment based on the Nominal Operating Cell Temperature (NOCT) model, loosely aligned with IEC 61215 parameters.

When enabled, the static PR is modified daily based on the ambient 2-meter temperature (`T2M`) and irradiance.

**Cell Temperature Formula:**
`T_cell = T_ambient + (NOCT - 20) × (Irradiance / 800)`

*   **`T_ambient`**: Daily average temperature extracted from NASA POWER (`T2M`).
*   **`NOCT`**: Assumed as 45°C for standard crystalline silicon modules.
*   **`Irradiance`**: Approximated average W/m² during sunlight hours.

**Thermal Derating:**
`PR_dynamic = PR_base × [1 + γ × (T_cell - 25)]`

*   **`γ` (Gamma)**: The temperature coefficient of power (Pmax), conservatively set at `-0.4% / °C` (-0.004).

This logic ensures that yield estimates appropriately degrade during high-temperature Moroccan summer months.

## 3. Regulatory Framework: Moroccan Law 82-21 (Self-Generation)

The financial appraisal strictly enforces the constraints defined by **Law No. 82-21** relating to the self-generation of electrical energy in Morocco.

**Article 17 Constraints:**
Industrial consumers attached to the Medium Voltage (MV) or High Voltage (HV) grid are permitted to inject excess generated solar energy back into the national grid. However, the energy sold to the grid operator (ONEE/Distributors) is **strictly capped at 20% of the total annual production** of the solar plant.

**Implementation Logic:**
1.  `E_Self_Consumed = E_AC × α` (where `α` is the operational self-consumption ratio).
2.  `E_Surplus_Raw = E_AC - E_Self_Consumed`
3.  `E_Surplus_Allowed = min(E_Surplus_Raw, E_AC × 0.20)`
4.  `E_Curtailed_Lost = max(0, E_Surplus_Raw - E_AC × 0.20)`

The engine treats any surplus beyond the 20% limit as a complete curtailment loss (0 MAD value), triggering UI warnings when the threshold is approached. The allowed 20% is monetized at the average ANRE-approved injection tariff.

## 4. System Limitations & Assumptions

*   **Fixed Tilt Configuration:** Irradiance is based on Global Horizontal Irradiance (GHI). The model assumes a standard optimized fixed-tilt structure. Tracking systems are not modeled.
*   **Shading & Micro-climate:** The model aggregates localized shading and soiling into the base Performance Ratio. It does not account for specific topological or architectural shading on individual rooftops.
*   **Static Tariffs:** Financial projections assume static grid tariffs over the 25-year lifecycle. Inflation, tariff escalation, and OPEX (O&M costs) are excluded from the baseline pre-feasibility appraisal.
*   **Sector Load Profiles:** The self-consumption ratio (`α`) relies on macro-sector approximations (e.g., 24/7 Factory = 88% α). Accurate load profile matching requires a secondary engineering audit using 15-minute interval meter data.
