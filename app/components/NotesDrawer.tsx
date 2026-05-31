"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooks, VocabularyItem, NoteItem } from "../context/BookContext";
import { Volume2, Edit, Trash2, Plus, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, FileX, ChevronDown, ChevronUp, Notebook } from "lucide-react";
import { toast, Spinner } from "@heroui/react";
import { Roboto_Serif, Sarabun } from "next/font/google";

const robotoSerif = Roboto_Serif({ subsets: ["latin"], weight: ["400"] });
const sarabun = Sarabun({ subsets: ["thai"], weight: ["300"] });

interface NotesDrawerProps {
  bookId: number;
  pageId: string;
}

export function NotesDrawer({ bookId, pageId }: NotesDrawerProps) {
  const { getBookById, updateBook } = useBooks();
  const book = getBookById(bookId);
  const page = book?.pages.find(p => p.id === pageId);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "vocabulary">("notes");

  // Load initial state
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(page?.vocabularies || []);
  const [notes, setNotes] = useState<NoteItem[]>(page?.notes || []);

  const [isAddingVocab, setIsAddingVocab] = useState(false);
  const [newVocabWord, setNewVocabWord] = useState("");
  const [newVocabRemarks, setNewVocabRemarks] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewVocab, setPreviewVocab] = useState<Partial<VocabularyItem> | null>(null);
  const [expandedVocabs, setExpandedVocabs] = useState<Record<string, boolean>>({});

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'note' | 'vocab', id: string } | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 🚀 Auto-Translate Logic for Vocabulary
  useEffect(() => {
    if (!newVocabWord.trim() || !isAddingVocab) {
      setPreviewVocab(null);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const res = await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: newVocabWord }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewVocab(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [newVocabWord, isAddingVocab]);

  const saveVocabList = (newList: VocabularyItem[]) => {
    if (!book || !page) return;
    const updatedPages = book.pages.map(p =>
      p.id === pageId ? { ...p, vocabularies: newList } : p
    );
    updateBook(bookId, { pages: updatedPages });
    setVocabList(newList);
  };

  const handleSaveVocab = () => {
    if (!newVocabWord.trim() || !previewVocab) return;

    const newItem: VocabularyItem = {
      id: Date.now().toString(),
      word: newVocabWord,
      phonetic: previewVocab.phonetic || "",
      thaiReading: previewVocab.thaiReading || "",
      partOfSpeech: previewVocab.partOfSpeech || "",
      translation: previewVocab.translation || "",
      examples: previewVocab.examples || [],
      remarks: newVocabRemarks,
      createdAt: Date.now(),
    };

    saveVocabList([newItem, ...vocabList]);
    setIsAddingVocab(false);
    setNewVocabWord("");
    setNewVocabRemarks("");
    setPreviewVocab(null);
    toast.success("Vocabulary added!");
  };

  const handleDeleteVocab = (id: string) => {
    saveVocabList(vocabList.filter(v => v.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedVocabs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeech = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const insertFormat = (prefix: string, suffix: string) => {
    const textarea = document.getElementById("noteTextarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentNoteText.substring(start, end);
    const before = currentNoteText.substring(0, start);
    const after = currentNoteText.substring(end);
    const val = before + prefix + selected + suffix + after;
    setCurrentNoteText(val);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSaveNote = () => {
    if (!currentNoteText.trim() || !book || !page) return;

    let newNotes = [...notes];
    if (editingNoteId) {
      newNotes = newNotes.map(n => n.id === editingNoteId ? { ...n, content: currentNoteText } : n);
    } else {
      newNotes = [{ id: Date.now().toString(), content: currentNoteText, createdAt: Date.now() }, ...newNotes];
    }

    setNotes(newNotes);
    const updatedPages = book.pages.map(p =>
      p.id === pageId ? { ...p, notes: newNotes } : p
    );
    updateBook(bookId, { pages: updatedPages });

    setIsAddingNote(false);
    setEditingNoteId(null);
    setCurrentNoteText("");
    toast.success(editingNoteId ? "Note updated!" : "Note added!");
  };

  const handleDeleteNote = (id: string) => {
    if (!book || !page) return;
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    const updatedPages = book.pages.map(p =>
      p.id === pageId ? { ...p, notes: newNotes } : p
    );
    updateBook(bookId, { pages: updatedPages });
    toast.success("Note deleted!");
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/\n/g, '<br />');

    html = html.replace(/&lt;div align='left'&gt;(.*?)&lt;\/div&gt;/g, '<div style="text-align: left;">$1</div>');
    html = html.replace(/&lt;div align='center'&gt;(.*?)&lt;\/div&gt;/g, '<div style="text-align: center;">$1</div>');
    html = html.replace(/&lt;div align='right'&gt;(.*?)&lt;\/div&gt;/g, '<div style="text-align: right;">$1</div>');

    return { __html: html };
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-full font-bold shadow-sm transition-colors text-sm"
      >
        <Notebook className="w-4 h-4 text-slate-600" /> Notebook
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 h-[100dvh] w-[400px] max-w-[90vw] bg-white shadow-2xl border-l border-slate-200 z-[101] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-0 shrink-0 border-b border-slate-100 flex flex-col">
                {!isAddingVocab && !isAddingNote && !editingNoteId ? (
                  <div className="px-5 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notebook</h2>
                    {activeTab === "vocabulary" ? (
                      <button
                        onClick={() => setIsAddingVocab(true)}
                        className="flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-full shadow-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsAddingNote(true);
                          setCurrentNoteText("");
                        }}
                        className="flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-full shadow-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-4 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {isAddingVocab ? "Add vocabulary" : (editingNoteId ? "Edit note" : "Add note")}
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsAddingVocab(false);
                          setIsAddingNote(false);
                          setEditingNoteId(null);
                          setNewVocabWord("");
                          setNewVocabRemarks("");
                          setPreviewVocab(null);
                        }}
                        className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={activeTab === "vocabulary" ? handleSaveVocab : handleSaveNote}
                        disabled={activeTab === "vocabulary" ? (!newVocabWord || !previewVocab || isTranslating) : !currentNoteText.trim()}
                        className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${(activeTab === "vocabulary" && (!newVocabWord || !previewVocab || isTranslating)) || (activeTab === "notes" && !currentNoteText.trim()) ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Switcher */}
                {!isAddingVocab && !isAddingNote && !editingNoteId && (
                  <div className="px-5 pb-4">
                    <div className="flex bg-slate-100 p-1 rounded-full w-full">
                      <button
                        className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${activeTab === "notes" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        onClick={() => setActiveTab("notes")}
                      >
                        Notes
                      </button>
                      <button
                        className={`flex-1 py-1.5 text-sm font-bold rounded-full transition-all ${activeTab === "vocabulary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        onClick={() => setActiveTab("vocabulary")}
                      >
                        Vocabulary
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-0 overflow-hidden flex flex-col relative h-full bg-white">
                {/* NOTES TAB */}
                {!isAddingVocab && activeTab === "notes" && (
                  <div className="flex-1 h-full flex flex-col px-5 py-5 overflow-y-auto">
                    {(isAddingNote || editingNoteId) ? (
                      <div className="flex-1 flex flex-col bg-[#f3f4f6] rounded-xl overflow-hidden min-h-[300px]">
                        {/* Toolbar inside gray container */}
                        <div className="px-3 py-2 flex items-center gap-1 shrink-0 overflow-x-auto">
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("**", "**")}><Bold className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("*", "*")}><Italic className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("__", "__")}><Underline className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("~~", "~~")}><Strikethrough className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("<div align='left'>", "</div>")}><AlignLeft className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("<div align='center'>", "</div>")}><AlignCenter className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors shrink-0" onClick={() => insertFormat("<div align='right'>", "</div>")}><AlignRight className="w-4 h-4" /></button>
                        </div>
                        {/* Textarea inside gray container */}
                        <textarea
                          id="noteTextarea"
                          className="flex-1 w-full p-4 resize-none outline-none text-slate-800 leading-relaxed placeholder:text-slate-400 bg-transparent text-sm font-medium"
                          placeholder="Enter your note here (Markdown formatting supported)"
                          value={currentNoteText}
                          onChange={(e) => setCurrentNoteText(e.target.value)}
                        />
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                          <FileX className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-800 font-bold text-base mb-1">No notes added!</p>
                        <p className="text-slate-500 text-sm">You can click add note to create a new note.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 pb-8">
                        {notes.map(note => (
                          <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                              <button onClick={() => { setEditingNoteId(note.id); setCurrentNoteText(note.content); }} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white shadow-sm border border-slate-100 hover:bg-blue-50 rounded-full transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'note', id: note.id })} className="p-1.5 text-slate-400 hover:text-red-600 bg-white shadow-sm border border-slate-100 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div
                              className="text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:font-bold prose-em:italic"
                              dangerouslySetInnerHTML={renderMarkdown(note.content)}
                            />
                            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                              {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VOCABULARY TAB */}
                {!isAddingVocab && !isAddingNote && !editingNoteId && activeTab === "vocabulary" && (
                  <div className="flex-1 h-full flex flex-col px-5 py-5 overflow-y-auto">
                    {vocabList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                          <FileX className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-800 font-bold text-base mb-1">No vocabulary added!</p>
                        <p className="text-slate-500 text-sm">You can click add a new vocabulary.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 pb-8">
                        {vocabList.map(vocab => {
                          const isExpanded = expandedVocabs[vocab.id];
                          return (
                            <div key={vocab.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-[17px] font-bold text-slate-900 tracking-tight">{vocab.word}</h4>
                                <div className="flex gap-1.5">
                                  <button onClick={() => setDeleteConfirm({ type: 'vocab', id: vocab.id })} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-slate-500 text-[13px]">{vocab.partOfSpeech}</span>
                                <span className="text-slate-500 text-[13px]">/{vocab.phonetic}/</span>
                                <button onClick={() => handleSpeech(vocab.word)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors ml-1">
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-slate-700 text-sm font-medium leading-relaxed mb-3">
                                <span className="text-slate-500 mr-1.5">({vocab.thaiReading})</span>
                                {vocab.translation}
                              </div>

                              {isExpanded && (
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                  {vocab.examples && vocab.examples.length > 0 && (
                                    <div className="mb-4">
                                      <span className="text-[12px] font-bold text-slate-900 block mb-2">Example sentences</span>
                                      <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5">
                                        {vocab.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                      </ol>
                                    </div>
                                  )}
                                  {vocab.remarks && (
                                    <div>
                                      <span className="text-[12px] font-bold text-slate-900 block mb-2">Remarks</span>
                                      <p className="text-sm text-slate-600 leading-relaxed">{vocab.remarks}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-end mt-1">
                                <button
                                  className="flex items-center gap-1 text-[13px] text-slate-500 font-semibold hover:text-slate-800 transition-colors"
                                  onClick={() => toggleExpand(vocab.id)}
                                >
                                  {isExpanded ? "See less" : "See more"}
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ADD VOCABULARY VIEW */}
                {isAddingVocab && (
                  <div className="flex-1 h-full flex flex-col px-5 py-5 overflow-y-auto">
                    <div className="mb-4">
                      <label className="text-[13px] font-bold text-slate-900 block mb-2">Vocabulary name</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium placeholder:text-slate-400"
                          placeholder="Enter vocabulary name"
                          value={newVocabWord}
                          onChange={(e) => setNewVocabWord(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="text-[13px] font-bold text-slate-900 block mb-2">Remarks</label>
                      <textarea
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] resize-y text-sm placeholder:text-slate-400"
                        placeholder="Enter remarks"
                        value={newVocabRemarks}
                        onChange={(e) => setNewVocabRemarks(e.target.value)}
                      />
                    </div>

                    {isTranslating && (
                      <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm mb-4 flex flex-col items-center justify-center gap-3">
                        <Spinner size="md" color="current" className="text-blue-600" />
                        <span className="text-sm font-bold text-blue-600">Translating vocabulary...</span>
                      </div>
                    )}

                    {previewVocab && !isTranslating && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-slate-500 text-[13px] font-medium">{previewVocab.partOfSpeech}</span>
                          <span className="text-slate-500 text-[13px]">/{previewVocab.phonetic}/</span>
                        </div>
                        <div className="text-slate-800 text-sm font-bold mb-2">
                          <span className="text-slate-500 mr-1.5 font-medium">({previewVocab.thaiReading})</span>
                          {previewVocab.translation}
                        </div>
                        {previewVocab.examples && previewVocab.examples.length > 0 && (
                          <div className="text-[13px] text-slate-500 italic border-t border-slate-100 pt-2 mt-2">
                            "{previewVocab.examples[0]}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-[320px] p-6 text-center z-10"
            >
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete this item?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure you want to delete it?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'note') {
                      handleDeleteNote(deleteConfirm.id);
                    } else {
                      handleDeleteVocab(deleteConfirm.id);
                    }
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
