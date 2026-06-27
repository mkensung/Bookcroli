"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Select, ListBox, Button, TextField, Label, Input, TextArea, Card, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { 
  BookOpen, Book, LayoutGrid, Bookmark, Search, Bell, Settings, 
  ChevronLeft, Edit, Trash2, Plus, X, Eye, Image as ImageIcon, ChevronDown, Check, MoreVertical
} from "lucide-react";
import { useBooks, PageItem } from "../../context/BookContext";
import { toast } from "@heroui/react";
import { Navbar } from "../../components/Navbar";

// 🚀 เพิ่ม Array ตัวเลือกภาษาเข้ามาให้หน้านี้รู้จัก
const languages = [
  { label: "English", value: "English" },
  { label: "Thai", value: "Thai" },
  { label: "Korean", value: "Korean" },
  { label: "Japanese", value: "Japanese" },
  { label: "Chinese", value: "Chinese" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
];

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id); 
  
  const { getBookById, updateBook, deleteBook } = useBooks();
  const book = getBookById(bookId);
  
  const pages = book?.pages || [];

  const progressPercentage = book && book.totalPages > 0 
  ? Math.round((pages.length / book.totalPages) * 100) 
  : 0;

  // 🚀 เพิ่ม originalLang และ translationLang เข้ามาใน State ของฟอร์ม Edit
  const [editFormData, setEditFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    totalPages: book?.totalPages || 0,
    plot: book?.plot || "",
    coverImage: book?.coverImage || null,
    originalLang: book?.originalLang || "",
    translationLang: book?.translationLang || ""
  });

  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");

  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isDeleteBookModalOpen, setIsDeleteBookModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!book) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted)] font-medium">Book not found or loading...</div>;
  }

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditFormData({ ...editFormData, coverImage: imageUrl });
    }
  };

  // 🚀 ส่งข้อมูลภาษาที่แก้ไขแล้ว กลับไปอัปเดตที่ Context ด้วย
  const handleUpdateBook = () => {
    updateBook(bookId, {
      title: editFormData.title,
      author: editFormData.author,
      totalPages: Number(editFormData.totalPages),
      plot: editFormData.plot,
      coverImage: editFormData.coverImage,
      originalLang: editFormData.originalLang,
      translationLang: editFormData.translationLang
    });
    setIsEditBookModalOpen(false);
    toast.success("Book updated successfully!");
  };

  // 🚀 ตอนเปิด Modal ให้ดึงค่าภาษาเดิมมาใส่ในฟอร์มด้วย
  const handleOpenEditModal = () => {
    setEditFormData({
      title: book.title, author: book.author, totalPages: book.totalPages,
      plot: book.plot, coverImage: book.coverImage,
      originalLang: book.originalLang, translationLang: book.translationLang
    });
    setIsEditBookModalOpen(true);
  };

  const handleConfirmDeleteBook = () => {
     deleteBook(bookId);
     toast.success("Book deleted successfully!");
     router.push("/");
  };

  const handleSaveNewPage = () => {
    if (newPageTitle.trim() !== "") {
      const newPage: PageItem = { 
        id: Date.now().toString(), 
        title: newPageTitle, 
        originalText: "", 
        translatedText: "" 
      };
      updateBook(bookId, { pages: [...pages, newPage] });
    }
    setIsAddingPage(false);
    setNewPageTitle("");
  };

  const handleKeyDownNew = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveNewPage();
    if (e.key === 'Escape') { setIsAddingPage(false); setNewPageTitle(""); }
  };

  const startEditing = (page: PageItem) => {
    setEditingPageId(page.id);
    setEditPageTitle(page.title);
  };

  const handleSaveEdit = () => {
    if (editPageTitle.trim() !== "") {
      const updatedPages = pages.map(p => p.id === editingPageId ? { ...p, title: editPageTitle } : p);
      updateBook(bookId, { pages: updatedPages });
    }
    setEditingPageId(null);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingPageId(null);
  };

  const cancelEditing = () => {
    setEditingPageId(null);
  };

  const handleConfirmDeletePage = () => {
    if (pageToDelete) {
      const updatedPages = pages.filter(p => p.id !== pageToDelete);
      updateBook(bookId, { pages: updatedPages });
      setPageToDelete(null);
      toast.success("Page deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-20">
      <Navbar activeTab="library" />

      <main className="max-w-[1000px] mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <Link href="/?tab=library" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"><ChevronLeft className="w-5 h-5" /> Back to Library</Link>
          <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
            <Button 
              isIconOnly 
              variant="ghost" 
              className="text-[var(--foreground)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] border-none bg-transparent"
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-lg overflow-hidden z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setIsMenuOpen(false); handleOpenEditModal(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors text-left"
                >
                  <Edit className="w-4 h-4" /> Edit book
                </button>
                <button 
                  onClick={() => { setIsMenuOpen(false); setIsDeleteBookModalOpen(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] p-6  mb-12 flex flex-col md:flex-row gap-8 relative">
          <div className="w-full md:w-[240px] shrink-0">
            <div className="w-full aspect-[2/3] bg-[var(--background)] rounded-[var(--radius)] flex items-center justify-center border border-[var(--border)] overflow-hidden relative">
              {book.coverImage ? <img src={book.coverImage} alt="Cover" className="w-full h-full object-cover" /> : <BookOpen className="w-16 h-16 stroke-[1.5] text-[var(--muted)]" />}
            </div>
          </div>

          <div className="flex flex-col flex-1 py-2">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-[40px] font-bold text-[var(--foreground)] mb-1 leading-tight tracking-tight break-words">{book.title}</h1>
              <p className="text-lg sm:text-xl text-[var(--muted)] italic font-medium">{book.author}</p>
            </div>
            
            <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-3xl font-medium">{book.plot}</p>

            <div className="flex gap-16 mb-auto">
              <div><p className="text-sm font-bold text-[var(--muted)] mb-1">Original language</p><p className="font-bold text-[var(--foreground)] text-lg">{book.originalLang}</p></div>
              <div><p className="text-sm font-bold text-[var(--muted)] mb-1">Translate language</p><p className="font-bold text-[var(--foreground)] text-lg">{book.translationLang}</p></div>
            </div>

            <div className="mt-10 pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-[var(--foreground)]">{pages.length}/{book.totalPages} Pages</span>
                <span className="text-xs font-bold text-[var(--foreground)]">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--separator)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {(pages.length > 0 || isAddingPage) && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Table of Contents</h2>
              <Button onPress={() => setIsAddingPage(true)} className="rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] font-bold px-6"><Plus className="w-4 h-4 stroke-[2.5]" /> Add page</Button>
            </div>
          )}

          {pages.length === 0 && !isAddingPage ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] shadow-sm rounded-[var(--radius)] flex flex-col items-center justify-center py-20 text-center ">
              <div className="w-20 h-20 bg-[var(--background)] rounded-[var(--radius)] flex items-center justify-center text-[var(--muted)] mb-6 -rotate-6"><X className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No page added!</h3>
              <p className="text-[var(--muted)] font-medium mb-8">You can add a new page in your book.</p>
              <Button onPress={() => setIsAddingPage(true)} className="rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] font-bold px-6"><Plus className="w-4 h-4 stroke-2" /> Add page</Button>
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-sm border border-[var(--border)] overflow-hidden  mb-20">
              <div className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 bg-transparent border-b border-[var(--border)] text-sm font-bold text-[var(--muted)]">
                <div className="text-center">No.</div><div>Name</div><div></div>
              </div>

              <div className="flex flex-col">
                {pages.map((page, index) => (
                  <div key={page.id} className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 border-b border-[var(--border)] group items-center">
                    <div className="text-center font-bold text-[var(--muted)]"><div className="w-6 h-6 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto text-xs">{index + 1}</div></div>

                    {editingPageId === page.id ? (
                      <div>
                        <input autoFocus type="text" value={editPageTitle} onChange={(e) => setEditPageTitle(e.target.value)} onKeyDown={handleKeyDownEdit} className="w-full px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-transparent text-sm font-bold text-[var(--foreground)] transition-all"/>
                      </div>
                    ) : (
                      <div className="font-bold text-[var(--foreground)]">{page.title}</div>
                    )}
                    
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingPageId === page.id ? (
                        <>
                          <Button isIconOnly variant="outline" onPress={handleSaveEdit} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--success)] hover:bg-[var(--success)]/10 hover:border-[var(--success)]/30 hover:!text-[var(--success)]"><Check className="w-4 h-4" /></Button>
                          <Button isIconOnly variant="outline" onPress={cancelEditing} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"><X className="w-4 h-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button isIconOnly variant="outline" onPress={() => router.push(`/book/${book.id}/page/${page.id}`)} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"><Eye className="w-4 h-4" /></Button>
                          <Button isIconOnly variant="outline" onPress={() => startEditing(page)} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"><Edit className="w-4 h-4" /></Button>
                        </>
                      )}
                      <Button isIconOnly variant="outline" onPress={() => setPageToDelete(page.id)} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--danger)]/15 hover:border-[var(--danger)]/30 hover:!text-[var(--danger)]"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}

                {isAddingPage && (
                  <div className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 border-b border-[var(--focus)] bg-[var(--surface)] items-center">
                    <div className="text-center font-bold text-[var(--muted)]"><div className="w-6 h-6 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] flex items-center justify-center mx-auto text-xs">{pages.length + 1}</div></div>
                    <div>
                      <input autoFocus type="text" placeholder="Enter the content" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} onKeyDown={handleKeyDownNew} className="w-full px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--focus)] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-transparent text-sm font-bold text-[var(--foreground)] transition-all placeholder:font-medium placeholder-[var(--muted)]"/>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button isIconOnly variant="outline" onPress={handleSaveNewPage} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--success)] hover:bg-[var(--success)]/10 hover:border-[var(--success)]/30 hover:!text-[var(--success)]"><Check className="w-4 h-4" /></Button>
                      <Button isIconOnly variant="outline" onPress={() => { setIsAddingPage(false); setNewPageTitle(""); }} className="rounded-[var(--radius)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Edit Modal --- */}
      {isEditBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl w-full max-w-3xl  p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div><h2 className="text-2xl font-bold text-[var(--foreground)]">Edit book details</h2><p className="text-sm text-[var(--muted)] mt-1">Update book details and languages.</p></div>
              <button onClick={() => setIsEditBookModalOpen(false)} className="p-2 text-[var(--muted)] hover:bg-[var(--surface)] rounded-full transition-colors bg-[var(--surface)]"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-1/3 flex flex-col">
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 w-full bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] flex flex-col items-center justify-center text-[var(--muted)] cursor-pointer hover:bg-[var(--surface-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all p-4 text-center min-h-[240px] relative overflow-hidden group">
                    {editFormData.coverImage ? <img src={editFormData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-[var(--radius)]" /> : <><ImageIcon className="w-10 h-10 mb-2 stroke-[1.5] text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" /><span className="text-sm font-bold text-[var(--muted)] group-hover:text-[var(--accent)]">Choose a file</span><span className="text-[10px] font-medium text-[var(--muted)] mt-1">JPEG and PNG, up to 2 MB</span></>}
                    <input type="file" ref={fileInputRef} onChange={handleEditImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <TextField className="flex flex-col gap-1.5" isRequired>
                    <Label className="text-sm font-semibold text-[var(--foreground)]">Book name</Label>
                    <Input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="px-4 py-3 bg-[var(--surface)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] font-medium border border-[var(--border)] transition-all text-[var(--foreground)]" />
                  </TextField>
                  <div className="grid grid-cols-2 gap-4">
                    <TextField className="flex flex-col gap-1.5" isRequired>
                      <Label className="text-sm font-semibold text-[var(--foreground)]">Author name</Label>
                      <Input type="text" value={editFormData.author} onChange={e => setEditFormData({...editFormData, author: e.target.value})} className="px-4 py-3 bg-[var(--surface)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] font-medium border border-[var(--border)] transition-all text-[var(--foreground)]" />
                    </TextField>
                    <TextField className="flex flex-col gap-1.5" isRequired>
                      <Label className="text-sm font-semibold text-[var(--foreground)]">Total page</Label>
                      <Input type="number" value={editFormData.totalPages.toString()} onChange={e => setEditFormData({...editFormData, totalPages: Number(e.target.value)})} className="px-4 py-3 bg-[var(--surface)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] font-medium border border-[var(--border)] transition-all text-[var(--foreground)]" />
                    </TextField>
                  </div>
                  <TextField className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-[var(--foreground)]">Plot info</Label>
                    <TextArea rows={3} value={editFormData.plot} onChange={e => setEditFormData({...editFormData, plot: e.target.value})} className="px-4 py-3 bg-[var(--surface)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] font-medium border border-[var(--border)] resize-none transition-all text-[var(--foreground)]" />
                  </TextField>
                </div>
              </div>
              
              {/* 🚀 แทนที่ Select เก่าด้วยโครงสร้างแบบ HeroUI v3 แท้ๆ (ดึงมาจากหน้า Home) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. Original Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Original language <span className="text-[var(--danger)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Original Language"
                    placeholder="Select language"
                    selectedKey={editFormData.originalLang}
                    onSelectionChange={(key) => setEditFormData({...editFormData, originalLang: key ? String(key) : ""})}
                  >
                    <Select.Trigger className="w-full min-h-[48px] px-4 rounded-[var(--field-radius)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]  border border-[var(--border)] transition-all flex items-center justify-between">
                      <Select.Value className="text-[var(--foreground)] font-medium text-left" />
                      <Select.Indicator><ChevronDown className="w-4 h-4 text-[var(--muted)]" /></Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover placement="bottom" shouldFlip={false} className="w-(--trigger-width) bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-[var(--radius)]  border border-[var(--border)] max-h-[140px] overflow-y-auto overflow-x-hidden">
                      <ListBox items={languages} aria-label="Original Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item key={lang.value} id={lang.value} textValue={lang.label} className="w-full px-3 py-2 rounded-[var(--radius)] text-[var(--foreground)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors outline-none">
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* 2. Translation Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Translation language <span className="text-[var(--danger)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Translation Language"
                    placeholder="Select language"
                    selectedKey={editFormData.translationLang}
                    onSelectionChange={(key) => setEditFormData({...editFormData, translationLang: key ? String(key) : ""})}
                  >
                    <Select.Trigger className="w-full min-h-[48px] px-4 rounded-[var(--field-radius)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]  border border-[var(--border)] transition-all flex items-center justify-between">
                      <Select.Value className="text-[var(--foreground)] font-medium text-left" />
                      <Select.Indicator><ChevronDown className="w-4 h-4 text-[var(--muted)]" /></Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover placement="bottom" shouldFlip={false} className="w-(--trigger-width) bg-[var(--surface-secondary)] text-[var(--foreground)] rounded-[var(--radius)]  border border-[var(--border)] max-h-[140px] overflow-y-auto overflow-x-hidden">
                      <ListBox items={languages} aria-label="Translation Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item key={lang.value} id={lang.value} textValue={lang.label} className="w-full px-3 py-2 rounded-[var(--radius)] text-[var(--foreground)] font-medium cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors outline-none">
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border)]"><button onClick={() => setIsEditBookModalOpen(false)} className="px-8 py-2.5 rounded-[var(--radius)] font-bold text-[var(--foreground)] hover:bg-[var(--surface)] bg-transparent border border-[var(--border)]  transition-all">Cancel</button><button onClick={handleUpdateBook} className="px-10 py-2.5 rounded-[var(--radius)] font-bold bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90  transition-all">Update</button></div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteBookModalOpen && (
         <div className="fixed inset-0 z-60 flex items-center justify-center bg-[var(--foreground)]/40 backdrop-blur-sm p-4">
           <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-[var(--radius)] w-full max-w-[460px]  p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--danger)]/15 flex items-center justify-center text-[var(--danger)]"><Trash2 className="w-6 h-6" /></div><button onClick={() => setIsDeleteBookModalOpen(false)} className="p-2 text-[var(--muted)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] bg-[var(--surface)] transition-colors"><X className="w-5 h-5" /></button></div>
             <div className="mb-8"><h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Delete book</h3><p className="text-base text-[var(--muted)] font-medium leading-relaxed">Are you sure you want to delete this book? This action cannot be undone.</p></div>
             <div className="flex justify-end gap-3"><button onClick={() => setIsDeleteBookModalOpen(false)} className="px-8 py-2.5 rounded-[var(--radius)] font-bold text-[var(--foreground)] bg-transparent border border-[var(--border)] hover:bg-[var(--surface-secondary)]  transition-all">Cancel</button><button onClick={handleConfirmDeleteBook} className="px-10 py-2.5 rounded-[var(--radius)] font-bold text-[var(--danger)] bg-[var(--danger)]/15 hover:bg-[var(--danger)]/25 transition-all">Delete</button></div>
           </div>
         </div>
      )}

      {pageToDelete !== null && (
         <div className="fixed inset-0 z-60 flex items-center justify-center bg-[var(--foreground)]/40 backdrop-blur-sm p-4">
           <div className="bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-[var(--radius)] w-full max-w-[460px]  p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--danger)]/15 flex items-center justify-center text-[var(--danger)]"><Trash2 className="w-6 h-6" /></div><button onClick={() => setPageToDelete(null)} className="p-2 text-[var(--muted)] hover:bg-[var(--surface-secondary)] rounded-[var(--radius)] bg-[var(--surface)] transition-colors"><X className="w-5 h-5" /></button></div>
             <div className="mb-8"><h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Delete page</h3><p className="text-base text-[var(--muted)] font-medium leading-relaxed">Are you sure you want to delete this page? This action cannot be undone.</p></div>
             <div className="flex justify-end gap-3"><button onClick={() => setPageToDelete(null)} className="px-8 py-2.5 rounded-[var(--radius)] font-bold text-[var(--foreground)] bg-transparent border border-[var(--border)] hover:bg-[var(--surface-secondary)]  transition-all">Cancel</button><button onClick={handleConfirmDeletePage} className="px-10 py-2.5 rounded-[var(--radius)] font-bold text-[var(--danger)] bg-[var(--danger)]/15 hover:bg-[var(--danger)]/25 transition-all">Delete</button></div>
           </div>
         </div>
      )}
    </div>
  );
}