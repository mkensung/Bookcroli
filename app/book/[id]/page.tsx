"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// 🚀 อัปเดต Import ใช้ Select และ ListBox ตามแบบ HeroUI v3 แท้
import { Select, ListBox } from "@heroui/react";
import { 
  BookOpen, Book, LayoutGrid, Bookmark, Search, Bell, Settings, 
  ChevronLeft, Edit, Trash2, Plus, X, Eye, Image as ImageIcon, ChevronDown
} from "lucide-react";
import { useBooks, PageItem } from "../../context/BookContext";
import { toast } from "@heroui/react";

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
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!book) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)] font-medium">Book not found or loading...</div>;
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

  const handleConfirmDeletePage = () => {
    if (pageToDelete) {
      const updatedPages = pages.filter(p => p.id !== pageToDelete);
      updateBook(bookId, { pages: updatedPages });
      setPageToDelete(null);
      toast.success("Page deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-surface-primary)] text-[var(--text-normal)] font-sans pb-20">
      <div className="pt-6 px-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-6 py-3 bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] ">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-[22px] tracking-tight text-[var(--text-normal)] hover:opacity-80 transition-opacity">
            ScriptArea
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-all"><LayoutGrid className="w-4 h-4" /> Overview</Link>
            <Link href="/" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--text-normal)] bg-[var(--color-primary-default)] rounded-full transition-all"><Book className="w-4 h-4" /> Library</Link>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-all"><Bookmark className="w-4 h-4" /> Bookmark</button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10 text-[var(--text-light)]">
              <Search className="absolute left-3 w-4 h-4" />
              <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-transparent border border-[var(--border-outline-light)] rounded-full outline-none focus:border-[var(--border-outline-darker)] transition-all text-[var(--text-normal)] placeholder-[var(--text-light)]" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-[var(--border-outline-light)] rounded-full bg-transparent hover:bg-[var(--bg-surface-light)] transition-colors text-[var(--text-normal)]"><Bell className="w-4 h-4" /></button>
            <button className="w-10 h-10 flex items-center justify-center border border-[var(--border-outline-light)] rounded-full bg-transparent hover:bg-[var(--bg-surface-light)] transition-colors text-[var(--text-normal)]"><Settings className="w-4 h-4" /></button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary-default)] text-[var(--text-normal)] text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">MK</div>
          </div>
        </header>
      </div>

      <main className="max-w-[1000px] mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-normal)] font-medium transition-colors"><ChevronLeft className="w-5 h-5" /> Back to Library</Link>
        </div>

        <div className="bg-[var(--bg-surface-light)] rounded-[32px] border border-[var(--border-outline-light)] p-6  mb-12 flex flex-col md:flex-row gap-8 relative">
          <div className="absolute top-6 right-6 flex items-center gap-1">
            <button onClick={handleOpenEditModal} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-[var(--text-normal)] hover:bg-[var(--bg-surface-light)] rounded-full transition-colors border border-[var(--border-outline-light)] bg-transparent"><Edit className="w-4 h-4" /> Edit book</button>
            <button onClick={() => setIsDeleteBookModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-[var(--text-normal)] hover:bg-[var(--bg-surface-light)] rounded-full transition-colors border border-[var(--border-outline-light)] bg-transparent"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>

          <div className="w-full md:w-[240px] shrink-0">
            <div className="w-full aspect-2/3 bg-[var(--bg-surface-primary)] rounded-[20px] flex items-center justify-center border border-[var(--border-outline-light)] overflow-hidden  relative">
              {book.coverImage ? <img src={book.coverImage} alt="Cover" className="w-full h-full object-cover" /> : <BookOpen className="w-16 h-16 stroke-[1.5] text-[var(--text-light)]" />}
            </div>
          </div>

          <div className="flex flex-col flex-1 py-2 pr-12">
            <h1 className="text-[40px] font-bold text-[var(--text-normal)] mb-1 leading-tight tracking-tight">{book.title}</h1>
            <p className="text-xl text-[var(--text-secondary)] italic font-medium mb-6">{book.author}</p>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl font-medium">{book.plot}</p>

            <div className="flex gap-16 mb-auto">
              <div><p className="text-sm font-bold text-[var(--text-light)] mb-1">Original language</p><p className="font-bold text-[var(--text-normal)] text-lg">{book.originalLang}</p></div>
              <div><p className="text-sm font-bold text-[var(--text-light)] mb-1">Translate language</p><p className="font-bold text-[var(--text-normal)] text-lg">{book.translationLang}</p></div>
            </div>

            <div className="mt-10 pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-[var(--text-normal)]">{pages.length}/{book.totalPages} Pages</span>
                <span className="text-xs font-bold text-[var(--text-normal)]">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--border-outline-default)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary-default)] rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {(pages.length > 0 || isAddingPage) && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-normal)]">Table of Contents</h2>
              <button onClick={() => setIsAddingPage(true)} className="bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-hover)] text-[var(--text-normal)] rounded-full font-bold px-6 py-2.5 flex items-center gap-2 transition-colors  text-sm"><Plus className="w-4 h-4 stroke-[2.5]" /> Add page</button>
            </div>
          )}

          {pages.length === 0 && !isAddingPage ? (
            <div className="bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] flex flex-col items-center justify-center py-20 text-center ">
              <div className="w-20 h-20 bg-[var(--bg-surface-primary)] rounded-[24px] flex items-center justify-center text-[var(--text-light)] mb-6 -rotate-6"><X className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-[var(--text-normal)] mb-2">No page added!</h3>
              <p className="text-[var(--text-secondary)] font-medium mb-8">You can add a new page in your book.</p>
              <button onClick={() => setIsAddingPage(true)} className="bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-hover)] text-[var(--text-normal)] rounded-full font-bold px-6 py-2.5 flex items-center gap-2 transition-colors  text-sm"><Plus className="w-4 h-4 stroke-2" /> Add page</button>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface-light)] rounded-[24px] border border-[var(--border-outline-light)] overflow-hidden  mb-20">
              <div className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 bg-[var(--bg-surface-primary)] border-b border-[var(--border-outline-light)] text-sm font-bold text-[var(--text-light)]">
                <div className="text-center">No.</div><div>Name</div><div></div>
              </div>

              <div className="flex flex-col">
                {pages.map((page, index) => (
                  <div key={page.id} className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 border-b border-[var(--border-outline-light)] group items-center">
                    <div className="text-center font-bold text-[var(--text-light)]"><div className="w-6 h-6 rounded-md bg-[var(--bg-surface-primary)] border border-[var(--border-outline-light)] flex items-center justify-center mx-auto text-xs">{index + 1}</div></div>

                    {editingPageId === page.id ? (
                      <div>
                        <input autoFocus type="text" value={editPageTitle} onChange={(e) => setEditPageTitle(e.target.value)} onKeyDown={handleKeyDownEdit} onBlur={handleSaveEdit} className="w-full px-4 py-2 bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-xl outline-none focus:border-[var(--border-outline-darker)] focus:ring-1 focus:ring-transparent text-sm font-bold text-[var(--text-normal)] transition-all"/>
                      </div>
                    ) : (
                      <div className="font-bold text-[var(--text-normal)]">{page.title}</div>
                    )}
                    
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingPageId !== page.id && (
                        <>
                          <Link href={`/book/${book.id}/page/${page.id}`} className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--text-normal)] hover:bg-[var(--bg-surface-light)] rounded-full transition-colors cursor-pointer"><Eye className="w-4 h-4" /></Link>
                          <button onClick={() => startEditing(page)} className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--text-normal)] hover:bg-[var(--bg-surface-light)] rounded-full transition-colors"><Edit className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => setPageToDelete(page.id)} className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--text-normal)] hover:bg-[var(--status-error-hover)] hover:border-[var(--status-error-default)] hover:text-[var(--status-error-default)] rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}

                {isAddingPage && (
                  <div className="grid grid-cols-[80px_1fr_160px] gap-4 px-6 py-3 border-b border-[var(--border-outline-darker)] bg-[var(--bg-surface-primary)] items-center">
                    <div className="text-center font-bold text-[var(--text-light)]"><div className="w-6 h-6 rounded-md bg-[var(--bg-surface-primary)] border border-[var(--border-outline-light)] flex items-center justify-center mx-auto text-xs">{pages.length + 1}</div></div>
                    <div>
                      <input autoFocus type="text" placeholder="Enter the content" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} onKeyDown={handleKeyDownNew} onBlur={handleSaveNewPage} className="w-full px-4 py-2 bg-[var(--bg-surface-light)] border border-[var(--border-outline-darker)] rounded-xl outline-none focus:border-[var(--border-outline-darker)] focus:ring-1 focus:ring-transparent text-sm font-bold text-[var(--text-normal)] transition-all placeholder:font-medium placeholder-[var(--text-light)]"/>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--text-light)] rounded-full"><Eye className="w-4 h-4" /></div><div className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--text-light)] rounded-full"><Edit className="w-4 h-4" /></div><div className="w-10 h-10 flex items-center justify-center bg-transparent border border-[var(--border-outline-light)] text-[var(--status-error-default)] opacity-50 rounded-full"><Trash2 className="w-4 h-4" /></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-normal)]/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] w-full max-w-3xl  p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div><h2 className="text-2xl font-bold text-[var(--text-normal)]">Edit book details</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Update book details and languages.</p></div>
              <button onClick={() => setIsEditBookModalOpen(false)} className="p-2 text-[var(--text-light)] hover:bg-[var(--bg-surface-primary)] rounded-full transition-colors bg-[var(--bg-surface-primary)]"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-1/3 flex flex-col">
                  <div onClick={() => fileInputRef.current?.click()} className="flex-1 w-full bg-[var(--bg-surface-primary)] border-2 border-dashed border-[var(--border-outline-light)] rounded-2xl flex flex-col items-center justify-center text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-surface-light)] hover:border-[var(--color-primary-default)] hover:text-[var(--color-primary-default)] transition-all p-4 text-center min-h-[240px] relative overflow-hidden group">
                    {editFormData.coverImage ? <img src={editFormData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <><ImageIcon className="w-10 h-10 mb-2 stroke-[1.5] text-[var(--text-light)] group-hover:text-[var(--color-primary-default)] transition-colors" /><span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--color-primary-default)]">Choose a file</span><span className="text-[10px] font-medium text-[var(--text-light)] mt-1">JPEG and PNG, up to 2 MB</span></>}
                    <input type="file" ref={fileInputRef} onChange={handleEditImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-[var(--text-normal)]">Book name <span className="text-[var(--status-error-default)]">*</span></label><input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border border-[var(--border-outline-light)] transition-all text-[var(--text-normal)]" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-[var(--text-normal)]">Author name <span className="text-[var(--status-error-default)]">*</span></label><input type="text" value={editFormData.author} onChange={e => setEditFormData({...editFormData, author: e.target.value})} className="px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border border-[var(--border-outline-light)] transition-all text-[var(--text-normal)]" /></div>
                    <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-[var(--text-normal)]">Total page <span className="text-[var(--status-error-default)]">*</span></label><input type="number" value={editFormData.totalPages} onChange={e => setEditFormData({...editFormData, totalPages: Number(e.target.value)})} className="px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border border-[var(--border-outline-light)] transition-all text-[var(--text-normal)]" /></div>
                  </div>
                  <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-[var(--text-normal)]">Plot info</label><textarea rows={3} value={editFormData.plot} onChange={e => setEditFormData({...editFormData, plot: e.target.value})} className="px-4 py-3 bg-[var(--bg-surface-primary)] rounded-xl outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--border-outline-darker)] font-medium border border-[var(--border-outline-light)] resize-none transition-all text-[var(--text-normal)]"></textarea></div>
                </div>
              </div>
              
              {/* 🚀 แทนที่ Select เก่าด้วยโครงสร้างแบบ HeroUI v3 แท้ๆ (ดึงมาจากหน้า Home) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. Original Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--text-normal)]">Original language <span className="text-[var(--status-error-default)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Original Language"
                    placeholder="Select language"
                    selectedKey={editFormData.originalLang}
                    onSelectionChange={(key) => setEditFormData({...editFormData, originalLang: key ? String(key) : ""})}
                  >
                    <Select.Trigger className="w-full min-h-[48px] px-4 rounded-xl bg-[var(--bg-surface-primary)] hover:bg-[var(--bg-surface-light)]  border border-[var(--border-outline-light)] transition-all flex items-center justify-between">
                      <Select.Value className="text-[var(--text-normal)] font-medium text-left" />
                      <Select.Indicator><ChevronDown className="w-4 h-4 text-[var(--text-light)]" /></Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover placement="bottom" shouldFlip={false} className="w-(--trigger-width) bg-[var(--bg-surface-light)] text-[var(--text-normal)] rounded-xl  border border-[var(--border-outline-light)] max-h-[140px] overflow-y-auto overflow-x-hidden">
                      <ListBox items={languages} aria-label="Original Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item key={lang.value} id={lang.value} textValue={lang.label} className="w-full px-3 py-2 rounded-lg text-[var(--text-normal)] font-medium cursor-pointer hover:bg-[var(--color-primary-hover)] hover:text-[var(--text-normal)] transition-colors outline-none">
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* 2. Translation Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[var(--text-normal)]">Translation language <span className="text-[var(--status-error-default)]">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Translation Language"
                    placeholder="Select language"
                    selectedKey={editFormData.translationLang}
                    onSelectionChange={(key) => setEditFormData({...editFormData, translationLang: key ? String(key) : ""})}
                  >
                    <Select.Trigger className="w-full min-h-[48px] px-4 rounded-xl bg-[var(--bg-surface-primary)] hover:bg-[var(--bg-surface-light)]  border border-[var(--border-outline-light)] transition-all flex items-center justify-between">
                      <Select.Value className="text-[var(--text-normal)] font-medium text-left" />
                      <Select.Indicator><ChevronDown className="w-4 h-4 text-[var(--text-light)]" /></Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover placement="bottom" shouldFlip={false} className="w-(--trigger-width) bg-[var(--bg-surface-light)] text-[var(--text-normal)] rounded-xl  border border-[var(--border-outline-light)] max-h-[140px] overflow-y-auto overflow-x-hidden">
                      <ListBox items={languages} aria-label="Translation Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item key={lang.value} id={lang.value} textValue={lang.label} className="w-full px-3 py-2 rounded-lg text-[var(--text-normal)] font-medium cursor-pointer hover:bg-[var(--color-primary-hover)] hover:text-[var(--text-normal)] transition-colors outline-none">
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border-outline-light)]"><button onClick={() => setIsEditBookModalOpen(false)} className="px-8 py-2.5 rounded-full font-bold text-[var(--text-normal)] hover:bg-[var(--bg-surface-primary)] bg-transparent border border-[var(--border-outline-light)]  transition-all">Cancel</button><button onClick={handleUpdateBook} className="px-10 py-2.5 rounded-full font-bold bg-[var(--color-primary-default)] text-[var(--text-normal)] hover:bg-[var(--color-primary-hover)]  transition-all">Update</button></div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteBookModalOpen && (
         <div className="fixed inset-0 z-60 flex items-center justify-center bg-[var(--text-normal)]/40 backdrop-blur-sm p-4">
           <div className="bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] w-full max-w-[460px]  p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-full bg-[var(--status-error-surface)] flex items-center justify-center text-[var(--status-error-default)]"><Trash2 className="w-6 h-6" /></div><button onClick={() => setIsDeleteBookModalOpen(false)} className="p-2 text-[var(--text-light)] hover:bg-[var(--bg-surface-primary)] rounded-full bg-[var(--bg-surface-primary)] transition-colors"><X className="w-5 h-5" /></button></div>
             <div className="mb-8"><h3 className="text-2xl font-bold text-[var(--text-normal)] mb-2">Delete book</h3><p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">Are you sure you want to delete this book? This action cannot be undone.</p></div>
             <div className="flex justify-end gap-3"><button onClick={() => setIsDeleteBookModalOpen(false)} className="px-8 py-2.5 rounded-full font-bold text-[var(--text-normal)] bg-transparent border border-[var(--border-outline-light)] hover:bg-[var(--bg-surface-primary)]  transition-all">Cancel</button><button onClick={handleConfirmDeleteBook} className="px-10 py-2.5 rounded-full font-bold text-white hover:text-[var(--status-error-default)] bg-[var(--status-error-default)] hover:bg-[var(--status-error-hover)]  transition-all">Delete</button></div>
           </div>
         </div>
      )}

      {pageToDelete !== null && (
         <div className="fixed inset-0 z-60 flex items-center justify-center bg-[var(--text-normal)]/40 backdrop-blur-sm p-4">
           <div className="bg-[var(--bg-surface-light)] border border-[var(--border-outline-light)] rounded-[32px] w-full max-w-[460px]  p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-full bg-[var(--status-error-surface)] flex items-center justify-center text-[var(--status-error-default)]"><Trash2 className="w-6 h-6" /></div><button onClick={() => setPageToDelete(null)} className="p-2 text-[var(--text-light)] hover:bg-[var(--bg-surface-primary)] rounded-full bg-[var(--bg-surface-primary)] transition-colors"><X className="w-5 h-5" /></button></div>
             <div className="mb-8"><h3 className="text-2xl font-bold text-[var(--text-normal)] mb-2">Delete page</h3><p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">Are you sure you want to delete this page? This action cannot be undone.</p></div>
             <div className="flex justify-end gap-3"><button onClick={() => setPageToDelete(null)} className="px-8 py-2.5 rounded-full font-bold text-[var(--text-normal)] bg-transparent border border-[var(--border-outline-light)] hover:bg-[var(--bg-surface-primary)]  transition-all">Cancel</button><button onClick={handleConfirmDeletePage} className="px-10 py-2.5 rounded-full font-bold text-white hover:text-[var(--status-error-default)] bg-[var(--status-error-default)] hover:bg-[var(--status-error-hover)]  transition-all">Delete</button></div>
           </div>
         </div>
      )}
    </div>
  );
}