"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  // GOOGLE REGISTER
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/api/auth/google/callback",
      },
    });

    if (error) setMessage("Gagal daftar dengan Google");
  }

  // EMAIL REGISTER
  async function handleRegister(e: any) {
    e.preventDefault();
    setMessage("");

    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (password !== confirm) {
      setMessage("Kata sandi tidak cocok!");
      return;
    }

    const payload = {
      nama_lengkap: email,
      email,
      password,
      google_auth_id: null,
    };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Jika gagal (email sudah terdaftar / error lain)
    if (!res.ok) {
      // jika backend kirim redirect (jarang, tapi untuk jaga-jaga)
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      setMessage(data.error);
      return;
    }

    // Jika backend mengirim redirect ke halaman OTP
    if (data.redirect) {
      window.location.href = data.redirect;
      return;
    }

    // fallback
    setMessage("Registrasi berhasil!");
  }

  return (
    <div className="flex min-h-screen">

      <div className="hidden md:flex md:w-1/2 bg-green-900 relative overflow-hidden rounded-r-3xl">
        <Image
          src="/images/login-bg.png"
          alt="Login Illustration"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-6">
            <span className="text-lime-500 text-3xl">
              <img src="/icons/icon-finpro.svg" alt="" />
            </span>
            <h1 className="text-2xl font-semibold text-gray-800">FinanPro</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-gray-900">Silahkan daftar</h2>

          {message && <p className="text-red-500 text-sm mb-3">{message}</p>}

          {/* FORM REGISTER */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input name="password" type="password" className="w-full px-3 py-2 border rounded-md" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi</label>
              <input name="confirm" type="password" className="w-full px-3 py-2 border rounded-md" />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 text-white font-semibold py-2 rounded-md hover:bg-lime-500"
            >
              Daftar
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">atau</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* GOOGLE REGISTER */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-50"
          >
            <Image src="/icons/logo-google.svg" alt="Google" width={20} height={20} />
            <span>Daftar dengan Google</span>
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Memiliki akun?{" "}
            <Link href="/login" className="text-lime-600 font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
