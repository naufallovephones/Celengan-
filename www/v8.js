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
