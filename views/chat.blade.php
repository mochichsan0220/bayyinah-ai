@extends('layouts.app')

@section('content')
<div class="relative flex flex-col h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 via-70% to-sky-100/70">

  <!-- Mobile/Desktop Sidebar Overlay Backdrop -->
  <div id="sidebarBackdrop" class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs hidden transition-opacity"></div>

  <!-- Left Sidebar Drawer -->
  <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 border-r border-slate-200/80 backdrop-blur-xl flex flex-col transition-transform duration-300 transform -translate-x-full shadow-2xl">
    
    <!-- Sidebar Header -->
    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <svg class="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#sparkle-grad-side)"/>
          <defs>
            <linearGradient id="sparkle-grad-side" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#10B981"/>
              <stop offset="0.5" stop-color="#06B6D4"/>
              <stop offset="1" stop-color="#3B82F6"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="font-heading font-bold text-slate-800 tracking-tight text-base">Bayyinah AI</span>
      </div>
      <button id="closeSidebarBtn" class="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <!-- New Chat Button -->
    <div class="p-4 border-b border-slate-100">
      <button id="newChatBtn" class="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition active:scale-98">
        <i class="fa-solid fa-plus text-xs text-slate-500"></i>
        <span>Percakapan Baru</span>
      </button>
    </div>

    <!-- Sidebar Menu List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
      
      <!-- Nav Menu -->
      <div>
        <h3 class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Menu Utama</h3>
        <div class="space-y-1">
          <a href="/" class="w-full text-left px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium transition flex items-center space-x-2.5">
            <i class="fa-solid fa-robot text-emerald-500 text-xs"></i>
            <span>Tanya AI (RAG)</span>
          </a>
          <a href="/baca-quran" class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center space-x-2.5 group">
            <i class="fa-solid fa-book-open-reader text-sky-500 text-xs group-hover:scale-110 transition"></i>
            <span>Baca Al-Qur'an</span>
          </a>
        </div>
      </div>

      <div>
        <h3 class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Rekomendasi Pertanyaan</h3>
        <div class="space-y-1">
          <button class="sample-prompt-btn w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center space-x-2.5 group" data-prompt="Apa ayat Al-Qur'an tentang kewajiban berbuat baik kepada kedua orang tua?">
            <i class="fa-solid fa-book-quran text-emerald-500 text-xs group-hover:scale-110 transition"></i>
            <span class="truncate">Bakti Kepada Orang Tua</span>
          </button>
          
          <button class="sample-prompt-btn w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center space-x-2.5 group" data-prompt="Tampilkan hadis shahih tentang niat dari Shahih Bukhari beserta teks Arab dan artinya.">
            <i class="fa-solid fa-scroll text-amber-500 text-xs group-hover:scale-110 transition"></i>
            <span class="truncate">Hadis Niat (Bukhari No. 1)</span>
          </button>

          <button class="sample-prompt-btn w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center space-x-2.5 group" data-prompt="Sebutkan dalil Al-Qur'an tentang larangan riba dan dampaknya bagi perekonomian.">
            <i class="fa-solid fa-coins text-sky-500 text-xs group-hover:scale-110 transition"></i>
            <span class="truncate">Hukum Riba dalam Islam</span>
          </button>

          <button class="sample-prompt-btn w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition flex items-center space-x-2.5 group" data-prompt="Bagaimana keutamaan dan kewajiban menuntut ilmu dalam Islam berdasarkan dalil sahih?">
            <i class="fa-solid fa-graduation-cap text-indigo-500 text-xs group-hover:scale-110 transition"></i>
            <span class="truncate">Keutamaan Menuntut Ilmu</span>
          </button>
        </div>
      </div>

      <!-- Database Info -->
      <div class="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 space-y-2">
        <div class="font-medium text-slate-700 flex items-center space-x-2">
          <i class="fa-solid fa-database text-emerald-600"></i>
          <span>Cakupan Dalil Engine</span>
        </div>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          Terintegrasi 30 Juz Al-Qur'an dan Hadis Kutubut Tis'ah dengan verifikasi <em>Strict Grounding RAG</em>.
        </p>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
      Bayyinah RAG Agent v1.0
    </div>
  </aside>

  <!-- Top Gemini-style Navbar -->
  <header class="h-14 px-4 sm:px-6 flex items-center justify-between z-30 bg-transparent">
    <div class="flex items-center space-x-3">
      <!-- Hamburger Toggle -->
      <button id="openSidebarBtn" class="text-slate-700 hover:text-slate-900 p-2 rounded-full hover:bg-slate-200/50 transition">
        <i class="fa-solid fa-bars-staggered text-lg"></i>
      </button>

      <!-- Gemini Dropdown Title -->
      <div class="relative group">
        <button class="flex items-center space-x-1.5 font-heading text-slate-800 hover:text-slate-900 font-medium text-sm sm:text-base focus:outline-none">
          <span class="font-bold text-slate-900">Bayyinah</span>
          <span class="text-xs text-slate-500 font-normal ml-0.5">Strict RAG</span>
          <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-1"></i>
        </button>
      </div>
    </div>

    <!-- Top Right Actions -->
    <div class="flex items-center space-x-2">
      <button id="clearStreamBtn" title="Percakapan Baru" class="w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center transition">
        <i class="fa-regular fa-pen-to-square text-base"></i>
      </button>
    </div>
  </header>

  <!-- Main Chat / Messages View -->
  <main class="flex-1 flex flex-col h-full min-w-0 relative">
    
    <div id="chatMessages" class="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 pt-4 pb-32 space-y-6 custom-scrollbar scroll-smooth max-w-3xl mx-auto w-full">
      
      <!-- Gemini Center Hero (Visible on Load) -->
      <div id="welcomeHero" class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in my-auto">
        
        <!-- Gemini Multi-color Sparkle Icon -->
        <div class="mb-6 relative">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 animate-pulse-subtle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#gemini-sparkle-hero)"/>
            <defs>
              <linearGradient id="gemini-sparkle-hero" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stop-color="#38BDF8"/>
                <stop offset="0.35" stop-color="#3B82F6"/>
                <stop offset="0.7" stop-color="#10B981"/>
                <stop offset="1" stop-color="#F59E0B"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-normal text-slate-800 tracking-tight max-w-md mb-8">
          Ada yang bisa Bayyinah bantu hari ini?
        </h1>

        <!-- Quick Pill Suggestions -->
        <div class="flex flex-wrap justify-center gap-2 max-w-lg">
          <button class="sample-prompt-btn px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow text-xs text-slate-700 transition flex items-center space-x-2" data-prompt="Sebutkan ayat Al-Qur'an tentang kewajiban berbuat baik kepada kedua orang tua beserta nomor surat dan artinya.">
            <i class="fa-solid fa-heart text-rose-500 text-xs"></i>
            <span>Bakti Orang Tua</span>
          </button>

          <button class="sample-prompt-btn px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow text-xs text-slate-700 transition flex items-center space-x-2" data-prompt="Tampilkan hadis shahih tentang niat dari Shahih Bukhari No. 1 beserta teks Arab dan artinya.">
            <i class="fa-solid fa-scroll text-amber-500 text-xs"></i>
            <span>Hadis Niat</span>
          </button>

          <button class="sample-prompt-btn px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow text-xs text-slate-700 transition flex items-center space-x-2" data-prompt="Apa hukum dan ancaman riya' dalam beribadah menurut Al-Qur'an dan Hadis?">
            <i class="fa-solid fa-scale-balanced text-emerald-500 text-xs"></i>
            <span>Bahaya Riya'</span>
          </button>
        </div>

      </div>

    </div>

    <!-- Gemini-style Floating Bottom Capsule Input -->
    <div class="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-2xl w-full z-40 px-2 sm:px-0">
      
      <!-- Scope Selection Popover / Floating Badge -->
      <div id="scopeSelector" class="hidden mb-2 p-1.5 rounded-2xl bg-white shadow-lg border border-slate-200/80 flex items-center space-x-1 text-xs max-w-max mx-auto animate-fade-in">
        <button class="scope-pill active px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium transition" data-scope="all">Semua Dalil</button>
        <button class="scope-pill px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 transition" data-scope="quran">Al-Qur'an</button>
        <button class="scope-pill px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 transition" data-scope="hadith">Hadis Sahih</button>
      </div>

      <form id="queryForm" class="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-[0_12px_35px_rgba(0,0,0,0.08)] px-4 py-2.5 transition focus-within:shadow-[0_14px_40px_rgba(0,0,0,0.12)] focus-within:border-slate-300">
        
        <!-- Left Plus Button (Scope filter toggle) -->
        <button type="button" id="toggleScopeBtn" title="Filter Rujukan" class="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center flex-shrink-0 transition mr-2">
          <i class="fa-solid fa-plus text-base"></i>
        </button>

        <!-- Input Textarea -->
        <textarea 
          id="queryInput" 
          rows="1" 
          placeholder="Tanyakan dalil Al-Qur'an & Hadis..." 
          class="w-full py-1 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none resize-none custom-scrollbar max-h-32"
          required></textarea>
        
        <!-- Right Actions (Mic & Send) -->
        <div class="flex items-center space-x-1 ml-2 flex-shrink-0">
          <button type="button" id="micBtn" title="Suara" class="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition">
            <i class="fa-solid fa-microphone text-base"></i>
          </button>
          
          <button 
            type="submit" 
            id="sendBtn"
            class="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="fa-solid fa-arrow-up text-sm"></i>
          </button>
        </div>
      </form>

      <div class="text-[11px] text-slate-400 text-center mt-2 font-sans">
        Bayyinah terverifikasi database 30 Juz Al-Qur'an & Kutubut Tis'ah
      </div>
    </div>

  </main>
</div>

<!-- Interactive Quran & Hadith Reader Modal -->
<dialog id="quranReaderModal" class="p-0 rounded-3xl bg-white border border-slate-200 text-slate-800 backdrop:bg-slate-900/40 shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-fade-in">
  <div class="p-6 space-y-4">
    
    <!-- Modal Header -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
          <i class="fa-solid fa-book-quran"></i>
        </div>
        <div>
          <h3 id="modalCitationTitle" class="font-heading font-bold text-base text-slate-900">QS. Al-Baqarah: 225</h3>
          <p id="modalSurahSub" class="text-xs text-slate-500 font-medium">Layanan Baca Ayat & Terjemahan</p>
        </div>
      </div>
      <button id="closeQuranModal" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <!-- Verse Content Body -->
    <div class="space-y-4 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
      
      <!-- Arabic Text Block -->
      <div id="modalArabicBlock" class="arabic-text">
        مَا نَنْسَخْ مِنْ آيَةٍ أَوْ نُنْسِهَا نَأْتِ بِخَيْرٍ مِنْهَا أَوْ مِثْلِهَا ۗ أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ
      </div>

      <!-- Indonesian Translation Block -->
      <div class="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div class="font-semibold text-slate-900 text-xs mb-1">Terjemahan:</div>
        <p id="modalTranslationText">
          Loading terjemahan ayat...
        </p>
      </div>

    </div>

    <!-- External Link Actions -->
    <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
      <a id="quranComLink" href="https://quran.com" target="_blank" rel="noopener noreferrer" class="flex-1 py-2.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition shadow-sm">
        <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        <span>Buka di Quran.com</span>
      </a>

      <a id="kemenagLink" href="https://quran.kemenag.go.id" target="_blank" rel="noopener noreferrer" class="flex-1 py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition">
        <i class="fa-solid fa-landmark text-xs text-slate-500"></i>
        <span>Kemenag Quran</span>
      </a>
    </div>

  </div>
</dialog>

@endsection
