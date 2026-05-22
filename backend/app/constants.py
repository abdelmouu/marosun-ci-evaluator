"""
MaroSun C&I Evaluator - Global Constants
This module contains verified Moroccan solar regulatory tariffs, environmental 
factors, engineering baselines, and industrial geographic data.
"""

# =====================================================================
# 1. REGULATORY & TARIFF CONSTANTS (ANRE & Law 82-21)
# =====================================================================

# Self-consumption baseline tariff for Commercial & Industrial (C&I) clients
# Source: ANRE (Agence Nationale de Régulation de l'Électricité) updates on grid parity
ANRE_SELF_CONSUMPTION_TARIFF_MAD_KWH = 1.10

# Average net-metering injection credit for surplus fed back into the grid
# Source: ANRE reference tariffs for medium/high voltage injection
ANRE_INJECTION_CREDIT_AVG_MAD_KWH = 0.195
ANRE_INJECTION_CREDIT_PEAK_MAD_KWH = 0.21
ANRE_INJECTION_CREDIT_OFF_PEAK_MAD_KWH = 0.18

# Maximum allowable surplus energy that can be injected into the grid 
# Source: Law 82-21 (Loi n° 82-21 relative à l'autoproduction d'énergie électrique), Article 17
# Autoproducers can feed up to 20% of their annual production into the national grid.
LAW_82_21_SURPLUS_INJECTION_CAP = 0.20


# =====================================================================
# 2. TECHNICAL & ENVIRONMENTAL PERFORMANCE FACTORS
# =====================================================================

# Standard Performance Ratio (PR) baseline for commercial-scale grid-tied PV systems
# Accounts for inverter losses, temperature degradation, wiring, and soiling
PV_SYSTEM_DEFAULT_PR = 0.78

# Grid Emission Factor for Morocco (kg CO2 per kWh generated)
# Source: ONEE / International Energy Agency (IEA) Moroccan Grid Mix Report
# Used for calculating environmental offsets and carbon footprint reductions
MOROCCAN_GRID_CO2_FACTOR_KG_KWH = 0.604


# =====================================================================
# 3. GEOGRAPHIC INDUSTRIAL HUBS (Approximate Coordinates)
# =====================================================================

# Approximate latitude and longitude coordinates for major industrial zones
# Used as fallback coordinates for solar radiation data fetching (e.g., PVGIS API)
MOROCCAN_INDUSTRIAL_CITIES = {
    "Casablanca": {
        "latitude": 33.5731,
        "longitude": -7.5898,
        "description": "Ain Sebaa, Bouskoura, and Tit Mellil industrial zones"
    },
    "Rabat": {
        "latitude": 34.0209,
        "longitude": -6.8416,
        "description": "Rabat-Salé-Kénitra industrial axis / Atlantic Free Zone"
    },
    "Tangier": {
        "latitude": 35.7595,
        "longitude": -5.8340,
        "description": "Tangier Automotive City and Tanger Med Zones"
    },
    "Agadir": {
        "latitude": 30.4278,
        "longitude": -9.5981,
        "description": "Haliopolis and Anza industrial areas"
    },
    "Marrakech": {
        "latitude": 31.6295,
        "longitude": -7.9811,
        "description": "Sidi Ghanem industrial quarter"
    },
    "Fes": {
        "latitude": 34.0331,
        "longitude": -5.0003,
        "description": "Binsouda and Fes Shore industrial zones"
    }
}