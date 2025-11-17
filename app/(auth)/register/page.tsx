"use client";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
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
          <p className="text-gray-600 mb-6">
            Silahkan daftarkan email dan kata sandi Anda
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="abc123@gmail.com"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                placeholder="Masukan kata sandi"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi kata sandi
              </label>
              <input
                type="password"
                placeholder="Masukan kata sandi"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 text-white font-semibold py-2 rounded-md hover:bg-lime-500 transition"
            >
              Daftar
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">atau</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Tombol Google */}
          <button className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-50">
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
