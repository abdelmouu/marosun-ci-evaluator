from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from calendar import monthrange
from datetime import datetime
from typing import Dict, Optional

from app.solar_engine import calculate_solar_metrics

app = FastAPI(title="MaroSun C&I Evaluator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SolarDataRequest(BaseModel):
    city: str = Field(..., example="Casablanca")
    lat: float = Field(..., ge=-90, le=90, example=33.57)
    lon: float = Field(..., ge=-180, le=180, example=-7.59)
    system_size_kwp: float = Field(100.0, gt=0, description="Target C&I plant capacity in kWp")
    self_consumption_ratio: float = Field(0.75, ge=0.60, le=0.95, description="Expected operational alpha factor")
    use_dynamic_pr: bool = Field(False, description="Enable NOCT dynamic thermal modeling")

class MetadataModel(BaseModel):
    city: str
    latitude: float
    longitude: float

class SummaryModel(BaseModel):
    system_size_kwp: float
    self_consumption_ratio_alpha: float
    annual_psh_hours: float
    total_generated_kwh: float
    effectively_utilized_kwh: float

class SplitsModel(BaseModel):
    self_consumed_kwh: float
    surplus_generated_kwh: float
    surplus_allowed_grid_kwh: float
    surplus_lost_curtailed_kwh: float

class FinancialsModel(BaseModel):
    self_consumption_savings_mad: float
    surplus_injection_revenue_mad: float
    total_annual_benefit_mad: float

class EnvironmentalModel(BaseModel):
    avoided_co2_tons_per_year: float

class ThermalModelModel(BaseModel):
    pr_used_avg: float
    avg_cell_temp_c: float

class MetricsModel(BaseModel):
    summary: SummaryModel
    splits: SplitsModel
    financials: FinancialsModel
    environmental: EnvironmentalModel
    thermal_model: Optional[ThermalModelModel] = None

class RawDataModel(BaseModel):
    unit: str
    ghi_daily: Dict[str, float]
    dni_daily: Dict[str, float]
    t2m_daily: Dict[str, float]

class SolarDataResponse(BaseModel):
    metadata: MetadataModel
    data_source: str
    metrics: MetricsModel
    raw_data_hourly_or_daily: RawDataModel

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "marosun-backend"}

@app.post("/api/solar-data", status_code=status.HTTP_200_OK, response_model=SolarDataResponse)
async def get_solar_data(payload: SolarDataRequest):
    nasa_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
    # Dynamic calculation of previous full calendar year
    prev_year = datetime.now().year - 1
    start_date = f"{prev_year}0101"
    end_date = f"{prev_year}1231"

    query_params = {
        "parameters": "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,T2M",
        "community": "RE",
        "longitude": payload.lon,
        "latitude": payload.lat,
        "start": start_date,
        "end": end_date,
        "format": "JSON"
    }

    is_simulated = False
    nasa_data = None

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(nasa_url, params=query_params)
            response.raise_for_status()
            nasa_data = response.json()
        except Exception:
            # Intercepte Timeouts, 404, 5xx, ou erreurs de connexion
            is_simulated = True

    ghi_daily = {}
    dni_daily = {}
    t2m_daily = {}

    if is_simulated:
        # Génération d'une courbe GHI annuelle physiquement crédible pour le Maroc
        # [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
        monthly_ghi_averages = [3.2, 4.1, 5.5, 6.4, 7.2, 7.8, 7.5, 6.9, 5.8, 4.4, 3.5, 2.9]
        monthly_t2m_averages = [12.0, 13.5, 15.0, 17.5, 20.0, 23.5, 26.0, 26.5, 24.0, 21.0, 16.5, 13.0]

        for month in range(1, 13):
            days_in_month = monthrange(prev_year, month)[1]
            for day in range(1, days_in_month + 1):
                date_str = f"{prev_year}{month:02d}{day:02d}"
                ghi_daily[date_str] = monthly_ghi_averages[month - 1]
                dni_daily[date_str] = monthly_ghi_averages[month - 1] * 0.8
                t2m_daily[date_str] = monthly_t2m_averages[month - 1]
    else:
        try:
            timeseries_data = nasa_data["properties"]["parameter"]
            ghi_daily = timeseries_data.get("ALLSKY_SFC_SW_DWN", {})
            dni_daily = timeseries_data.get("ALLSKY_SFC_SW_DNI", {})
            t2m_daily = timeseries_data.get("T2M", {})
        except KeyError:
            raise HTTPException(status_code=502, detail="Unexpected JSON match.")

    # Calculs via le moteur technique
    calculated_results = calculate_solar_metrics(
        ghi_daily=ghi_daily,
        t2m_daily=t2m_daily,
        p_kwp=payload.system_size_kwp,
        alpha_self=payload.self_consumption_ratio,
        use_dynamic_pr=payload.use_dynamic_pr
    )

    return {
        "metadata": {
            "city": payload.city,
            "latitude": payload.lat,
            "longitude": payload.lon
        },
        "data_source": "simulated" if is_simulated else "live",
        "metrics": calculated_results,
        "raw_data_hourly_or_daily": {
            "unit": "kWh/m²/day",
            "ghi_daily": ghi_daily,
            "dni_daily": dni_daily,
            "t2m_daily": t2m_daily
        }
    }