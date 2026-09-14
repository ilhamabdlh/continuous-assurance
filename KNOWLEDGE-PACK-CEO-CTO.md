# Knowledge Pack — Continuous Assurance (Atumcell)

**Dipakai untuk:** presentasi ke CEO, CTO, dan tim  
**Produk:** Continuous Assurance (IT) — mock-up / prototype `ca-app`  
**Demo:** `cd ca-app && npm run dev` → http://127.0.0.1:5173/login  
**Durasi saran walkthrough:** 5–8 menit (+ Q&A)

Isi di bawah siap di-copy ke form Knowledge Pack (atau dibaca langsung sebelum meeting). Semakin konkret, semakin relevan jawaban saat diskusi.

---

## 1. Background Anda (peran, pengalaman, pencapaian)

Product / engineering lead yang merakit arah Continuous Assurance (IT) dari riset kompetitor sampai mock-up interaktif React.

Sudah selaras fitur & desain dengan Jonathan dan Matthew; mock-up dipakai sebagai objek diskusi — desain masih sementara, menuju prototype.

Yang sudah ada di demo sekarang:

- Overview: overall risk score + severity + top issues to remediate (feedback Matthew)
- Attack Surface: Table | Topology map (grid 4 kolom, kartu bisa digeser) | Cloud / region heatmap
- Findings: ID format `ATC-2026-0001` dst, badge human-validated / auto / pending, KEV, detail + aksi
- Remediation: kanban + verified closure + sertifikat `ACV-2026-…`
- Testing Cycle, Evidence Readiness, Reports (termasuk insurance binder), PE Portfolio, Compare vs Rapid7
- Company switcher (18 company dari PE portfolio), logo tenant Northwind di Overview, login page split-screen

Dokumen pendukung: PRD, Fitur & Positioning, skrip narasi (ID), skrip walkthrough CEO/CTO (EN).

---

## 2. Lawan bicara / interviewer (nama, peran, perusahaan, gaya)

**CEO** — keputusan arah bisnis & prioritas pasar (mid-market CISO vs sponsor PE vs keduanya). Suka: ROI, diferensiasi singkat, “apa yang kita jual”, risiko overclaim. Hindari: detail teknis panjang tanpa “so what”.

**CTO** — kelayakan teknis, posisi vs produk Atumcell yang sudah ada (AtumScan / AtumScreen / SpoofCheck), batasan v1 (agentless eksternal saja atau lebih). Suka: arsitektur jujur, analog kompetitor yang akurat, apa yang belum production. Hindari: klaim “sudah aman” / fitur enterprise tanpa fondasi.

**Tim (product, engineering, pentest/ops, design)** — kejelasan scope sprint berikutnya, handoff mock-up → prototype, siapa owner validasi manusia & sertifikat. Suka: alur demo yang bisa diulang, keputusan terbuka yang butuh jawaban hari ini.

**Konteks eksternal yang sering disebut:** Matthew (fitur/desain), Jonathan (arah), PE sponsor contoh (BV-like / Meridian Capital di demo), buyer Rapid7-aware (Vector Command sebagai analog terdekat).

---

## 3. Agenda & topik pembahasan

1. **Apa itu Continuous Assurance (IT)** — bukan Vanta (compliance), bukan Bitsight murni (rating). Continuous external monitoring + human validation + verified closure.
2. **Masalah yang diisi** — scan otomatis penuh noise vs pentest tahunan yang cepat basi; celah di tengah untuk mid-market + PE.
3. **Demo walkthrough** (urutan klik):
   - Login → Overview (skor, coverage, top issues, logo Northwind)
   - Switch company (PE portfolio list)
   - Attack Surface: Table → Topology (drag kartu) → Cloud / region
   - Findings (`ATC-…`) → minta validasi
   - Remediation → verifikasi tutup → sertifikat
   - Testing Cycle (kuota; retest tidak potong kuota)
   - Evidence / Reports (binder asuransi)
   - PE Portfolio
   - Compare: kita ≈ Rapid7 **Vector Command**, bukan Exposure Command Ultimate
4. **Pembeda yang ditegaskan:** label human-validated di UI, sertifikat penutupan, siklus monitoring↔pentest, PE portfolio, insurance binder.
5. **Keputusan yang diminta hari ini** (lihat bagian 5 di skrip narasi): buyer utama; hubungan ke produk existing; batas cakupan v1; kedalaman human validation.
6. **Next:** design pass berikutnya → prototype; apa yang di-freeze untuk v1.

---

## 4. Catatan tambahan

### Positioning one-liner
Assurance yang bisa dibuktikan: pantau terus → validasi manusia → tutup hanya setelah retest → keluaran untuk auditor, asuransi, dan sponsor PE.

### Angka / artefak di demo (fiktif tapi konsisten)
- Tenant: Northwind Logistics · skor contoh 782/950 · grade B
- Finding ID: `ATC-2026-0001` …
- Sertifikat: `ACV-2026-XXXX-NWL`
- Login demo: email kerja valid + password ≥ 4 karakter

### Objection handling singkat
| Keberatan | Jawaban ringkas |
|---|---|
| “Ini kan Bitsight?” | Bitsight kuat di skor; kita tambah validasi manusia + sertifikat tutup. |
| “Kenapa tidak seperti Rapid7 Exposure?” | Exposure = CTEM + agent/CNAPP enterprise. Kita sengaja ringan: eksternal + manusia, mid-market/PE. Analog = Vector Command. |
| “Ini sudah production?” | Belum. Mock-up / prototype untuk selaraskan arah; data demo fiktif. |
| “Apa bedanya dengan pentest kita?” | Pentest tetap ada; CA menghubungkan monitoring kontinu ke jadwal & kuota validasi manusia. |

### Jangan dijanjikan di meeting ini
- Agent internal / CNAPP / ratusan konektor ala Exposure Command
- Compliance penuh pengganti Vanta/Drata
- SLA production, harga final, atau timeline engineering yang belum di-commit CTO
- Klaim “semua aset sudah aman” — demo sengaja menampilkan unscanned / coverage gap

### Urutan demo aman (jika waktu mepet ~4 menit)
Overview → Attack Surface (topology + region) → satu Finding → Remediation + sertifikat → Compare satu slide verbal → tutup dengan 4 pertanyaan keputusan.

### File pendukung (lampirkan jika form minta .md/.txt)
- `SKRIP-PRESENTASI-CEO-CTO.md` — skrip spoken English sambil klik
- `SKRIP-NARASI-Continuous-Assurance.md` — narasi ID + checklist demo
- `Fitur-dan-Positioning-Continuous-Assurance.html` / PDF — fitur + alasan + Rapid7
- `PRD-Continuous-Assurance.html` / PDF — PRD
- Dokumen ini: `KNOWLEDGE-PACK-CEO-CTO.md`

---

## 5. Teks siap tempel (satu blok per field form)

**Background Anda**
```
Product/engineering yang merakit Continuous Assurance (IT) dari riset ke mock-up React interaktif. Sudah diskusi fitur/desain dengan Jonathan & Matthew. Demo ca-app: skor risiko + top issues, attack surface (table/topology drag/cloud region), findings ATC-2026-*, remediasi + sertifikat tutup, PE portfolio, company switcher, login. Bukan production — objek keputusan arah produk.
```

**Lawan bicara**
```
CEO (arah pasar & klaim bisnis), CTO (kelayakan teknis, posisi vs AtumScan/AtumScreen/SpoofCheck, scope v1), tim product/eng/pentest/design (scope sprint & handoff prototype). Gaya: CEO singkat+ROI, CTO jujur soal belum production & analog Rapid7 Vector Command.
```

**Agenda & topik**
```
Definisi CA IT; demo Overview→Surface→Findings→Remediasi/sertifikat→PE→Compare vs Rapid7 Vector; pembeda (human-validated, certificate, PE, insurance binder); keputusan: buyer utama, hubungan produk existing, batas v1 agentless, kedalaman human validation; next design→prototype.
```

**Catatan tambahan**
```
One-liner: pantau→bukti manusia→tutup terverifikasi→binder. Jangan janji agent/CNAPP/compliance penuh/harga final. Unscanned sengaja terlihat. Demo login: email+password≥4. Skrip EN: SKRIP-PRESENTASI-CEO-CTO.md. Analog Rapid7 = Vector Command, bukan Exposure Command.
```

---

*Knowledge Pack v1 · Continuous Assurance · presentasi CEO / CTO / tim · Sep 2026*
