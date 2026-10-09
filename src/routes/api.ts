import { Router, Request, Response } from 'express';
import { ragPipeline } from '../agent/ragPipeline';
import { pool } from '../db/pool';
import { parseQuranCitation, buildQuranComUrl, buildKemenagQuranUrl } from '../utils/quranHelper';

export const apiRouter = Router();

apiRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Field "query" is required' });
    }

    const startTime = Date.now();
    const result = await ragPipeline.processQuery(query);
    const latencyMs = Date.now() - startTime;

    // Log Query
    await pool.query(
      'INSERT INTO query_logs (user_query, llm_response, latency_ms) VALUES ($1, $2, $3)',
      [query, result.answer, latencyMs]
    ).catch(e => console.error('Failed to log query:', e));

    return res.json({
      answer: result.answer,
      citations: result.citations,
      latencyMs
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/quran/verse?citation=QS.%20Al-Baqarah:%20225
 * Returns verse details & direct links to Quran.com and Kemenag Quran
 */
apiRouter.get('/quran/verse', async (req: Request, res: Response) => {
  try {
    const citation = req.query.citation as string;
    if (!citation) {
      return res.status(400).json({ error: 'Query parameter "citation" is required' });
    }

    const parsed = parseQuranCitation(citation);
    if (!parsed) {
      return res.status(400).json({ error: 'Format sitasi Al-Qur\'an tidak valid' });
    }

    const { surahId, ayahNumber } = parsed;

    // 1. Check local DB
    const sql = `
      SELECT q.text_arabic, q.text_latin, q.translation_id, s.name_latin as surah_name, s.name_arabic as surah_arabic
      FROM quran_verses q
      JOIN surahs s ON q.surah_id = s.id
      WHERE q.surah_id = $1 AND q.ayah_number = $2
    `;
    const { rows } = await pool.query(sql, [surahId, ayahNumber]);

    const quranComUrl = buildQuranComUrl(surahId, ayahNumber);
    const kemenagUrl = buildKemenagQuranUrl(surahId, ayahNumber);

    if (rows.length > 0) {
      const verse = rows[0];
      return res.json({
        surahId,
        surahName: verse.surah_name,
        surahArabic: verse.surah_arabic,
        ayahNumber,
        textArabic: verse.text_arabic,
        textLatin: verse.text_latin,
        translationId: verse.translation_id,
        quranComUrl,
        kemenagUrl
      });
    }

    // Fallback if not ingested yet
    return res.json({
      surahId,
      surahName: parsed.surahName,
      ayahNumber,
      textArabic: '',
      translationId: '',
      quranComUrl,
      kemenagUrl
    });

  } catch (error) {
    console.error('Quran Verse API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/quran/surahs
 * Returns all surahs
 */
apiRouter.get('/quran/surahs', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT id, name_arabic, name_latin, translation_id, total_ayahs, revelation_type FROM surahs ORDER BY id ASC');
    return res.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/quran/surahs/:id/verses
 * Returns all verses for a given surah
 */
apiRouter.get('/quran/surahs/:id/verses', async (req: Request, res: Response) => {
  try {
    const surahId = parseInt(req.params.id);
    const { rows } = await pool.query('SELECT ayah_number, text_arabic, text_latin, translation_id FROM quran_verses WHERE surah_id = $1 ORDER BY ayah_number ASC', [surahId]);
    return res.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/hadith/detail?citation=HR.%20Muslim,%20No.%20116
 * Returns hadith details
 */
apiRouter.get('/hadith/detail', async (req: Request, res: Response) => {
  try {
    const citation = req.query.citation as string;
    if (!citation) {
      return res.status(400).json({ error: 'Query parameter "citation" is required' });
    }

    // Require hadithHelper inline or import it at top. I will require it to avoid touch top lines.
    const { parseHadithCitation } = require('../utils/hadithHelper');
    const parsed = parseHadithCitation(citation);
    if (!parsed) {
      return res.status(400).json({ error: 'Format sitasi Hadis tidak valid' });
    }

    const { bookId, hadithNumber, bookName } = parsed;

    // 1. Check local DB
    const sql = `
      SELECT h.text_arabic, h.translation_id, b.name_id as book_name
      FROM hadiths h
      JOIN hadith_books b ON h.book_id = b.id
      WHERE h.book_id = $1 AND h.hadith_number = $2
    `;
    const { rows } = await pool.query(sql, [bookId, hadithNumber]);

    const sunnahComUrl = `https://sunnah.com/${bookId}:${hadithNumber}`;

    if (rows.length > 0) {
      const hadith = rows[0];
      return res.json({
        bookId,
        bookName: hadith.book_name,
        hadithNumber,
        textArabic: hadith.text_arabic,
        translationId: hadith.translation_id,
        sourceUrl: sunnahComUrl
      });
    }

    // Fallback if not ingested yet
    return res.json({
      bookId,
      bookName: bookName,
      hadithNumber,
      textArabic: '',
      translationId: '',
      sourceUrl: sunnahComUrl
    });

  } catch (error) {
    console.error('Hadith Detail API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
