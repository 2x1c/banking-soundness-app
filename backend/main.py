from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Banking Soundness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv("rgec_sample_multi_bank_quarters.csv")

def to_float(val):
    try:
        return float(val)
    except:
        return None

def compute_score(row):
    car = to_float(row.get("car_pct", 0))
    npl = to_float(row.get("npl_gross_pct", 0))
    roa = to_float(row.get("roa_pct", 0))
    ldr = to_float(row.get("ldr_pct", 0))
    bopo = to_float(row.get("bopo_pct", 0))
    score = (car*0.3 + (10-npl)*0.25 + roa*0.2 + max(0, 15 - abs(ldr-85)/85*15) + max(0, 15 - (bopo/100)*15))
    return round(min(score, 100), 2)

@app.get("/api/trend")
def get_trend(bank: str, limit: int = 8):
    df_bank = df[df["bank_name"].str.lower() == bank.lower()]
    if df_bank.empty:
        raise HTTPException(status_code=404, detail="Bank not found")
    df_sorted = df_bank.sort_values("period").tail(limit)
    trend = [{
        "period": row["period"],
        "CAR": row["car_pct"],
        "NPL": row["npl_gross_pct"],
        "ROA": row["roa_pct"],
        "LDR": row["ldr_pct"],
        "BOPO": row["bopo_pct"],
        "NIM": row["nim_pct"],
        "score": compute_score(row)
    } for _, row in df_sorted.iterrows()]
    return {"bank": bank, "trend": trend}

@app.get("/api/comparison")
def get_comparison():
    latest = df.sort_values("period").groupby("bank_name").tail(1)
    data = [{
        "bank": row["bank_name"],
        "CAR": row["car_pct"],
        "NPL": row["npl_gross_pct"],
        "ROA": row["roa_pct"],
        "LDR": row["ldr_pct"],
        "BOPO": row["bopo_pct"],
        "NIM": row["nim_pct"],
        "score": compute_score(row),
        "period": row["period"]
    } for _, row in latest.iterrows()]
    return {"period": latest.iloc[0]["period"], "data": data}

@app.get("/api/score")
def get_score(bank: str):
    df_bank = df[df["bank_name"].str.lower() == bank.lower()]
    if df_bank.empty:
        raise HTTPException(status_code=404, detail="Bank not found")
    row = df_bank.sort_values("period").iloc[-1]
    score = compute_score(row)
    zone = "Sehat" if score >= 75 else "Waspada" if score >= 60 else "Kritis"
    return {"bank": bank, "period": row["period"], "score": score, "zone": zone}
