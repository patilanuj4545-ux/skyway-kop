/* ============================================================
   search.js — Search Flights Page Logic
   ============================================================ */

var tripMode = 'ow';
var paxCounts = { a: 1, c: 0, i: 0, af: 0, st: 0, dr: 0, nu: 0, ot: 0 };
var PAX_IDS = { a:'paxA', c:'paxC', i:'paxI', af:'paxAF', st:'paxST', dr:'paxDR', nu:'paxNU', ot:'paxOT' };
var mcCount = 0;
var mapObj, fromMarker, toMarker, routeLine;

var CITY_COORDS = {
  KOP: { lat: 16.664, lng: 74.289, name: 'Kolhapur', season: 'Oct–Mar' },
  BOM: { lat: 19.096, lng: 72.874, name: 'Mumbai', season: 'Nov–Feb' },
  NMB: { lat: 19.033, lng: 73.029, name: 'Navi Mumbai', season: 'Oct–Feb' },
  HYD: { lat: 17.385, lng: 78.487, name: 'Hyderabad', season: 'Nov–Feb' },
  HYD2:{ lat: 17.385, lng: 78.487, name: 'Hyderabad', season: 'Nov–Feb' },
  BLR: { lat: 12.972, lng: 77.595, name: 'Bengaluru', season: 'Sep–Feb' },
  BLR2:{ lat: 12.972, lng: 77.595, name: 'Bengaluru', season: 'Sep–Feb' },
  NAG: { lat: 21.146, lng: 79.083, name: 'Nagpur', season: 'Oct–Feb' },
  AHN: { lat: 19.095, lng: 74.740, name: 'Ahmednagar', season: 'Oct–Feb' },
  GOI: { lat: 15.299, lng: 74.124, name: 'Goa', season: 'Nov–Feb' }
};

// ---- TRIP TYPE ----
function setTrip(mode, btn) {
  document.querySelectorAll('.tt-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  tripMode = mode;
  var rd = document.getElementById('retDate');
  if (mode === 'rt') { rd.style.opacity = '1'; rd.style.pointerEvents = 'auto'; }
  else { rd.style.opacity = '.4'; rd.style.pointerEvents = 'none'; }
  var mc = document.getElementById('mcExtra');
  if (mc) mc.classList.toggle('show', mode === 'mc');
}

// ---- PAX PANEL ----
function togglePaxPanel() {
  document.getElementById('paxPanel').classList.toggle('open');
}
function closePaxPanel() {
  document.getElementById('paxPanel').classList.remove('open');
  updatePaxLabel();
}
function changePax(type, delta) {
  paxCounts[type] = Math.max(0, (paxCounts[type] || 0) + delta);
  if (paxCounts.a < 1) paxCounts.a = 1;
  Object.keys(PAX_IDS).forEach(function(k) {
    var el = document.getElementById(PAX_IDS[k]);
    if (el) el.textContent = paxCounts[k];
  });
  updatePaxLabel();
}
function updatePaxLabel() {
  var total = Object.values(paxCounts).reduce(function(s,v){ return s+v; }, 0);
  var cls = document.getElementById('cabinClass').value || 'Economy';
  var specials = [];
  if (paxCounts.af > 0) specials.push(paxCounts.af + ' Armed Forces');
  if (paxCounts.st > 0) specials.push(paxCounts.st + ' Student');
  if (paxCounts.dr > 0) specials.push(paxCounts.dr + ' Doctor');
  if (paxCounts.nu > 0) specials.push(paxCounts.nu + ' Nurse');
  if (paxCounts.ot > 0) specials.push(paxCounts.ot + ' Other');
  var label = total + ' Pax · ' + cls;
  if (specials.length) label += ' · ' + specials.join(', ');
  document.getElementById('paxLabel').textContent = label;
}

// ---- MULTI CITY ----
function addMcRow() {
  mcCount++;
  var r = document.createElement('div');
  r.className = 'mc-row'; r.id = 'mc-r-' + mcCount;
  r.innerHTML = '<div class="field"><label>From</label><div class="csw"><select class="csel"><option>Kolhapur (KOP)</option></select></div></div>' +
    '<div class="field"><label>To</label><div class="csw"><select class="csel"><option>Select City</option><option>Mumbai (BOM)</option><option>Hyderabad (HYD)</option><option>Bengaluru (BLR)</option></select></div></div>' +
    '<div class="field"><label>Date</label><input type="date" class="std-date"></div>' +
    '<button onclick="this.parentNode.remove()" style="width:28px;height:28px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:50%;cursor:pointer;color:var(--red);align-self:end;flex-shrink:0;"><i class="fa-solid fa-times"></i></button>';
  document.getElementById('mcRows').appendChild(r);
}

// ---- MAP (Satellite + Colored + Live Weather) ----
var weatherLayer = null;
function initMap() {
  if (mapObj) return;
  mapObj = L.map('map', { zoomControl: true }).setView([17.5, 75.5], 6);

  // Satellite imagery layer
  var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: '© Esri World Imagery'
  });
  // Colorful street map layer  
  var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap contributors'
  });
  // Place labels overlay for satellite view
  var labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, opacity: 0.85
  });
  // Live weather clouds overlay
  weatherLayer = L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=439d4b804bc8187953eb36d2a8c26a02', {
    maxZoom: 19, opacity: 0.55, attribution: '© OpenWeatherMap'
  });

  // Default: satellite + labels
  satelliteLayer.addTo(mapObj);
  labelsLayer.addTo(mapObj);

  // Layer control UI (top right)
  var baseLayers = {
    '🛰️ Satellite': satelliteLayer,
    '🗺️ Street (Colored)': streetLayer
  };
  var overlays = {
    '☁️ Live Weather Clouds': weatherLayer
  };
  L.control.layers(baseLayers, overlays, { position: 'topright', collapsed: false }).addTo(mapObj);

  var fromIcon = L.divIcon({
    html: '<div style="width:14px;height:14px;background:#38bdf8;border-radius:50%;border:3px solid #bae6fd;box-shadow:0 0 14px rgba(56,189,248,.9);"></div>',
    className: '', iconAnchor: [7, 7]
  });
  fromMarker = L.marker([16.664, 74.289], { icon: fromIcon }).addTo(mapObj)
    .bindPopup('<b style="color:#38bdf8">Kolhapur (KOP)</b><br>Chhatrapati Rajaram Maharaj Airport');
}
function updateMap() {
  var tc = document.getElementById('toCity').value;
  if (!tc || !CITY_COORDS[tc]) { document.getElementById('routeInfo').style.display = 'none'; return; }
  var ci = CITY_COORDS[tc], fi = CITY_COORDS['KOP'];
  if (toMarker) mapObj.removeLayer(toMarker);
  if (routeLine) mapObj.removeLayer(routeLine);
  var toIcon = L.divIcon({
    html: '<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:3px solid #86efac;box-shadow:0 0 14px rgba(34,197,94,.9);"></div>',
    className: '', iconAnchor: [7, 7]
  });
  toMarker = L.marker([ci.lat, ci.lng], { icon: toIcon }).addTo(mapObj).bindPopup(ci.name + ' (' + tc.replace('2','') + ')');
  routeLine = L.polyline([[fi.lat, fi.lng], [ci.lat, ci.lng]], { color: '#38bdf8', weight: 2, dashArray: '6,9', opacity: .7 }).addTo(mapObj);
  mapObj.fitBounds([[fi.lat, fi.lng], [ci.lat, ci.lng]], { padding: [40, 40] });
  var dist = haversine(fi.lat, fi.lng, ci.lat, ci.lng);
  var mins = Math.round(dist / 820 * 60 + 30);
  document.getElementById('routeInfo').style.display = 'flex';
  document.getElementById('ri-dist').textContent = Math.round(dist) + ' km';
  document.getElementById('ri-dur').textContent = Math.floor(mins / 60) + 'h ' + ((mins % 60) || 5) + 'm (est.)';
  document.getElementById('ri-code').textContent = 'KOP–' + tc.replace('2', '');
  document.getElementById('ri-season').textContent = ci.season || 'Oct–Mar';
}

function haversine(la1, lo1, la2, lo2) {
  var R = 6371, dL = (la2-la1)*Math.PI/180, dO = (lo2-lo1)*Math.PI/180;
  var a = Math.sin(dL/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ---- AIRLINE INFO ----
var AIRLINE_DATA = {
  indigo: {
    name: 'IndiGo (6E)', sub: 'India\'s Largest Low-Cost Carrier · Est. 2006',
    logo: '6E', bg: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
    stats: [{ v: '35+', l: 'Flights/Day' }, { v: '98%', l: 'On-time' }, { v: '3', l: 'Routes KOP' }],
    routes: [
      { name: 'Kolhapur → Hyderabad', info: '6E-6312 · 06:30–07:45 · Daily', price: '₹2,199' },
      { name: 'Kolhapur → Bengaluru', info: '6E-6414 · 07:15–08:45 · Daily', price: '₹1,999' },
      { name: 'Kolhapur → Navi Mumbai', info: '6E-6201 · 06:00–07:10 · from Mar 29', price: '₹1,699' }
    ]
  },
  starair: {
    name: 'Star Air (S5)', sub: 'Regional Premium Carrier · Est. 2019',
    logo: 'S5', bg: 'linear-gradient(135deg,#dc2626,#b91c1c)',
    stats: [{ v: '40+', l: 'Flights/Day' }, { v: '95%', l: 'On-time' }, { v: '6', l: 'Routes KOP' }],
    routes: [
      { name: 'Kolhapur → Mumbai', info: 'S5-224 · 06:15–07:20 · Daily', price: '₹2,450' },
      { name: 'Kolhapur → Nagpur', info: 'S5-316 · 08:00–09:40 · Daily', price: '₹2,800' },
      { name: 'Kolhapur → Goa', info: 'S5-804 · 09:00–10:10 · Daily', price: '₹2,899' },
      { name: 'Kolhapur → Ahmednagar', info: 'S5-610 · 10:45–11:30 · Daily', price: '₹1,899' }
    ]
  }
};

function showAirlineInfo(id) {
  var d = AIRLINE_DATA[id]; if (!d) return;
  document.getElementById('ai-logo-badge').textContent = d.logo;
  document.getElementById('ai-logo-badge').style.background = d.bg;
  document.getElementById('ai-name').textContent = d.name;
  document.getElementById('ai-sub').textContent = d.sub;
  document.getElementById('ai-stats-row').innerHTML = d.stats.map(function(s) {
    return '<div class="ai-stat"><div class="ai-sv">' + s.v + '</div><div class="ai-sl">' + s.l + '</div></div>';
  }).join('');
  document.getElementById('ai-routes').innerHTML = d.routes.map(function(r) {
    return '<div class="ai-route"><div><div class="ai-rn">' + r.name + '</div><div class="ai-rd">' + r.info + '</div></div><div class="ai-rp">' + r.price + '</div></div>';
  }).join('');
  document.getElementById('airlinePanel').classList.add('active');
}

// ---- SEARCH ----
function doSearch() {
  var to = document.getElementById('toCity').value;
  var dep = document.getElementById('depDate').value;

  if (!to) { showToast('fa-solid fa-circle-exclamation', 'var(--red)', 'Missing Destination', 'Please select a destination city.', 3000); return; }
  if (!dep) { showToast('fa-solid fa-circle-exclamation', 'var(--red)', 'Missing Date', 'Please select a departure date.', 3000); return; }

  var cls = document.getElementById('cabinClass').value || 'Economy';
  var total = Object.values(paxCounts).reduce(function(s,v){ return s+v; }, 0);

SW.set('searchData', {
    from: 'KOP', to: to, dep: dep, ret: document.getElementById('retDate').value,
    adults: paxCounts.a, children: paxCounts.c, infants: paxCounts.i,
    armedForces: paxCounts.af, students: paxCounts.st, doctors: paxCounts.dr,
    nurses: paxCounts.nu, others: paxCounts.ot,
    total: total, cls: cls, mode: tripMode
  });

  window.location.href = 'result.html';
}

// ---- PRE-FILL FROM URL / QUICK DEAL ----
function preFill() {
  var params = new URLSearchParams(window.location.search);
  var toParam = params.get('to');

  if (toParam) {
    var sel = document.getElementById('toCity');

    if (sel) {
      sel.value = toParam;

      // map update
      updateMap();

      // 👉 auto date set
      var today = getTodayStr();
      var depEl = document.getElementById('depDate');
      if (depEl && !depEl.value) depEl.value = today;

      // 👉 AUTO SEARCH 🔥
      setTimeout(function () {
        if (typeof doSearch === "function") {
          doSearch();
        }
      }, 500);
    }
  }

  // default date (normal user case)
  var today = getTodayStr();
  var depEl = document.getElementById('depDate');
  if (depEl && !depEl.value) depEl.value = today;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  preFill();
  setTimeout(initMap, 200);
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.pax-wrap')) closePaxPanel();
    if (e.target === document.getElementById('airlinePanel')) document.getElementById('airlinePanel').classList.remove('active');
  });
});