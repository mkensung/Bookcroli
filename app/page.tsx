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

      {/* --- Floating Navigation Bar --- */}
      <div className="pt-6 px-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm">
          <div className="flex items-center gap-2 font-extrabold text-[22px] tracking-tight text-[var(--foreground)]">
            ScriptArea
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeTab === "overview" ? "primary" : "ghost"}
              className={`rounded-[var(--radius)] px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === "overview" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--muted)] hover:bg-[var(--surface-secondary)]"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Overview
            </Button>
            <Button
              variant={activeTab === "library" ? "primary" : "ghost"}
              className={`rounded-[var(--radius)] px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === "library" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--muted)] hover:bg-[var(--surface-secondary)]"
              }`}
              onClick={() => setActiveTab("library")}
            >
              <Book className="w-4 h-4 mr-2" /> Library
            </Button>
            <Button
              variant="ghost"
              className="rounded-[var(--radius)] px-5 py-2.5 text-sm font-bold text-[var(--muted)] hover:bg-[var(--surface-secondary)] transition-all"
            >
              <Bookmark className="w-4 h-4 mr-2" /> Bookmark
            </Button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10 text-[var(--muted)]">
              <Search className="absolute left-3 w-4 h-4" />
              <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-[var(--field-background)] border border-[var(--field-border)] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]" />
            </div>
            <Button variant="outline" className="rounded-[var(--radius)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] w-10 h-10 p-0 min-w-0 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-[var(--radius)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] w-10 h-10 p-0 min-w-0 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">MK</div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Banner */}
            <Card className="bg-[var(--surface-secondary)] rounded-[var(--radius)] shadow-none border-none overflow-hidden">
              <div className="p-10 flex justify-between relative overflow-hidden flex-row">
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
                
                {/* Decorative Illustration */}
                <div className="absolute right-[-20px] top-0 bottom-0 w-[450px] opacity-100 pointer-events-none flex items-center justify-end overflow-visible">
                  <img 
                    src="/Reading glasses-bro.svg" 
                    alt="Overview Illustration" 
                    className="w-[110%] h-auto object-contain translate-y-2"
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