"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function ResendSuccessPage() {
  const params = useSearchParams();
  const email = params.get("email");

  function goToOTP() {
    window.location.href = `/kode-otp?email=${email}`;
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
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kode OTP Baru Terkirim</h1>
          <p className="text-gray-600 text-sm mb-6">
            Kami sudah mengirimkan OTP yang baru ke <b>{email}</b>.  
            Silakan cek email Anda.
          </p>

          <button
            onClick={goToOTP}
            className="w-full px-4 py-3 rounded-full bg-lime-400 hover:brightness-95 text-black font-medium shadow transition"
          >
            Masukkan Kode OTP
          </button>

        </div>
      </div>
    </div>
  );
}
