"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Select, ListBox } from "@heroui/react";
import {
  BookOpen, Book, LayoutGrid, Bookmark, Search,
  Bell, Settings, Plus, Image as ImageIcon, X, Trash2, ChevronDown,
  RefreshCw, CheckCircle2
} from "lucide-react";
import { useBooks } from "./context/BookContext";
import { toast } from "@heroui/react";

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

  const [activeTab, setActiveTab] = useState<"overview" | "library">("overview");
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
      toast.danger("Please fill in all required fields.");
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

    toast.success("Book added successfully!");
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (bookToDelete !== null) {
      deleteBook(bookToDelete);
      toast.success("Book deleted successfully!");
      setBookToDelete(null);
    }
  };

  const totalBooks = books.length;
  const completedBooks = books.filter((b: any) => b.totalPages > 0 && b.translatedPages >= b.totalPages).length;
  const inProgressBooks = totalBooks - completedBooks;
  const inProgressBooksList = books.filter((b: any) => b.totalPages === 0 || b.translatedPages < b.totalPages);

  return (
    <div className="min-h-screen bg-[var(--bg-surface-primary)] text-[var(--text-normal)] font-sans pb-20">

      {/* --- Floating Navigation Bar --- */}
      <div className="pt-6 px-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-6 py-3 bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] shadow-sm">
          <div className="flex items-center gap-2 font-extrabold text-[22px] tracking-tight text-[var(--text-normal)]">
            ScriptArea
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all rounded-full ${
                activeTab === "overview" ? "bg-[var(--color-primary-default)] text-[var(--text-normal)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all rounded-full ${
                activeTab === "library" ? "bg-[var(--color-primary-default)] text-[var(--text-normal)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)]"
              }`}
            >
              <Book className="w-4 h-4" /> Library
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-all">
              <Bookmark className="w-4 h-4" /> Bookmark
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10 text-[var(--text-light)]">
              <Search className="absolute left-3 w-4 h-4" />
              <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-transparent border border-[var(--border-outline-light)] rounded-full outline-none focus:border-[var(--border-outline-darker)] transition-all text-[var(--text-normal)] placeholder-[var(--text-light)]" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-[var(--border-outline-light)] rounded-full bg-transparent hover:bg-[#FFF5E1] transition-colors text-[var(--text-normal)]"><Bell className="w-4 h-4" /></button>
            <button className="w-10 h-10 flex items-center justify-center border border-[var(--border-outline-light)] rounded-full bg-transparent hover:bg-[#FFF5E1] transition-colors text-[var(--text-normal)]"><Settings className="w-4 h-4" /></button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary-default)] text-[var(--text-normal)] text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">MK</div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-10">
            {/* Banner */}
            <div className="bg-[var(--color-primary-surface)] rounded-[32px] p-10 flex justify-between relative overflow-hidden shadow-sm">
              <div className="relative z-10 flex flex-col justify-center">
                <h1 className="text-[34px] font-extrabold text-[var(--text-normal)] tracking-tight">Welcome back, Mean!</h1>
                <p className="text-[17px] text-[var(--text-secondary)] mt-2 font-medium">You have {inProgressBooks} books in translation progress.</p>
                
                <div className="flex gap-4 mt-8">
                  <div className="bg-[var(--bg-surface-light)] rounded-2xl p-4 flex items-center gap-4 min-w-[200px] shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#E8F2FB] text-[#3B82F6] flex items-center justify-center shrink-0">
                      <Book className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--text-light)] uppercase">Total books</p>
                      <p className="text-[26px] font-black text-[var(--text-normal)] leading-none mt-1">{totalBooks}</p>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface-light)] rounded-2xl p-4 flex items-center gap-4 min-w-[200px] shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#FDEFE3] text-[#F97316] flex items-center justify-center shrink-0">
                      <RefreshCw className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--text-light)] uppercase">In progress</p>
                      <p className="text-[26px] font-black text-[var(--text-normal)] leading-none mt-1">{inProgressBooks}</p>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface-light)] rounded-2xl p-4 flex items-center gap-4 min-w-[200px] shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF5EC] text-[#22C55E] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--text-light)] uppercase">Completed</p>
                      <p className="text-[26px] font-black text-[var(--text-normal)] leading-none mt-1">{completedBooks}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Illustration (Image based on the provided design) */}
              <div className="absolute right-[-20px] top-0 bottom-0 w-[450px] opacity-100 pointer-events-none flex items-center justify-end overflow-visible">
                <img 
                  src="/Reading glasses-bro.svg" 
                  alt="Overview Illustration" 
                  className="w-[110%] h-auto object-contain translate-y-2"
                />
              </div>
            </div>

            {/* Continue Translating List */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[13px] font-extrabold tracking-[0.15em] text-[var(--text-normal)] uppercase">Continue Translating</h2>
                <button 
                  onClick={() => setActiveTab("library")}
                  className="text-[13px] font-extrabold tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--text-normal)] transition-colors uppercase flex items-center"
                >
                  View Library <ChevronDown className="w-4 h-4 ml-1 -rotate-90 stroke-[3]" />
                </button>
              </div>
              
              {inProgressBooksList.length === 0 ? (
                <div className="bg-[var(--bg-surface-light)] rounded-2xl p-10 text-center text-[var(--text-secondary)] shadow-sm border border-[var(--border-outline-light)] font-medium">
                  No books in progress. Start translating from your library!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inProgressBooksList.map((book: any) => {
                    const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
                    return (
                      <Link href={`/book/${book.id}`} key={book.id} className="block w-full">
                        <div className="bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex gap-5 h-[210px] group cursor-pointer">
                          <div className="w-[130px] h-full shrink-0 bg-[var(--bg-surface-primary)] rounded-[16px] flex items-center justify-center border border-[var(--border-outline-light)] overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-10 h-10 stroke-1 text-[var(--text-light)]" />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden py-1">
                            <h3 className="font-bold text-[18px] text-[var(--text-normal)] leading-tight truncate">{book.title}</h3>
                            <p className="italic text-sm text-[var(--text-secondary)] truncate mt-1">{book.author}</p>
                            <p className="text-[11px] text-[var(--text-dark-gray)] mt-4 line-clamp-3 leading-[1.6] flex-1">
                              {book.plot || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."}
                            </p>
                            <div className="mt-auto pt-4">
                              <div className="flex justify-between text-[11px] font-extrabold text-[var(--text-normal)] mb-2 tracking-wide">
                                <span>Progress</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="w-full h-[5px] bg-[var(--border-outline-default)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--color-primary-default)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
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
            <div className="flex justify-between items-center pb-6 border-b border-[var(--border-outline-default)] mb-10">
              <div className="flex items-center gap-3">
                <Book className="w-7 h-7 text-[var(--text-normal)] stroke-2" />
                <h1 className="text-2xl font-bold text-[var(--text-normal)]">Library</h1>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-hover)] text-[var(--text-normal)] rounded-full font-bold px-6 py-2.5 flex items-center gap-2 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add new book
              </button>
            </div>

            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center mt-32">
                <Book className="w-16 h-16 text-[var(--text-light)] mb-6 stroke-[1.5]" />
                <h2 className="text-3xl font-bold text-[var(--text-light)] mb-3 tracking-tight">No book added!</h2>
                <p className="text-lg text-[var(--text-light)] font-medium">Please add new book in your library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book: any) => {
                  const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
                  return (
                    <Link href={`/book/${book.id}`} key={book.id} className="block w-full">
                      <div className="group bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col gap-4 cursor-pointer h-full">
                        <div className="relative">
                          <div className="w-full aspect-2/3 bg-[var(--bg-surface-primary)] rounded-xl flex items-center justify-center border border-[var(--border-outline-light)] overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-14 h-14 stroke-1 text-[var(--text-light)]" />
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookToDelete(book.id); }}
                            className="absolute -top-3 -right-3 w-11 h-11 bg-[var(--status-error-default)] hover:bg-[var(--status-error-hover)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="italic text-sm text-[var(--text-secondary)] line-clamp-1">{book.author}</p>
                          <h3 className="font-bold text-lg text-[var(--text-normal)] leading-tight line-clamp-2">{book.title}</h3>
                        </div>
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-[var(--text-secondary)]">Progress</span>
                            <span className="font-bold text-[var(--text-normal)]">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--border-outline-default)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-primary-default)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface-light)] rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-normal)]">Add new book</h2>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">Please fill book information.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-[var(--text-light)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-colors bg-[var(--bg-surface-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-1/3 flex flex-col">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full bg-[var(--bg-surface-primary)] border-2 border-dashed border-[var(--border-outline-light)] rounded-2xl flex flex-col items-center justify-center text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-surface-light)] transition-all hover:border-[var(--color-primary-default)] hover:text-[var(--color-primary-default)] p-4 text-center min-h-[240px] group"
                  >
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5] text-[var(--text-light)] group-hover:text-[var(--color-primary-default)] transition-colors" />
                        <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--color-primary-default)]">Choose a file</span>
                        <span className="text-[10px] font-medium text-[var(--text-light)] mt-1">JPEG and PNG, up to 2 MB</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-normal)]">Book name <span className="text-[var(--status-error-default)]">*</span></label>
                    <input
                      type="text" placeholder="Enter book name" value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                      className={`px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] transition-all font-medium border ${errors.title ? 'border-[var(--status-error-default)]' : 'border-[var(--border-outline-light)]'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--text-normal)]">Author name <span className="text-[var(--status-error-default)]">*</span></label>
                      <input
                        type="text" placeholder="Enter author name" value={formData.author}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("author", e.target.value)}
                        className={`px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border transition-all ${errors.author ? 'border-[var(--status-error-default)]' : 'border-[var(--border-outline-light)]'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--text-normal)]">Total page <span className="text-[var(--status-error-default)]">*</span></label>
                      <input
                        type="number" placeholder="e.g. 500" value={formData.totalPages}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("totalPages", e.target.value)}
                        className={`px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border transition-all ${errors.totalPages ? 'border-[var(--status-error-default)]' : 'border-[var(--border-outline-light)]'}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-normal)]">Plot info</label>
                    <textarea
                      placeholder="Enter book plot or description..." rows={3} value={formData.plot}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("plot", e.target.value)}
                      className="px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] transition-all font-medium border border-[var(--border-outline-light)] resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--text-normal)]">Original language <span className="text-[var(--status-error-default)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Original Language"
                    placeholder="Select language"
                    selectedKey={formData.originalLang}
                    onSelectionChange={(key) => handleInputChange("originalLang", key ? String(key) : "")}
                    isInvalid={!!errors.originalLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-xl bg-[var(--bg-surface-primary)] hover:bg-[var(--bg-surface-light)] shadow-none border transition-all flex items-center justify-between ${errors.originalLang ? 'border-[var(--status-error-default)]' : 'border-[var(--border-outline-light)]'}`}>
                      <Select.Value className="text-[var(--text-normal)] font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-[var(--text-light)]" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover
                      placement="bottom"
                      shouldFlip={false}
                      className="w-(--trigger-width) bg-[var(--bg-surface-light)] text-[var(--text-normal)] rounded-xl shadow-xl border border-[var(--border-outline-light)] max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Original Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item
                            key={lang.value}
                            id={lang.value}
                            textValue={lang.label}
                            className="w-full px-3 py-2 rounded-lg text-[var(--text-normal)] font-medium cursor-pointer hover:bg-[var(--color-primary-hover)] hover:text-[var(--text-normal)] transition-colors outline-none"
                          >
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--text-normal)]">Translation language <span className="text-[var(--status-error-default)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Translation Language"
                    placeholder="Select language"
                    selectedKey={formData.translationLang}
                    onSelectionChange={(key) => handleInputChange("translationLang", key ? String(key) : "")}
                    isInvalid={!!errors.translationLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-xl bg-[var(--bg-surface-primary)] hover:bg-[var(--bg-surface-light)] shadow-none border transition-all flex items-center justify-between ${errors.translationLang ? 'border-[var(--status-error-default)]' : 'border-[var(--border-outline-light)]'}`}>
                      <Select.Value className="text-[var(--text-normal)] font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-[var(--text-light)]" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover
                      placement="bottom"
                      shouldFlip={false}
                      className="w-(--trigger-width) bg-[var(--bg-surface-light)] text-[var(--text-normal)] rounded-xl shadow-xl border border-[var(--border-outline-light)] max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Translation Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item
                            key={lang.value}
                            id={lang.value}
                            textValue={lang.label}
                            className="w-full px-3 py-2 rounded-lg text-[var(--text-normal)] font-medium cursor-pointer hover:bg-[var(--color-primary-hover)] hover:text-[var(--text-normal)] transition-colors outline-none"
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

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border-outline-default)]">
              <button onClick={handleCloseModal} className="px-8 py-2.5 rounded-full font-bold text-[var(--text-normal)] hover:bg-[var(--bg-surface-primary)] transition-all bg-transparent border border-[var(--border-outline-light)] shadow-sm">Cancel</button>
              <button onClick={handleConfirmAddBook} className="px-10 py-2.5 rounded-full font-bold bg-[var(--color-primary-default)] text-[var(--text-normal)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {bookToDelete !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface-light)] rounded-[32px] w-full max-w-[460px] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--status-error-surface)] flex items-center justify-center text-[var(--status-error-default)]">
                <Trash2 className="w-6 h-6" />
              </div>
              <button onClick={() => setBookToDelete(null)} className="p-2 text-[var(--text-light)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-colors bg-[var(--bg-surface-primary)]"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-[var(--text-normal)] mb-2">Delete book</h3>
              <p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">Are you sure you want to delete this book? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBookToDelete(null)} className="px-8 py-2.5 rounded-full font-bold text-[var(--text-normal)] bg-transparent border border-[var(--border-outline-light)] hover:bg-[var(--bg-surface-primary)] shadow-sm transition-all">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-10 py-2.5 rounded-full font-bold text-white bg-[var(--status-error-default)] hover:bg-[var(--status-error-hover)] shadow-sm transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}