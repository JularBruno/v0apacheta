export interface ProjectScreenshot {
	title: string
	description: string
	/**
	 * Optional image for this screen, relative to /public.
	 * Convention: `/portfolio/<slug>/<file>` (e.g. "/portfolio/cyberpsi/turnos.webp").
	 * When omitted, the case study renders a gradient placeholder from appScreenColor.
	 */
	image?: string
	/** Optional video for this screen (takes priority over `image` when both are set). */
	video?: string
}

export interface Project {
	slug: string
	title: string
	description: string
	category: string
	technologies: string[]
	/** Tailwind gradient stops, e.g. "from-teal-500 to-cyan-600" — see tailwind.config safelist. */
	appScreenColor: string
	/** Optional cover image for the grid card and case-study banner, relative to /public. */
	cover?: string
	/** Optional project logo, relative to /public — shown next to the title on the case study. */
	logo?: string
	/** Optional walkthrough/demo video for the case-study banner, relative to /public. Uses `cover` as its poster frame. */
	video?: string
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
		cover: "/portfolio/cyberpsi/Untitled.png",
		logo: "/portfolio/cyberpsi/logoS.png",
		video: "/portfolio/cyberpsi/zoomVideo.mp4",

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
			{
				title: "Turnos del Profesional",
				description: "Vista del profesional: recepción y gestión de turnos entrantes",
				video: "/portfolio/cyberpsi/RecibirTurnos.mp4",
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
		cover: "/portfolio/azulrefrigeracion/03-products.png",

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
				title: "Acceso",
				description: "Login del panel administrativo",
				image: "/portfolio/azulrefrigeracion/01-login.png",
			},
			{
				title: "Categorías",
				description: "Organización de productos por categoría",
				image: "/portfolio/azulrefrigeracion/02-categories.png",
			},
			{
				title: "Productos",
				description: "Catálogo de productos con stock y actualización porcentual de precios",
				image: "/portfolio/azulrefrigeracion/03-products.png",
			},
			{
				title: "Nuevo Producto",
				description: "Alta de producto con fotos y descripción",
				image: "/portfolio/azulrefrigeracion/03b-product-new.png",
			},
			{
				title: "Clientes",
				description: "Gestión de clientes con condición fiscal",
				image: "/portfolio/azulrefrigeracion/04-clients.png",
			},
			{
				title: "Ventas",
				description: "Registro y filtrado de ventas por cliente",
				image: "/portfolio/azulrefrigeracion/05-sales.png",
			},
			{
				title: "Detalle de Venta",
				description: "Resumen de venta con deuda, lista de compra y generación de PDF",
				image: "/portfolio/azulrefrigeracion/05b-sale-detail.png",
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
		cover: "/portfolio/disfren/web-01-home.png",

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
				title: "Inicio",
				description: "Home de la tienda con catálogo destacado",
				image: "/portfolio/disfren/web-01-home.png",
			},
			{
				title: "Detalle de Producto",
				description: "Vista de producto con información y compra",
				image: "/portfolio/disfren/web-02-product-detail.png",
			},
			{
				title: "Carrito de Compras",
				description: "Proceso de compra y gestión de pedidos",
				image: "/portfolio/disfren/web-03-carrito.png",
			},
			{
				title: "Nosotros",
				description: "Información institucional de la marca",
				image: "/portfolio/disfren/web-04-about.png",
			},
			{
				title: "Acceso de Usuario",
				description: "Inicio de sesión y registro de clientes",
				image: "/portfolio/disfren/web-05-login.png",
			},
			{
				title: "Acceso Administrativo",
				description: "Login del panel administrativo",
				image: "/portfolio/disfren/adm-01-login.png",
			},
			{
				title: "Gestión de Usuarios",
				description: "Administración de cuentas y permisos",
				image: "/portfolio/disfren/adm-02-users.png",
			},
			{
				title: "Gestión de Productos",
				description: "Catálogo, stock y precios",
				image: "/portfolio/disfren/adm-03-products.png",
			},
			{
				title: "Edición de Producto",
				description: "Alta y edición de productos del catálogo",
				image: "/portfolio/disfren/adm-04-product-detail.png",
			},
			{
				title: "Proveedores",
				description: "Gestión de proveedores y actualización porcentual de precios",
				image: "/portfolio/disfren/adm-05-providers.png",
			},
			{
				title: "Compras",
				description: "Registro y control de compras a proveedores",
				image: "/portfolio/disfren/adm-06-buys.png",
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
		cover: "/portfolio/latlong/mobile-01-home-map.png",

		problema:
			"La información sobre ubicaciones de interés personal se encontraba dispersa y sin una herramienta visual simple para guardarla y consultarla en el mapa.",

		objetivo:
			"Crear una app de mapas para registrar, organizar por categorías y visualizar ubicaciones de interés desde el celular.",

		solucion:
			"Desarrollamos una app mobile con un mapa interactivo, categorías personalizables con colores propios y un flujo simple para agregar una ubicación asociándola a una categoría.",

		resultado:
			"La app permitió centralizar y organizar por categorías las ubicaciones guardadas, con acceso rápido desde el mapa.",

		screenshots: [
			{
				title: "Mapa Principal",
				description: "Mapa con las ubicaciones guardadas",
				image: "/portfolio/latlong/mobile-01-home-map.png",
			},
			{
				title: "Acciones Rápidas",
				description: "Menú flotante para agregar o listar ubicaciones",
				image: "/portfolio/latlong/mobile-02-home-fab-expanded.png",
			},
			{
				title: "Categorías",
				description: "Categorías personalizadas con color propio para clasificar ubicaciones",
				image: "/portfolio/latlong/mobile-03-categories.png",
			},
			{
				title: "Nueva Ubicación",
				description: "Alta de una ubicación con nombre y categoría",
				image: "/portfolio/latlong/mobile-04-add-location.png",
			},
			{
				title: "Selección de Categoría",
				description: "Selector de categoría al registrar una ubicación",
				image: "/portfolio/latlong/mobile-05-add-location-category-select.png",
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
		cover: "/portfolio/hermes-capital/web-01-home.png",

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
				image: "/portfolio/hermes-capital/web-01-home.png",
			},
			{
				title: "Catálogo de Propiedades",
				description: "Listado y navegación de propiedades",
				image: "/portfolio/hermes-capital/web-03-propiedades.png",
			},
			{
				title: "Propiedades en el Exterior",
				description: "Catálogo de propiedades internacionales",
				image: "/portfolio/hermes-capital/web-04-propiedades-extranjeras.png",
			},
			{
				title: "Detalle de Propiedad",
				description: "Vista completa con imágenes e información",
				image: "/portfolio/hermes-capital/web-05-propiedad-detalle.png",
			},
			{
				title: "Oportunidades",
				description: "Oportunidades de inversión destacadas",
				image: "/portfolio/hermes-capital/web-02-oportunidades.png",
			},
			{
				title: "Acceso Administrativo",
				description: "Login del panel administrativo",
				image: "/portfolio/hermes-capital/adm-01-login.png",
			},
			{
				title: "Dashboard Administrativo",
				description: "Resumen general del panel",
				image: "/portfolio/hermes-capital/adm-04-inicio.png",
			},
			{
				title: "Gestión de Propiedades",
				description: "Administración del catálogo de propiedades",
				image: "/portfolio/hermes-capital/adm-02-propiedades.png",
			},
			{
				title: "Contactos",
				description: "Gestión de contactos y oportunidades",
				image: "/portfolio/hermes-capital/adm-03-contactos.png",
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
		cover: "/portfolio/iTR/02-products.png",

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
				title: "Acceso",
				description: "Login del panel administrativo",
				image: "/portfolio/iTR/01-login.png",
			},
			{
				title: "Productos",
				description: "Catálogo de productos con stock",
				image: "/portfolio/iTR/02-products.png",
			},
			{
				title: "Subproductos",
				description: "Variantes por color y capacidad, con precio, costo y stock",
				image: "/portfolio/iTR/03-subproducts.png",
			},
			{
				title: "Proveedores",
				description: "Proveedores con historial de gasto y deuda",
				image: "/portfolio/iTR/04-suppliers.png",
			},
			{
				title: "Clientes",
				description: "Clientes con historial de compras",
				image: "/portfolio/iTR/05-customers.png",
			},
			{
				title: "Ventas",
				description: "Historial de ventas con totales en pesos y dólares",
				image: "/portfolio/iTR/06-sales.png",
			},
			{
				title: "Precio del Dólar",
				description: "Actualización manual del dólar para recalcular precios",
				image: "/portfolio/iTR/07-dolars.png",
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
		cover: "/portfolio/amoresvida/01-hero.png",

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
				title: "Hero",
				description: "Presentación visual de la marca",
				image: "/portfolio/amoresvida/01-hero.png",
			},
			{
				title: "Qué Hacemos",
				description: "Sección de servicios y propuesta de valor",
				image: "/portfolio/amoresvida/02-que-hacemos.png",
			},
			{
				title: "Quiénes Somos",
				description: "Información institucional de la marca",
				image: "/portfolio/amoresvida/03-quienes-somos.png",
			},
			{
				title: "Resultados",
				description: "Casos de éxito y métricas destacadas",
				image: "/portfolio/amoresvida/04-resultados.png",
			},
			{
				title: "Contacto",
				description: "Formulario de contacto y captación de clientes",
				image: "/portfolio/amoresvida/05-contacto.png",
			},
		],
	},
	{
		slug: "jungla",
		title: "Jungla",
		description:
			"App para un evento musical con line-up de bandas, información del lugar y entradas gratuitas.",
		category: "Events",
		technologies: ["HTML", "CSS", "JavaScript"],
		appScreenColor: "from-amber-500 to-teal-600",
		cover: "/portfolio/jungla/01-home.png",

		problema:
			"El evento necesitaba una forma simple de comunicar el line-up, el lugar y las entradas sin depender solo de redes sociales.",

		objetivo:
			"Crear una app liviana que centralice la información del evento y permita reservar la entrada gratuita desde el celular.",

		solucion:
			"Desarrollamos una app con secciones para bandas, lugar (con acceso al mapa) y entradas, con un registro para reservar la entrada gratuita y retirarla en la boletería del evento.",

		resultado:
			"Los asistentes pudieron informarse del evento y reservar su entrada desde la app, simplificando el acceso.",

		screenshots: [
			{
				title: "Inicio",
				description: "Menú principal con acceso a bandas, lugar, entradas y ayuda",
				image: "/portfolio/jungla/01-home.png",
			},
			{
				title: "Line-up de Bandas",
				description: "Bandas confirmadas para el evento",
				image: "/portfolio/jungla/02-bandas-lineup.png",
			},
			{
				title: "Lugar y Fecha",
				description: "Información del lugar del evento con acceso al mapa",
				image: "/portfolio/jungla/03-lugar-venue.png",
			},
			{
				title: "Entradas",
				description: "Registro para reservar la entrada gratuita y retirarla en boletería",
				image: "/portfolio/jungla/04-entradas-tickets-info.png",
			},
		],
	},
	{
		slug: "srbuho",
		title: "Sr. Búho",
		description: "Landing de lanzamiento musical con enlaces a plataformas de streaming.",
		category: "Music",
		technologies: ["HTML", "CSS", "JavaScript"],
		appScreenColor: "from-violet-600 to-blue-700",
		cover: "/portfolio/srbuho/02-home-hover-link.png",

		problema:
			"El lanzamiento del sencillo \"Eclipse\" necesitaba un punto de entrada único que lleve a la audiencia a las plataformas de streaming.",

		objetivo:
			"Crear una landing simple y visual centrada en la portada del disco con accesos directos a streaming.",

		solucion:
			"Desarrollamos una página de lanzamiento con la portada del disco como protagonista y enlaces directos a Spotify, YouTube y Deezer.",

		resultado:
			"La página funcionó como punto de referencia único para el lanzamiento, simplificando el acceso a la música en distintas plataformas.",

		screenshots: [
			{
				title: "Portada",
				description: "Portada del sencillo con accesos directos a Spotify, YouTube y Deezer",
				image: "/portfolio/srbuho/02-home-hover-link.png",
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
