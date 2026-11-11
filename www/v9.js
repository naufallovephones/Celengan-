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
