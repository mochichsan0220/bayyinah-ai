document.addEventListener('DOMContentLoaded', () => {
  const queryForm = document.getElementById('queryForm');
  const queryInput = document.getElementById('queryInput');
  const chatMessages = document.getElementById('chatMessages');
  const welcomeHero = document.getElementById('welcomeHero');
  const sendBtn = document.getElementById('sendBtn');
  const clearStreamBtn = document.getElementById('clearStreamBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const micBtn = document.getElementById('micBtn');

  // Sidebar Controls
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  // Scope Toggle Controls
  const toggleScopeBtn = document.getElementById('toggleScopeBtn');
  const scopeSelector = document.getElementById('scopeSelector');

  // Quran Reader Modal
  const quranReaderModal = document.getElementById('quranReaderModal');
  const closeQuranModal = document.getElementById('closeQuranModal');

  if (closeQuranModal && quranReaderModal) {
    closeQuranModal.addEventListener('click', () => quranReaderModal.close());
  }

  // Global Event Listener for Citation Badges
  document.addEventListener('click', (e) => {
    const badge = e.target.closest('.citation-badge[data-citation]');
    if (badge) {
      const citation = badge.getAttribute('data-citation');
      if (citation) {
        showCitationDetail(citation);
      }
    }
  });

  // Sidebar Toggle
  const toggleSidebar = (show) => {
    if (show) {
      sidebar.classList.remove('-translate-x-full');
      sidebarBackdrop.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebarBackdrop.classList.add('hidden');
    }
  };

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => toggleSidebar(true));
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

  // Scope Popover Toggle
  if (toggleScopeBtn && scopeSelector) {
    toggleScopeBtn.addEventListener('click', () => {
      scopeSelector.classList.toggle('hidden');
    });
  }

  // Auto-resize Textarea
  if (queryInput) {
    queryInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });

    queryInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        queryForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  // Sample Prompts click
  document.querySelectorAll('.sample-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt && queryInput) {
        queryInput.value = prompt;
        queryInput.style.height = 'auto';
        queryInput.style.height = (queryInput.scrollHeight) + 'px';
        toggleSidebar(false);
        submitQuery(prompt);
      }
    });
  });

  // Scope Selection
  document.querySelectorAll('.scope-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.scope-pill').forEach(p => {
        p.classList.remove('active', 'bg-emerald-100', 'text-emerald-700', 'font-medium');
        p.classList.add('text-slate-600', 'hover:bg-slate-100');
      });
      pill.classList.add('active', 'bg-emerald-100', 'text-emerald-700', 'font-medium');
      pill.classList.remove('text-slate-600', 'hover:bg-slate-100');
      if (scopeSelector) scopeSelector.classList.add('hidden');
    });
  });

  // Clear Chat / Reset
  const resetChat = () => {
    chatMessages.innerHTML = '';
    if (welcomeHero) {
      chatMessages.appendChild(welcomeHero);
      welcomeHero.classList.remove('hidden');
    }
  };

  if (clearStreamBtn) clearStreamBtn.addEventListener('click', resetChat);
  if (newChatBtn) newChatBtn.addEventListener('click', () => {
    resetChat();
    toggleSidebar(false);
  });

  // Speech Recognition (Mic)
  if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;

      micBtn.addEventListener('click', () => {
        micBtn.classList.add('text-emerald-600', 'animate-pulse');
        recognition.start();
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (queryInput) {
          queryInput.value = transcript;
        }
        micBtn.classList.remove('text-emerald-600', 'animate-pulse');
      };

      recognition.onerror = recognition.onend = () => {
        micBtn.classList.remove('text-emerald-600', 'animate-pulse');
      };
    } else {
      micBtn.addEventListener('click', () => {
        alert('Fitur pengenalan suara tidak didukung oleh browser Anda.');
      });
    }
  }

  // Query Form Submit
  if (queryForm) {
    queryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = queryInput.value.trim();
      if (!text) return;
      submitQuery(text);
    });
  }

  // Core Submit Handler
  async function submitQuery(queryText) {
    if (welcomeHero && !welcomeHero.classList.contains('hidden')) {
      welcomeHero.classList.add('hidden');
    }

    appendUserMessage(queryText);
    queryInput.value = '';
    queryInput.style.height = 'auto';

    const loadingId = 'loading-' + Date.now();
    appendLoadingMessage(loadingId);

    if (sendBtn) sendBtn.disabled = true;

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });

      const data = await response.json();

      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      if (response.ok) {
        appendAiMessage(data.answer, data.citations || [], data.latencyMs);
      } else {
        appendErrorMessage(data.error || 'Gagal memproses pertanyaan. Silakan coba kembali.');
      }
    } catch (err) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      appendErrorMessage('Terjadi kesalahan jaringan atau server.');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  // Append User Message Bubble
  function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start justify-end space-x-3 max-w-2xl ml-auto animate-fade-in my-3';
    msgDiv.innerHTML = `
      <div class="px-5 py-3 rounded-3xl bg-blue-600 text-white text-sm leading-relaxed shadow-sm font-sans max-w-lg">
        ${escapeHtml(text)}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  // Append AI Loading Skeleton
  function appendLoadingMessage(id) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'flex items-start space-x-3.5 max-w-2xl mr-auto animate-fade-in my-4';
    loadingDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg class="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#gemini-sparkle-loading)"/>
          <defs>
            <linearGradient id="gemini-sparkle-loading" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#38BDF8"/>
              <stop offset="0.5" stop-color="#10B981"/>
              <stop offset="1" stop-color="#F59E0B"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="space-y-2 flex-1">
        <div class="text-xs text-slate-400 font-medium flex items-center space-x-2">
          <span>Mencari rujukan Al-Qur'an & Hadis...</span>
        </div>
        <div class="space-y-2 opacity-50">
          <div class="h-3.5 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
          <div class="h-3.5 bg-slate-200 rounded-full w-full animate-pulse"></div>
          <div class="h-3.5 bg-slate-200 rounded-full w-4/5 animate-pulse"></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
  }

  // Append AI Message Bubble
  function appendAiMessage(answer, citations, latencyMs) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start space-x-3.5 max-w-2xl mr-auto animate-fade-in my-4';

    const formattedAnswer = formatMarkdown(answer);
    
    let citationsHtml = '';
    if (citations && citations.length > 0) {
      citationsHtml = `
        <div class="pt-3 border-t border-slate-200/80 mt-3 space-y-2">
          <div class="text-[11px] font-medium text-slate-500 flex items-center space-x-1.5">
            <i class="fa-solid fa-quote-right text-emerald-600"></i>
            <span>Rujukan Terverifikasi (${citations.length}):</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${citations.map(c => {
              const cleanC = c.replace(/&#039;/g, "'");
              const isHadith = cleanC.toLowerCase().includes('hr.') || cleanC.toLowerCase().includes('hadis');
              const badgeClass = isHadith ? 'citation-badge-hadith' : '';
              const icon = isHadith ? 'fa-scroll' : 'fa-book-quran';
              return `<span class="citation-badge ${badgeClass}" data-citation="${escapeHtml(cleanC)}">
                <i class="fa-solid ${icon} text-[10px]"></i>
                ${escapeHtml(cleanC)}
              </span>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    const messageId = 'msg-' + Date.now();

    msgDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#gemini-sparkle-msg-${messageId})"/>
          <defs>
            <linearGradient id="gemini-sparkle-msg-${messageId}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#38BDF8"/>
              <stop offset="0.5" stop-color="#10B981"/>
              <stop offset="1" stop-color="#F59E0B"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="space-y-2 flex-1 min-w-0">
        <div class="chat-markdown text-slate-800 text-sm sm:text-base leading-relaxed" id="${messageId}">
          ${formattedAnswer}
        </div>
        ${citationsHtml}

        <!-- Response Action Tools -->
        <div class="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span class="text-[10px] text-slate-400">
            ${latencyMs ? `⚡ ${latencyMs} ms • ` : ''}Strict Grounding RAG
          </span>
          <div class="flex items-center space-x-2">
            <button onclick="copyToClipboard('${messageId}')" title="Salin" class="p-1 rounded text-slate-400 hover:text-slate-700 transition">
              <i class="fa-regular fa-copy"></i>
            </button>
            <button onclick="speakText('${messageId}')" title="Suara" class="p-1 rounded text-slate-400 hover:text-slate-700 transition">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  // Append Error Message
  function appendErrorMessage(errText) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start space-x-3 max-w-2xl mr-auto animate-fade-in my-3';
    msgDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 text-xs">
        <i class="fa-solid fa-exclamation"></i>
      </div>
      <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
        ${escapeHtml(errText)}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMarkdown(text) {
    let raw = escapeHtml(text);

    // 1. Replace Bracketed Qur'an Citations e.g. [QS. Al-An'am: 151], [QS. Al-Baqarah: 225], [QS. 6:151]
    raw = raw.replace(/\[\s*(QS\.?\s*[A-Za-z0-9\s'’\`&#;]+?[:\s,]+(?:ayat\s*)?\d+)\s*\]/gi, (match, citationStr) => {
      const cleanCitation = citationStr.replace(/&#039;/g, "'");
      return `<span class="citation-badge font-semibold" data-citation="${escapeHtml(cleanCitation)}"><i class="fa-solid fa-book-quran text-[10px]"></i> ${escapeHtml(cleanCitation)}</span>`;
    });

    // 2. Replace Unbracketed Qur'an Citations e.g. QS. Al-An'am: 151 or QS Al-Anam 151
    raw = raw.replace(/(^|[\s(])(QS\.?\s+[A-Za-z0-9'’\`&#;]+(?:[ -][A-Za-z0-9'’\`&#;]+)*[:\s,]+(?:ayat\s*)?\d+)(?=$|[\s),.])/gi, (match, prefix, citationStr) => {
      const cleanCitation = citationStr.replace(/&#039;/g, "'");
      return `${prefix}<span class="citation-badge font-semibold" data-citation="${escapeHtml(cleanCitation)}"><i class="fa-solid fa-book-quran text-[10px]"></i> ${escapeHtml(cleanCitation)}</span>`;
    });

    // 3. Replace Hadith Citations e.g. [HR. Bukhari, No. 1 (Sahih)]
    raw = raw.replace(/\[\s*(HR\.?\s*[A-Za-z0-9\s'’\`&#;]+?,?\s*(?:No\.?)?\s*\d+[^\]]*)\s*\]/gi, (match, citationStr) => {
      const cleanCitation = citationStr.replace(/&#039;/g, "'");
      return `<span class="citation-badge citation-badge-hadith font-semibold" data-citation="${escapeHtml(cleanCitation)}"><i class="fa-solid fa-scroll text-[10px]"></i> ${escapeHtml(cleanCitation)}</span>`;
    });

    raw = raw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    raw = raw.replace(/^\s*[\-\*]\s+(.*)$/gm, '<li>$1</li>');
    raw = raw.replace(/(<li>.*<\/li>)/s, '<ul class="my-2 space-y-1">$1</ul>');

    const paragraphs = raw.split(/\n\n+/);
    return paragraphs.map(p => {
      const arabicCount = (p.match(/[\u0600-\u06FF]/g) || []).length;
      if (arabicCount > 10) {
        return `<div class="arabic-text">${p}</div>`;
      }
      return `<p class="mb-2">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  window.copyToClipboard = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Jawaban berhasil disalin.');
    });
  };

  window.speakText = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Interactive Citation Click -> Opens Quran Reader Modal with Direct Quran.com & Kemenag links
  window.showCitationDetail = async function(citation) {
    const modal = document.getElementById('quranReaderModal');
    const titleEl = document.getElementById('modalCitationTitle');
    const arabicEl = document.getElementById('modalArabicBlock');
    const translationEl = document.getElementById('modalTranslationText');
    const quranComLink = document.getElementById('quranComLink');
    const kemenagLink = document.getElementById('kemenagLink');

    const cleanCitation = citation.replace(/&#039;/g, "'");
    const isHadith = cleanCitation.toLowerCase().includes('hr.') || cleanCitation.toLowerCase().includes('hadis');

    if (titleEl) titleEl.textContent = cleanCitation;
    if (arabicEl) arabicEl.textContent = isHadith ? 'Mencari teks hadis...' : 'Mencari teks ayat...';
    if (translationEl) translationEl.textContent = 'Memuat terjemahan...';

    if (quranComLink) {
        quranComLink.innerHTML = isHadith ? '<i class="fa-solid fa-arrow-up-right-from-square mr-1.5"></i> Buka di Sunnah.com' : '<i class="fa-solid fa-arrow-up-right-from-square mr-1.5"></i> Buka di Quran.com';
    }
    if (kemenagLink) {
        kemenagLink.style.display = isHadith ? 'none' : 'flex';
    }

    if (modal) modal.showModal();

    try {
      const endpoint = isHadith ? `/api/hadith/detail?citation=${encodeURIComponent(cleanCitation)}` : `/api/quran/verse?citation=${encodeURIComponent(cleanCitation)}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (res.ok && data) {
        if (isHadith) {
            if (titleEl) titleEl.textContent = `${cleanCitation}`;
            if (arabicEl) arabicEl.textContent = data.textArabic || 'Teks Arab tersedia di situs terkait';
            if (translationEl) translationEl.textContent = data.translationId || 'Terjemahan tersedia via tautan online.';
            if (quranComLink) quranComLink.href = data.sourceUrl || 'https://sunnah.com';
        } else {
            if (titleEl) titleEl.textContent = `${cleanCitation} (${data.surahName})`;
            if (arabicEl) arabicEl.textContent = data.textArabic || 'Teks Arab tersedia di Quran.com';
            if (translationEl) translationEl.textContent = data.translationId || 'Terjemahan tersedia via tautan online.';
            if (quranComLink) quranComLink.href = data.quranComUrl || 'https://quran.com';
            if (kemenagLink) kemenagLink.href = data.kemenagUrl || 'https://quran.kemenag.go.id';
        }
      } else {
        if (translationEl) translationEl.textContent = 'Teks rujukan tersedia di situs resmi online.';
        if (quranComLink) quranComLink.href = isHadith ? 'https://sunnah.com' : 'https://quran.com';
        if (kemenagLink) kemenagLink.href = 'https://quran.kemenag.go.id';
      }
    } catch (e) {
      if (translationEl) translationEl.textContent = isHadith ? 'Klik tombol di bawah untuk membuka hadis di Sunnah.com.' : 'Klik tombol di bawah untuk membuka ayat di Quran.com / Kemenag.';
      if (quranComLink) quranComLink.href = isHadith ? 'https://sunnah.com' : 'https://quran.com';
      if (kemenagLink) kemenagLink.href = 'https://quran.kemenag.go.id';
    }
  };
});
