import { pool } from '../db/pool';
import { llmService } from '../agent/llm';
import axios from 'axios';

async function ingestSurah(surahNumber: number) {
  console.log(`Fetching Surah ${surahNumber}...`);
  const { data: ayahData } = await axios.get(`https://equran.id/api/v2/surat/${surahNumber}`);
  const surah = ayahData.data;

  // Insert Surah
  await pool.query(
    'INSERT INTO surahs (id, name_arabic, name_latin, translation_id, total_ayahs, revelation_type) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
    [surah.nomor, surah.nama, surah.namaLatin, surah.arti, surah.jumlahAyat, surah.tempatTurun]
  );

  const ayahs = surah.ayat;
  console.log(`Processing Surah: ${surah.namaLatin} (${ayahs.length} ayat)`);

  for (const ayah of ayahs) {
    console.log(`  Ingesting Ayah ${ayah.nomorAyat}/${ayahs.length}`);
    const embeddingText = `Surat ${surah.namaLatin} ayat ${ayah.nomorAyat}: ${ayah.teksIndonesia}. Tafsir ringkas: ${surah.deskripsi}`;
    const embedding = await llmService.getEmbedding(embeddingText);

    if (embedding.length === 0) {
      console.error(`❌ Gagal mendapatkan embedding untuk Ayat ${ayah.nomorAyat}. Menghentikan proses untuk mencegah data kosong.`);
      process.exit(1);
    }

    await pool.query(
      `INSERT INTO quran_verses (surah_id, ayah_number, juz, page, text_arabic, text_latin, translation_id, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ON CONSTRAINT unique_surah_ayah DO NOTHING`,
      [surah.nomor, ayah.nomorAyat, 1, 1, ayah.teksArab, ayah.teksLatin, ayah.teksIndonesia, `[${embedding.join(',')}]`]
    );
    
    // Jeda 1 detik agar tidak kena rate-limit Gemini API (100 req/menit)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ Finished Surah ${surah.namaLatin}`);
}

async function main() {
  const arg = process.argv[2];

  try {
    if (arg) {
      // Ingest specific surah: npx tsx src/scripts/ingestQuran.ts 2
      const surahNum = parseInt(arg, 10);
      if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
        console.error('Nomor surah harus antara 1-114');
        process.exit(1);
      }
      await ingestSurah(surahNum);
    } else {
      // Ingest all surahs
      console.log('Ingesting all 114 surahs...');
      for (let i = 1; i <= 114; i++) {
        await ingestSurah(i);
      }
    }

    console.log('🎉 Ingestion completed.');
    process.exit(0);
  } catch (err) {
    console.error('Ingestion failed', err);
    process.exit(1);
  }
}

main();
