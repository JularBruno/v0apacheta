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
	PiggyBank,
	CreditCard,
	Wallet,
	TrendingUp,
	Fuel,
	Bus,
	Baby,
	PawPrint,
	Shirt,
	Pill,
	GraduationCap,
	Building2,
	Receipt,
	ShoppingBag,
	Landmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * @title QuickSpendConstants!
 * Useful for keeping jsons
 * It acually has icons, icons references, and colors
 */

/**
 * All for populating form selections
 */
export const availableIcons: { id: string; name: string; icon: LucideIcon }[] =
	[
		{ id: 'Utensils', name: 'Comida', icon: Utensils },
		{ id: 'ShoppingCart', name: 'Compras', icon: ShoppingCart },
		{ id: 'Car', name: 'Transporte', icon: Car },
		{ id: 'Home', name: 'Hogar', icon: Home },
		{ id: 'Gamepad2', name: 'Juegos', icon: Gamepad2 },
		{ id: 'Zap', name: 'Servicios', icon: Zap },
		{ id: 'Gift', name: 'Regalos', icon: Gift },
		{ id: 'Sparkles', name: 'Belleza', icon: Sparkles },
		{ id: 'Briefcase', name: 'Trabajo', icon: Briefcase },
		{ id: 'Plane', name: 'Viajes', icon: Plane },
		{ id: 'DollarSign', name: 'Ingreso', icon: DollarSign },
		{ id: 'Coffee', name: 'Café', icon: Coffee },
		{ id: 'Heart', name: 'Salud', icon: Heart },
		{ id: 'Music', name: 'Música', icon: Music },
		{ id: 'Camera', name: 'Fotos', icon: Camera },
		{ id: 'Book', name: 'Educación', icon: Book },
		{ id: 'Dumbbell', name: 'Ejercicio', icon: Dumbbell },
		{ id: 'Palette', name: 'Arte', icon: Palette },
		{ id: 'Wrench', name: 'Herramientas', icon: Wrench },
		{ id: 'Smartphone', name: 'Teléfono', icon: Smartphone },
		{ id: 'Laptop', name: 'Tecnología', icon: Laptop },
		{ id: 'PiggyBank', name: 'Ahorros', icon: PiggyBank },
		{ id: 'CreditCard', name: 'Tarjeta', icon: CreditCard },
		{ id: 'Wallet', name: 'Billetera', icon: Wallet },
		{ id: 'TrendingUp', name: 'Inversiones', icon: TrendingUp },
		{ id: 'Fuel', name: 'Combustible', icon: Fuel },
		{ id: 'Bus', name: 'Colectivo', icon: Bus },
		{ id: 'Baby', name: 'Bebé', icon: Baby },
		{ id: 'PawPrint', name: 'Mascotas', icon: PawPrint },
		{ id: 'Shirt', name: 'Ropa', icon: Shirt },
		{ id: 'Pill', name: 'Salud', icon: Pill },
		{ id: 'GraduationCap', name: 'Educación', icon: GraduationCap },
		{ id: 'Building2', name: 'Alquiler', icon: Building2 },
		{ id: 'Receipt', name: 'Facturas', icon: Receipt },
		{ id: 'ShoppingBag', name: 'Compras', icon: ShoppingBag },
		{ id: 'Landmark', name: 'Banco', icon: Landmark },
	];


export const availableColors = [
	{ id: 'bg-orange-500', class: 'bg-orange-500', name: 'Naranja', hex: '#f97316' },
	{ id: 'bg-green-500', class: 'bg-green-500', name: 'Verde', hex: '#22c55e' },
	{ id: 'bg-blue-500', class: 'bg-blue-500', name: 'Azul', hex: '#3b82f6' },
	{ id: 'bg-purple-500', class: 'bg-purple-500', name: 'Morado', hex: '#a855f7' },
	{ id: 'bg-red-500', class: 'bg-red-500', name: 'Rojo', hex: '#ef4444' },
	{ id: 'bg-yellow-500', class: 'bg-yellow-500', name: 'Amarillo', hex: '#eab308' },
	{ id: 'bg-pink-500', class: 'bg-pink-500', name: 'Rosa', hex: '#ec4899' },
	{ id: 'bg-indigo-500', class: 'bg-indigo-500', name: 'Índigo', hex: '#6366f1' },
	{ id: 'bg-gray-500', class: 'bg-gray-500', name: 'Gris', hex: '#6b7280' },
	{ id: 'bg-cyan-500', class: 'bg-cyan-500', name: 'Cian', hex: '#06b6d4' },
	{ id: 'bg-emerald-500', class: 'bg-emerald-500', name: 'Esmeralda', hex: '#10b981' },
	{ id: 'bg-violet-500', class: 'bg-violet-500', name: 'Violeta', hex: '#8b5cf6' },
	{ id: 'bg-teal-500', class: 'bg-teal-500', name: 'Verde azulado', hex: '#14b8a6' },
	{ id: 'bg-lime-500', class: 'bg-lime-500', name: 'Lima', hex: '#84cc16' },
	{ id: 'bg-amber-500', class: 'bg-amber-500', name: 'Ámbar', hex: '#f59e0b' },
	{ id: 'bg-rose-500', class: 'bg-rose-500', name: 'Rosa fuerte', hex: '#f43f5e' },
	{ id: 'bg-sky-500', class: 'bg-sky-500', name: 'Celeste', hex: '#0ea5e9' },
	{ id: 'bg-fuchsia-500', class: 'bg-fuchsia-500', name: 'Fucsia', hex: '#d946ef' },
	{ id: 'bg-slate-500', class: 'bg-slate-500', name: 'Pizarra', hex: '#64748b' },
	{ id: 'bg-stone-500', class: 'bg-stone-500', name: 'Piedra', hex: '#78716c' },
];

export const quickFilters = [
	{ id: "today", label: "Hoy" },
	{ id: "week", label: "Última semana" },
	{ id: "month", label: "Últimos 30 días" },
	{ id: "3months", label: "Últimos 3 meses" },
	{ id: "6months", label: "Últimos 6 meses" },
	{ id: "ever", label: "TEST: Ever" },
]

// Cool af formated number
export function formatToBalance(balance: number) {
	const formatted = new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 0,
	}).format(balance);

	// if (!balance && balance !== 0) return '';
	// const numValue = typeof balance === 'string' ? parseFloat(balance) : balance;
	// if (isNaN(numValue)) return '';

	// return numValue.toLocaleString('es-AR', { // toLocaleString with Spanish Argentina format (dots for thousands, comma for decimal)
	// 	minimumFractionDigits: 0,
	// 	maximumFractionDigits: 2,
	// });

	return formatted;
}

// Format number to Argentine format string (for programmatic setValue)
export function formatNumberToInput(num: number): string {
	if (!num) return '';

	// Convert to string with 2 decimals
	const fixed = num.toFixed(2);
	const [integer, decimal] = fixed.split('.');

	// Add dots as thousands separators
	const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	// Return with comma as decimal separator
	return `${formattedInteger},${decimal}`;
}
