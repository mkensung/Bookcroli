"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// 🚀 อัปเกรด: เพิ่มกล่องเก็บข้อความต้นฉบับและคำแปล
export interface PageItem {
  id: string;
  title: string;
  originalText: string;
  translatedText: string;
}

export interface BookItem {
  id: number;
  title: string;
  author: string;
  coverImage: string | null;
  plot: string;
  originalLang: string;
  translationLang: string;
  totalPages: number;
  translatedPages: number;
  pages: PageItem[]; // 🚀 เพิ่ม: ให้หนังสือ 1 เล่ม เก็บหน้าต่างย่อยๆ ได้หลายหน้า
}

interface BookContextType {
  books: BookItem[];
  addBook: (book: Omit<BookItem, "id" | "translatedPages" | "pages">) => void;
  updateBook: (id: number, updatedData: Partial<BookItem>) => void;
  deleteBook: (id: number) => void;
  getBookById: (id: number) => BookItem | undefined;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<BookItem[]>([]);

  const addBook = (newBookData: Omit<BookItem, "id" | "translatedPages" | "pages">) => {
    const newBook: BookItem = {
      ...newBookData,
      id: Date.now(),
      translatedPages: 0,
      pages: [], // 🚀 เริ่มต้นหนังสือใหม่ จะยังไม่มีหน้า
    };
    setBooks((prev) => [...prev, newBook]);
  };

  const updateBook = (id: number, updatedData: Partial<BookItem>) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === id ? { ...book, ...updatedData } : book))
    );
  };

  const deleteBook = (id: number) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const getBookById = (id: number) => {
    return books.find((book) => book.id === id);
  };

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, deleteBook, getBookById }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}