"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import ProfileContent from "@/components/ProfileContent"

export default function UserTilsPage() {
  const params = useParams<{ username: string }>()
  const { data: session } = useSession()
  const userId = params.username
  const isOwnProfile = session?.user?.id === userId

  return <ProfileContent key={userId} userId={userId} isOwnProfile={isOwnProfile} />
}