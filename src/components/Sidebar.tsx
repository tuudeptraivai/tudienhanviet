/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Loader2, Sparkles, History, Heart, Trash2, ArrowRight } from "lucide-react";
import { DictionaryEntry } from "../types";

interface SidebarProps {
  entries: DictionaryEntry[];
  selectedEntry: DictionaryEntry | null;
  onSelectEntry: (entry: DictionaryEntry) => void;
  isLoading: boolean;
  onSearch: (query: string) => void;
  suggestedQueries: string[];
  recentSearches: string[];
  bookmarks: DictionaryEntry[];
  onClearRecent: () => void;
  onToggleBookmark: (entry: DictionaryEntry) => void;
}

export default function Sidebar({
  entries,
  selectedEntry,
  onSelectEntry,
  isLoading,
  onSearch,
  suggestedQueries,
  recentSearches,
  bookmarks,
  onClearRecent,
  onToggleBookmark
}: SidebarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [activeTab, setActiveTab] = useState<"results" | "bookmarks">("results");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full p-1">
      {/* Search Header Form */}
      <div>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Tra chữ Hán, phiên âm, bộ thủ, nghĩa..."
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full pl-5 pr-12 py-3.5 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9b2c2c] dark:focus:ring-rose-800 focus:border-transparent text-sm shadow-inner transition-all duration-300"
          />
          <button
            type="submit"
            disabled={isLoading || !searchVal.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#9b2c2c] hover:bg-[#801818] dark:bg-rose-900 dark:hover:bg-rose-950 p-2.5 rounded-full text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        {suggestedQueries.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 px-1">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider font-mono">Gợi ý:</span>
            {suggestedQueries.map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchVal(query);
                  onSearch(query);
                }}
                className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#9b2c2c] dark:hover:text-rose-400 hover:bg-[#9b2c2c]/5 dark:hover:bg-rose-950/20 px-2.5 py-1 rounded-full transition-all duration-300 border border-stone-200/50 dark:border-stone-700/50"
              >
                {query}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-300 ${
            activeTab === "results"
              ? "border-[#9b2c2c] text-[#9b2c2c] dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          }`}
        >
          Kết quả ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === "bookmarks"
              ? "border-[#9b2c2c] text-[#9b2c2c] dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Mục Đã lưu ({bookmarks.length})
        </button>
      </div>

      {/* Sidebar Main Content (results/bookmarks) */}
      <div className="overflow-y-auto flex-1 max-h-[500px] sm:max-h-none pr-1">
        {activeTab === "results" ? (
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#9b2c2c] dark:text-rose-400" />
                <span className="text-sm font-medium animate-pulse">Đang tra cứu từ điển...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400">
                <p className="text-sm">Không có ký tự nào hiển thị.</p>
                <p className="text-xs text-stone-400 mt-1">Hãy nhập từ khóa khác ở thanh tìm kiếm phía trên.</p>
              </div>
            ) : (
              entries.map((entry, index) => {
                const isSelected = selectedEntry?.character === entry.character;
                return (
                  <div
                    key={index}
                    onClick={() => onSelectEntry(entry)}
                    className={`flex items-stretch gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300 relative group overflow-hidden ${
                      isSelected
                        ? "bg-stone-100 dark:bg-stone-800/80 border-[#9b2c2c]/40 dark:border-rose-900/60 shadow-sm"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    {/* Left Accent indicator for active selection */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9b2c2c] dark:bg-rose-500"></div>
                    )}

                    {/* Character Column */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-stone-50 dark:bg-stone-800 font-serif font-semibold text-2xl border border-stone-100 dark:border-stone-700 text-[#9b2c2c] dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {entry.character}
                    </div>

                    {/* Text Details Column */}
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-sans font-bold text-stone-800 dark:text-stone-100 text-base leading-tight">
                          {entry.sinoVietnamese}
                        </span>
                        <span className="font-mono text-xs text-stone-400 dark:text-stone-500 font-medium">
                          {entry.pinyin}
                        </span>
                      </div>
                      <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 line-clamp-1">
                        {entry.definition}
                      </p>
                    </div>

                    {/* Small arrow icon visible on hover */}
                    <div className="flex items-center text-stone-300 dark:text-stone-700 group-hover:text-[#9b2c2c] dark:group-hover:text-rose-400 transition-colors pl-1 shrink-0">
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 px-4 text-stone-400 dark:text-stone-500">
                <Heart className="w-8 h-8 mx-auto stroke-[1.5] text-stone-300 dark:text-stone-700 mb-2" />
                <p className="text-sm">Chưa có chữ Hán nào được lưu.</p>
                <p className="text-xs mt-1">Bấm biểu tượng trái tim trong trang chi tiết để lưu trữ từ vựng cần học.</p>
              </div>
            ) : (
              bookmarks.map((entry, index) => {
                const isSelected = selectedEntry?.character === entry.character;
                return (
                  <div
                    key={index}
                    onClick={() => onSelectEntry(entry)}
                    className={`flex items-stretch gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300 relative group ${
                      isSelected
                        ? "bg-stone-100 dark:bg-stone-800/80 border-[#9b2c2c]/40 dark:border-rose-900/60 shadow-sm"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    {/* Left Accent indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9b2c2c] dark:bg-rose-500"></div>
                    )}

                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-stone-50 dark:bg-stone-800 font-serif font-semibold text-2xl border border-stone-100 dark:border-stone-700 text-rose-800 dark:text-rose-400 shrink-0">
                      {entry.character}
                    </div>

                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-sans font-bold text-stone-800 dark:text-stone-100 text-base leading-tight">
                          {entry.sinoVietnamese}
                        </span>
                        <span className="font-mono text-xs text-stone-400 dark:text-stone-500 font-medium">
                          {entry.pinyin}
                        </span>
                      </div>
                      <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 line-clamp-1">
                        {entry.definition}
                      </p>
                    </div>

                    {/* Bookmark Toggle Action Button within row */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(entry);
                      }}
                      className="flex items-center p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors self-center shrink-0"
                      title="Bỏ lưu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Query History container */}
      {recentSearches.length > 0 && (
        <div className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-4 px-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest font-mono mb-2">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" /> Lịch sử tra cứu
            </span>
            <button
              onClick={onClearRecent}
              className="hover:text-red-600 hover:underline flex items-center gap-0.5 transition-all lowercase italic"
            >
              Xóa lịch sử
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchVal(search);
                  onSearch(search);
                }}
                className="text-xs bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 hover:border-[#9b2c2c]/30 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-0.5 rounded-md transition-all duration-300"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
