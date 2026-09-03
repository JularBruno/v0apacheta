export interface ProjectScreenshot {
	title: string
	description: string
	/**
	 * Optional image for this screen, relative to /public.
	 * Convention: `/portfolio/<slug>/<file>` (e.g. "/portfolio/cyberpsi/turnos.webp").
	 * When omitted, the case study renders a gradient placeholder from appScreenColor.
	 */
	image?: string
}

export interface Project {
	slug: string
	title: string
	description: string
	category: string
	technologies: string[]
	/** Tailwind gradient stops, e.g. "from-teal-500 to-cyan-600" — see tailwind.config safelist. */
	appScreenColor: string
	/** Optional cover image for the grid card, relative to /public. */
	cover?: string
	problema: string
	objetivo: string
	solucion: string
	resultado: string
	screenshots: ProjectScreenshot[]
}

export const projects: Project[] = [
	{
		slug: "cyberpsi",
		title: "CyberPsi",
		description:
			"Plataforma de salud mental con videollamadas, turnos y gestión de profesionales.",
		category: "Healthcare",
		technologies: ["Next.js", "React Native", "Node.js", "PostgreSQL", "WebRTC"],
		appScreenColor: "from-teal-500 to-cyan-600",

		problema:
			"La demanda de atención psicológica aumentó considerablemente y no existían herramientas digitales locales enfocadas en salud mental.",

		objetivo:
			"Crear una plataforma simple y accesible para conectar pacientes con psicólogos verificados mediante herramientas digitales.",

		solucion:
			"Desarrollamos una plataforma web y móvil con perfiles profesionales, sistema de turnos, videollamadas, autenticación social, panel administrativo y filtros avanzados de búsqueda.",

		resultado:
			"La plataforma permitió digitalizar el acceso a atención psicológica y establecer alianzas con instituciones y profesionales regionales.",

		screenshots: [
			{
				title: "Búsqueda de Profesionales",
				description: "Filtros por especialidad y disponibilidad",
			},
			{
				title: "Perfil Profesional",
				description: "Información, horarios y reservas",
			},
			{
				title: "Videollamadas",
				description: "Sesiones online integradas en la plataforma",
			},
			{
				title: "Panel Administrativo",
				description: "Gestión de usuarios y profesionales",
			},
		],
	},
	{
		slug: "azul-refrigeracion",
		title: "Azul Refrigeración",
		description:
			"Sistema administrativo para gestión de ventas, productos, empleados y permisos.",
		category: "Admin Panel",
		technologies: ["Next.js", "PostgreSQL", "Node.js", "TypeScript"],
		appScreenColor: "from-sky-500 to-blue-600",

		problema:
			"El negocio utilizaba procesos manuales y sistemas desconectados, sin control de permisos ni trazabilidad sobre las ventas realizadas.",

		objetivo:
			"Centralizar la gestión del negocio mediante un panel administrativo con control de acceso por empleado y administración completa de operaciones.",

		solucion:
			"Desarrollamos un sistema con autenticación de empleados, permisos por módulo, gestión de productos, ventas, clientes y categorías, incluyendo trazabilidad de operaciones y herramientas para actualización de precios.",

		resultado:
			"Se optimizó el flujo de trabajo diario, mejorando el control operativo, reduciendo errores y agilizando el proceso de ventas.",

		screenshots: [
			{
				title: "Dashboard Principal",
				description: "Resumen de actividad y métricas del negocio",
			},
			{
				title: "Gestión de Empleados",
				description: "Administración de usuarios y permisos",
			},
			{
				title: "Ventas",
				description: "Registro y control de ventas realizadas",
			},
			{
				title: "Productos",
				description: "Gestión de catálogo y actualización de precios",
			},
		],
	},
	{
		slug: "disfren",
		title: "Disfren",
		description:
			"Sistema ecommerce y administrador para control de stock, productos y compras.",
		category: "Ecommerce",
		technologies: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"],
		appScreenColor: "from-orange-500 to-red-600",

		problema:
			"El negocio necesitaba centralizar la gestión de productos, stock y compras, además de mejorar la experiencia de compra online.",

		objetivo:
			"Desarrollar una plataforma ecommerce con panel administrativo para gestionar productos, stock, proveedores y pedidos.",

		solucion:
			"Creamos un ecommerce con carrito de compras, autenticación de usuarios, buscador de productos y un panel administrativo con control de stock, actualización porcentual de precios por proveedor y gestión de productos.",

		resultado:
			"Se mejoró la administración interna del catálogo y se optimizó la experiencia de compra para los usuarios finales.",

		screenshots: [
			{
				title: "Catálogo de Productos",
				description: "Visualización y búsqueda de productos",
			},
			{
				title: "Carrito de Compras",
				description: "Proceso de compra y gestión de pedidos",
			},
			{
				title: "Panel Administrativo",
				description: "Gestión de stock, productos y proveedores",
			},
			{
				title: "Actualización de Precios",
				description: "Herramienta para aumentos porcentuales por proveedor",
			},
		],
	},
	{
		slug: "latlong",
		title: "LatLong",
		description:
			"Sistema de mapeo geográfico para registro y seguimiento de especies vegetales y zonas de conservación.",
		category: "Geospatial",
		technologies: ["Next.js", "Leaflet", "Node.js", "PostgreSQL"],
		appScreenColor: "from-green-600 to-emerald-700",

		problema:
			"La información sobre ubicaciones de especies y zonas de conservación se encontraba dispersa y sin herramientas visuales de seguimiento geográfico.",

		objetivo:
			"Crear una plataforma de mapas interactivos para registrar, organizar y visualizar ubicaciones específicas relacionadas con conservación y aprovechamiento de plantas.",

		solucion:
			"Desarrollamos un sistema basado en mapas con cuadrículas y puntos georreferenciados para registrar especies, observaciones y zonas de interés, permitiendo una visualización clara y organizada del territorio.",

		resultado:
			"La plataforma facilitó el relevamiento y seguimiento de ubicaciones estratégicas para conservación, reproducción y aprovechamiento de especies vegetales.",

		screenshots: [
			{
				title: "Mapa Principal",
				description: "Visualización geográfica de ubicaciones registradas",
			},
			{
				title: "Registro de Puntos",
				description: "Carga de coordenadas e información asociada",
			},
			{
				title: "Cuadrículas",
				description: "Organización territorial para relevamientos",
			},
			{
				title: "Detalle de Ubicación",
				description: "Información específica de cada punto registrado",
			},
		],
	},
	{
		slug: "mineros",
		title: "Mineros",
		description:
			"Plataforma para alquiler de rigs de minería y gestión de hardware para Ethereum.",
		category: "Fintech",
		technologies: ["Next.js", "Node.js", "PostgreSQL", "WebSockets"],
		appScreenColor: "from-orange-500 to-amber-600",

		problema:
			"La minería de criptomonedas requería infraestructura técnica y energética difícil de administrar para usuarios particulares.",

		objetivo:
			"Permitir a usuarios alquilar rigs profesionales para minería de Ethereum reduciendo costos operativos y mejorando rendimiento.",

		solucion:
			"Desarrollamos una plataforma para administración de rigs, seguimiento de rendimiento y gestión de alquileres, ofreciendo acceso simplificado a infraestructura profesional de minería.",

		resultado:
			"La plataforma permitió centralizar la operación de equipos de minería y facilitar el acceso a usuarios interesados en participar del ecosistema cripto.",

		screenshots: [
			{
				title: "Dashboard",
				description: "Resumen de rigs y rendimiento",
			},
			{
				title: "Gestión de Equipos",
				description: "Administración de hardware de minería",
			},
			{
				title: "Estadísticas",
				description: "Monitoreo de rendimiento y consumo",
			},
			{
				title: "Panel de Usuario",
				description: "Seguimiento de alquileres y ganancias",
			},
		],
	},
	{
		slug: "radiotania",
		title: "RadioTania",
		description:
			"Plataforma cultural y radial con administración de eventos y contenidos.",
		category: "Media",
		technologies: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"],
		appScreenColor: "from-fuchsia-600 to-purple-700",

		problema:
			"El proyecto cultural necesitaba una plataforma digital para difundir contenido radial y administrar eventos y actividades relacionadas.",

		objetivo:
			"Crear una web institucional y cultural para difusión radial, programación y administración de eventos.",

		solucion:
			"Desarrollamos una plataforma web con gestión de contenidos, administración de eventos y estructura orientada a difusión cultural y educativa.",

		resultado:
			"La plataforma permitió fortalecer la presencia digital del proyecto y centralizar la comunicación de actividades culturales y radiales.",

		screenshots: [
			{
				title: "Inicio",
				description: "Presentación institucional y programación",
			},
			{
				title: "Eventos",
				description: "Listado y detalle de eventos culturales",
			},
			{
				title: "Administrador",
				description: "Gestión de contenidos y eventos",
			},
			{
				title: "Programación Radial",
				description: "Información sobre programas y actividades",
			},
		],
	},
	{
		slug: "hermes-capital",
		title: "Hermes Capital",
		description:
			"Plataforma inmobiliaria y administrativa para gestión de propiedades, eventos e inversiones.",
		category: "Real Estate",
		technologies: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"],
		appScreenColor: "from-zinc-700 to-black",

		problema:
			"La empresa necesitaba centralizar propiedades, oportunidades y eventos en una plataforma moderna con administración interna y presencia digital profesional.",

		objetivo:
			"Desarrollar una plataforma inmobiliaria escalable con panel administrativo y experiencia web enfocada en propiedades, inversiones y eventos.",

		solucion:
			"Diseñamos y desarrollamos una plataforma con catálogo de propiedades, secciones luxury y liquidación, gestión de eventos y oportunidades, panel administrativo con CRUD completo y estructura preparada para integración con API y base de datos.",

		resultado:
			"La plataforma permitió profesionalizar la presencia digital de la empresa y centralizar la gestión de contenido inmobiliario e institucional.",

		screenshots: [
			{
				title: "Inicio",
				description: "Landing principal con propiedades destacadas",
			},
			{
				title: "Catálogo de Propiedades",
				description: "Listado y navegación de propiedades",
			},
			{
				title: "Panel Administrativo",
				description: "Gestión de propiedades, eventos y oportunidades",
			},
			{
				title: "Detalle de Propiedad",
				description: "Vista completa con imágenes e información",
			},
		],
	},
	{
		slug: "itr",
		title: "iTR",
		description:
			"Sistema administrativo y de ventas para gestión de stock, productos y proveedores.",
		category: "Business Management",
		technologies: ["Angular", "Node.js", "PostgreSQL", "TypeScript"],
		appScreenColor: "from-indigo-500 to-violet-700",

		problema:
			"El negocio necesitaba controlar stock, ventas y proveedores desde un sistema centralizado y adaptable al trabajo diario.",

		objetivo:
			"Crear una herramienta administrativa para gestionar productos, ventas, clientes, proveedores y control de stock.",

		solucion:
			"Desarrollamos un sistema administrativo con control de productos y subproductos, actualización automática de precios según dólar, historial de ventas, control de deuda con proveedores, generación de facturas PDF y permisos diferenciados para administradores y encargados.",

		resultado:
			"El sistema permitió mejorar el control operativo, automatizar procesos de ventas y obtener trazabilidad completa sobre stock e ingresos.",

		screenshots: [
			{
				title: "Panel de Ventas",
				description: "Registro y administración de ventas",
			},
			{
				title: "Gestión de Productos",
				description: "Control de stock y precios",
			},
			{
				title: "Clientes y Proveedores",
				description: "Administración de contactos y deuda",
			},
			{
				title: "Reportes",
				description: "Filtrado de ventas e ingresos",
			},
		],
	},
	{
		slug: "amoresvida",
		title: "AmorEsVida",
		description: "Sitio web institucional optimizado para SEO y campañas publicitarias.",
		category: "Landing Page",
		technologies: ["HTML", "CSS", "JavaScript", "Firebase Hosting"],
		appScreenColor: "from-pink-500 to-rose-600",

		problema:
			"La marca necesitaba una presencia digital moderna y optimizada para campañas de marketing y posicionamiento online.",

		objetivo:
			"Desarrollar una página web visualmente atractiva, adaptable a dispositivos móviles y optimizada para SEO.",

		solucion:
			"Creamos una single page application responsiva con estructura SEO-friendly, optimizada para Google Ads y preparada para despliegue rápido mediante Firebase Hosting.",

		resultado:
			"La web permitió mejorar la presencia digital de la marca y facilitar campañas publicitarias y captación de clientes.",

		screenshots: [
			{
				title: "Landing Principal",
				description: "Presentación visual de la marca",
			},
			{
				title: "Secciones Informativas",
				description: "Contenido institucional y comercial",
			},
			{
				title: "Versión Mobile",
				description: "Diseño responsive para dispositivos móviles",
			},
			{
				title: "SEO y Performance",
				description: "Optimización para buscadores y velocidad",
			},
		],
	},
]

export function getProjectBySlug(slug: string): Project | undefined {
	return projects.find((p) => p.slug === slug)
}

/** Previous / next project for the case-study footer navigation (wraps around). */
export function getAdjacentProjects(slug: string): {
	prev: Project | undefined
	next: Project | undefined
} {
	const i = projects.findIndex((p) => p.slug === slug)
	if (i === -1) return { prev: undefined, next: undefined }
	return {
		prev: projects[(i - 1 + projects.length) % projects.length],
		next: projects[(i + 1) % projects.length],
	}
}
