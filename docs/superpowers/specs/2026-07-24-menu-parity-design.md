# Desain Kesetaraan Menu OpenSID → Next.js

## Tujuan

Setiap menu aktif pada tabel `setting_modul` harus membuka antarmuka Next.js yang menjalankan perilaku fungsional setara dengan OpenSID lokal pada direktori induk repositori (`../app`, `../donjo-app`, dan `../Modules`). Tidak ada menu aktif yang boleh berakhir pada halaman fallback “Modul ini belum diimplementasikan di versi Next.js.”

Kesetaraan mencakup rute, daftar dan detail data, formulir, validasi, operasi data, tindakan khusus, izin, pesan kegagalan, dan keluaran seperti cetak atau unduh apabila perilaku tersebut tersedia pada modul acuan. Kesetaraan visual mengikuti pola AdminLTE yang sudah dipakai aplikasi Next.js, bukan menyalin markup PHP secara literal.

## Batasan dan sumber kebenaran

- Menu yang menjadi cakupan diambil langsung dari `setting_modul` dengan `aktif = true` dan `hidden = false`.
- Implementasi PHP lokal menjadi sumber kebenaran perilaku. Controller, request/validasi, model, view, dan modul HMVC yang relevan diperiksa sebelum setiap port.
- Perubahan yang sudah ada dan belum dikomit di worktree diperlakukan sebagai pekerjaan pengguna dan tidak boleh ditimpa.
- Integrasi yang memerlukan kredensial atau layanan eksternal tetap memiliki UI, validasi konfigurasi, status, dan pesan yang jelas. Operasi eksternal hanya dijalankan bila konfigurasi lokal yang diperlukan tersedia.

## Temuan audit awal

Audit basis data menemukan 92 menu daun aktif. Sebanyak 31 belum cocok dengan halaman Next.js yang ada. Celah tersebut terbagi menjadi tiga jenis:

1. Alias rute belum dinormalisasi, misalnya `laporan_rentan/clear`, `kelompok/clear`, dan variasi modul Kehadiran. Halaman tujuan sudah ada, tetapi menu masih jatuh ke fallback.
2. Rute ada, namun halamannya belum dipindahkan, misalnya administrasi umum, buku tamu, anjungan, dan beberapa menu layanan.
3. Modul khusus atau integrasi, misalnya Plugin, Sinkronisasi, QR Code, dan Pengaturan Peta. Perilakunya harus dipetakan dari OpenSID sebelum dipilih model data dan aksi servernya.

## Arsitektur

### Registry rute

`src/lib/adminMenu.ts` menjadi satu sumber kebenaran translasi URL menu OpenSID ke rute Next.js. Registry akan dinyatakan sebagai entri terstruktur berisi URL legacy, rute tujuan, dan jenis tujuan (halaman langsung, halaman bersarang, atau aksi yang dinormalisasi ke halaman). `mapRoute()` akan memakai registry ini dan menghindari fallback untuk alias yang sudah memiliki halaman.

Sebuah pemeriksaan otomatis membandingkan seluruh menu aktif terhadap registry dan halaman aplikasi. Pemeriksaan gagal bila satu menu aktif tidak memiliki rute halaman yang nyata.

### Pola implementasi modul

Setiap modul baru memakai struktur yang sama dengan modul yang telah ada:

```
src/app/(admin)/<modul>/page.tsx
src/app/(admin)/<modul>/Manager.tsx
src/app/(admin)/<modul>/actions.ts
src/app/api/<modul>/route.ts
src/app/api/<modul>/[id]/route.ts
```

Modul sederhana menggunakan `CrudManager` dan API generik. Modul kompleks memiliki manager khusus dengan batas tanggung jawab jelas: halaman server mengambil data dan mengendalikan otorisasi; server action menangani mutasi; manager klien mengelola interaksi; utilitas domain menghitung atau membentuk data yang dapat diuji tanpa browser.

### Akses dan kegagalan

Semua halaman tetap berada dalam layout admin yang telah memeriksa sesi. Aksi mutasi memakai validasi skema, memverifikasi hak akses sesuai aturan OpenSID, dan memberi hasil/pesan yang dapat ditampilkan `ToastProvider`. Operasi eksternal gagal secara aman dan menjelaskan konfigurasi yang kurang; tidak ada operasi pura-pura sukses.

## Gelombang implementasi

1. **Fondasi rute dan regresi menu** — selesaikan semua alias, buat audit menu aktif, dan pastikan tidak ada link ke fallback untuk halaman yang sudah tersedia. Ini langsung memperbaiki Laporan Kelompok Rentan dan menu lain yang hanya salah pemetaan.
2. **Administrasi dan layanan data** — port halaman administrasi umum, pemerintahan desa, buku tamu/pertanyaan/kepuasan/keperluan, dan halaman anjungan yang menggunakan data lokal.
3. **Kehadiran dan layanan mandiri** — port semua submodul Kehadiran, status izin, serta konfigurasi Anjungan dan Layanan Mandiri yang belum tersedia.
4. **Pemetaan, dokumen, dan laporan khusus** — port Pengaturan Peta, laporan keuangan/operasional yang belum setara, dan keluaran cetak/unduh terkait.
5. **Integrasi dan operasi sistem** — port Plugin, Sinkronisasi, QR Code, Lapak, pesan OpenDK, dan pendaftaran kerja sama, menggunakan adapter yang dipisahkan dari UI untuk layanan eksternal.
6. **Penutupan kesetaraan** — audit ulang seluruh menu aktif, jalankan tes end-to-end untuk alur utama tiap kelompok, dan hilangkan fallback hanya setelah audit menyatakan semua menu terpenuhi.

Urutan gelombang dapat disesuaikan bila audit controller OpenSID menunjukkan ketergantungan data yang lebih dahulu harus tersedia. Setiap gelombang tetap harus selesai, lulus tes, dan tidak merusak gelombang sebelumnya sebelum gelombang berikutnya dimulai.

## Strategi pengujian

- Tes registry: seluruh menu aktif menghasilkan rute konkret yang memiliki halaman.
- Tes unit: validasi, normalisasi rute, perhitungan laporan, dan adapter domain setiap modul khusus.
- Tes integrasi: setiap aksi server menjalankan validasi, hak akses, mutasi, dan kegagalan yang diharapkan.
- Tes UI/end-to-end: navigasi menu, pencarian/penyaringan, formulir utama, cetak/unduh bila relevan, serta kondisi layanan eksternal belum dikonfigurasi.
- Verifikasi akhir: `lint`, build produksi, dan audit menu aktif harus lulus.

## Kriteria selesai

- Tidak ada menu aktif yang merender halaman fallback atau tautan mati.
- Setiap menu aktif memiliki perilaku yang dibandingkan dengan implementasi OpenSID lokal dan dicatat dalam tes atau checklist per gelombang.
- Aksi data dan integrasi gagal secara aman, tervalidasi, dan dapat dipahami.
- Seluruh pengujian otomatis, lint, dan build produksi lulus.
