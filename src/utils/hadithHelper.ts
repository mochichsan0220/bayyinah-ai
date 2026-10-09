export function normalizeHadithBookKey(str: string): string {
  const norm = str.toLowerCase().trim();
  if (norm.includes('bukhari')) return 'bukhari';
  if (norm.includes('muslim')) return 'muslim';
  if (norm.includes('abu dawud') || norm.includes('abudaud')) return 'abu-dawud';
  if (norm.includes('tirmidzi')) return 'tirmidzi';
  if (norm.includes('nasai')) return 'nasai';
  if (norm.includes('ibnu majah') || norm.includes('ibnumajah')) return 'ibnu-majah';
  if (norm.includes('darimi')) return 'darimi';
  if (norm.includes('malik')) return 'malik';
  if (norm.includes('ahmad')) return 'ahmad';
  return norm; // fallback
}

export function parseHadithCitation(citation: string): { bookId: string; bookName: string; hadithNumber: number } | null {
  if (!citation) return null;

  // Expected format: HR. Bukhari, No. 116 (Sahih) OR Hadis Riwayat Muslim 116
  const match = citation.match(/(?:HR\.?\s*|Hadis\s+Riwayat\s+)?([A-Za-z\-\s]+)[,\s]*(?:No\.?|Nomor)?\s*(\d+)/i);
  if (!match) return null;

  let rawBookName = match[1].trim();
  // Remove trailing words if accidentally captured (like 'No' if it wasn't caught by the regex properly)
  rawBookName = rawBookName.replace(/\s*No$/i, '').trim();
  
  const hadithNumber = parseInt(match[2], 10);
  const bookId = normalizeHadithBookKey(rawBookName);

  if (bookId) {
    return { bookId, bookName: rawBookName, hadithNumber };
  }

  return null;
}
