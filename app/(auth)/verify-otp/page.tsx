"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const email = params.get("email");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  async function handleVerify(e: any) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    // OTP valid → arahkan ke login
    window.location.href = "/login";
  }

  async function handleResend() {
    setMsg("");

    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error);
      return;
    }

    setMsg(data.message);
  }

  return (
    <div className="flex min-h-screen">

      {/* BAGIAN KIRI SAMA PERSIS LOGIN */}
      <div className="hidden md:flex md:w-1/2 bg-green-900 relative overflow-hidden rounded-r-3xl">
        <Image
          src="/images/login-bg.png"
          alt="OTP Illustration"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* BAGIAN KANAN */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16">
        <div className="w-full max-w-sm">

          {/* LOGO */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lime-500 text-3xl">
              <img src="/icons/icon-finpro.svg" alt="" />
            </span>
            <h1 className="text-2xl font-semibold text-gray-800">FinanPro</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-gray-900">Verifikasi OTP</h2>

          <p className="text-gray-600 mb-6">
            Masukkan kode OTP yang dikirim ke <b>{email}</b>
          </p>

          {/* Pesan error */}
          {msg && <p className="text-red-500 text-sm mb-3">{msg}</p>}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode OTP
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Masukkan 6 digit OTP"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 text-white py-2 rounded-md hover:bg-lime-500"
            >
              Verifikasi
            </button>
          </form>

          {/* KIRIM ULANG */}
          <button
            onClick={handleResend}
            className="w-full mt-3 text-sm text-lime-600 hover:underline"
          >
            Kirim ulang OTP
          </button>
        </div>
      </div>

    </div>
  );
}
