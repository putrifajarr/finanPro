"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  // ----------------------------------------------------
  // GOOGLE LOGIN HANDLER
  // ----------------------------------------------------
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/api/auth/google/callback",
      },
    });

    if (error) setMessage("Gagal login dengan Google");
  }

  // ----------------------------------------------------
  // EMAIL LOGIN HANDLER
  // ----------------------------------------------------
  async function handleLogin(e: any) {
    e.preventDefault();
    setMessage("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    window.location.href = "/dashboard/home";
  }

  return (
    <div className="flex min-h-screen">

      {/* BAGIAN KIRI */}
      <div className="hidden md:flex md:w-1/2 bg-green-900 relative overflow-hidden rounded-r-3xl">
        <Image
          src="/images/login-bg.png"
          alt="Login Illustration"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* BAGIAN KANAN */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-6">
            <span className="text-lime-500 text-3xl">
              <img src="/icons/icon-finpro.svg" alt="" />
            </span>
            <h1 className="text-2xl font-semibold text-gray-800">FinanPro</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-gray-900">Selamat Datang!</h2>
          <p className="text-gray-600 mb-6">Silahkan masukan email dan kata sandi Anda</p>

          {message && <p className="text-red-500 text-sm mb-3">{message}</p>}

          {/* FORM LOGIN EMAIL */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="abc123@gmail.com"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input
                name="password"
                type="password"
                placeholder="Masukan kata sandi"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 text-white font-semibold py-2 rounded-md hover:bg-lime-500 transition"
            >
              Masuk
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">atau</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-50"
          >
            <Image src="/icons/logo-google.svg" alt="Google" width={20} height={20} />
            <span>Masuk dengan Google</span>
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Tidak memiliki akun?{" "}
            <Link href="/register" className="text-lime-600 font-semibold hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
