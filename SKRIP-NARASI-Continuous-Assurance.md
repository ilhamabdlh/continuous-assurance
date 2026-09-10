# Skrip Narasi — Continuous Assurance (IT)

**Untuk:** presentasi ke lead / walkthrough mock-up  
**Durasi saran:** 8–12 menit  
**Aplikasi demo:** `ca-app` → http://127.0.0.1:5173

---

## 1. Pembuka (≈1 menit)

Hai [Matthew / tim],

Saya sudah riset Continuous Assurance untuk konteks IT, lalu membangun mock-up interaktif supaya kita punya sesuatu yang konkret untuk dibahas — bukan hanya abstrak.

Singkatnya: Continuous Assurance di sini bukan compliance automation seperti Vanta, dan bukan sekadar security rating seperti Bitsight. Yang kita arahkan adalah **keyakinan berkelanjutan atas postur keamanan eksternal**, dengan **validasi manusia** sebagai inti — sejalan dengan keahlian pentest Atumcell.

---

## 2. Masalah yang ingin dijawab (≈1 menit)

Hari ini banyak perusahaan punya salah satu dari dua ekstrem:

1. **Scan otomatis terus-menerus** — banyak temuan, banyak noise, sulit percaya mana yang benar-benar dieksploitasi.
2. **Pentest sekali setahun** — dalam, tapi cepat kedaluwarsa.

Continuous Assurance mencoba mengisi celah di tengah: **pantau terus**, lalu **buktikan** temuan penting dengan manusia, dan **tutup** hanya setelah perbaikan diverifikasi ulang.

Itu juga relevan untuk sponsor PE: mereka butuh roll-up portofolio dan bukti untuk IC / LP / asuransi — bukan hanya PDF tahunan.

---

## 3. Positioning vs pasar (≈2 menit)

Dari riset kompetitor:

| Tipe | Contoh | Apa yang mereka kuat | Celah untuk kita |
|---|---|---|---|
| Security ratings | Bitsight, SecurityScorecard | Skor & grade eksekutif | Jarang ada validasi exploit manusia |
| EASM / CTEM | UpGuard, CyCognito, Halo | Inventaris attack surface | Klaim sering “otomatis = selesai” |
| PTaaS | Cobalt, Synack | Manusia + retest | Biasanya engagement, kurang continuous + portfolio PE |
| Compliance | Vanta, Drata | Bukti kebijakan & connector | Lemah di bukti teknis eksternal yang tervalidasi |
| Rapid7 | Exposure Command + **Vector Command** | CTEM platform + continuous red team | Enterprise-heavy; sertifikat penutupan & PE mid-market kurang tonjol |

**Analog terdekat Rapid7: Vector Command** — recon eksternal + red team manusia berkelanjutan.  
**Yang tidak kita tiru:** Exposure Command Ultimate (agent, CNAPP, ratusan konektor).

**Pembeda Atumcell yang saya tonjolkan di mock-up:**
1. Label **human-validated** eksplisit di setiap temuan  
2. **Sertifikat penutupan** bertanggal setelah retest  
3. **Siklus pengujian** menyambung monitoring ↔ pentest  
4. **Portofolio PE** + due diligence  
5. **Binder asuransi** sebagai laporan pembeda  

---

## 4. Walkthrough modul (≈5–6 menit)

> Buka app React, mulai dari Ringkasan.

### Ringkasan
“Di sini skor eksposur ditampilkan seperti Bitsight/UpGuard — score ring dan grade.  
Yang penting: kita pisahkan **tervalidasi manusia**, **otomatis**, dan **belum diperiksa**. Jadi kita tidak mengklaim semua aset sudah aman.  

Strip di atas mengikuti pola Rapid7: **Discover → Validate → Prioritize → Remediate**.”

### Attack Surface
“Inventaris aset internet-facing: subdomain, IP, cloud, domain terkait.  
Filter dan search berfungsi. Aset yang belum diperiksa ditampilkan terang-terangan — coverage gap.”

### Temuan
“Setiap temuan punya badge validasi. Critical bisa bertanda KEV.  
Kalau saya buka detail, ada bukti, langkah reproduksi, dampak bisnis, dan aksi: minta validasi, retest, tutup.”

> Demo singkat: buka satu temuan pending → klik **Minta validasi** → lihat toast & feed aktivitas.

### Remediasi & Verifikasi
“Kanban bisa digeser. Aturannya: penutupan ke kolom terakhir hanya lewat verifikasi.  
Hasilnya sertifikat — artefak yang bisa dilampirkan ke auditor atau underwriter. Ini yang jarang ada di kompetitor rating/EASM.”

> Demo: drag kartu ke “Menunggu verifikasi” → Verifikasi tutup → buka sertifikat.

### Siklus Pengujian
“Ini yang menyambungkan bisnis pentest kita. Monitoring mengusulkan cakupan berikutnya. Kuota validasi berkurang saat kita minta validasi manusia; retest tidak memotong kuota.”

### Kesiapan Bukti & Laporan
“Bukti sengaja sempit: CIS, SOC 2 teknis, ISO teknis — bukan meniru Vanta.  
Laporan punya empat audiens; yang ditandai pembeda adalah **binder underwriter asuransi**.”

### Portofolio PE
“Untuk sponsor: KPI portofolio, agenda IC untuk perusahaan berisiko, daftar perusahaan yang bisa difilter, matriks risiko yang bisa diklik, dan pipeline due diligence.”

---

## 5. Yang saya butuhkan dari lead (≈1 menit)

Mock-up ini dibangun dari hasil riset. Sebelum lanjut jauh, saya butuh konfirmasi arah:

1. **Buyer utama** — CISO mid-market, sponsor PE, atau keduanya?  
2. **Hubungan dengan AtumScan / AtumScreen / SpoofCheck** — produk baru, atau payung di atasnya?  
3. **Batas cakupan v1** — eksternal agentless + validasi manusia saja, atau ikut internal/VM?  
4. **Kedalaman “human validation”** — triage mingguan, continuous red team, atau hybrid seperti Vector Command Advanced (continuous + pentest berkala)?  

Jawaban itu yang akan menentukan apa yang saya pertajam di mock-up berikutnya.

---

## 6. Penutup (≈30 detik)

Ringkasnya: Continuous Assurance (IT) yang saya usulkan adalah **assurance yang bisa dibuktikan** — continuous discovery, human validation, verified closure, dan keluaran yang relevan untuk auditor, asuransi, serta sponsor PE.

Saya siap sesuaikan mock-up setelah kita selaraskan arahnya.

Terima kasih.

---

## Versi sangat singkat (elevator, ≈60 detik)

Kami membangun Continuous Assurance untuk IT: pantau attack surface terus-menerus, validasi temuan penting dengan manusia, dan tutup hanya setelah retest — lengkap dengan sertifikat. Bukan rating kosong, bukan compliance penuh. Paling dekat ke model Rapid7 Vector Command, tapi lebih fokus mid-market/PE, dengan label validasi di UI dan artefak penutupan yang bisa dipakai asuransi serta auditor. Mock-upnya sudah interaktif; saya butuh konfirmasi buyer dan posisi relatif ke produk Atumcell yang sudah ada.

---

## Checklist demo (opsional)

- [ ] `cd ca-app && npm run dev`
- [ ] Ringkasan → klik strip siklus
- [ ] Temuan → filter KEV / pending
- [ ] Detail → Minta validasi
- [ ] Remediasi → drag kartu → verifikasi tutup → sertifikat
- [ ] Portofolio → klik agenda IC + sel matriks
- [ ] Compare → sebutkan Vector Command vs kita
