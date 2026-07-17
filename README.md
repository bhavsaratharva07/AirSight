# 🌬️ AirSight — Hyperlocal Air Quality Intelligence for Delhi

> **ET AI Hackathon 2026 · Problem Statement #5 — AI-Powered Urban Air Quality Intelligence for Smart City Intervention**

AirSight turns raw air-quality readings into **action**. It fuses live monitoring-station data, computes the official **CPCB AQI**, forecasts air quality for the days ahead, attributes pollution to likely sources, and generates **health advisories and enforcement recommendations** — moving cities from *reactive monitoring* to *proactive intervention*.

---

## 🎯 The problem
- India has **900+ air-quality monitoring stations**, but a 2024 CAG audit found only **31% of cities** had any actionable multi-agency response linked to that data.
- Air pollution causes an estimated **1.67 million premature deaths/year** in India (Lancet Planetary Health).
- **The data exists. The intelligence layer to act on it does not.** AirSight is that layer.

## ✨ Features
| Feature | What it does |
|---|---|
| 🗺️ **Live AQI Map** | Real-time readings from 40+ Delhi monitoring stations, color-coded by CPCB AQI bands |
| 📈 **AQI Forecast** | Multi-day air-quality forecast with a confidence band (hero feature) |
| 🥧 **Source Attribution** | Estimated contribution by source (vehicular, dust, industrial, biomass, power) |
| 🚨 **Health Advisory** | Adaptive alerts for the public, vulnerable zones (schools/hospitals), and outdoor workers |
| 🎯 **Enforcement Recommendation** | Prioritises where authorities should act, based on the worst live zones |
| 📋 **Ward-Level Table** | Sortable station-by-station readings |

## 🖥️ Live Dashboard
The dashboard is a **self-contained web app** — no installation needed.
👉 Open `dashboard/index.html` in any browser.

It shows the active **data source** next to the "Updated" timestamp so you always know it's live.

## 🧠 Machine Learning Forecast Model
`model/forecast_model.py` trains a real forecasting model on historical air-quality data and reports accuracy vs a baseline.
- Pulls **~3 months of historical hourly data** from the free Open-Meteo Air Quality API.
- Computes CPCB AQI, engineers time-series features (lags, rolling means, hour, day-of-week).
- Trains a **Random Forest** to predict AQI 24 hours ahead.
- Reports **MAE / RMSE vs a persistence baseline** and saves a forecast plot.

```bash
cd model
pip install -r requirements.txt
python forecast_model.py
```

## 🔌 Data sources (all free)
| Source | Use |
|---|---|
| **WAQI / aqicn.org** | Official CPCB monitoring-station AQI + forecast (primary) |
| **Open-Meteo Air Quality API** | Pollutant concentrations, historical data for ML, automatic fallback (no key) |

## 🏗️ Architecture
```
 Data Sources                 Intelligence Layer                 Delivery
 ┌───────────────┐            ┌─────────────────────┐            ┌──────────────────┐
 │ WAQI / CPCB   │──┐         │  AQI computation     │        ┌──▶│ Live map + cards │
 │ stations      │  │         │  (CPCB sub-index)    │        │   ├──────────────────┤
 ├───────────────┤  ├────────▶│  Forecast model (ML) │───────▶├──▶│ Forecast chart   │
 │ Open-Meteo    │  │         │  Source attribution  │        │   ├──────────────────┤
 │ (PM2.5/PM10)  │──┘         │  Health advisory     │        └──▶│ Advisory + action│
 └───────────────┘            └─────────────────────┘            └──────────────────┘
```

## 📁 Repository structure
```
airsight/
├── dashboard/          # The live web app (open index.html)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── model/              # Python ML forecasting
│   ├── forecast_model.py
│   └── requirements.txt
├── docs/               # Architecture & notes
└── README.md
```

## 👥 Team
- **Data** — data ingestion & cleaning
- **ML** — forecasting model & evaluation
- **Dashboard** — UI & maps
- **Impact & Deck** — advisory logic, presentation, demo

## 🛣️ Roadmap (future scope)
- Satellite-based source attribution (Sentinel-5P)
- 1 km grid-level forecasts with atmospheric dispersion modelling
- Multi-city comparison & multi-language citizen advisories (IVR / WhatsApp)
- Automated enforcement workflow integration

## 📝 Note on the API token
The dashboard includes a free, read-only WAQI token for convenience so it works out of the box. You may replace it with your own from https://aqicn.org/data-platform/token/

---
_Built for the ET AI Hackathon 2026._
