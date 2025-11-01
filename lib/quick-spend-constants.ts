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
  ];

export const availableColors = [
  { id: 'bg-orange-500', class: 'bg-orange-500', name: 'Naranja' },
  { id: 'bg-green-500', class: 'bg-green-500', name: 'Verde' },
  { id: 'bg-blue-500', class: 'bg-blue-500', name: 'Azul' },
  { id: 'bg-purple-500', class: 'bg-purple-500', name: 'Morado' },
  { id: 'bg-red-500', class: 'bg-red-500', name: 'Rojo' },
  { id: 'bg-yellow-500', class: 'bg-yellow-500', name: 'Amarillo' },
  { id: 'bg-pink-500', class: 'bg-pink-500', name: 'Rosa' },
  { id: 'bg-indigo-500', class: 'bg-indigo-500', name: 'Índigo' },
  { id: 'bg-gray-500', class: 'bg-gray-500', name: 'Gris' },
  { id: 'bg-cyan-500', class: 'bg-cyan-500', name: 'Cian' },
  { id: 'bg-emerald-500', class: 'bg-emerald-500', name: 'Esmeralda' },
  { id: 'bg-violet-500', class: 'bg-violet-500', name: 'Violeta' },
];

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
};

export function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
