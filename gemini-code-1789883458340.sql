-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Config Dictionary Bahasa Indonesia untuk Full-Text Search (jika tersedia)
-- Default fallback: 'simple' atau 'indonesian'

-- ============================================================================
-- 1. TABEL SURAH & AL-QUR'AN
-- ============================================================================

CREATE TABLE surahs (
    id INT PRIMARY KEY,                       -- Nomor Surah (1 - 114)
    name_arabic VARCHAR(100) NOT NULL,
    name_latin VARCHAR(100) NOT NULL,
    translation_id VARCHAR(100) NOT NULL,
    total_ayahs INT NOT NULL,
    revelation_type VARCHAR(20) NOT NULL      -- 'Makkiyah' atau 'Madaniyah'
);

CREATE TABLE quran_verses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surah_id INT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number INT NOT NULL,
    juz INT NOT NULL,
    page INT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_latin TEXT,
    translation_id TEXT NOT NULL,
    tafsir_brief TEXT,                         -- Tafsir Ringkas (Kemenag / Jalalain)
    embedding vector(1536),                   -- Dimensi 1536 (OpenAI / BGE-M3 / Gemini kompatibel)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_surah_ayah UNIQUE(surah_id, ayah_number)
);

-- Indexing Al-Qur'an
-- HNSW Index untuk Vector Cosine Distance
CREATE INDEX idx_quran_embedding ON quran_verses 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full-Text Search Index untuk teks terjemahan dan tafsir
CREATE INDEX idx_quran_fts ON quran_verses 
USING gin (to_tsvector('indonesian', translation_id || ' ' || COALESCE(tafsir_brief, '')));

-- Metadata Index
CREATE INDEX idx_quran_surah_ayah ON quran_verses(surah_id, ayah_number);


-- ============================================================================
-- 2. TABEL KITAB & HADIS
-- ============================================================================

CREATE TABLE hadith_books (
    id VARCHAR(50) PRIMARY KEY,              -- 'bukhari', 'muslim', 'abudaud', 'tirmidzi', dll.
    name_arabic VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    total_hadiths INT NOT NULL
);

CREATE TABLE hadiths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id VARCHAR(50) NOT NULL REFERENCES hadith_books(id) ON DELETE CASCADE,
    hadith_number INT NOT NULL,
    chapter_name TEXT,                        -- Nama Bab / Kitab dalam perawi
    sanad TEXT,                               -- Jalur Perawi
    text_arabic TEXT NOT NULL,
    translation_id TEXT NOT NULL,
    grade VARCHAR(50) NOT NULL DEFAULT 'Sahih', -- 'Sahih', 'Hasan', 'Daif', dll.
    grade_source VARCHAR(100),                -- 'Al-Albani', 'Darussalam', 'Kemenag'
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_book_hadith UNIQUE(book_id, hadith_number)
);

-- Indexing Hadis
CREATE INDEX idx_hadith_embedding ON hadiths 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_hadith_fts ON hadiths 
USING gin (to_tsvector('indonesian', translation_id || ' ' || COALESCE(chapter_name, '')));

CREATE INDEX idx_hadith_book_number ON hadiths(book_id, hadith_number);
CREATE INDEX idx_hadith_grade ON hadiths(grade);


-- ============================================================================
-- 3. TABEL LOGGING & CITATION TRACKING (AUDIT TRAIL)
-- ============================================================================

CREATE TABLE query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_query TEXT NOT NULL,
    classified_intent VARCHAR(50),            -- 'quran_search', 'hadith_search', 'general_fiqh'
    retrieved_quran_ids UUID[],
    retrieved_hadith_ids UUID[],
    llm_response TEXT,
    tokens_used INT,
    latency_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);