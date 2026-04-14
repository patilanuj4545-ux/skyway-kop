/* ============================================================
   index.js — Home Page Logic
   ============================================================ */

var HERO_IMAGES = [
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1600&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1600&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1600&auto=format&fit=crop&q=90'
];

var OFFERS = [
  { city: 'Goa', emoji: '🌴', desc: 'Sun, Sand & Sea', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&auto=format&fit=crop', orig: 4200, price: 2899, save: 31, badge: '🔥 Hot', badgeClass: 'badge-hot', dur: '1h 10m', flight: 'S5-804', dep: '09:00', to: 'GOI' },
  { city: 'Hyderabad', emoji: '🏙', desc: 'City of Pearls', img: 'https://images.unsplash.com/photo-1563448927337-4d09f7e6f596?w=400&auto=format&fit=crop', orig: 3100, price: 2199, save: 29, badge: '✓ Best Value', badgeClass: 'badge-best', dur: '1h 15m', flight: '6E-6312', dep: '06:30', to: 'HYD' },
  { city: 'Bengaluru', emoji: '🌆', desc: 'Silicon Valley of India', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&auto=format&fit=crop', orig: 2800, price: 1999, save: 29, badge: '✓ Lowest Fare', badgeClass: 'badge-best', dur: '1h 30m', flight: '6E-6414', dep: '07:15', to: 'BLR' },
  { city: 'Mumbai', emoji: '🌇', desc: 'City of Dreams', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&auto=format&fit=crop', orig: 3500, price: 2450, save: 30, badge: '🎉 Festive', badgeClass: 'badge-fest', dur: '1h 05m', flight: 'S5-224', dep: '06:15', to: 'BOM' }
];

// ---- Hero Background ----
function initHero() {
  var bg = document.getElementById('heroBg');
  if (!bg) return;
  var idx = Math.floor(Math.random() * HERO_IMAGES.length);
  bg.style.backgroundImage = 'url(' + HERO_IMAGES[idx] + ')';
  var i = idx;
  setInterval(function() {
    i = (i + 1) % HERO_IMAGES.length;
    bg.style.opacity = '0';
    setTimeout(function() {
      bg.style.backgroundImage = 'url(' + HERO_IMAGES[i] + ')';
      bg.style.opacity = '1';
    }, 600);
  }, 8000);
}

// ---- Render Offer Cards ----
function renderOffers() {
  var grid = document.getElementById('offersGrid');
  if (!grid) return;
  grid.innerHTML = OFFERS.map(function(o) {
    return '<div class="so-card" onclick="bookDeal(\'' + o.to + '\',\'' + o.flight + '\',\'' + o.dep + '\')">' +
      '<img class="so-img" src="' + o.img + '" alt="' + o.city + '" loading="lazy">' +
      '<div class="so-ov"></div>' +
      '<div class="so-cnt"><div class="so-city">' + o.emoji + ' ' + o.city + '</div><div class="so-desc-s">' + o.desc + '</div></div>' +
      '<span class="so-badge ' + o.badgeClass + '">' + o.badge + '</span>' +
      '<div class="so-foot">' +
        '<div class="so-prices"><span class="so-orig">₹' + o.orig.toLocaleString('en-IN') + '</span><span class="so-price">₹' + o.price.toLocaleString('en-IN') + '</span><span class="so-save">Save ' + o.save + '%</span></div>' +
        '<div class="so-meta"><span><i class="fa-solid fa-clock"></i> ' + o.dur + '</span><span><i class="fa-solid fa-plane"></i> Non-stop</span></div>' +
        '<button class="so-book-btn">Book Now →</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ---- Book Deal → redirect to search with params ----
function bookDeal(to, flight, dep) {
  SW.set('quickDeal', { to: to, flight: flight, dep: dep });
  window.location.href = 'search.html?to=' + to;
}

// ---- FAQ Toggle ----
function toggleFaq(q) {
  var item = q.closest('.faq-item');
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); i.querySelector('.faq-a').style.display = 'none'; });
  if (!isOpen) {
    item.classList.add('open');
    item.querySelector('.faq-a').style.display = 'block';
  }
}

// ---- QR Code — points to actual website URL ----
function initQR() {
  var url = window.location.href.split('?')[0]; // clean URL
  // Fallback to a meaningful URL if running locally
  if (url.indexOf('localhost') !== -1 || url.indexOf('127.0.0.1') !== -1 || url.indexOf('file://') !== -1) {
    url = 'https://skyway-kop.in/index.html';
  }
  setQR('homeQR', url);
}

// ---- Footer Modals ----
var FOOTER_MODAL_IDS = {
  privacy: 'privacyModal',
  terms: 'termsModal',
  contact: 'contactModal'
};

function openFooterModal(type) {
  var id = FOOTER_MODAL_IDS[type];
  if (!id) return;
  var modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeFooterModal(type) {
  var id = FOOTER_MODAL_IDS[type];
  if (!id) return;
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', function() {
  initHero();
  renderOffers();
  initQR();

  // Close footer modals on outside click
  Object.values(FOOTER_MODAL_IDS).forEach(function(id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  });
});