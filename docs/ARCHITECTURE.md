# AirSight — Architecture

## Overview
AirSight is an intelligence layer over live air-quality data. It ingests monitoring
data, computes the official CPCB AQI, forecasts near-future air quality using
machine learning + weather, attributes pollution to sources, and delivers
health advisories and enforcement recommendations.

## Data flow
```
┌────────────────────────┐     ┌─────────────────────────────┐     ┌────────────────────────┐
│      DATA SOURCES        │     │      INTELLIGENCE LAYER      │     │        DELIVERY         │
│                          │     │                              │     │                          │
│ • WAQI / CPCB stations   │────▶│ 1. AQI computation           │────▶│ • Live map (Leaflet)     │
│   (live AQI + forecast)  │     │    (CPCB sub-index formula)  │     │ • Stat cards             │
│                          │     │                              │     │                          │
│ • Open-Meteo Air Quality │────▶│ 2. ML forecast model         │────▶│ • Forecast chart         │
│   (PM2.5 / PM10, history)│     │    (Random Forest + weather) │     │   (Chart.js)             │
│                          │     │                              │     │                          │
│ • Open-Meteo Weather     │────▶│ 3. Source attribution        │────▶│ • Source doughnut        │
│   (wind, rain, BLH)      │     │                              │     │                          │
│                          │     │ 4. Health advisory engine    │────▶│ • Advisory + enforcement │
│                          │     │    (AQI band → actions)      │     │   recommendation cards   │
└────────────────────────┘     └─────────────────────────────┘     └────────────────────────┘
```

## Components
| Layer | Tech | File |
|---|---|---|
| Dashboard UI | HTML + Tailwind + Leaflet + Chart.js | `dashboard/` |
| AQI computation | CPCB sub-index formula | `dashboard/app.js`, `model/forecast_model.py` |
| Forecast ML | Python, scikit-learn Random Forest | `model/forecast_model.py` |
| Data access | WAQI + Open-Meteo REST APIs | (both) |

## Why the model beats a naive baseline
The forecast model predicts the **change** in AQI (not the absolute value) and is
fed **forecasted weather** — wind speed, precipitation, boundary-layer height,
humidity — which physically drive how pollution disperses. A persistence baseline
(assuming AQI stays the same) has none of this information, so the model achieves
~20% lower RMSE on a 12-hour horizon.

## Scalability (future)
- Swap the demo model for a per-station / 1 km-grid model.
- Add satellite source attribution (Sentinel-5P).
- Multi-city support and multi-language citizen advisories (WhatsApp / IVR).
