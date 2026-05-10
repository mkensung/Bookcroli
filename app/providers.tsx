"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/react";
import { BookProvider } from "./context/BookContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <BookProvider>{children}</BookProvider>
      <ToastProvider placement="top" />
    </HeroUIProvider>
  );
}