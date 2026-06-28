"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const result = mode === "signin"
      ? await login(email, password)
      : await signup(displayName, email, password);

    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Google sign-in failed");
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* ─── Left Branding Panel (Desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between relative overflow-hidden bg-[var(--accent)]">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="bookPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="8" y="5" width="12" height="16" rx="1" fill="currentColor" transform="rotate(-8 14 13)" />
                <rect x="28" y="30" width="12" height="16" rx="1" fill="currentColor" transform="rotate(5 34 38)" />
                <rect x="45" y="8" width="10" height="14" rx="1" fill="currentColor" transform="rotate(12 50 15)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bookPattern)" className="text-[var(--accent-foreground)]" />
          </svg>
        </div>

        {/* Top section: Logo */}
        <div className="relative z-10 p-8 pt-10">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/Bookcroli_logo.svg"
              alt="Bookcroli Logo"
              className="h-[28px] w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Center section: Mascot + Message */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 -mt-8">
          <div className="w-[200px] h-[200px] mb-8 relative">
            <div className="absolute inset-0 bg-[var(--accent-foreground)] opacity-[0.08] rounded-full blur-3xl scale-150" />
            <img
              src="/Bookcroli_mascot.svg"
              alt="Bookcroli Mascot"
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            />
          </div>
          <h2 className="text-[var(--accent-foreground)] text-2xl font-bold text-center mb-3 tracking-tight">
            Every page is a journey
          </h2>
          <p className="text-[var(--accent-foreground)] opacity-70 text-sm text-center leading-relaxed max-w-[300px]">
            Track your reading, translate your books, and build your vocabulary — all in one place.
          </p>
        </div>

        {/* Bottom section: Decorative dots */}
        <div className="relative z-10 p-8 pb-10 flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-foreground)] opacity-80" />
          <span className="w-2 h-2 rounded-full bg-[var(--accent-foreground)] opacity-40" />
          <span className="w-2 h-2 rounded-full bg-[var(--accent-foreground)] opacity-40" />
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Link href="/" className="flex items-center gap-2">
              <img src="/Bookcroli_logo.svg" alt="Bookcroli" className="h-[26px] w-auto" />
            </Link>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {mode === "signin"
                ? "Sign in to continue your reading journey"
                : "Start your reading journey with Bookcroli"}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-[var(--field-radius)] border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--separator)]" />
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--separator)]" />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-[var(--radius)] bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 tracking-wide">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--field-placeholder)]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 pl-11 pr-4 text-sm bg-[var(--field-background)] border border-[var(--field-border,var(--border))] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--field-placeholder)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-11 pr-4 text-sm bg-[var(--field-background)] border border-[var(--field-border,var(--border))] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--foreground)] tracking-wide">
                  Password
                </label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-[var(--accent)] hover:underline font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--field-placeholder)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-11 text-sm bg-[var(--field-background)] border border-[var(--field-border,var(--border))] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--field-placeholder)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--field-placeholder)]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-11 pr-11 text-sm bg-[var(--field-background)] border border-[var(--field-border,var(--border))] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] focus:ring-1 focus:ring-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--field-placeholder)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-[var(--field-radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[var(--accent-foreground)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[var(--muted)] mt-8">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </p>

          {/* Footer */}
          <p className="text-center text-[10px] text-[var(--muted)] mt-6 opacity-60">
            By continuing, you agree to Bookcroli&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
