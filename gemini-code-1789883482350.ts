// types/database.ts

export interface Surah {
  id: number;
  nameArabic: string;
  nameLatin: string;
  translationId: string;
  totalAyahs: number;
  revelationType: 'Makkiyah' | 'Madaniyah';
}

export interface QuranVerse {
  id: string;
  surahId: number;
  surahName?: string;
  ayahNumber: number;
  juz: number;
  page: number;
  textArabic: string;
  textLatin?: string;
  translationId: string;
  tafsirBrief?: string;
  embedding?: number[];
}

export interface HadithBook {
  id: string;
  nameArabic: string;
  nameId: string;
  totalHadiths: number;
}

export interface Hadith {
  id: string;
  bookId: string;
  hadithNumber: number;
  chapterName?: string;
  sanad?: string;
  textArabic: string;
  translationId: string;
  grade: 'Sahih' | 'Hasan' | 'Daif' | 'Maudu';
  gradeSource?: string;
  embedding?: number[];
}

export interface RetrievalResult {
  sourceType: 'quran' | 'hadith';
  citation: string; // e.g., "QS. Al-Baqarah: 183" atau "HR. Bukhari No. 1901 (Sahih)"
  arabic: string;
  translation: string;
  score: number;
}