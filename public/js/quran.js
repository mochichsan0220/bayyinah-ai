document.addEventListener('DOMContentLoaded', () => {
  const surahListEl = document.getElementById('surahList');
  const verseListEl = document.getElementById('verseList');
  const searchInput = document.getElementById('searchSurah');
  const surahSidebar = document.getElementById('surahSidebar');
  const verseArea = document.getElementById('verseArea');
  const backToSurahListBtn = document.getElementById('backToSurahListBtn');
  
  const surahHeader = document.getElementById('surahHeader');
  const currentSurahName = document.getElementById('currentSurahName');
  const currentSurahLatin = document.getElementById('currentSurahLatin');
  const currentSurahTranslation = document.getElementById('currentSurahTranslation');
  const emptyState = document.getElementById('emptyState');
  const bismillah = document.getElementById('bismillah');
  const mobileSurahTitle = document.getElementById('mobileSurahTitle');

  let allSurahs = [];

  // Fetch Surahs list
  async function fetchSurahs() {
    try {
      const res = await fetch('/api/quran/surahs');
      const data = await res.json();
      allSurahs = data;
      renderSurahList(data);
    } catch (err) {
      console.error(err);
      surahListEl.innerHTML = '<div class="p-4 text-center text-red-500">Gagal memuat surah.</div>';
    }
  }

  // Render Surah List
  function renderSurahList(surahs) {
    surahListEl.innerHTML = '';
    
    if (surahs.length === 0) {
      surahListEl.innerHTML = '<div class="p-4 text-center text-slate-500 text-sm">Tidak ditemukan.</div>';
      return;
    }

    surahs.forEach(surah => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-3 rounded-xl hover:bg-emerald-50 focus:bg-emerald-50 transition flex items-center justify-between group';
      btn.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center font-semibold text-slate-500 group-hover:text-emerald-700 text-sm transition">
            ${surah.id}
          </div>
          <div>
            <h4 class="font-semibold text-slate-800 group-hover:text-emerald-700 transition">${surah.name_latin}</h4>
            <p class="text-[11px] text-slate-500">${surah.translation_id} • ${surah.total_ayahs} Ayat</p>
          </div>
        </div>
        <div class="font-arabic text-lg text-slate-400 group-hover:text-emerald-600 transition">
          ${surah.name_arabic}
        </div>
      `;
      btn.onclick = () => loadSurah(surah);
      surahListEl.appendChild(btn);
    });
  }

  // Search feature
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allSurahs.filter(s => 
      s.name_latin.toLowerCase().includes(q) || 
      s.translation_id.toLowerCase().includes(q) ||
      s.id.toString() === q
    );
    renderSurahList(filtered);
  });

  // Load a specific Surah's verses
  async function loadSurah(surah) {
    // Mobile view handling
    if (window.innerWidth < 640) {
      surahSidebar.classList.add('hidden');
      verseArea.classList.remove('hidden');
      verseArea.classList.add('flex');
    }

    emptyState.classList.add('hidden');
    surahHeader.classList.remove('hidden');
    
    currentSurahName.textContent = surah.name_arabic;
    currentSurahLatin.textContent = `${surah.id}. ${surah.name_latin}`;
    currentSurahTranslation.textContent = `Arti: ${surah.translation_id} | ${surah.revelation_type} | ${surah.total_ayahs} Ayat`;
    mobileSurahTitle.textContent = surah.name_latin;

    if (surah.id !== 1 && surah.id !== 9) {
      bismillah.classList.remove('hidden');
    } else {
      bismillah.classList.add('hidden');
    }

    verseListEl.innerHTML = '<div class="text-center p-8 text-slate-500"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i><br>Memuat ayat...</div>';

    try {
      const res = await fetch(`/api/quran/surahs/${surah.id}/verses`);
      const verses = await res.json();
      
      verseListEl.innerHTML = '';
      if (verses.length === 0) {
        verseListEl.innerHTML = '<div class="text-center p-8 text-amber-600 bg-amber-50 rounded-xl">Ayat belum tersedia (Belum di-ingest).</div>';
        return;
      }

      verses.forEach(v => {
        const div = document.createElement('div');
        div.className = 'bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-4 hover:shadow-md transition';
        div.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-50 pb-2">
            <span class="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">${surah.id}:${v.ayah_number}</span>
          </div>
          <div class="font-arabic text-3xl sm:text-4xl text-right leading-[2.2] sm:leading-[2.5] text-slate-800" dir="rtl">
            ${v.text_arabic}
          </div>
          <div class="space-y-2 mt-4 pt-4 border-t border-slate-50">
            <p class="text-sm text-emerald-700/80 font-medium leading-relaxed">${v.text_latin}</p>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">${v.translation_id}</p>
          </div>
        `;
        verseListEl.appendChild(div);
      });
      
      // Scroll to top of verses
      verseListEl.scrollTop = 0;

    } catch (err) {
      console.error(err);
      verseListEl.innerHTML = '<div class="text-center p-8 text-red-500">Gagal memuat ayat.</div>';
    }
  }

  // Back button for mobile
  backToSurahListBtn.addEventListener('click', () => {
    surahSidebar.classList.remove('hidden');
    verseArea.classList.add('hidden');
    verseArea.classList.remove('flex');
  });

  // Init
  fetchSurahs();
});
