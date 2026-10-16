"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Nama pengguna (username) wajib diisi");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Format alamat email tidak valid");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }
    if (!agreeTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan");
      return;
    }

    setLoading(true);

    // Simulate account registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      if (typeof window !== "undefined") {
        const newUser = {
          name: username,
          email: email,
          isLoggedIn: true,
        };
        localStorage.setItem("luoyiv_user", JSON.stringify(newUser));
      }

      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header bar with Back button */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0E0E14] rounded-[9px] flex items-center justify-center font-black text-amber-400 text-xs">
              NN
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Nex<span className="text-white font-light">Nime</span>
          </span>
        </Link>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 z-10">
        <div className="w-full max-w-md bg-[#111118]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Form Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Gabung Komunitas NexNime
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
              Nikmati bookmark, riwayat tonton, dan baca chapter terbaru tanpa hambatan
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Pendaftaran berhasil! Mengalihkan ke beranda...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Nama Pengguna / Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. wibu_streamer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 text-gray-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-[#181824] border-white/20 text-amber-500 focus:ring-amber-400/30 accent-amber-500"
              />
              <label htmlFor="terms" className="text-[11px] text-gray-400 leading-tight select-none cursor-pointer">
                Saya menyetujui <span className="text-gray-300 underline">Syarat Layanan</span> dan <span className="text-gray-300 underline">Kebijakan Privasi</span> NexNime
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-10 mt-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <span>Daftar Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#111118] px-3 text-[11px] text-gray-500 uppercase tracking-wider">
              atau daftar dengan
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setUsername("google_user");
                setEmail("google.user@gmail.com");
                setPassword("googlepass123");
                setConfirmPassword("googlepass123");
              }}
              className="h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.8C6.5 7.1 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.9c-.3-.8-.4-1.8-.4-2.9 0-1 .1-2 .4-2.9L1.9 6.3C.7 8.8 0 10.8 0 12c0 1.2.7 3.2 1.9 5.7l3.7-2.8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.1L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername("discord_member");
                setEmail("discord.member@luoyiv.stream");
                setPassword("discordpass123");
                setConfirmPassword("discordpass123");
              }}
              className="h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
                <path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3c-.2.4-.4.8-.6 1.2a18.2 18.2 0 0 0-5.8 0 12.6 12.6 0 0 0-.6-1.2 19.6 19.6 0 0 0-4.8 1.4A20.2 20.2 0 0 0 0 18.2a19.7 19.7 0 0 0 6 3 14.8 14.8 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2-.9c.2-.1.3-.3.5-.4a14 14 0 0 0 12.4 0c.2.1.3.3.5.4-.6.4-1.3.7-2 .9.4.7.8 1.4 1.3 2.1a19.7 19.7 0 0 0 6-3 20.2 20.2 0 0 0-3.7-13.8zM8 15.3c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5c1.3 0 2.3 1.1 2.2 2.5 0 1.4-1 2.5-2.2 2.5zm8 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5c1.3 0 2.3 1.1 2.2 2.5 0 1.4-1 2.5-2.2 2.5z" />
              </svg>
              <span>Discord</span>
            </button>
          </div>

          {/* Switch to Login */}
          <div className="text-center mt-5 pt-3 border-t border-white/5 text-xs text-gray-400">
            <span>Sudah memiliki akun? </span>
            <Link
              href="/login"
              className="font-bold text-amber-400 hover:text-amber-300 hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="text-center py-4 text-[11px] text-gray-500 border-t border-white/5">
        © 2026 NexNime Streaming &amp; Manga • Hak Cipta Dilindungi
      </footer>
    </div>
  );
}
