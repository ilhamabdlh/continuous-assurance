/* Data demo untuk mock-up Continuous Assurance (IT).
   Semua nama perusahaan, domain, dan temuan bersifat fiktif. */

const DEMO = {
  tenant: {
    name: "Northwind Logistics",
    domain: "northwindlog.com",
    sector: "Transportasi & Logistik",
    sponsor: "Meridian Capital Partners",
    lastSweep: "2 jam lalu",
    nextPentest: "12 Okt 2026",
  },

  kpi: {
    score: 782,
    scoreMax: 950,
    grade: "B",
    scoreDelta: 14,
    findingsOpen: 37,
    findingsDelta: -6,
    critical: 3,
    criticalDelta: -1,
    assetsMonitored: 486,
    assetsNew7d: 12,
    verifiedPct: 84,
    verifiedDelta: 9,
  },

  // Tren skor 12 minggu
  scoreTrend: [702, 698, 711, 705, 719, 728, 724, 741, 752, 761, 768, 782],

  // Tren temuan terbuka per severity, 12 minggu
  findingTrend: {
    critical: [7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 4, 3],
    high: [14, 13, 13, 12, 12, 11, 10, 10, 9, 9, 8, 8],
    medium: [21, 20, 22, 19, 18, 18, 17, 16, 15, 15, 14, 14],
  },

  assetSplit: {
    discovered: 486,
    scanned: 441,
    humanValidated: 128,
    unscanned: 45,
  },

  evidenceReadiness: [
    { label: "CIS 18 — Implementation Group 1", pct: 78, note: "44 dari 56 safeguard terbukti" },
    { label: "SOC 2 — Common Criteria", pct: 61, note: "Bukti teknis siap, kebijakan menyusul" },
    { label: "Binder underwriter asuransi", pct: 92, note: "Siap untuk renewal Nov 2026" },
    { label: "ISO 27001:2022 — Anex A teknis", pct: 54, note: "Kontrol 8.x sedang divalidasi" },
  ],

  verificationFeed: [
    {
      kind: "ok",
      title: "ATC-2026-0025 ditutup dengan verifikasi",
      meta: "Matthew C. · payload re-test · 2 jam lalu · Sertifikat diterbitkan",
    },
    {
      kind: "warn",
      title: "ATC-2026-0001 dinaikkan ke Critical setelah validasi manual",
      meta: "Matthew C. · eksploitasi terkonfirmasi · 5 jam lalu",
    },
    {
      kind: "",
      title: "9 temuan otomatis ditolak sebagai false positive",
      meta: "Dilan R. · verifikasi banner vs payload · kemarin",
    },
    {
      kind: "ok",
      title: "ATC-2026-0026 ditutup dengan verifikasi",
      meta: "Dilan R. · konfigurasi TLS diperbaiki · 2 hari lalu",
    },
    {
      kind: "",
      title: "Sapuan attack surface mendeteksi 4 subdomain baru",
      meta: "Otomatis · menunggu triage · 2 hari lalu",
    },
  ],

  newAssets: [
    { host: "stg-portal.northwindlog.com", src: "Certificate Transparency", when: "2 jam lalu", risk: "Perlu triage" },
    { host: "13.58.204.77", src: "Rentang IP AWS", when: "8 jam lalu", risk: "Port 3389 terbuka" },
    { host: "api-v2.northwindlog.com", src: "DNS bruteforce", when: "1 hari lalu", risk: "Aman" },
    { host: "wms-legacy.nwl-intl.com", src: "Domain terkait", when: "2 hari lalu", risk: "Perlu triage" },
  ],

  assets: [
    { host: "www.northwindlog.com", type: "Subdomain", src: "DNS", tech: "Cloudflare, Next.js", ports: "443", status: "verified", risk: "A", seen: "2 jam lalu", findings: 0 },
    { host: "portal.northwindlog.com", type: "Subdomain", src: "CT log", tech: "nginx, PHP 8.1", ports: "80, 443", status: "verified", risk: "C", seen: "2 jam lalu", findings: 4 },
    { host: "stg-portal.northwindlog.com", type: "Subdomain", src: "CT log", tech: "nginx, PHP 8.0", ports: "80, 443, 8080", status: "unscanned", risk: "—", seen: "2 jam lalu", findings: 0 },
    { host: "vpn.northwindlog.com", type: "Subdomain", src: "DNS", tech: "Fortinet FortiOS", ports: "443, 10443", status: "verified", risk: "F", seen: "2 jam lalu", findings: 2 },
    { host: "13.58.204.77", type: "IP", src: "AWS connector", tech: "Windows Server 2019", ports: "3389", status: "auto", risk: "D", seen: "8 jam lalu", findings: 1 },
    { host: "mail.northwindlog.com", type: "Subdomain", src: "MX record", tech: "Microsoft 365", ports: "25, 587", status: "verified", risk: "B", seen: "3 jam lalu", findings: 1 },
    { host: "api-v2.northwindlog.com", type: "Subdomain", src: "DNS bruteforce", tech: "Kong, Node 20", ports: "443", status: "auto", risk: "B", seen: "1 hari lalu", findings: 2 },
    { host: "nwl-invoices.s3.amazonaws.com", type: "Cloud", src: "AWS connector", tech: "S3 bucket", ports: "443", status: "verified", risk: "D", seen: "6 jam lalu", findings: 1 },
    { host: "track.northwindlog.com", type: "Subdomain", src: "CT log", tech: "WP Engine", ports: "443", status: "verified", risk: "F", seen: "4 jam lalu", findings: 1 },
    { host: "wms-legacy.nwl-intl.com", type: "Domain terkait", src: "WHOIS pivot", tech: "Apache 2.4, Tomcat", ports: "80, 8080", status: "unscanned", risk: "—", seen: "2 hari lalu", findings: 0 },
    { host: "sso.northwindlog.com", type: "Subdomain", src: "DNS", tech: "Okta", ports: "443", status: "verified", risk: "A", seen: "3 jam lalu", findings: 0 },
    { host: "10.44.0.0/22", type: "Jaringan", src: "Pentest scope", tech: "Segmen kantor pusat", ports: "internal", status: "verified", risk: "C", seen: "5 hari lalu", findings: 3 },
    { host: "dev-wms.northwindlog.com", type: "Subdomain", src: "CT log", tech: "Apache 2.4, Tomcat 9", ports: "80, 8080", status: "auto", risk: "C", seen: "1 hari lalu", findings: 2 },
    { host: "18.221.9.40", type: "IP", src: "Rentang IP", tech: "Ubuntu 22.04", ports: "22, 443", status: "unscanned", risk: "—", seen: "12 jam lalu", findings: 0 },
  ],

  findings: [
    {
      id: "ATC-2026-0001",
      title: "Subdomain takeover dimungkinkan pada instance WP Engine tak terklaim",
      asset: "track.northwindlog.com",
      severity: "critical",
      kev: false,
      status: "Menunggu perbaikan",
      validation: "verified",
      validator: "Matthew C.",
      validatedAt: "9 Sep 2026, 13:20",
      method: "Payload-based exploitation",
      firstSeen: "9 Sep 2026",
      sla: "3 hari",
      slaState: "soon",
      owner: "Tim Platform",
      cvss: "8.6",
      category: "Salah konfigurasi DNS",
      impact:
        "CNAME masih mengarah ke instance WP Engine yang sudah tidak diklaim. Penyerang dapat mengklaim instance itu dan menyajikan konten atas nama domain resmi Northwind — termasuk halaman login palsu dan pencurian cookie sesi lintas subdomain.",
      evidence: `$ dig +short track.northwindlog.com
track.northwindlog.com. 300 IN CNAME nwl-track.wpengine.com.

$ curl -sI https://track.northwindlog.com
HTTP/2 404
server: nginx
x-served-by: wpengine
<!-- "The site you were looking for couldn't be found" -->

# Verifikasi kepemilikan (dijalankan di akun sandbox Atumcell)
POST /install/claim HTTP/2
Host: my.wpengine.com
=> 200 OK  "domain available for claim"`,
      steps: [
        "Resolve CNAME track.northwindlog.com dan konfirmasi mengarah ke nwl-track.wpengine.com.",
        "Akses host tersebut lewat HTTPS dan amati respons 404 khas instance WP Engine yang tidak terklaim.",
        "Pada akun sandbox terpisah, ajukan klaim domain untuk host yang sama dan konfirmasi endpoint menjawab domain masih tersedia.",
        "Klaim dihentikan pada titik ini. Tidak ada konten yang dipublikasikan dan tidak ada perubahan pada DNS klien.",
      ],
      remediation: [
        "Hapus record CNAME track.northwindlog.com bila layanan sudah tidak dipakai.",
        "Bila masih dipakai, klaim ulang instance di akun WP Engine resmi Northwind sebelum menyalakan kembali DNS.",
        "Tambahkan pemeriksaan dangling CNAME ke proses dekomisioning layanan.",
      ],
      note:
        "Temuan awal ditandai otomatis sebagai severity High berdasarkan sinyal banner. Setelah verifikasi eksploitasi manual, severity dinaikkan ke Critical karena dampaknya menjangkau seluruh cookie berbagi domain.",
    },
    {
      id: "ATC-2026-0002",
      title: "Portal VPN memakai FortiOS versi rentan terhadap CVE-2024-21762",
      asset: "vpn.northwindlog.com",
      severity: "critical",
      kev: true,
      status: "Sedang diperbaiki",
      validation: "verified",
      validator: "Matthew C.",
      validatedAt: "7 Sep 2026, 09:05",
      method: "Version fingerprint + validasi terbatas",
      firstSeen: "6 Sep 2026",
      sla: "Lewat 2 hari",
      slaState: "late",
      owner: "Infrastruktur",
      cvss: "9.8",
      category: "Kerentanan perangkat lunak",
      impact:
        "Kerentanan ini ada di katalog CISA KEV dan sudah dieksploitasi di dunia nyata untuk mendapatkan eksekusi kode tanpa autentikasi pada perangkat perimeter. Kompromi di titik ini memberi penyerang pijakan langsung ke jaringan internal.",
      evidence: `$ curl -sI https://vpn.northwindlog.com:10443
HTTP/1.1 200 OK
Server: xxxxxxxx-xxxxx
Set-Cookie: SVPNCOOKIE=...

# Fingerprint build
FortiOS 7.0.12 build0523  <-- rentan (fix: 7.0.15+)

# CISA KEV
CVE-2024-21762 · ditambahkan 09-02-2024 · eksploitasi terkonfirmasi`,
      steps: [
        "Identifikasi build FortiOS dari respons portal SSL-VPN.",
        "Bandingkan dengan matriks versi terdampak CVE-2024-21762.",
        "Konfirmasi keberadaan endpoint yang terdampak tanpa mengirim payload eksploitasi, sesuai aturan pengujian perangkat produksi.",
      ],
      remediation: [
        "Naikkan FortiOS ke 7.0.15 atau lebih baru pada jendela pemeliharaan terdekat.",
        "Sampai patch terpasang, batasi akses portal SSL-VPN ke rentang IP yang dikenal.",
        "Rotasi kredensial VPN setelah patch, dan periksa log untuk pola akses tidak wajar.",
      ],
      note:
        "Eksploitasi penuh sengaja tidak dijalankan karena perangkat ini melayani operasi produksi. Verifikasi dilakukan sampai tingkat konfirmasi versi, dan dicatat demikian di laporan agar auditor tahu batas pengujiannya.",
    },
    {
      id: "ATC-2026-0003",
      title: "Bucket S3 faktur dapat dibaca publik",
      asset: "nwl-invoices.s3.amazonaws.com",
      severity: "critical",
      kev: false,
      status: "Menunggu verifikasi",
      validation: "verified",
      validator: "Dilan R.",
      validatedAt: "9 Sep 2026, 16:40",
      method: "Payload-based exploitation",
      firstSeen: "9 Sep 2026",
      sla: "1 hari",
      slaState: "soon",
      owner: "Tim Data",
      cvss: "8.2",
      category: "Salah konfigurasi cloud",
      impact:
        "Bucket berisi PDF faktur pelanggan dengan nama, alamat, dan nilai transaksi. Siapa pun tanpa autentikasi dapat mengunduhnya. Ini eksposur data pribadi yang relevan untuk GDPR dan menjadi bahan rekayasa sosial terhadap pelanggan.",
      evidence: `$ aws s3 ls s3://nwl-invoices --no-sign-request
2026-08-31 09:12   184320 INV-2026-08-4471.pdf
2026-08-31 09:12   179884 INV-2026-08-4472.pdf
... 12.418 objek

$ curl -s https://nwl-invoices.s3.amazonaws.com/INV-2026-08-4471.pdf -o /dev/null -w "%{http_code}"
200`,
      steps: [
        "Enumerasi bucket dari nama host yang ditemukan pada konektor AWS.",
        "Daftar isi bucket tanpa kredensial menggunakan permintaan unsigned.",
        "Unduh satu objek untuk mengonfirmasi akses baca benar terbuka, lalu hapus salinannya.",
      ],
      remediation: [
        "Aktifkan Block Public Access pada level bucket dan akun.",
        "Ganti akses publik dengan presigned URL berumur pendek untuk pengiriman faktur.",
        "Audit CloudTrail untuk menilai apakah objek pernah diunduh pihak luar.",
      ],
      note: "Satu objek diunduh sebagai bukti lalu dihapus dari sistem Atumcell. Hash objek dicatat di lampiran laporan.",
    },
    {
      id: "ATC-2026-0004",
      title: "API key pihak ketiga terekspos di bundel JavaScript",
      asset: "portal.northwindlog.com",
      severity: "high",
      kev: false,
      status: "Ditugaskan",
      validation: "verified",
      validator: "Dilan R.",
      validatedAt: "8 Sep 2026, 11:15",
      method: "Payload-based exploitation",
      firstSeen: "8 Sep 2026",
      sla: "9 hari",
      slaState: "",
      owner: "Tim Frontend",
      cvss: "7.4",
      category: "Kebocoran kredensial",
      impact:
        "Kunci layanan geocoding tertanam di bundel frontend dan masih aktif. Penyalahgunaan akan dibebankan ke tagihan Northwind dan dapat memicu pembatasan kuota yang mengganggu fitur pelacakan pengiriman.",
      evidence: `# main.8f2c1a.js baris 4471
const GEO_KEY = "gk_live_9f2b71c4a8e34d51b0c7";

$ curl -s "https://api.geoservice.io/v1/lookup?key=gk_live_9f2b71c4a8e34d51b0c7&q=jakarta"
HTTP/2 200
{"status":"ok","quota_remaining":48211}   <-- kunci aktif`,
      steps: [
        "Unduh bundel JavaScript produksi dan cari pola kredensial.",
        "Uji kunci terhadap endpoint vendor dengan satu permintaan baca.",
        "Konfirmasi kunci aktif dari kuota yang dikembalikan, lalu hentikan pengujian.",
      ],
      remediation: [
        "Cabut kunci di dasbor vendor dan terbitkan kunci baru.",
        "Pindahkan panggilan geocoding ke proxy sisi server agar kunci tidak pernah dikirim ke browser.",
        "Tambahkan pemindaian secret ke pipeline build.",
      ],
      note: "",
    },
    {
      id: "ATC-2026-0005",
      title: "Antarmuka RDP terekspos langsung ke internet",
      asset: "13.58.204.77",
      severity: "high",
      kev: false,
      status: "Baru",
      validation: "pending",
      validator: "",
      validatedAt: "",
      method: "Menunggu antrean validasi",
      firstSeen: "9 Sep 2026",
      sla: "10 hari",
      slaState: "",
      owner: "Belum ditugaskan",
      cvss: "7.1",
      category: "Eksposur layanan",
      impact:
        "Port 3389 terbuka ke seluruh internet pada host Windows Server. Ini vektor akses awal yang paling sering dipakai kampanye ransomware, dan perusahaan asuransi memeriksanya secara spesifik saat underwriting.",
      evidence: `$ nmap -p3389 -sV 13.58.204.77
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: Windows Server 2019 Standard

# Status validasi manusia: dalam antrean, dijadwalkan 10 Sep 2026`,
      steps: [
        "Temuan otomatis dari sapuan harian. Belum diverifikasi manusia.",
        "Langkah reproduksi lengkap akan ditambahkan setelah validasi oleh penetration tester.",
      ],
      remediation: [
        "Tempatkan RDP di belakang VPN atau bastion host dan tutup 3389 di security group.",
        "Aktifkan Network Level Authentication dan MFA untuk akses administratif.",
      ],
      note: "Ditampilkan sebagai contoh state 'menunggu validasi' — badge sengaja dibedakan dari temuan tervalidasi.",
    },
    {
      id: "ATC-2026-0006",
      title: "DMARC disetel ke p=none sehingga domain dapat dipalsukan",
      asset: "mail.northwindlog.com",
      severity: "high",
      kev: false,
      status: "Ditugaskan",
      validation: "verified",
      validator: "Dilan R.",
      validatedAt: "7 Sep 2026, 15:30",
      method: "Verifikasi konfigurasi",
      firstSeen: "6 Sep 2026",
      sla: "12 hari",
      slaState: "",
      owner: "Tim IT",
      cvss: "6.8",
      category: "Keamanan email",
      impact:
        "Kebijakan p=none berarti email palsu yang mengaku dari northwindlog.com tetap terkirim. Ini titik yang diperiksa perusahaan asuransi dan salah satu vektor utama penipuan tagihan pada bisnis logistik.",
      evidence: `$ dig +short TXT _dmarc.northwindlog.com
"v=DMARC1; p=none; rua=mailto:dmarc@northwindlog.com"

$ dig +short TXT northwindlog.com | grep spf
"v=spf1 include:spf.protection.outlook.com ~all"   <-- softfail`,
      steps: [
        "Ambil record DMARC dan SPF untuk domain utama.",
        "Konfirmasi kebijakan masih none dan SPF memakai softfail.",
        "Kirim satu pesan uji berpemalsuan ke kotak surat pengujian Atumcell dan konfirmasi pesan diterima tanpa penolakan.",
      ],
      remediation: [
        "Naikkan DMARC bertahap ke p=quarantine, lalu p=reject setelah laporan agregat bersih.",
        "Ubah SPF dari ~all menjadi -all setelah seluruh pengirim sah terdaftar.",
        "Pastikan DKIM aktif untuk semua layanan pengirim.",
      ],
      note: "",
    },
    {
      id: "ATC-2026-0007",
      title: "Panel Tomcat Manager dapat diakses dengan kredensial bawaan",
      asset: "dev-wms.northwindlog.com",
      severity: "medium",
      kev: false,
      status: "Menunggu verifikasi",
      validation: "verified",
      validator: "Matthew C.",
      validatedAt: "5 Sep 2026, 10:50",
      method: "Payload-based exploitation",
      firstSeen: "4 Sep 2026",
      sla: "18 hari",
      slaState: "",
      owner: "Tim Platform",
      cvss: "5.9",
      category: "Kredensial lemah",
      impact:
        "Host pengembangan, tetapi berada di segmen jaringan yang sama dengan sistem gudang. Akses manager Tomcat memungkinkan penyebaran aplikasi arbitrer, yang bisa dipakai untuk bergerak lateral.",
      evidence: `$ curl -su tomcat:tomcat https://dev-wms.northwindlog.com:8080/manager/html
HTTP/1.1 200 OK
<title>/manager</title>  <-- autentikasi berhasil dengan kredensial bawaan`,
      steps: [
        "Identifikasi endpoint /manager/html pada host.",
        "Uji satu pasang kredensial bawaan yang umum.",
        "Konfirmasi akses berhasil, lalu keluar tanpa menyebarkan aplikasi apa pun.",
      ],
      remediation: [
        "Hapus atau ganti akun bawaan Tomcat dan batasi /manager ke jaringan internal.",
        "Pisahkan segmen host pengembangan dari sistem gudang produksi.",
      ],
      note: "",
    },
    {
      id: "ATC-2026-0008",
      title: "Header keamanan HTTP tidak lengkap pada portal pelanggan",
      asset: "portal.northwindlog.com",
      severity: "low",
      kev: false,
      status: "Menunggu perbaikan",
      validation: "auto",
      validator: "",
      validatedAt: "",
      method: "Pemeriksaan otomatis",
      firstSeen: "1 Sep 2026",
      sla: "26 hari",
      slaState: "",
      owner: "Tim Frontend",
      cvss: "3.1",
      category: "Pengerasan konfigurasi",
      impact:
        "HSTS dan Content-Security-Policy tidak diset. Dampak langsungnya rendah, tetapi ini termasuk daftar periksa yang dilihat perusahaan asuransi dan auditor.",
      evidence: `$ curl -sI https://portal.northwindlog.com | grep -iE "strict-transport|content-security"
(tidak ada hasil)`,
      steps: ["Temuan otomatis. Tidak memerlukan validasi manusia karena bersifat konfigurasi yang dapat diperiksa langsung."],
      remediation: [
        "Tambahkan Strict-Transport-Security dengan max-age minimal satu tahun.",
        "Terapkan Content-Security-Policy dalam mode report-only lebih dulu, lalu tegakkan.",
      ],
      note: "Contoh temuan yang jujur ditandai 'otomatis' — tidak semua hal perlu diklaim tervalidasi manusia.",
    },
  ],

  // Papan remediasi
  board: [
    { key: "Baru", ids: ["ATC-2026-0005"] },
    { key: "Ditugaskan", ids: ["ATC-2026-0004", "ATC-2026-0006"] },
    { key: "Sedang diperbaiki", ids: ["ATC-2026-0002"] },
    { key: "Menunggu verifikasi", ids: ["ATC-2026-0003", "ATC-2026-0007"] },
    { key: "Tertutup terverifikasi", ids: ["ATC-2026-0025", "ATC-2026-0026", "ATC-2026-0027"] },
  ],

  closed: [
    {
      id: "ATC-2026-0025",
      title: "Instance Jenkins terekspos tanpa autentikasi",
      asset: "ci.northwindlog.com",
      severity: "critical",
      closedAt: "9 Sep 2026",
      validator: "Matthew C.",
      openDays: 6,
      certId: "ACV-2026-0025-NWL",
    },
    {
      id: "ATC-2026-0026",
      title: "Sertifikat TLS kedaluwarsa pada endpoint mitra",
      asset: "edi.northwindlog.com",
      severity: "high",
      closedAt: "7 Sep 2026",
      validator: "Dilan R.",
      openDays: 3,
      certId: "ACV-2026-0026-NWL",
    },
    {
      id: "ATC-2026-0027",
      title: "Endpoint Elasticsearch terbuka pada segmen gudang",
      asset: "10.44.2.19",
      severity: "critical",
      closedAt: "2 Sep 2026",
      validator: "Matthew C.",
      openDays: 11,
      certId: "ACV-2026-0027-NWL",
    },
  ],

  reports: [
    {
      icon: "▤",
      title: "Ringkasan eksekutif",
      desc: "Satu halaman untuk CEO dan dewan: skor, tren, tiga hal yang paling penting, dan apa yang berubah bulan ini.",
      items: ["Skor dan pergerakan 12 minggu", "Temuan critical dengan bahasa dampak bisnis", "Kecepatan perbaikan", "Perbandingan dengan sektor"],
      when: "Dibuat otomatis 1 Sep 2026",
      feature: false,
    },
    {
      icon: "▦",
      title: "Laporan teknis",
      desc: "Untuk tim IT dan engineering. Setiap temuan dengan bukti, langkah reproduksi, dan urutan perbaikan.",
      items: ["Bukti dan langkah reproduksi", "Pemetaan CVE, CWE, CVSS", "Urutan perbaikan berdasarkan exploitability", "Catatan batas pengujian"],
      when: "Dibuat 9 Sep 2026",
      feature: false,
    },
    {
      icon: "◈",
      title: "Binder underwriter asuransi",
      desc: "Paket bukti yang menjawab langsung apa yang dipindai perusahaan asuransi saat underwriting, plus bukti perbaikannya sudah diverifikasi.",
      items: [
        "Status DMARC, SPF, DKIM, TLS, dan header",
        "Layanan administratif terekspos dan statusnya",
        "Temuan KEV beserta tanggal penutupan terverifikasi",
        "Sertifikat verifikasi bertanggal untuk setiap penutupan",
      ],
      when: "Siap untuk renewal Nov 2026",
      feature: true,
    },
    {
      icon: "▣",
      title: "Paket bukti auditor",
      desc: "Bukti kontrol untuk SOC 2, ISO 27001:2022, dan CIS 18 — termasuk Control 18 yang mensyaratkan penetration testing.",
      items: ["Pemetaan temuan ke kontrol", "Bukti CIS 18 IG1", "Riwayat pengujian sebagai bukti Control 18", "Ekspor PDF dan CSV"],
      when: "Dibuat 1 Sep 2026",
      feature: false,
    },
  ],

  // Modul portofolio untuk sponsor PE
  portfolio: {
    fund: "Meridian Capital Partners — Fund III",
    companies: 18,
    avgScore: 741,
    avgDelta: 21,
    criticalOpen: 14,
    verifiedPct: 79,
    matrix: {
      // baris: grade, kolom: tier dampak bisnis (Tier 3 → Tier 1 → belum ditier)
      rows: [
        { label: "F", cls: "grade-f", cells: [0, 1, 1, 0] },
        { label: "D", cls: "grade-d", cells: [1, 2, 1, 0] },
        { label: "C", cls: "grade-c", cells: [2, 3, 1, 1] },
        { label: "B", cls: "grade-b", cells: [1, 2, 1, 0] },
        { label: "A", cls: "grade-a", cells: [0, 0, 1, 0] },
      ],
      cols: ["Tier 3", "Tier 2", "Tier 1", "Belum ditier"],
    },
    list: [
      { name: "Northwind Logistics", sector: "Logistik", tier: "Tier 1", score: 782, grade: "B", delta: 14, critical: 3, verified: 84, pentest: "12 Okt 2026" },
      { name: "Havenbrook Health", sector: "Healthcare", tier: "Tier 1", score: 812, grade: "A", delta: 6, critical: 0, verified: 91, pentest: "3 Nov 2026" },
      { name: "Cascade Foods", sector: "Manufaktur", tier: "Tier 2", score: 688, grade: "C", delta: -12, critical: 4, verified: 62, pentest: "28 Sep 2026" },
      { name: "Orion Fabrication", sector: "Manufaktur OT", tier: "Tier 1", score: 604, grade: "D", delta: 3, critical: 2, verified: 71, pentest: "Terjadwal" },
      { name: "Bluepoint Insurance", sector: "Jasa keuangan", tier: "Tier 2", score: 764, grade: "B", delta: 18, critical: 1, verified: 88, pentest: "19 Okt 2026" },
      { name: "Redwood Retail", sector: "Ritel", tier: "Tier 3", score: 559, grade: "F", delta: -24, critical: 3, verified: 44, pentest: "Belum" },
      { name: "Summit Freight", sector: "Logistik", tier: "Tier 2", score: 703, grade: "C", delta: 9, critical: 1, verified: 76, pentest: "5 Des 2026" },
    ],
  },
};
