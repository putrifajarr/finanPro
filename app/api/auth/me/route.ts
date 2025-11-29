import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = JSON.parse(session);
  return NextResponse.json({ user });
}
