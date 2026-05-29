from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from calendar import monthrange # Ajout de l'import

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
    system_size_kwp: float = Field(100.0, gt=0, description="Target C&I plant design capacity in kWp")
    self_consumption_ratio: float = Field(0.75, ge=0.60, le=0.95, description="Expected operational alpha factor")

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "marosun-backend"}

@app.post("/api/solar-data", status_code=status.HTTP_200_OK)
async def get_solar_data(payload: SolarDataRequest):
    nasa_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
    query_params = {
        "parameters": "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI",
        "community": "RE",
        "longitude": payload.lon,
        "latitude": payload.lat,
        "start": "20250101",
        "end": "20251231",
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

    if is_simulated:
        # Génération d'une courbe GHI annuelle physiquement crédible pour le Maroc
        # [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
        monthly_ghi_averages = [3.2, 4.1, 5.5, 6.4, 7.2, 7.8, 7.5, 6.9, 5.8, 4.4, 3.5, 2.9]
        
        for month in range(1, 13):
            days_in_month = monthrange(2025, month)[1]
            for day in range(1, days_in_month + 1):
                date_str = f"2025{month:02d}{day:02d}"
                # Application de la moyenne mensuelle au jour
                ghi_daily[date_str] = monthly_ghi_averages[month - 1]
                dni_daily[date_str] = monthly_ghi_averages[month - 1] * 0.8
    else:
        try:
            timeseries_data = nasa_data["properties"]["parameter"]
            ghi_daily = timeseries_data.get("ALLSKY_SFC_SW_DWN", {})
            dni_daily = timeseries_data.get("ALLSKY_SFC_SW_DNI", {})
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unexpected JSON dictionary payload map structural match from data provider."
            )

    # Calculs via le moteur technique
    calculated_results = calculate_solar_metrics(
        ghi_daily=ghi_daily,
        p_kwp=payload.system_size_kwp,
        alpha_self=payload.self_consumption_ratio
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
            "dni_daily": dni_daily
        }
    }