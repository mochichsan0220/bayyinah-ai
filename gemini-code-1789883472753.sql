-- Function Hybrid Search Al-Qur'an
CREATE OR REPLACE FUNCTION match_quran_hybrid(
    query_text TEXT,
    query_embedding vector(1536),
    match_count INT DEFAULT 5,
    rrf_k INT DEFAULT 60
)
RETURNS TABLE (
    id UUID,
    surah_id INT,
    surah_name VARCHAR,
    ayah_number INT,
    text_arabic TEXT,
    translation_id TEXT,
    tafsir_brief TEXT,
    score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH vector_matches AS (
        SELECT 
            q.id,
            ROW_NUMBER() OVER (ORDER BY q.embedding <=> query_embedding) AS rank
        FROM quran_verses q
        ORDER BY q.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    fts_matches AS (
        SELECT 
            q.id,
            ROW_NUMBER() OVER (
                ORDER BY ts_rank(to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')), plainto_tsquery('indonesian', query_text)) DESC
            ) AS rank
        FROM quran_verses q
        WHERE to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')) @@ plainto_tsquery('indonesian', query_text)
        LIMIT match_count * 2
    ),
    rrf_scores AS (
        SELECT 
            COALESCE(v.id, f.id) as verse_id,
            COALESCE(1.0 / (rrf_k + v.rank), 0.0) + COALESCE(1.0 / (rrf_k + f.rank), 0.0) AS final_score
        FROM vector_matches v
        FULL OUTER JOIN fts_matches f ON v.id = f.id
    )
    SELECT 
        q.id,
        q.surah_id,
        s.name_latin AS surah_name,
        q.ayah_number,
        q.text_arabic,
        q.translation_id,
        q.tafsir_brief,
        r.final_score::FLOAT AS score
    FROM rrf_scores r
    JOIN quran_verses q ON q.id = r.verse_id
    JOIN surahs s ON s.id = q.surah_id
    ORDER BY r.final_score DESC
    LIMIT match_count;
END;
$$;