"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Sparkles, Undo, Redo, Check, X, Power, WandSparkles, ScanLine, Maximize2, Minimize2 } from "lucide-react";
import { Roboto_Serif, Sarabun } from "next/font/google";
import { useBooks } from "../../../../context/BookContext";
// 🚀 ดึง toast มาจาก heroui ตาม Doc มาตรฐาน
import { Switch, toast, Button, Spinner, TextArea } from "@heroui/react";
import { NotesDrawer } from "../../../../components/NotesDrawer";

const robotoSerif = Roboto_Serif({ subsets: ["latin"], weight: ["400"] });
const sarabun = Sarabun({ subsets: ["thai"], weight: ["300"] });

export default function TranslatePage() {
  const params = useParams();
  const bookId = String(params.id);
  const pageId = params.pageId as string;

  const { getBookById, updateBook, isLoading: isBooksLoading } = useBooks();
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

  // --- OCR Scan State ---
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrExtractedText, setOcrExtractedText] = useState("");
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [isOcrImageExpanded, setIsOcrImageExpanded] = useState(false);
  const [isOcrTextExpanded, setIsOcrTextExpanded] = useState(false);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  
  // Track if page is initialized to prevent autosave from resetting history
  const initializedPageId = useRef<string | null>(null);

  // --- Text Selection Popup State (Notion-style) ---
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeTextarea, setActiveTextarea] = useState<"original" | "translated" | null>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);

  // Compute popup position: bottom-right of the selection, close but not blocking
  const computePopupPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // If rect has no size (can happen with textarea selections), fall back
    if (rect.width === 0 && rect.height === 0) return null;

    const popupWidth = 200;
    const gap = 12;

    // Place at bottom-right of the selection
    let top = rect.bottom + gap;
    let left = rect.right - popupWidth / 2;

    // Clamp to viewport edges
    left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
    if (top + 90 > window.innerHeight) top = rect.top - 90 - gap; // flip above if near bottom

    return { top, left };
  };

  // Dismiss popup when clicking outside or when selection is lost
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If clicking inside the popup itself, don't dismiss
      if (popupRef.current?.contains(target)) return;
      // Any other click dismisses the popup
      setSelectedText("");
      setActiveTextarea(null);
      setPopupPosition(null);
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectedText("");
        setActiveTextarea(null);
        setPopupPosition(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>, type: "original" | "translated") => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const text = textarea.value.substring(start, end);
      setSelectedText(text);
      setActiveTextarea(type);

      // Use requestAnimationFrame to let browser finalize the selection rect
      requestAnimationFrame(() => {
        const pos = computePopupPosition();
        if (pos) {
          setPopupPosition(pos);
        } else {
          // Fallback: position at bottom-right of mouse cursor
          const popupWidth = 200;
          const gap = 12;
          let left = e.clientX;
          left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
          const top = e.clientY + gap;
          setPopupPosition({ top, left });
        }
      });
    } else {
      setSelectedText("");
      setActiveTextarea(null);
      setPopupPosition(null);
    }
  };

  const handlePopupAction = async (action: 'vocabulary' | 'notes') => {
    if (action === 'vocabulary') {
      window.dispatchEvent(new CustomEvent('open-notes-drawer', { detail: { tab: 'vocabulary', text: selectedText } }));
    } else if (action === 'notes') {
      window.dispatchEvent(new CustomEvent('open-notes-drawer', { detail: { tab: 'notes', text: selectedText } }));
    }
    
    // Clear selection and dismiss popup
    window.getSelection()?.removeAllRanges();
    setSelectedText("");
    setActiveTextarea(null);
    setPopupPosition(null);
  };

  useEffect(() => {
    if (page && initializedPageId.current !== page.id) {
      const initialOriginal = page.originalText || "";
      const initialTranslated = page.translatedText || "";
      setOriginalText(initialOriginal);
      setTranslatedText(initialTranslated);
      setHistory([initialTranslated]);
      setHistoryIndex(0);
      initializedPageId.current = page.id;
    }
  }, [page]);

  if (isBooksLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!book || !page) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted)] font-medium">Page not found.</div>;
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

  // ---------------------------------------------------------
  // 🔍 OCR Scan from Image
  // ---------------------------------------------------------
  const handleOcrFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setOcrImagePreview(previewUrl);
    setOcrExtractedText("");
    setIsOcrModalOpen(true);
    setIsOcrScanning(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (book?.originalLang) {
        formData.append("language", book.originalLang);
      }

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "OCR API failed");
      }

      setOcrExtractedText(data.text || "");

      if (!data.text?.trim()) {
        toast.warning("No text found", {
          description: "Could not detect any text in the image.",
        });
      }
    } catch (error: any) {
      toast.danger("Scan failed", {
        description: error.message || "Could not extract text from the image.",
      });
      setIsOcrModalOpen(false);
    } finally {
      setIsOcrScanning(false);
      // Reset file input so same file can be re-selected
      if (ocrFileInputRef.current) ocrFileInputRef.current.value = "";
    }
  };

  const handleOcrInsertText = () => {
    if (!ocrExtractedText.trim()) {
      setIsOcrModalOpen(false);
      return;
    }

    // Append to existing original text
    const newOriginal = originalText.trim()
      ? originalText.trim() + "\n\n" + ocrExtractedText
      : ocrExtractedText;

    setOriginalText(newOriginal);
    setIsOcrModalOpen(false);
    setOcrImagePreview(null);
    setOcrExtractedText("");
    setIsOcrImageExpanded(false);
    setIsOcrTextExpanded(false);

    toast.success("Text inserted!", {
      description: "Scanned text has been added to the original text.",
    });
  };

  const handleOcrCancel = () => {
    setIsOcrModalOpen(false);
    setOcrImagePreview(null);
    setOcrExtractedText("");
    setIsOcrImageExpanded(false);
    setIsOcrTextExpanded(false);
  };

  return (
    <div className="h-screen bg-[var(--surface)] flex flex-col font-sans overflow-hidden">
      <header className="h-20 px-6 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <Link href={`/book/${bookId}`} className="flex items-center gap-2 text-[var(--foreground)] hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <NotesDrawer bookId={bookId} pageId={pageId} />
          <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] px-6 py-2.5 rounded-[var(--radius)] font-bold  transition-colors text-sm">
            <Save className="w-4 h-4" /> Save changes
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 px-6 py-4 overflow-hidden">
        <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] px-8 py-6 flex flex-col transition-all relative">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-4 py-1.5 rounded-[var(--radius)] bg-[var(--separator)] text-[13px] font-bold text-[var(--muted)]">
                {book.originalLang}
              </div>
              <button
                type="button"
                onClick={() => ocrFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors opacity-80 hover:opacity-100"
              >
                <ScanLine className="w-4 h-4" />
                Scan
              </button>
              <input
                ref={ocrFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleOcrFileSelect}
                className="hidden"
              />
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
                      <span className="text-[13px] font-bold text-[var(--foreground)] leading-tight">AI Translation</span>
                      <span className="text-[11px] font-medium text-[var(--muted)]">Let AI enhance your translation</span>
                    </div>

                    {/* ฝั่งปุ่มสวิตช์ */}
                    <Switch.Control className={`transition-colors duration-300 ${isSelected ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}>
                      <Switch.Thumb className="bg-white  flex items-center justify-center">
                        <Switch.Icon>
                          {isSelected ? (
                            // 🚀 ใช้ StarFill (แบบทึบ) แทน Sparkles เส้นจะได้ไม่บางและไม่ดูแตกครับ
                            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] opacity-100" />
                          ) : (
                            <Power className="w-3.5 h-3.5 text-[var(--muted)] opacity-70" />
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
            onMouseUp={(e) => handleTextareaMouseUp(e, "original")}
            className={`flex-1 w-full resize-none outline-none text-[var(--foreground)] text-lg leading-loose placeholder-[var(--muted)] bg-transparent mb-4 ${robotoSerif.className}`}
          />

          {isAiMode && (
            <div className="shrink-0 mt-4 border-t border-[var(--border)] pt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                className={`w-full min-h-[64px] resize-y text-[var(--foreground)] bg-[var(--surface)] border border-[var(--surface-tertiary)] focus-within:border-[var(--muted)] focus-within:ring-4 focus-within:ring-transparent rounded-[var(--radius)] transition-all ${robotoSerif.className}`}
              />
              <div className="flex justify-end">
                <Button
                  onPress={handleAiTranslate}
                  isDisabled={isAiTranslating}
                  variant="secondary"
                  className="font-bold px-5 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Translate
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 rounded-[var(--radius)] px-8 py-6 flex flex-col transition-all duration-500 ease-in-out relative ${isAiMode ? "bg-[#fdfaf2] border border-[#e8e3d3] shadow-[inset_0_0_60px_rgba(220,210,180,0.2)] dark:bg-[#282622] dark:border-[#3E3B33] dark:shadow-none" : "bg-[var(--surface)] border border-[var(--border)]"}`}>
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-[var(--radius)] text-[13px] font-bold ${isAiMode ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--separator)] text-[var(--muted)]"}`}>
              {book.translationLang}
            </div>

            {/* Undo / Redo Actions */}
            <div className="flex justify-end gap-1">
              <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-[13px] font-bold transition-all ${historyIndex <= 0 ? "text-[var(--muted)] cursor-not-allowed opacity-40" : "text-[var(--muted)] hover:text-[var(--foreground)] opacity-80 hover:opacity-100"}`}>
                <Undo className="w-3.5 h-3.5" /> Undo
              </button>
              <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-[13px] font-bold transition-all ${historyIndex >= history.length - 1 ? "text-[var(--muted)] cursor-not-allowed opacity-40" : "text-[var(--muted)] hover:text-[var(--foreground)] opacity-80 hover:opacity-100"}`}>
                <Redo className="w-3.5 h-3.5" /> Redo
              </button>
            </div>
          </div>

          <textarea
            placeholder="Translation language."
            value={translatedText}
            onChange={handleTranslationChange}
            onMouseUp={(e) => handleTextareaMouseUp(e, "translated")}
            className={`flex-1 w-full resize-none outline-none text-[var(--foreground)] text-lg leading-loose placeholder-[var(--muted)] bg-transparent mb-4 ${sarabun.className}`}
          />

          {isAiMode && (isAiTranslating || aiPreviewText) && (
            <div className="shrink-0 mt-4 p-5 bg-[var(--surface)] border border-[var(--surface-tertiary)] rounded-[var(--radius)]  flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2">
                {isAiTranslating ? (
                  <Spinner size="sm" color="current" className="text-[var(--muted)]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[var(--muted)]" />
                )}
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                  {isAiTranslating ? "AI Translating..." : "AI Translation Preview"}
                </span>
              </div>
              {aiPreviewText && (
                <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  <p className={`text-[var(--foreground)] text-lg leading-relaxed whitespace-pre-wrap ${sarabun.className}`}>{aiPreviewText}</p>
                </div>
              )}
              {!isAiTranslating && aiPreviewText && (
                <div className="flex justify-end gap-2 mt-2 border-t border-[var(--border)] pt-4">
                  <button type="button" onClick={handleCancelTranslation} className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] text-sm font-bold text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-colors"><X className="w-4 h-4" /> Cancel</button>
                  <button type="button" onClick={handleAcceptTranslation} className="flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius)] text-sm font-bold text-[var(--accent-foreground)] bg-[var(--accent)] hover:opacity-90  transition-all active:scale-95"><Check className="w-4 h-4" /> Commit</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- Text Selection Popup --- */}
      {selectedText && popupPosition && (
        <div
          ref={popupRef}
          id="selection-popup"
          className="fixed z-50 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shadow-md flex flex-col w-[200px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
          }}
        >
          <div className="flex flex-col p-1.5 gap-px">
            <button onClick={() => handlePopupAction('vocabulary')} className="w-full px-3 py-2 hover:bg-[var(--surface)] transition-colors text-left rounded-lg text-[13px] font-medium text-[var(--foreground)]">
              Add to vocabulary
            </button>
            <button onClick={() => handlePopupAction('notes')} className="w-full px-3 py-2 hover:bg-[var(--surface)] transition-colors text-left rounded-lg text-[13px] font-medium text-[var(--foreground)]">
              Add to notes
            </button>
          </div>
        </div>
      )}

      {/* --- OCR Preview Modal --- */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl w-full max-w-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <ScanLine className="w-6 h-6" />
                  Scanned Text Preview
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">Review the extracted text before inserting.</p>
              </div>
              <button
                onClick={handleOcrCancel}
                className="p-2 text-[var(--muted)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            {ocrImagePreview && (
              <div className="mb-6 relative group w-full max-h-[240px] bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden flex items-center justify-center">
                <div className="relative flex items-center justify-center w-full h-full">
                  <img
                    src={ocrImagePreview}
                    alt="Scanned image"
                    className="object-contain max-w-full max-h-[240px]"
                  />
                  <button 
                    onClick={() => setIsOcrImageExpanded(true)}
                    className="absolute top-2 right-2 p-2 bg-[var(--background)]/80 hover:bg-[var(--background)] backdrop-blur-sm text-[var(--foreground)] rounded-[var(--radius)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border)] shadow-sm"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Extracted Text */}
            <div className="mb-6 flex flex-col">
              <div className="flex justify-between items-center mb-2 shrink-0">
                <label className="text-sm font-semibold text-[var(--foreground)]">Extracted Text</label>
              </div>
              
              {isOcrScanning ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-[var(--background)] rounded-[var(--radius)] border border-[var(--border)]">
                  <Spinner size="lg" color="current" className="text-[var(--accent)]" />
                  <span className="text-sm font-bold text-[var(--muted)]">Scanning text from image...</span>
                </div>
              ) : (
                <div className="relative group w-full">
                  <textarea
                    value={ocrExtractedText}
                    onChange={(e) => setOcrExtractedText(e.target.value)}
                    placeholder="No text detected"
                    rows={6}
                    className={`w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] font-medium text-[var(--foreground)] resize-y transition-all text-base leading-relaxed ${robotoSerif.className}`}
                  />
                  {ocrExtractedText && (
                    <button 
                      onClick={() => setIsOcrTextExpanded(true)}
                      className="absolute top-2 right-2 p-2 bg-[var(--background)]/80 hover:bg-[var(--background)] backdrop-blur-sm text-[var(--foreground)] rounded-[var(--radius)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border)] shadow-sm"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                onClick={handleOcrCancel}
                className="px-8 py-2.5 rounded-[var(--radius)] font-bold text-[var(--foreground)] bg-transparent border border-[var(--border)] hover:bg-[var(--surface-secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleOcrInsertText}
                disabled={isOcrScanning || !ocrExtractedText.trim()}
                className="px-8 py-2.5 rounded-[var(--radius)] font-bold bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Insert Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Fullscreen Expanded Views --- */}
      {isOcrImageExpanded && ocrImagePreview && (
        <div className="fixed inset-0 z-[60] bg-[var(--surface)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
            <h3 className="text-lg font-bold flex items-center gap-2"><ScanLine className="w-5 h-5"/> Image Preview</h3>
            <button onClick={() => setIsOcrImageExpanded(false)} className="p-2 bg-[var(--surface-secondary)] hover:bg-[var(--border)] rounded-[var(--radius)] transition-colors">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-[var(--background)] flex items-center justify-center">
            <img src={ocrImagePreview} alt="Scanned image full" className="max-w-full h-auto object-contain shadow-md rounded-[var(--radius)]" />
          </div>
        </div>
      )}

      {isOcrTextExpanded && (
        <div className="fixed inset-0 z-[60] bg-[var(--surface)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
            <h3 className="text-lg font-bold flex items-center gap-2"><ScanLine className="w-5 h-5"/> Extracted Text Preview</h3>
            <button onClick={() => setIsOcrTextExpanded(false)} className="p-2 bg-[var(--surface-secondary)] hover:bg-[var(--border)] rounded-[var(--radius)] transition-colors">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--surface-secondary)] py-8 px-4">
            <div className="w-full max-w-[800px] bg-[var(--surface)] border border-[var(--border)] shadow-md rounded mx-auto mb-8">
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${Math.max(el.scrollHeight, 1056)}px`;
                  }
                }}
                value={ocrExtractedText}
                onChange={(e) => {
                  setOcrExtractedText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.max(e.target.scrollHeight, 1056)}px`;
                }}
                className={`block w-full min-h-[1056px] overflow-hidden bg-transparent px-12 py-16 outline-none font-medium text-[var(--foreground)] resize-none text-[17px] leading-loose ${robotoSerif.className}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}