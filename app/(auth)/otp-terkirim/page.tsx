export default function OtpTerkirimPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-3">OTP Dikirim</h1>
        <p className="text-gray-600 mb-6">
          Kode OTP baru telah dikirim ke email Anda. Silakan cek kotak masuk.
        </p>

        <a
          href="/kode-otp"
          className="block bg-lime-500 text-white py-2 rounded-md font-semibold hover:bg-lime-600"
        >
          Kembali ke Verifikasi
        </a>
      </div>
    </div>
  );
}
