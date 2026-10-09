import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class LlmService {
  /**
   * Get 1536 dimension vector embedding
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
        config: { outputDimensionality: 1536 }
      });
      return response.embeddings?.[0]?.values || [];
    } catch (error: any) {
      console.warn('Embedding API call failed/rate limited. Falling back to Lexical search:', error?.message || error);
      return [];
    }
  }

  /**
   * Generate answer using strict grounding
   */
  async generateAnswer(query: string, context: string): Promise<string> {
    const prompt = `
Anda adalah asisten virtual ahli agama Islam yang bertugas menjawab pertanyaan berdasarkan dalil otentik Al-Qur'an dan Hadis.
DILARANG KERAS menjawab berdasarkan pengetahuan umum di luar konteks yang diberikan. 
Jika informasi yang relevan tidak ditemukan pada konteks di bawah, jawablah: "Maaf, saya tidak dapat menemukan dalil yang relevan di database untuk pertanyaan ini."

Konteks Dalil:
${context}

Pertanyaan Pengguna:
${query}

Instruksi tambahan:
- Setiap respon WAJIB menyertakan format sitasi standar: [QS. Nama Surat: No. Ayat] atau [HR. Perawi, No. Hadis (Derajat)].
- Jangan mengarang ayat atau hadis (halusinasi).
`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return response.text || "Maaf, terjadi kesalahan saat memproses jawaban.";
    } catch (error: any) {
      console.error('LLM generateContent Error:', error?.message || error);
      if (error?.status === 429 || String(error).includes('429') || String(error).includes('quota')) {
        return "Sistem saat ini sedang mengalami batas kuota (Rate Limit 429) dari API Gemini. Silakan coba kembali beberapa saat lagi.";
      }
      return "Maaf, terjadi masalah komunikasi dengan model AI. Silakan coba kembali.";
    }
  }
}

export const llmService = new LlmService();
