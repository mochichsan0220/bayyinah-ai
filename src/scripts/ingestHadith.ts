import { pool } from '../db/pool';
import { llmService } from '../agent/llm';
import axios from 'axios';

// Konfigurasi Kitab Hadis menggunakan API alternatif yang tidak terkena isu SSL Node
// 'bukhari', 'muslim', 'abu-dawud', 'tirmidzi', 'nasai', 'ibnu-majah', 'darimi', 'malik', 'ahmad'
const BASE_URL = 'https://hadis-api-id.vercel.app/hadith';

async function ingestHadithBook(bookId: string, limit: number = 50, page: number = 1) {
  console.log(`Fetching Hadith from ${bookId} (Page: ${page}, Limit: ${limit})...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${bookId}?page=${page}&limit=${limit}`);
    const bookData = response.data;
    
    // 1. Insert ke hadith_books
    await pool.query(
      'INSERT INTO hadith_books (id, name_arabic, name_id, total_hadiths) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [bookData.slug, bookData.name, bookData.name, bookData.total]
    );

    const hadiths = bookData.items;
    console.log(`Processing ${bookData.name} (${hadiths.length} hadis)`);

    // 2. Loop dan insert setiap hadis
    for (const hadith of hadiths) {
      console.log(`  Ingesting Hadith No. ${hadith.number}`);
      
      // Teks yang akan di-embed: Kitab, Nomor, Terjemahan
      const embeddingText = `Hadis Riwayat ${bookData.name} nomor ${hadith.number}. Terjemahan: ${hadith.id}`;
      const embedding = await llmService.getEmbedding(embeddingText);

      if (embedding.length === 0) {
        console.error(`❌ Gagal mendapatkan embedding untuk Hadis No. ${hadith.number}. Menghentikan proses untuk mencegah data kosong.`);
        process.exit(1);
      }

      await pool.query(
        `INSERT INTO hadiths (book_id, hadith_number, text_arabic, translation_id, embedding)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT ON CONSTRAINT unique_book_hadith DO NOTHING`,
        [
          bookData.slug, 
          hadith.number, 
          hadith.arab, 
          hadith.id, 
          `[${embedding.join(',')}]`
        ]
      );
      
      // Jeda 1 detik agar tidak kena rate-limit Gemini API (100 req/menit)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Finished Ingesting ${bookData.name} (${hadiths.length} hadis)`);
  } catch (err) {
    console.error(`Gagal mengambil data dari book ${bookId}:`, err);
  }
}

async function main() {
  const argBook = process.argv[2]; // misal: bukhari
  const argLimit = parseInt(process.argv[3]) || 10;
  const argPage = parseInt(process.argv[4]) || 1;

  try {
    if (argBook) {
      // Ingest kitab spesifik: npx tsx src/scripts/ingestHadith.ts bukhari 50 1
      await ingestHadithBook(argBook, argLimit, argPage);
    } else {
      // Default jika tidak ada argumen
      console.log('Menjalankan default ingest: Bukhari hadis 1-10');
      await ingestHadithBook('bukhari', 10, 1);
      
      console.log('Untuk custom: npx tsx src/scripts/ingestHadith.ts <nama_kitab> <limit> <page>');
      console.log('Contoh 1-100: npx tsx src/scripts/ingestHadith.ts muslim 100 1');
      console.log('Contoh 101-200: npx tsx src/scripts/ingestHadith.ts muslim 100 2');
    }

    console.log('🎉 Ingestion Hadis completed.');
    process.exit(0);
  } catch (err) {
    console.error('Ingestion failed', err);
    process.exit(1);
  }
}

main();
