"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Sparkles, Undo, Redo, Check, X, Power, WandSparkles } from "lucide-react";
import { Roboto_Serif, Sarabun } from "next/font/google";
import { useBooks } from "../../../../context/BookContext";
// 🚀 ดึง toast มาจาก heroui ตาม Doc มาตรฐาน
import { Switch, toast, Button, Spinner, TextArea } from "@heroui/react";

const robotoSerif = Roboto_Serif({ subsets: ["latin"], weight: ["400"] });
const sarabun = Sarabun({ subsets: ["thai"], weight: ["300"] });

export default function TranslatePage() {
  const params = useParams();
  const bookId = Number(params.id);
  const pageId = params.pageId as string;

  const { getBookById, updateBook } = useBooks();
  const book = getBookById(bookId);
  const page = book?.pages.find(p => p.id === pageId);

  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

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

  // ---------------------------------------------------------
  // 1. 🚀 ระบบ Auto-Save (Debounce) พร้อม Toast แจ้งเตือน
  // ---------------------------------------------------------
  useEffect(() => {
    if (!book || !page) return;

    // 🚀 จุดสำคัญ: ดักไว้ว่าถ้า "ข้อความยังเหมือนกับที่เซฟไว้ตอนแรก" แปลว่าเพิ่งเปิดหน้าเว็บ ห้ามเด้ง Toast!
    if (originalText === (page.originalText || "") && translatedText === (page.translatedText || "")) {
      return;
    }

    const autoSaveTimer = setTimeout(() => {
      const updatedPages = book.pages.map(p =>
        p.id === pageId ? { ...p, originalText, translatedText } : p
      );
      const translatedCount = updatedPages.filter(p => p.translatedText.trim() !== "").length;
      
      updateBook(bookId, { pages: updatedPages, translatedPages: translatedCount });

      // 🚀 เด้ง Toast เบาๆ แจ้งว่าเซฟแล้ว (ใช้ Toast ของ HeroUI)
      toast.success("Auto-saved", {
        description: "Your changes have been saved.",
      });

    }, 1500);

    return () => clearTimeout(autoSaveTimer);
  }, [originalText, translatedText]); // จับตาดูเฉพาะตอนข้อความเปลี่ยน

  // ---------------------------------------------------------
  // 2. ฟังก์ชันปุ่ม Save เดิม (เผื่อ User อยากกดเซฟเองแบบมั่นใจ)
  // ---------------------------------------------------------
  const handleSave = () => {
    const updatedPages = book.pages.map(p =>
      p.id === pageId ? { ...p, originalText, translatedText } : p
    );
    const translatedCount = updatedPages.filter(p => p.translatedText.trim() !== "").length;
    
    updateBook(bookId, { pages: updatedPages, translatedPages: translatedCount });

    toast.success("Saved successful!", {
      description: "Your page have been saved.",
      actionProps: {
        children: "Got it!",
        className: "bg-success text-success-foreground",
        onPress: () => toast.clear(), 
      },
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

  const handleAiTranslate = async () => {
    if (!aiInputText.trim()) {
      toast.danger("Please enter text to translate.");
      return;
    }
  
    setIsAiTranslating(true);
    setAiPreviewText(""); // 🚀 ล้างหน้าจอ Preview ให้สะอาดก่อนเริ่มพิมพ์ใหม่
    
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiInputText,
          from: book.originalLang,
          to: book.translationLang,
        }),
      });
  
      if (!response.ok) throw new Error("Translation API failed");
  
      // 🚀 ท่ารับข้อมูลแบบ Streaming ค่อยๆ อ่านจากท่อทีละก้อน
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentText = ""; // ตัวแปรชั่วคราวสำหรับเก็บข้อความที่ต่อกันแล้ว
  
      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          // ถอดรหัสสัญญาณเป็นข้อความ แล้วเอาไปต่อท้ายของเดิม
          const chunkValue = decoder.decode(value, { stream: true });
          currentText += chunkValue;
          
          // 🚀 อัปเดต State ให้ UI ขยับทันที!
          setAiPreviewText(currentText); 
        }
      }
  
      toast.success("AI Translation complete!", {
        description: "You can now review and commit the translation.",
      });
  
    } catch (error) {
      toast.danger("AI Error", {
        description: "Could not connect to Gemini AI or streaming failed.",
      });
    } finally {
      setIsAiTranslating(false);
    }
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
      <header className="h-20 px-6 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <Link href={`/book/${bookId}`} className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{page.title}</h1>
        </div>
        <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-sm transition-colors text-sm">
          <Save className="w-4 h-4" /> Save
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 p-6 overflow-hidden">
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col transition-all relative">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 text-[13px] font-bold text-slate-600">
              {book.originalLang}
            </div>
            
            <div className="flex items-center gap-3">
              <Switch 
                isSelected={isAiMode} 
                onChange={() => setIsAiMode(!isAiMode)} 
                size="lg" 
                className="cursor-pointer"
              >
                {/* 🚀 ท่า Render Props ของ HeroUI จัดการ Spacing & Motion ให้เอง 100% */}
                {({ isSelected }) => (
                  <div className="flex items-center gap-3">
                    
                    {/* ฝั่งข้อความ */}
                    <div className="flex flex-col items-end select-none text-right">
                      <span className="text-[13px] font-bold text-slate-800 leading-tight">AI Translation</span>
                      <span className="text-[11px] font-medium text-slate-400">Let AI enhance your translation</span>
                    </div>

                    {/* ฝั่งปุ่มสวิตช์ */}
                    <Switch.Control className={`transition-colors duration-300 ${isSelected ? "bg-blue-600" : "bg-slate-200"}`}>
                      <Switch.Thumb className="bg-white shadow-sm flex items-center justify-center">
                        <Switch.Icon>
                          {isSelected ? (
                            // 🚀 ใช้ StarFill (แบบทึบ) แทน Sparkles เส้นจะได้ไม่บางและไม่ดูแตกครับ
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 opacity-100" />
                          ) : (
                            <Power className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                          )}
                        </Switch.Icon>
                      </Switch.Thumb>
                    </Switch.Control>

                  </div>
                )}
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
              <TextArea
                value={aiInputText}
                onChange={(e) => {
                  setAiInputText(e.target.value);
                  
                  // 🚀 ทริค Auto-expand แบบ Gemini: ให้กล่องยืดตาม Text แต่ไม่เกิน 150px (ประมาณ 5 บรรทัด)
                  e.target.style.height = "auto"; 
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                placeholder="Type a sentence to translate with AI..."
                variant="secondary"
                className={`w-full min-h-[64px] resize-y text-slate-700 bg-slate-50 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 rounded-2xl transition-all ${robotoSerif.className}`}
              />
              <div className="flex justify-end">
              <Button 
                onPress={handleAiTranslate}
                isDisabled={isAiTranslating}
                variant="secondary"
                className="font-bold px-5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2"
              >
                {isAiTranslating ? (
                  <Spinner size="sm" color="current" /> 
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isAiTranslating ? "Translating..." : "AI Translate"}
              </Button>
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 rounded-2xl p-8 shadow-sm flex flex-col transition-all duration-500 ease-in-out relative ${isAiMode ? "bg-blue-50/50 border-2 border-blue-400" : "bg-white border border-slate-200"}`}>
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
                <button type="button" onClick={handleCancelTranslation} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X className="w-4 h-4" /> Cancel</button>
                <button type="button" onClick={handleAcceptTranslation} className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"><Check className="w-4 h-4" /> Commit</button>
              </div>
            </div>
          )}

          {!aiPreviewText && (
            <div className="flex justify-end gap-3 shrink-0 mt-4">
              <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex <= 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"}`}><Undo className="w-4 h-4" /> Undo</button>
              <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex >= history.length - 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"}`}><Redo className="w-4 h-4" /> Redo</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}