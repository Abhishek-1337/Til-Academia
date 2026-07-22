import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const til = await prisma.til.findUnique({ where: { id } })
  if (!til || til.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()

  let topicId = body.topicId ?? null
  if (body.topicName) {
    const topic = await prisma.topic.upsert({
      where: {
        userId_name: { userId: session.user.id, name: body.topicName.trim() },
      },
      create: {
        name: body.topicName.trim(),
        userId: session.user.id,
      },
      update: {},
    })
    topicId = topic.id
  }

  const updated = await prisma.til.update({
    where: { id },
    data: {
      title: body.title ?? null,
      topicId,
      raw: body.raw,
      formatted: body.formatted,
      tags: body.tags ?? [],
    },
    include: { topic: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const til = await prisma.til.findUnique({ where: { id } })
  if (!til || til.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.til.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
