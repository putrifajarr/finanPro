// file: finanPro/app/settings/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type Profile = {
  id_user: number;
  nama_lengkap?: string;
  email?: string;
  job?: string;
  phone?: string;
  description?: string;
  avatar_url?: string | null;
};

type Toast = { message: string; type: "success" | "error"; id: number; };

type AuthMeResponse = { user: { email: string; [key: string]: any } | null; };

export default function ProfileSettingsClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("/images/default-profile.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 3000);
  };
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/auth/me");
      const data: AuthMeResponse = await res.json();
      if (!data.user) return (window.location.href = "/login");

      const dbRes = await fetch(`/api/user/profile?email=${encodeURIComponent(data.user.email)}`);
      const dbData: Profile = await dbRes.json();
      if (!dbData.id_user) return showToast("Data pengguna tidak valid.", "error");

      let avatarUrl = "/images/default-profile.png";
      if (dbData.avatar_url && !dbData.avatar_url.startsWith("http")) {
        const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(dbData.avatar_url);
        if (publicUrl?.publicUrl) avatarUrl = publicUrl.publicUrl;
      } else if (dbData.avatar_url) avatarUrl = dbData.avatar_url;

      setProfile(dbData);
      setAvatarPreview(avatarUrl);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat profil.", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Tombol simpan detail profil (tanpa avatar)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoadingProfile(true);
    try {
      const updates = { ...profile };
      delete updates.avatar_url; // jangan update avatar
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Detail profil berhasil disimpan!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan profil: " + err.message, "error");
    } finally { setLoadingProfile(false); }
  };

  // Tombol simpan foto
  const handleSaveAvatar = async () => {
    if (!profile || !avatarFile) return;
    setLoadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      formData.append("id_user", profile.id_user.toString());

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAvatarPreview(data.publicUrl ?? "/images/default-profile.png");
      setProfile({ ...profile, avatar_url: data.publicUrl });
      setAvatarFile(null);
      showToast("Foto profil berhasil diperbarui!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mengunggah foto: " + err.message, "error");
    } finally {
      setLoadingAvatar(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-h-screen bg-gray-50 p-8 relative">
      {/* TOAST */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div key={toast.id} className={`px-4 py-2 rounded shadow text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <header className="mb-8 flex items-center gap-8">
        <button onClick={() => router.back()} className="mb-2 flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold mb-4">Pengaturan Profil</h1>
      </header>

      <div className="max-w-6xl mx-auto flex gap-10">
        <aside className="w-72 flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow">
            <Image src={avatarPreview} alt="avatar" fill className="object-cover"/>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-sm text-lime-700">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
            <span className="px-3 py-1 bg-lime-100 rounded-md border border-lime-300 text-lime-700">Pilih Foto</span>
          </label>
          {avatarFile && (
            <button onClick={handleSaveAvatar} disabled={loadingAvatar} className="mt-2 px-4 py-1 bg-lime-400 text-white rounded-md hover:bg-lime-500 disabled:opacity-60">
              {loadingAvatar ? "Menyimpan..." : "Simpan Foto"}
            </button>
          )}
          
          {/* NAVIGASI YANG SUDAH DIUPDATE (Tombol dihapus) */}
          <nav className="mt-8 w-full space-y-3">
            <button className="w-full text-left px-4 py-3 rounded bg-lime-100 text-lime-800 font-medium">Profil</button>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }} className="w-full text-left px-4 py-3 rounded border border-lime-300 text-red-600 hover:bg-red-50">Logout</button>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-medium mb-4">Profil</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input name="nama_lengkap" value={profile.nama_lengkap ?? ""} onChange={handleChange} placeholder="Nama lengkap" className="w-full px-3 py-2 border rounded-md border-lime-300"/>
              <input name="email" type="email" value={profile.email ?? ""} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded-md border-lime-300"/>
              <input name="job" value={profile.job ?? ""} onChange={handleChange} placeholder="Pekerjaan" className="w-full px-3 py-2 border rounded-md border-lime-300"/>
              <input name="phone" value={profile.phone ?? ""} onChange={handleChange} placeholder="Nomor telepon" className="w-full px-3 py-2 border rounded-md border-lime-300"/>
              <textarea name="description" value={profile.description ?? ""} onChange={handleChange} placeholder="Deskripsi (opsional)" className="w-full px-3 py-2 border rounded-md border-lime-300"/>
              <button type="submit" disabled={loadingProfile} className="px-6 py-2 bg-lime-400 text-white rounded-lg hover:bg-lime-500 disabled:opacity-60">{loadingProfile ? "Menyimpan..." : "Simpan Detail Profil"}</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}