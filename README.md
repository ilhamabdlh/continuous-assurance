# Continuous Assurance (IT) — React mock-up

Aplikasi interaktif untuk prototipe produk Atumcell Continuous Assurance.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://127.0.0.1:5173

## Fitur yang berfungsi

- Navigasi antar modul (React Router)
- Filter & pencarian Attack Surface / Temuan
- Detail temuan + aksi: tugaskan, minta validasi, retest, verifikasi & tutup
- Kanban remediasi (pindah kolom, terbitkan sertifikat)
- Kuota jam validasi (berkurang saat minta validasi)
- Antrean KEV / emergent threat (modal)
- Strip siklus Discover → Validate → Prioritize → Remediate
- Toast feedback, ekspor CSV, buat laporan (demo)
- Persistensi lokal ke JSON (`data/store.json`) tanpa database
- Halaman bandingkan vs Rapid7 / kompetitor
