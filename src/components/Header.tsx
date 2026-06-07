/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, BookOpen, Sun, Moon, Database, Sparkles, LogIn, Award, Menu, X } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  apiSource?: string;
}

export default function Header({ isDarkMode, onToggleTheme, apiSource }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-red-750 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-300 bg-[#9b2c2c] dark:bg-rose-950">
                <span className="font-serif font-bold text-white text-lg">苑</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-stone-800 dark:text-stone-100 group-hover:text-[#9b2c2c] dark:group-hover:text-rose-400 transition-colors">
                  Thi Uyển
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-mono -mt-1">
                  ĐIỂN TỰ HÁN VIỆT
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600 dark:text-stone-300">
              <a href="#" className="hover:text-[#9b2c2c] dark:hover:text-rose-400 transition-colors">Tác giả</a>
              <a href="#" className="hover:text-[#9b2c2c] dark:hover:text-rose-400 transition-colors">Thơ</a>
              <a href="#" className="hover:text-[#9b2c2c] dark:hover:text-rose-400 transition-colors">Sáng tác</a>
              <a href="#" className="hover:text-[#9b2c2c] dark:hover:text-rose-400 transition-colors">Diễn đàn</a>
              <span className="h-4 w-px bg-stone-300 dark:bg-stone-700"></span>
              <a href="#" className="text-[#9b2c2c] dark:text-rose-400 flex items-center gap-1.5 font-bold">
                <BookOpen className="w-4 h-4" />
                Từ điển
              </a>
              <a href="#" className="hover:text-[#9b2c2c] dark:hover:text-rose-400 transition-colors">Thống kê</a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            {apiSource && (
              <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                apiSource.includes("AI") 
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55" 
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/55"
              }`}>
                {apiSource.includes("AI") ? (
                  <>
                    <Sparkles className="w-3 h-3 animate-pulse text-emerald-500" />
                    <span>Hán-Việt AI Mode</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3 text-amber-500" />
                    <span>Ngoại tuyến (Offline)</span>
                  </>
                )}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 mr-1 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Chuyển chế độ sáng/tối"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-600" />}
            </button>

            {/* Login mimicking screenshot */}
            <button className="hidden sm:flex items-center gap-2 border border-[#9b2c2c]/30 hover:border-[#9b2c2c] text-[#9b2c2c] dark:text-rose-400 dark:border-rose-900/30 dark:hover:border-rose-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#9b2c2c]/5 dark:hover:bg-rose-950/10 transition-all duration-300">
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Tác giả</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Thơ</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Sáng tác</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Diễn đàn</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-bold text-[#9b2c2c] dark:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800">Từ điển</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Thống kê</a>
            <div className="pt-4 pb-2 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2 px-3">
              {apiSource && (
                <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border text-center ${
                  apiSource.includes("AI") 
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200" 
                    : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200"
                }`}>
                  {apiSource.includes("AI") ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Hán-Việt AI Mode</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ngoại tuyến (Offline Mode)</span>
                    </>
                  )}
                </div>
              )}
              <button className="w-full flex items-center justify-center gap-2 border border-[#9b2c2c]/30 text-[#9b2c2c] dark:text-rose-400 py-2 rounded-lg font-semibold hover:bg-[#9b2c2c]/5">
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
