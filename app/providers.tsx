"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/react";
import { BookProvider } from "./context/BookContext";
import { AuthProvider } from "./context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <BookProvider>{children}</BookProvider>
      </AuthProvider>
      <ToastProvider placement="top" />
    </HeroUIProvider>
  );
}