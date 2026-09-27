document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- PHONE NUMBER TOAST ---------- */
(function phoneToastSetup(){
  const toast = document.getElementById('phoneToast');
  let hideTimer = null;

  function showToast(){
    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  // Any element that links to our phone number shows the toast on click
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function(e){
      // Don't block the default tel: action (mobile users still get the dialer)
      showToast();
    });
  });

  // Tapping the toast itself keeps it open a bit longer instead of closing
  toast.addEventListener('click', function(e){
    if (e.target.tagName !== 'A') showToast();
  });
})();

/* ---------- HEADER SCROLL STATE ---------- */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ---------- MOBILE NAV ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ---------- SCROLL REVEAL ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------- CARD TILT ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- ROOM BOOK BUTTONS -> PREFILL FORM ---------- */
document.querySelectorAll('.room-book').forEach(btn => {
  btn.addEventListener('click', () => {
    const room = btn.getAttribute('data-room');
    const select = document.getElementById('froom');
    if (select) select.value = room;
  });
});

/* ---------- ENQUIRY FORM -> SMS HANDOFF ---------- */
const form = document.getElementById('enquiryForm');
const success = document.getElementById('formSuccess');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
  const room = document.getElementById('froom').value;
  const msg = document.getElementById('fmsg').value.trim();

  const body = `Hi Alnoor Boys Hostel, I'd like to enquire about a room.%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0ARoom Type: ${encodeURIComponent(room)}%0AMessage: ${encodeURIComponent(msg || 'N/A')}`;
  const smsLink = `sms:03455071777?&body=${body}`;

  success.classList.add('show');
  window.location.href = smsLink;
});

/* ---------- THREE.JS: EXPERIENCE SCENE (hostel building + daily life icons) ---------- */
(function experienceScene(){
  const canvas = document.getElementById('expCanvas');
  const wrap = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  camera.position.set(4.5, 2.6, 6.5);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);

  const amber = 0xe3a857;
  const teal = 0x49d4c6;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const p1 = new THREE.PointLight(amber, 2, 20);
  p1.position.set(4, 5, 4);
  scene.add(p1);
  const p2 = new THREE.PointLight(teal, 1, 20);
  p2.position.set(-4, 1, -3);
  scene.add(p2);

  const building = new THREE.Group();
  const floors = 4;
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c1f27, roughness: 0.6, metalness: 0.2 });
  const windowMat = new THREE.MeshStandardMaterial({ color: amber, emissive: amber, emissiveIntensity: 0.6, roughness: 0.4 });
  const windowOffMat = new THREE.MeshStandardMaterial({ color: 0x35383f, roughness: 0.6 });

  for (let f = 0; f < floors; f++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 1.8), floorMat);
    slab.position.y = f * 0.82;
    building.add(slab);
    for (let w = 0; w < 3; w++) {
      const lit = Math.random() > 0.35;
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.05), lit ? windowMat.clone() : windowOffMat);
      win.position.set(-0.85 + w * 0.85, f * 0.82, 0.93);
      win.userData.blinking = lit;
      building.add(win);
    }
  }
  building.position.y = -1.4;
  scene.add(building);

  // Orbiting daily-life icons: fork/knife (mess), wifi dot, laundry ring
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const iconMat1 = new THREE.MeshStandardMaterial({ color: teal, emissive: teal, emissiveIntensity: 0.4 });
  const mess = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 5), iconMat1);
  mess.position.set(2.6, 0.6, 0);
  orbitGroup.add(mess);

  const iconMat2 = new THREE.MeshStandardMaterial({ color: amber, emissive: amber, emissiveIntensity: 0.5 });
  const wifiDot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), iconMat2);
  wifiDot.position.set(-2.6, 1.2, 1);
  orbitGroup.add(wifiDot);

  const laundryMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.5 });
  const laundry = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 24), laundryMat);
  laundry.position.set(0, 2.6, -2);
  orbitGroup.add(laundry);

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    building.rotation.y = Math.sin(t * 0.15) * 0.25 + 0.2;

    mess.position.x = Math.cos(t * 0.4) * 2.6;
    mess.position.z = Math.sin(t * 0.4) * 2.6;
    mess.rotation.y = t;

    wifiDot.position.x = Math.cos(t * 0.3 + 2) * 2.9;
    wifiDot.position.z = Math.sin(t * 0.3 + 2) * 2.9;
    wifiDot.position.y = 1.2 + Math.sin(t * 1.2) * 0.15;

    laundry.rotation.x = t * 0.8;
    laundry.rotation.y = t * 0.5;
    laundry.position.x = Math.cos(t * 0.25 + 4) * 2.2;
    laundry.position.z = Math.sin(t * 0.25 + 4) * 2.2;

    building.children.forEach(child => {
      if (child.userData.blinking) {
        child.material.emissiveIntensity = 0.4 + Math.sin(t * 2 + child.position.y * 3) * 0.3;
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  function onResize(){
    const w = wrap.clientWidth, h = wrap.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
})();
