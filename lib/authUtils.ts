// mengambil user_id yang aman dari cookie session


import { NextRequest } from 'next/server';

/**
 * untuk mendapatkan User ID dari cookie 'session'.
 * diasumsikan Cookie 'session' berisi JSON string: { id: user.id_user, email: string, time: number }
 */
export function getUserIdFromRequest(req: NextRequest): number | null {
    try {
        // 1. Ambil nilai (value) dari cookie 'session'
        const sessionValue = req.cookies.get("session")?.value;
        
        if (!sessionValue) {
            return null; // Cookie 'session' tidak ditemukan
        }

        // 2. Parse string JSON menjadi objek
        // Data yang tersimpan: { id: user.id_user, email: string, time: number }
        const sessionData = JSON.parse(sessionValue); 
        
        // 3. Verifikasi apakah ada ID dan apakah ID-nya adalah angka
        if (sessionData && typeof sessionData.id === 'number') {
            return sessionData.id; // Mengembalikan user ID (sebagai number)
        }

        return null; // ID tidak valid

    } catch (error) {
        console.error('Verifikasi sesi gagal (JSON parse error):', error);
        return null; // Gagal mengurai JSON
    }
}