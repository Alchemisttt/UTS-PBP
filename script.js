// ====== PENGATURAN (edit di sini) ======
const WEDDING_DATE = new Date('2026-12-20T08:00:00+07:00');
const RSVP_URL = '';
const GALLERY = [
  'img/galery1.jpg', 'img/galery2.jpg', 'img/galery3.jpg',
  'img/galery4.jpg', 'img/galery5.jpg', 'img/galery6.jpg'
];
const $ = (s) => document.querySelector(s);


const to = new URLSearchParams(location.search).get('to');
if (to) { $('#guest').textContent = to; $('#nama').value = to; }

for (let i = 0; i < 36; i++) {
  const p = document.createElement('i');
  const s = 6 + Math.random() * 10;
  p.style.width = s + 'px'; p.style.height = s * 1.4 + 'px';
  p.style.left = Math.random() * 100 + '%';
  p.style.animationDuration = 8 + Math.random() * 8 + 's';
  p.style.animationDelay = -Math.random() * 12 + 's';
  $('.petals').appendChild(p);
}

function tick() {
  let d = Math.max(0, WEDDING_DATE - new Date()) / 1000;
  $('#countdown').innerHTML = [['hari', 86400], ['jam', 3600], ['menit', 60], ['detik', 1]].map(([l, s]) => {
    const v = Math.floor(d / s); d -= v * s;
    return `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`;
  }).join('');
}
tick(); setInterval(tick, 1000);

const song = $('#song'), music = $('#music'), icon = music.querySelector('i');
const VOL = 0.35; let fadeT, wantPlay = false, broken = false;
const setIcon = (on) => { music.classList.toggle('on', on); icon.className = 'bi ' + (on ? 'bi-music-note-beamed' : 'bi-volume-mute-fill'); };
function fadeTo(v, ms = 1500, done) {
  clearInterval(fadeT);
  const from = song.volume, t0 = performance.now();
  fadeT = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    song.volume = from + (v - from) * k;
    if (k === 1) { clearInterval(fadeT); if (done) done(); }
  }, 50);
}
function playSong() {
  song.volume = 0;
  return song.play().then(() => { wantPlay = true; setIcon(true); fadeTo(VOL); }).catch(() => setIcon(false));
}
function pauseSong() { wantPlay = false; setIcon(false); fadeTo(0, 600, () => song.pause()); }
song.addEventListener('error', () => { broken = true; music.hidden = true; }, true);
$('#openBtn').onclick = () => {
  $('#cover').classList.add('open');
  document.body.classList.remove('locked');
  music.hidden = broken;
  if (!broken) playSong();
};
music.onclick = () => (song.paused ? playSong() : pauseSong());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) song.pause(); else if (wantPlay) song.play().catch(() => {});
});

const inner = $('#galInner');
document.querySelectorAll('.ph').forEach((btn, i) => {
  if (GALLERY[i]) btn.style.backgroundImage = `url(${GALLERY[i]})`;
  const item = document.createElement('div');
  item.className = 'carousel-item' + (i === 0 ? ' active' : '');
  item.innerHTML = `<div class="item" style="${GALLERY[i] ? `background-image:url(${GALLERY[i]})` : ''}"></div>`;
  inner.appendChild(item);
});
$('#galModal').addEventListener('show.bs.modal', (e) => {
  const i = +e.relatedTarget.dataset.i;
  bootstrap.Carousel.getOrCreateInstance('#galCarousel', { ride: false }).to(i);
});

document.querySelectorAll('.copy').forEach((b) => b.onclick = async () => {
  await navigator.clipboard.writeText($('#' + b.dataset.t).textContent);
  b.innerHTML = '<i class="bi bi-check2"></i> Tersalin';
  setTimeout(() => b.innerHTML = '<i class="bi bi-clipboard"></i> Salin', 1500);
});

$('#calBtn').onclick = (e) => {
  e.preventDefault();
  const f = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(WEDDING_DATE.getTime() + 6 * 3600e3);
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Pernikahan Aldi & Naya\nDTSTART:${f(WEDDING_DATE)}\nDTEND:${f(end)}\nEND:VEVENT\nEND:VCALENDAR`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'pernikahan.ics'; a.click();
};
const form = $('#rsvpForm'), msg = $('#rsvpMsg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;
  const data = new FormData(form);
  try {
    if (RSVP_URL) await fetch(RSVP_URL, { method: 'POST', body: data });
    msg.textContent = 'Terima kasih, konfirmasi Anda sudah terkirim.';
    msg.className = 'alert alert-success mt-3';
    const text = (data.get('ucapan') || '').trim();
    if (text) {
      const li = document.createElement('li');
      li.className = 'list-group-item wish-new';
      const b = document.createElement('b'); b.textContent = data.get('nama');
      li.append(b, document.createElement('br'), text); // aman dari injeksi HTML
      $('#wishes').prepend(li);
    }
    form.reset(); form.classList.remove('was-validated');
  } catch {
    msg.textContent = 'Gagal mengirim. Coba lagi sebentar lagi.';
    msg.className = 'alert alert-danger mt-3';
  }
});

const REVEAL = [
  ['.quote .col-md-8', 'zoom'], ['.sec h2', 'up'], ['.sec .sub', 'up'],
  ['#couple .col-md-5:first-child', 'left'], ['#couple .col-md-5:last-child', 'right'], ['#couple .amp', 'zoom'],
  ['#event .col-md-5:first-child', 'left'], ['#event .col-md-5:last-child', 'right'], ['#event .col-md-10', 'up'],
  ['.timeline li:not(.inv)', 'left'], ['.timeline li.inv', 'right'],
  ['#galleryGrid .col', 'zoom'], ['#rsvp form', 'up'], ['#rsvp h3', 'up'],
  ['#gift .col-md-5', 'up'], ['footer .container', 'up']
];
const revealEls = [];
REVEAL.forEach(([sel, kind]) => document.querySelectorAll(sel).forEach((el, i) => {
  if (el.classList.contains('rv')) return;
  el.classList.add('rv', 'rv-' + kind);
  el.style.transitionDelay = (i % 4) * 0.12 + 's';
  el.addEventListener('transitionend', () => {
    el.classList.remove('rv', 'rv-' + kind, 'in'); el.style.transitionDelay = '';
  }, { once: true });
  revealEls.push(el);
}));
function startReveal() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  setTimeout(() => revealEls.forEach((el) => io.observe(el)), 500);
}
$('#openBtn').addEventListener('click', startReveal);
