/* payment.js */
var totalAmount = 0;
var discountApplied = 0;

function buildFareSummary() {
  var flight = SW.get('selectedFlight') || {};
  var sd = SW.get('searchData') || {};
  var pax = sd.total || 1;
  var cls = sd.cls || 'Economy';
  var multi = cls === 'Business' ? 2.2 : cls === 'First Class' ? 3.5 : 1;
  var base = Math.round((flight.price || 2000) * multi) * pax;
  var tax = 450 * pax;
  var conv = 99;
  totalAmount = base + tax + conv - discountApplied;
  var disc = flight.disc ? Math.round(base * (flight.disc / 100) * 0.15) : 0;
  discountApplied = disc;
  totalAmount = base + tax + conv - disc;

  document.getElementById('fare-pax-lbl').textContent = cls + ' × ' + pax;
  document.getElementById('fare-base').textContent = '₹' + base.toLocaleString('en-IN');
  document.getElementById('fare-tax').textContent = '₹' + (tax).toLocaleString('en-IN');
  document.getElementById('fare-disc').textContent = '−₹' + disc.toLocaleString('en-IN');
  document.getElementById('fare-total').textContent = '₹' + totalAmount.toLocaleString('en-IN');
  document.getElementById('payBtnAmt').textContent = '₹' + totalAmount.toLocaleString('en-IN');

  var earn = Math.floor(totalAmount / 10);
  document.getElementById('pts-earn').textContent = '+' + earn + ' pts';

  // Flight info summary
  var paxList = SW.get('passengers') || [];
  var paxName = paxList.length ? paxList[0].fn + ' ' + paxList[0].ln : 'Passenger';
  document.getElementById('pay-flight-info').innerHTML =
    '✈ ' + (flight.fno||'–') + ' · ' + (flight.airline||'') + '<br>' +
    'KOP → ' + (flight.to||'–').replace('2','') + ' · ' + (flight.dep||'–') + ' – ' + (flight.arr||'–') + '<br>' +
    'Date: ' + formatDate((sd.dep||'')) + '<br>' +
    'Passenger: ' + paxName + '<br>' +
    'Seat: ' + (SW.get('seat')||'Auto') + ' · Meal: ' + (SW.get('meal')||'Standard');
}

function switchPm(mode, btn) {
  document.querySelectorAll('.pm-tab').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.pm-form').forEach(function(f) { f.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('pm-' + mode).classList.add('active');
  if (mode === 'emi') buildEmiOptions();
}

function buildEmiOptions() {
  var opts = document.getElementById('emiOpts');
  var banks = [
    { name: 'HDFC Bank', m: 3, rate: 14 },
    { name: 'ICICI Bank', m: 6, rate: 13 },
    { name: 'SBI Card', m: 9, rate: 12 },
    { name: 'Axis Bank', m: 12, rate: 11 }
  ];
  opts.innerHTML = banks.map(function(b) {
    var monthly = Math.round(totalAmount * (1 + b.rate/100) / b.m);
    return '<div class="emi-opt" onclick="this.classList.toggle(\'sel\')">' +
      '<div><div class="emi-mo">' + b.name + ' — ' + b.m + ' months</div><div class="emi-det">@ ' + b.rate + '% p.a.</div></div>' +
      '<div class="emi-amt">₹' + monthly.toLocaleString('en-IN') + '/mo</div>' +
    '</div>';
  }).join('');
}

function selUpi(el, id) {
  document.querySelectorAll('.upi-opt').forEach(function(o) { o.classList.remove('sel'); });
  el.classList.add('sel');
}

function applyPromo() {
  var code = (document.getElementById('promoCode').value || '').trim().toUpperCase();
  var promos = { 'KOLHAPUR10': 0.10, 'SKYWAY15': 0.15, 'SUMMER20': 0.20, 'INDIGO5': 0.05 };
  if (promos[code]) {
    var saving = Math.round(totalAmount * promos[code]);
    discountApplied += saving;
    totalAmount -= saving;
    document.getElementById('fare-disc').textContent = '−₹' + discountApplied.toLocaleString('en-IN');
    document.getElementById('fare-total').textContent = '₹' + totalAmount.toLocaleString('en-IN');
    document.getElementById('payBtnAmt').textContent = '₹' + totalAmount.toLocaleString('en-IN');
    showToast('fa-solid fa-tag','var(--green)','Promo Applied','Saved ₹' + saving.toLocaleString('en-IN') + ' with ' + code,3000);
  } else {
    showToast('fa-solid fa-circle-xmark','var(--red)','Invalid Promo','Code not found. Try: KOLHAPUR10',3000);
  }
}

function redeemPoints() {
  showToast('fa-solid fa-star','var(--green)','SkyPoints Applied','357 pts = ₹35 discount added.',3000);
  discountApplied += 35; totalAmount -= 35;
  document.getElementById('fare-disc').textContent = '−₹' + discountApplied.toLocaleString('en-IN');
  document.getElementById('fare-total').textContent = '₹' + totalAmount.toLocaleString('en-IN');
  document.getElementById('payBtnAmt').textContent = '₹' + totalAmount.toLocaleString('en-IN');
  document.getElementById('pts-red').textContent = '₹35';
}

function fmtCard(inp) {
  var v = inp.value.replace(/\D/g,'').substring(0,16);
  inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

// ---- PAYMENT PROCESSING FLOW ----
function processPayment() {
  var overlay = document.getElementById('payProcessOverlay');
  overlay.style.display = 'flex';
  var steps = [0,1,2,3,4];
  var msgs = ['Connecting to gateway…','Verifying credentials…','Processing payment…','Confirming with airline…','Generating PNR…'];
  var fill = document.getElementById('payProgFill');
  var txt = document.getElementById('payProgTxt');
  var idx = 0;

  function runStep() {
    if (idx >= steps.length) {
      fill.style.width = '100%';
      setTimeout(showSuccess, 600);
      return;
    }
    var stepEl = document.getElementById('ps-' + idx);
    stepEl.classList.add('active');
    txt.textContent = msgs[idx];
    fill.style.width = ((idx + 1) / steps.length * 100) + '%';
    setTimeout(function() {
      stepEl.classList.remove('active');
      stepEl.classList.add('done');
      idx++;
      runStep();
    }, 900);
  }
  runStep();
}

function showSuccess() {
  document.getElementById('payProcessOverlay').style.display = 'none';
  var txn = 'TXN' + Date.now().toString().slice(-9);
  document.getElementById('pss-txn-id').textContent = txn;
  SW.set('txnId', txn);
  SW.set('totalPaid', totalAmount);
  // Generate PNR
  var pnr = genPNR();
  SW.set('pnr', pnr);
  launchConfetti();
  document.getElementById('paySuccessScreen').style.display = 'flex';

  // Save booking to PHP backend
  var flight = SW.get('selectedFlight') || {};
  var paxList = SW.get('passengers') || [];
  var sd = SW.get('searchData') || {};
  var bookingData = {
    pnr: pnr, txnId: txn,
    flight: flight.fno, airline: flight.airline,
    from: 'KOP', to: (flight.to||'').replace('2',''),
    dep: flight.dep, arr: flight.arr, date: sd.dep,
    time: flight.dep || '—',
    passenger: paxList[0] ? paxList[0].fn + ' ' + paxList[0].ln : 'Passenger',
    name: paxList[0] ? paxList[0].fn + ' ' + paxList[0].ln : 'Passenger',
    email: paxList[0] ? paxList[0].email : '',
    phone: paxList[0] ? paxList[0].phone : '—',
    seat: SW.get('seat') || 'Auto',
    meal: SW.get('meal') || 'Standard',
    amount: totalAmount,
    fare: totalAmount,
    pax: sd.total || paxList.length || 1,
    cls: sd.cls || 'Economy',
    allPassengers: paxList,
    status: 'Confirmed'
  };
  SW.set('lastBooking', bookingData);
  SW.set('searchData', sd); // ensure searchData persisted
  // Append to bookings log (admin dashboard reads this in real-time)
  var log = SW.get('bookingsLog') || [];
  log.push(bookingData);
  SW.set('bookingsLog', log);
  // Dispatch custom event for live admin updates
  try { window.dispatchEvent(new CustomEvent('skyway:newbooking', {detail: bookingData})); } catch(e){}

  // POST to PHP backend (non-blocking)
  fetch('backend/api/booking.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  }).catch(function() {});
}

function launchConfetti() {
  var wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  var colors = ['#38bdf8','#22c55e','#f59e0b','#ef4444','#a855f7'];
  for (var i = 0; i < 60; i++) {
    var c = document.createElement('div');
    var color = colors[Math.floor(Math.random() * colors.length)];
    var left = Math.random() * 100;
    var delay = Math.random() * 1.5;
    c.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;background:' + color + ';left:' + left + '%;top:-10px;animation:confettiFall 2.5s ' + delay + 's ease-in forwards;';
    wrap.appendChild(c);
  }
  if (!document.getElementById('confettiStyle')) {
    var s = document.createElement('style');
    s.id = 'confettiStyle';
    s.textContent = '@keyframes confettiFall{to{top:110%;transform:rotate(720deg);opacity:0;}}';
    document.head.appendChild(s);
  }
}

function proceedToBoarding() {
  window.location.href = 'boarding.html';
}

document.addEventListener('DOMContentLoaded', function() {
  if (!currentUser || !SW.get('selectedFlight')) { window.location.href = 'search.html'; return; }
  buildFareSummary();
});