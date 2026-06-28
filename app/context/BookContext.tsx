"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { toast } from "@heroui/react";

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  thaiReading: string;
  partOfSpeech: string;
  translation: string;
  examples: string[];
  remarks: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  content: string;
  createdAt: number;
}

export interface PageItem {
  id: string;
  title: string;
  originalText: string;
  translatedText: string;
  notebookText?: string;
  notes?: NoteItem[];
  vocabularies?: VocabularyItem[];
}

export interface BookItem {
  id: string; // Changed from number to string for Firestore compatibility
  title: string;
  author: string;
  coverImage: string | null;
  plot: string;
  originalLang: string;
  translationLang: string;
  totalPages: number;
  translatedPages: number;
  pages: PageItem[];
  createdAt?: number;
}

interface BookContextType {
  books: BookItem[];
  isLoading: boolean;
  addBook: (book: Omit<BookItem, "id" | "translatedPages" | "pages">) => Promise<void>;
  updateBook: (id: string, updatedData: Partial<BookItem>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  getBookById: (id: string) => BookItem | undefined;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const booksRef = collection(db, "users", user.id, "books");
    
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
      const booksData: BookItem[] = [];
      snapshot.forEach((doc) => {
        booksData.push({ id: doc.id, ...doc.data() } as BookItem);
      });
      // Sort books by createdAt if needed, for now just set them
      setBooks(booksData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching books: ", error);
      toast.danger("Failed to load books.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addBook = async (newBookData: Omit<BookItem, "id" | "translatedPages" | "pages">) => {
    if (!user) return;
    try {
      const booksRef = collection(db, "users", user.id, "books");
      await addDoc(booksRef, {
        ...newBookData,
        translatedPages: 0,
        pages: [],
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error adding book: ", error);
      toast.danger("Failed to add book.");
    }
  };

  const updateBook = async (id: string, updatedData: Partial<BookItem>) => {
    if (!user) return;
    try {
      const bookRef = doc(db, "users", user.id, "books", id);
      await updateDoc(bookRef, updatedData);
    } catch (error) {
      console.error("Error updating book: ", error);
      toast.danger("Failed to update book.");
    }
  };

  const deleteBook = async (id: string) => {
    if (!user) return;
    try {
      const bookRef = doc(db, "users", user.id, "books", id);
      await deleteDoc(bookRef);
    } catch (error) {
      console.error("Error deleting book: ", error);
      toast.danger("Failed to delete book.");
    }
  };

  const getBookById = (id: string) => {
    return books.find((book) => book.id === id);
  };

  return (
    <BookContext.Provider value={{ books, isLoading, addBook, updateBook, deleteBook, getBookById }}>
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