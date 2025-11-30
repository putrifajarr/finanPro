"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function OtpExpiredPage() {
  const params = useSearchParams();
  const email = params.get("email");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    window.location.href = `/resend-success?email=${email}`;
  }

  return (
    <div className="flex min-h-screen">
      
      {/* Left image */}
      <div className="hidden md:flex md:w-1/2 bg-green-900 relative overflow-hidden rounded-r-3xl">
        <Image
          src="/images/login-bg.png"
          alt="OTP Illustration"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 md:px-16">
        <div className="w-full max-w-sm">
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kode OTP Kedaluwarsa</h1>
          <p className="text-gray-600 text-sm mb-4">
            OTP untuk <b>{email}</b> sudah kedaluwarsa.
            Silakan minta kode baru untuk melanjutkan.
          </p>

          {message && (
            <p className="text-red-500 text-sm mb-3">{message}</p>
          )}

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full px-4 py-3 rounded-full bg-lime-400 hover:brightness-95 text-black font-medium shadow transition"
          >
            {loading ? "Mengirim ulang..." : "Kirim OTP Baru"}
          </button>

        </div>
      </div>
    </div>
  );
}
