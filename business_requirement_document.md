# BUSINESS REQUIREMENT DOCUMENT (BRD)
## Islamic Knowledge Retrieval AI Agent (Node.js & PostgreSQL RAG Architecture)

---

## 1. DOKUMEN OVERVIEW

* **Nama Proyek:** Islamic Knowledge Retrieval AI Agent
* **Versi Dokumen:** 1.0
* **Tanggal:** 20 September 2026
* **Penulis:** Product / Engineering Team
* **Target Sistem:** Antigravity Platform Deployment

---

## 2. LATAR BELAKANG DAN TUJUAN

### 2.1 Latar Belakang
Penggunaan kecerdasan buatan (AI) dalam pencarian informasi keagamaan Islam sering menghadapi risiko **halusinasi teks** (pemalsuan ayat, nomor surat, atau nomor/derajat hadis). Di sisi lain, masyarakat membutuhkan akses cepat dan akurat terhadap sumber hukum Islam terpercaya (Al-Qur'an dan Kutubut Tis'ah) berbasis bahasa alami (*natural language*).

### 2.2 Tujuan Proyek
Membuat *Agentic AI Engine* berbasis arsitektur **Retrieval-Augmented Generation (RAG)** yang mampu:
1. Menyediakan jawaban ilmiah kontekstual berbasis dalil otentik Al-Qur'an dan Hadis.
2. Mencegah fabrikasi data dengan mekanisme *Strict Grounding* dan *Context Verification*.
3. Menyediakan referensi lengkap (*sitasi*) mencakup nama surat, nomor ayat, kitab hadis, nomor hadis, serta derajat kesahihannya.

---

## 3. LINGKUP PROYEK (SCOPE OF WORK)

### 3.1 In-Scope (Termasuk)
* **Ingestion Pipeline**: Pipeline ekstraksi, normalisasi, dan embedding data Al-Qur'an (30 Juz, Kemenag RI) dan Hadis (Kutubut Tis'ah / 9 Perawi).
* **Vector Store & Hybrid Search Engine**: Integrasi PostgreSQL (`pgvector` + Full-Text Search) menggunakan Node.js.
* **Agentic RAG Engine**: Query router, hybrid retrieval, prompt guardrails, dan verifikasi sitasi.
* **REST API Endpoints**: Antarmuka backend untuk integrasi dengan antarmuka pengguna (UI/Chatbot).

### 3.2 Out-of-Scope (Tidak Termasuk)
* Penerbitan fatwa keagamaan baru (sistem bersifat *informational/referensial*).
* Pemrosesan audio/speech-to-text realtime (dikembangkan pada fase terpisah).

---

## 4. PERSYARATAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

| ID | Modul | Deskripsi Kebutuhan | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Data Pipeline | Sistem harus mengimpor seluruh data Al-Qur'an (30 Juz) beserta teks Arab, terjemahan Indonesia, dan tafsir ringkas. | High |
| **FR-02** | Data Pipeline | Sistem harus mengimpor data Hadis (Kutubut Tis'ah) beserta perawi, nomor, teks Arab, terjemahan, dan derajat hadis. | High |
| **FR-03** | Vector Embedding | Sistem harus memunculkan *embedding vector* dari gabungan terjemahan dan metadata menggunakan model multilingual. | High |
| **FR-04** | Hybrid Search | Sistem harus menggabungkan *semantic search* (cosine similarity) dan *lexical search* (FTS Postgres) untuk menangani istilah khusus/nomor ayat. | High |
| **FR-05** | Query Router | Agent harus membedakan pertanyaan umum, pencarian spesifik ayat/hadis, atau topik fikih/muamalah. | Medium |
| **FR-06** | Grounding Guardrails | LLM dilarang keras memberikan jawaban/dalil jika informasi relevan tidak ditemukan pada hasil retrieval database. | Critical |
| **FR-07** | Citation Engine | Setiap respon WAJIB menyertakan format sitasi standar: `[QS. Nama Surat: No. Ayat]` atau `[HR. Perawi, No. Hadis (Derajat)]`. | Critical |

---

## 8. RISIKO DAN MITIGASI

| Risiko | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| LLM mengalami halusinasi nomor ayat/hadis | High | Penerapan *Strict Grounding Prompt* dan validasi pasca-generasi (regex checker). |
| Hasil retrieval tidak cocok untuk istilah khusus Arab | Medium | Penggunaan *Hybrid Search* (Full-Text Search + Embedding) dan normalisasi kosa kata. |
| Latensi response terlalu tinggi | Medium | Penggunaan indeks HNSW di `pgvector` dan caching query populer via Redis. |

---

## 9. KRITERIA PENERIMAAN (ACCEPTANCE CRITERIA)

1. **Akurasi Dalil:** 100% sitasi ayat/hadis yang dihasilkan oleh Agent terverifikasi tepat dan ada di database.
2. **Penanganan 'Zero Result':** Ketika ditanya hal di luar basis data, Agent memberikan respon penolakan standar tanpa mengarang fakta.
3. **Response Time:** 90% permintaan pencarian berhasil diselesaikan dalam waktu kurang dari 3 detik.