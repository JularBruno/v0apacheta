"use client"

import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import MapStep from "@/components/map/map-step"
import {
	Map,
	Wallet,
	PiggyBank,
	CreditCard,
	TrendingUp,
	Mountain,
	DollarSign,
	HandCoins,
	Scale,
	BarChart,
	ChevronLeft,
	ChevronRight,
	BookOpen,
	Target,
	Shield,
	CalendarDays,
	Heart,
	Rocket,
	Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/app/dashboard/dashboardContext"

// All steps derived 1:1 from map-context.json
// status is hardcoded for now — will be driven by validation logic in next iteration
// 1.0 and 1.2 are "unlocked" to preview both button types (fallback + primary)
const mapSteps = [

	// ─── Stage 1: Conocé el camino ───────────────────────────────────────────
	{
		id: "stage-1",
		level: "—",
		title: "Conocé el camino",
		description: "El primer paso es mirar.",
		longDescription: "No podés mejorar lo que no ves. Antes de cualquier plan, hay que saber dónde está el dinero.",
		appInstruction: undefined,
		validationButton: undefined,
		validationFallback: undefined,
		status: "completed" as const,
		icon: Map,
		type: "chapter" as const,
		stage: 1,
	},
	{
		id: "1.0",
		level: "1.0",
		title: "Primera Apacheta",
		description: "Bienvenido al camino. Acá empieza todo.",
		longDescription: "El mapa te va a guiar paso a paso. Cada apacheta es una piedra que vos colocás en el camino — una acción real que ya hiciste. Seguí el mapa, seguí las apachetas. Activá las notificaciones para que el camino te acompañe — te van a recordar anotar tus gastos y avisar cuando completés una apacheta.",
		appInstruction: "Cómo instalar Apacheta en tu celular:\n\nAndroid (Chrome): tocá el menú ⋮ → \"Instalar app\" o \"Agregar a pantalla de inicio\".\n\niOS (Safari): tocá el botón de compartir ↑ → \"Agregar a inicio\".\n\nUna vez instalada, activá las notificaciones con el botón de abajo.",
		validationButton: "Continuar",
		validationFallback: "Continuar sin notificaciones",
		customComponent: "notification-button" as const,
		status: "unlocked" as const,
		icon: Map,
		type: "major" as const,
		stage: 1,
	},
	{
		id: "1.1",
		level: "1.1",
		title: "Empezá a registrar",
		description: "Anotá lo que entra y lo que sale. Cada día.",
		longDescription: "La mayoría de las personas no sabe a dónde va su dinero. Anotar cada movimiento — por pequeño que sea — cambia eso. No es un presupuesto todavía. Es solo mirar. Este hábito, sostenido en el tiempo, va a cambiar cómo tomás decisiones con el dinero.",
		appInstruction: "Seguí los sub-pasos para configurar tu punto de partida.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: BookOpen,
		type: "major" as const,
		stage: 1,
	},
	{
		id: "1.1.1",
		level: "1.1.1",
		title: "¿Cuál es tu balance actual?",
		description: "Tu punto de partida: cuánto tenés ahora mismo.",
		longDescription: "El balance personal es todo lo que tenés disponible: el efectivo en tu billetera, lo que tenés en el banco, y cualquier plata que considerás tuya en este momento. No son inversiones ni deudas — eso viene después. Solo: si tuvieras que contar lo que tenés hoy, ¿cuánto sería? Ese número es tu punto de partida.",
		appInstruction: "Inicio → tocá tu balance → editá y poné tu balance actual en pesos.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: DollarSign,
		type: "minor" as const,
		stage: 1,
	},
	{
		id: "1.1.2",
		level: "1.1.2",
		title: "Anotá tu ingreso del mes",
		description: "¿Cuánto entra este mes? Ese es el techo de todo lo demás.",
		longDescription: "El ingreso es el límite de tu vida financiera. Todo lo que planeás — gastos, ahorros, inversiones — tiene que caber dentro de ese número. Anotá tu sueldo, honorarios, o cualquier ingreso que recibiste este mes. Si ya arrancaste el mes, podés poner la fecha correspondiente al momento en que lo recibiste.",
		appInstruction: "Inicio → Quick Spend Card → tipo Ingreso → ingresá el monto con la fecha correcta.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: TrendingUp,
		type: "minor" as const,
		stage: 1,
	},
	{
		id: "1.1.3",
		level: "1.1.3",
		title: "Anotá un gasto",
		description: "Por donde empieza el control: saber a dónde va la plata.",
		longDescription: "La mayoría de las personas subestima sus gastos en un 30 a 50%. Anotar rompe esa ilusión. Elegí una categoría que represente ese gasto — o creá una nueva si no existe. No hay gastos vergonzosos. El punto es verlos. Con el tiempo, estos registros van a mostrar patrones que hoy no ves.",
		appInstruction: "Inicio → Quick Spend Card → tipo Gasto → elegí o creá una categoría → guardá.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: HandCoins,
		type: "minor" as const,
		stage: 1,
	},
	{
		id: "1.1.4",
		level: "1.1.4",
		title: "Seguí registrando",
		description: "El hábito es lo que cambia todo, no el conocimiento.",
		longDescription: "Un día de registro no sirve. Una semana ya empieza a revelar algo. Un mes te da un cuadro completo. El desafío ahora es sostener el hábito: anotar cada gasto el día que sucede, no a fin de mes de memoria. Podés activar o desactivar los recordatorios en Configuración para que la app te ayude a no olvidarte.",
		appInstruction: "Configuración → Notificaciones → activá el recordatorio diario de registro.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: CalendarDays,
		type: "minor" as const,
		stage: 1,
	},
	{
		id: "1.2",
		level: "1.2",
		title: "Gastá menos de lo que ganás",
		description: "La regla de la abuela. La única regla que importa.",
		longDescription: "Esto no es matemática. Es comportamiento. Si gastás más de lo que ganás — aunque sea poquito, aunque sea en cuotas — estás construyendo una deuda que crece sola. Si gastás menos, tenés un sobrante. Y ese sobrante es el material con el que se construye cualquier libertad financiera. No hay app, ni inversión, ni truco que reemplace esta regla.",
		appInstruction: "Revisá tu balance en Inicio. ¿Tu balance creció o bajó desde que empezaste a registrar?",
		validationButton: "Entendido, siguiente apacheta",
		validationFallback: undefined,
		status: "unlocked" as const,
		icon: Lightbulb,
		type: "chapter" as const,
		stage: 1,
	},

	// ─── Stage 2: Presupuesto ─────────────────────────────────────────────────
	{
		id: "stage-2",
		level: "—",
		title: "Presupuesto — Gestioná tus recursos",
		description: "Dale un nombre a cada peso antes de gastarlo.",
		longDescription: "Un presupuesto no es una restricción. Es un plan para gastar en lo que importa y no gastar en lo que no importa.",
		appInstruction: undefined,
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Wallet,
		type: "chapter" as const,
		stage: 2,
	},
	{
		id: "2.0",
		level: "2.0",
		title: "Hacé un presupuesto",
		description: "Antes de que empiece el mes, cada peso ya tiene un destino.",
		longDescription: "Un presupuesto de base cero significa que tu ingreso menos todos tus gastos planeados da cero. Cada peso tiene un nombre: alquiler, comida, transporte, ahorro. No sobra plata sin nombre porque la plata sin nombre siempre se gasta en algo que no importa. Esto no es restricción — es intención.",
		appInstruction: "Presupuesto → configurá un límite para cada categoría de gasto que tengas.",
		validationButton: "Entendido, voy a hacerlo",
		validationFallback: undefined,
		status: "locked" as const,
		icon: Wallet,
		type: "major" as const,
		stage: 2,
	},
	{
		id: "2.1",
		level: "2.1",
		title: "Dale un nombre a cada peso",
		description: "Asigná un límite a cada categoría de gasto.",
		longDescription: "Entrá a Presupuesto y poné un número en al menos 3 categorías de gasto. No tiene que ser perfecto — el primer presupuesto nunca lo es. Lo importante es que exista. El mes que viene lo ajustás con lo que aprendiste este mes.",
		appInstruction: "Presupuesto → seleccioná una categoría → asigná un monto máximo mensual → repetí para al menos 3 categorías.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Target,
		type: "minor" as const,
		stage: 2,
	},
	{
		id: "2.2",
		level: "2.2",
		title: "Sabé cuánto te queda",
		description: "El presupuesto solo sirve si lo mirás mientras gastás.",
		longDescription: "Configuraste tus límites. Ahora cada vez que gastás en una categoría, el presupuesto te muestra cuánto te queda. La sugerencia de gasto diario te dice: si dividís lo que resta entre los días que faltan, ¿cuánto podés gastar por día sin pasarte? Este número te ayuda a tomar decisiones en el momento.",
		appInstruction: "Presupuesto → mirá la barra de progreso de cada categoría y la sugerencia de gasto diario.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: BarChart,
		type: "minor" as const,
		stage: 2,
	},
	{
		id: "2.3",
		level: "2.3",
		title: "Revisá tu historial",
		description: "Los patrones solo aparecen cuando tenés suficientes datos.",
		longDescription: "Tu historial de gastos es un espejo. Filtrarlo por categoría revela dónde va más plata de lo que creías. Este es el input más honesto para ajustar tu presupuesto el mes que viene. No te juzgues — usá lo que ves para decidir mejor.",
		appInstruction: "Historial → filtrá por categoría → identificá dónde gastaste más de lo planeado.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: BarChart,
		type: "minor" as const,
		stage: 2,
	},
	{
		id: "2.4",
		level: "2.4",
		title: "Gastá en papel antes que en la realidad",
		description: "El próximo mes, planealo antes de que empiece.",
		longDescription: "El presupuesto más poderoso es el que hacés antes de que empiece el mes. No a fin de mes mirando qué pasó — antes de que empiece, decidiendo qué va a pasar. Sentate unos minutos antes del primero de cada mes y asigná cada peso de tu ingreso esperado. El mes que viene va a ser diferente.",
		appInstruction: "Antes de fin de mes → Presupuesto → actualizá los límites para el mes siguiente según lo que aprendiste.",
		validationButton: "Lo voy a hacer, siguiente apacheta",
		validationFallback: undefined,
		status: "locked" as const,
		icon: CalendarDays,
		type: "chapter" as const,
		stage: 2,
	},

	// ─── Stage 3: Protección ──────────────────────────────────────────────────
	{
		id: "stage-3",
		level: "—",
		title: "Protección — Antes de crecer, protegerse",
		description: "Construí el escudo. Después escalá.",
		longDescription: "Sin fondo de emergencia, cualquier imprevisto te manda de vuelta a cero. Sin salir de la deuda, el interés te roba el futuro.",
		appInstruction: undefined,
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Shield,
		type: "chapter" as const,
		stage: 3,
	},
	{
		id: "3.0",
		level: "3.0",
		title: "Conocé tu patrimonio",
		description: "El número real: lo que tenés menos lo que debés.",
		longDescription: "El patrimonio neto es el único número financiero que importa a largo plazo. Es simple: todo lo que tenés (activos) menos todo lo que debés (pasivos). Puede ser negativo al principio — eso no es un fracaso, es el punto de partida honesto. El objetivo del camino es que ese número crezca, mes a mes.",
		appInstruction: "Patrimonio → explorá la página. Vas a ver tus activos, tus pasivos, y tu patrimonio neto.",
		validationButton: "Entendí, voy a empezar a cargarlo",
		validationFallback: undefined,
		status: "locked" as const,
		icon: Scale,
		type: "major" as const,
		stage: 3,
	},
	{
		id: "3.1",
		level: "3.1",
		title: "Fondo de emergencia inicial",
		description: "Antes de atacar deudas: un colchón mínimo para no volver a endeudarte.",
		longDescription: "Antes de pagar deudas agresivamente, necesitás un fondo mínimo de emergencia — el equivalente a unos $500–$1000 USD en pesos o dólares. ¿Por qué? Porque si no tenés ese colchón, cualquier emergencia (el auto, la salud, un electrodoméstico) te va a hacer volver al crédito. Es un escudo, no una inversión. Guardalo en algo líquido: caja de ahorro, billetera virtual, o efectivo dolarizado.",
		appInstruction: "Patrimonio → Nuevo activo → nombralo 'Fondo de emergencia inicial' → ingresá el monto que tenés ahorrado para esto.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: PiggyBank,
		type: "minor" as const,
		stage: 3,
	},
	{
		id: "3.2",
		level: "3.2",
		title: "¿Tenés deudas?",
		description: "Antes de seguir, hay que saber con qué se está lidiando.",
		longDescription: "Las deudas de consumo — tarjeta de crédito, préstamos personales, cuotas — tienen tasas que en Argentina pueden superar el 100% anual. La deuda crece más rápido de lo que cualquier inversión puede rendir. No es una tragedia tener deuda. Pero hay que saber exactamente cuánto es, a qué tasa, y con quién. El primer paso es verlo.",
		appInstruction: "Patrimonio → Nuevo pasivo → cargá cada deuda con su nombre y monto actual. Si no tenés deudas, tocá 'No tengo deudas'.",
		validationButton: undefined,
		validationFallback: "No tengo deudas, continuar",
		status: "locked" as const,
		icon: CreditCard,
		type: "minor" as const,
		stage: 3,
	},
	{
		id: "3.3",
		level: "3.3",
		title: "Fondo de emergencia completo",
		description: "3 a 6 meses de gastos. Tu verdadero escudo.",
		longDescription: "Con el fondo inicial armado y tus deudas visibles, ahora construís el fondo real. 3 meses de gastos esenciales como mínimo, 6 meses como ideal. Este fondo te da tiempo: si perdés el trabajo, no entrás en pánico en el primer mes. En Argentina, el desafío es que los pesos pierden valor. Opciones: dolarizar una parte, plazo fijo UVA, o FCI de ahorro con rendimiento por encima de la inflación.",
		appInstruction: "Seguidor de Ahorro → creá un objetivo 'Fondo de emergencia completo' → calculá 3 veces tus gastos mensuales fijos y poné eso como meta.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Shield,
		type: "minor" as const,
		stage: 3,
	},
	{
		id: "3.4",
		level: "3.4",
		title: "Liquidá tus deudas",
		description: "El interés trabaja para vos o contra vos. Elegí.",
		longDescription: "Con el fondo de emergencia construido, ahora atacás las deudas. Dos métodos: Bola de nieve — pagás primero la deuda más chica, ganás momentum psicológico y vas tachando. Avalancha — pagás primero la deuda con mayor tasa, pagás menos interés total. En Argentina con tasas altísimas, la avalancha tiene sentido matemático. Pero si necesitás motivación, la bola de nieve también funciona.",
		appInstruction: "Patrimonio → seleccioná cada pasivo → actualizá el saldo a medida que vas pagando → el objetivo es llegar a $0 en todos.",
		validationButton: undefined,
		validationFallback: "Liquidé todas mis deudas",
		status: "locked" as const,
		icon: CreditCard,
		type: "minor" as const,
		stage: 3,
	},
	{
		id: "3.5",
		level: "3.5",
		title: "Cómo salir de la deuda",
		description: "Las herramientas y la mentalidad para liberarse.",
		longDescription: "Independientemente de si tenés deuda ahora o no, esto conviene entenderlo. La deuda de consumo es el mayor obstáculo a la libertad financiera. No porque sea un fracaso moral — sino porque el interés compuesto trabaja en tu contra con fuerza brutal. Conocer los métodos y la psicología detrás de salir de deuda te prepara para no volver a entrar.",
		appInstruction: "Si tenés deudas cargadas en Patrimonio, elegí un método (bola de nieve o avalancha) y comprometete con él.",
		validationButton: "Entendido, siguiente apacheta",
		validationFallback: undefined,
		status: "locked" as const,
		icon: BookOpen,
		type: "minor" as const,
		stage: 3,
	},
	{
		id: "3.6",
		level: "3.6",
		title: "Métodos para ahorrar",
		description: "El ahorro no es lo que sobra. Es lo primero que separás.",
		longDescription: "Pagarte a vos mismo primero: el día que te depositan el sueldo, antes de pagar cualquier otra cosa, transferís tu porcentaje de ahorro a una cuenta o instrumento separado. Si esperás a ver qué sobra al final del mes, no va a sobrar nada. El ahorro automático convierte la intención en hábito.",
		appInstruction: "Seguidor de Ahorro → creá metas para cada objetivo que tengas (viaje, electrodoméstico, emprendimiento) → definí cuánto podés aportar por mes.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: PiggyBank,
		type: "minor" as const,
		stage: 3,
	},

	// ─── Stage 4: Crecimiento ─────────────────────────────────────────────────
	{
		id: "stage-4",
		level: "—",
		title: "Lo que enseña el camino",
		description: "El interés compuesto no perdona — ni a favor ni en contra.",
		longDescription: "Muy pocos ahorran el 25% de sus ingresos. Menos aún invierten el 25% de lo que ahorran. Los que lo hacen, con tiempo, llegan a donde los demás no pueden.",
		appInstruction: undefined,
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: TrendingUp,
		type: "chapter" as const,
		stage: 4,
	},
	{
		id: "4.0",
		level: "4.0",
		title: "El secreto que pocos aplican",
		description: "Ahorrar e invertir consistentemente es lo que separa a los que llegan.",
		longDescription: "La mayoría de las personas no ahorra sistemáticamente. De las que ahorran, muy pocas invierten. Y de las que invierten, casi ninguna mantiene el hábito en el tiempo. Pero el interés compuesto — la capacidad de que los rendimientos generen nuevos rendimientos — es exponencial, no lineal. Una pequeña diferencia en el porcentaje de ahorro o en el tiempo sostenido produce resultados enormes a 10 o 20 años. Esto no requiere ser rico para empezar. Requiere empezar.",
		appInstruction: "Patrimonio → revisá tu patrimonio neto. Ese número tiene que crecer cada mes. Ese es el objetivo.",
		validationButton: "Entendido, siguiente apacheta",
		validationFallback: undefined,
		status: "locked" as const,
		icon: TrendingUp,
		type: "major" as const,
		stage: 4,
	},
	{
		id: "4.1",
		level: "4.1",
		title: "Invertí el 15% de tus ingresos",
		description: "Hacé trabajar a tu dinero.",
		longDescription: "Con el fondo de emergencia completo y sin deudas (o con el plan en marcha), arrancás a invertir. El objetivo mínimo: 15% de tu ingreso mensual. No todo junto — de a poco, consistentemente. En Argentina, el primer objetivo de una inversión es ganarle a la inflación. Después, construir patrimonio real en pesos constantes o en dólares.",
		appInstruction: "Patrimonio → Nuevo activo → registrá tu primera inversión con nombre, tipo y monto. Actualizalo mes a mes.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: TrendingUp,
		type: "minor" as const,
		stage: 4,
	},
	{
		id: "4.2",
		level: "4.2",
		title: "Planeá 5 años adelante",
		description: "En Argentina no se planea a largo plazo. Eso es exactamente por qué hacerlo es una ventaja.",
		longDescription: "La incertidumbre económica hace que la mayoría viva mirando solo el mes que viene. Pero las decisiones financieras más importantes tienen horizonte de años: ¿qué querés tener o hacer en 5 años? ¿Un departamento? ¿Un negocio propio? ¿Educación? ¿Independencia? Un objetivo con número y fecha cambia cómo tomás decisiones hoy.",
		appInstruction: "Seguidor de Ahorro → creá un objetivo de largo plazo → poné una fecha objetivo a más de 12 meses → la app te dice cuánto aportar por mes.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: CalendarDays,
		type: "minor" as const,
		stage: 4,
	},
	{
		id: "4.3",
		level: "4.3",
		title: "Mejorá tu calidad de vida con intención",
		description: "El dinero es un medio. La calidad de vida es el fin.",
		longDescription: "Seguir el mapa no es vivir de privaciones. Es gastar con intención: más en lo que importa, menos en lo que no. Las personas que planean bien no gastan menos — a veces gastan más, pero en lo que eligieron. La calidad de vida mejora cuando el dinero fluye hacia lo que vos decidís, no hacia donde te lleva el impulso o la costumbre.",
		appInstruction: "Revisá tu historial y tu presupuesto. ¿Hay categorías donde gastás más de lo que querías? ¿Hay cosas que valorás y no estás priorizando?",
		validationButton: "Lo voy a pensar, siguiente apacheta",
		validationFallback: undefined,
		status: "locked" as const,
		icon: Heart,
		type: "minor" as const,
		stage: 4,
	},

	// ─── Stage 5: Libertad ────────────────────────────────────────────────────
	{
		id: "stage-5",
		level: "—",
		title: "Libertad — La cima",
		description: "Construí lo que dura.",
		longDescription: "La libertad financiera no es ser rico. Es que tus activos generen suficiente para cubrir tu vida sin depender de trabajo activo. Desde ahí, podés elegir.",
		appInstruction: undefined,
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Mountain,
		type: "chapter" as const,
		stage: 5,
	},
	{
		id: "5.0",
		level: "5.0",
		title: "Construí tu portafolio",
		description: "Diversificación: no apostés todo a un solo resultado.",
		longDescription: "Un portafolio es una colección de activos que trabajan juntos. Ningún instrumento gana siempre — pero una cartera diversificada pierde menos en las malas y captura crecimiento en las buenas. La regla simple para empezar: algo líquido en pesos, algo en dólares, algo que crezca con el tiempo.",
		appInstruction: "Patrimonio → asegurate de tener al menos 3 tipos de activos distintos cargados.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Scale,
		type: "major" as const,
		stage: 5,
	},
	{
		id: "5.1",
		level: "5.1",
		title: "Ahorrá para emprender",
		description: "En Argentina, el emprendimiento es un camino real hacia la libertad.",
		longDescription: "En Argentina, el emprendimiento es uno de los caminos más accesibles hacia la independencia financiera. No hace falta una idea revolucionaria — hace falta capital inicial y un plan. Si tenés una idea, ponele número: ¿cuánto necesitás para arrancar? Ese es tu próximo objetivo de ahorro.",
		appInstruction: "Seguidor de Ahorro → creá un objetivo 'Capital para emprender' → poné el monto que necesitarías para arrancar tu proyecto.",
		validationButton: undefined,
		validationFallback: "No planeo emprender ahora, continuar",
		status: "locked" as const,
		icon: Rocket,
		type: "minor" as const,
		stage: 5,
	},
	{
		id: "5.2",
		level: "5.2",
		title: "Tu fondo de retiro",
		description: "El Estado no alcanza. Construí el tuyo.",
		longDescription: "El sistema previsional argentino (ANSES) probablemente no sea suficiente cuando llegues a retirarte. No es una crítica — es una realidad que hay que planear. Empezar a construir un fondo de retiro propio desde los 30 años, con un porcentaje fijo del ingreso, hace una diferencia exponencial a los 60.",
		appInstruction: "Patrimonio → creá un activo llamado 'Fondo de retiro'. Seguidor de Ahorro → creá una meta de retiro con fecha estimada.",
		validationButton: undefined,
		validationFallback: undefined,
		status: "locked" as const,
		icon: Shield,
		type: "minor" as const,
		stage: 5,
	},
	{
		id: "5.3",
		level: "5.3",
		title: "La cima",
		description: "Libertad financiera: tus activos cubren tu vida.",
		longDescription: "Llegaste. No porque hayas terminado — el camino no termina. Sino porque entendiste los principios, los aplicaste, y tenés el hábito. La libertad financiera es el punto donde tus ingresos pasivos (rendimientos, alquileres, dividendos) cubren tus gastos. Desde ahí, el trabajo es una elección, no una obligación. Construí riqueza y aportá a los demás.",
		appInstruction: "Revisá tu patrimonio neto. ¿Está creciendo mes a mes? ¿Tus activos superan tus pasivos por un margen creciente? Eso es la dirección correcta.",
		validationButton: "Apacheta colocada",
		validationFallback: undefined,
		status: "locked" as const,
		icon: Mountain,
		type: "chapter" as const,
		stage: 5,
	},
]

const stages = [
	{ id: 1, label: "Cimientos" },
	{ id: 2, label: "Presupuesto" },
	{ id: 3, label: "Protección" },
	{ id: 4, label: "Crecimiento" },
	{ id: 5, label: "Libertad" },
]

export default function MapaPage() {
	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	useDashboard()

	const currentStep = mapSteps[currentStepIndex]

	const currentStage = useMemo(() => {
		return stages.find((s) => s.id === (currentStep as any).stage) ?? stages[0]
	}, [currentStep])

	const stageProgress = useMemo(() => {
		const totalCompleted = mapSteps.filter((s) => s.status === "completed").length
		return Math.round((totalCompleted / mapSteps.length) * 100)
	}, [])

	const handlePrev = () => setCurrentStepIndex((i) => Math.max(0, i - 1))
	const handleNext = () => setCurrentStepIndex((i) => Math.min(mapSteps.length - 1, i + 1))

	return (
		<div className="flex flex-col h-full bg-background overflow-hidden">

			{/* Trail header */}
			<div className="bg-coffee-bean-800 px-4 pt-5 pb-4 shrink-0">
				<p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">Tu camino</p>
				<h1 className="text-lg font-bold text-white mb-3">{currentStage.label}</h1>

				<div className="flex items-center gap-2">
					{stages.map((s) => {
						const stepsInStage = mapSteps.filter((step) => (step as any).stage === s.id)
						const completedInStage = stepsInStage.filter((step) => step.status === "completed").length
						const isCurrentStage = s.id === (currentStep as any).stage
						const isDone = completedInStage === stepsInStage.length

						return (
							<div key={s.id} className={cn(
								"w-2.5 h-2.5 rounded-full transition-all shrink-0",
								isDone && "bg-primary",
								isCurrentStage && !isDone && "bg-primary/60 ring-2 ring-primary/40 ring-offset-1 ring-offset-coffee-bean-800",
								!isDone && !isCurrentStage && "bg-white/20",
							)} />
						)
					})}
					<div className="flex-1 h-px bg-white/10 mx-1 relative">
						<div
							className="absolute inset-y-0 left-0 bg-primary/50 transition-all duration-500"
							style={{ width: `${stageProgress}%` }}
						/>
					</div>
					<span className="text-xs text-white/40">{stageProgress}%</span>
				</div>
			</div>

			{/* Card area */}
			<div className="flex-1 flex flex-col items-center justify-center px-3 py-4 min-h-0 overflow-hidden">
				<div className="flex items-center w-full max-w-sm md:max-w-2xl gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePrev}
						disabled={currentStepIndex === 0}
						className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
						aria-label="Paso anterior"
					>
						<ChevronLeft className="w-5 h-5" />
					</Button>

					<div className="flex-1 overflow-hidden">
						<MapStep key={currentStep.id} {...currentStep} />
					</div>

					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						disabled={currentStepIndex === mapSteps.length - 1}
						className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
						aria-label="Siguiente paso"
					>
						<ChevronRight className="w-5 h-5" />
					</Button>
				</div>

				{/* Step dots */}
				<div className="flex gap-1.5 mt-4 flex-wrap justify-center max-w-xs">
					{mapSteps.map((step, index) => (
						<button
							key={index}
							onClick={() => setCurrentStepIndex(index)}
							aria-label={`Ir a ${step.title}`}
							className={cn(
								"rounded-full transition-all duration-200 shrink-0",
								step.type === "chapter" ? "w-3 h-3 rounded-sm" : step.type === "major" ? "w-2.5 h-2.5" : "w-2 h-2",
								index === currentStepIndex
									? "bg-primary"
									: step.status === "completed"
										? "bg-primary/40"
										: "bg-border",
							)}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
