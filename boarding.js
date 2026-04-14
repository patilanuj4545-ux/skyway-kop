/* ============================================================
   boarding.js — Multi-Passenger Boarding Pass Generator
   ============================================================ */
var DEST_NAMES = {
  KOP:'Kolhapur', BOM:'Mumbai', NMB:'Navi Mumbai',
  HYD:'Hyderabad', HYD2:'Hyderabad', BLR:'Bengaluru',
  BLR2:'Bengaluru', NAG:'Nagpur', AHN:'Ahmednagar', GOI:'Goa'
};

var currentPassIndex = 0;
var allPassengers = [];
var flightData = {};
var bookingData = {};
var searchData = {};
var allSeats = [];

function computeBoardingTime(dep) {
  if (!dep) return '—';
  var parts = dep.split(':');
  var h = parseInt(parts[0]), m = parseInt(parts[1]) - 35;
  if (m < 0) { h--; m += 60; }
  if (h < 0) h += 24;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

function generateBarcode() {
  var bars = '';
  for (var i = 0; i < 60; i++) { bars += (Math.random() > 0.5 ? '█' : ' '); }
  return bars + '\n' + bars.split('').reverse().join('');
}

function getSeatForPassenger(idx) {
  // Try to get individual seat from passenger data or generate one
  var stored = allSeats[idx];
  if (stored) return stored;
  var rows = ['12','14','16','18','20','22','24','26','28','30'];
  var cols = ['A','B','C','D','E','F'];
  return rows[idx % rows.length] + cols[Math.floor(idx / rows.length) % cols.length];
}

function buildPassengerTabs() {
  var tabsEl = document.getElementById('boardingTabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';

  if (allPassengers.length <= 1) {
    tabsEl.style.display = 'none';
    return;
  }

  tabsEl.style.display = 'flex';
  allPassengers.forEach(function(pax, idx) {
    var btn = document.createElement('button');
    btn.className = 'bp-tab-btn' + (idx === 0 ? ' active' : '');
    btn.innerHTML = '<i class="fa-solid fa-user"></i> ' +
      (pax.fn || 'Passenger ' + (idx+1)) +
      (idx === 0 ? ' <span class="bp-lead-tag">Lead</span>' : '');
    btn.setAttribute('data-idx', idx);
    btn.onclick = (function(i){ return function(){ switchBoardingPass(i); }; })(idx);
    tabsEl.appendChild(btn);
  });

  // Passenger counter badge
  var counter = document.createElement('div');
  counter.className = 'bp-pax-counter';
  counter.innerHTML = '<i class="fa-solid fa-users"></i> ' + allPassengers.length + ' Passengers — Individual Boarding Passes';
  tabsEl.parentNode.insertBefore(counter, tabsEl);
}

function switchBoardingPass(idx) {
  currentPassIndex = idx;
  document.querySelectorAll('.bp-tab-btn').forEach(function(b, i) {
    b.classList.toggle('active', i === idx);
  });
  renderBoardingPass(idx);
}

function renderBoardingPass(idx) {
  var pax = allPassengers[idx] || {};
  var pnr = bookingData.pnr || SW.get('pnr') || genPNR();
  // Each passenger gets a unique sub-PNR
  var paxPNR = pnr + (idx > 0 ? '-' + String.fromCharCode(65 + idx) : '');
  var seat = getSeatForPassenger(idx);
  var meal = bookingData.meal || SW.get('meal') || 'Standard';
  var toCode = (flightData.to || 'BOM').replace('2','');
  var toName = DEST_NAMES[flightData.to] || toCode;
  var depTime = flightData.dep || '07:00';
  var boardTime = computeBoardingTime(depTime);
  var passengerName = pax.fn ? (pax.fn + ' ' + pax.ln).toUpperCase() : 'PASSENGER ' + (idx+1);
  var dateStr = formatDate(searchData.dep || bookingData.date || '');
  var cls = (searchData.cls || 'Economy').toUpperCase();
  var gate = 'T1 / G' + (Math.floor(idx * 3 + 2) % 6 + 1);
  var zone = seat && seat[0] <= '15' ? 'A' : 'B';

  // Main ticket
  document.getElementById('tk-airline').textContent = flightData.airline || 'SkyWay';
  document.getElementById('tk-class-badge').textContent = cls;
  document.getElementById('tk-from').textContent = 'KOP';
  document.getElementById('tk-to').textContent = toCode;
  document.getElementById('tk-to-name').textContent = toName;
  document.getElementById('tk-dur').textContent = flightData.dur || '—';
  document.getElementById('tk-pax').textContent = passengerName;
  document.getElementById('tks-pax').textContent = passengerName;
  document.getElementById('tk-flt').textContent = flightData.fno || '—';
  document.getElementById('tks-flt').textContent = flightData.fno || '—';
  document.getElementById('tk-date').textContent = dateStr;
  document.getElementById('tks-date').textContent = dateStr;
  document.getElementById('tk-dep').textContent = depTime;
  document.getElementById('tk-arr').textContent = flightData.arr || '—';
  document.getElementById('tk-gate').textContent = gate;
  document.getElementById('tk-seat').textContent = seat;
  document.getElementById('tks-seat').textContent = seat;
  document.getElementById('tk-meal').textContent = meal;
  document.getElementById('tk-zone').textContent = zone;
  document.getElementById('tks-board').textContent = boardTime;
  document.getElementById('tk-pnr').textContent = 'PNR: ' + paxPNR;

  // Passenger number indicator
  var paxNumEl = document.getElementById('tk-pax-num');
  if (paxNumEl) {
    paxNumEl.textContent = 'Passenger ' + (idx+1) + ' of ' + allPassengers.length;
    paxNumEl.style.display = allPassengers.length > 1 ? '' : 'none';
  }

  // Barcode
  document.getElementById('tk-barcode').textContent = generateBarcode();

  // QR
  var qrData = 'PNR:' + paxPNR + '|FLT:' + (flightData.fno||'') + '|PAX:' + passengerName +
    '|FROM:KOP|TO:' + toCode + '|DATE:' + (searchData.dep||'') + '|SEAT:' + seat + '|GATE:' + gate;
  document.getElementById('tk-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=' + encodeURIComponent(qrData);

  // Navigation arrows for multi-pax
  updateNavArrows(idx);

  // Share buttons
  setupShareButtons(pax, paxPNR, toCode, toName, depTime, seat, dateStr, meal);
}

function updateNavArrows(idx) {
  var prevBtn = document.getElementById('bp-prev');
  var nextBtn = document.getElementById('bp-next');
  if (!prevBtn || !nextBtn) return;
  if (allPassengers.length <= 1) {
    prevBtn.style.display = 'none'; nextBtn.style.display = 'none'; return;
  }
  prevBtn.style.display = '';
  nextBtn.style.display = '';
  prevBtn.disabled = (idx === 0);
  nextBtn.disabled = (idx === allPassengers.length - 1);
  prevBtn.style.opacity = (idx === 0) ? '0.3' : '1';
  nextBtn.style.opacity = (idx === allPassengers.length - 1) ? '0.3' : '1';
}

function setupShareButtons(pax, pnr, toCode, toName, depTime, seat, dateStr, meal) {
  var waBtn = document.getElementById('waShareBtn');
  var emBtn = document.getElementById('emailShareBtn');
  if (waBtn) {
    waBtn.onclick = function() {
      var name = pax.fn ? pax.fn + ' ' + pax.ln : 'Passenger';
      var msg = '✈ SkyWay Boarding Pass\nPassenger: ' + name.toUpperCase() + '\nPNR: ' + pnr +
        '\nFlight: ' + (flightData.fno||'') + '\nRoute: KOP → ' + toCode +
        '\nDate: ' + dateStr + '\nSeat: ' + seat + '\n\nHave a safe journey! 🙏';
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    };
  }
  if (emBtn) {
    emBtn.onclick = function() {
      var subj = 'Your SkyWay Boarding Pass — ' + (flightData.fno||'') + ' | PNR: ' + pnr;
      var body = 'Dear ' + (pax.fn||'Passenger') + ',\n\nYour boarding pass details:\n\nPNR: ' + pnr +
        '\nFlight: ' + (flightData.fno||'') + '\nRoute: Kolhapur (KOP) → ' + toName + ' (' + toCode + ')' +
        '\nDate: ' + dateStr + '\nDeparture: ' + depTime + '\nSeat: ' + seat + '\nMeal: ' + meal +
        '\n\nGate closes 25 minutes before departure.\n\nHave a safe journey!\nSkyWay · Kolhapur Airport';
      window.location.href = 'mailto:' + (pax.email||allPassengers[0].email||'') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    };
  }
}

function buildAllBoardingPasses() {
  buildPassengerTabs();
  renderBoardingPass(0);

  // Show/hide nav controls
  var navEl = document.getElementById('bp-nav-row');
  if (navEl) navEl.style.display = allPassengers.length > 1 ? 'flex' : 'none';

  // Update success heading
  if (allPassengers.length > 1) {
    var hEl = document.querySelector('.tk-head h2');
    var pEl = document.querySelector('.tk-head p');
    if (hEl) hEl.textContent = 'Booking Confirmed! 🎉 ' + allPassengers.length + ' Boarding Passes';
    if (pEl) pEl.textContent = 'Individual boarding passes generated for each passenger. Use tabs or arrows to switch.';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  flightData  = SW.get('selectedFlight') || {};
  bookingData = SW.get('lastBooking') || {};
  searchData  = SW.get('searchData') || {};
  allPassengers = SW.get('passengers') || [];
  // Build seat list
  var baseSeat = bookingData.seat || SW.get('seat') || '14A';
  var seatLetters = ['A','B','C','D','E','F'];
  var seatRow = parseInt(baseSeat) || 14;
  allSeats = allPassengers.map(function(_, i) {
    return (seatRow + i) + seatLetters[i % 6];
  });

  buildAllBoardingPasses();

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' && currentPassIndex < allPassengers.length - 1) switchBoardingPass(currentPassIndex + 1);
    if (e.key === 'ArrowLeft' && currentPassIndex > 0) switchBoardingPass(currentPassIndex - 1);
  });
});