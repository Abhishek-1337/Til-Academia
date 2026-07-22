import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic")

  const where: Record<string, unknown> = {}
  if (topic) where.topic = { name: topic }

  const tils = await prisma.til.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { topic: true },
  })

  return NextResponse.json(tils)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  let topicId = body.topicId || null
  if (!topicId && body.topicName) {
    const topic = await prisma.topic.upsert({
      where: {
        userId_name: { userId: session.user.id, name: body.topicName.trim().toLowerCase() },
      },
      create: {
        name: body.topicName.trim().toLowerCase(),
        userId: session.user.id,
      },
      update: {},
    })
    topicId = topic.id
  }

  const til = await prisma.til.create({
    data: {
      title: body.title ?? null,
      topicId,
      raw: body.raw,
      formatted: body.formatted,
      tags: body.tags ?? [],
      userId: session.user.id,
    },
    include: { topic: true },
  })

  return NextResponse.json(til, { status: 201 })
}
