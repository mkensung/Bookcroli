"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Select, ListBox } from "@heroui/react";
import { 
  BookOpen, Book, LayoutGrid, Bookmark, Search, 
  Bell, Settings, Plus, Image as ImageIcon, X, Trash2, ChevronDown 
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

  // 🚀 ฟังก์ชันใหม่: รีเซ็ต State (ล้างความจำ) ก่อนปิด Modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // สั่งปิดหน้าต่าง
    // ล้างข้อมูลทุกช่องให้กลับเป็นค่าเริ่มต้น
    setFormData({ 
      title: "", author: "", totalPages: "", plot: "", 
      originalLang: "", translationLang: "", coverImage: null 
    });
    setErrors({}); // ล้างแจ้งเตือน Error สีแดงทิ้งด้วย
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
    handleCloseModal(); // 🚀 เรียกใช้ฟังก์ชันล้างความจำตอนบันทึกสำเร็จด้วยเลย โค้ดจะได้คลีนขึ้น!
  };

  const handleConfirmDelete = () => {
    if (bookToDelete !== null) {
      deleteBook(bookToDelete);
      toast.success("Book deleted successfully!");
      setBookToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* --- Floating Navigation Bar --- */}
      <div className="pt-6 px-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <BookOpen className="w-6 h-6 stroke-[2.5]" /> BookLator
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <LayoutGrid className="w-4 h-4" /> Overview
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-900 border border-slate-200 rounded-full shadow-sm bg-white cursor-default">
              <Book className="w-4 h-4" /> Library
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <Bookmark className="w-4 h-4" /> Bookmark
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10 text-slate-400">
              <Search className="absolute left-3 w-4 h-4" />
              <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-transparent border border-slate-200 rounded-full outline-none focus:border-blue-500 transition-all" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full bg-white hover:bg-slate-50 transition-colors"><Bell className="w-4 h-4" /></button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full bg-white hover:bg-slate-50 transition-colors"><Settings className="w-4 h-4" /></button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">MK</div>
          </div>
        </header>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-center pb-6 border-b border-slate-200 mb-10">
          <div className="flex items-center gap-3">
            <Book className="w-7 h-7 text-slate-800 stroke-2" />
            <h1 className="text-2xl font-bold text-slate-800">Library</h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium px-6 py-2.5 flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add new book
          </button>
        </div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-32">
            <Book className="w-16 h-16 text-slate-400 mb-6 stroke-[1.5]" />
            <h2 className="text-3xl font-bold text-slate-400 mb-3 tracking-tight">No book added!</h2>
            <p className="text-lg text-slate-400 font-medium">Please add new book in your library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book: any) => {
              const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
              return (
                <Link href={`/book/${book.id}`} key={book.id} className="block w-full">
                  <div className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col gap-4 cursor-pointer h-full">
                    <div className="w-full aspect-2/3 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden relative">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-10 h-10 stroke-1 text-slate-300" />
                      )}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookToDelete(book.id); }}
                        className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md scale-90 group-hover:scale-100 z-10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="italic text-sm text-slate-500 line-clamp-1">{book.author}</p>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">{book.title}</h3>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-500">Progress</span>
                        <span className="font-bold">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* --- Add New Book Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Add new book</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Please fill book information.</p>
              </div>
              {/* 🚀 ผูกฟังก์ชันล้างความจำตอนกดกากบาท (X) */}
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="w-full md:w-1/3 flex flex-col">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-all hover:border-blue-300 hover:text-blue-500 p-4 text-center min-h-[240px] group"
                  >
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5] text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Choose a file</span>
                        <span className="text-[10px] font-medium text-slate-400 mt-1">JPEG and PNG, up to 2 MB</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-800">Book name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" placeholder="Enter book name" value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                      className={`px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium border ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-800">Author name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" placeholder="Enter author name" value={formData.author}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("author", e.target.value)}
                        className={`px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium border transition-all ${errors.author ? 'border-red-400' : 'border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-800">Total page <span className="text-red-500">*</span></label>
                      <input 
                        type="number" placeholder="e.g. 500" value={formData.totalPages}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("totalPages", e.target.value)}
                        className={`px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium border transition-all ${errors.totalPages ? 'border-red-400' : 'border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-800">Plot info</label>
                    <textarea 
                      placeholder="Enter book plot or description..." rows={3} value={formData.plot}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("plot", e.target.value)}
                      className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium border border-slate-200 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. Original Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-800">Original language <span className="text-red-500">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Original Language"
                    placeholder="Select language"
                    selectedKey={formData.originalLang}
                    onSelectionChange={(key) => handleInputChange("originalLang", key ? String(key) : "")}
                    isInvalid={!!errors.originalLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-xl bg-slate-50 hover:bg-slate-100 shadow-none border transition-all flex items-center justify-between ${errors.originalLang ? 'border-red-400' : 'border-slate-200'}`}>
                      <Select.Value className="text-slate-800 font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover 
                      placement="bottom" 
                      shouldFlip={false} 
                      className="w-(--trigger-width) bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Original Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item 
                            key={lang.value} 
                            id={lang.value} 
                            textValue={lang.label} 
                            className="w-full px-3 py-2 rounded-lg text-slate-700 font-medium cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors outline-none"
                          >
                            {lang.label}
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* 2. Translation Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-800">Translation language <span className="text-red-500">*</span></label>
                  <Select
                    className="w-full"
                    aria-label="Translation Language"
                    placeholder="Select language"
                    selectedKey={formData.translationLang}
                    onSelectionChange={(key) => handleInputChange("translationLang", key ? String(key) : "")}
                    isInvalid={!!errors.translationLang}
                  >
                    <Select.Trigger className={`w-full min-h-[48px] px-4 rounded-xl bg-slate-50 hover:bg-slate-100 shadow-none border transition-all flex items-center justify-between ${errors.translationLang ? 'border-red-400' : 'border-slate-200'}`}>
                      <Select.Value className="text-slate-800 font-medium text-left" />
                      <Select.Indicator>
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover 
                      placement="bottom" 
                      shouldFlip={false} 
                      className="w-(--trigger-width) bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 max-h-[140px] overflow-y-auto overflow-x-hidden"
                    >
                      <ListBox items={languages} aria-label="Translation Language Options" className="p-1 flex flex-col gap-1 outline-none">
                        {(lang) => (
                          <ListBox.Item 
                            key={lang.value} 
                            id={lang.value} 
                            textValue={lang.label} 
                            className="w-full px-3 py-2 rounded-lg text-slate-700 font-medium cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors outline-none"
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

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              {/* 🚀 ผูกฟังก์ชันล้างความจำตอนกดปุ่ม Cancel */}
              <button onClick={handleCloseModal} className="px-8 py-2.5 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-all bg-white border border-slate-200 shadow-sm">Cancel</button>
              <button onClick={handleConfirmAddBook} className="px-10 py-2.5 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {bookToDelete !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[460px] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <button onClick={() => setBookToDelete(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete book</h3>
              <p className="text-base text-slate-500 font-medium leading-relaxed">Are you sure you want to delete this book? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBookToDelete(null)} className="px-8 py-2.5 rounded-full font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-10 py-2.5 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}