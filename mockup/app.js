/* Interaksi mock-up Continuous Assurance (IT) v1 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SEV_LABEL = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
const sevBadge = (s) => `<span class="badge b-${s}">${SEV_LABEL[s]}</span>`;

function validationBadge(f) {
  if (f.validation === "verified") return `<span class="badge b-verified">✓ Tervalidasi manusia</span>`;
  if (f.validation === "auto") return `<span class="badge b-auto">Otomatis</span>`;
  return `<span class="badge b-pending">◷ Menunggu validasi</span>`;
}

const gradeCls = (g) => "grade-" + String(g).toLowerCase();

/* ---------------- Navigasi ---------------- */

const SCREENS = ["dashboard", "assets", "findings", "remediation", "pentest", "evidence", "reports", "portfolio"];

function goto(screen) {
  if (!SCREENS.includes(screen)) screen = "dashboard";
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + screen));
  $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.screen === screen));
  if (screen === "findings") closeDetail();
  if (location.hash.slice(1) !== screen) history.replaceState(null, "", "#" + screen);
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.addEventListener("click", (e) => {
  const nav = e.target.closest(".nav-item");
  if (nav) return goto(nav.dataset.screen);

  const jump = e.target.closest("[data-goto]");
  if (jump) return goto(jump.dataset.goto);

  const modal = e.target.closest("[data-modal]");
  if (modal) return openModal(modal.dataset.modal, modal.dataset.arg);

  const row = e.target.closest("[data-finding]");
  if (row) return openDetail(row.dataset.finding);

  if (e.target.id === "overlay" || e.target.closest("[data-close]")) return closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------------- Chart ---------------- */

function lineChart(svg, series) {
  const W = 720;
  const H = 168;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 22;
  const n = series[0].values.length;
  const x = (i) => padL + (i * (W - padL - padR)) / (n - 1);

  let defs = "";
  let body = "";

  // garis bantu horizontal
  for (let g = 0; g <= 3; g++) {
    const y = padT + (g * (H - padT - padB)) / 3;
    body += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(23,47,100,.75)" stroke-width="1"/>`;
  }

  series.forEach((s, si) => {
    const min = Math.min(...s.values);
    const max = Math.max(...s.values);
    const span = max - min || 1;
    const y = (v) => padT + (H - padT - padB) * (1 - (v - min) / span) * 0.86 + 6;
    const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);

    if (s.fill) {
      defs += `<linearGradient id="grad${si}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${s.color}" stop-opacity=".28"/>
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0"/>
        </linearGradient>`;
      body += `<polygon fill="url(#grad${si})" points="${padL},${H - padB} ${pts.join(" ")} ${W - padR},${H - padB}"/>`;
    }

    body += `<polyline fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
        ${s.dash ? 'stroke-dasharray="5 4"' : ""} points="${pts.join(" ")}"/>`;

    const lastX = x(n - 1);
    const lastY = y(s.values[n - 1]);
    body += `<circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3.5" fill="${s.color}"/>`;
    body += `<text x="${lastX - 6}" y="${(lastY - 10).toFixed(1)}" text-anchor="end" fill="${s.color}"
        font-size="11" font-weight="600">${s.values[n - 1]}</text>`;
  });

  // label minggu
  ["12 mg lalu", "9 mg", "6 mg", "3 mg", "Minggu ini"].forEach((lbl, i) => {
    const px = padL + (i * (W - padL - padR)) / 4;
    const anchor = i === 0 ? "start" : i === 4 ? "end" : "middle";
    body += `<text x="${px.toFixed(0)}" y="${H - 5}" text-anchor="${anchor}" fill="#7489ab" font-size="10.5">${lbl}</text>`;
  });

  svg.innerHTML = `<defs>${defs}</defs>${body}`;
}

/* ---------------- Layar 1: Ringkasan ---------------- */

function renderDashboard() {
  const critHigh = DEMO.findingTrend.critical.map((c, i) => c + DEMO.findingTrend.high[i]);
  lineChart($("#chartScore"), [
    { values: DEMO.scoreTrend, color: "#2dd4bf", fill: true },
    { values: critHigh, color: "#ff6b35", fill: false },
  ]);

  // Bar cakupan
  const s = DEMO.assetSplit;
  const auto = s.scanned - s.humanValidated;
  const parts = [
    { label: `Tervalidasi manusia · ${s.humanValidated}`, n: s.humanValidated, color: "#34d399" },
    { label: `Dipindai otomatis · ${auto}`, n: auto, color: "#38bdf8" },
    { label: `Belum diperiksa · ${s.unscanned}`, n: s.unscanned, color: "#ff6b35" },
  ];
  $("#coverageBar").innerHTML = parts
    .map((p) => `<span style="width:${((p.n / s.discovered) * 100).toFixed(1)}%;background:${p.color}"></span>`)
    .join("");
  $("#coverageLegend").innerHTML = parts
    .map((p) => `<span><i style="background:${p.color}"></i>${p.label}</span>`)
    .join("");

  // Temuan teratas
  const top = DEMO.findings.filter((f) => f.severity === "critical" || f.severity === "high").slice(0, 5);
  $("#topFindings").innerHTML = `
    <thead><tr><th>Temuan</th><th>Severity</th><th>Validasi</th><th>SLA</th></tr></thead>
    <tbody>${top
      .map(
        (f) => `<tr class="clickable" data-finding="${f.id}">
          <td>
            <div class="stack-2">
              <span class="t-strong">${esc(f.title)}</span>
              <span class="t-dim mono" style="font-size:11.5px">${f.id} · ${esc(f.asset)}</span>
            </div>
          </td>
          <td class="nowrap">${sevBadge(f.severity)}${f.kev ? ' <span class="badge b-kev">KEV</span>' : ""}</td>
          <td class="nowrap">${validationBadge(f)}</td>
          <td class="nowrap"><span class="sla ${f.slaState}">${esc(f.sla)}</span></td>
        </tr>`
      )
      .join("")}</tbody>`;

  // Aktivitas
  $("#feed").innerHTML = DEMO.verificationFeed
    .map(
      (v) => `<li class="${v.kind}">
        <div class="tl-title">${esc(v.title)}</div>
        <div class="tl-meta">${esc(v.meta)}</div>
      </li>`
    )
    .join("");

  // Aset baru
  $("#newAssets").innerHTML = `
    <thead><tr><th>Host</th><th>Sumber</th><th>Terdeteksi</th><th>Catatan</th></tr></thead>
    <tbody>${DEMO.newAssets
      .map(
        (a) => `<tr>
          <td class="mono">${esc(a.host)}</td>
          <td class="t-dim nowrap">${esc(a.src)}</td>
          <td class="t-dim nowrap">${esc(a.when)}</td>
          <td class="nowrap">${
            a.risk === "Aman"
              ? '<span class="badge b-verified">Aman</span>'
              : a.risk === "Perlu triage"
              ? '<span class="badge b-pending">Perlu triage</span>'
              : `<span class="badge b-high">${esc(a.risk)}</span>`
          }</td>
        </tr>`
      )
      .join("")}</tbody>`;

  $("#readinessMini").innerHTML = readinessMarkup(DEMO.evidenceReadiness.slice(0, 3), false);
  $("#readinessFull").innerHTML = readinessMarkup(DEMO.evidenceReadiness, true);
}

function readinessMarkup(items, withNote) {
  return items
    .map(
      (r) => `<div style="margin-bottom:${withNote ? 18 : 14}px">
        <div class="row-flex" style="justify-content:space-between;margin-bottom:6px">
          <span style="font-size:13px">${esc(r.label)}</span>
          <span class="t-strong" style="font-size:13px">${r.pct}%</span>
        </div>
        <div class="meter ${r.pct >= 80 ? "good" : r.pct < 60 ? "warn" : ""}"><span style="width:${r.pct}%"></span></div>
        ${withNote ? `<div class="t-dim" style="font-size:12px;margin-top:6px">${esc(r.note)}</div>` : ""}
      </div>`
    )
    .join("");
}

/* ---------------- Layar 2: Attack surface ---------------- */

let assetFilter = "all";

function renderAssets() {
  const q = ($("#assetSearch").value || "").toLowerCase();
  const rows = DEMO.assets.filter((a) => {
    const okFilter =
      assetFilter === "all" ||
      (assetFilter === "unscanned" ? a.status === "unscanned" : a.type === assetFilter);
    const okSearch = !q || `${a.host} ${a.tech} ${a.ports}`.toLowerCase().includes(q);
    return okFilter && okSearch;
  });

  const statusCell = (s) =>
    s === "verified"
      ? '<span class="badge b-verified">✓ Tervalidasi manusia</span>'
      : s === "auto"
      ? '<span class="badge b-auto">Dipindai otomatis</span>'
      : '<span class="badge b-high">Belum diperiksa</span>';

  $("#assetTable").innerHTML = `
    <thead><tr>
      <th>Aset</th><th>Tipe</th><th>Sumber penemuan</th><th>Teknologi</th>
      <th>Port</th><th>Status</th><th>Grade</th><th>Temuan</th><th>Terakhir dilihat</th>
    </tr></thead>
    <tbody>${
      rows.length
        ? rows
            .map(
              (a) => `<tr>
        <td class="mono t-strong">${esc(a.host)}</td>
        <td class="t-dim nowrap">${esc(a.type)}</td>
        <td class="t-dim nowrap">${esc(a.src)}</td>
        <td class="t-dim">${esc(a.tech)}</td>
        <td class="mono t-dim nowrap">${esc(a.ports)}</td>
        <td class="nowrap">${statusCell(a.status)}</td>
        <td>${a.risk === "—" ? '<span class="t-dim">—</span>' : `<span class="grade ${gradeCls(a.risk)}">${a.risk}</span>`}</td>
        <td>${a.findings ? `<span class="t-strong">${a.findings}</span>` : '<span class="t-dim">0</span>'}</td>
        <td class="t-dim nowrap">${esc(a.seen)}</td>
      </tr>`
            )
            .join("")
        : `<tr><td colspan="9"><div class="empty"><div class="big">⌕</div>Tidak ada aset yang cocok dengan filter ini.</div></td></tr>`
    }</tbody>`;
}

/* ---------------- Layar 3: Temuan ---------------- */

let findingFilter = "all";

function renderFindings() {
  const q = ($("#findingSearch").value || "").toLowerCase();
  const rows = DEMO.findings.filter((f) => {
    let ok = true;
    if (["critical", "high", "medium", "low"].includes(findingFilter)) ok = f.severity === findingFilter;
    else if (findingFilter === "kev") ok = f.kev;
    else if (findingFilter === "verified") ok = f.validation === "verified";
    else if (findingFilter === "pending") ok = f.validation === "pending";
    return ok && (!q || `${f.id} ${f.title} ${f.asset} ${f.category}`.toLowerCase().includes(q));
  });

  $("#findingTable").innerHTML = `
    <thead><tr>
      <th>ID</th><th>Temuan</th><th>Aset</th><th>Severity</th>
      <th>Validasi</th><th>Status</th><th>Pemilik</th><th>SLA</th>
    </tr></thead>
    <tbody>${
      rows.length
        ? rows
            .map(
              (f) => `<tr class="clickable" data-finding="${f.id}">
        <td class="mono t-dim nowrap">${f.id}</td>
        <td>
          <div class="stack-2">
            <span class="t-strong">${esc(f.title)}</span>
            <span class="t-dim" style="font-size:11.5px">${esc(f.category)} · CVSS ${f.cvss}</span>
          </div>
        </td>
        <td class="mono t-dim">${esc(f.asset)}</td>
        <td class="nowrap">${sevBadge(f.severity)}${f.kev ? ' <span class="badge b-kev">KEV</span>' : ""}</td>
        <td class="nowrap">${validationBadge(f)}</td>
        <td class="t-dim nowrap">${esc(f.status)}</td>
        <td class="t-dim nowrap">${esc(f.owner)}</td>
        <td class="nowrap"><span class="sla ${f.slaState}">${esc(f.sla)}</span></td>
      </tr>`
            )
            .join("")
        : `<tr><td colspan="8"><div class="empty"><div class="big">✓</div>Tidak ada temuan pada filter ini.</div></td></tr>`
    }</tbody>`;
}

function closeDetail() {
  $("#findingDetail").style.display = "none";
  $("#findingsList").style.display = "";
}

function openDetail(id) {
  const f = DEMO.findings.find((x) => x.id === id);
  if (!f) return;
  goto("findings");
  $("#findingsList").style.display = "none";
  const box = $("#findingDetail");
  box.style.display = "";

  const highlight = (code) =>
    esc(code)
      .replace(/^(\$ .*)$/gm, '<span class="c-green">$1</span>')
      .replace(/^(#.*)$/gm, '<span class="c-dim">$1</span>')
      .replace(/(&lt;--.*)$/gm, '<span class="c-red">$1</span>');

  box.innerHTML = `
    <div class="row-flex" style="margin-bottom:14px">
      <button class="btn btn-sm" data-goto="findings">← Kembali ke daftar</button>
      <span class="t-dim mono" style="font-size:12px">${f.id}</span>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div class="card-body">
        <div class="row-flex" style="gap:9px;margin-bottom:9px;flex-wrap:wrap">
          ${sevBadge(f.severity)}
          ${f.kev ? '<span class="badge b-kev">◆ CISA KEV — dieksploitasi di dunia nyata</span>' : ""}
          ${validationBadge(f)}
          <span class="badge b-neutral">CVSS ${f.cvss}</span>
          <span class="sla ${f.slaState}" style="margin-left:auto">SLA: ${esc(f.sla)}</span>
        </div>
        <h2 style="margin:0 0 6px;font-size:18px;font-weight:640">${esc(f.title)}</h2>
        <div class="t-dim" style="font-size:13px">
          <span class="mono">${esc(f.asset)}</span> · ${esc(f.category)} · pertama terlihat ${esc(f.firstSeen)}
        </div>
        <div class="row-flex" style="gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm">Tandai sudah diperbaiki &amp; minta retest</button>
          <button class="btn btn-sm">Tugaskan</button>
          <button class="btn btn-sm">Kirim ke Jira</button>
          <button class="btn btn-sm">Terima risiko</button>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <div style="display:flex;flex-direction:column;gap:14px">
        ${
          f.validation === "verified"
            ? `<div class="callout">
                <div class="co-title">✓ Diverifikasi oleh manusia</div>
                Dibuktikan oleh <b>${esc(f.validator)}</b> pada ${esc(f.validatedAt)} dengan metode
                <b>${esc(f.method)}</b>. Bukti di bawah berasal dari pengujian tersebut, bukan dari
                pencocokan versi otomatis.
              </div>`
            : `<div class="callout orange">
                <div class="co-title">◷ Belum diverifikasi manusia</div>
                Temuan ini masih berstatus otomatis. Statusnya ditampilkan apa adanya sampai
                seorang penetration tester membuktikannya. ${esc(f.method)}.
              </div>`
        }

        <div class="card">
          <div class="card-head"><h3>Bukti</h3><span class="sub">Keluaran mentah dari pengujian</span></div>
          <div class="card-body"><pre class="code">${highlight(f.evidence)}</pre></div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Langkah reproduksi</h3></div>
          <div class="card-body"><ol class="steps">${f.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Dampak bisnis</h3></div>
          <div class="card-body" style="font-size:13px;color:var(--text-dim)">${esc(f.impact)}</div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Rekomendasi perbaikan</h3></div>
          <div class="card-body"><ol class="steps">${f.remediation.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
        </div>

        ${
          f.note
            ? `<div class="annot" style="margin:0"><span>◆</span><div><b>Catatan penguji.</b> ${esc(f.note)}</div></div>`
            : ""
        }
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card">
          <div class="card-head"><h3>Ringkasan</h3></div>
          <div class="card-body">
            <dl class="kv" style="grid-template-columns:120px 1fr">
              <dt>Status</dt><dd>${esc(f.status)}</dd>
              <dt>Pemilik</dt><dd>${esc(f.owner)}</dd>
              <dt>Kategori</dt><dd>${esc(f.category)}</dd>
              <dt>CVSS</dt><dd>${f.cvss}</dd>
              <dt>Di KEV</dt><dd>${f.kev ? '<span class="badge b-kev">Ya</span>' : '<span class="t-dim">Tidak</span>'}</dd>
              <dt>Metode uji</dt><dd>${esc(f.method)}</dd>
              <dt>Validator</dt><dd>${f.validator ? esc(f.validator) : '<span class="t-dim">—</span>'}</dd>
              <dt>Waktu validasi</dt><dd>${f.validatedAt ? esc(f.validatedAt) : '<span class="t-dim">—</span>'}</dd>
            </dl>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Riwayat</h3></div>
          <div class="card-body">
            <ul class="timeline">
              <li><div class="tl-title">Terdeteksi sapuan otomatis</div><div class="tl-meta">${esc(f.firstSeen)}</div></li>
              ${
                f.validation === "verified"
                  ? `<li class="ok"><div class="tl-title">Diverifikasi manusia</div><div class="tl-meta">${esc(f.validator)} · ${esc(f.validatedAt)}</div></li>`
                  : `<li class="warn"><div class="tl-title">Masuk antrean validasi</div><div class="tl-meta">Dijadwalkan 10 Sep 2026</div></li>`
              }
              <li><div class="tl-title">Dikirim ke pemilik</div><div class="tl-meta">${esc(f.owner)} · notifikasi Slack + Jira</div></li>
              <li class="warn"><div class="tl-title">Menunggu perbaikan</div><div class="tl-meta">SLA ${esc(f.sla)}</div></li>
              <li><div class="tl-title">Retest &amp; sertifikat</div><div class="tl-meta">Otomatis dijadwalkan setelah ditandai selesai</div></li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>Kontrol terkait</h3></div>
          <div class="card-body" style="display:flex;flex-wrap:wrap;gap:7px">
            <span class="badge b-neutral">CIS 4 · Konfigurasi aman</span>
            <span class="badge b-neutral">CIS 7 · Manajemen kerentanan</span>
            <span class="badge b-neutral">ISO 27001 A.8.8</span>
            <span class="badge b-neutral">SOC 2 CC7.1</span>
          </div>
        </div>
      </div>
    </div>`;
  history.replaceState(null, "", "#finding/" + f.id);
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ---------------- Layar 4: Remediasi ---------------- */

function renderRemediation() {
  const byId = {};
  DEMO.findings.forEach((f) => (byId[f.id] = f));
  DEMO.closed.forEach((c) => (byId[c.id] = { ...c, owner: "—", sla: "Tertutup", slaState: "" }));

  $("#kanban").innerHTML = DEMO.board
    .map((col) => {
      const isDone = col.key === "Tertutup terverifikasi";
      return `<div class="kcol">
        <div class="kcol-head">
          ${isDone ? '<span style="color:var(--green)">✓</span>' : ""}${col.key}
          <span class="n">${col.ids.length}</span>
        </div>
        <div class="kcol-body">${col.ids
          .map((id) => {
            const f = byId[id];
            if (!f) return "";
            const open = isDone ? `data-modal="cert" data-arg="${id}"` : `data-finding="${id}"`;
            return `<div class="kcard" ${open}>
              <div class="kid">${id}</div>
              <div class="ktitle">${esc(f.title)}</div>
              <div class="row-flex" style="gap:6px;flex-wrap:wrap;margin-bottom:7px">
                ${sevBadge(f.severity)}${f.kev ? ' <span class="badge b-kev">KEV</span>' : ""}
              </div>
              <div class="kmeta">
                ${isDone ? `<span class="badge b-verified">✓ Sertifikat</span>` : `<span>${esc(f.owner)}</span>`}
                <span class="sla ${f.slaState || ""}" style="margin-left:auto">${esc(f.sla)}</span>
              </div>
            </div>`;
          })
          .join("")}</div>
      </div>`;
    })
    .join("");

  $("#closedTable").innerHTML = `
    <thead><tr><th>Temuan</th><th>Severity awal</th><th>Terbuka</th><th>Diverifikasi oleh</th><th>Ditutup</th><th>Sertifikat</th></tr></thead>
    <tbody>${DEMO.closed
      .map(
        (c) => `<tr>
        <td>
          <div class="stack-2">
            <span class="t-strong">${esc(c.title)}</span>
            <span class="t-dim mono" style="font-size:11.5px">${c.id} · ${esc(c.asset)}</span>
          </div>
        </td>
        <td class="nowrap">${sevBadge(c.severity)}</td>
        <td class="t-dim nowrap">${c.openDays} hari</td>
        <td class="t-dim nowrap">${esc(c.validator)}</td>
        <td class="t-dim nowrap">${esc(c.closedAt)}</td>
        <td class="nowrap"><button class="btn btn-sm" data-modal="cert" data-arg="${c.id}">${c.certId}</button></td>
      </tr>`
      )
      .join("")}</tbody>`;
}

/* ---------------- Layar 7: Laporan ---------------- */

function renderReports() {
  $("#reportGrid").innerHTML = DEMO.reports
    .map(
      (r) => `<div class="report-card${r.feature ? " feature" : ""}">
        <div class="row-flex">
          <div class="report-ico">${r.icon}</div>
          <div>
            <h4>${esc(r.title)}${r.feature ? ' <span class="badge b-kev" style="margin-left:6px">Pembeda</span>' : ""}</h4>
            <p>${esc(r.desc)}</p>
          </div>
        </div>
        <ul>${r.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <div class="report-foot">
          <span class="when">${esc(r.when)}</span>
          <button class="btn btn-sm">Pratinjau</button>
          <button class="btn btn-sm ${r.feature ? "btn-primary" : ""}">Buat</button>
        </div>
      </div>`
    )
    .join("");
}

/* ---------------- Layar 8: Portofolio ---------------- */

function renderPortfolio() {
  const p = DEMO.portfolio;

  $("#portfolioTable").innerHTML = `
    <thead><tr><th>Perusahaan</th><th>Sektor</th><th>Tier</th><th>Skor</th><th>30 hari</th><th>Critical</th><th>Tervalidasi</th><th>Pentest berikut</th></tr></thead>
    <tbody>${p.list
      .map(
        (c) => `<tr class="clickable">
        <td class="t-strong">${esc(c.name)}</td>
        <td class="t-dim nowrap">${esc(c.sector)}</td>
        <td class="t-dim nowrap">${esc(c.tier)}</td>
        <td class="nowrap"><span class="grade ${gradeCls(c.grade)}">${c.grade}</span> <span class="t-dim">${c.score}</span></td>
        <td class="nowrap ${c.delta > 0 ? "up" : c.delta < 0 ? "down" : "flat"}">${c.delta > 0 ? "▲" : c.delta < 0 ? "▼" : "—"} ${Math.abs(c.delta)}</td>
        <td class="nowrap">${c.critical ? `<span class="badge b-critical">${c.critical}</span>` : '<span class="badge b-verified">0</span>'}</td>
        <td style="min-width:120px">
          <div class="meter ${c.verified >= 80 ? "good" : c.verified < 60 ? "warn" : ""}"><span style="width:${c.verified}%"></span></div>
          <span class="t-dim" style="font-size:11.5px">${c.verified}%</span>
        </td>
        <td class="t-dim nowrap">${esc(c.pentest)}</td>
      </tr>`
      )
      .join("")}</tbody>`;

  const cellCls = (n, rowIdx) => {
    if (!n) return "mx-0";
    if (rowIdx <= 0) return "mx-crit";
    if (rowIdx === 1) return "mx-bad";
    if (rowIdx === 2) return "mx-warn";
    return "mx-ok";
  };

  let html = `<div class="mx-head"></div>${p.matrix.cols.map((c) => `<div class="mx-head">${c}</div>`).join("")}`;
  p.matrix.rows.forEach((row, ri) => {
    html += `<div class="mx-row-label"><span class="grade ${row.cls}">${row.label}</span></div>`;
    row.cells.forEach((n) => {
      html += `<div class="mx-cell ${cellCls(n, ri)}">${n || "·"}</div>`;
    });
  });
  $("#matrix").innerHTML = html;
}

/* ---------------- Modal ---------------- */

function openModal(kind, arg) {
  const m = $("#modal");
  if (kind === "cert") {
    const c = DEMO.closed.find((x) => x.id === arg) || DEMO.closed[0];
    m.innerHTML = `
      <div class="modal-head"><h3>Sertifikat verifikasi</h3><button class="x-btn" data-close>×</button></div>
      <div class="modal-body">
        <div class="cert">
          <div class="cert-seal">✓</div>
          <h4>Perbaikan terverifikasi</h4>
          <div class="cert-sub">${esc(c.title)}</div>
          <dl class="kv" style="grid-template-columns:140px 1fr">
            <dt>ID temuan</dt><dd class="mono">${c.id}</dd>
            <dt>Aset</dt><dd class="mono">${esc(c.asset)}</dd>
            <dt>Severity awal</dt><dd>${sevBadge(c.severity)}</dd>
            <dt>Lama terbuka</dt><dd>${c.openDays} hari</dd>
            <dt>Diverifikasi oleh</dt><dd>${esc(c.validator)} · OSCP</dd>
            <dt>Tanggal</dt><dd>${esc(c.closedAt)}</dd>
            <dt>Metode</dt><dd>Pengujian ulang dengan payload identik</dd>
            <dt>Hasil</dt><dd><span class="badge b-verified">✓ Tidak lagi dapat dieksploitasi</span></dd>
            <dt>No. sertifikat</dt><dd class="mono">${c.certId}</dd>
          </dl>
          <div class="cert-hash">sha256:9c1f4ab7e30d5f6b8a2c74e1d09b3f5628ac7d41e9b0f236a8d5c7194be03fa2</div>
        </div>
        <div class="t-dim" style="font-size:12.5px;margin-top:14px">
          Artefak ini yang dilampirkan ke binder underwriter dan paket bukti auditor. Isinya
          menyatakan siapa yang menguji, kapan, dengan cara apa, dan apa hasilnya.
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" data-close>Tutup</button>
        <button class="btn btn-primary">Unduh PDF</button>
      </div>`;
  } else if (kind === "request") {
    m.innerHTML = `
      <div class="modal-head"><h3>Minta validasi manusia</h3><button class="x-btn" data-close>×</button></div>
      <div class="modal-body">
        <div class="t-dim" style="font-size:13px;margin-bottom:16px">
          Permintaan masuk ke antrean tim pengujian Atumcell. Waktu tanggap sesuai tier
          kontrak, dan sisa kuota jam ditampilkan agar tidak ada kejutan tagihan.
        </div>
        <dl class="kv" style="grid-template-columns:150px 1fr">
          <dt>Target</dt><dd class="mono">CA-2026-0145 · 13.58.204.77</dd>
          <dt>Jenis</dt><dd>Validasi eksploitabilitas</dd>
          <dt>Estimasi</dt><dd>4 jam kerja penguji</dd>
          <dt>Sisa kuota</dt><dd>84 jam dari 200 jam kontrak</dd>
          <dt>Waktu tanggap</dt><dd>2 hari kerja (tier Growth)</dd>
          <dt>Biaya tambahan</dt><dd><span class="badge b-verified">Tidak ada</span></dd>
        </dl>
        <div class="callout" style="margin-top:16px">
          <div class="co-title">✓ Retest tidak dibatasi</div>
          Pengujian ulang setelah perbaikan tidak memotong kuota. Ini sudah menjadi standar di
          pasar, jadi kita tidak menagihnya terpisah.
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" data-close>Batal</button>
        <button class="btn btn-primary">Kirim permintaan</button>
      </div>`;
  } else {
    m.innerHTML = `
      <div class="modal-head"><h3>Cakupan &amp; aturan pengujian</h3><button class="x-btn" data-close>×</button></div>
      <div class="modal-body">
        <div class="t-dim" style="font-size:13px;margin-bottom:16px">
          Batas pengujian disepakati di depan dan ditampilkan di dalam produk, sehingga klien
          maupun auditor tahu apa yang boleh dan tidak boleh dilakukan platform.
        </div>
        <dl class="kv" style="grid-template-columns:170px 1fr">
          <dt>Seed domain</dt><dd class="mono">northwindlog.com, nwl-intl.com, nwlfreight.io</dd>
          <dt>Konektor cloud</dt><dd>AWS (2 akun) · read-only</dd>
          <dt>Di luar cakupan</dt><dd>Jaringan gudang OT, sistem SCADA mitra</dd>
          <dt>Uji aktif</dt><dd>Diizinkan pada aset non-produksi; produksi hanya read-only</dd>
          <dt>Uji destruktif</dt><dd><span class="badge b-neutral">Tidak diizinkan</span></dd>
          <dt>Jendela pengujian</dt><dd>Sen–Jum, 09.00–18.00 WIB</dd>
          <dt>Kontak eskalasi</dt><dd>Head of IT · +62 8xx · Slack #atum-assurance</dd>
        </dl>
        <div class="annot" style="margin:16px 0 0">
          <span>◆</span>
          <div>
            <b>Kenapa ini ada di layar utama.</b> Aset OT sengaja dikeluarkan dari cakupan
            pemindaian aktif. Ekspektasinya dibuat jelas sejak awal, dan pemantauan OT
            ditangani jalur terpisah.
          </div>
        </div>
      </div>
      <div class="modal-foot"><button class="btn" data-close>Tutup</button><button class="btn btn-primary">Ajukan perubahan cakupan</button></div>`;
  }
  $("#overlay").classList.add("open");
}

function closeModal() {
  $("#overlay").classList.remove("open");
}

/* ---------------- Init ---------------- */

renderDashboard();
renderAssets();
renderFindings();
renderRemediation();
renderReports();
renderPortfolio();

$("#assetChips").addEventListener("click", (e) => {
  const c = e.target.closest(".chip");
  if (!c) return;
  $$("#assetChips .chip").forEach((x) => x.classList.toggle("active", x === c));
  assetFilter = c.dataset.filter;
  renderAssets();
});

$("#findingChips").addEventListener("click", (e) => {
  const c = e.target.closest(".chip");
  if (!c) return;
  $$("#findingChips .chip").forEach((x) => x.classList.toggle("active", x === c));
  findingFilter = c.dataset.filter;
  renderFindings();
});

$("#assetSearch").addEventListener("input", renderAssets);
$("#findingSearch").addEventListener("input", renderFindings);

const initial = location.hash.slice(1);
if (initial.startsWith("finding/")) openDetail(initial.split("/")[1]);
else if (initial) goto(initial);
