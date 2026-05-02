"use client";

import { useState, useRef } from "react";
// ใช้ HeroUI ของแท้ 100%
import { Select, ListBoxItem } from "@heroui/react";
import { BookOpen, Book, LayoutGrid, Bookmark, Search, Bell, Settings, Plus, Image as ImageIcon, X } from "lucide-react";

interface BookItem {
  id: number;
  title: string;
  author: string;
  coverImage: string | null;
  totalPages: number;
  translatedPages: number;
}

const languages = [
  { label: "English", value: "English" },
  { label: "Thai", value: "Thai" },
  { label: "Korean", value: "Korean" },
  { label: "Japanese", value: "Japanese" },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<BookItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    totalPages: "",
    plot: "",
    originalLang: "",
    translationLang: "",
    coverImage: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, coverImage: imageUrl });
    }
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
      return; 
    }

    const newBook: BookItem = {
      id: Date.now(),
      title: formData.title,
      author: formData.author,
      coverImage: formData.coverImage,
      totalPages: Number(formData.totalPages) || 100,
      translatedPages: 0,
    };
    
    setBooks([...books, newBook]);
    setIsModalOpen(false); 
    
    setFormData({ title: "", author: "", totalPages: "", plot: "", originalLang: "", translationLang: "", coverImage: null });
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); 
    setFormData({ title: "", author: "", totalPages: "", plot: "", originalLang: "", translationLang: "", coverImage: null }); 
    setErrors({}); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
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
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-900 border border-slate-200 rounded-full shadow-sm bg-white">
              <Book className="w-4 h-4" /> Library
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <Bookmark className="w-4 h-4" /> Bookmark
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-transparent border border-slate-200 hover:border-slate-300 rounded-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors bg-white"><Bell className="w-4 h-4" /></button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors bg-white"><Settings className="w-4 h-4" /></button>
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">MK</div>
          </div>
        </header>
      </div>

      {/* --- Main Content Area --- */}
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
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <Book className="w-16 h-16 text-slate-400 mb-6 stroke-[1.5]" />
            <h2 className="text-3xl font-bold text-slate-400 mb-3 tracking-tight">No book added!</h2>
            <p className="text-lg text-slate-400 font-medium">Please add new book in your library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => {
              const progressPercent = book.totalPages > 0 ? Math.round((book.translatedPages / book.totalPages) * 100) : 0;
              return (
                <div key={book.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4">
                  <div className="w-full aspect-[2/3] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-10 h-10 stroke-[1] opacity-50" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="italic text-sm text-slate-600 font-medium line-clamp-1">{book.author}</p>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2">{book.title}</h3>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- Custom Vibe Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Add new book</h2>
                <p className="text-sm text-slate-500 mt-1">Please fill book information.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-stretch">
                
                <div className="w-full md:w-1/3 flex flex-col">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-all hover:border-blue-300 hover:text-blue-500 overflow-hidden min-h-[240px] p-4 text-center"
                  >
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 stroke-[1.5] text-slate-800 mb-2" />
                        <span className="text-base font-bold text-slate-900">Choose a file</span>
                        <span className="text-xs text-slate-500 mt-1">JPEG and PNG, up to 2 MB</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg, image/png" className="hidden" />
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-800">Book name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Book name" 
                      value={formData.title}
                      onChange={(e) => { setFormData({...formData, title: e.target.value}); if(errors.title) setErrors({...errors, title: ""}); }}
                      className={`px-4 py-3 border rounded-xl text-sm outline-none transition-all w-full font-medium ${errors.title ? 'border-red-400 bg-red-50 focus:border-red-500 text-red-900' : 'bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white'}`} 
                    />
                    {errors.title && <span className="text-xs text-red-500 font-medium">{errors.title}</span>}
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1/2 flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-800">Author name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Author name" 
                        value={formData.author}
                        onChange={(e) => { setFormData({...formData, author: e.target.value}); if(errors.author) setErrors({...errors, author: ""}); }}
                        className={`px-4 py-3 border rounded-xl text-sm outline-none transition-all w-full font-medium ${errors.author ? 'border-red-400 bg-red-50 focus:border-red-500 text-red-900' : 'bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white'}`} 
                      />
                      {errors.author && <span className="text-xs text-red-500 font-medium">{errors.author}</span>}
                    </div>

                    <div className="w-1/2 flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-800">Total page <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        placeholder="Total page" 
                        value={formData.totalPages}
                        onChange={(e) => { setFormData({...formData, totalPages: e.target.value}); if(errors.totalPages) setErrors({...errors, totalPages: ""}); }}
                        className={`px-4 py-3 border rounded-xl text-sm outline-none transition-all w-full font-medium ${errors.totalPages ? 'border-red-400 bg-red-50 focus:border-red-500 text-red-900' : 'bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white'}`} 
                      />
                      {errors.totalPages && <span className="text-xs text-red-500 font-medium">{errors.totalPages}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-800">Plot info</label>
                    <textarea 
                      placeholder="Filled plot information" 
                      rows={3} 
                      value={formData.plot}
                      onChange={(e) => setFormData({...formData, plot: e.target.value})}
                      className="px-4 py-3 bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition-all resize-none font-medium"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* ใช้ HeroUI Select แท้ๆ แบบ Clean ที่สุด โดยลบ classNames ออก */}
              <div className="flex gap-4 mt-6">
                <div className="w-1/2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-800">Original language <span className="text-red-500">*</span></label>
                  <Select
                    aria-label="Original language"
                    placeholder="Select language"
                    selectedKey={formData.originalLang || undefined}
                    onSelectionChange={(key) => {
                      setFormData({ ...formData, originalLang: key ? key.toString() : "" });
                      if(errors.originalLang) setErrors({...errors, originalLang: ""});
                    }}
                    isInvalid={!!errors.originalLang}
                    className="w-full"
                  >
                    {languages.map((lang) => (
                      <ListBoxItem key={lang.value}>
                        {lang.label}
                      </ListBoxItem>
                    ))}
                  </Select>
                  {errors.originalLang && <span className="text-xs text-red-500 font-medium">{errors.originalLang}</span>}
                </div>

                <div className="w-1/2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-800">Translation language <span className="text-red-500">*</span></label>
                  <Select
                    aria-label="Translation language"
                    placeholder="Select language"
                    selectedKey={formData.translationLang || undefined}
                    onSelectionChange={(key) => {
                      setFormData({ ...formData, translationLang: key ? key.toString() : "" });
                      if(errors.translationLang) setErrors({...errors, translationLang: ""});
                    }}
                    isInvalid={!!errors.translationLang}
                    className="w-full"
                  >
                    {languages.map((lang) => (
                      <ListBoxItem key={lang.value}>
                        {lang.label}
                      </ListBoxItem>
                    ))}
                  </Select>
                  {errors.translationLang && <span className="text-xs text-red-500 font-medium">{errors.translationLang}</span>}
                </div>
              </div>

            </div>

            <div className="px-8 py-5 flex justify-end gap-3 mt-2 border-t border-slate-50">
              <button onClick={handleCloseModal} className="px-6 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors bg-slate-50">
                Cancel
              </button>
              <button onClick={handleConfirmAddBook} className="px-8 py-2.5 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}