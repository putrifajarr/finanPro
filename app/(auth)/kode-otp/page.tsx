"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function KodeOTPPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
    if (info) setInfo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setSending(true);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setError(data.error);
      return;
    }

    window.location.href = data.redirect;
  }

  async function handleResend() {
    if (!email) return;

    setInfo("Mengirim ulang...");
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setInfo("");
      return;
    }

    setInfo("Kode OTP baru telah dikirim.");
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
          <h1 className="text-2xl font-semibold text-gray-800">
            Verifikasi
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Silahkan masukan kode OTP yang dikirim ke <b>{email}</b>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs text-gray-600">Kode OTP</label>
            <input
              inputMode="numeric"
              value={otp}
              onChange={handleChange}
              placeholder="Masukkan kode OTP"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-300"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-green-600">{info}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full px-4 py-3 rounded-full bg-lime-400 text-black font-medium shadow-sm"
            >
              {sending ? "Memverifikasi..." : "Verifikasi"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-2">
              <span>Tidak menerima kode? </span>
              <button
                type="button"
                onClick={handleResend}
                className="text-green-600 font-medium hover:underline"
              >
                Kirim ulang
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
