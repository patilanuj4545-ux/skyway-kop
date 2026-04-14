/* ============================================================
   result.js — Flight Results Page Logic
   ============================================================ */

var ALL_FLIGHTS = [
  { id:'6e-6312', airline:'IndiGo', code:'6E', fno:'6E-6312', from:'KOP', to:'HYD',  dep:'06:30', arr:'07:45', dur:'1h 15m', price:2199, orig:3100, disc:29, cls:'Economy', stops:'Nonstop', color:'#1d4ed8' },
  { id:'6e-6414', airline:'IndiGo', code:'6E', fno:'6E-6414', from:'KOP', to:'BLR',  dep:'07:15', arr:'08:45', dur:'1h 30m', price:1999, orig:2800, disc:29, cls:'Economy', stops:'Nonstop', color:'#1d4ed8' },
  { id:'6e-6201', airline:'IndiGo', code:'6E', fno:'6E-6201', from:'KOP', to:'NMB',  dep:'06:00', arr:'07:10', dur:'1h 10m', price:1699, orig:2200, disc:23, cls:'Economy', stops:'Nonstop', color:'#1d4ed8' },
  { id:'6e-6314', airline:'IndiGo', code:'6E', fno:'6E-6314', from:'KOP', to:'HYD',  dep:'10:05', arr:'11:20', dur:'1h 15m', price:2450, orig:3100, disc:21, cls:'Economy', stops:'Nonstop', color:'#1d4ed8' },
  { id:'6e-6416', airline:'IndiGo', code:'6E', fno:'6E-6416', from:'KOP', to:'BLR',  dep:'14:30', arr:'16:00', dur:'1h 30m', price:2199, orig:2800, disc:21, cls:'Economy', stops:'Nonstop', color:'#1d4ed8' },
  { id:'s5-224',  airline:'Star Air',code:'S5',fno:'S5-224',  from:'KOP', to:'BOM',  dep:'06:15', arr:'07:20', dur:'1h 05m', price:2450, orig:3500, disc:30, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-226',  airline:'Star Air',code:'S5',fno:'S5-226',  from:'KOP', to:'BOM',  dep:'09:30', arr:'10:35', dur:'1h 05m', price:2699, orig:3500, disc:23, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-316',  airline:'Star Air',code:'S5',fno:'S5-316',  from:'KOP', to:'NAG',  dep:'08:00', arr:'09:40', dur:'1h 40m', price:2800, orig:3800, disc:26, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-412',  airline:'Star Air',code:'S5',fno:'S5-412',  from:'KOP', to:'HYD2', dep:'11:30', arr:'12:45', dur:'1h 15m', price:2299, orig:3200, disc:28, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-508',  airline:'Star Air',code:'S5',fno:'S5-508',  from:'KOP', to:'BLR2', dep:'07:45', arr:'09:15', dur:'1h 30m', price:2299, orig:3200, disc:28, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-610',  airline:'Star Air',code:'S5',fno:'S5-610',  from:'KOP', to:'AHN',  dep:'10:45', arr:'11:30', dur:'45m',    price:1899, orig:2500, disc:24, cls:'Economy', stops:'Nonstop', color:'#dc2626' },
  { id:'s5-804',  airline:'Star Air',code:'S5',fno:'S5-804',  from:'KOP', to:'GOI',  dep:'09:00', arr:'10:10', dur:'1h 10m', price:2899, orig:4200, disc:31, cls:'Economy', stops:'Nonstop', color:'#dc2626' }
];

var DEST_NAMES = { KOP:'Kolhapur', BOM:'Mumbai', NMB:'Navi Mumbai', HYD:'Hyderabad', HYD2:'Hyderabad', BLR:'Bengaluru', BLR2:'Bengaluru', NAG:'Nagpur', AHN:'Ahmednagar', GOI:'Goa' };

var currentFlights = [];
var searchData = {};

// ---- BUILD SUMMARY BAR ----
function buildSummaryBar() {
  document.getElementById('ss-from').textContent = 'Kolhapur (KOP)';
  document.getElementById('ss-to').textContent   = (DEST_NAMES[searchData.to] || searchData.to || '?') + ' (' + (searchData.to || '?').replace('2','') + ')';
  document.getElementById('ss-date').textContent  = formatDate(searchData.dep);
  document.getElementById('ss-pax').textContent   = (searchData.total || 1) + ' Pax';
  document.getElementById('ss-trip').textContent  = searchData.mode === 'rt' ? 'Round Trip' : 'One Way';

  var titleTo = DEST_NAMES[searchData.to] || searchData.to || '?';
  document.getElementById('r-title').textContent = 'Kolhapur → ' + titleTo;
  document.getElementById('r-sub').textContent   = formatDate(searchData.dep) + ' · ' + (searchData.total || 1) + ' Passenger(s) · ' + (searchData.cls || 'Economy');
}

// ---- FILTER AND RENDER ----
function getFlightsForDest(to) {
  if (!to) return ALL_FLIGHTS;
  return ALL_FLIGHTS.filter(function(f) {
    return f.to === to || f.to === to + '2';
  });
}

function renderFlights(list) {
  var container = document.getElementById('flightList');
  document.getElementById('r-cnt').textContent = list.length + ' flight' + (list.length !== 1 ? 's' : '');

  if (!list.length) {
    container.innerHTML = '<div class="no-results"><i class="fa-solid fa-plane-slash"></i><h3>No flights found</h3><p>Try a different destination or date from <a href="search.html" style="color:var(--sky);">Search</a>.</p></div>';
    return;
  }

  container.innerHTML = list.map(function(f, idx) {
    var cls = searchData.cls || 'Economy';
    var priceMulti = cls === 'Business' ? 2.2 : cls === 'First Class' ? 3.5 : 1;
    var pax = searchData.total || 1;
    var unitPrice = Math.round(f.price * priceMulti);
    var totalPrice = unitPrice * pax;

    return '<div class="fc-card" id="fc-' + f.id + '" style="animation-delay:' + (idx * 0.07) + 's">' +
      '<div class="fc-main">' +
        '<div class="fc-airline">' +
          '<div class="fc-logo" style="background:' + f.color + ';">' + f.code + '</div>' +
          '<div><div class="fc-al-name">' + f.airline + '</div><div class="fc-al-num">' + f.fno + ' · ' + f.cls + '</div></div>' +
        '</div>' +
        '<div class="fc-route">' +
          '<div class="fc-time-blk"><div class="fc-time">' + f.dep + '</div><div class="fc-ap">KOP · Kolhapur</div></div>' +
          '<div class="fc-flight-line"><div class="fc-fl-track"></div><div class="fc-dur">' + f.dur + '</div><div class="fc-stops">' + f.stops + '</div></div>' +
          '<div class="fc-time-blk"><div class="fc-time">' + f.arr + '</div><div class="fc-ap">' + (f.to.replace('2','')) + ' · ' + (DEST_NAMES[f.to] || '') + '</div></div>' +
        '</div>' +
        '<div class="fc-right">' +
          (f.orig ? '<div class="fc-price-orig">₹' + Math.round(f.orig * priceMulti * pax).toLocaleString('en-IN') + '</div>' : '') +
          '<div class="fc-price">₹' + totalPrice.toLocaleString('en-IN') + '</div>' +
          '<div class="fc-price-sub">per ' + pax + ' pax · ' + cls + '</div>' +
          (f.disc ? '<div class="fc-disc">Save ' + f.disc + '%</div>' : '') +
          '<button class="book-now-btn" onclick="selectFlight(\'' + f.id + '\')"><i class="fa-solid fa-bolt"></i> Book Now</button>' +
        '</div>' +
      '</div>' +
      '<button class="fc-expand-btn" onclick="toggleDetail(\'' + f.id + '\',this)"><i class="fa-solid fa-chevron-down"></i> Flight Details & Amenities</button>' +
      '<div class="fc-detail" id="fd-' + f.id + '">' +
        '<div class="fc-detail-grid">' +
          '<div class="fc-dg-item"><label>Flight No.</label><div class="val">' + f.fno + '</div></div>' +
          '<div class="fc-dg-item"><label>Aircraft</label><div class="val">ATR 72-600</div></div>' +
          '<div class="fc-dg-item"><label>Duration</label><div class="val">' + f.dur + '</div></div>' +
          '<div class="fc-dg-item"><label>Departure</label><div class="val">' + f.dep + '</div></div>' +
          '<div class="fc-dg-item"><label>Arrival</label><div class="val">' + f.arr + '</div></div>' +
          '<div class="fc-dg-item"><label>Stops</label><div class="val">' + f.stops + '</div></div>' +
          '<div class="fc-dg-item"><label>Terminal</label><div class="val">T1</div></div>' +
          '<div class="fc-dg-item"><label>Baggage</label><div class="val">15 kg + 7 kg cabin</div></div>' +
          '<div class="fc-dg-item"><label>Refundable</label><div class="val">Yes (fees apply)</div></div>' +
        '</div>' +
        '<div class="fc-includes">' +
          '<div class="fc-tag"><i class="fa-solid fa-suitcase"></i> 15kg Baggage</div>' +
          '<div class="fc-tag"><i class="fa-solid fa-utensils"></i> Meal Included</div>' +
          '<div class="fc-tag"><i class="fa-solid fa-wifi"></i> In-flight WiFi</div>' +
          '<div class="fc-tag"><i class="fa-solid fa-rotate-left"></i> Refundable</div>' +
          '<div class="fc-tag"><i class="fa-solid fa-chair"></i> Seat Selection</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleDetail(id, btn) {
  var d = document.getElementById('fd-' + id);
  d.classList.toggle('open');
  var ic = btn.querySelector('i');
  if (d.classList.contains('open')) { ic.style.transform = 'rotate(180deg)'; btn.innerHTML = btn.innerHTML.replace('Flight Details & Amenities','Hide Details'); }
  else { ic.style.transform = ''; btn.innerHTML = btn.innerHTML.replace('Hide Details','Flight Details & Amenities'); }
}

// ---- SORT ----
function sortFlights(mode, btn) {
  document.querySelectorAll('.f-chip').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var list = currentFlights.slice();
  if (mode === 'price') list.sort(function(a,b) { return a.price - b.price; });
  else if (mode === 'dur') list.sort(function(a,b) { return a.dur.localeCompare(b.dur); });
  else if (mode === 'ns')  list = list.filter(function(f) { return f.stops === 'Nonstop'; });
  else if (mode === 'morn') list = list.filter(function(f) { return parseInt(f.dep) < 12; });
  else if (mode === 'eve')  list = list.filter(function(f) { return parseInt(f.dep) >= 14; });
  else if (mode === 's5')   list = list.filter(function(f) { return f.code === 'S5'; });
  else if (mode === '6e')   list = list.filter(function(f) { return f.code === '6E'; });
  renderFlights(list);
}

// ---- SELECT FLIGHT ----
function selectFlight(id) {

  // TEMP: skip login check
  /*
  if (!currentUser) {
    openLoginModal();
    SW.set('pendingFlightId', id);
    return;
  }
  */

  var flight = ALL_FLIGHTS.find(function(f) { return f.id === id; });
  if (!flight) return;

  SW.set('selectedFlight', flight);
  SW.set('searchData', searchData);

  window.location.href = 'passenger.html';
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {

  // 👉 STEP 1: data घे
  searchData = SW.get('searchData') || {};

  // 👉 STEP 2: DEBUG LINE (इथे add करायचं)
  console.log("DATA:", searchData);

  // 👉 STEP 3: UI build
  buildSummaryBar();

  setTimeout(function() {
    currentFlights = getFlightsForDest(searchData.to);
    renderFlights(currentFlights);

    var pending = SW.get('pendingFlightId');
    if (pending && currentUser) {
      SW.del('pendingFlightId');
      selectFlight(pending);
    }

  }, 700);
});