from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

# Import your analytical calculation engine module
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

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(nasa_url, params=query_params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=f"NASA error: {exc.response.text}")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="NASA POWER service unreachable.")

    nasa_data = response.json()
    
    try:
        timeseries_data = nasa_data["properties"]["parameter"]
        ghi_daily = timeseries_data.get("ALLSKY_SFC_SW_DWN", {})
        dni_daily = timeseries_data.get("ALLSKY_SFC_SW_DNI", {})
        
        # Execute technical evaluations against current Moroccan regulatory landscape
        calculated_results = calculate_solar_metrics(
            ghi_daily=ghi_daily,
            p_kwp=payload.system_size_kwp,
            alpha_self=payload.self_consumption_ratio
        )
        
        # Return composite object containing raw data vectors and calculated aggregates
        return {
            "metadata": {
                "city": payload.city,
                "latitude": payload.lat,
                "longitude": payload.lon
            },
            "metrics": calculated_results,
            "raw_data_hourly_or_daily": {
                "unit": "kWh/m²/day",
                "ghi_daily": ghi_daily,
                "dni_daily": dni_daily
            }
        }
        
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unexpected JSON dictionary payload map structural match from data provider."
        )