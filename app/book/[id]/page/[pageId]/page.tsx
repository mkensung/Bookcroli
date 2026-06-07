"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Sparkles, Undo, Redo, Check, X, Power, WandSparkles } from "lucide-react";
import { Roboto_Serif, Sarabun } from "next/font/google";
import { useBooks } from "../../../../context/BookContext";
// 🚀 ดึง toast มาจาก heroui ตาม Doc มาตรฐาน
import { Switch, toast, Button, Spinner, TextArea } from "@heroui/react";
import { NotesDrawer } from "../../../../components/NotesDrawer";

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

  // --- Text Selection Popup State ---
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, isFlippedY: false, isFlippedX: 'center' as 'center' | 'left' | 'right' });
  const [activeTextarea, setActiveTextarea] = useState<"original" | "translated" | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#selection-popup") && !target.closest("textarea")) {
        setSelectedText("");
        setActiveTextarea(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>, type: "original" | "translated") => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const text = textarea.value.substring(start, end);
      setSelectedText(text);
      setActiveTextarea(type);
      if (popupPosition.x === 0) {
        const rect = textarea.getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const x = rect.left + rect.width / 2;
        let isFlippedX: 'center' | 'left' | 'right' = 'center';
        if (x < 160) isFlippedX = 'left';
        else if (x > window.innerWidth - 160) isFlippedX = 'right';
        setPopupPosition({ x, y, isFlippedY: y < 140, isFlippedX });
      }
    } else {
      setSelectedText("");
      setActiveTextarea(null);
    }
  };
  
  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>, type: "original" | "translated") => {
    const textarea = e.currentTarget;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      const isTooHigh = e.clientY < 140; // Avoid popping up out of bounds at the top
      let isFlippedX: 'center' | 'left' | 'right' = 'center';
      if (e.clientX < 160) isFlippedX = 'left';
      else if (e.clientX > window.innerWidth - 160) isFlippedX = 'right';
      
      setPopupPosition({ x: e.clientX, y: e.clientY, isFlippedY: isTooHigh, isFlippedX });
      handleTextareaSelect(e, type);
    }
  };

  const handlePopupAction = async (action: 'vocabulary' | 'notes') => {
    if (action === 'vocabulary') {
      window.dispatchEvent(new CustomEvent('open-notes-drawer', { detail: { tab: 'vocabulary', text: selectedText } }));
    } else if (action === 'notes') {
      window.dispatchEvent(new CustomEvent('open-notes-drawer', { detail: { tab: 'notes', text: selectedText } }));
    }
    
    setSelectedText("");
    setActiveTextarea(null);
  };

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
    <div className="h-screen bg-[var(--bg-surface-primary)] flex flex-col font-sans overflow-hidden">
      <header className="h-20 px-6 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <Link href={`/book/${bookId}`} className="flex items-center gap-2 text-[var(--text-normal)] hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <NotesDrawer bookId={bookId} pageId={pageId} />
          <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-hover)] text-[var(--text-normal)] px-6 py-2.5 rounded-full font-bold shadow-sm transition-colors text-sm">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 px-6 py-4 overflow-hidden">
        <div className="flex-1 bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-2xl px-8 py-6 shadow-sm flex flex-col transition-all relative">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--border-outline-default)] text-[13px] font-bold text-[var(--text-secondary)]">
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
                      <span className="text-[13px] font-bold text-[var(--text-normal)] leading-tight">AI Translation</span>
                      <span className="text-[11px] font-medium text-[var(--text-light)]">Let AI enhance your translation</span>
                    </div>

                    {/* ฝั่งปุ่มสวิตช์ */}
                    <Switch.Control className={`transition-colors duration-300 ${isSelected ? "bg-[var(--color-primary-default)]" : "bg-[var(--border-outline-light)]"}`}>
                      <Switch.Thumb className="bg-white shadow-sm flex items-center justify-center">
                        <Switch.Icon>
                          {isSelected ? (
                            // 🚀 ใช้ StarFill (แบบทึบ) แทน Sparkles เส้นจะได้ไม่บางและไม่ดูแตกครับ
                            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-default)] opacity-100" />
                          ) : (
                            <Power className="w-3.5 h-3.5 text-[var(--text-light)] opacity-70" />
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
            onSelect={(e) => handleTextareaSelect(e, "original")}
            onMouseUp={(e) => handleTextareaMouseUp(e, "original")}
            className={`flex-1 w-full resize-none outline-none text-[var(--text-normal)] text-lg leading-loose placeholder-[var(--text-light)] bg-transparent mb-4 ${robotoSerif.className}`}
          />

          {isAiMode && (
            <div className="shrink-0 mt-4 border-t border-[var(--border-outline-light)] pt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                className={`w-full min-h-[64px] resize-y text-[var(--text-normal)] bg-[var(--bg-surface-primary)] border border-[var(--border-outline-light)] focus-within:border-[var(--border-outline-darker)] focus-within:ring-4 focus-within:ring-transparent rounded-2xl transition-all ${robotoSerif.className}`}
              />
              <div className="flex justify-end">
                <Button
                  onPress={handleAiTranslate}
                  isDisabled={isAiTranslating}
                  variant="secondary"
                  className="font-bold px-5 rounded-full bg-[var(--color-primary-surface)] text-[var(--color-primary-hover)] hover:bg-[var(--color-primary-default)] hover:text-[var(--text-normal)] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Translate
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 rounded-2xl px-8 py-6 shadow-sm flex flex-col transition-all duration-500 ease-in-out relative ${isAiMode ? "bg-[#EFE8D8] border border-[var(--border-outline-light)]" : "bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)]"}`}>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold w-fit mb-6 shrink-0 ${isAiMode ? "bg-[#E3D3B1] text-[var(--text-normal)]" : "bg-[var(--color-primary-surface)] text-[var(--color-primary-hover)]"}`}>
            {book.translationLang}
          </div>

          <textarea
            placeholder="Translation language."
            value={translatedText}
            onChange={handleTranslationChange}
            onSelect={(e) => handleTextareaSelect(e, "translated")}
            onMouseUp={(e) => handleTextareaMouseUp(e, "translated")}
            className={`flex-1 w-full resize-none outline-none text-[var(--text-normal)] text-lg leading-loose placeholder-[var(--text-light)] bg-transparent mb-4 ${sarabun.className}`}
          />

          {isAiMode && (isAiTranslating || aiPreviewText) && (
            <div className="shrink-0 mt-4 p-5 bg-[var(--bg-surface-light)] border border-[var(--color-primary-default)] rounded-2xl shadow-sm flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2">
                {isAiTranslating ? (
                  <Spinner size="sm" color="current" className="text-[var(--color-primary-default)]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[var(--color-primary-default)]" />
                )}
                <span className="text-xs font-bold text-[var(--color-primary-default)] uppercase tracking-wider">
                  {isAiTranslating ? "AI Translating..." : "AI Translation Preview"}
                </span>
              </div>
              {aiPreviewText && (
                <p className={`text-[var(--text-normal)] text-lg leading-relaxed ${sarabun.className}`}>{aiPreviewText}</p>
              )}
              {!isAiTranslating && aiPreviewText && (
                <div className="flex justify-end gap-2 mt-2 border-t border-[var(--border-outline-light)] pt-4">
                  <button type="button" onClick={handleCancelTranslation} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] hover:text-[var(--text-normal)] transition-colors"><X className="w-4 h-4" /> Cancel</button>
                  <button type="button" onClick={handleAcceptTranslation} className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-[var(--text-normal)] bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-all active:scale-95"><Check className="w-4 h-4" /> Commit</button>
                </div>
              )}
            </div>
          )}

          {!isAiTranslating && !aiPreviewText && (
            <div className="flex justify-end gap-3 shrink-0 mt-4">
              <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex <= 0 ? "bg-[var(--bg-surface-primary)] text-[var(--text-light)] cursor-not-allowed border border-transparent" : "bg-[var(--bg-surface-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] border border-[var(--border-outline-light)] shadow-sm"}`}><Undo className="w-4 h-4" /> Undo</button>
              <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${historyIndex >= history.length - 1 ? "bg-[var(--bg-surface-primary)] text-[var(--text-light)] cursor-not-allowed border border-transparent" : "bg-[var(--bg-surface-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] border border-[var(--border-outline-light)] shadow-sm"}`}><Redo className="w-4 h-4" /> Redo</button>
            </div>
          )}
        </div>
      </main>

      {/* --- Text Selection Popup --- */}
      {selectedText && popupPosition.x > 0 && (
        <div
          id="selection-popup"
          className="fixed z-50 bg-[var(--bg-surface-light)] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[var(--border-outline-light)] flex flex-col w-[280px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={{
            top: popupPosition.y,
            left: popupPosition.x,
            transform: `translate(${popupPosition.isFlippedX === 'left' ? '0%' : popupPosition.isFlippedX === 'right' ? '-100%' : '-50%'}, ${popupPosition.isFlippedY ? '0%' : '-100%'})`,
            marginTop: popupPosition.isFlippedY ? '15px' : '-15px',
            marginLeft: popupPosition.isFlippedX === 'left' ? '15px' : popupPosition.isFlippedX === 'right' ? '-15px' : '0px'
          }}
        >
          <div className="flex flex-col p-2 gap-0.5">
            <button onClick={() => handlePopupAction('vocabulary')} className="w-full px-4 py-3 hover:bg-[var(--bg-surface-primary)] transition-colors text-left rounded-xl text-[15px] font-medium text-[var(--text-normal)]">
              Add to vocabulary
            </button>
            <button onClick={() => handlePopupAction('notes')} className="w-full px-4 py-3 hover:bg-[var(--bg-surface-primary)] transition-colors text-left rounded-xl text-[15px] font-medium text-[var(--text-normal)]">
              Add to notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}