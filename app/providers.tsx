"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
// HeroUI v3 toasts (toast from @heroui/react) require this provider, not @heroui/toast.
import { ToastProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";
import { BookProvider } from "./context/BookContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top">
        <BookProvider>{children}</BookProvider>
      </ToastProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </HeroUIProvider>
  );
}