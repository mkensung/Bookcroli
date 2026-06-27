"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Select, ListBox, Button, Card, TextField, Label, Input, TextArea, FieldError } from "@heroui/react";import {
  BookOpen, Book, LayoutGrid, Bookmark, Search,
  Bell, Settings, Plus, Image as ImageIcon, X, Trash2, ChevronDown,
  RefreshCw, CheckCircle2
} from "lucide-react";
import { useBooks } from "./context/BookContext";
import { toast } from "@heroui/react";
import { Navbar } from "./components/Navbar";

const languages = [
  { label: "English", value: "English" },
  { label: "Thai", value: "Thai" },
  { label: "Korean", value: "Korean" },
  { label: "Japanese", value: "Japanese" },
  { label: "Chinese", value: "Chinese" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
];

export default function Home() {
  const { books, addBook, deleteBook } = useBooks();

  const [activeTab, setActiveTab] = useState<"overview" | "library" | "bookmark">("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "", author: "", totalPages: "", plot: "",
    originalLang: "", translationLang: "", coverImage: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, coverImage: imageUrl });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "", author: "", totalPages: "", plot: "",
      originalLang: "", translationLang: "", coverImage: null
    });
    setErrors({});
  };

  const handleConfirmAddBook = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Book name is required";
    if (!formData.author.trim()) newErrors.author = "Author name is required";
    if (!formData.totalPages) newErrors.totalPages = "Total page is required";
    if (!formData.originalLang) newErrors.originalLang = "Original language is required";
    if (!formData.translationLang) newErrors.translationLang = "Translation language is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // @ts-ignore
      if (toast?.danger) toast.danger("Please fill in all required fields.");
      return;
    }

    addBook({
      title: formData.title,
      author: formData.author,
      plot: formData.plot,
      coverImage: formData.coverImage,
      originalLang: formData.originalLang,
      translationLang: formData.translationLang,
      totalPages: Number(formData.totalPages) || 100,
    });

    // @ts-ignore
    if (toast?.success) toast.success("Book added successfully!");
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (bookToDelete !== null) {
      deleteBook(bookToDelete);
      // @ts-ignore
      if (toast?.success) toast.success("Book deleted successfully!");
      setBookToDelete(null);
    }
  };

  const totalBooks = books.length;
  const completedBooks = books.filter((b: any) => b.totalPages > 0 && b.translatedPages >= b.totalPages).length;
  const inProgressBooks = totalBooks - completedBooks;
  const inProgressBooksList = books.filter((b: any) => b.totalPages === 0 || b.translatedPages < b.totalPages);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-20">

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Keyframe animations for the banner scene */}
            <style>{`
              @keyframes mascotFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-14px); }
              }
              @keyframes floatBook1 {
                0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                25% { transform: translate(6px, -10px) rotate(4deg); }
                50% { transform: translate(-2px, -18px) rotate(-2deg); }
                75% { transform: translate(-8px, -8px) rotate(2deg); }
              }
              @keyframes floatBook2 {
                0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                30% { transform: translate(-8px, -14px) rotate(-5deg); }
                60% { transform: translate(4px, -20px) rotate(3deg); }
              }
              @keyframes sparkle {
                0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
              }
              @keyframes leafDrift {
                0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
                25% { transform: translate(8px, -12px) rotate(15deg); opacity: 0.9; }
                50% { transform: translate(-4px, -20px) rotate(-10deg); opacity: 0.7; }
                75% { transform: translate(-10px, -6px) rotate(8deg); opacity: 0.85; }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.15; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.08); }
              }
              @keyframes dotFloat {
                0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
                50% { transform: translateY(-8px) scale(1.3); opacity: 0.8; }
              }
            `}</style>

            {/* Banner */}
            <Card className="bg-[var(--surface-secondary)] rounded-[var(--radius)] shadow-none border-none overflow-hidden">
              <div className="p-10 flex justify-between relative overflow-hidden flex-row min-h-[280px]">
                <div className="relative z-10 flex flex-col justify-center">
                  <h1 className="text-[34px] font-extrabold text-[var(--foreground)] tracking-tight">Welcome back, Mean!</h1>
                  <p className="text-[17px] text-[var(--muted)] mt-2 font-medium">You have {inProgressBooks} books in translation progress.</p>
                  
                  <div className="flex gap-4 mt-8">
                    <Card className="bg-[var(--surface)] rounded-[var(--radius)] p-4 flex flex-row items-center gap-4 min-w-[200px] shadow-sm border border-[var(--border)]">
                      <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--surface-tertiary)] text-[var(--accent)] flex items-center justify-center shrink-0">
                        <Book className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">Total books</p>
                        <p className="text-[26px] font-black text-[var(--foreground)] leading-none mt-1">{totalBooks}</p>
                      </div>
                    </Card>
                    <Card className="bg-[var(--surface)] rounded-[var(--radius)] p-4 flex flex-row items-center gap-4 min-w-[200px] shadow-sm border border-[var(--border)]">
                      <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center shrink-0">
                        <RefreshCw className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">In progress</p>
                        <p className="text-[26px] font-black text-[var(--foreground)] leading-none mt-1">{inProgressBooks}</p>
                      </div>
                    </Card>
                    <Card className="bg-[var(--surface)] rounded-[var(--radius)] p-4 flex flex-row items-center gap-4 min-w-[200px] shadow-sm border border-[var(--border)]">
                      <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--success)]/20 text-[var(--success)] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">Completed</p>
                        <p className="text-[26px] font-black text-[var(--foreground)] leading-none mt-1">{completedBooks}</p>
                      </div>
                    </Card>
                  </div>
                </div>
                
                {/* Animated Mascot Scene */}
                <div className="absolute right-[20px] top-0 bottom-0 w-[420px] pointer-events-none flex items-center justify-center overflow-visible">
                  
                  {/* Soft radial glow behind mascot */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 280, height: 280,
                      background: 'radial-gradient(circle, oklch(73.29% 0.1941 129.82 / 0.18) 0%, transparent 70%)',
                      animation: 'pulseGlow 4s ease-in-out infinite',
                      right: 60, top: '50%', transform: 'translateY(-50%)',
                    }}
                  />

                  {/* Floating book 1 - top left */}
                  <div
                    className="absolute"
                    style={{
                      right: 280, top: 30,
                      animation: 'floatBook1 6s ease-in-out infinite',
                    }}
                  >
                    <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
                      <rect x="4" y="4" width="36" height="28" rx="3" fill="oklch(73.29% 0.1941 129.82 / 0.25)" stroke="oklch(73.29% 0.1941 129.82 / 0.5)" strokeWidth="1.5"/>
                      <path d="M22 8V28" stroke="oklch(73.29% 0.1941 129.82 / 0.4)" strokeWidth="1"/>
                      <rect x="8" y="10" width="10" height="2" rx="1" fill="oklch(73.29% 0.1941 129.82 / 0.35)"/>
                      <rect x="8" y="15" width="8" height="2" rx="1" fill="oklch(73.29% 0.1941 129.82 / 0.25)"/>
                      <rect x="26" y="10" width="10" height="2" rx="1" fill="oklch(73.29% 0.1941 129.82 / 0.35)"/>
                      <rect x="26" y="15" width="8" height="2" rx="1" fill="oklch(73.29% 0.1941 129.82 / 0.25)"/>
                    </svg>
                  </div>

                  {/* Floating book 2 - bottom right */}
                  <div
                    className="absolute"
                    style={{
                      right: 10, bottom: 40,
                      animation: 'floatBook2 7s ease-in-out infinite 1s',
                    }}
                  >
                    <svg width="38" height="30" viewBox="0 0 38 30" fill="none">
                      <rect x="3" y="3" width="32" height="24" rx="3" fill="oklch(78.19% 0.1590 51.34 / 0.2)" stroke="oklch(78.19% 0.1590 51.34 / 0.45)" strokeWidth="1.5"/>
                      <path d="M19 6V24" stroke="oklch(78.19% 0.1590 51.34 / 0.3)" strokeWidth="1"/>
                      <rect x="7" y="9" width="8" height="1.5" rx="0.75" fill="oklch(78.19% 0.1590 51.34 / 0.3)"/>
                      <rect x="7" y="13" width="6" height="1.5" rx="0.75" fill="oklch(78.19% 0.1590 51.34 / 0.2)"/>
                    </svg>
                  </div>

                  {/* Sparkle 1 - top right */}
                  <div
                    className="absolute"
                    style={{
                      right: 50, top: 25,
                      animation: 'sparkle 3s ease-in-out infinite 0.5s',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8Z" fill="oklch(78.19% 0.1590 51.34 / 0.5)"/>
                    </svg>
                  </div>

                  {/* Sparkle 2 - left side */}
                  <div
                    className="absolute"
                    style={{
                      right: 310, top: 60,
                      animation: 'sparkle 4s ease-in-out infinite 1.5s',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8Z" fill="oklch(73.29% 0.1941 129.82 / 0.45)"/>
                    </svg>
                  </div>

                  {/* Sparkle 3 - bottom left */}
                  <div
                    className="absolute"
                    style={{
                      right: 260, bottom: 50,
                      animation: 'sparkle 3.5s ease-in-out infinite 2.5s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8Z" fill="oklch(78.19% 0.1590 51.34 / 0.4)"/>
                    </svg>
                  </div>

                  {/* Leaf 1 - floating */}
                  <div
                    className="absolute"
                    style={{
                      right: 340, top: 100,
                      animation: 'leafDrift 8s ease-in-out infinite',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M17 8C8 10 5 18 5 18C5 18 13 17 17 8Z" fill="oklch(73.29% 0.1941 129.82 / 0.3)" stroke="oklch(73.29% 0.1941 129.82 / 0.45)" strokeWidth="1"/>
                      <path d="M6 17L16 9" stroke="oklch(73.29% 0.1941 129.82 / 0.3)" strokeWidth="0.8"/>
                    </svg>
                  </div>

                  {/* Leaf 2 - floating */}
                  <div
                    className="absolute"
                    style={{
                      right: 40, top: 90,
                      animation: 'leafDrift 9s ease-in-out infinite 3s',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17 8C8 10 5 18 5 18C5 18 13 17 17 8Z" fill="oklch(73.29% 0.1941 129.82 / 0.25)" stroke="oklch(73.29% 0.1941 129.82 / 0.4)" strokeWidth="1"/>
                      <path d="M6 17L16 9" stroke="oklch(73.29% 0.1941 129.82 / 0.25)" strokeWidth="0.8"/>
                    </svg>
                  </div>

                  {/* Floating dots */}
                  <div className="absolute" style={{ right: 130, top: 20, animation: 'dotFloat 5s ease-in-out infinite 0s' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(73.29% 0.1941 129.82 / 0.3)' }} />
                  </div>
                  <div className="absolute" style={{ right: 20, top: 130, animation: 'dotFloat 4s ease-in-out infinite 1.2s' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(78.19% 0.1590 51.34 / 0.35)' }} />
                  </div>
                  <div className="absolute" style={{ right: 300, bottom: 30, animation: 'dotFloat 6s ease-in-out infinite 2s' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'oklch(73.29% 0.1941 129.82 / 0.25)' }} />
                  </div>

                  {/* Mascot - gentle bobbing */}
                  <img 
                    src="/Bookcroli_mascot.svg" 
                    alt="Bookcroli Mascot" 
                    className="relative z-10 drop-shadow-lg"
                    style={{
                      width: 220,
                      height: 'auto',
                      animation: 'mascotFloat 4s ease-in-out infinite',
                      filter: 'drop-shadow(0 8px 24px oklch(73.29% 0.1941 129.82 / 0.2))',
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Continue Translating List */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[13px] font-extrabold tracking-[0.15em] text-[var(--foreground)] uppercase">Continue Translating</h2>
                <Button 
                  variant="ghost"
                  className="text-[13px] font-extrabold tracking-[0.1em] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase px-3 py-1"
                  onClick={() => setActiveTab("library")}
                >
                  View Library <ChevronDown className="w-4 h-4 ml-1 -rotate-90 stroke-[3]" />
                </Button>
              </div>
              
              {inProgressBooksList.length === 0 ? (
                <div className="bg-[var(--surface)] rounded-[var(--radius)] p-10 text-center text-[var(--muted)] border border-[var(--border)] font-medium">
                  No books in progress. Start translating from your library!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inProgressBooksList.map((book: any) => {
                    const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
                    return (
                      <Link href={`/book/${book.id}`} key={book.id} className="block w-full">
                        <Card className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 transition-all h-[210px] group shadow-sm flex-row items-center gap-5 hover:border-[var(--accent)] hover:shadow-md cursor-pointer">
                          <div className="w-[130px] h-full shrink-0 bg-[var(--background)] rounded-[var(--radius)] flex items-center justify-center border border-[var(--border)] overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-10 h-10 stroke-1 text-[var(--muted)]" />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden py-1 h-full text-left">
                            <h3 className="font-bold text-[18px] text-[var(--foreground)] leading-tight truncate">{book.title}</h3>
                            <p className="italic text-sm text-[var(--muted)] truncate mt-1">{book.author}</p>
                            <p className="text-[11px] text-[var(--muted)] mt-4 line-clamp-3 leading-[1.6] flex-1">
                              {book.plot || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."}
                            </p>
                            <div className="mt-auto pt-4">
                              <div className="flex justify-between text-[11px] font-extrabold text-[var(--foreground)] mb-2 tracking-wide">
                                <span>Progress</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="w-full h-[5px] bg-[var(--separator)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- LIBRARY TAB --- */}
        {activeTab === "library" && (
          <>
            <div className="flex justify-between items-center pb-6 border-b border-[var(--border)] mb-10">
              <div className="flex items-center gap-3">
                <Book className="w-7 h-7 text-[var(--foreground)] stroke-2" />
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Library</h1>
              </div>
              <Button 
                variant="primary"
                className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded-[var(--radius)] font-bold px-6"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add new book
              </Button>
            </div>

            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center mt-32">
                <Book className="w-16 h-16 text-[var(--muted)] mb-6 stroke-[1.5]" />
                <h2 className="text-3xl font-bold text-[var(--muted)] mb-3 tracking-tight">No book added!</h2>
                <p className="text-lg text-[var(--muted)] font-medium">Please add new book in your library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book: any) => {
                  const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
                  return (
                    <Link href={`/book/${book.id}`} key={book.id} className="block w-full h-full">
                      <Card className="group bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 transition-all relative flex flex-col gap-4 cursor-pointer h-full shadow-sm w-full hover:border-[var(--accent)] hover:shadow-md">
                        <div className="relative w-full">
                          <div className="w-full aspect-[2/3] bg-[var(--background)] rounded-[var(--radius)] flex items-center justify-center border border-[var(--border)] overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-14 h-14 stroke-1 text-[var(--muted)]" />
                            )}
                          </div>
                          <Button
                            variant="danger"
                            className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10 rounded-[var(--radius)] w-9 h-9 min-w-0 p-0 flex items-center justify-center shadow-md"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookToDelete(book.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-col gap-1 text-left w-full">
                          <p className="italic text-sm text-[var(--muted)] line-clamp-1">{book.author}</p>
                          <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight line-clamp-2">{book.title}</h3>
                        </div>
                        <div className="mt-auto w-full">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--muted)]">Progress</span>
                            <span className="font-bold text-[var(--foreground)]">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--separator)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* --- Add New Book Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)]/40 backdrop-blur-sm p-4">
          <Card className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-3xl overflow-hidden flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Add new book</h2>
                <p className="text-sm font-medium text-[var(--muted)] mt-1">Please fill book information.</p>
              </div>
              <Button variant="ghost" onClick={handleCloseModal} className="text-[var(--muted)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] w-10 h-10 min-w-0 p-0 flex items-center justify-center">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-1/3 flex flex-col">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] flex flex-col items-center justify-center text-[var(--muted)] cursor-pointer hover:bg-[var(--surface-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] p-4 text-center min-h-[240px] group"
                  >
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-[var(--radius)]" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5] text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                        <span className="text-sm font-bold text-[var(--muted)] group-hover:text-[var(--accent)]">Choose a file</span>
                        <span className="text-[10px] font-medium text-[var(--muted)] mt-1">JPEG and PNG, up to 2 MB</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <TextField className="flex flex-col gap-1.5" isRequired isInvalid={!!errors.title}>
                    <Label className="text-sm font-semibold text-[var(--foreground)]">Book name</Label>
                    <Input
                      placeholder="Enter book name" value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={`px-4 py-3 bg-[var(--field-background)] text-[var(--field-foreground)] placeholder-[var(--field-placeholder)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all font-medium border ${errors.title ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'}`}
                    />
                    <FieldError className="text-xs text-[var(--danger)]">{errors.title}</FieldError>
                  </TextField>

                  <div className="grid grid-cols-2 gap-4">
                    <TextField className="flex flex-col gap-1.5" isRequired isInvalid={!!errors.author}>
                      <Label className="text-sm font-semibold text-[var(--foreground)]">Author name</Label>
                      <Input
                        placeholder="Enter author name" value={formData.author}
                        onChange={(e) => handleInputChange("author", e.target.value)}
                        className={`px-4 py-3 bg-[var(--field-background)] text-[var(--field-foreground)] placeholder-[var(--field-placeholder)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all font-medium border ${errors.author ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'}`}
                      />
                      <FieldError className="text-xs text-[var(--danger)]">{errors.author}</FieldError>
                    </TextField>
                    <TextField className="flex flex-col gap-1.5" isRequired isInvalid={!!errors.totalPages}>
                      <Label className="text-sm font-semibold text-[var(--foreground)]">Total page</Label>
                      <Input
                        type="number" placeholder="e.g. 500" value={formData.totalPages}
                        onChange={(e) => handleInputChange("totalPages", e.target.value)}
                        className={`px-4 py-3 bg-[var(--field-background)] text-[var(--field-foreground)] placeholder-[var(--field-placeholder)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all font-medium border ${errors.totalPages ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'}`}
                      />
                      <FieldError className="text-xs text-[var(--danger)]">{errors.totalPages}</FieldError>
                    </TextField>
                  </div>

                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-[var(--foreground)]">Plot info</Label>
                    <TextArea
                      placeholder="Enter book plot or description..." rows={3} value={formData.plot}
                      onChange={(e) => handleInputChange("plot", e.target.value)}
                      className="px-4 py-3 bg-[var(--field-background)] text-[var(--field-foreground)] placeholder-[var(--field-placeholder)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all font-medium border border-[var(--field-border)] resize-none"
                    />
                  </TextField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Original language <span className="text-[var(--danger)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Original Language"
                    placeholder="Select language"
                    selectedKey={formData.originalLang}
                    onSelectionChange={(key) => handleInputChange("originalLang", key ? String(key) : "")}
                    isInvalid={!!errors.originalLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-[var(--field-radius)] bg-[var(--field-background)] hover:bg-[var(--surface-secondary)] border transition-all flex items-center justify-between ${errors.originalLang ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'}`}>
                      <Select.Value className="text-[var(--field-foreground)] font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover
                      placement="bottom"
                      shouldFlip={false}
                      className="w-(--trigger-width) bg-[var(--surface-secondary)] text-[var(--surface-secondary-foreground)] rounded-[var(--radius)] border border-[var(--border)] max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Original Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item
                            key={lang.value}
                            id={lang.value}
                            textValue={lang.label}
                            className="w-full px-3 py-2 rounded-[var(--radius)] text-[var(--foreground)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors outline-none"
                          >
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Translation language <span className="text-[var(--danger)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Translation Language"
                    placeholder="Select language"
                    selectedKey={formData.translationLang}
                    onSelectionChange={(key) => handleInputChange("translationLang", key ? String(key) : "")}
                    isInvalid={!!errors.translationLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-[var(--field-radius)] bg-[var(--field-background)] hover:bg-[var(--surface-secondary)] border transition-all flex items-center justify-between ${errors.translationLang ? 'border-[var(--danger)]' : 'border-[var(--field-border)]'}`}>
                      <Select.Value className="text-[var(--field-foreground)] font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover
                      placement="bottom"
                      shouldFlip={false}
                      className="w-(--trigger-width) bg-[var(--surface-secondary)] text-[var(--surface-secondary-foreground)] rounded-[var(--radius)] border border-[var(--border)] max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Translation Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item
                            key={lang.value}
                            id={lang.value}
                            textValue={lang.label}
                            className="w-full px-3 py-2 rounded-[var(--radius)] text-[var(--foreground)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors outline-none"
                          >
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border)]">
              <Button variant="outline" className="rounded-[var(--radius)] font-bold text-[var(--foreground)] border-[var(--border)]" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" className="rounded-[var(--radius)] font-bold bg-[var(--accent)] text-[var(--accent-foreground)]" onClick={handleConfirmAddBook}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {bookToDelete !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--overlay)]/40 backdrop-blur-sm p-4">
          <Card className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] w-full max-w-[460px] p-8 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--danger)]/15 flex items-center justify-center text-[var(--danger)]">
                <Trash2 className="w-6 h-6" />
              </div>
              <Button variant="ghost" onClick={() => setBookToDelete(null)} className="text-[var(--muted)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] w-10 h-10 min-w-0 p-0 flex items-center justify-center">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Delete book</h3>
              <p className="text-base text-[var(--muted)] font-medium leading-relaxed">Are you sure you want to delete this book? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="rounded-[var(--radius)] font-bold text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-secondary)]" onClick={() => setBookToDelete(null)}>Cancel</Button>
              <Button variant="danger" className="rounded-[var(--radius)] font-bold bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25" onClick={handleConfirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}