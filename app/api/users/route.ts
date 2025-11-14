import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const data = await prisma.users.findMany()
    return Response.json(data)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nama_lengkap, email, password, googleid } = body

    if (!email || !nama_lengkap) {
      return Response.json(
        { error: 'Nama dan email wajib diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.users.create({
      data: {
        nama_lengkap,
        email,
        password,
        googleid,
      },
    })

    return Response.json(user)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
