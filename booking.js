/* bookings.js */
var allBookings = [];
var cancelPnr = '';

function loadBookings() {
  // Load from session storage
  var log = SW.get('bookingsLog') || [];
  allBookings = log;

  // Try to fetch from PHP backend too
  fetch('backend/api/get_bookings.php' + (currentUser ? '?email=' + encodeURIComponent(currentUser.email) : ''))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.bookings && data.bookings.length) {
        // Merge with session bookings (de-duplicate by PNR)
        data.bookings.forEach(function(b) {
          var exists = allBookings.find(function(x) { return x.pnr === b.pnr; });
          if (!exists) allBookings.push(b);
        });
        renderBookings(allBookings);
      }
    })
    .catch(function() { /* PHP not running, use session data */ });

  renderBookings(allBookings);
}

function filterBookings(status, btn) {
  document.querySelectorAll('.mb-tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  if (status === 'all') renderBookings(allBookings);
  else renderBookings(allBookings.filter(function(b) { return (b.status||'').toLowerCase() === status; }));
}

function renderBookings(list) {
  var container = document.getElementById('mbContent');
  if (!list || !list.length) {
    container.innerHTML = '<div class="mb-empty"><i class="fa-solid fa-ticket-simple"></i><p>No bookings yet. Book a flight to see it here!</p><a href="search.html" class="btn-pri" style="margin:0 auto;display:inline-flex;"><i class="fa-solid fa-magnifying-glass"></i> Search Flights</a></div>';
    return;
  }
  container.innerHTML = list.slice().reverse().map(function(b, idx) {
    var isConfirmed = (b.status || 'Confirmed') === 'Confirmed';
    return '<div class="mb-card" style="animation-delay:' + (idx * 0.07) + 's">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<div class="mb-pnr">' + (b.pnr||'—') + '</div>' +
        '<div class="mb-status ' + (isConfirmed ? 'mb-confirmed' : 'mb-cancelled') + '">' + (b.status||'Confirmed') + '</div>' +
      '</div>' +
      '<div class="mb-route">✈ KOP → ' + (b.to||'?') + ' &nbsp;<span style="font-size:12px;color:var(--muted);">' + (b.flight||'') + '</span></div>' +
      '<div class="mb-meta">' +
        '<span><i class="fa-solid fa-calendar"></i>' + (formatDate(b.date)||'—') + '</span>' +
        '<span><i class="fa-solid fa-chair"></i>Seat ' + (b.seat||'Auto') + '</span>' +
        '<span><i class="fa-solid fa-utensils"></i>' + (b.meal||'Standard') + '</span>' +
        '<span><i class="fa-solid fa-indian-rupee-sign"></i>' + (b.amount ? b.amount.toLocaleString('en-IN') : '—') + '</span>' +
        (b.txnId ? '<span><i class="fa-solid fa-receipt"></i>' + b.txnId + '</span>' : '') +
      '</div>' +
      '<div class="mb-actions">' +
        (isConfirmed ?
          '<button class="mb-btn mb-btn-cancel" onclick="openCancelModal(\'' + b.pnr + '\')"><i class="fa-solid fa-ban"></i> Cancel</button>' +
          '<button class="mb-btn" onclick="changeDate(\'' + b.pnr + '\')"><i class="fa-solid fa-calendar-pen"></i> Change Date</button>'
          : '') +
        '<button class="mb-btn" onclick="viewDetails(\'' + b.pnr + '\')"><i class="fa-solid fa-eye"></i> Details</button>' +
        (isConfirmed ? '<a class="mb-btn" href="boarding.html"><i class="fa-solid fa-ticket-simple"></i> View Pass</a>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function openCancelModal(pnr) {
  cancelPnr = pnr;
  var modal = document.getElementById('cancelModal');
  modal.style.display = 'flex';
  document.getElementById('confirmCancelBtn').onclick = function() { doCancel(pnr); };
}
function closeCancelModal() {
  document.getElementById('cancelModal').style.display = 'none';
  cancelPnr = '';
}

function doCancel(pnr) {
  allBookings.forEach(function(b) {
    if (b.pnr === pnr) { b.status = 'Cancelled'; b.cancelDate = new Date().toLocaleDateString('en-GB'); }
  });
  SW.set('bookingsLog', allBookings);
  closeCancelModal();
  renderBookings(allBookings);
  showToast('fa-solid fa-ban','var(--red)','Booking Cancelled','PNR ' + pnr + ' cancelled. Refund in 5–7 business days.',4000);

  // POST to PHP backend
  fetch('backend/api/cancel_booking.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr: pnr })
  }).catch(function() {});
}

function changeDate(pnr) {
  var nd = prompt('Enter new travel date (YYYY-MM-DD):');
  if (!nd) return;
  allBookings.forEach(function(b) { if (b.pnr === pnr) { b.date = nd; b.dateChanged = true; } });
  SW.set('bookingsLog', allBookings);
  renderBookings(allBookings);
  showToast('fa-solid fa-calendar-check','var(--sky)','Date Changed','PNR ' + pnr + ' updated. Change fee ₹500 applied.',3500);
}

function viewDetails(pnr) {
  var b = allBookings.find(function(x) { return x.pnr === pnr; });
  if (!b) return;
  alert(
    'PNR: ' + b.pnr +
    '\nPassenger: ' + (b.passenger||'—') +
    '\nFlight: ' + (b.flight||'—') +
    '\nRoute: KOP → ' + (b.to||'—') +
    '\nDate: ' + (b.date||'—') +
    '\nSeat: ' + (b.seat||'Auto') +
    '\nMeal: ' + (b.meal||'Standard') +
    '\nAmount: ₹' + (b.amount||'—') +
    '\nTxn ID: ' + (b.txnId||'—') +
    '\nStatus: ' + (b.status||'Confirmed')
  );
}

function doLoginAndRefresh() {
  doLogin();
  setTimeout(function() {
    if (currentUser) { closeLoginModal(); loadBookings(); document.getElementById('mbUserInfo').textContent = 'Logged in as: ' + currentUser.name; }
  }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
  if (!currentUser) {
    openLoginModal();
    document.getElementById('mbContent').innerHTML = '<div class="mb-empty"><i class="fa-solid fa-lock"></i><p>Please login to view your bookings.</p></div>';
    return;
  }
  document.getElementById('mbUserInfo').textContent = 'Logged in as: ' + currentUser.name;
  loadBookings();
});