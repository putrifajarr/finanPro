"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function KodeOTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length != 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }
    setSending(true);

    setTimeout(() => {
      setSending(false);
      alert("OTP diverifikasi (contoh)");
    }, 1000);
  }

  function handleResend() {
    alert("Kode OTP dikirim ulang (contoh)");
  }

  return (
    <div className="flex min-h-screen">

      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 bg-green-900 relative overflow-hidden rounded-r-3xl">
        <Image
          src="/images/login-bg.png"
          alt="Login Illustration"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-800">
            Verifikasi
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Silahkan masukan kode OTP yang dikirim melalui email Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs text-gray-600">Kode OTP</label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={handleChange}
              placeholder="Masukkan kode OTP"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-lime-400 hover:brightness-95 text-black font-medium shadow-sm transition"
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
