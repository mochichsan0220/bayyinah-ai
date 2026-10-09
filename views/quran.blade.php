@extends('layouts.app')

@section('content')
<div class="flex flex-col h-screen w-full bg-slate-50">
  
  <!-- Header -->
  <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
    <div class="flex items-center space-x-3">
      <a href="/" class="text-slate-600 hover:text-emerald-600 transition p-2 -ml-2 rounded-full hover:bg-slate-100" title="Kembali ke Beranda">
        <i class="fa-solid fa-arrow-left text-lg"></i>
      </a>
      <div class="flex items-center space-x-2">
        <i class="fa-solid fa-book-open-reader text-emerald-600 text-xl"></i>
        <h1 class="font-heading font-bold text-slate-800 text-lg sm:text-xl">Baca Al-Qur'an</h1>
      </div>
    </div>
    <div>
      <a href="/" class="text-sm font-medium text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition">
        <i class="fa-solid fa-robot mr-1"></i> Mode AI
      </a>
    </div>
  </header>

  <!-- Main Content Area -->
  <div class="flex flex-1 overflow-hidden">
    
    <!-- Left Sidebar: Surah List -->
    <aside class="w-full sm:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col h-full" id="surahSidebar">
      <div class="p-4 border-b border-slate-100">
        <div class="relative">
          <i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm"></i>
          <input type="text" id="searchSurah" placeholder="Cari Surah..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
        </div>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1" id="surahList">
        <!-- Surahs will be injected here via JS -->
        <div class="p-4 text-center text-slate-500 text-sm">Memuat daftar surah...</div>
      </div>
    </aside>

    <!-- Right Area: Verses Content -->
    <main class="hidden sm:flex flex-1 flex-col h-full bg-slate-50/50 relative" id="verseArea">
      
      <!-- Back button for mobile -->
      <div class="sm:hidden p-4 bg-white border-b border-slate-200 flex items-center shadow-sm sticky top-0 z-20">
        <button id="backToSurahListBtn" class="text-slate-600 p-2 -ml-2 hover:bg-slate-100 rounded-full">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h2 id="mobileSurahTitle" class="ml-2 font-heading font-bold text-slate-800">Pilih Surah</h2>
      </div>

      <!-- Surah Header Info -->
      <div id="surahHeader" class="p-6 sm:p-8 text-center border-b border-slate-200 bg-white/80 backdrop-blur shadow-sm sticky top-0 z-10 hidden">
        <h2 id="currentSurahName" class="font-arabic text-3xl sm:text-4xl text-emerald-700 mb-2 font-bold"></h2>
        <h3 id="currentSurahLatin" class="font-heading font-semibold text-xl text-slate-800"></h3>
        <p id="currentSurahTranslation" class="text-slate-500 text-sm mt-1"></p>
        
        <!-- Bismillah (only if not Surah 1 or 9, handled in JS) -->
        <div id="bismillah" class="font-arabic text-2xl text-slate-700 mt-6 hidden">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar space-y-8" id="verseList">
        
        <div id="emptyState" class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
          <i class="fa-solid fa-book-open text-4xl sm:text-6xl text-slate-200"></i>
          <p class="text-sm sm:text-base">Pilih surah di sebelah kiri untuk mulai membaca.</p>
        </div>

      </div>
    </main>

  </div>
</div>

<script src="/js/quran.js"></script>
@endsection
