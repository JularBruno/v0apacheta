

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
	Utensils,
	ShoppingCart,
	Car,
	Home,
	Gamepad2,
	Zap,
	Gift,
	Sparkles,
	Briefcase,
	Plane,
	DollarSign,
	Coffee,
	Heart,
	Music,
	Camera,
	Book,
	Dumbbell,
	Palette,
	Wrench,
	Smartphone,
	Laptop,
	Settings,
	Plus,
	Edit,
	Trash2,
	X,
	Tag,
} from 'lucide-react';
/**
 * REFERENCE FOR easy use in app of icons saved in API
 */
export const iconComponents = {
	Utensils,
	ShoppingCart,
	Car,
	Home,
	Gamepad2,
	Zap,
	Gift,
	Sparkles,
	Briefcase,
	Plane,
	DollarSign,
	Coffee,
	Heart,
	Music,
	Camera,
	Book,
	Dumbbell,
	Palette,
	Wrench,
	Smartphone,
	Laptop,
	Settings,
	Plus,
	Edit,
	Trash2,
	X,
	Tag
};


/**
 * Replace icon string from db to actual icon mentioned
 * @param String: icon name as listed above
 * @returns Icon
 */

export default function IconComponent({ icon, className }: { icon: string; className?: string }) {
	const Icon =
		iconComponents[
		(icon as keyof typeof iconComponents) ?? "Tag"
		] || iconComponents["Tag"];
	return (
		<Icon
			className={className}
		/>
	)
}
