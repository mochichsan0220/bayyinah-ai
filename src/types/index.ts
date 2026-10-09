export interface RetrievalResult {
  sourceType: 'quran' | 'hadith';
  citation: string;
  arabic: string;
  translation: string;
  score: number;
}
