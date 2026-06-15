import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic")

  const where = topic ? { tags: { has: topic } } : {}

  const tils = await prisma.til.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tils)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const til = await prisma.til.create({
    data: {
      raw: body.raw,
      formatted: body.formatted,
      tags: body.tags ?? [],
    },
  })

  return NextResponse.json(til, { status: 201 })
}
