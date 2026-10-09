import { llmService } from './llm';
import { ragRepository } from '../db/ragRepository';

/**
 * Extracts terms inside quotes e.g. Kasih tau dong ayat tentang "Riba" -> "Riba"
 * If no quotes are found, cleans common conversational filler prefixes for FTS search.
 */
export function extractSearchTerms(rawQuery: string): { searchQuery: string; isQuoted: boolean; terms: string[] } {
  const quoteRegex = /["'“‘”]([^"'“‘”]+)["'“‘”]/g;
  const terms: string[] = [];
  let match;

  while ((match = quoteRegex.exec(rawQuery)) !== null) {
    if (match[1].trim()) {
      terms.push(match[1].trim());
    }
  }

  if (terms.length > 0) {
    return {
      searchQuery: terms.join(' '),
      isQuoted: true,
      terms
    };
  }

  // Clean conversational Indonesian prefixes if no explicit quotes are provided
  const cleaned = rawQuery
    .replace(/^(kasih\s+tau\s+dong|tolong\s+carikan|jelaskan|sebutkan|apa|bagaimana|mana)\s+/i, '')
    .replace(/\b(ayat|hadis|dalil|tentang|mengenai)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    searchQuery: cleaned || rawQuery,
    isQuoted: false,
    terms: []
  };
}

export class RagPipeline {
  async processQuery(query: string): Promise<{ answer: string; citations: string[] }> {
    // 1. Extract Quoted Terms / Clean Search Keyword
    const { searchQuery, isQuoted, terms } = extractSearchTerms(query);
    const effectiveQuery = isQuoted ? searchQuery : query;
    const ftsQuery = searchQuery || query;

    // 2. Generate Embedding (if quota available)
    const queryVector = await llmService.getEmbedding(effectiveQuery);

    // 3. Retrieve Context (Hybrid Vector + Postgres FTS Search)
    let quranResults = await ragRepository.searchQuran(ftsQuery, queryVector, 3);
    let hadithResults = await ragRepository.searchHadith(ftsQuery, queryVector, 3);

    // If initial search returned 0 results and we have a cleaned searchQuery, try with rawQuery as fallback
    if (quranResults.length === 0 && hadithResults.length === 0 && searchQuery !== query) {
      quranResults = await ragRepository.searchQuran(query, queryVector, 3);
      hadithResults = await ragRepository.searchHadith(query, queryVector, 3);
    }

    const allResults = [...quranResults, ...hadithResults].sort((a, b) => b.score - a.score).slice(0, 5);

    if (allResults.length === 0) {
      const keywordNotice = isQuoted ? ` untuk kata kunci "${terms.join('", "')}"` : '';
      return {
        answer: `Maaf, saya tidak dapat menemukan dalil yang relevan di database${keywordNotice}. Silakan coba dengan kata kunci lain atau periksa ejaan kata kunci yang diapit tanda petik.`,
        citations: []
      };
    }

    // 4. Format Context Text
    const contextText = allResults.map(r => `
Sumber: ${r.citation}
Teks Arab: ${r.arabic}
Terjemahan: ${r.translation}
    `).join('\n---\n');

    const citations = allResults.map(r => r.citation);

    // 5. Generate Answer via Gemini LLM
    const answer = await llmService.generateAnswer(query, contextText);

    // 6. Fallback formatting if LLM response indicates Quota Rate Limit / Service Error
    if (answer.includes('Rate Limit 429') || answer.includes('masalah komunikasi dengan model AI') || answer.includes('kesalahan saat memproses')) {
      const formattedDirectResults = allResults.map(r => {
        return `**[${r.citation}]**\n\n${r.arabic}\n\n**Terjemahan:** "${r.translation}"`;
      }).join('\n\n---\n\n');

      const termInfo = isQuoted ? ` (KATA KUNCI: "${terms.join('", "')}")` : '';

      const fallbackAnswer = `**Hasil Rujukan Bayyinah${termInfo}:**\n\n${formattedDirectResults}`;

      return {
        answer: fallbackAnswer,
        citations
      };
    }

    return {
      answer,
      citations
    };
  }
}

export const ragPipeline = new RagPipeline();
