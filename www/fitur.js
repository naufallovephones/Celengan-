(function () {
  const css = document.createElement('style');
  css.textContent = `
    .mk { text-align:center; }
    .mk .em { font-size:64px; display:inline-block; animation:nafas 1.8s ease-in-out infinite; cursor:pointer; }
    .mk .lv { font-weight:700; margin-top:2px; }
    .xp { height:8px; background:var(--line); border-radius:99px; overflow:hidden; margin:8px auto 4px; max-width:260px; }
    .xp div { height:100%; background:linear-gradient(90deg,var(--main2),var(--main)); width:0; transition:width .6s; }
    .toples { margin-top:14px; }
    .toples svg { width:130px; height:150px; }
    .koin { animation:koinJatuh .7s ease-in both; }
    @keyframes nafas { 0%,100% { transform:scale(1); } 50% { transform:scale(1.12); } }
    @keyframes koinJatuh { from { transform:translateY(-130px); opacity:0; } to { transform:none; opacity:1; } }
    #bioLock { position:fixed; inset:0; z-index:300; background:linear-gradient(160deg,var(--main),var(--main2)); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; }
    #bioLock button { flex:none; width:220px; background:rgba(255,255,255,.25); }
  `;
  document.head.appendChild(css);

  const TAHAP = [['🥚','Telur',0],['🐣','Menetas',1],['🐥','Anak Ayam',5],['🐔','Ayam Jago',15],['🦅','Elang',35],['🐉','Naga Emas',70]];
  function xpTotal() {
    let n = 0;
    data.celengan.forEach(c => c.log.forEach(x => { if (x.nominal > 0) n++; }));
    return n;
  }
  function tahap(xp) { let i = 0; TAHAP.forEach((t, k) => { if (xp >= t[2]) i = k; }); return i; }

  const kartu = document.createElement('div');
  kartu.className = 'card mk';
  kartu.innerHTML = '<div class="em" id="mkEm"></div><div class="lv" id="mkNama"></div><div class="xp"><div id="mkXp"></div></div><div class="muted" id="mkInfo"></div><div class="toples"><svg viewBox="0 0 120 150" id="tpSvg"></svg><div class="muted" id="tpInfo"></div></div>';
  const hero = document.querySelector('.hero');
  if (hero) hero.after(kartu);

  function gambarMaskot() {
    const xp = xpTotal(), i = tahap(xp), t = TAHAP[i], nxt = TAHAP[i + 1];
    $('mkEm').textContent = t[0];
    $('mkEm').onclick = () => {
      const n = prompt('Nama maskot', data.mkNama || '');
      if (n !== null) { data.mkNama = n.trim().slice(0, 16); simpan(); render(); }
    };
    $('mkNama').textContent = (data.mkNama ? data.mkNama + ' · ' : '') + t[1] + ' · Level ' + (i + 1);
    $('mkXp').style.width = (nxt ? Math.min(100, (xp - t[2]) / (nxt[2] - t[2]) * 100) : 100) + '%';
    $('mkInfo').textContent = nxt ? 'Nabung ' + (nxt[2] - xp) + ' kali lagi untuk berevolusi jadi ' + nxt[1] : 'Level maksimal! Kamu hebat 🎉';
    if (typeof data.lv === 'number' && i > data.lv) {
      toast(t[0] + ' Maskotmu naik level jadi ' + t[1] + '!');
      hujan(['✨', t[0]], 24); bunyi('raya');
    }
    if (data.lv !== i) { data.lv = i; simpan(); }
  }

  let prevKoin = 0;
  function gambarToples() {
    const c = C(), saldo = hitung(c.log);
    const pct = c.target > 0 ? Math.max(0, Math.min(100, saldo / c.target * 100)) : 0;
    const n = Math.round(pct / 100 * 30);
    let s = '<rect x="30" y="8" width="60" height="14" rx="5" fill="var(--main)"/><path d="M24 24 H96 V32 Q108 38 108 52 V128 Q108 144 92 144 H28 Q12 144 12 128 V52 Q12 38 24 32 Z" fill="none" stroke="var(--muted)" stroke-width="3"/>';
    for (let k = 0; k < n; k++) {
      const row = Math.floor(k / 5), col = k % 5;
      const cx = 30 + col * 15 + (row % 2) * 7, cy = 134 - row * 13;
      const baru = k >= prevKoin;
      s += '<g' + (baru ? ' class="koin" style="animation-delay:' + ((k - prevKoin) * 0.05) + 's"' : '') + '><circle cx="' + cx + '" cy="' + cy + '" r="7.5" fill="#fbbf24" stroke="#b47a0a" stroke-width="1.5"/><circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="none" stroke="#d99a0a" stroke-width="1"/></g>';
    }
    $('tpSvg').innerHTML = s;
    prevKoin = n;
    $('tpInfo').textContent = c.target > 0 ? 'Toples terisi ' + Math.round(pct) + '%' : 'Atur target di bawah supaya toples ini terisi';
  }

  const kartuA = document.createElement('div');
  kartuA.className = 'card';
  kartuA.innerHTML = '<div class="muted">Analisis pintar</div><div id="anTeks" style="margin-top:6px;line-height:1.5"></div>';
  const kc = document.getElementById('chart') && document.getElementById('chart').closest('.card');
  if (kc) kc.after(kartuA);

  function analisis() {
    const c = C(), saldo = hitung(c.log), el = $('anTeks');
    if (!c.log.some(x => x.nominal > 0)) { el.textContent = 'Belum ada data. Mulai nabung dulu, nanti saya hitung kecepatan nabungmu.'; return; }
    const awal = Math.min.apply(null, c.log.map(x => x.waktu));
    const hari = Math.max(1, (Date.now() - awal) / 86400000);
    const laju = saldo / hari;
    let t = 'Rata-rata ' + fmt(Math.max(0, laju)) + '/hari (' + fmt(Math.max(0, laju) * 7) + '/minggu).';
    if (c.target > 0) {
      if (saldo >= c.target) t += ' 🎉 Target sudah tercapai!';
      else if (hari < 2) t += ' Butuh data minimal 2 hari untuk prediksi target.';
      else if (laju <= 0) t += ' Tabunganmu belum naik, jadi target belum bisa diprediksi.';
      else {
        const sisaHari = Math.ceil((c.target - saldo) / laju);
        const tgl = new Date(Date.now() + sisaHari * 86400000);
        t += ' Dengan kecepatan ini target tercapai sekitar ' + tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' (' + sisaHari + ' hari lagi).';
        if (c.tanggal) {
          const selisih = Math.round((new Date(c.tanggal + 'T23:59:59') - tgl) / 86400000);
          t += selisih >= 0 ? ' ✅ ' + selisih + ' hari lebih cepat dari tanggal targetmu.' : ' ⚠️ ' + (-selisih) + ' hari lebih lambat dari tanggal targetmu.';
        }
      }
    } else t += ' Atur target supaya saya bisa memprediksi kapan tercapai.';
    el.textContent = t;
  }

  const asli = render;
  render = function () {
    asli();
    if (data.celengan.length) { gambarMaskot(); gambarToples(); analisis(); }
    if ($('bioChk')) $('bioChk').checked = !!data.bio;
  };

  const baris = document.createElement('div');
  baris.className = 'opsi';
  baris.innerHTML = '<span>Kunci sidik jari</span><input id="bioChk" type="checkbox">';
  const tombolPin = document.getElementById('btnPin');
  if (tombolPin) tombolPin.before(baris);

  function adaBio(cb) {
    if (!window.Fingerprint) return cb(false);
    window.Fingerprint.isAvailable(function () { cb(true); }, function () { cb(false); });
  }
  function mintaBio(ok, gagal) {
    window.Fingerprint.show({ title: 'NabungYuk', description: 'Buka dengan sidik jari', disableBackup: false }, ok, gagal || function () {});
  }

  document.getElementById('bioChk').onchange = function (e) {
    const cb = e.target;
    if (!cb.checked) { data.bio = false; simpan(); return; }
    adaBio(function (ok) {
      if (!ok) { cb.checked = false; alert('Sidik jari tidak tersedia di HP ini, belum didaftarkan, atau plugin tidak terpasang.'); return; }
      mintaBio(function () { data.bio = true; simpan(); toast('Kunci sidik jari aktif'); }, function () { cb.checked = false; });
    });
  };

  function coba() {
    mintaBio(function () { const o = document.getElementById('bioLock'); if (o) o.remove(); });
  }
  if (data.bio) {
    const o = document.createElement('div');
    o.id = 'bioLock';
    o.innerHTML = '<div style="font-size:64px">🔐</div><div>NabungYuk terkunci</div><button id="bioBtn">Buka dengan sidik jari</button>';
    document.body.appendChild(o);
    document.getElementById('bioBtn').onclick = function () { if (window.Fingerprint) coba(); };
    document.addEventListener('deviceready', function () {
      if (!window.Fingerprint) { o.remove(); toast('Plugin sidik jari tidak tersedia, kunci dimatikan sementara.'); return; }
      coba();
    });
  }

  render();
})();
(function () {
  const WARNA = [
    ['merah', '#dc2626', '#fb7185'], ['kuning', '#eab308', '#fde047'], ['tosca', '#0d9488', '#5eead4'],
    ['pink', '#db2777', '#f9a8d4'], ['hitam', '#111827', '#4b5563'], ['cokelat', '#92400e', '#d97706'],
    ['nila', '#4338ca', '#818cf8'], ['limau', '#4d7c0f', '#a3e635'], ['langit', '#0284c7', '#7dd3fc'],
    ['magenta', '#a21caf', '#e879f9'], ['abu', '#475569', '#94a3b8']
  ];
  let css = '';
  WARNA.forEach(w => {
    TEMA.push([w[0], w[1]]);
    css += 'html[data-tema=' + w[0] + '] { --main:' + w[1] + '; --main2:' + w[2] + '; }\n';
  });
  css += `
    @media (prefers-color-scheme: dark) { html[data-tema=hitam] { --main:#374151; --main2:#9ca3af; } }
    html[data-tema=kuning] .hero, html[data-tema=kuning] #splash, html[data-tema=kuning] #lock, html[data-tema=kuning] #bioLock { color:#422006; }
    html[data-tema=kuning] .hero .muted { color:rgba(66,32,6,.8); }
    .dots { flex-wrap:wrap; }
    .mk .em { position:relative; }
    .ak { position:absolute; top:-14px; right:-16px; font-size:30px; }
    .ov { position:fixed; inset:0; z-index:400; background:rgba(0,0,0,.85); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:16px; color:#fff; text-align:center; }
    .ov img { max-width:90%; max-height:70%; border-radius:16px; }
    .ov button { flex:none; width:200px; }
  `;
  const gaya = document.createElement('style');
  gaya.textContent = css;
  document.head.appendChild(gaya);

  const kartuBaru = (html) => { const d = document.createElement('div'); d.className = 'card'; d.innerHTML = html; return d; };
  const NOL = () => data.cur === 'IDR' || data.cur === 'JPY';

  window.angka = function (s) {
    s = String(s == null ? '' : s).trim();
    s = NOL() ? s.replace(/\./g, '').replace(/,/g, '.') : s.replace(/,/g, '');
    return parseFloat(s);
  };
  const bersih = v => NOL() ? String(v).replace(/\D/g, '') : String(v).replace(/,/g, '');
  function formatKolom(el) {
    if (!NOL()) return;
    const d = el.value.replace(/\D/g, '');
    el.value = d ? Number(d).toLocaleString('id-ID') : '';
  }
  function pasangKolom(id) {
    const el = $(id);
    if (!el) return;
    if (el.type !== 'text') { el.type = 'text'; el.removeAttribute('step'); }
    el.setAttribute('inputmode', NOL() ? 'numeric' : 'decimal');
    el.oninput = function () { formatKolom(el); if (id === 'smJ') simulasi(); };
  }

  const tambahAsli = tambah;
  tambah = function (t) {
    const el = $('jumlah'), asal = el.value;
    el.value = bersih(asal);
    tambahAsli(t);
    if (el.value !== '') el.value = asal;
  };
  const targetAsli = setTarget;
  setTarget = function () {
    const el = $('target');
    el.value = bersih(el.value);
    targetAsli();
    el.value = '';
  };
  function pasangQuick() {
    const Q = data.cur === 'IDR' ? [10000, 50000, 100000] : data.cur === 'JPY' ? [1000, 5000, 10000] : [5, 10, 50];
    Array.from($('quick').children).forEach((b, i) => {
      b.onclick = () => {
        const el = $('jumlah'), v = bulat((angka(el.value) || 0) + Q[i]);
        el.value = NOL() ? Number(v).toLocaleString('id-ID') : String(v);
      };
    });
  }

  // ---- nabung pembulatan ----
  const ruKartu = kartuBaru('<div class="muted">Nabung pembulatan</div><input id="ruHarga" type="text" placeholder="Harga belanja" style="margin-top:8px"><select id="ruK"></select><button style="width:100%" id="ruBtn">Bulatkan dan tabung selisihnya</button><div class="muted" style="margin-top:8px" id="ruInfo"></div>');
  const jk = document.getElementById('jumlah') && document.getElementById('jumlah').closest('.card');
  if (jk) jk.after(ruKartu);
  let ruCur = '';
  function isiOpsiRu() {
    if (ruCur === data.cur || !$('ruK')) return;
    ruCur = data.cur;
    const o = data.cur === 'IDR' ? [1000, 5000, 10000] : data.cur === 'JPY' ? [100, 500, 1000] : [1, 5, 10];
    $('ruK').innerHTML = '';
    o.forEach(v => { const op = document.createElement('option'); op.value = v; op.textContent = 'Bulatkan ke ' + fmt(v); $('ruK').appendChild(op); });
  }
  function bulatTabung() {
    const c = C();
    if (!c) return;
    const harga = angka($('ruHarga').value), k = parseFloat($('ruK').value);
    if (!harga || harga <= 0) return alert('Isi harga belanja dulu.');
    const naik = Math.ceil(harga / k) * k, selisih = bulat(naik - harga);
    if (selisih <= 0) return alert('Harga sudah bulat, tidak ada selisih untuk ditabung.');
    snap();
    c.log.push({ nominal: selisih, catatan: 'Pembulatan ' + fmt(harga) + ' ke ' + fmt(naik), waktu: Date.now() });
    $('ruHarga').value = '';
    simpan(); render();
    hujan(['🪙'], 8); bunyi('koin');
    toast('Menabung selisih ' + fmt(selisih));
  }
  if ($('ruBtn')) $('ruBtn').onclick = bulatTabung;

  // ---- tantangan amplop acak ----
  const apKartu = kartuBaru('<div class="head"><div class="muted">Tantangan amplop acak</div><button class="small" id="apBtn">Mulai</button></div><div class="muted" id="apInfo"></div><div class="tg" id="apGrid"></div>');
  const tk = document.getElementById('tanGrid') && document.getElementById('tanGrid').closest('.card');
  if (tk) tk.after(apKartu);

  function acak(total, n) {
    const u = data.cur === 'IDR' ? 1000 : data.cur === 'JPY' ? 100 : 1;
    const T = Math.max(n, Math.round(total / u));
    const w = Array.from({ length: n }, () => Math.random() + 0.25);
    const sw = w.reduce((a, b) => a + b, 0);
    const v = w.map(x => Math.max(1, Math.floor(x / sw * T)));
    let diff = T - v.reduce((a, b) => a + b, 0), g = 0;
    while (diff !== 0 && g++ < 100000) {
      const i = Math.floor(Math.random() * n);
      if (diff > 0) { v[i]++; diff--; } else if (v[i] > 1) { v[i]--; diff++; }
    }
    return v.map(x => x * u);
  }
  function aturAmplop() {
    const c = C();
    if (!c) return;
    if (c.amplop) {
      if (!confirm('Hapus tantangan amplop ini? (Transaksi yang sudah tercatat tetap ada)')) return;
      snap(); c.amplop = null; simpan(); render(); return;
    }
    const total = angka(prompt('Total yang mau dikumpulkan?', data.cur === 'IDR' ? '1.000.000' : '1000'));
    if (!total || total <= 0) return alert('Total tidak valid.');
    let n = parseInt(prompt('Jumlah amplop (maksimal 100)?', '50'), 10);
    if (!n || n < 2) return alert('Jumlah amplop tidak valid.');
    n = Math.min(100, n);
    snap();
    c.amplop = { total: total, nilai: acak(total, n), buka: [] };
    simpan(); render(); toast('Amplop siap dibuka!');
  }
  function bukaAmplop(i) {
    const c = C(), a = c.amplop;
    if (a.buka.includes(i)) return toast('Amplop #' + (i + 1) + ' sudah dibuka: ' + fmt(a.nilai[i]));
    snap();
    a.buka.push(i);
    c.log.push({ nominal: a.nilai[i], catatan: 'Amplop #' + (i + 1), waktu: Date.now() });
    simpan(); render();
    hujan(['💌', '🪙'], 10); bunyi('koin');
    toast('Amplop #' + (i + 1) + ' berisi ' + fmt(a.nilai[i]) + '!');
    if (a.buka.length >= a.nilai.length) setTimeout(() => { hujan(['🏆', '🎉', '✨'], 36); bunyi('raya'); }, 500);
  }
  function gambarAmplop() {
    const c = C(), a = c.amplop, g = $('apGrid');
    g.innerHTML = '';
    $('apBtn').textContent = a ? 'Hapus' : 'Mulai';
    $('apBtn').onclick = aturAmplop;
    if (!a) { $('apInfo').textContent = 'Buka amplop bernomor satu per satu. Isinya acak, totalnya pas dengan targetmu!'; return; }
    const dapat = a.buka.reduce((s, i) => s + a.nilai[i], 0);
    $('apInfo').textContent = a.buka.length + '/' + a.nilai.length + ' dibuka · terkumpul ' + fmt(dapat) + ' dari ' + fmt(a.total);
    a.nilai.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'cell' + (a.buka.includes(i) ? ' ok' : '');
      b.textContent = i + 1;
      b.onclick = () => bukaAmplop(i);
      g.appendChild(b);
    });
  }

  // ---- simulator nabung ----
  const smKartu = kartuBaru('<div class="muted">Simulator nabung</div><div class="row" style="margin-top:8px"><input id="smJ" type="text" placeholder="Nabung berapa?"><select id="smP"><option value="1">per hari</option><option value="7" selected>per minggu</option><option value="30">per bulan</option></select></div><input id="smD" type="number" inputmode="numeric" value="12" placeholder="Selama berapa bulan?"><div class="muted" style="line-height:1.5" id="smHasil"></div>');
  const ak = document.getElementById('anTeks') && document.getElementById('anTeks').closest('.card');
  if (ak) ak.after(smKartu);
  function simulasi() {
    const c = C();
    if (!c || !$('smHasil')) return;
    const j = angka($('smJ').value), per = parseInt($('smP').value, 10), bln = parseFloat($('smD').value);
    const el = $('smHasil');
    if (!j || j <= 0) { el.textContent = 'Isi nominal untuk melihat perkiraan.'; return; }
    const perHari = j / per, saldo = hitung(c.log);
    let t = '';
    if (bln > 0) t += 'Dalam ' + bln + ' bulan terkumpul ' + fmt(perHari * bln * 30) + ', jadi saldo sekitar ' + fmt(saldo + perHari * bln * 30) + '. ';
    if (c.target > 0 && saldo < c.target) {
      const hari = Math.ceil((c.target - saldo) / perHari);
      const tgl = new Date(Date.now() + hari * 86400000);
      t += 'Target ' + fmt(c.target) + ' tercapai sekitar ' + tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' (' + hari + ' hari lagi).';
    } else if (c.target > 0) t += 'Targetmu sudah tercapai 🎉';
    el.textContent = t;
  }
  if ($('smP')) $('smP').onchange = simulasi;
  if ($('smD')) $('smD').oninput = simulasi;

  // ---- streak dan lencana tambahan ----
  function semuaMasuk() {
    const r = [];
    data.celengan.forEach(c => c.log.forEach(x => { if (x.nominal > 0) r.push(x); }));
    return r;
  }
  function hitungStreak() {
    const m = semuaMasuk();
    if (!m.length) return { streak: 0, beku: 1, rekor: 0 };
    const hari = new Set(m.map(x => new Date(x.waktu).toDateString()));
    const awal = new Date(Math.min.apply(null, m.map(x => x.waktu)));
    awal.setHours(0, 0, 0, 0);
    const kini = new Date();
    kini.setHours(0, 0, 0, 0);
    let streak = 0, beku = 1, rekor = 0;
    for (let d = new Date(awal); d <= kini; d.setDate(d.getDate() + 1)) {
      if (hari.has(d.toDateString())) { streak++; if (streak % 7 === 0) beku = Math.min(3, beku + 1); }
      else if (d.getTime() === kini.getTime()) { /* hari ini belum berakhir */ }
      else if (beku > 0) beku--;
      else streak = 0;
      rekor = Math.max(rekor, streak);
    }
    return { streak: streak, beku: beku, rekor: rekor };
  }
  function gambarLencanaTambahan() {
    const m = semuaMasuk(), st = hitungStreak();
    const total = m.reduce((s, x) => s + x.nominal, 0);
    const batas = data.cur === 'IDR' ? 1000000 : data.cur === 'JPY' ? 100000 : 1000;
    const lv = levelXp(m.length);
    const bulatN = m.filter(x => String(x.catatan || '').indexOf('Pembulatan') === 0).length;
    const amp = data.celengan.some(c => c.amplop && c.amplop.nilai.length && c.amplop.buka.length >= c.amplop.nilai.length);
    const daftar = [
      ['🔥', 'Beruntun 30 hari', st.rekor >= 30], ['💯', 'Nabung 100 kali', m.length >= 100],
      ['💎', 'Total ' + fmt(batas), total >= batas], ['🗂️', 'Punya 3 celengan', data.celengan.length >= 3],
      ['🐲', 'Maskot maksimal', lv >= 5], ['🧾', 'Pembulatan 10 kali', bulatN >= 10], ['💌', 'Amplop selesai', amp]
    ];
    daftar.forEach(([e, n, on]) => {
      const el = document.createElement('div');
      el.className = 'bd' + (on ? ' on' : '');
      el.innerHTML = '<i></i><span></span>';
      el.children[0].textContent = e;
      el.children[1].textContent = n;
      $('bdg').appendChild(el);
    });
  }
  function gambarStreak() {
    const st = hitungStreak();
    if ($('stRow')) $('stRow').textContent = '🔥 ' + st.streak + ' hari beruntun · ❄️ ' + st.beku + ' pembekuan streak · rekor ' + st.rekor + ' hari';
  }

  // ---- maskot: jenis dan aksesori ----
  const JENIS = {
    ayam: [['🥚', 'Telur'], ['🐣', 'Menetas'], ['🐥', 'Anak Ayam'], ['🐔', 'Ayam Jago'], ['🦅', 'Elang'], ['🐉', 'Naga Emas']],
    kucing: [['🥚', 'Telur'], ['🐱', 'Anak Kucing'], ['😸', 'Kucing Ceria'], ['🐈', 'Kucing Dewasa'], ['🐯', 'Harimau'], ['🦁', 'Raja Singa']],
    robot: [['🔩', 'Baut'], ['🤖', 'Robot Mini'], ['🦾', 'Robot Kuat'], ['🛰️', 'Satelit'], ['🛸', 'Pesawat Alien'], ['🚀', 'Roket Emas']]
  };
  const AMBANG = [0, 1, 5, 15, 35, 70];
  const AKSESO = [['🎩', 'Topi', 10], ['🕶️', 'Kacamata', 20], ['🎀', 'Pita', 15], ['👑', 'Mahkota', 50], ['🧣', 'Syal', 25]];
  function levelXp(xp) { let i = 0; AMBANG.forEach((a, k) => { if (xp >= a) i = k; }); return i; }

  const kk = document.querySelector('.card.mk');
  if (kk) {
    const toko = document.createElement('div');
    toko.style.marginTop = '12px';
    toko.innerHTML = '<div class="muted" id="poinInfo"></div><select id="mkJenis" style="margin-top:8px"><option value="ayam">Maskot: Ayam</option><option value="kucing">Maskot: Kucing</option><option value="robot">Maskot: Robot</option></select><div id="aksesoRow" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"></div><div class="muted" id="stRow" style="margin-top:10px"></div>';
    kk.appendChild(toko);
    $('mkJenis').onchange = function () { data.mkJenis = $('mkJenis').value; simpan(); render(); };
  }
  function gambarMaskot9(prev, lv) {
    if (!$('mkEm')) return;
    const xp = semuaMasuk().length, J = JENIS[data.mkJenis] || JENIS.ayam, t = J[lv];
    $('mkEm').innerHTML = '<span class="ak"></span>';
    $('mkEm').firstChild.textContent = data.akPakai || '';
    $('mkEm').appendChild(document.createTextNode(t[0]));
    $('mkNama').textContent = (data.mkNama ? data.mkNama + ' · ' : '') + t[1] + ' · Level ' + (lv + 1);
    $('mkInfo').textContent = J[lv + 1] ? 'Nabung ' + (AMBANG[lv + 1] - xp) + ' kali lagi untuk berevolusi jadi ' + J[lv + 1][1] : 'Level maksimal! Kamu hebat 🎉';
    if (typeof prev === 'number' && lv > prev) { toast(t[0] + ' Maskotmu naik level jadi ' + t[1] + '!'); hujan(['✨', t[0]], 24); bunyi('raya'); }
    const poin = Math.max(0, xp - (data.poinPakai || 0));
    $('poinInfo').textContent = '⭐ Poin: ' + poin + ' (1 poin tiap nabung)';
    $('mkJenis').value = data.mkJenis || 'ayam';
    const row = $('aksesoRow');
    row.innerHTML = '';
    AKSESO.forEach(([em, nama, harga]) => {
      const milik = (data.akMilik || []).includes(em), pakai = data.akPakai === em;
      const b = document.createElement('button');
      b.className = 'small';
      b.textContent = em + ' ' + (milik ? (pakai ? '✓ dipakai' : 'pakai') : harga + ' poin');
      b.onclick = () => {
        if (milik) { data.akPakai = pakai ? '' : em; simpan(); render(); return; }
        if (poin < harga) return toast('Poin belum cukup untuk ' + nama);
        if (!confirm('Beli ' + nama + ' ' + em + ' seharga ' + harga + ' poin?')) return;
        data.poinPakai = (data.poinPakai || 0) + harga;
        data.akMilik = (data.akMilik || []).concat(em);
        data.akPakai = em;
        simpan(); render(); toast(nama + ' dibeli dan dipakai!');
      };
      row.appendChild(b);
    });
  }

  // ---- laporan dan bagikan ----
  const lpKartu = kartuBaru('<div class="muted">Bagikan dan laporan</div><div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="small" id="lpKartu">🖼️ Kartu pencapaian</button><button class="small" id="lpCsv">📄 Ekspor CSV</button><button class="small" id="lpBulan">📊 Laporan bulan ini</button></div><div class="muted" style="margin-top:8px">Hasil bisa dibagikan lewat WhatsApp dan sejenisnya. Kalau tombol berbagi tidak tersedia, teksnya disalin ke kotak Backup.</div>');
  const bk = document.getElementById('backup') && document.getElementById('backup').closest('.card');
  if (bk) bk.after(lpKartu);

  function overlay(html, tutupTeks) {
    const o = document.createElement('div');
    o.className = 'ov';
    o.innerHTML = html + '<button id="ovTutup">' + (tutupTeks || 'Tutup') + '</button>';
    document.body.appendChild(o);
    document.getElementById('ovTutup').onclick = () => o.remove();
  }
  function bagikan(teks, gambar) {
    const sp = window.plugins && window.plugins.socialsharing;
    if (sp) {
      const opsi = { message: teks, subject: 'NabungYuk' };
      if (gambar) opsi.files = [gambar];
      sp.shareWithOptions(opsi, function () {}, function () {});
      return;
    }
    if (!gambar && navigator.share) { navigator.share({ text: teks }).catch(function () {}); return; }
    if (gambar) {
      overlay('<div>Tekan lama gambar untuk menyimpan, atau screenshot layar ini lalu bagikan.</div><img src="' + gambar + '">');
    } else {
      $('backup').value = teks;
      $('backup').focus(); $('backup').select();
      try { document.execCommand('copy'); } catch (e) {}
      toast('Teks disalin ke kotak Backup');
    }
  }

  function buatKartu() {
    const c = C(), xp = semuaMasuk().length, lv = levelXp(xp), J = JENIS[data.mkJenis] || JENIS.ayam;
    const cv = document.createElement('canvas');
    cv.width = 720; cv.height = 900;
    const g = cv.getContext('2d'), gaya2 = getComputedStyle(document.documentElement);
    const m1 = gaya2.getPropertyValue('--main').trim() || '#16a34a', m2 = gaya2.getPropertyValue('--main2').trim() || '#4ade80';
    const gr = g.createLinearGradient(0, 0, 720, 900);
    gr.addColorStop(0, m1); gr.addColorStop(1, m2);
    g.fillStyle = gr; g.fillRect(0, 0, 720, 900);
    g.fillStyle = '#ffffff'; g.textAlign = 'center';
    g.font = 'bold 34px sans-serif'; g.fillText('NabungYuk', 360, 80);
    g.font = '190px sans-serif'; g.fillText((data.akPakai || '') + J[lv][0], 360, 330);
    g.font = 'bold 46px sans-serif'; g.fillText(c.emoji + ' ' + c.nama, 360, 430);
    const saldo = hitung(c.log);
    g.font = 'bold 62px sans-serif'; g.fillText(fmt(saldo), 360, 520);
    if (c.target > 0) {
      const pct = Math.max(0, Math.min(1, saldo / c.target));
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(110, 560, 500, 28);
      g.fillStyle = '#ffffff'; g.fillRect(110, 560, 500 * pct, 28);
      g.font = '32px sans-serif'; g.fillText(Math.round(pct * 100) + '% dari ' + fmt(c.target), 360, 640);
    }
    g.font = '34px sans-serif';
    g.fillText('🔥 ' + hitungStreak().streak + ' hari beruntun · Level ' + (lv + 1), 360, 740);
    g.font = '24px sans-serif'; g.fillText('by naufallovephone', 360, 850);
    return cv.toDataURL('image/png');
  }

  function csvTeks() {
    const c = C(), baris = ['tanggal,catatan,nominal'];
    c.log.forEach(x => {
      const cat = String(x.catatan || (x.nominal > 0 ? 'Nabung' : 'Ambil')).replace(/"/g, '""');
      baris.push(new Date(x.waktu).toISOString().slice(0, 10) + ',"' + cat + '",' + x.nominal);
    });
    return baris.join('\n');
  }
  function laporanTeks() {
    const c = C(), n = new Date(), awal = new Date(n.getFullYear(), n.getMonth(), 1).getTime();
    const bln = c.log.filter(x => x.waktu >= awal);
    const masuk = bln.filter(x => x.nominal > 0).reduce((s, x) => s + x.nominal, 0);
    const keluar = bln.filter(x => x.nominal < 0).reduce((s, x) => s - x.nominal, 0);
    const st = hitungStreak();
    return 'Laporan ' + n.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) + ' - ' + c.emoji + ' ' + c.nama + '\n' +
      'Saldo sekarang: ' + fmt(hitung(c.log)) + '\nMasuk bulan ini: ' + fmt(masuk) + '\nDiambil bulan ini: ' + fmt(keluar) +
      '\nTransaksi bulan ini: ' + bln.length + '\nStreak: ' + st.streak + ' hari (rekor ' + st.rekor + ')' +
      (c.target > 0 ? '\nProgres target: ' + Math.round(hitung(c.log) / c.target * 100) + '%' : '') + '\n- NabungYuk';
  }
  if ($('lpKartu')) $('lpKartu').onclick = function () { if (!C()) return; bagikan('Progres tabunganku di NabungYuk 💰', buatKartu()); };
  if ($('lpCsv')) $('lpCsv').onclick = function () { if (!C()) return; bagikan(csvTeks()); };
  if ($('lpBulan')) $('lpBulan').onclick = function () { if (!C()) return; bagikan(laporanTeks()); };

  // ---- impor: pulihkan data tambahan v9 ----
  const imporAsli = impor;
  impor = function () {
    let p = null;
    try { p = JSON.parse($('backup').value); } catch (e) {}
    imporAsli();
    if (p && $('backup').value === '') {
      ['mkJenis', 'mkNama', 'poinPakai', 'akMilik', 'akPakai'].forEach(k => { if (p[k] !== undefined) data[k] = p[k]; });
      if (Array.isArray(p.celengan)) p.celengan.forEach((c, i) => {
        const a = c && c.amplop;
        if (data.celengan[i] && a && Array.isArray(a.nilai) && Array.isArray(a.buka)) {
          data.celengan[i].amplop = { total: Number(a.total) || 0, nilai: a.nilai.map(Number), buka: a.buka.filter(Number.isInteger) };
        }
      });
      simpan(); render();
    }
  };

  // ---- sambungkan ke render ----
  const render8 = render;
  render = function () {
    const prev = data.lv, lv = levelXp(semuaMasuk().length);
    if (typeof prev === 'number') data.lv = lv;
    render8();
    ['jumlah', 'target', 'ruHarga', 'smJ'].forEach(pasangKolom);
    pasangQuick(); isiOpsiRu();
    gambarLencanaTambahan();
    if (data.celengan.length) { gambarMaskot9(prev, lv); gambarAmplop(); simulasi(); gambarStreak(); }
    if (prev !== lv) { data.lv = lv; simpan(); }
  };
  render();
})();
(function () {
  const VERSI = '10.0.0';
  const galat = [];
  try { JSON.parse(localStorage.getItem('nabungyuk-log') || '[]').forEach(x => galat.push(x)); } catch (e) {}
  function catat(ket, e) {
    galat.push(new Date().toLocaleString('id-ID') + ' · ' + ket + ': ' + (e && e.message ? e.message : e));
    while (galat.length > 15) galat.shift();
    try { localStorage.setItem('nabungyuk-log', JSON.stringify(galat)); } catch (_) {}
  }
  window.addEventListener('error', ev => catat('error', ev.message + (ev.lineno ? ' @' + ev.lineno : '')));
  window.addEventListener('unhandledrejection', ev => catat('promise', ev.reason));
  const hooks = [];
  const modul = (nama, fn) => { try { fn(); } catch (e) { catat('modul ' + nama, e); } };
  const aman = (nama, fn) => function () { try { return fn.apply(this, arguments); } catch (e) { catat(nama, e); } };
  const gaya = (css) => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
  const kartuBaru = (html) => { const d = document.createElement('div'); d.className = 'card'; d.innerHTML = html; return d; };
  const LPLUGIN = () => window.cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local;

  // ---- 6 warna baru (total 21) ----
  modul('warna', () => {
    const W = [
      ['senja', 'linear-gradient(135deg,#9d174d,#f59e0b)', '#9d174d', '#f59e0b'],
      ['samudra', 'linear-gradient(135deg,#0f766e,#38bdf8)', '#0f766e', '#38bdf8'],
      ['galaksi', 'linear-gradient(135deg,#3730a3,#db2777)', '#3730a3', '#db2777'],
      ['aurora', 'linear-gradient(135deg,#059669,#6366f1)', '#059669', '#6366f1'],
      ['fajar', 'linear-gradient(135deg,#ea580c,#ec4899)', '#ea580c', '#ec4899'],
      ['malam', 'linear-gradient(135deg,#1e1b4b,#4338ca)', '#1e1b4b', '#4338ca']
    ];
    let css = '';
    W.forEach(w => {
      TEMA.push([w[0], w[1]]);
      css += 'html[data-tema=' + w[0] + '] { --main:' + w[2] + '; --main2:' + w[3] + '; }\n';
    });
    css += '@media (prefers-color-scheme: dark) { html[data-tema=malam] { --main:#4338ca; --main2:#818cf8; } }';
    gaya(css);
  });

  // ---- kalender nabung ----
  modul('kalender', () => {
    gaya(`
      .kal { display:grid; grid-auto-flow:column; grid-template-rows:repeat(7,14px); grid-auto-columns:14px; gap:3px; justify-content:center; margin-top:10px; }
      .kal i { border-radius:3px; background:var(--line); }
      .kal i.l1, .kal i.l2, .kal i.l3, .kal i.l4 { background:var(--main); }
      .kal i.l1 { opacity:.3; } .kal i.l2 { opacity:.5; } .kal i.l3 { opacity:.75; } .kal i.l4 { opacity:1; }
    `);
    const k = kartuBaru('<div class="muted">Kalender nabung (12 minggu)</div><div class="kal" id="kalGrid"></div><div class="muted" id="kalInfo" style="margin-top:10px;line-height:1.5"></div>');
    const ch = document.getElementById('chart') && document.getElementById('chart').closest('.card');
    if (ch) ch.after(k);
    const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    hooks.push(aman('kalender', function () {
      const g = $('kalGrid');
      if (!g) return;
      const per = {}, jam = new Array(24).fill(0), mgg = new Array(7).fill(0);
      let nilai = 0;
      data.celengan.forEach(c => c.log.forEach(x => {
        if (x.nominal <= 0) return;
        const d = new Date(x.waktu), key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
        const o = per[key] || (per[key] = { n: 0, v: 0 });
        o.n++; o.v += x.nominal; nilai += x.nominal;
        jam[d.getHours()]++; mgg[d.getDay()]++;
      }));
      const keys = Object.keys(per);
      const maks = Math.max(1, ...keys.map(x => per[x].v));
      const kini = new Date(); kini.setHours(0, 0, 0, 0);
      const mulai = new Date(kini); mulai.setDate(mulai.getDate() - kini.getDay() - 77);
      g.innerHTML = '';
      for (let i = 0; i < 84; i++) {
        const d = new Date(mulai); d.setDate(mulai.getDate() + i);
        const el = document.createElement('i');
        if (d > kini) el.style.visibility = 'hidden';
        else {
          const o = per[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()];
          if (o) { const r = o.v / maks; el.className = 'l' + (r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1); }
          el.onclick = () => toast(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ': ' + (o ? fmt(o.v) + ' (' + o.n + ' transaksi)' : 'tidak nabung'));
        }
        g.appendChild(el);
      }
      if (!keys.length) { $('kalInfo').textContent = 'Belum ada data. Setiap hari kamu nabung, kotaknya makin terang.'; return; }
      const hr = mgg.indexOf(Math.max.apply(null, mgg)), jm = jam.indexOf(Math.max.apply(null, jam));
      $('kalInfo').textContent = keys.length + ' hari aktif · rata-rata ' + fmt(nilai / keys.length) + ' per hari aktif. Hari paling rajin: ' + HARI[hr] + '. Jam favorit: sekitar ' + String(jm).padStart(2, '0') + '.00.';
    }));
  });

  // ---- foto target ----
  modul('foto', () => {
    gaya(`
      .ft { position:relative; border-radius:14px; overflow:hidden; margin-top:8px; }
      .ft img { width:100%; display:block; max-height:260px; object-fit:cover; }
      .ft .tutup { position:absolute; left:0; right:0; top:0; background:rgba(235,235,245,.5); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); transition:height .6s; }
      .ft .ftInfo { position:absolute; bottom:8px; left:0; right:0; text-align:center; color:#fff; font-weight:700; text-shadow:0 1px 4px rgba(0,0,0,.7); }
    `);
    const k = kartuBaru('<div class="head"><div class="muted">Foto target</div><div><button class="small" id="ftPilih">Pasang foto</button> <button class="small" id="ftHapus">Hapus</button></div></div><div class="ft" id="ftBox" style="display:none"><img id="ftImg" alt=""><div class="tutup" id="ftTutup"></div><div class="ftInfo" id="ftInfo"></div></div><input type="file" accept="image/*" id="ftFile" style="display:none"><div class="muted" id="ftKet"></div>');
    const mk = document.querySelector('.card.mk');
    if (mk) mk.after(k);
    const kunci = c => 'nabungyuk-foto-' + c.id;
    function kecilkan(file, cb) {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const s = Math.min(1, 480 / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * s)); cv.height = Math.max(1, Math.round(img.height * s));
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          cb(cv.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => toast('Foto tidak bisa dibaca');
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    }
    if ($('ftPilih')) $('ftPilih').onclick = () => $('ftFile').click();
    if ($('ftFile')) $('ftFile').onchange = function () {
      const f = this.files && this.files[0], c = C();
      if (!f || !c) return;
      kecilkan(f, url => {
        try { localStorage.setItem(kunci(c), url); toast('Foto dipasang'); } catch (e) { toast('Penyimpanan penuh, foto tidak tersimpan'); }
        render();
      });
      this.value = '';
    };
    if ($('ftHapus')) $('ftHapus').onclick = () => {
      const c = C();
      if (!c || !confirm('Hapus foto target?')) return;
      try { localStorage.removeItem(kunci(c)); } catch (e) {}
      render();
    };
    hooks.push(aman('foto', function () {
      const c = C();
      if (!c || !$('ftBox')) return;
      let f = null;
      try { f = localStorage.getItem(kunci(c)); } catch (e) {}
      $('ftBox').style.display = f ? 'block' : 'none';
      $('ftHapus').style.display = f ? 'inline-block' : 'none';
      $('ftPilih').textContent = f ? 'Ganti foto' : 'Pasang foto';
      $('ftKet').textContent = f ? '' : 'Pasang foto barang impianmu. Fotonya makin terbuka seiring tabunganmu naik.';
      if (!f) return;
      const pct = c.target > 0 ? Math.max(0, Math.min(1, hitung(c.log) / c.target)) : 0;
      $('ftImg').src = f;
      $('ftTutup').style.height = ((1 - pct) * 100) + '%';
      $('ftInfo').textContent = c.target > 0 ? 'Terbuka ' + Math.round(pct * 100) + '%' : 'Atur target supaya foto terbuka';
    }));
  });

  // ---- alokasi otomatis dan penanda capaian ----
  modul('alokasi', () => {
    const k = kartuBaru('<div class="muted">Alokasi otomatis</div><div class="muted" style="margin:6px 0">Sebagian dari tiap tombol "+ Nabung" otomatis masuk ke celengan lain.</div><select id="alTujuan"></select><input id="alPersen" type="number" inputmode="numeric" placeholder="Persen (1-90)"><button class="small" style="width:100%" id="alSimpan">Simpan alokasi</button><div class="muted" id="alInfo" style="margin-top:6px"></div>');
    const tk = document.getElementById('target') && document.getElementById('target').closest('.card');
    if (tk) tk.after(k);
    if ($('alSimpan')) $('alSimpan').onclick = () => {
      const c = C();
      if (!c) return;
      const v = $('alTujuan').value;
      if (!v) { snap(); c.alokasi = null; simpan(); render(); toast('Alokasi dimatikan'); return; }
      const p = parseInt($('alPersen').value, 10);
      if (!p || p < 1 || p > 90) return alert('Persen harus antara 1 dan 90.');
      const t = data.celengan.find(x => String(x.id) === v);
      if (!t || t === c) return alert('Pilih celengan tujuan yang lain.');
      snap(); c.alokasi = { ke: t.id, persen: p }; simpan(); render();
      toast(p + '% tabungan baru dialokasikan ke ' + t.nama);
    };
    hooks.push(aman('alokasi', function () {
      const c = C();
      if (!c || !$('alTujuan')) return;
      const s = $('alTujuan');
      s.innerHTML = '<option value="">Mati (tanpa alokasi)</option>';
      data.celengan.forEach(x => {
        if (x === c) return;
        const o = document.createElement('option');
        o.value = String(x.id); o.textContent = x.emoji + ' ' + x.nama;
        s.appendChild(o);
      });
      const t = c.alokasi && data.celengan.find(x => x.id === c.alokasi.ke);
      s.value = t ? String(t.id) : '';
      $('alPersen').value = t ? c.alokasi.persen : '';
      $('alInfo').textContent = data.celengan.length < 2 ? 'Buat celengan kedua dulu untuk memakai alokasi.' : (t ? 'Aktif: ' + c.alokasi.persen + '% ke ' + t.nama : 'Belum aktif.');
    }));

    function notifSegera(teks) {
      try {
        const L = LPLUGIN();
        if (L) L.schedule({ id: 3000 + Math.floor(Math.random() * 500), title: 'NabungYuk 🎯', text: teks, trigger: { in: 1, unit: 'second' } });
      } catch (e) {}
    }
    function cekCapaian(c) {
      if (!c || !(c.target > 0)) return;
      const pct = hitung(c.log) / c.target * 100;
      data.ms = data.ms || {};
      let ubah = false;
      [50, 90].forEach(t => {
        if (pct >= t && (data.ms[c.id] || 0) < t) {
          data.ms[c.id] = t; ubah = true;
          toast('🎯 ' + c.nama + ' sudah ' + t + '% dari target!', 6000);
          notifSegera(c.nama + ' sudah ' + t + '% dari target. Semangat!');
        }
      });
      if (pct >= 100 && data.ms[c.id] !== 100) { data.ms[c.id] = 100; ubah = true; }
      if (ubah) simpan();
    }
    const tambah9 = tambah;
    tambah = function (t) {
      const c = C(), sebelum = c ? c.log.length : 0;
      tambah9(t);
      if (!c || C() !== c || c.log.length !== sebelum + 1) return;
      const x = c.log[c.log.length - 1];
      if (t > 0 && x.nominal > 0 && c.alokasi) {
        const tuj = data.celengan.find(y => y.id === c.alokasi.ke);
        if (tuj && tuj !== c) {
          const bagian = bulat(x.nominal * c.alokasi.persen / 100);
          if (bagian > 0 && bagian < x.nominal) {
            x.nominal = bulat(x.nominal - bagian);
            x.catatan = (x.catatan ? x.catatan + ' · ' : '') + c.alokasi.persen + '% ke ' + tuj.nama;
            tuj.log.push({ nominal: bagian, catatan: 'Alokasi dari ' + c.nama, waktu: x.waktu });
            simpan(); render();
            toast(fmt(bagian) + ' dialokasikan ke ' + tuj.nama);
          }
        }
      }
      if (t > 0) cekCapaian(c);
    };
  });

  // ---- maskot punya suasana hati ----
  modul('mood', () => {
    gaya(`
      .mk .em.senang { animation-duration:.9s; }
      .mk .em.lesu { animation-duration:4s; opacity:.75; filter:grayscale(.4); }
      .mk .em.sedih { animation-duration:6s; opacity:.55; filter:grayscale(.8); }
    `);
    const nm = document.getElementById('mkNama');
    if (nm) { const d = document.createElement('div'); d.id = 'mkMood'; d.className = 'muted'; d.style.marginTop = '2px'; nm.after(d); }
    const S = {
      senang: ['Yey, kamu rajin banget! 🎉', 'Aku senang kita nabung bareng! 💛', 'Mantap! Terus pertahankan ya 💪'],
      biasa: ['Hari ini nabung dikit yuk? 🪙', 'Aku siap menemani nabungmu 😊', 'Sedikit demi sedikit, lama-lama jadi bukit ⛰️'],
      lesu: ['Aku mulai ngantuk, belum nabung nih... 😴', 'Ayo nabung, biar aku semangat lagi ⚡', 'Receh hari ini kaya besok 🪙'],
      sedih: ['Aku kangen nabung bareng kamu... 🥺', 'Sudah lama sekali, yuk mulai lagi pelan-pelan 💛', 'Tidak apa-apa, mulai lagi hari ini ya 🤗']
    };
    hooks.push(aman('mood', function () {
      const em = $('mkEm'), el = $('mkMood');
      if (!em || !el) return;
      em.classList.remove('senang', 'lesu', 'sedih');
      const m = [];
      data.celengan.forEach(c => c.log.forEach(x => { if (x.nominal > 0) m.push(x.waktu); }));
      if (!m.length) { el.textContent = 'Ayo mulai nabung, aku sudah siap! 💪'; return; }
      const hari = Math.floor((Date.now() - Math.max.apply(null, m)) / 86400000);
      const kunci = hari <= 1 ? 'senang' : hari <= 3 ? 'biasa' : hari <= 7 ? 'lesu' : 'sedih';
      if (kunci !== 'biasa') em.classList.add(kunci);
      const L = S[kunci];
      el.textContent = L[(new Date().getHours() + new Date().getDate()) % L.length];
    }));
  });

  // ---- notifikasi pintar (pesan bervariasi) ----
  modul('notif', () => {
    function progres() {
      const c = C();
      if (!c || !(c.target > 0)) return '';
      const sisa = 100 - Math.round(hitung(c.log) / c.target * 100);
      return sisa > 0 ? 'Tinggal ' + sisa + '% lagi menuju ' + c.nama + '!' : '';
    }
    const P = [
      () => 'Sudah nabung hari ini? Sedikit pun berarti 💰',
      () => (data.mkNama || 'Maskotmu') + ' kangen nabung bareng kamu 🥺',
      () => progres() || 'Receh hari ini, kaya besok! 🪙',
      () => 'Yuk sisihkan sedikit sebelum tidur 🌙',
      () => progres() || 'Satu langkah kecil menuju targetmu 🎯',
      () => 'Jaga streak-mu, jangan sampai putus 🔥',
      () => 'Ingat tujuanmu, nabung yuk! 💪',
      () => 'Waktunya isi celengan 🐽'
    ];
    jadwalNotif = function (diam) {
      try {
        const L = LPLUGIN();
        if (!L) return;
        const ids = [1001];
        for (let i = 0; i < 40; i++) ids.push(2000 + i);
        try { L.cancel(ids); } catch (e) {}
        if (!data.remind) return;
        const hm = (data.jam || '19:00').split(':').map(Number);
        const jumlah = data.remind === 1 ? 30 : data.remind === 7 ? 12 : 6;
        const daftar = [];
        for (let i = 0; i <= jumlah && daftar.length < jumlah; i++) {
          const d = new Date();
          d.setHours(hm[0], hm[1], 0, 0);
          if (data.remind === 1) d.setDate(d.getDate() + i);
          else if (data.remind === 7) d.setDate(d.getDate() + i * 7);
          else d.setMonth(d.getMonth() + i);
          if (d.getTime() > Date.now() + 30000) daftar.push(d);
        }
        const pasang = () => {
          L.schedule(daftar.map((d, i) => ({ id: 2000 + i, title: 'NabungYuk 💰', text: P[i % P.length](), trigger: { at: d } })));
          if (!diam) toast('Pengingat dijadwalkan');
        };
        L.hasPermission(ada => {
          if (ada) pasang();
          else if (!diam) L.requestPermission(ok => { if (ok) pasang(); else toast('Izin notifikasi ditolak'); });
        });
      } catch (e) { catat('jadwalNotif', e); }
    };
  });

  // ---- backup lewat file ----
  modul('backupfile', () => {
    const k = kartuBaru('<div class="muted">Backup lewat file</div><div class="row" style="margin-top:8px"><button class="small" id="bfSimpan">📤 Simpan ke file</button><button class="small" id="bfImpor">📥 Impor dari file</button></div><input type="file" id="bfFile" accept=".json,application/json,text/plain" style="display:none"><div class="muted" style="margin-top:8px">Foto target tidak ikut tersimpan di backup. File dikirim lewat menu berbagi (pilih Files, Drive, atau WhatsApp).</div>');
    const bk = document.getElementById('backup') && document.getElementById('backup').closest('.card');
    if (bk) bk.after(k);
    if ($('bfSimpan')) $('bfSimpan').onclick = () => {
      const rest = Object.assign({}, data); delete rest.pin;
      const json = JSON.stringify(rest);
      const sp = window.plugins && window.plugins.socialsharing;
      if (!sp) { ekspor(); toast('Berbagi file tidak tersedia, kode backup disalin ke kotak Backup'); return; }
      try {
        const b64 = btoa(unescape(encodeURIComponent(json)));
        sp.shareWithOptions({ subject: 'Backup NabungYuk', files: ['data:application/json;df:nabungyuk-backup.json;base64,' + b64] }, function () {}, function () { toast('Gagal membagikan file'); });
      } catch (e) { catat('backup file', e); toast('Gagal membuat file backup'); }
    };
    if ($('bfImpor')) $('bfImpor').onclick = () => $('bfFile').click();
    if ($('bfFile')) $('bfFile').onchange = function () {
      const f = this.files && this.files[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => { $('backup').value = String(fr.result || ''); impor(); };
      fr.onerror = () => toast('File tidak bisa dibaca');
      fr.readAsText(f);
      this.value = '';
    };
  });

  // ---- diagnostik dan cadangan otomatis ----
  modul('diagnostik', () => {
    const AKEY = 'nabungyuk-auto';
    const ambilAuto = () => { try { return JSON.parse(localStorage.getItem(AKEY)) || []; } catch (e) { return []; } };
    function autoCadangan() {
      const a = ambilAuto(), kini = Date.now();
      if (a.length && kini - a[a.length - 1].t < 6 * 3600 * 1000) return;
      const rest = Object.assign({}, data); delete rest.pin;
      a.push({ t: kini, d: JSON.stringify(rest) });
      while (a.length > 3) a.shift();
      try { localStorage.setItem(AKEY, JSON.stringify(a)); } catch (e) {}
    }
    const k = kartuBaru('<div class="muted">Diagnostik</div><div id="dgInfo" style="line-height:1.6;margin-top:6px"></div><div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="small" id="dgSalin">Salin laporan</button><button class="small" id="dgHapus">Hapus log</button><button class="small" id="dgPulih">Pulihkan cadangan otomatis</button></div>');
    const ft = document.querySelector('.foot');
    if (ft) ft.before(k);
    const status = () => {
      const ya = v => v ? '✓' : '✗';
      return 'Versi ' + VERSI + ' · notifikasi ' + ya(LPLUGIN()) + ' · sidik jari ' + ya(window.Fingerprint) + ' · berbagi ' + ya(window.plugins && window.plugins.socialsharing);
    };
    if ($('dgSalin')) $('dgSalin').onclick = () => {
      const t = status() + '\nCadangan otomatis: ' + ambilAuto().length + '\nError tercatat (' + galat.length + '):\n' + (galat.join('\n') || '-');
      $('backup').value = t; $('backup').focus(); $('backup').select();
      try { document.execCommand('copy'); } catch (e) {}
      toast('Laporan disalin ke kotak Backup');
    };
    if ($('dgHapus')) $('dgHapus').onclick = () => { galat.length = 0; try { localStorage.removeItem('nabungyuk-log'); } catch (e) {} render(); toast('Log dihapus'); };
    if ($('dgPulih')) $('dgPulih').onclick = () => {
      const a = ambilAuto();
      if (!a.length) return alert('Belum ada cadangan otomatis.');
      const l = a[a.length - 1];
      $('backup').value = l.d;
      toast('Cadangan dari ' + new Date(l.t).toLocaleString('id-ID'), 6000);
      impor();
    };
    hooks.push(aman('diagnostik', function () {
      if ($('dgInfo')) $('dgInfo').textContent = status() + ' · error tercatat: ' + galat.length + ' · cadangan otomatis: ' + ambilAuto().length;
      autoCadangan();
    }));
  });

  // ---- sambungkan ke render ----
  const render9 = render;
  render = function () {
    try { render9(); } catch (e) { catat('render', e); }
    hooks.forEach(h => h());
  };
  document.addEventListener('deviceready', () => render());
  render();
})();
