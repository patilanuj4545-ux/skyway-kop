/* biometric.js */
var faceVerified = false;
var fpVerified = false;
var cameraStream = null;

function startBiometric() {
  var box = document.getElementById('faceScanBox');
  var video = document.getElementById('faceVideo');
  var ph = document.getElementById('faceScanPlaceholder');
  var corners = document.getElementById('faceCorners');
  var status = document.getElementById('faceStatus');
  var btn = document.getElementById('faceStartBtn');

  box.classList.add('scanning');
  status.textContent = 'Requesting camera access…';
  btn.disabled = true;

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(function(stream) {
      cameraStream = stream;
      video.srcObject = stream;
      video.style.display = 'block';
      ph.style.display = 'none';
      corners.style.display = 'block';
      status.textContent = '🔍 Scanning your face…';
      // Simulate 3-second scan
      setTimeout(function() {
        finishFaceScan(true);
      }, 3000);
    })
    .catch(function() {
      status.textContent = '⚠ Camera not accessible. Use Skip.';
      status.className = 'bio-status err';
      box.classList.remove('scanning');
      btn.disabled = false;
    });
}

function finishFaceScan(success) {
  var box = document.getElementById('faceScanBox');
  var video = document.getElementById('faceVideo');
  var corners = document.getElementById('faceCorners');
  var status = document.getElementById('faceStatus');
  var btn = document.getElementById('faceStartBtn');

  if (cameraStream) { cameraStream.getTracks().forEach(function(t) { t.stop(); }); }
  video.style.display = 'none';
  corners.style.display = 'none';
  document.getElementById('faceScanPlaceholder').style.display = 'flex';
  document.getElementById('faceScanPlaceholder').textContent = success ? '✅' : '❌';

  if (success) {
    box.classList.remove('scanning');
    box.classList.add('success');
    status.textContent = '✅ Face verified successfully!';
    status.className = 'bio-status ok';
    faceVerified = true;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Verified';
    btn.style.background = 'var(--green)';
    btn.disabled = true;
    showToast('fa-solid fa-face-smile','var(--green)','Face Verified','Identity confirmed successfully.',2500);
    // Unlock fingerprint
    var fpCard = document.getElementById('bioFpCard');
    fpCard.style.opacity = '1';
    fpCard.style.pointerEvents = 'auto';
    document.getElementById('fpStatus').textContent = 'Tap the icon to scan fingerprint';
  }
}

function skipBioFace() {
  document.getElementById('faceStatus').textContent = 'Skipped — proceeding without face scan';
  document.getElementById('faceScanPlaceholder').textContent = '⏭';
  faceVerified = true;
  var fpCard = document.getElementById('bioFpCard');
  fpCard.style.opacity = '1';
  fpCard.style.pointerEvents = 'auto';
  document.getElementById('fpStatus').textContent = 'Tap icon to scan fingerprint (optional)';
  showToast('fa-solid fa-forward','var(--amber)','Face Scan Skipped','You can proceed or do fingerprint scan.',2500);
}

function startFpScan() {
  var icon = document.getElementById('fpIcon');
  var fill = document.getElementById('fpProgFill');
  var status = document.getElementById('fpStatus');

  icon.className = 'fa-solid fa-fingerprint fp-icon scanning';
  status.textContent = 'Scanning fingerprint…';
  fill.style.width = '0%';

  var pct = 0;
  var iv = setInterval(function() {
    pct += 10;
    fill.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      icon.className = 'fa-solid fa-fingerprint fp-icon done';
      status.textContent = '✅ Fingerprint verified!';
      status.className = 'bio-status ok';
      fpVerified = true;
      showToast('fa-solid fa-fingerprint','var(--green)','Fingerprint Verified','Scan complete.',2500);
    }
  }, 200);
}

function skipAllBio() {
  faceVerified = true;
  fpVerified = true;
  showToast('fa-solid fa-forward','var(--amber)','Biometric Skipped','Proceeding to payment.',2000);
  setTimeout(goToPayment, 500);
}

function goToPayment() {
  SW.set('bioVerified', { face: faceVerified, fp: fpVerified });
  window.location.href = 'payment.html';
}

document.addEventListener('DOMContentLoaded', function() {
  if (!currentUser || !SW.get('selectedFlight')) {
    window.location.href = 'search.html';
  }
});