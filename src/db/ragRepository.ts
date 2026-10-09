import { pool } from './pool';
import { RetrievalResult } from '../types';

export class RagRepository {
  /**
   * Search Quran verses using Hybrid Search (pgvector cosine + Full text search)
   * Falls back gracefully to FTS keyword search if queryVector is empty.
   */
  async searchQuran(queryText: string, queryVector: number[], limit: number = 3): Promise<RetrievalResult[]> {
    try {
      if (!queryVector || queryVector.length === 0) {
        const ftsSql = `
          SELECT q.id, s.name_latin as surah_name, q.ayah_number, q.text_arabic, q.translation_id,
                 ts_rank(to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')), plainto_tsquery('indonesian', $1)) AS score
          FROM quran_verses q
          JOIN surahs s ON q.surah_id = s.id
          WHERE to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')) @@ plainto_tsquery('indonesian', $1)
             OR q.translation_id ILIKE $2
          ORDER BY score DESC
          LIMIT $3;
        `;
        const { rows } = await pool.query(ftsSql, [queryText, `%${queryText}%`, limit]);
        return rows.map(r => ({
          sourceType: 'quran',
          citation: `QS. ${r.surah_name}: ${r.ayah_number}`,
          arabic: r.text_arabic || '',
          translation: r.translation_id || '',
          score: r.score || 0.5
        }));
      }

      const vectorString = `[${queryVector.join(',')}]`;
      const sql = `
        WITH semantic_search AS (
          SELECT q.id, q.surah_id, s.name_latin as surah_name, q.ayah_number, q.text_arabic, q.translation_id,
                 1 - (q.embedding <=> $1::vector) AS semantic_score
          FROM quran_verses q
          JOIN surahs s ON q.surah_id = s.id
          ORDER BY q.embedding <=> $1::vector
          LIMIT 20
        ),
        keyword_search AS (
          SELECT q.id, q.surah_id, s.name_latin as surah_name, q.ayah_number, q.text_arabic, q.translation_id,
                 ts_rank(to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')), plainto_tsquery('indonesian', $2)) AS keyword_score
          FROM quran_verses q
          JOIN surahs s ON q.surah_id = s.id
          WHERE to_tsvector('indonesian', q.translation_id || ' ' || COALESCE(q.tafsir_brief, '')) @@ plainto_tsquery('indonesian', $2)
          LIMIT 20
        )
        SELECT 
          COALESCE(ss.id, ks.id) as id,
          COALESCE(ss.surah_name, ks.surah_name) as surah_name,
          COALESCE(ss.ayah_number, ks.ayah_number) as ayah_number,
          COALESCE(ss.text_arabic, ks.text_arabic) as text_arabic,
          COALESCE(ss.translation_id, ks.translation_id) as translation_id,
          COALESCE(ss.semantic_score, 0) * 0.7 + COALESCE(ks.keyword_score, 0) * 0.3 as combined_score
        FROM semantic_search ss
        FULL OUTER JOIN keyword_search ks ON ss.id = ks.id
        ORDER BY combined_score DESC
        LIMIT $3;
      `;

      const { rows } = await pool.query(sql, [vectorString, queryText, limit]);
      
      return rows.map(r => ({
        sourceType: 'quran',
        citation: `QS. ${r.surah_name}: ${r.ayah_number}`,
        arabic: r.text_arabic || '',
        translation: r.translation_id || '',
        score: r.combined_score || 0
      }));
    } catch (err) {
      console.error('searchQuran Error:', err);
      return [];
    }
  }

  /**
   * Search Hadiths using Hybrid Search
   * Falls back gracefully to FTS keyword search if queryVector is empty.
   */
  async searchHadith(queryText: string, queryVector: number[], limit: number = 3): Promise<RetrievalResult[]> {
    try {
      if (!queryVector || queryVector.length === 0) {
        const ftsSql = `
          SELECT h.id, b.name_id as book_name, h.hadith_number, h.text_arabic, h.translation_id, h.grade,
                 ts_rank(to_tsvector('indonesian', h.translation_id), plainto_tsquery('indonesian', $1)) AS score
          FROM hadiths h
          JOIN hadith_books b ON h.book_id = b.id
          WHERE to_tsvector('indonesian', h.translation_id) @@ plainto_tsquery('indonesian', $1)
             OR h.translation_id ILIKE $2
          ORDER BY score DESC
          LIMIT $3;
        `;
        const { rows } = await pool.query(ftsSql, [queryText, `%${queryText}%`, limit]);
        return rows.map(r => ({
          sourceType: 'hadith',
          citation: `HR. ${r.book_name}, No. ${r.hadith_number} (${r.grade || 'Shahih'})`,
          arabic: r.text_arabic || '',
          translation: r.translation_id || '',
          score: r.score || 0.5
        }));
      }

      const vectorString = `[${queryVector.join(',')}]`;
      const sql = `
        WITH semantic_search AS (
          SELECT h.id, b.name_id as book_name, h.hadith_number, h.text_arabic, h.translation_id, h.grade,
                 1 - (h.embedding <=> $1::vector) AS semantic_score
          FROM hadiths h
          JOIN hadith_books b ON h.book_id = b.id
          ORDER BY h.embedding <=> $1::vector
          LIMIT 20
        ),
        keyword_search AS (
          SELECT h.id, b.name_id as book_name, h.hadith_number, h.text_arabic, h.translation_id, h.grade,
                 ts_rank(to_tsvector('indonesian', h.translation_id), plainto_tsquery('indonesian', $2)) AS keyword_score
          FROM hadiths h
          JOIN hadith_books b ON h.book_id = b.id
          WHERE to_tsvector('indonesian', h.translation_id) @@ plainto_tsquery('indonesian', $2)
          LIMIT 20
        )
        SELECT 
          COALESCE(ss.id, ks.id) as id,
          COALESCE(ss.book_name, ks.book_name) as book_name,
          COALESCE(ss.hadith_number, ks.hadith_number) as hadith_number,
          COALESCE(ss.text_arabic, ks.text_arabic) as text_arabic,
          COALESCE(ss.translation_id, ks.translation_id) as translation_id,
          COALESCE(ss.grade, ks.grade) as grade,
          COALESCE(ss.semantic_score, 0) * 0.7 + COALESCE(ks.keyword_score, 0) * 0.3 as combined_score
        FROM semantic_search ss
        FULL OUTER JOIN keyword_search ks ON ss.id = ks.id
        ORDER BY combined_score DESC
        LIMIT $3;
      `;

      const { rows } = await pool.query(sql, [vectorString, queryText, limit]);

      return rows.map(r => ({
        sourceType: 'hadith',
        citation: `HR. ${r.book_name}, No. ${r.hadith_number} (${r.grade || 'Shahih'})`,
        arabic: r.text_arabic || '',
        translation: r.translation_id || '',
        score: r.combined_score || 0
      }));
    } catch (err) {
      console.error('searchHadith Error:', err);
      return [];
    }
  }
}

export const ragRepository = new RagRepository();
