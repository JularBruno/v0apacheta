import { Linkedin, MessageCircle, Twitter, Youtube, type LucideIcon } from "lucide-react"
import type { CommunityPlatform } from "@/lib/content/community"

// lucide has no Discord glyph, so a chat bubble stands in for it.
export const COMMUNITY_ICONS: Record<CommunityPlatform, LucideIcon> = {
	discord: MessageCircle,
	youtube: Youtube,
	linkedin: Linkedin,
	twitter: Twitter,
}
