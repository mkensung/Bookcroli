"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooks, VocabularyItem, NoteItem } from "../context/BookContext";
import { Volume2, Edit, Trash2, Plus, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, FileX, ChevronDown, ChevronUp, Notebook } from "lucide-react";
import { toast, Spinner, Tabs, Tab, TextField, Label, Input, TextArea } from "@heroui/react";
import { Roboto_Serif, Sarabun } from "next/font/google";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

const robotoSerif = Roboto_Serif({ subsets: ["latin"], weight: ["400"] });
const sarabun = Sarabun({ subsets: ["thai"], weight: ["300"] });

interface NotesDrawerProps {
  bookId: string;
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: currentNoteText,
    onUpdate: ({ editor }) => {
      setCurrentNoteText(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full h-full min-h-[300px] p-4 outline-none text-[var(--foreground)] leading-relaxed text-sm font-medium prose prose-sm max-w-none prose-p:my-1 prose-strong:font-bold prose-em:italic focus:outline-none',
      },
    },
  });

  // Sync editor content when editing starts or stops
  useEffect(() => {
    if (editor) {
      if (editingNoteId) {
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
          editor.commands.setContent(note.content);
        }
      } else if (isAddingNote) {
        editor.commands.setContent(currentNoteText || "");
      }
    }
  }, [editingNoteId, isAddingNote, editor, notes]);

  // 🚀 Listen for Text Selection Popup Actions
  useEffect(() => {
    const handleOpenNotesDrawer = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: "vocabulary" | "notes", text: string }>;
      setIsOpen(true);
      setActiveTab(customEvent.detail.tab);
      
      if (customEvent.detail.tab === "vocabulary") {
        setIsAddingVocab(true);
        setNewVocabWord(customEvent.detail.text);
      } else if (customEvent.detail.tab === "notes") {
        setIsAddingNote(true);
        const newText = `<p>${customEvent.detail.text}</p>`;
        setCurrentNoteText(newText);
        if (editor) {
          editor.commands.setContent(newText);
        }
      }
    };
    
    window.addEventListener("open-notes-drawer", handleOpenNotesDrawer);
    return () => window.removeEventListener("open-notes-drawer", handleOpenNotesDrawer);
  }, [editor]);

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



  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)] px-5 py-2.5 rounded-[var(--radius)] font-bold  transition-colors text-sm"
      >
        <Notebook className="w-4 h-4 text-[var(--muted)]" /> Notebook
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[var(--foreground)]/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 h-[100dvh] w-[400px] max-w-[90vw] bg-[var(--surface)]  border-l border-[var(--border)] z-[101] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-0 shrink-0 border-b border-[var(--border)] flex flex-col">
                {!isAddingVocab && !isAddingNote && !editingNoteId ? (
                  <div className="px-5 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Notebook</h2>
                    {activeTab === "vocabulary" ? (
                      <button
                        onClick={() => setIsAddingVocab(true)}
                        className="flex items-center gap-1 text-sm font-bold text-[var(--accent-foreground)] bg-[var(--accent)] hover:opacity-90 px-4 py-1.5 rounded-[var(--radius)] transition-colors"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" /> Add
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsAddingNote(true);
                          setCurrentNoteText("");
                        }}
                        className="flex items-center gap-1 text-sm font-bold text-[var(--accent-foreground)] bg-[var(--accent)] hover:opacity-90 px-4 py-1.5 rounded-[var(--radius)] transition-colors"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" /> Add
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-4 flex justify-between items-center bg-[var(--surface)]">
                    <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
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
                        className="text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={activeTab === "vocabulary" ? handleSaveVocab : handleSaveNote}
                        disabled={activeTab === "vocabulary" ? (!newVocabWord || !previewVocab || isTranslating) : !currentNoteText.trim()}
                        className={`bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] px-4 py-1.5 rounded-[var(--radius)] font-bold text-sm transition-colors ${(activeTab === "vocabulary" && (!newVocabWord || !previewVocab || isTranslating)) || (activeTab === "notes" && !currentNoteText.trim()) ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Switcher */}
                {!isAddingVocab && !isAddingNote && !editingNoteId && (
                  <div className="px-5 pb-4">
                    <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as "notes" | "vocabulary")} className="w-full">
                      <Tabs.ListContainer>
                        <Tabs.List aria-label="Notes Drawer Tabs" className="grid w-full grid-cols-2">
                          <Tabs.Tab id="notes">Notes<Tabs.Indicator /></Tabs.Tab>
                          <Tabs.Tab id="vocabulary">Vocabulary<Tabs.Indicator /></Tabs.Tab>
                        </Tabs.List>
                      </Tabs.ListContainer>
                    </Tabs>
                  </div>
                )}
              </div>

              <div className="p-0 overflow-hidden flex flex-col relative h-full bg-[var(--surface)]">
                {/* NOTES TAB */}
                {!isAddingVocab && activeTab === "notes" && (
                  <div className="flex-1 h-full flex flex-col px-5 py-5 overflow-y-auto">
                    {(isAddingNote || editingNoteId) ? (
                      <div className="flex-1 flex flex-col bg-[var(--surface)] rounded-[var(--radius)] overflow-hidden min-h-[300px]">
                        {/* Toolbar inside gray container */}
                        <div className="px-3 py-2 flex items-center gap-1 shrink-0 overflow-x-auto">
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive('bold') ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></button>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive('italic') ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></button>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive('underline') ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline className="w-4 h-4" /></button>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive('strike') ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-[var(--focus)] mx-1 shrink-0"></div>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></button>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></button>
                          <button className={`p-1.5 rounded-[var(--radius)] hover:bg-[var(--border)] text-[var(--muted)] transition-colors shrink-0 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-[var(--border)]' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></button>
                        </div>
                        {/* Tiptap Editor inside gray container */}
                        <div className="flex-1 w-full bg-transparent overflow-y-auto" onClick={() => editor?.commands.focus()}>
                          <EditorContent editor={editor} />
                        </div>
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-14 h-14 bg-[var(--surface-secondary)] rounded-[var(--radius)] flex items-center justify-center mb-4">
                          <FileX className="w-6 h-6 text-[var(--muted)]" strokeWidth={1.5} />
                        </div>
                        <p className="text-[var(--foreground)] font-bold text-base mb-1">No notes added!</p>
                        <p className="text-[var(--muted)] text-sm">You can click add note to create a new note.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 pb-8">
                        {notes.map(note => (
                          <div key={note.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5  relative group">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                              <button onClick={() => { setEditingNoteId(note.id); setCurrentNoteText(note.content); }} className="p-1.5 text-[var(--muted)] hover:text-[var(--accent)] bg-[var(--surface)] hover:bg-[var(--surface-tertiary)] rounded-[var(--radius)] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'note', id: note.id })} className="p-1.5 text-[var(--muted)] hover:text-[var(--danger)] bg-[var(--surface)] hover:bg-[var(--danger)] rounded-[var(--radius)] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div
                              className="text-[var(--foreground)] text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:font-bold prose-em:italic"
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] font-medium text-[var(--muted)]">
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
                        <div className="w-14 h-14 bg-[var(--surface-secondary)] rounded-[var(--radius)] flex items-center justify-center mb-4">
                          <FileX className="w-6 h-6 text-[var(--muted)]" strokeWidth={1.5} />
                        </div>
                        <p className="text-[var(--foreground)] font-bold text-base mb-1">No vocabulary added!</p>
                        <p className="text-[var(--muted)] text-sm">You can click add a new vocabulary.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 pb-8">
                        {vocabList.map(vocab => {
                          const isExpanded = expandedVocabs[vocab.id];
                          return (
                            <div key={vocab.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4  relative group">
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                                <button onClick={() => setDeleteConfirm({ type: 'vocab', id: vocab.id })} className="p-1.5 text-[var(--muted)] hover:text-[var(--danger)] bg-[var(--surface)] hover:bg-[var(--danger)] rounded-[var(--radius)] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                              <div className="flex justify-between items-start mb-1 pr-6">
                                <h4 className="text-[17px] font-bold text-[var(--foreground)] tracking-tight">{vocab.word}</h4>
                              </div>

                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-[var(--muted)] text-[13px]">{vocab.partOfSpeech}</span>
                                <span className="text-[var(--muted)] text-[13px]">/{vocab.phonetic}/</span>
                                <button onClick={() => handleSpeech(vocab.word)} className="p-1 text-[var(--muted)] hover:text-[var(--accent)] transition-colors ml-1">
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[var(--foreground)] text-sm font-medium leading-relaxed mb-3">
                                <span className="text-[var(--muted)] mr-1.5">({vocab.thaiReading})</span>
                                {vocab.translation}
                              </div>

                              {isExpanded && (
                                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                                  {vocab.examples && vocab.examples.length > 0 && (
                                    <div className="mb-4">
                                      <span className="text-[12px] font-bold text-[var(--foreground)] block mb-2">Example sentences</span>
                                      <ol className="list-decimal list-inside text-sm text-[var(--muted)] space-y-1.5">
                                        {vocab.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                      </ol>
                                    </div>
                                  )}
                                  {vocab.remarks && (
                                    <div>
                                      <span className="text-[12px] font-bold text-[var(--foreground)] block mb-2">Remarks</span>
                                      <p className="text-sm text-[var(--muted)] leading-relaxed">{vocab.remarks}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-end mt-1">
                                <button
                                  className="flex items-center gap-1 text-[13px] text-[var(--muted)] font-semibold hover:text-[var(--foreground)] transition-colors"
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
                    <TextField className="mb-4" isRequired>
                      <Label className="text-[13px] font-bold text-[var(--foreground)]">Vocabulary name</Label>
                      <Input
                        type="text"
                        className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--field-radius)] py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all text-sm font-medium placeholder:text-[var(--muted)]"
                        placeholder="Enter vocabulary name"
                        value={newVocabWord}
                        onChange={(e) => setNewVocabWord(e.target.value)}
                      />
                    </TextField>

                    <TextField className="mb-5">
                      <Label className="text-[13px] font-bold text-[var(--foreground)]">Remarks</Label>
                      <TextArea
                        className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--field-radius)] p-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all min-h-[100px] resize-y text-sm placeholder:text-[var(--muted)]"
                        placeholder="Enter remarks"
                        value={newVocabRemarks}
                        onChange={(e) => setNewVocabRemarks(e.target.value)}
                      />
                    </TextField>

                    {isTranslating && (
                      <div className="bg-[var(--surface)] border border-[var(--accent)] rounded-[var(--radius)] p-6  mb-4 flex flex-col items-center justify-center gap-3">
                        <Spinner size="md" color="current" className="text-[var(--accent)]" />
                        <span className="text-sm font-bold text-[var(--accent)]">Translating vocabulary...</span>
                      </div>
                    )}

                    {previewVocab && !isTranslating && (
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4  mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[var(--muted)] text-[13px] font-medium">{previewVocab.partOfSpeech}</span>
                          <span className="text-[var(--muted)] text-[13px]">/{previewVocab.phonetic}/</span>
                        </div>
                        <div className="text-[var(--foreground)] text-sm font-bold mb-2">
                          <span className="text-[var(--muted)] mr-1.5 font-medium">({previewVocab.thaiReading})</span>
                          {previewVocab.translation}
                        </div>
                        {previewVocab.examples && previewVocab.examples.length > 0 && (
                          <div className="text-[13px] text-[var(--muted)] italic border-t border-[var(--border)] pt-2 mt-2">
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
              className="absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[var(--surface)] rounded-[var(--radius)]  w-[90%] max-w-[320px] p-6 text-center z-10"
            >
              <div className="w-12 h-12 bg-[var(--danger)]/15 text-[var(--danger)] rounded-[var(--radius)] flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Delete this item?</h3>
              <p className="text-sm text-[var(--muted)] mb-6">This action cannot be undone. Are you sure you want to delete it?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-[var(--radius)] font-bold text-sm bg-[var(--surface-secondary)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
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
                  className="flex-1 py-2.5 rounded-[var(--radius)] font-bold text-sm bg-[var(--danger)] text-white hover:bg-[var(--danger)] transition-colors  shadow-red-500/20"
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
