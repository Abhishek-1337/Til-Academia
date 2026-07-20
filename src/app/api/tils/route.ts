import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const topic = request.nextUrl.searchParams.get("topic")

  const where: Record<string, unknown> = { userId: session.user.id }
  if (topic) where.topic = topic

  const tils = await prisma.til.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tils)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const til = await prisma.til.create({
    data: {
      title: body.title ?? null,
      topic: body.topic || null,
      raw: body.raw,
      formatted: body.formatted,
      tags: body.tags ?? [],
      userId: session.user.id,
    },
  })

  return NextResponse.json(til, { status: 201 })
}
