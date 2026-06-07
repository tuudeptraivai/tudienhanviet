/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, Heart, Share2, Clipboard, 
  Check, Info, HelpCircle, History, Landmark, Feather, Flame
} from "lucide-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { DictionaryEntry, LookupResponse } from "./types";

const TRADITIONAL_QUOTES = [
  { text: "Học nhi thời tập chi, bất diệc duyệt hồ?", author: "Khổng Tử - Luận Ngữ" },
  { text: "Vạn ban giai hạ phẩm, duy hữu độc thư cao.", author: "Thần Đồng Thi" },
  { text: "Ngọc bất trác, bất thành khí; Nhân bất học, bất tri lý.", author: "Lễ Ký" },
  { text: "Thư sơn hữu lộ cần vi kính, học hải vô nhai khổ tác chu.", author: "Cổ Ngạn" }
];

export default function App() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiSource, setApiSource] = useState("Offline Database");
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(["Thi", "Nguyệt", "Tâm", "Minh"]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<DictionaryEntry[]>([]);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);

  // Initialize data on mount
  useEffect(() => {
    // Media match query default or storage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Load bookmarks
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks));
      } catch (e) {
        console.error(e);
      }
    }

    // Load recent searches
    const storedRecent = localStorage.getItem("recent_searches");
    if (storedRecent) {
      try {
        setRecentSearches(JSON.parse(storedRecent));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch popular words for sidebar init
    fetchPopularWords();

    // Rotate traditional quotes slowly
    const randomIdx = Math.floor(Math.random() * TRADITIONAL_QUOTES.length);
    setCurrentQuoteIdx(randomIdx);
  }, []);

  const fetchPopularWords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/popular");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.results || []);
        if (data.results && data.results.length > 0) {
          setSelectedEntry(data.results[0]);
        }
        setApiSource(data.source || "Offline Database");
      }
    } catch (error) {
      console.error("Error loading initial database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSearchFeedback(null);

    // Save to history list safely
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recent_searches", JSON.stringify(updatedRecent));

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data: LookupResponse = await response.json();
        setEntries(data.results || []);
        setSuggestedQueries(data.suggestedQueries || []);
        if (data.results && data.results.length > 0) {
          setSelectedEntry(data.results[0]);
        } else {
          setSelectedEntry(null);
        }
        setApiSource(data.source);
        if (data.message) {
          setSearchFeedback(data.message);
        }
      } else {
        setSearchFeedback("Có lỗi xảy ra khi gửi yêu cầu tra cứu từ điển.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setSearchFeedback("Lỗi kết nối máy chủ. Hãy kiểm tra kết nối mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (entry: DictionaryEntry) => {
    const exists = bookmarks.some(b => b.character === entry.character);
    let updated: DictionaryEntry[];
    if (exists) {
      updated = bookmarks.filter(b => b.character !== entry.character);
    } else {
      updated = [...bookmarks, entry];
    }
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(type);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const isBookmarked = selectedEntry ? bookmarks.some(b => b.character === selectedEntry.character) : false;

  return (
    <div id="app-root" className="min-h-screen bg-[#F5F2ED] text-[#2D241E] dark:bg-[#1E1915] dark:text-[#E6DFD5] font-serif flex flex-col transition-colors duration-300">
      {/* Header component injected with styling stats */}
      <Header 
        isDarkMode={isDarkMode} 
        onToggleTheme={handleToggleTheme} 
        apiSource={apiSource}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6 xl:gap-8 overflow-hidden">
        
        {/* Left column / Sidebar area for controls, lookup interface, search entries list */}
        <aside id="sidebar-panel" className="w-full md:w-[360px] flex flex-col gap-6 bg-white/40 dark:bg-[#2D241E]/30 rounded-3xl p-6 sm:p-8 border border-[#2D241E]/10 dark:border-white/5 shadow-sm">
          <Sidebar
            entries={entries}
            selectedEntry={selectedEntry}
            onSelectEntry={(entry) => setSelectedEntry(entry)}
            isLoading={isLoading}
            onSearch={handleSearch}
            suggestedQueries={suggestedQueries}
            recentSearches={recentSearches}
            bookmarks={bookmarks}
            onClearRecent={handleClearRecent}
            onToggleBookmark={handleToggleBookmark}
          />

          {/* Inspirational classical wisdom card component (Artistic flair element) */}
          <div className="hidden md:block bg-[#EAE5DE] dark:bg-[#25201C] p-5 rounded-2xl border border-[#2D241E]/5 transition-colors">
            <div className="flex items-start gap-3">
              <Feather className="w-5 h-5 text-[#8B0000] dark:text-rose-400 shrink-0 mt-0.5 opacity-80" />
              <div>
                <p id="classical-quote" className="text-xs leading-relaxed italic text-stone-600 dark:text-stone-300 whitespace-pre-line">
                  "{TRADITIONAL_QUOTES[currentQuoteIdx].text}"
                </p>
                <span className="block mt-2 font-sans font-bold text-[10px] uppercase tracking-wider text-[#8B0000] dark:text-rose-400">
                  — {TRADITIONAL_QUOTES[currentQuoteIdx].author}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right column / Dedicated Rich Definition showcase panel */}
        <main id="definition-section" className="flex-1 min-w-0 bg-white/60 dark:bg-[#25201C]/60 rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#2D241E]/10 dark:border-white/5 relative flex flex-col justify-between overflow-hidden shadow-sm transition-all">
          
          {/* Subtle background calligraphy watermark decoration in traditional design direction */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 writing-vertical-rl text-[#8B0000]/5 dark:text-rose-550/5 text-[90px] lg:text-[120px] font-black pointer-events-none select-none tracking-widest font-serif leading-none">
            典苑
          </div>

          <div className="relative z-10">
            {searchFeedback && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 animate-fade-in">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Lưu ý hệ thống</p>
                  <p className="mt-0.5 opacity-90">{searchFeedback}</p>
                </div>
              </div>
            )}

            {selectedEntry ? (
              <div className="animate-fade-in">
                
                {/* Visual Header / Character and Main Meta Specs */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10 pb-8 border-b border-[#2D241E]/10 dark:border-white/5">
                  
                  {/* Huge Character Visual Representation */}
                  <div className="flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 bg-[#EAE5DE] dark:bg-[#2E2823] rounded-2xl font-serif text-[72px] sm:text-[96px] text-[#1A1A1A] dark:text-[#F3EFE9] border border-[#2D241E]/10 dark:border-white/10 select-none shadow-md shrink-0 relative group">
                    {selectedEntry.character}
                    
                    {/* Character action layer */}
                    <button
                      onClick={() => handleCopy(selectedEntry.character, "char")}
                      className="absolute bottom-1 right-1 p-1.5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all text-xs"
                      title="Sao chép Hán tự"
                    >
                      {copiedWord === "char" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Character Meta properties */}
                  <div className="flex-1 flex flex-col justify-center py-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <h1 id="sino-viet-title" className="text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A] dark:text-white uppercase leading-none">
                        {selectedEntry.sinoVietnamese}
                      </h1>

                      {/* Favorite/Bookmark heart action button */}
                      <button
                        onClick={() => handleToggleBookmark(selectedEntry)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isBookmarked 
                            ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20" 
                            : "text-[#2D241E]/40 hover:text-rose-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                        title={isBookmarked ? "Bỏ lưu chữ Hán này" : "Lưu vào mục yêu thích"}
                      >
                        <Heart className="w-6 h-6 stroke-[2]" fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Mandarin Pinyin block */}
                    <p className="text-lg lg:text-xl font-sans italic text-[#8B0000] dark:text-rose-400 font-semibold mt-1">
                      pǐnyīn: {selectedEntry.pinyin}
                    </p>

                    {/* Structural parameters block */}
                    <div className="grid grid-cols-2 gap-4 mt-6 max-w-xs text-xs font-sans uppercase tracking-widest">
                      <div className="flex flex-col border-l-2 border-[#8B0000] dark:border-rose-400 pl-3">
                        <span className="opacity-40 text-[10px] font-bold">Bộ thủ</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{selectedEntry.radical}</span>
                      </div>
                      <div className="flex flex-col border-l-2 border-[#8B0000] dark:border-rose-400 pl-3">
                        <span className="opacity-40 text-[10px] font-bold">Số nét</span>
                        <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{selectedEntry.strokes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Dictionary Content Body */}
                <div className="mt-8 space-y-8">
                  {/* Definition / Nghĩa */}
                  <div id="def-block">
                    <h3 className="text-xs font-sans font-black uppercase tracking-[0.25em] mb-3 text-[#8B0000] dark:text-rose-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Nghĩa của chữ
                    </h3>
                    <div id="definition-text" className="text-stone-800 dark:text-stone-200 leading-relaxed text-base sm:text-lg pl-1 whitespace-pre-line font-serif">
                      {selectedEntry.definition}
                    </div>
                  </div>

                  {/* Scientific / Linguistic Structural Breakdown section */}
                  {selectedEntry.analyticalNotes && (
                    <div id="notes-block" className="bg-[#FBF9F6] dark:bg-[#231E1A] p-5 rounded-2xl border border-[#2D241E]/5 dark:border-white/5 animate-fade-in">
                      <h4 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-[#8B0303] dark:text-rose-400 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Chiết tự / Cấu tạo chữ
                      </h4>
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic pl-0.5">
                        {selectedEntry.analyticalNotes}
                      </p>
                    </div>
                  )}

                  {/* Beautiful structured Example phrasing (Từ pháp ví dụ) */}
                  {selectedEntry.examples && selectedEntry.examples.length > 0 && (
                    <div id="examples-block" className="pt-6 border-t border-[#2D241E]/10 dark:border-white/5">
                      <h3 className="text-xs font-sans font-black uppercase tracking-[0.25em] mb-4 text-[#8B0000] dark:text-rose-400">
                        Từ ghép thông dụng & Ví dụ
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedEntry.examples.map((ex, exIdx) => (
                          <div 
                            key={exIdx} 
                            className="p-4 bg-stone-50/50 dark:bg-[#1E1915]/50 border border-[#2D241E]/5 dark:border-white/5 rounded-2xl hover:bg-stone-50 dark:hover:bg-[#1E1915]/80 transition-all duration-300 group/ex relative"
                          >
                            <div className="flex justify-between items-baseline">
                              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover/ex:text-[#8B0000] dark:group-hover/ex:text-rose-400 transition-colors">
                                {ex.word}
                              </span>
                              
                              <button
                                onClick={() => handleCopy(`${ex.word} (${ex.transcription}): ${ex.translation}`, `ex-${exIdx}`)}
                                className="opacity-0 group-hover/ex:opacity-100 p-1 hover:bg-stone-200 dark:hover:bg-stone-850 rounded text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-all"
                                title="Sao chép ví dụ"
                              >
                                {copiedWord === `ex-${exIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="font-sans text-xs italic font-bold tracking-tight text-[#8B0000] dark:text-rose-400 mt-1">
                              {ex.transcription}
                            </div>
                            <div className="text-stone-600 dark:text-stone-300 text-sm mt-1 leading-snug">
                              {ex.translation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-stone-400 dark:text-stone-500">
                <BookOpen className="w-16 h-16 stroke-[1] mb-4 opacity-40 text-[#8B0000] dark:text-rose-500" />
                <h3 className="text-xl font-bold tracking-tight text-stone-700 dark:text-stone-300">Không tìm thấy hoặc Chưa chọn mục</h3>
                <p className="text-sm mt-1.5 text-center max-w-sm pl-2 pr-2">
                  Hãy chọn một từ từ danh sách kết quả hoặc nhập trực tiếp từ muốn tra cứu bằng thanh tìm kiếm.
                </p>
              </div>
            )}
          </div>

          {/* Academic Footer Attribution details inside the main display container */}
          <div className="mt-12 pt-6 border-t border-[#2D241E]/10 dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between text-[11px] font-sans uppercase tracking-widest text-[#2D241E]/50 dark:text-stone-500">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" /> Dữ liệu điển tự: Thiều Chửu & Hán-Nôm ngữ văn khoa học
            </span>
            <span>Văn bản tự nhiên & Phân tích thông thái từ AI</span>
          </div>
        </main>
      </div>

      {/* Primary bottom footer matching design layout */}
      <footer className="mt-auto px-6 sm:px-12 py-5 bg-[#2D241E] dark:bg-[#151210] text-[#F5F2ED] flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] tracking-widest uppercase transition-colors">
        <span>Bản quyền © 2026 Thi Uyển Hán Việt Từ Điển Dự Án</span>
        <div className="flex gap-6">
          <span>V1.1.2</span>
          <span>Bản thô học lý: Thiều Chửu</span>
        </div>
      </footer>
    </div>
  );
}
