
/* ============================================================
   shared.js — Kolhapur Airport SkyWay Booking Portal
   Common utilities: auth, nav, toast, chat, state helpers
   ============================================================ */

// ============================================================
// STATE (persisted via sessionStorage)
// ============================================================
var SW = {
  get: function(k) {
    try { return JSON.parse(sessionStorage.getItem('sw_' + k)); } catch(e) { return null; }
  },
  set: function(k, v) {
    try { sessionStorage.setItem('sw_' + k, JSON.stringify(v)); } catch(e) {}
  },
  del: function(k) { sessionStorage.removeItem('sw_' + k); }
};


// ============================================================
// CURRENT USER
// ============================================================
var currentUser = SW.get('user') || null;

function setUser(u) {
  currentUser = u;
  SW.set('user', u);
  renderAuthArea();
}
function logout() {
  currentUser = null;
  SW.del('user');
  renderAuthArea();
  closeAcctDrop();
  window.location.href = 'index.html';
}

function renderAuthArea() {
  var wrap = document.getElementById('authArea');
  if (!wrap) return;
  
  // Account dropdown (always shown, left of Login/Signup - matches reference)
  var acctHtml = '<div class="acct-wrap">' +
    '<button class="acct-btn" onclick="toggleAcctDrop()"><i class="fa-solid fa-table-cells-large"></i> Account <i class="fa-solid fa-chevron-down" style="font-size:9px;"></i></button>' +
    '<div class="acct-drop" id="acctDrop">' +
      '<button class="adi" onclick="openAccountPopup(\'offers\')" ><i class="fa-solid fa-gift"></i> My Offers & Rewards</button>' +
      '<button class="adi" onclick="openAccountPopup(\'airlines\')"><i class="fa-solid fa-plane"></i> About Airlines</button>' +
      '<button class="adi" onclick="openAccountPopup(\'cancel\')"  ><i class="fa-solid fa-ban"></i> Cancel Ticket</button>' +
      '<button class="adi" onclick="openAccountPopup(\'changedate\')"><i class="fa-solid fa-calendar-days"></i> Change Date</button>' +
      '<button class="adi" onclick="openAccountPopup(\'easybooking\')"><i class="fa-solid fa-bolt"></i> Easy Booking</button>' +
      '<button class="adi" onclick="openAccountPopup(\'payment\')"><i class="fa-solid fa-shield-halved"></i> Secure Payment</button>' +
      '<button class="adi" onclick="openAccountPopup(\'search\')"><i class="fa-solid fa-magnifying-glass"></i> Smart Search</button>' +
      '<div class="ad-div"></div>' +
      (currentUser ? '<button class="adi" onclick="window.location.href=\'bookings.html\'"><i class="fa-solid fa-ticket-simple"></i> My Bookings</button>' : '') +
      (currentUser ? '<button class="adi" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>' : '<button class="adi" onclick="openLoginModal();closeAcctDrop()"><i class="fa-solid fa-right-to-bracket"></i> Login / Sign Up</button>') +
    '</div>' +
  '</div>';

  if (currentUser) {
    wrap.innerHTML =
      acctHtml +
      '<div class="user-badge"><i class="fa-solid fa-circle-check"></i> ' + currentUser.name + '</div>' +
      '<button class="admin-btn" onclick="openAdminLogin()"><i class="fa-solid fa-user-shield"></i> Admin</button>';
  } else {
    wrap.innerHTML =
      acctHtml +
      '<button class="login-signup-btn" onclick="openLoginModal()">Login / Sign Up</button>' +
      '<button class="admin-btn" onclick="openAdminLogin()"><i class="fa-solid fa-user-shield"></i> Admin</button>';
  }
}
function toggleAcctDrop() {
  var d = document.getElementById('acctDrop');
  if (d) d.classList.toggle('open');
}
function closeAcctDrop() {
  var d = document.getElementById('acctDrop');
  if (d) d.classList.remove('open');
}

// ============================================================
// ACCOUNT POPUPS
// ============================================================
var ACCOUNT_CONTENT = {
  offers: {
    icon: 'fa-gift',
    title: 'My Offers & Rewards',
    html: '<div class="ap-section"><div class="ap-highlight"><i class="fa-solid fa-star" style="color:#f59e0b;"></i> <strong>Welcome Bonus!</strong> You have <span style="color:#38bdf8;font-weight:700;">500 SkyPoints</span> ready to redeem.</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-tag"></i> Active Promo Codes</h4>' +
      '<div class="ap-promo-list">' +
      '<div class="ap-promo"><span class="ap-code">KOLHAPUR10</span><span class="ap-desc">Extra 10% off on advance bookings (15+ days)</span></div>' +
      '<div class="ap-promo"><span class="ap-code">SUMMER25</span><span class="ap-desc">25% off on Summer travel (Apr–Jun 2026)</span></div>' +
      '<div class="ap-promo"><span class="ap-code">SKYWAY50</span><span class="ap-desc">Up to 50% off on select routes</span></div>' +
      '<div class="ap-promo"><span class="ap-code">FIRST100</span><span class="ap-desc">₹100 cashback on your first booking</span></div>' +
      '</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-trophy"></i> Loyalty Rewards Program</h4><p>Earn 1 SkyPoint for every ₹10 spent. Redeem points for free upgrades, priority boarding, and extra baggage allowance.</p>' +
      '<div class="ap-tiers"><div class="ap-tier silver"><i class="fa-solid fa-medal"></i> Silver<br><small>0–4,999 pts</small></div><div class="ap-tier gold"><i class="fa-solid fa-medal"></i> Gold<br><small>5,000–14,999 pts</small></div><div class="ap-tier platinum"><i class="fa-solid fa-gem"></i> Platinum<br><small>15,000+ pts</small></div></div></div>'
  },
  airlines: {
    icon: 'fa-plane',
    title: 'About Airlines',
    html: '<div class="ap-section"><h4><i class="fa-solid fa-plane" style="color:#1d4ed8;"></i> IndiGo (6E)</h4>' +
      '<p>India\'s largest airline with a market share of over 55%. Founded in 2006, IndiGo is known for affordable fares, on-time performance, and a young Airbus fleet.</p>' +
      '<ul class="ap-list"><li>✈ Routes from KOP: Hyderabad, Bengaluru, Navi Mumbai</li><li>🪑 Fleet: Airbus A320neo, A321neo</li><li>💼 Baggage: 15kg checked + 7kg cabin (Economy)</li><li>📞 Helpline: 0124-6173838</li><li>🌐 Website: www.goindigo.in</li></ul></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-plane" style="color:#dc2626;"></i> Star Air (S5)</h4>' +
      '<p>A premium regional airline operating Embraer ERJ-145 jets. Provides connectivity to tier-2 cities across India with business-class comfort at competitive prices.</p>' +
      '<ul class="ap-list"><li>✈ Routes from KOP: Mumbai, Nagpur, Hyderabad, Bengaluru, Goa, Ahmednagar</li><li>🪑 Fleet: Embraer ERJ-145 (50-seat regional jet)</li><li>💼 Baggage: 20kg checked + 7kg cabin</li><li>📞 Helpline: 1800-2100-700</li><li>🌐 Website: www.starair.in</li></ul></div>' +
      '<div class="ap-section"><div class="ap-info-note"><i class="fa-solid fa-circle-info"></i> Runway expansion to 2,300m underway — expected to attract more airlines by late 2026.</div></div>'
  },
  cancel: {
    icon: 'fa-ban',
    title: 'Cancel Ticket',
    html: '<div class="ap-section"><div class="ap-highlight warn"><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i> <strong>Before you cancel</strong> — review our refund policy below.</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-indian-rupee-sign"></i> Cancellation & Refund Policy</h4>' +
      '<div class="ap-policy-table"><div class="ap-policy-row header"><span>Time Before Departure</span><span>Refund Amount</span></div>' +
      '<div class="ap-policy-row"><span>More than 7 days</span><span class="good">75% refund</span></div>' +
      '<div class="ap-policy-row"><span>2–7 days</span><span class="warn">50% refund</span></div>' +
      '<div class="ap-policy-row"><span>Less than 24 hours</span><span class="bad">Credit shell only</span></div>' +
      '<div class="ap-policy-row"><span>No-show</span><span class="bad">No refund</span></div></div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-clock-rotate-left"></i> Refund Timeline</h4><p>Approved refunds are processed within <strong>5–7 business days</strong> to your original payment method (UPI, Card, or Wallet). Credit shell expires after 12 months.</p></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-steps"></i> How to Cancel</h4><ol class="ap-steps"><li>Go to <strong>My Bookings</strong> page</li><li>Find your booking using PNR number</li><li>Click <strong>Cancel Booking</strong> button</li><li>Confirm cancellation — refund initiated automatically</li></ol></div>' +
      '<div class="ap-section"><a href="bookings.html" class="ap-action-btn"><i class="fa-solid fa-ticket-simple"></i> Go to My Bookings</a></div>'
  },
  changedate: {
    icon: 'fa-calendar-days',
    title: 'Change Date',
    html: '<div class="ap-section"><div class="ap-highlight"><i class="fa-solid fa-calendar-check" style="color:#22c55e;"></i> <strong>Date Change is available</strong> on most bookings — subject to fare difference and availability.</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-indian-rupee-sign"></i> Date Change Fees</h4>' +
      '<div class="ap-policy-table"><div class="ap-policy-row header"><span>Airline</span><span>Change Fee</span></div>' +
      '<div class="ap-policy-row"><span>IndiGo (6E) — Economy</span><span>₹2,500 + fare diff</span></div>' +
      '<div class="ap-policy-row"><span>IndiGo (6E) — Business</span><span>₹1,500 + fare diff</span></div>' +
      '<div class="ap-policy-row"><span>Star Air (S5) — Economy</span><span>₹2,000 + fare diff</span></div>' +
      '<div class="ap-policy-row"><span>Star Air (S5) — Business</span><span>₹1,000 + fare diff</span></div></div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-circle-info"></i> Important Notes</h4><ul class="ap-list"><li>Date changes must be made at least <strong>4 hours before departure</strong></li><li>Same route only — origin and destination cannot be changed</li><li>If new fare is lower, no refund on fare difference</li><li>Changes on promotional fares may not be permitted</li></ul></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-steps"></i> How to Change Date</h4><ol class="ap-steps"><li>Go to <strong>My Bookings</strong> page</li><li>Select your booking and click <strong>Change Date</strong></li><li>Choose your new travel date</li><li>Pay the applicable change fee + fare difference</li></ol></div>' +
      '<div class="ap-section"><a href="bookings.html" class="ap-action-btn"><i class="fa-solid fa-calendar-days"></i> Manage My Bookings</a></div>'
  },
  easybooking: {
    icon: 'fa-bolt',
    title: 'Easy Booking',
    html: '<div class="ap-section"><div class="ap-highlight"><i class="fa-solid fa-bolt" style="color:#38bdf8;"></i> <strong>Book in under 3 minutes</strong> with our streamlined 5-step process!</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-list-ol"></i> Booking Steps</h4>' +
      '<div class="ap-steps-visual">' +
      '<div class="ap-step-v"><div class="ap-step-num">1</div><div class="ap-step-label"><strong>Search</strong><br><small>Select origin, destination, date & passengers</small></div></div>' +
      '<div class="ap-step-v"><div class="ap-step-num">2</div><div class="ap-step-label"><strong>Select Flight</strong><br><small>Choose from available flights & fares</small></div></div>' +
      '<div class="ap-step-v"><div class="ap-step-num">3</div><div class="ap-step-label"><strong>Passenger Details</strong><br><small>Enter traveller names & contact info</small></div></div>' +
      '<div class="ap-step-v"><div class="ap-step-num">4</div><div class="ap-step-label"><strong>Pay Securely</strong><br><small>UPI, Card, Net Banking or Wallet</small></div></div>' +
      '<div class="ap-step-v"><div class="ap-step-num">5</div><div class="ap-step-label"><strong>Get Boarding Pass</strong><br><small>Instant QR-coded e-ticket on email & WhatsApp</small></div></div>' +
      '</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-star"></i> Tips for Faster Booking</h4><ul class="ap-list"><li>Save your traveller details for one-tap reuse</li><li>Book 15+ days ahead for best fares</li><li>Use promo code <strong>KOLHAPUR10</strong> for 10% off</li><li>Enable notifications for fare alerts</li></ul></div>' +
      '<div class="ap-section"><a href="search.html" class="ap-action-btn"><i class="fa-solid fa-magnifying-glass"></i> Start Searching Flights</a></div>'
  },
  payment: {
    icon: 'fa-shield-halved',
    title: 'Secure Payment',
    html: '<div class="ap-section"><div class="ap-highlight"><i class="fa-solid fa-lock" style="color:#22c55e;"></i> <strong>100% Secure Transactions</strong> — Your payment data is fully encrypted and never stored on our servers.</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-credit-card"></i> Accepted Payment Methods</h4>' +
      '<div class="ap-pay-grid">' +
      '<div class="ap-pay-item"><i class="fa-solid fa-mobile-screen-button"></i><span>UPI</span></div>' +
      '<div class="ap-pay-item"><i class="fa-solid fa-credit-card"></i><span>Debit/Credit Card</span></div>' +
      '<div class="ap-pay-item"><i class="fa-solid fa-building-columns"></i><span>Net Banking</span></div>' +
      '<div class="ap-pay-item"><i class="fa-solid fa-wallet"></i><span>Wallets</span></div>' +
      '<div class="ap-pay-item"><i class="fa-solid fa-money-bill"></i><span>EMI Options</span></div>' +
      '<div class="ap-pay-item"><i class="fa-brands fa-google-pay"></i><span>Google Pay</span></div>' +
      '</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-shield-halved"></i> Security Features</h4><ul class="ap-list"><li><strong>256-bit SSL Encryption</strong> — All transactions are end-to-end encrypted</li><li><strong>PCI DSS Compliant</strong> — Meets highest card security standards</li><li><strong>3D Secure</strong> — OTP-based authentication for all card payments</li><li><strong>Zero Data Retention</strong> — Card details are never stored after payment</li><li><strong>Instant Refunds</strong> — Failed transactions refunded within 24 hours</li></ul></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-headset"></i> Payment Support</h4><p>Facing a payment issue? Contact our support team: <strong>📞 0231-2600500</strong> | <strong>✉ payments@skyway-kop.in</strong></p></div>'
  },
  search: {
    icon: 'fa-magnifying-glass',
    title: 'Smart Search',
    html: '<div class="ap-section"><div class="ap-highlight"><i class="fa-solid fa-magnifying-glass-dollar" style="color:#38bdf8;"></i> <strong>SkyWay Smart Search</strong> compares all available flights in real-time to find you the best fares.</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-sliders"></i> Search Features</h4>' +
      '<div class="ap-feature-grid">' +
      '<div class="ap-feature"><i class="fa-solid fa-calendar-days"></i><strong>Flexible Dates</strong><p>View fares across ±3 days to find the cheapest travel day</p></div>' +
      '<div class="ap-feature"><i class="fa-solid fa-filter"></i><strong>Smart Filters</strong><p>Filter by price, departure time, airline, stops, and cabin class</p></div>' +
      '<div class="ap-feature"><i class="fa-solid fa-map-location-dot"></i><strong>Route Map</strong><p>Visualize your flight path with distance and estimated time</p></div>' +
      '<div class="ap-feature"><i class="fa-solid fa-bell"></i><strong>Fare Alerts</strong><p>Get notified when fares drop on your preferred routes</p></div>' +
      '</div></div>' +
      '<div class="ap-section"><h4><i class="fa-solid fa-lightbulb"></i> Search Tips</h4><ul class="ap-list"><li>Tuesday and Wednesday are usually cheapest days to fly</li><li>Book 3–6 weeks in advance for best domestic fares from Kolhapur</li><li>Early morning and late evening flights are often cheaper</li><li>Clear cookies/use incognito to avoid dynamic pricing</li></ul></div>' +
      '<div class="ap-section"><a href="search.html" class="ap-action-btn"><i class="fa-solid fa-magnifying-glass"></i> Search Flights Now</a></div>'
  }
};

function openAccountPopup(type) {
  closeAcctDrop();
  var content = ACCOUNT_CONTENT[type];
  if (!content) return;
  var modal = document.getElementById('accountModal');
  if (!modal) return;
  document.getElementById('acct-modal-title').innerHTML = '<i class="fa-solid ' + content.icon + '"></i> ' + content.title;
  document.getElementById('acct-modal-body').innerHTML = content.html;
  modal.classList.add('active');
}

function closeAccountModal() {
  var modal = document.getElementById('accountModal');
  if (modal) modal.classList.remove('active');
}

// ============================================================
// ADMIN LOGIN & DASHBOARD
// ============================================================
function openAdminLogin() {
  var modal = document.getElementById('adminLoginModal');
  if (!modal) return;
  document.getElementById('adminLoginErr').style.display = 'none';
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  modal.classList.add('active');
}

function closeAdminLogin() {
  var modal = document.getElementById('adminLoginModal');
  if (modal) modal.classList.remove('active');
}

function doAdminLogin() {
  var user = document.getElementById('adminUser').value.trim();
  var pass = document.getElementById('adminPass').value.trim();
  var err = document.getElementById('adminLoginErr');
  if (user === 'admin' && pass === 'admin123') {
    closeAdminLogin();
    openAdminDashboard();
  } else {
    if (err) err.style.display = 'block';
  }
}

// ============================================================
// ADMIN DASHBOARD — Full Professional Implementation
// Replace the openAdminDashboard + renderAdminBookings functions
// ============================================================

var ADMIN_ACTIVE_TAB = 'overview';
var ADMIN_REFRESH_TIMER = null;

// Demo seed data
var DEMO_BOOKINGS = [
  { pnr:'SW7K2X', name:'Rahul Patil',     from:'KOP', to:'BOM', date:'2026-04-05', flight:'S5-224',  pax:2, fare:4900,  status:'Confirmed', cls:'Economy',  phone:'9876543210', email:'rahul@gmail.com',    time:'06:15' },
  { pnr:'SW9M4P', name:'Priya Desai',     from:'KOP', to:'HYD', date:'2026-04-08', flight:'6E-6312', pax:1, fare:2199,  status:'Confirmed', cls:'Economy',  phone:'9876543211', email:'priya@gmail.com',    time:'06:30' },
  { pnr:'SW3L8R', name:'Amit Shinde',     from:'KOP', to:'BLR', date:'2026-04-10', flight:'6E-6414', pax:3, fare:5997,  status:'Cancelled', cls:'Economy',  phone:'9876543212', email:'amit@gmail.com',     time:'07:15' },
  { pnr:'SW6N1T', name:'Sneha Kulkarni',  from:'KOP', to:'GOI', date:'2026-04-15', flight:'S5-804',  pax:2, fare:5798,  status:'Confirmed', cls:'Business', phone:'9876543213', email:'sneha@gmail.com',    time:'09:00' },
  { pnr:'SW2H5Q', name:'Rohan More',      from:'KOP', to:'NAG', date:'2026-04-18', flight:'S5-316',  pax:1, fare:1899,  status:'Confirmed', cls:'Economy',  phone:'9876543214', email:'rohan@gmail.com',    time:'08:10' },
  { pnr:'SW8J3V', name:'Kavita Jadhav',   from:'KOP', to:'NMB', date:'2026-04-20', flight:'6E-6201', pax:4, fare:6796,  status:'Confirmed', cls:'Economy',  phone:'9876543215', email:'kavita@gmail.com',   time:'06:00' },
  { pnr:'SW5P7M', name:'Suresh Chavan',   from:'KOP', to:'HYD', date:'2026-04-22', flight:'6E-6312', pax:1, fare:2399,  status:'Confirmed', cls:'Business', phone:'9876543216', email:'suresh@gmail.com',   time:'06:30' },
  { pnr:'SW4T9N', name:'Anita Sawant',    from:'KOP', to:'BOM', date:'2026-04-25', flight:'S5-226',  pax:2, fare:4900,  status:'Cancelled', cls:'Economy',  phone:'9876543217', email:'anita@gmail.com',    time:'09:30' },
  { pnr:'SW1X6K', name:'Vijay Pawar',     from:'KOP', to:'BLR', date:'2026-04-28', flight:'6E-6414', pax:1, fare:1999,  status:'Confirmed', cls:'Economy',  phone:'9876543218', email:'vijay@gmail.com',    time:'07:15' },
  { pnr:'SW0C2W', name:'Meera Joshi',     from:'KOP', to:'GOI', date:'2026-05-02', flight:'S5-804',  pax:3, fare:8697,  status:'Confirmed', cls:'Economy',  phone:'9876543219', email:'meera@gmail.com',    time:'09:00' },
  { pnr:'SWA3Q8', name:'Kiran Kadam',     from:'KOP', to:'BOM', date:'2026-05-05', flight:'S5-224',  pax:1, fare:2450,  status:'Confirmed', cls:'Economy',  phone:'9876543220', email:'kiran@gmail.com',    time:'06:15' },
  { pnr:'SWB7F5', name:'Sunita Nagre',    from:'KOP', to:'NAG', date:'2026-05-08', flight:'S5-316',  pax:2, fare:3798,  status:'Confirmed', cls:'Business', phone:'9876543221', email:'sunita@gmail.com',   time:'08:10' }
];

var FLIGHT_SCHEDULE = [
  { fno:'S5-224',  airline:'Star Air', from:'KOP', to:'BOM', dep:'06:15', arr:'07:20', status:'On Time',    seats:50, booked:38, cls:'Economy/Business' },
  { fno:'6E-6312', airline:'IndiGo',   from:'KOP', to:'HYD', dep:'06:30', arr:'07:45', status:'On Time',    seats:180,booked:162,cls:'Economy/Business' },
  { fno:'6E-6201', airline:'IndiGo',   from:'KOP', to:'NMB', dep:'06:00', arr:'07:10', status:'On Time',    seats:180,booked:145,cls:'Economy'           },
  { fno:'S5-316',  airline:'Star Air', from:'KOP', to:'NAG', dep:'08:10', arr:'09:55', status:'Delayed 10m',seats:50, booked:42, cls:'Economy/Business' },
  { fno:'6E-6414', airline:'IndiGo',   from:'KOP', to:'BLR', dep:'07:15', arr:'08:45', status:'On Time',    seats:180,booked:178,cls:'Economy/Business' },
  { fno:'S5-610',  airline:'Star Air', from:'KOP', to:'AHN', dep:'10:45', arr:'11:40', status:'On Time',    seats:50, booked:29, cls:'Economy'           },
  { fno:'S5-226',  airline:'Star Air', from:'KOP', to:'BOM', dep:'09:30', arr:'10:35', status:'On Time',    seats:50, booked:47, cls:'Economy/Business' },
  { fno:'6E-6314', airline:'IndiGo',   from:'KOP', to:'HYD', dep:'10:05', arr:'11:20', status:'Delayed 5m', seats:180,booked:156,cls:'Economy'           },
  { fno:'S5-804',  airline:'Star Air', from:'KOP', to:'GOI', dep:'09:00', arr:'10:10', status:'On Time',    seats:50, booked:50, cls:'Economy/Business' },
  { fno:'S5-228',  airline:'Star Air', from:'KOP', to:'BOM', dep:'18:30', arr:'19:35', status:'On Time',    seats:50, booked:33, cls:'Economy/Business' }
];

function getAllBookings() {
  var live = SW.get('bookingsLog') || [];
  return DEMO_BOOKINGS.concat(live.map(function(b) {
    return {
      pnr: b.pnr || 'SW????', name: b.passenger || 'Passenger',
      from: b.from || 'KOP', to: b.to || '—',
      date: b.date || '—', flight: b.flight || '—',
      pax: (SW.get('searchData') || {}).total || 1,
      fare: b.amount || 0, status: b.status || 'Confirmed',
      cls: (SW.get('searchData') || {}).cls || 'Economy',
      phone: b.phone || '—', email: b.email || '—',
      time: b.dep || '—'
    };
  }));
}

function openAdminDashboard() {
  var modal = document.getElementById('adminDashModal');
  if (!modal) return;
  modal.classList.add('active');
  renderAdminDash('overview');
  // Start auto-refresh every 30s
  if (ADMIN_REFRESH_TIMER) clearInterval(ADMIN_REFRESH_TIMER);
  ADMIN_REFRESH_TIMER = setInterval(function() {
    renderAdminDash(ADMIN_ACTIVE_TAB);
  }, 30000);
}

function closeAdminDashboard() {
  var modal = document.getElementById('adminDashModal');
  if (modal) modal.classList.remove('active');
  if (ADMIN_REFRESH_TIMER) { clearInterval(ADMIN_REFRESH_TIMER); ADMIN_REFRESH_TIMER = null; }
}

function renderAdminDash(tab) {
  ADMIN_ACTIVE_TAB = tab;
  var content = document.getElementById('adminDashContent');
  if (!content) return;

  var bookings = getAllBookings();
  var confirmed  = bookings.filter(function(b){ return b.status==='Confirmed'; });
  var cancelled  = bookings.filter(function(b){ return b.status==='Cancelled'; });
  var totalRev   = confirmed.reduce(function(s,b){ return s+(b.fare||0); }, 0);
  var totalPax   = bookings.reduce(function(s,b){ return s+(b.pax||1); }, 0);

  var now = new Date();
  var timeStr = now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});

  // TAB BAR
  var tabs = [
    { id:'overview',  icon:'fa-gauge',         label:'Overview'      },
    { id:'bookings',  icon:'fa-ticket-simple', label:'Bookings'      },
    { id:'passengers',icon:'fa-users',         label:'Passengers'    },
    { id:'flights',   icon:'fa-plane',         label:'Flights'       },
    { id:'seats',     icon:'fa-chair',         label:'Seat Avail.'   },
    { id:'cancelled', icon:'fa-ban',           label:'Cancelled'     },
    { id:'weekly',    icon:'fa-chart-bar',     label:'Weekly Graph'  },
    { id:'genpass',   icon:'fa-id-badge',      label:'Gen. Pass'     }
  ];

  var tabHtml = '<div class="adm-tab-bar">' +
    tabs.map(function(t) {
      return '<button class="adm-tab' + (tab===t.id?' active':'') + '" onclick="renderAdminDash(\'' + t.id + '\')">' +
        '<i class="fa-solid ' + t.icon + '"></i> ' + t.label + '</button>';
    }).join('') +
    '<div class="adm-live-badge"><span class="adm-live-dot"></span> LIVE · ' + timeStr + '</div>' +
  '</div>';

  var bodyHtml = '';

  if (tab === 'overview') {
    var hourlyData = [12,45,98,87,65,72,89,112,78,35];
    var hourLabels = ['4am','6am','8am','10am','12pm','2pm','4pm','6pm','8pm','10pm'];
    var maxH = Math.max.apply(null, hourlyData);

    bodyHtml = '<div class="adm-stat-grid">' +
      statCard('fa-calendar-check','var(--sky)',    bookings.length, 'Total Bookings',  '#38bdf8') +
      statCard('fa-indian-rupee-sign','#22c55e',   fmtLakh(totalRev),'Total Revenue','#22c55e') +
      statCard('fa-plane','var(--sky)',             FLIGHT_SCHEDULE.length,'Active Flights','#38bdf8') +
      statCard('fa-ban','#ef4444',                  cancelled.length,'Cancellations',   '#ef4444') +
      statCard('fa-percent','#f59e0b',              '82%','Load Factor',             '#f59e0b') +
      statCard('fa-clock','#a855f7',                FLIGHT_SCHEDULE.filter(function(f){return f.status.indexOf('Delay')>-1;}).length,'Delayed Flights','#a855f7') +
      statCard('fa-building','#38bdf8',             '2','Airlines',                 '#38bdf8') +
      statCard('fa-circle-check','#22c55e',         '99.2%','On-time Rate',         '#22c55e') +
    '</div>' +
    '<div class="adm-section-title"><i class="fa-solid fa-chart-line"></i> Today\'s Booking Activity (Hourly)</div>' +
    '<div class="adm-hourly-chart">' +
      hourlyData.map(function(v,i) {
        var h = Math.round((v/maxH)*100);
        return '<div class="adm-hour-col">' +
          '<div class="adm-hour-val">' + v + '</div>' +
          '<div class="adm-hour-bar" style="height:' + h + '%"></div>' +
          '<div class="adm-hour-lbl">' + hourLabels[i] + '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="adm-section-title" style="margin-top:20px"><i class="fa-solid fa-bolt"></i> Recent Bookings (Live)</div>' +
    miniBookingTable(bookings.slice(-5).reverse());

  } else if (tab === 'bookings') {
    bodyHtml = '<div class="adm-filter-bar">' +
      '<input class="adm-search" id="admSearch" placeholder="🔍 Search PNR, name, route..." oninput="adminFilterTable(this.value)">' +
      '<select class="adm-select" onchange="adminFilterStatus(this.value)">' +
        '<option value="">All Status</option>' +
        '<option value="Confirmed">Confirmed</option>' +
        '<option value="Cancelled">Cancelled</option>' +
        '<option value="Pending">Pending</option>' +
      '</select>' +
    '</div>' +
    '<div class="adm-section-title"><i class="fa-solid fa-ticket-simple"></i> All Bookings (' + bookings.length + ')</div>' +
    fullBookingTable(bookings, 'admBookingsBody');

  } else if (tab === 'passengers') {
    var paxRows = [];
    bookings.forEach(function(b, bidx) {
      for (var p = 0; p < (b.pax||1); p++) {
        paxRows.push({ sn: paxRows.length+1, name: p===0?b.name:'Co-Passenger '+(p+1)+' ('+b.pnr+')', pnr:b.pnr, flight:b.flight, route:b.from+'→'+b.to, date:b.date, cls:b.cls, status:b.status });
      }
    });
    bodyHtml = '<div class="adm-section-title"><i class="fa-solid fa-users"></i> All Passengers (' + paxRows.length + ')</div>' +
      '<div style="overflow-x:auto"><table class="adm-table">' +
      '<thead><tr><th>#</th><th>Name</th><th>PNR</th><th>Flight</th><th>Route</th><th>Date</th><th>Class</th><th>Status</th></tr></thead>' +
      '<tbody>' + paxRows.map(function(r) {
        return '<tr><td>' + r.sn + '</td><td><strong>' + r.name + '</strong></td><td class="adm-mono">' + r.pnr +
          '</td><td>' + r.flight + '</td><td>' + r.route + '</td><td>' + r.date + '</td><td>' + r.cls +
          '</td><td>' + statusBadge(r.status) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

  } else if (tab === 'flights') {
    bodyHtml = '<div class="adm-section-title"><i class="fa-solid fa-plane-departure"></i> Today\'s Flight Schedule — KOP</div>' +
      '<div style="overflow-x:auto"><table class="adm-table">' +
      '<thead><tr><th>Flight</th><th>Airline</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Status</th><th>Seats</th><th>Load</th><th>Class</th></tr></thead>' +
      '<tbody>' + FLIGHT_SCHEDULE.map(function(f) {
        var load = Math.round((f.booked/f.seats)*100);
        var loadColor = load>=90?'#ef4444':load>=70?'#f59e0b':'#22c55e';
        var sc = f.status.indexOf('Delay')>-1 ? 'status-cancelled' : 'status-confirmed';
        return '<tr>' +
          '<td><strong class="adm-mono">' + f.fno + '</strong></td>' +
          '<td>' + f.airline + '</td>' +
          '<td><strong>KOP → ' + f.to + '</strong></td>' +
          '<td><strong>' + f.dep + '</strong></td>' +
          '<td>' + f.arr + '</td>' +
          '<td><span class="admin-status ' + sc + '">' + f.status + '</span></td>' +
          '<td>' + f.booked + '/' + f.seats + '</td>' +
          '<td><span style="color:' + loadColor + ';font-weight:800;">' + load + '%</span></td>' +
          '<td>' + f.cls + '</td></tr>';
      }).join('') + '</tbody></table></div>';

  } else if (tab === 'seats') {
    bodyHtml = '<div class="adm-section-title"><i class="fa-solid fa-chair"></i> Seat Availability by Flight</div>';
    bodyHtml += '<div class="adm-seat-grid">';
    FLIGHT_SCHEDULE.forEach(function(f) {
      var load = Math.round((f.booked/f.seats)*100);
      var avail = f.seats - f.booked;
      var barColor = load>=95?'#ef4444':load>=75?'#f59e0b':'#22c55e';
      bodyHtml += '<div class="adm-seat-card">' +
        '<div class="adm-seat-hdr">' +
          '<span class="adm-mono" style="color:var(--sky);font-weight:800;">' + f.fno + '</span>' +
          '<span style="font-size:11px;color:var(--muted);">KOP → ' + f.to + '</span>' +
        '</div>' +
        '<div class="adm-seat-bar-wrap">' +
          '<div class="adm-seat-bar" style="width:' + load + '%;background:' + barColor + '"></div>' +
        '</div>' +
        '<div class="adm-seat-stats">' +
          '<span style="color:#22c55e"><i class="fa-solid fa-circle-check"></i> ' + avail + ' Available</span>' +
          '<span style="color:#ef4444"><i class="fa-solid fa-circle-xmark"></i> ' + f.booked + ' Booked</span>' +
          '<span style="color:var(--muted)">Total: ' + f.seats + '</span>' +
        '</div>' +
        '<div style="font-size:10px;color:var(--muted);margin-top:4px;">' + f.dep + ' · ' + f.airline + ' · ' + load + '% full</div>' +
      '</div>';
    });
    bodyHtml += '</div>';

  } else if (tab === 'cancelled') {
    bodyHtml = '<div class="adm-stat-grid" style="grid-template-columns:repeat(3,1fr)">' +
      statCard('fa-ban','#ef4444', cancelled.length, 'Total Cancelled', '#ef4444') +
      statCard('fa-indian-rupee-sign','#f59e0b', '₹'+cancelled.reduce(function(s,b){return s+(b.fare||0);},0).toLocaleString('en-IN'), 'Refund Value', '#f59e0b') +
      statCard('fa-percent','#a855f7', cancelled.length?Math.round((cancelled.length/bookings.length)*100)+'%':'0%', 'Cancellation Rate', '#a855f7') +
    '</div>' +
    '<div class="adm-section-title" style="margin-top:16px"><i class="fa-solid fa-ban"></i> Cancelled Bookings</div>' +
    (cancelled.length ? fullBookingTable(cancelled, 'admCancelBody') :
      '<div class="adm-empty"><i class="fa-solid fa-check-circle" style="color:#22c55e"></i><br>No cancellations found!</div>');

  } else if (tab === 'weekly') {
    var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var wkBookings = [45,78,92,67,110,145,89];
    var wkRevenue  = [88000,152000,178000,131000,215000,282000,174000];
    var maxWB = Math.max.apply(null,wkBookings);
    var maxWR = Math.max.apply(null,wkRevenue);
    bodyHtml = '<div class="adm-section-title"><i class="fa-solid fa-chart-bar"></i> Weekly Booking Trend</div>' +
      '<div class="adm-weekly-chart">' +
        days.map(function(d,i) {
          var hb = Math.round((wkBookings[i]/maxWB)*140);
          var hr = Math.round((wkRevenue[i]/maxWR)*140);
          return '<div class="adm-week-col">' +
            '<div class="adm-week-vals"><span style="color:var(--sky)">' + wkBookings[i] + '</span><span style="color:#22c55e">₹'+Math.round(wkRevenue[i]/1000)+'K</span></div>' +
            '<div class="adm-week-bars">' +
              '<div class="adm-week-bar b1" style="height:' + hb + 'px"></div>' +
              '<div class="adm-week-bar b2" style="height:' + hr + 'px"></div>' +
            '</div>' +
            '<div class="adm-week-lbl">' + d + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="adm-chart-legend"><span class="leg-b1"></span> Bookings &nbsp;&nbsp; <span class="leg-b2"></span> Revenue</div>' +
      '<div class="adm-section-title" style="margin-top:24px"><i class="fa-solid fa-chart-line"></i> Revenue Summary</div>' +
      '<div class="adm-stat-grid" style="grid-template-columns:repeat(4,1fr)">' +
        statCard('fa-calendar-week','#38bdf8', wkBookings.reduce(function(a,b){return a+b;},0), 'Weekly Bookings', '#38bdf8') +
        statCard('fa-indian-rupee-sign','#22c55e', fmtLakh(wkRevenue.reduce(function(a,b){return a+b;},0)), 'Weekly Revenue', '#22c55e') +
        statCard('fa-arrow-trend-up','#f59e0b', '+18%', 'vs Last Week', '#f59e0b') +
        statCard('fa-trophy','#a855f7', 'Saturday', 'Peak Day', '#a855f7') +
      '</div>';

  } else if (tab === 'genpass') {
    bodyHtml = '<div class="adm-section-title"><i class="fa-solid fa-id-badge"></i> General Passenger Pass — Walk-In / Staff</div>' +
      '<div class="adm-genpass-form">' +
        '<div class="adm-form-grid">' +
          '<div class="adm-form-field"><label>Full Name *</label><input type="text" id="gp-name" placeholder="Passenger full name"></div>' +
          '<div class="adm-form-field"><label>Phone *</label><input type="text" id="gp-phone" placeholder="+91 99999 99999"></div>' +
          '<div class="adm-form-field"><label>ID Number *</label><input type="text" id="gp-id" placeholder="Aadhaar / Passport No."></div>' +
          '<div class="adm-form-field"><label>Destination</label><select id="gp-dest"><option>Mumbai (BOM)</option><option>Hyderabad (HYD)</option><option>Bengaluru (BLR)</option><option>Goa (GOI)</option><option>Nagpur (NAG)</option><option>Navi Mumbai (NMB)</option></select></div>' +
          '<div class="adm-form-field"><label>Flight</label><select id="gp-flt">' + FLIGHT_SCHEDULE.map(function(f){ return '<option>' + f.fno + ' — KOP→' + f.to + ' ' + f.dep + '</option>'; }).join('') + '</select></div>' +
          '<div class="adm-form-field"><label>Pass Type</label><select id="gp-type"><option>Visitor Pass</option><option>Staff Pass</option><option>Press Pass</option><option>Medical Escort</option><option>VIP Pass</option></select></div>' +
        '</div>' +
        '<button class="adm-gen-btn" onclick="generateGenPass()"><i class="fa-solid fa-id-badge"></i> Generate Pass</button>' +
      '</div>' +
      '<div id="gp-output" style="margin-top:20px;display:none;">' +
        '<div class="adm-section-title"><i class="fa-solid fa-check-circle" style="color:#22c55e"></i> Generated Pass</div>' +
        '<div class="adm-pass-card" id="gpPassCard"></div>' +
        '<button class="adm-gen-btn" style="margin-top:12px;background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.3);color:#4ade80" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Pass</button>' +
      '</div>';
  }

  content.innerHTML = tabHtml + '<div class="adm-body">' + bodyHtml + '</div>';
}

function statCard(icon, color, val, label, borderColor) {
  return '<div class="adm-stat-card" style="border-color:' + (borderColor||'rgba(56,189,248,.2)') + '">' +
    '<div class="adm-sc-icon" style="color:' + color + '"><i class="fa-solid ' + icon + '"></i></div>' +
    '<div class="adm-sc-val" style="color:' + color + '">' + val + '</div>' +
    '<div class="adm-sc-lbl">' + label + '</div>' +
  '</div>';
}

function fmtLakh(n) {
  if (n >= 100000) return '₹' + (n/100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n/1000).toFixed(1) + 'K';
  return '₹' + n;
}

function statusBadge(s) {
  var c = s==='Confirmed'?'status-confirmed':s==='Cancelled'?'status-cancelled':'status-pending';
  return '<span class="admin-status ' + c + '">' + s + '</span>';
}

function miniBookingTable(rows) {
  return '<div style="overflow-x:auto"><table class="adm-table">' +
    '<thead><tr><th>PNR</th><th>Passenger</th><th>Route</th><th>Flight</th><th>Fare</th><th>Status</th></tr></thead>' +
    '<tbody>' + rows.map(function(b) {
      return '<tr><td class="adm-mono"><strong>' + b.pnr + '</strong></td><td>' + b.name +
        '</td><td>' + b.from + '→' + b.to + '</td><td>' + b.flight +
        '</td><td>₹' + (b.fare||0).toLocaleString('en-IN') + '</td><td>' + statusBadge(b.status) + '</td></tr>';
    }).join('') + '</tbody></table></div>';
}

function fullBookingTable(rows, tbodyId) {
  return '<div style="overflow-x:auto"><table class="adm-table" id="' + (tbodyId||'admTbl') + 'Table">' +
    '<thead><tr><th>PNR</th><th>Passenger</th><th>Route</th><th>Date</th><th>Flight</th><th>Pax</th><th>Fare</th><th>Class</th><th>Time</th><th>Status</th></tr></thead>' +
    '<tbody id="' + (tbodyId||'admTbl') + '">' + rows.map(function(b) {
      return '<tr>' +
        '<td class="adm-mono"><strong>' + b.pnr + '</strong></td>' +
        '<td><strong>' + b.name + '</strong><br><span style="font-size:10px;color:var(--muted)">' + (b.email||'') + '</span></td>' +
        '<td><strong>KOP → ' + b.to + '</strong></td>' +
        '<td>' + b.date + '</td>' +
        '<td>' + b.flight + '</td>' +
        '<td>' + (b.pax||1) + '</td>' +
        '<td><strong>₹' + (b.fare||0).toLocaleString('en-IN') + '</strong></td>' +
        '<td>' + b.cls + '</td>' +
        '<td>' + (b.time||'—') + '</td>' +
        '<td>' + statusBadge(b.status) + '</td>' +
      '</tr>';
    }).join('') + '</tbody></table></div>';
}

function adminFilterTable(val) {
  var rows = document.querySelectorAll('#admBookingsBody tr');
  var v = val.toLowerCase();
  rows.forEach(function(r) { r.style.display = r.textContent.toLowerCase().indexOf(v) > -1 ? '' : 'none'; });
}

function adminFilterStatus(val) {
  var rows = document.querySelectorAll('#admBookingsBody tr');
  rows.forEach(function(r) { r.style.display = (!val || r.textContent.indexOf(val) > -1) ? '' : 'none'; });
}

function generateGenPass() {
  var name  = document.getElementById('gp-name').value.trim();
  var phone = document.getElementById('gp-phone').value.trim();
  var idNum = document.getElementById('gp-id').value.trim();
  var dest  = document.getElementById('gp-dest').value;
  var flt   = document.getElementById('gp-flt').value;
  var type  = document.getElementById('gp-type').value;
  if (!name || !phone || !idNum) { showToast('fa-solid fa-circle-exclamation','var(--red)','Error','Please fill all required fields.',3000); return; }
  var passId = 'GP' + Date.now().toString().slice(-8);
  var now = new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
  var card = document.getElementById('gpPassCard');
  card.innerHTML =
    '<div class="gp-card-inner">' +
      '<div class="gp-card-header"><span class="gp-type-tag">' + type + '</span><span class="gp-passid">' + passId + '</span></div>' +
      '<div class="gp-card-name">' + name.toUpperCase() + '</div>' +
      '<div class="gp-card-meta">' +
        '<span><i class="fa-solid fa-phone"></i> ' + phone + '</span>' +
        '<span><i class="fa-solid fa-id-card"></i> ' + idNum + '</span>' +
      '</div>' +
      '<div class="gp-card-flight">' +
        '<span><i class="fa-solid fa-plane"></i> ' + flt + '</span>' +
        '<span><i class="fa-solid fa-map-marker-alt"></i> KOP → ' + dest + '</span>' +
      '</div>' +
      '<div class="gp-card-footer">' +
        '<span><i class="fa-solid fa-calendar"></i> Valid: ' + now + '</span>' +
        '<img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=' + encodeURIComponent(passId+'|'+name+'|'+idNum) + '" style="width:50px;height:50px;border-radius:6px;">' +
      '</div>' +
    '</div>';
  document.getElementById('gp-output').style.display = 'block';
  showToast('fa-solid fa-check-circle','var(--green)','Pass Generated','General passenger pass created: ' + passId, 3000);
}

// Expose for backward compat
function renderAdminBookings() { renderAdminDash('overview'); }


function doLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pwd   = document.getElementById('loginPwd').value.trim();
  var err   = document.getElementById('lm-err');

  var users = [
    { email: 'user@airport.in', password: '12345', name: 'Airport User', role: 'user' },
    { email: 'admin', password: 'admin123', name: 'Admin', role: 'admin' }
  ];

  var found = users.find(function(u) {
    return (u.email === email || u.email === email.toLowerCase()) && u.password === pwd;
  });

  if (found) {
    setUser(found);
    closeLoginModal();
    showToast('fa-solid fa-check-circle', 'var(--green)', 'Logged In', 'Welcome back, ' + found.name + '!', 3000);
    if (found.role === 'admin') {
      showToast('fa-solid fa-user-shield', 'var(--amber)', 'Admin Access', 'Click Admin button for dashboard.', 3500);
    }
  } else {
    if (err) { err.style.display = 'block'; }
  }
}

function doSignup() {
  var name  = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim();
  var phone = document.getElementById('regPhone').value.trim();
  var pwd   = document.getElementById('regPwd').value.trim();

  if (!name || !email || !pwd) {
    showToast('fa-solid fa-circle-exclamation', 'var(--red)', 'Error', 'Please fill all fields.', 3000);
    return;
  }

  var newUser = { name: name, email: email, phone: phone, role: 'user' };
  setUser(newUser);
  closeLoginModal();
  showToast('fa-solid fa-check-circle', 'var(--green)', 'Account Created', 'Welcome, ' + name + '!', 3000);
}

function doGoogleSignIn() {
  var names = ['Rahul Patil','Priya Desai','Amit Shinde','Sneha Kulkarni','Rohan More'];
  var n = names[Math.floor(Math.random() * names.length)];
  setUser({ name: n, email: n.toLowerCase().replace(' ', '.') + '@gmail.com', role: 'user' });
  closeLoginModal();
  showToast('fa-brands fa-google', 'var(--sky)', 'Google Sign-In', 'Welcome, ' + n + '!', 3000);
}

// ============================================================
// TOAST
// ============================================================
function showToast(icon, color, title, msg, dur) {
  var c = document.getElementById('toastContainer');
  if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<i class="' + icon + ' toast-ico" style="color:' + color + ';"></i>' +
    '<div><div class="toast-title">' + title + '</div><div class="toast-msg">' + msg + '</div></div>';
  c.appendChild(t);
  setTimeout(function() { t.classList.add('out'); setTimeout(function() { t.remove(); }, 300); }, dur || 3000);
}

// ============================================================
// CHAT BOT (Deal AI)
// ============================================================
var chatBotResponses = {
  'hello': 'Hi there! 👋 I\'m Deal, your SkyWay AI assistant. How can I help you today?',
  'hi': 'Hello! Welcome to SkyWay — Kolhapur Airport booking portal. What can I help you with?',
  'hey': 'Hey! I\'m Deal AI 🤖 Ready to help you with flights, bookings, and more from Kolhapur Airport.',
  'flights': 'From Kolhapur (KOP), IndiGo flies to Hyderabad, Bengaluru & Navi Mumbai. Star Air flies to Mumbai, Nagpur, Goa, Ahmednagar, Hyderabad & Bengaluru. Daily departures from 06:00 onwards!',
  'book': 'To book a flight: 1) Click "Search Flights" 2) Select destination & date 3) Choose your flight 4) Enter passenger details 5) Pay securely. Done in under 3 minutes! 🎉',
  'cancel': 'You can cancel bookings from the "My Bookings" page. Refund policy: 7+ days before → 75%, 2–7 days → 50%, under 24h → credit shell only.',
  'refund': 'Refunds are processed in 5–7 business days to your original payment method. Use promo code KOLHAPUR10 for your next booking!',
  'baggage': 'Economy: 15kg checked + 7kg cabin. Business: 25kg checked + 7kg cabin. Excess baggage is charged at ₹300/kg.',
  'checkin': 'Web check-in opens 48 hrs before departure and closes 2 hrs before. Airport check-in counter closes 45 min before departure.',
  'pnr': 'Your PNR is a 6-character alphanumeric code found on your booking confirmation. Never share your PNR publicly — it can be misused.',
  'indigo': 'IndiGo (6E) operates from Kolhapur to Hyderabad, Bengaluru & Navi Mumbai. Fares start at ₹1,699. Fleet: Airbus A320neo.',
  'star': 'Star Air (S5) operates from Kolhapur to Mumbai, Nagpur, Goa, Ahmednagar, Hyderabad & Bengaluru. Fares start at ₹1,899. Fleet: Embraer ERJ-145.',
  'fare': 'Fares from Kolhapur start at ₹1,699 (IndiGo to Navi Mumbai) and ₹1,899 (Star Air to Ahmednagar). Use code KOLHAPUR10 for 10% off!',
  'price': 'Cheapest fares: KOP→NMB ₹1,699 | KOP→HYD ₹2,199 | KOP→BLR ₹1,999 | KOP→BOM ₹2,450 | KOP→GOI ₹2,899. Prices vary by date!',
  'deals': 'Check our "View Deals" page for seasonal offers! Summer deals from ₹1,499, Festive specials, and more. Use promo codes for extra savings.',
  'kolhapur': 'Kolhapur (KOP) is Chhatrapati Rajaram Maharaj Airport. It serves as the gateway to Kolhapur — the city of Mahalakshmi, known for kolhapuri chappal & misal pav!',
  'airport': 'Chhatrapati Rajaram Maharaj Airport (KOP), Kolhapur. Runway expansion to 2,300m is underway. Currently serves Star Air & IndiGo. Located near NH-4.',
  'payment': 'SkyWay accepts UPI, Debit/Credit Cards, Net Banking, Wallets, and EMI. All transactions are 256-bit SSL encrypted and PCI DSS compliant.',
  'offers': 'Active promo codes: KOLHAPUR10 (10% off), SUMMER25 (25% off Apr-Jun), SKYWAY50 (up to 50% off select routes). Check Account → Offers for more!',
  'upgrade': 'Flight upgrades depend on seat availability. Contact the airline directly at check-in or visit their website. IndiGo: 0124-6173838 | Star Air: 1800-2100-700.',
  'default': 'I can help with flights from Kolhapur, bookings, cancellations, baggage policy, check-in, payment, and more. What would you like to know? ✈'
};

function toggleChat() {
  var p = document.getElementById('chatPanel');
  if (p) p.classList.toggle('visible');
}

function sendChat() {
  var inp = document.getElementById('chatInput');
  if (!inp || !inp.value.trim()) return;
  var msgs = document.getElementById('chatMsgs');
  var txt = inp.value.trim();
  inp.value = '';

  var um = document.createElement('div');
  um.className = 'cm user';
  um.textContent = txt;
  msgs.appendChild(um);

  var typing = document.createElement('div');
  typing.className = 'cm bot';
  typing.innerHTML = '<div class="typing-d"><span></span><span></span><span></span></div>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(function() {
    typing.remove();
    var lower = txt.toLowerCase();
    var key = Object.keys(chatBotResponses).find(function(k) { return k !== 'default' && lower.indexOf(k) !== -1; }) || 'default';
    var bm = document.createElement('div');
    bm.className = 'cm bot';
    bm.textContent = chatBotResponses[key];
    msgs.appendChild(bm);
    msgs.scrollTop = msgs.scrollHeight;
  }, 900);
}

// ============================================================
// DATE FORMATTING
// ============================================================
function formatDate(str) {
  if (!str) return '—';
  var d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// PNR GENERATOR
// ============================================================
function genPNR() {
  var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var p = '';
  for (var i = 0; i < 6; i++) p += c[Math.floor(Math.random() * c.length)];
  return p;
}

// ============================================================
// QR CODE
// ============================================================
function setQR(elId, data) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(data);
}

// ============================================================
function haversine(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ============================================================
// DOCUMENT READY INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  renderAuthArea();

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.acct-wrap')) closeAcctDrop();
    if (e.target === document.getElementById('loginModal')) closeLoginModal();
    if (e.target === document.getElementById('accountModal')) closeAccountModal();
    if (e.target === document.getElementById('adminLoginModal')) closeAdminLogin();
    if (e.target === document.getElementById('adminDashModal')) closeAdminDashboard();
  });

  var chatInp = document.getElementById('chatInput');
  if (chatInp) {
    chatInp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendChat();
    });
  }

  var adminPass = document.getElementById('adminPass');
  if (adminPass) {
    adminPass.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doAdminLogin();
    });
  }

  if (!document.getElementById('toastContainer')) {
    var tc = document.createElement('div');
    tc.id = 'toastContainer';
    document.body.appendChild(tc);
  }
});

function openLoginModal() {
  var modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('active');
  } else {
    console.error("Login modal not found");
  }
}

function closeLoginModal() {
  var modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function openLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

// optional (tabs switch)
function switchLoginTab(tab, el) {
  document.getElementById("lm-login").style.display = tab === "login" ? "block" : "none";
  document.getElementById("lm-signup").style.display = tab === "signup" ? "block" : "none";

  document.querySelectorAll(".lm-tab").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");
}

