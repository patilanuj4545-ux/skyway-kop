/* passenger.js */
var selectedSeat = '';
var selectedMeal = 'Standard';
var passNum = 1;
var activePaxTab = 1;

var TAKEN_SEATS = ['1A','2B','3C','4E','5F','6A','7D','8C','9B','10E','11A','12F','13D','14C','15B','16E','17A','18F','19D','20C','21B','22A','23E','24F','25D','26B','27C','28A','29E','30F'];

function buildItinerary(flight) {
  if (!flight) return;
  var DEST = { KOP:'Kolhapur', BOM:'Mumbai', NMB:'Navi Mumbai', HYD:'Hyderabad', HYD2:'Hyderabad', BLR:'Bengaluru', BLR2:'Bengaluru', NAG:'Nagpur', AHN:'Ahmednagar', GOI:'Goa' };
  document.getElementById('it-dep').textContent = flight.dep || '—';
  document.getElementById('it-arr').textContent = flight.arr || '—';
  document.getElementById('it-dur').textContent = flight.dur || '—';
  document.getElementById('it-dap').textContent = 'KOP · Kolhapur';
  document.getElementById('it-aap').textContent = (flight.to||'').replace('2','') + ' · ' + (DEST[flight.to]||'');
  document.getElementById('it-meta').innerHTML =
    '<span><i class="fa-solid fa-plane" style="color:var(--sky);margin-right:5px;"></i>' + (flight.fno||'') + '</span> &nbsp;·&nbsp; ' +
    '<span><i class="fa-solid fa-calendar" style="color:var(--sky);margin-right:5px;"></i>' + formatDate((SW.get('searchData')||{}).dep||'') + '</span> &nbsp;·&nbsp; ' +
    '<span><i class="fa-solid fa-users" style="color:var(--sky);margin-right:5px;"></i>' + ((SW.get('searchData')||{}).total||1) + ' Pax</span>';
}

function buildFlightSummary(flight) {
  var DEST = { KOP:'Kolhapur', BOM:'Mumbai', NMB:'Navi Mumbai', HYD:'Hyderabad', HYD2:'Hyderabad', BLR:'Bengaluru', BLR2:'Bengaluru', NAG:'Nagpur', AHN:'Ahmednagar', GOI:'Goa' };
  if (!flight) return;
  document.getElementById('fs-route').textContent = 'KOP → ' + (flight.to||'').replace('2','') + '  |  ' + (flight.fno||'');
  document.getElementById('fs-detail').textContent = flight.airline + ' · ' + flight.dep + ' – ' + flight.arr + ' · ' + flight.dur;
  document.getElementById('fs-badge').textContent = (SW.get('searchData')||{}).cls || 'Economy';
}

function buildPaxTabs() {
  var sd = SW.get('searchData') || {};
  passNum = (sd.total || 1);
  var tabs = document.getElementById('paxTabs');
  tabs.innerHTML = '';
  for (var i = 1; i <= passNum; i++) {
    var btn = document.createElement('button');
    btn.className = 'pt-btn' + (i === 1 ? ' active' : '');
    btn.textContent = 'Passenger ' + i + (i === 1 ? ' (Lead)' : '');
    btn.setAttribute('data-pax', i);
    btn.onclick = (function(idx) { return function() { switchPaxTab(idx, this); }; })(i);
    tabs.appendChild(btn);
  }
  buildPaxForms();
  showPaxForm(1);
}

function buildPaxForms() {
  var container = document.getElementById('paxForms');
  container.innerHTML = '';
  for (var i = 1; i <= passNum; i++) {
    var div = document.createElement('div');
    div.id = 'pf-pax-' + i;
    div.style.display = i === 1 ? '' : 'none';
    div.innerHTML =
      '<div class="pf-grid">' +
        '<div class="pf-field"><label>First Name *</label><input type="text" id="p' + i + '-fn" placeholder="First name"></div>' +
        '<div class="pf-field"><label>Last Name *</label><input type="text" id="p' + i + '-ln" placeholder="Last name"></div>' +
        '<div class="pf-field"><label>Gender</label><select id="p' + i + '-gen"><option>Male</option><option>Female</option><option>Other</option></select></div>' +
        '<div class="pf-field"><label>Date of Birth</label><input type="date" id="p' + i + '-dob"></div>' +
        '<div class="pf-field"><label>Aadhaar No. *</label><input type="text" id="p' + i + '-aadhaar" placeholder="12-digit Aadhaar" maxlength="14" oninput="fmtAadhaar(this)"></div>' +
        '<div class="pf-field"><label>Nationality</label><select id="p' + i + '-nat"><option>Indian</option><option>Other</option></select></div>' +
        (i === 1 ? '<div class="pf-field"><label>Phone *</label><input type="tel" id="p1-ph" placeholder="+91 99999 99999"></div><div class="pf-field"><label>Email *</label><input type="email" id="p1-em" placeholder="your@email.com"></div>' : '') +
      '</div>';
    container.appendChild(div);
  }
}

function switchPaxTab(idx, btn) {
  document.querySelectorAll('.pt-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  showPaxForm(idx);
}
function showPaxForm(idx) {
  for (var i = 1; i <= passNum; i++) {
    var el = document.getElementById('pf-pax-' + i);
    if (el) el.style.display = i === idx ? '' : 'none';
  }
}

function fmtAadhaar(inp) {
  var v = inp.value.replace(/\D/g,'').substring(0,12);
  inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

// SEAT MAP
function buildSeatMap() {
  var wrap = document.getElementById('seatMap');
  var cols = ['A','B','C','D','E','F'];
  var rows = 30;
  var cabin = document.createElement('div');
  cabin.className = 'seat-cabin';

  // Header
  var hRow = document.createElement('div');
  hRow.className = 'seat-row';
  hRow.innerHTML = '<div class="seat-row-num"></div>';
  ['A','B','C'].forEach(function(c) { hRow.innerHTML += '<div style="width:28px;text-align:center;font-size:9px;color:var(--muted);">' + c + '</div>'; });
  hRow.innerHTML += '<div class="seat-aisle"></div>';
  ['D','E','F'].forEach(function(c) { hRow.innerHTML += '<div style="width:28px;text-align:center;font-size:9px;color:var(--muted);">' + c + '</div>'; });
  cabin.appendChild(hRow);

  for (var r = 1; r <= rows; r++) {
    var row = document.createElement('div');
    row.className = 'seat-row';
    row.innerHTML = '<div class="seat-row-num">' + r + '</div>';
    cols.forEach(function(c, ci) {
      if (ci === 3) row.innerHTML += '<div class="seat-aisle"></div>';
      var seatId = r + c;
      var isTaken = TAKEN_SEATS.indexOf(seatId) !== -1;
      row.innerHTML += '<button class="seat-btn ' + (isTaken ? 'taken' : 'avail') + '" ' +
        (isTaken ? 'disabled' : 'onclick="selectSeat(\'' + seatId + '\',this)"') +
        ' title="Seat ' + seatId + '">' + (r <= 6 ? '⭐' : seatId) + '</button>';
    });
    cabin.appendChild(row);
  }
  wrap.innerHTML = '';
  wrap.appendChild(cabin);
}

function selectSeat(id, btn) {
  document.querySelectorAll('.seat-btn.chosen').forEach(function(b) { b.classList.remove('chosen'); b.classList.add('avail'); });
  btn.classList.remove('avail');
  btn.classList.add('chosen');
  selectedSeat = id;
  document.getElementById('selectedSeatDisplay').textContent = 'Seat ' + id;
  showToast('fa-solid fa-chair','var(--sky)','Seat Selected','Seat ' + id + ' reserved for you.',2000);
}

function selMeal(el, meal) {
  document.querySelectorAll('.meal-opt').forEach(function(m) { m.classList.remove('selected'); });
  el.classList.add('selected');
  selectedMeal = meal;
}

// VALIDATION
function validatePaxForms() {
  for (var i = 1; i <= passNum; i++) {
    var fn = document.getElementById('p' + i + '-fn');
    var ln = document.getElementById('p' + i + '-ln');
    var aadhaar = document.getElementById('p' + i + '-aadhaar');
    if (!fn || !fn.value.trim() || fn.value.trim().length < 2) {
      fn.classList.add('error');
      showToast('fa-solid fa-circle-exclamation','var(--red)','Validation Error','Passenger ' + i + ': Enter a valid first name.',3000);
      switchPaxTab(i, document.querySelector('[data-pax="' + i + '"]'));
      fn.focus(); return false;
    } else { fn.classList.remove('error'); fn.classList.add('valid'); }
    if (!ln || !ln.value.trim() || ln.value.trim().length < 2) {
      ln.classList.add('error');
      showToast('fa-solid fa-circle-exclamation','var(--red)','Validation Error','Passenger ' + i + ': Enter a valid last name.',3000);
      ln.focus(); return false;
    } else { ln.classList.remove('error'); ln.classList.add('valid'); }
    if (aadhaar) {
      var av = aadhaar.value.replace(/\s/g,'');
      if (av.length !== 12) {
        aadhaar.classList.add('error');
        showToast('fa-solid fa-circle-exclamation','var(--red)','Validation Error','Passenger ' + i + ': Aadhaar must be 12 digits.',3000);
        aadhaar.focus(); return false;
      } else { aadhaar.classList.remove('error'); aadhaar.classList.add('valid'); }
    }
    if (i === 1) {
      var ph = document.getElementById('p1-ph');
      var em = document.getElementById('p1-em');
      if (ph && ph.value.replace(/[\s\-\+]/g,'').length < 10) {
        ph.classList.add('error');
        showToast('fa-solid fa-circle-exclamation','var(--red)','Validation Error','Enter a valid 10-digit phone number.',3000);
        ph.focus(); return false;
      }
      if (em && (!em.value.includes('@') || !em.value.includes('.'))) {
        em.classList.add('error');
        showToast('fa-solid fa-circle-exclamation','var(--red)','Validation Error','Enter a valid email address.',3000);
        em.focus(); return false;
      }
    }
  }
  return true;
}

function proceedToPayment() {
  if (!validatePaxForms()) return;
  // Collect passengers
  var paxData = [];
  for (var i = 1; i <= passNum; i++) {
    var fn = document.getElementById('p' + i + '-fn');
    var ln = document.getElementById('p' + i + '-ln');
    var ph = i === 1 ? document.getElementById('p1-ph') : null;
    var em = i === 1 ? document.getElementById('p1-em') : null;
    var gen = document.getElementById('p' + i + '-gen');
    paxData.push({
      fn: fn ? fn.value.trim() : '',
      ln: ln ? ln.value.trim() : '',
      phone: ph ? ph.value.trim() : '',
      email: em ? em.value.trim() : '',
      gender: gen ? gen.value : 'Male'
    });
  }
  SW.set('passengers', paxData);
  SW.set('seat', selectedSeat || 'Auto');
  SW.set('meal', selectedMeal);
  window.location.href = 'biometric.html';
}

document.addEventListener('DOMContentLoaded', function() {
  if (!currentUser) { window.location.href = 'search.html'; return; }
  var flight = SW.get('selectedFlight');
  buildFlightSummary(flight);
  buildItinerary(flight);
  buildPaxTabs();
  buildSeatMap();
});