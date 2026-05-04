"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Sparkles, Undo, Redo, Check, X, Power } from "lucide-react";
import { Roboto_Serif, Sarabun } from "next/font/google";
import { useBooks } from "../../../../context/BookContext"; 
import { Switch } from "@heroui/react";
import toast from "react-hot-toast";

const robotoSerif = Roboto_Serif({ subsets: ["latin"], weight: ["400"] });
const sarabun = Sarabun({ subsets: ["thai"], weight: ["300"] });

export default function TranslatePage() {
  const params = useParams();
  const bookId = Number(params.id);
  const pageId = params.pageId as string;

  const { getBookById, updateBook } = useBooks();
  const book = getBookById(bookId);
  const page = book?.pages.find(p => p.id === pageId);

  // --- States ---
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // --- AI States ---
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiInputText, setAiInputText] = useState(""); 
  const [aiPreviewText, setAiPreviewText] = useState(""); 
  const [isAiTranslating, setIsAiTranslating] = useState(false);

  useEffect(() => {
    if (page) {
      const initialOriginal = page.originalText || "";
      const initialTranslated = page.translatedText || "";
      setOriginalText(initialOriginal);
      setTranslatedText(initialTranslated);
      setHistory([initialTranslated]);
      setHistoryIndex(0);
    }
  }, [page]);

  if (!book || !page) {
    return <div className="h-screen flex items-center justify-center text-slate-400">Loading or Page not found...</div>;
  }

  const handleSave = () => {
    const updatedPages = book.pages.map(p =>
      p.id === pageId ? { ...p, originalText, translatedText } : p
    );
    const translatedCount = updatedPages.filter(p => p.translatedText.trim() !== "").length;
    updateBook(bookId, { pages: updatedPages, translatedPages: translatedCount });

    toast.success("Saved successfully!", {
      style: { borderRadius: '100px', background: '#10b981', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleTranslationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTranslatedText(val);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(val);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTranslatedText(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTranslatedText(history[newIndex]);
    }
  };

  const handleAiTranslate = () => {
    if (!aiInputText.trim()) {
      toast.error("Please enter text to translate.");
      return;
    }
    setIsAiTranslating(true);
    
    setTimeout(() => {
      setAiPreviewText("นี่คือข้อความที่จำลองการแปลจาก AI เพื่อให้คุณพิจารณาก่อนกดยอมรับครับ");
      setIsAiTranslating(false);
    }, 1500);
  };

  const handleAcceptTranslation = () => {
    const appendText = (current: string, newText: string) => {
      if (!current.trim()) return newText;
      return current.trim() + "\n\n" + newText;
    };

    const newOriginal = appendText(originalText, aiInputText);
    const newTranslated = appendText(translatedText, aiPreviewText);

    setOriginalText(newOriginal);
    setTranslatedText(newTranslated);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTranslated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setAiInputText("");
    setAiPreviewText("");
    toast.success("Translation accepted!");
  };

  const handleCancelTranslation = () => {
    setAiPreviewText(""); 
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-20 px-6 flex items-center justify-between bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/book/${bookId}`} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{page.title}</h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-sm transition-colors text-sm">
          <Save className="w-4 h-4" /> Save
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 px-6 pb-6 overflow-hidden">
        
        {/* --- ฝั่งซ้าย: Original --- */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-[13px] font-bold text-slate-600">
              {book.originalLang}
            </div>
            
            <div className="flex items-center gap-3">
              {/* สวิตช์ HeroUI ของแท้ */}
              <Switch isSelected={isAiMode} onChange={setIsAiMode} size="md">
                <Switch.Control>
                  <Switch.Thumb>
                    {isAiMode ? (
                      <Sparkles className="size-4" aria-hidden />
                    ) : (
                      <Power className="size-4" aria-hidden />
                    )}
                  </Switch.Thumb>
                </Switch.Control>
                <Switch.Content>
                  <div className="flex flex-col items-start cursor-pointer select-none">
                    <span className="text-[13px] font-bold text-slate-800 leading-tight">AI Translation</span>
                    <span className="text-[11px] font-medium text-slate-400">Let AI enhance your translation</span>
                  </div>
                </Switch.Content>
              </Switch>
            </div>
          </div>
          
          <textarea
            placeholder="Original language"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className={`flex-1 w-full resize-none outline-none text-slate-700 text-lg leading-loose placeholder:text-slate-400 bg-transparent mb-4 ${robotoSerif.className}`}
          />

          {isAiMode && (
            <div className="shrink-0 mt-4 border-t border-slate-100 pt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <textarea
                placeholder="Type a sentence to translate with AI..."
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                className={`w-full h-24 resize-none outline-none text-slate-700 text-base p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all ${robotoSerif.className}`}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAiTranslate}
                  disabled={isAiTranslating}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${isAiTranslating ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                >
                  <Sparkles className={`w-4 h-4 ${isAiTranslating ? "animate-pulse" : ""}`} />
                  {isAiTranslating ? "Translating..." : "AI Translate"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- ฝั่งขวา: Translation --- */}
        <div className={`flex-1 rounded-2xl p-8 shadow-sm flex flex-col transition-all duration-500 ease-in-out ${isAiMode ? "bg-blue-50/50 border-2 border-blue-400" : "bg-slate-50/80 border border-slate-200"}`}>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-[13px] font-bold text-blue-600 w-fit mb-6 shrink-0">
            {book.translationLang}
          </div>
          
          <textarea
            placeholder="Translation language."
            value={translatedText}
            onChange={handleTranslationChange}
            className={`flex-1 w-full resize-none outline-none text-slate-800 text-lg leading-loose placeholder:text-slate-400 bg-transparent mb-4 ${sarabun.className}`}
          />

          {isAiMode && aiPreviewText && (
            <div className="shrink-0 mt-4 p-5 bg-white border border-blue-200 rounded-2xl shadow-lg shadow-blue-100/50 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Translation Preview</span>
              </div>
              <p className={`text-slate-800 text-lg leading-relaxed ${sarabun.className}`}>{aiPreviewText}</p>
              <div className="flex justify-end gap-2 mt-2 border-t border-slate-50 pt-4">
                <button onClick={handleCancelTranslation} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X className="w-4 h-4" /> Cancel</button>
                <button onClick={handleAcceptTranslation} className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"><Check className="w-4 h-4" /> Commit</button>
              </div>
            </div>
          )}

          {!aiPreviewText && (
            <div className="flex justify-end gap-3 shrink-0 mt-4">
              <button onClick={handleUndo} disabled={historyIndex <= 0} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex <= 0 ? "bg-slate-200/50 text-slate-400 cursor-not-allowed border border-transparent" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"}`}><Undo className="w-4 h-4" /> Undo</button>
              <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex >= history.length - 1 ? "bg-slate-200/50 text-slate-400 cursor-not-allowed border border-transparent" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"}`}><Redo className="w-4 h-4" /> Redo</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}