/* =========================================================================
   AirSight — Urban Air Quality Intelligence
   Single-page app. Live data from WAQI (CPCB) with Open-Meteo fallback.
   ========================================================================= */

// ---- CONFIG: add more cities by copying an entry here ----
const WAQI_TOKEN = "13f4e896d25ecf8d002f8e194cb5aba1eeee609f";
// Data-freshness guard: ignore any station whose last reading is older than this
// many hours. Prevents stale feeds (e.g. WAQI's Pune stations frozen since 2021)
// from being displayed. When all of a city's stations are stale, the app falls
// back to live Open-Meteo automatically.
const MAX_STATION_AGE_H = 3;
const CITIES = {
  delhi: {
    name: "Delhi", lat: 28.6139, lon: 77.2090,
    search: "delhi", match: "Delhi",
    // representative pollution source split (%)
    sources: { Vehicular: 34, Dust: 27, Industrial: 16, Biomass: 11, "Power/Other": 12 },
    // sensitive receptors (schools/hospitals) for risk mapping
    sites: [
      { name: "AIIMS Delhi", type: "hospital", lat: 28.5672, lon: 77.2100 },
      { name: "Safdarjung Hospital", type: "hospital", lat: 28.5687, lon: 77.2065 },
      { name: "Lok Nayak Hospital", type: "hospital", lat: 28.6389, lon: 77.2405 },
      { name: "Max Hospital, Vaishali", type: "hospital", lat: 28.6444, lon: 77.3396 },
      { name: "DPS R.K. Puram", type: "school", lat: 28.5636, lon: 77.1766 },
      { name: "St. Columba's School", type: "school", lat: 28.6360, lon: 77.2065 },
      { name: "Modern School, Barakhamba", type: "school", lat: 28.6280, lon: 77.2270 },
      { name: "DAV School, Anand Vihar", type: "school", lat: 28.6510, lon: 77.3080 }
    ],
    // real CPCB station coordinates — used to build LIVE per-station data from
    // Open-Meteo whenever WAQI has no fresh ground stations for this city.
    stationCoords: [
      { name: "Narela", lat: 28.8206, lon: 77.1011 },
      { name: "DITE Okhla", lat: 28.5313, lon: 77.2707 },
      { name: "Major Dhyan Chand National Stadium", lat: 28.6125, lon: 77.2374 },
      { name: "PGDAV College", lat: 28.5668, lon: 77.2514 },
      { name: "ITI Shahdra", lat: 28.6721, lon: 77.3138 },
      { name: "Satyawati College", lat: 28.6957, lon: 77.1813 },
      { name: "Sonia Vihar Water Treatment Plant DJB", lat: 28.7101, lon: 77.2462 },
      { name: "Shaheed Sukhdev College of Business Studies", lat: 28.7327, lon: 77.1188 },
      { name: "Jawaharlal Nehru Stadium", lat: 28.5828, lon: 77.2344 },
      { name: "Pusa", lat: 28.637, lon: 77.1722 },
      { name: "ITI Jahangirpuri", lat: 28.733, lon: 77.172 },
      { name: "Punjabi Bagh", lat: 28.6683, lon: 77.1167 },
      { name: "Dr. Karni Singh Shooting Range", lat: 28.4997, lon: 77.2671 },
      { name: "Sri Auribindo Marg", lat: 28.5283, lon: 77.1893 },
      { name: "Anand Vihar", lat: 28.6508, lon: 77.3152 },
      { name: "Mandir Marg", lat: 28.6341, lon: 77.2005 },
      { name: "Bramprakash Ayurvedic Hospital", lat: 28.5727, lon: 76.9334 },
      { name: "Mundka", lat: 28.6824, lon: 77.0305 },
      { name: "Alipur", lat: 28.8157, lon: 77.1525 },
      { name: "R.K. Puram", lat: 28.5648, lon: 77.1744 },
      { name: "Mother Dairy Plant", lat: 28.6202, lon: 77.2877 },
      { name: "National Institute of Malaria Research", lat: 28.5769, lon: 77.0759 },
      { name: "Delhi Institute of Tool Engineering", lat: 28.7005, lon: 77.1656 }
    ]
  },
  pune: {
    name: "Pune", lat: 18.5204, lon: 73.8567,
    search: "pune", match: "Pune",
    sources: { Vehicular: 40, Dust: 22, Industrial: 18, Biomass: 9, "Power/Other": 11 },
    sites: [
      { name: "Sassoon General Hospital", type: "hospital", lat: 18.5286, lon: 73.8743 },
      { name: "Ruby Hall Clinic", type: "hospital", lat: 18.5314, lon: 73.8776 },
      { name: "KEM Hospital Pune", type: "hospital", lat: 18.5089, lon: 73.8553 },
      { name: "Fergusson College", type: "school", lat: 18.5236, lon: 73.8410 },
      { name: "Symbiosis School", type: "school", lat: 18.5390, lon: 73.8320 },
      { name: "Loyola High School", type: "school", lat: 18.5175, lon: 73.8280 }
    ],
    // real CPCB station coordinates — used to build LIVE per-station data from
    // Open-Meteo (WAQI has no fresh Pune ground stations).
    stationCoords: [
      { name: "Shivajinagar", lat: 18.5296, lon: 73.8496 },
      { name: "Katraj", lat: 18.4599, lon: 73.8523 },
      { name: "Pashan", lat: 18.5364, lon: 73.8055 },
      { name: "Lohegaon", lat: 18.5779, lon: 73.9081 },
      { name: "Karve Road", lat: 18.4975, lon: 73.8135 },
      { name: "Hadapsar", lat: 18.5022, lon: 73.9275 },
      { name: "Nigdi", lat: 18.6617, lon: 73.7623 },
      { name: "Alandi", lat: 18.6737, lon: 73.8915 },
      { name: "Manjri", lat: 18.5268, lon: 73.975 },
      { name: "Bhosari", lat: 18.6421, lon: 73.8491 },
      { name: "Bhumkar Chowk", lat: 18.6062, lon: 73.75 }
    ]
  }
};

// ---- CPCB AQI bands ----
const BANDS = [
  { lo: 0,   hi: 50,  name: "Good",         color: "#22c55e" },
  { lo: 51,  hi: 100, name: "Satisfactory", color: "#84cc16" },
  { lo: 101, hi: 200, name: "Moderate",     color: "#eab308" },
  { lo: 201, hi: 300, name: "Poor",         color: "#f97316" },
  { lo: 301, hi: 400, name: "Very Poor",    color: "#ef4444" },
  { lo: 401, hi: 500, name: "Severe",       color: "#7f1d1d" }
];
function bandFor(aqi){
  for (const b of BANDS) if (aqi <= b.hi) return b;
  return BANDS[BANDS.length - 1];
}

// ---- CPCB sub-index breakpoints (for Open-Meteo fallback) ----
// [Clow, Chigh, Ilow, Ihigh]
const BP = {
  pm25: [[0,30,0,50],[31,60,51,100],[61,90,101,200],[91,120,201,300],[121,250,301,400],[251,500,401,500]],
  pm10: [[0,50,0,50],[51,100,51,100],[101,250,101,200],[251,350,201,300],[351,430,301,400],[431,600,401,500]]
};
function subIndex(conc, table){
  if (conc == null || isNaN(conc)) return null;
  for (const [Clo,Chi,Ilo,Ihi] of table){
    if (conc >= Clo && conc <= Chi) return Math.round(((Ihi-Ilo)/(Chi-Clo))*(conc-Clo)+Ilo);
  }
  return 500;
}

// ---- state ----
let currentCity = "delhi";
let map, markerLayer;
let forecastChart, sourceChart;

// ---- DOM helpers ----
const $ = id => document.getElementById(id);

// fetch with a hard timeout so a slow/blocked request can't hang the app
async function fetchJSON(url, ms = 8000){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

/* ============================ INIT ============================ */
function init(){
  // Absolute safety: hide the loader no matter what, fast.
  setTimeout(() => showLoader(false), 6000);
  try { buildCityPills(); } catch(e){ console.warn("pills", e); }
  try { buildLegend(); } catch(e){ console.warn("legend", e); }
  try { initTheme(); } catch(e){ console.warn("theme", e); }
  try { initMap(); } catch(e){ console.warn("map init skipped", e); }
  try { $("themeToggle").onclick = toggleTheme; } catch(e){}
  try { $("refreshBtn").onclick = () => loadCity(currentCity); } catch(e){}
  loadCity(currentCity);
  // auto-refresh every 10 minutes
  setInterval(() => loadCity(currentCity), 10 * 60 * 1000);
}

function buildCityPills(){
  const box = $("cityPills");
  box.innerHTML = "";
  Object.keys(CITIES).forEach(key => {
    const b = document.createElement("button");
    b.className = "pill" + (key === currentCity ? " active" : "");
    b.textContent = CITIES[key].name;
    b.onclick = () => {
      currentCity = key;
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      b.classList.add("active");
      loadCity(key);
    };
    box.appendChild(b);
  });
}

function buildLegend(){
  $("legend").innerHTML = BANDS.map(b =>
    `<li><span class="sw" style="background:${b.color}"></span>${b.name}
     <span class="rng">${b.lo}–${b.hi}</span></li>`).join("");
}

/* ============================ THEME ============================ */
function initTheme(){
  const saved = localStorage.getItem("airsight-theme");
  const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
  $("themeToggle").querySelector(".theme-icon").textContent = dark ? "☀️" : "🌙";
}
function toggleTheme(){
  const dark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("airsight-theme", dark ? "dark" : "light");
  $("themeToggle").querySelector(".theme-icon").textContent = dark ? "☀️" : "🌙";
  if (forecastChart) renderForecast(forecastChart.$raw);
}

/* ============================ MAP ============================ */
function initMap(){
  if (typeof L === "undefined"){ console.warn("Leaflet not available"); return; }
  map = L.map("map", { scrollWheelZoom: false }).setView([CITIES.delhi.lat, CITIES.delhi.lon], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap", maxZoom: 18
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

/* ============================ DATA LOAD ============================ */
async function loadCity(key){
  const c = CITIES[key];
  showLoader(true);
  setStatus("loading");
  if (map) { try { map.setView([c.lat, c.lon], 11); } catch(e){} }
  renderSources(c);

  // safety net: never let the loader spin forever
  const safety = setTimeout(() => showLoader(false), 15000);

  try {
    let primary = null, stations = [], source = "";
    // wind (for source inference + downwind risk) — independent, best-effort
    const windP = fetchWind(c).catch(() => null);
    try {
      const res = await fetchWAQICity(c);   // search + per-station feeds
      primary = res.primary; stations = res.stations;
      source = "WAQI (CPCB/SAFAR)";
      setStatus("live", source);
    } catch (e) {
      console.warn("WAQI failed/stale, using Open-Meteo:", e);
      // Prefer LIVE per-station data (real map markers) when we know the
      // station coordinates; otherwise fall back to a single city-wide point.
      if (c.stationCoords && c.stationCoords.length){
        const res = await fetchOpenMeteoStations(c);
        primary = res.primary; stations = res.stations;
        source = "Open-Meteo (live, per-station)";
      } else {
        primary = await fetchOpenMeteo(c);
        stations = [];
        source = "Open-Meteo (live, city-wide)";
      }
      setStatus("fallback", source);
    }
    const wind = await windP;

    renderHero(c, primary, wind);
    renderForecast(primary.forecast);
    renderAdvisory(primary.aqi);
    renderStations(c, stations);
    renderActionConsole(c, stations, primary, wind);
    $("updatedText").textContent = "Updated " + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  } catch (err) {
    console.error("Both sources failed:", err);
    setStatus("error");
    renderStations(c, []);
    renderActionConsole(c, [], null, null);
  } finally {
    clearTimeout(safety);
    showLoader(false);
  }
}

// Wind from Open-Meteo (free, no key) — used for source inference + downwind risk.
async function fetchWind(c){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}`
            + `&current=wind_speed_10m,wind_direction_10m&timezone=auto`;
  const j = await fetchJSON(url, 7000);
  const cur = j.current;
  if (!cur) return null;
  return { speed: Math.round(cur.wind_speed_10m), dir: cur.wind_direction_10m };
}
function windText(deg){
  if (deg == null) return "—";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg/22.5) % 16];
}

// distance helper (rough, for picking the most central station)
function dist(a,b,c,d){ return Math.hypot(a-c, b-d); }

// Parse a WAQI station feed (data object) into our record shape.
function parseStationFeed(d){
  if (!d || typeof d.aqi !== "number") return null;
  // --- freshness guard: drop stations whose reading is too old ---
  const tRaw = d.time && (d.time.iso || d.time.s);
  const tMs  = tRaw ? Date.parse(tRaw)
                    : (d.time && d.time.v ? d.time.v * 1000 : NaN);
  if (!isNaN(tMs)){
    const ageH = (Date.now() - tMs) / 3.6e6;
    if (ageH > MAX_STATION_AGE_H){
      console.warn(`Skipping stale station "${(d.city&&d.city.name)||"?"}" — ${ageH.toFixed(1)}h old`);
      return null;
    }
  }
  const io = d.iaqi || {};
  const val = k => io[k] && typeof io[k].v === "number" ? Math.round(io[k].v) : null;
  let forecast = [];
  if (d.forecast && d.forecast.daily && d.forecast.daily.pm25){
    forecast = d.forecast.daily.pm25.map(p => ({ day:p.day, avg:p.avg, min:p.min, max:p.max }));
  }
  const geo = (d.city && d.city.geo) || [];
  const fullName = (d.city && d.city.name) || "Station";
  return {
    name: fullName.split(",")[0].trim(),   // short, clean label
    lat: geo[0], lon: geo[1],
    aqi: d.aqi,
    dominant: (d.dominentpol || "pm25").toUpperCase(),
    pm25: val("pm25"), pm10: val("pm10"), no2: val("no2"), o3: val("o3"),
    forecast
  };
}

// WAQI: search the city keyword, then fetch each station's live feed by uid.
async function fetchWAQICity(c){
  const searchUrl = `https://api.waqi.info/search/?keyword=${encodeURIComponent(c.search)}&token=${WAQI_TOKEN}`;
  const sj = await fetchJSON(searchUrl, 8000);
  if (sj.status !== "ok" || !Array.isArray(sj.data)) throw new Error("search failed");
  // keep only stations belonging to this city
  const list = sj.data.filter(x => (x.station?.name || "").includes(c.match)).slice(0, 25);
  if (!list.length) throw new Error("no stations for city");

  // fetch each station's live feed in parallel
  const feeds = await Promise.allSettled(list.map(x =>
    fetchJSON(`https://api.waqi.info/feed/@${x.uid}/?token=${WAQI_TOKEN}`, 8000)
  ));
  const stations = [];
  feeds.forEach(f => {
    if (f.status !== "fulfilled") return;
    const d = f.value && f.value.status === "ok" ? f.value.data : null;
    const rec = parseStationFeed(d);
    if (rec && rec.lat != null) stations.push(rec);
  });
  if (!stations.length) throw new Error("no live station feeds");

  // primary = live station closest to the city centre (best for a "city AQI" + forecast)
  let primary = stations[0], best = Infinity;
  for (const s of stations){
    const dd = dist(s.lat, s.lon, c.lat, c.lon);
    if (dd < best){ best = dd; primary = s; }
  }
  return { primary, stations };
}

// Open-Meteo fallback -> compute CPCB AQI
async function fetchOpenMeteo(c){
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}`
            + `&hourly=pm2_5,pm10,nitrogen_dioxide,ozone&forecast_days=5&timezone=auto`;
  const j = await fetchJSON(url, 8000);
  const h = j.hourly;
  if (!h || !h.pm2_5) throw new Error("Open-Meteo no data");
  // latest available index
  let idx = h.time.length - 1;
  while (idx > 0 && h.pm2_5[idx] == null) idx--;
  const pm25 = h.pm2_5[idx], pm10 = h.pm10[idx];
  const i25 = subIndex(pm25, BP.pm25), i10 = subIndex(pm10, BP.pm10);
  const aqi = Math.max(i25 || 0, i10 || 0);
  // daily forecast: average pm2.5 per day
  const byDay = {};
  h.time.forEach((t,i) => {
    const day = t.slice(0,10);
    if (h.pm2_5[i] == null) return;
    (byDay[day] = byDay[day] || []).push(h.pm2_5[i]);
  });
  const forecast = Object.keys(byDay).slice(0,5).map(day => {
    const arr = byDay[day];
    const avg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    return { day, avg, min: Math.round(Math.min(...arr)), max: Math.round(Math.max(...arr)) };
  });
  return {
    aqi,
    dominant: (i25 >= i10) ? "PM2.5" : "PM10",
    pm25: pm25!=null?Math.round(pm25):null, pm10: pm10!=null?Math.round(pm10):null,
    no2: h.nitrogen_dioxide?.[idx]!=null?Math.round(h.nitrogen_dioxide[idx]):null,
    o3: h.ozone?.[idx]!=null?Math.round(h.ozone[idx]):null,
    forecast
  };
}

// Open-Meteo PER-STATION: live values at each real station coordinate.
// Builds a full multi-marker map for cities without live WAQI ground stations.
async function fetchOpenMeteoStations(c){
  const lats = c.stationCoords.map(s => s.lat).join(",");
  const lons = c.stationCoords.map(s => s.lon).join(",");
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}`
            + `&hourly=pm2_5,pm10,nitrogen_dioxide,ozone&forecast_days=5&timezone=auto`;
  const j = await fetchJSON(url, 9000);
  const arr = Array.isArray(j) ? j : [j];   // Open-Meteo returns an array for multi-location
  const stations = [];
  arr.forEach((it, k) => {
    const meta = c.stationCoords[k];
    const h = it && it.hourly;
    if (!meta || !h || !h.pm2_5) return;
    let idx = h.time.length - 1;
    while (idx > 0 && h.pm2_5[idx] == null) idx--;
    const pm25 = h.pm2_5[idx], pm10 = h.pm10[idx];
    const i25 = subIndex(pm25, BP.pm25), i10 = subIndex(pm10, BP.pm10);
    const aqi = Math.max(i25 || 0, i10 || 0);
    // per-day average pm2.5 forecast for this station
    const byDay = {};
    h.time.forEach((t,i) => { if (h.pm2_5[i]==null) return; (byDay[t.slice(0,10)] = byDay[t.slice(0,10)] || []).push(h.pm2_5[i]); });
    const forecast = Object.keys(byDay).slice(0,5).map(day => {
      const a = byDay[day];
      return { day, avg: Math.round(a.reduce((x,y)=>x+y,0)/a.length), min: Math.round(Math.min(...a)), max: Math.round(Math.max(...a)) };
    });
    stations.push({
      name: meta.name, lat: meta.lat, lon: meta.lon, aqi,
      dominant: (i25 >= i10) ? "PM2.5" : "PM10",
      pm25: pm25!=null?Math.round(pm25):null, pm10: pm10!=null?Math.round(pm10):null,
      no2: h.nitrogen_dioxide?.[idx]!=null?Math.round(h.nitrogen_dioxide[idx]):null,
      o3: h.ozone?.[idx]!=null?Math.round(h.ozone[idx]):null,
      forecast
    });
  });
  if (!stations.length) throw new Error("Open-Meteo per-station: no data");
  // primary = station closest to the city centre (for the hero card + forecast)
  let primary = stations[0], best = Infinity;
  for (const s of stations){ const dd = dist(s.lat, s.lon, c.lat, c.lon); if (dd < best){ best = dd; primary = s; } }
  return { primary, stations };
}

/* ============================ RENDER ============================ */
function renderHero(c, d, wind){
  const b = bandFor(d.aqi);
  const card = $("heroCard");
  card.style.background = `linear-gradient(135deg, ${b.color}, ${shade(b.color,-25)})`;
  $("heroAqi").textContent = d.aqi;
  $("heroCat").textContent = b.name;
  $("heroCity").textContent = c.name;
  $("heroDom").textContent = d.dominant;
  $("pmPm25").textContent = d.pm25 ?? "—";
  $("pmPm10").textContent = d.pm10 ?? "—";
  $("pmNo2").textContent = d.no2 ?? "—";
  $("pmO3").textContent = d.o3 ?? "—";
  const wr = $("windReadout");
  if (wr) wr.textContent = wind ? `Wind ${windText(wind.dir)} · ${wind.speed} km/h` : "wind data unavailable";
}

function renderForecast(fc){
  if (typeof Chart === "undefined") return;
  const ink = getComputedStyle(document.body).getPropertyValue("--ink").trim();
  const grid = getComputedStyle(document.body).getPropertyValue("--line").trim();
  const labels = (fc||[]).map(f => new Date(f.day).toLocaleDateString([], {weekday:'short'}));
  const avg = (fc||[]).map(f => f.avg);
  const min = (fc||[]).map(f => f.min);
  const max = (fc||[]).map(f => f.max);
  if (forecastChart) forecastChart.destroy();
  forecastChart = new Chart($("forecastChart"), {
    type: "line",
    data: { labels, datasets: [
      { label:"Max", data:max, borderColor:"transparent", backgroundColor:"rgba(249,115,22,.15)", fill:"+1", pointRadius:0, tension:.35 },
      { label:"Min", data:min, borderColor:"transparent", backgroundColor:"transparent", fill:false, pointRadius:0, tension:.35 },
      { label:"Avg PM2.5", data:avg, borderColor:"#0e7490", backgroundColor:"#0e7490", borderWidth:3, pointRadius:4, tension:.35 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ labels:{ filter:i=>i.text==="Avg PM2.5", color:ink } } },
      scales:{ x:{ ticks:{color:ink}, grid:{color:grid} }, y:{ ticks:{color:ink}, grid:{color:grid}, title:{display:true, text:"µg/m³", color:ink} } }
    }
  });
  forecastChart.$raw = fc;
}

function renderSources(c){
  if (typeof Chart === "undefined") return;
  const ink = getComputedStyle(document.body).getPropertyValue("--ink").trim();
  const labels = Object.keys(c.sources);
  const data = Object.values(c.sources);
  const colors = ["#0e7490","#f97316","#7f1d1d","#84cc16","#94a3b8"];
  if (sourceChart) sourceChart.destroy();
  sourceChart = new Chart($("sourceChart"), {
    type: "doughnut",
    data: { labels, datasets:[{ data, backgroundColor:colors, borderWidth:2, borderColor:getComputedStyle(document.body).getPropertyValue("--panel").trim() }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:"62%",
      plugins:{ legend:{ position:"right", labels:{ color:ink, boxWidth:14, padding:10 } } } }
  });
}

const ADVICE = {
  low:  { pub:"Air quality is acceptable. Enjoy normal outdoor activities.",
          vul:"No special precautions needed for sensitive groups.",
          work:"Outdoor work is safe. Stay hydrated.",
          enf:"Routine monitoring. Maintain baseline emission checks." },
  mid:  { pub:"Reduce prolonged or heavy outdoor exertion if you feel symptoms.",
          vul:"Children, elderly & those with asthma should limit prolonged outdoor activity.",
          work:"Take regular breaks; consider masks during peak-traffic hours.",
          enf:"Increase dust-control at construction sites; tighten traffic-emission checks." },
  high: { pub:"Avoid outdoor exertion. Keep windows closed; use air purifiers indoors.",
          vul:"Sensitive groups should stay indoors. Keep medication accessible.",
          work:"Provide N95 masks; shorten outdoor shifts; schedule work off-peak.",
          enf:"Activate GRAP-style measures: halt construction, restrict heavy vehicles, deploy water sprinklers." },
  sev:  { pub:"Health emergency. Everyone should remain indoors with filtration.",
          vul:"High risk — sensitive groups must avoid all outdoor exposure; seek care if symptomatic.",
          work:"Suspend non-essential outdoor work. Mandatory respirators for essential staff.",
          enf:"Emergency response: school closures, vehicle rationing, industrial shutdowns, public alerts." }
};
function adviceTier(aqi){ return aqi<=100?"low":aqi<=200?"mid":aqi<=300?"high":"sev"; }
function renderAdvisory(aqi){
  const b = bandFor(aqi);
  $("advBand").textContent = b.name;
  const a = ADVICE[adviceTier(aqi)];
  const items = [
    ["General Public", a.pub, b.color],
    ["Vulnerable Groups", a.vul, b.color],
    ["Outdoor Workers", a.work, b.color],
    ["Recommended Enforcement", a.enf, "#0e7490"]
  ];
  $("advisory").innerHTML = items.map(([h,p,col]) =>
    `<div class="adv-item" style="border-left-color:${col}"><h4>${h}</h4><p>${p}</p></div>`).join("");
}

/* ============================ STATIONS ============================ */
// Draw the already-fetched stations + sensitive receptors onto the map + table.
function renderStations(c, stations){
  if (markerLayer) markerLayer.clearLayers();
  const rows = [];
  (stations || []).forEach(st => {
    if (typeof st.aqi !== "number") return;
    const b = bandFor(st.aqi);
    if (markerLayer && typeof L !== "undefined" && st.lat != null && st.lon != null){
      L.circleMarker([st.lat, st.lon], {
        radius:8, color:"#fff", weight:1.5, fillColor:b.color, fillOpacity:.9
      }).addTo(markerLayer)
        .bindPopup(`<b>${st.name}</b><br>
          <span class="pop-aqi" style="color:${b.color}">AQI ${st.aqi}</span> · ${b.name}`);
    }
    rows.push({ name: st.name, aqi: st.aqi, band:b });
  });
  // sensitive receptors (schools = ▲, hospitals = ✚) as diamond/marker pins
  if (markerLayer && typeof L !== "undefined"){
    (c.sites || []).forEach(s => {
      const icon = s.type === "hospital" ? "✚" : "🎓";
      const html = `<div class="site-pin ${s.type}">${icon}</div>`;
      L.marker([s.lat, s.lon], { icon: L.divIcon({ className:"", html, iconSize:[24,24], iconAnchor:[12,12] }) })
        .addTo(markerLayer)
        .bindPopup(`<b>${s.name}</b><br><span class="muted">${s.type === "hospital" ? "Hospital" : "School / College"} · sensitive receptor</span>`);
    });
  }
  // fit map to the markers so every city frames nicely
  if (map && typeof L !== "undefined" && rows.length){
    const pts = (stations || []).filter(s => s.lat != null).map(s => [s.lat, s.lon]);
    (c.sites || []).forEach(s => pts.push([s.lat, s.lon]));
    if (pts.length){ try { map.fitBounds(pts, { padding:[30,30], maxZoom:13 }); } catch(e){} }
  }
  $("stationCount").textContent = rows.length ? `${rows.length} stations` : "no station data";
  renderTable(rows);
}

function renderTable(rows){
  rows.sort((a,b) => b.aqi - a.aqi);
  const tb = $("readingsBody");
  if (!rows.length){ tb.innerHTML = `<tr><td colspan="4" class="muted">No station readings available.</td></tr>`; return; }
  tb.innerHTML = rows.map((r,i) =>
    `<tr>
      <td>${i+1}</td>
      <td>${r.name}</td>
      <td><span class="aqi-chip" style="background:${r.band.color}">${r.aqi}</span></td>
      <td class="cat-tag" style="color:${r.band.color}">${r.band.name}</td>
    </tr>`).join("");
}

/* ============================ INTERVENTION ENGINE ============================ */
// Haversine distance in km
function haversine(la1, lo1, la2, lo2){
  const R = 6371, rad = Math.PI/180;
  const dLa = (la2-la1)*rad, dLo = (lo2-lo1)*rad;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1*rad)*Math.cos(la2*rad)*Math.sin(dLo/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Infer the likely emission source from the dominant pollutant.
function sourceFromPollutant(dom){
  const d = (dom||"").toUpperCase();
  if (d.includes("PM10")) return "Road & construction dust";
  if (d.includes("PM25") || d.includes("PM2.5")) return "Vehicular / combustion";
  if (d.includes("NO2")) return "Vehicular exhaust";
  if (d.includes("SO2")) return "Industrial / power plant";
  if (d.includes("CO"))  return "Traffic / combustion";
  if (d.includes("O3"))  return "Photochemical (traffic + sunlight)";
  return "Mixed urban sources";
}

// Band-specific recommended enforcement action, tuned to the likely source.
function actionFor(band, source){
  const dust = source.includes("dust");
  const veh  = source.includes("Vehic") || source.includes("Traffic");
  const ind  = source.includes("Industrial");
  if (band.name === "Poor") {
    if (dust) return "Deploy water sprinklers & cover exposed soil at nearby construction sites; enforce dust-screen norms.";
    if (veh)  return "Intensify PUC (emission) checks on arterial roads; ease congestion via signal re-timing.";
    if (ind)  return "Audit nearby industrial units for emission compliance; check for illegal burning.";
    return "Localised dust control + targeted traffic-emission checks in the affected ward.";
  }
  if (band.name === "Very Poor") {
    if (dust) return "Halt non-essential construction; mechanised road-sweeping + sprinkling; anti-smog guns at hotspot.";
    if (veh)  return "Restrict heavy/commercial vehicles on the corridor; ramp up public transport frequency.";
    if (ind)  return "Order temporary load reduction on nearby industry; deploy inspection team same-day.";
    return "Activate GRAP Stage-III style measures around the hotspot: construction halt, vehicle restriction, sprinkling.";
  }
  // Severe
  if (band.name === "Severe" || band.name === "Very Poor") {
    return "EMERGENCY: close/relocate outdoor activity at nearby schools; ban heavy vehicles; shut polluting units; public health alert.";
  }
  return "Maintain routine monitoring; no enforcement trigger at this level.";
}

// Build a prioritized intervention list from live hotspot stations.
function computeInterventions(c, stations, primary, wind){
  const RADIUS = 3; // km — receptors considered "impacted"
  let hotspots = (stations || []).filter(s => typeof s.aqi === "number" && s.aqi >= 201);
  // if no station-level hotspots but city AQI is high, synthesize a city-level card
  if (!hotspots.length && primary && primary.aqi >= 201){
    hotspots = [{ name: c.name + " (city avg)", aqi: primary.aqi, lat: c.lat, lon: c.lon, dominant: primary.dominant }];
  }
  hotspots.sort((a,b) => b.aqi - a.aqi);
  return hotspots.slice(0, 5).map(h => {
    const band = bandFor(h.aqi);
    const source = sourceFromPollutant(h.dominant);
    // impacted sensitive receptors within radius
    let sites = [];
    if (h.lat != null){
      sites = (c.sites || [])
        .map(s => ({ ...s, km: haversine(h.lat, h.lon, s.lat, s.lon) }))
        .filter(s => s.km <= RADIUS)
        .sort((a,b) => a.km - b.km);
    }
    const schools = sites.filter(s => s.type === "school").length;
    const hospitals = sites.filter(s => s.type === "hospital").length;
    const eta = band.name === "Severe" ? "Immediate (< 1 hr)" : band.name === "Very Poor" ? "< 2 hrs" : "< 6 hrs";
    return {
      loc: h.name, aqi: h.aqi, band, source,
      sites: sites.slice(0,3), schools, hospitals,
      windTxt: wind ? `${windText(wind.dir)} @ ${wind.speed} km/h` : null,
      action: actionFor(band, source), eta
    };
  });
}

function renderActionConsole(c, stations, primary, wind){
  const box = $("actions");
  if (!box) return;
  const items = computeInterventions(c, stations, primary, wind);
  if (!items.length){
    box.innerHTML = `<div class="action-ok">✅ No zones above the <strong>Poor</strong> threshold right now.
      All monitored areas are within acceptable limits — continue routine monitoring.</div>`;
    return;
  }
  box.innerHTML = items.map((it, i) => {
    const urg = it.band.name === "Severe" ? "critical" : it.band.name === "Very Poor" ? "high" : "medium";
    const recv = (it.schools + it.hospitals) > 0
      ? `<span class="ai-recv">${it.schools} school${it.schools!==1?"s":""}, ${it.hospitals} hospital${it.hospitals!==1?"s":""} within 3 km</span>`
      : `<span class="ai-recv muted">no sensitive receptors within 3 km</span>`;
    const names = it.sites.length ? `<div class="ai-sites">Alert: ${it.sites.map(s=>`${s.type==="hospital"?"✚":"🎓"} ${s.name} (${s.km.toFixed(1)} km)`).join(" · ")}</div>` : "";
    return `<div class="action-item urg-${urg}">
      <div class="ai-rank">#${i+1}</div>
      <div class="ai-body">
        <div class="ai-top">
          <span class="ai-loc">${it.loc}</span>
          <span class="aqi-chip" style="background:${it.band.color}">${it.aqi}</span>
          <span class="ai-band" style="color:${it.band.color}">${it.band.name}</span>
        </div>
        <div class="ai-meta">
          <span>🏭 Likely source: <strong>${it.source}</strong></span>
          ${it.windTxt ? `<span>· 💨 Wind ${it.windTxt}</span>` : ""}
          <span>· ${recv}</span>
        </div>
        <div class="ai-action"><strong>Recommended intervention:</strong> ${it.action}</div>
        ${names}
        <div class="ai-eta">⏱ Target response window: <strong>${it.eta}</strong></div>
      </div>
    </div>`;
  }).join("");
}

/* ============================ UI UTILS ============================ */
function setStatus(state, source){
  const dot = $("statusDot"), txt = $("sourceText");
  dot.className = "dot";
  if (state==="live"){ dot.classList.add("live"); txt.textContent = "Live · " + source; }
  else if (state==="fallback"){ dot.classList.add("fallback"); txt.textContent = "Fallback · " + source; }
  else if (state==="error"){ dot.classList.add("error"); txt.textContent = "Data unavailable — check connection"; }
  else { txt.textContent = "Loading live data…"; }
}
function showLoader(on){ $("loader").classList.toggle("hide", !on); }

// darken/lighten a hex color
function shade(hex, pct){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)+pct*2.55, g=((n>>8)&255)+pct*2.55, b=(n&255)+pct*2.55;
  r=Math.max(0,Math.min(255,r|0)); g=Math.max(0,Math.min(255,g|0)); b=Math.max(0,Math.min(255,b|0));
  return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

document.addEventListener("DOMContentLoaded", init);
