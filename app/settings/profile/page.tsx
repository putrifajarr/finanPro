"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronLeft } from 'lucide-react';

type Profile = {
  id?: string;
  full_name?: string;
  email?: string;
  job?: string;
  phone?: string;
  description?: string;
  avatar_url?: string | null;
};

export default function ProfileSettingsClient() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchProfile() {
    setLoading(true);
    try {
      // asumsi ada user yang sudah login di Supabase auth
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;

      if (!user) {
        setMessage("Masih demooo");
        // kalau belum login
        setProfile({
          full_name: "",
          email: "",
          job: "",
          phone: "",
          description: "",
          avatar_url: "/images/default-profile.png",
        });
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "404") throw error;
      setProfile(data ?? {});
      if (data?.avatar_url) {
        // Jika user punya avatar
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.avatar_url);
        setAvatarPreview(urlData.publicUrl);
      } else {
        // Jika TIDAK punya avata
        setAvatarPreview("/images/default-profile.png");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal mengambil profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;
    return filePath; 
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      const userId = user?.id ?? "anonymous";

      let avatarPath = profile.avatar_url ?? null;
      if (avatarFile) {
        avatarPath = await uploadAvatar(avatarFile, userId);
      }

      const updates = {
        id: userId,
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        job: profile.job ?? "",
        phone: profile.phone ?? "",
        description: profile.description ?? "",
        avatar_url: avatarPath,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      setMessage("Profil berhasil disimpan.");
      // refresh
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      setMessage("Gagal menyimpan profil: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();

  return (
    <div className="max-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center gap-8">
        <button
        onClick={() => router.back()}
        className="mb-2 flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-2xl font-semibold mb-4">Pengaturan Profil</h1>
      </header>

      <div className="max-w-6xl mx-auto flex gap-10">
        {/* kiri: nav */}
        <aside className="w-72">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow">
              {avatarPreview ? (
                avatarPreview.startsWith("blob:") ? (
                  // fallback untuk blob
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Image src={avatarPreview} alt="avatar" fill className="object-cover" />
                )
              ) : (
                <Image src={"/mnt/data/Pengaturan profil.png"} alt="placeholder" fill className="object-cover" />
              )}
            </div>

            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-sm text-lime-700">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <span className="px-3 py-1 bg-lime-100 rounded-md border border-lime-300 text-lime-700">Ubah Foto</span>
            </label>

            <nav className="mt-8 w-full space-y-3">
              <button className="w-full text-left px-4 py-3 rounded bg-lime-100 text-lime-800 font-medium">Profil</button>
              <button className="w-full text-left px-4 py-3 rounded border border-lime-300">Login dan Password</button>
              <button className="w-full text-left px-4 py-3 rounded border border-lime-300">Panduan</button>
              <button className="w-full text-left px-4 py-3 rounded border border-lime-300">Logout</button>
            </nav>
          </div>
        </aside>

        {/* kanan: form */}
        <main className="flex-1">
        
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-medium mb-4">Profil</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama*</label>
                <input
                  name="full_name"
                  value={profile.full_name ?? ""}
                  onChange={handleChange}
                  placeholder="masukkan nama lengkap"
                  className="w-full px-3 py-2 border border-lime-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  name="email"
                  type="email"
                  value={profile.email ?? ""}
                  onChange={handleChange}
                  placeholder="masukkan email anda"
                  className="w-full px-3 py-2 border border-lime-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pekerjaan*</label>
                <input
                  name="job"
                  value={profile.job ?? ""}
                  onChange={handleChange}
                  placeholder="masukkan pekerjaan anda"
                  className="w-full px-3 py-2 border border-lime-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">No.Telepon*</label>
                <input
                  name="phone"
                  value={profile.phone ?? ""}
                  onChange={handleChange}
                  placeholder="masukkan nomor telepon anda"
                  className="w-full px-3 py-2 border border-lime-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={profile.description ?? ""}
                  onChange={handleChange}
                  placeholder="opsional"
                  className="w-full px-3 py-2 border border-lime-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-300"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-lime-400 text-white rounded-lg hover:bg-lime-500 disabled:opacity-60"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

              {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
