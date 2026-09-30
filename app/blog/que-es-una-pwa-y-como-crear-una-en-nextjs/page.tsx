import type { ReactNode } from "react"
import ContentShell from "@/components/content/content-shell"
import { Callout, CodeBlock, DataTable, Faq, Glossary, Section, Summary, Toc } from "@/components/content/blocks"
import { buildMetadata } from "@/lib/content/seo"
import type { ContentSeo } from "@/lib/content/types"
import { meta } from "./meta"
import { HEADERS, IOS_METADATA, LAYOUT, MANIFEST, OFFLINE_PAGE, REGISTER, SERVICE_WORKER } from "./pwa.snippets"

export const dynamic = "force-static"

export function generateMetadata() {
	return buildMetadata(meta)
}

const seo: ContentSeo = {
	summary:
		"Una PWA (Progressive Web App) es una aplicación web que se puede instalar en el celular o la compu, abrir en su propia ventana y, con un service worker, seguir respondiendo aunque falle la conexión. En Next.js alcanza con un manifest, un service worker y HTTPS.",
	faq: [
		{
			question: "¿Necesito una librería como next-pwa para hacer una PWA en Next.js?",
			answer:
				"No para empezar: un manifest y un service worker escrito a mano alcanzan. Si más adelante querés cachear muchas rutas y archivos con estrategias más finas, hay librerías como Serwist que simplifican ese trabajo.",
		},
		{
			question: "¿Una PWA funciona en iPhone?",
			answer:
				"Sí. Se agrega desde Safari con Compartir y Agregar a inicio. Las notificaciones push en iPhone requieren iOS 16.4 o superior y que la app esté agregada a la pantalla de inicio.",
		},
		{
			question: "¿Una PWA funciona sin internet?",
			answer:
				"Solo lo que hayas guardado en caché con tu service worker. Sin un service worker que lo maneje, una PWA se comporta como un sitio común cuando no hay conexión.",
		},
		{
			question: "¿Se puede publicar una PWA en Google Play o en la App Store?",
			answer:
				"En Google Play se puede empaquetar con herramientas como Bubblewrap. La App Store de Apple es más restrictiva. De todos modos, publicarla en una tienda no es necesario para que la PWA funcione.",
		},
	],
	sources: [
		{ name: "Next.js: guía de Progressive Web Apps", url: "https://nextjs.org/docs/app/guides/progressive-web-apps" },
		{ name: "MDN: Progressive web apps", url: "https://developer.mozilla.org/es/docs/Web/Progressive_web_apps" },
		{ name: "web.dev: Learn PWA", url: "https://web.dev/learn/pwa" },
	],
}

const sections = [
	{ id: "que-es", label: "Qué es una PWA" },
	{ id: "para-que-sirve", label: "Para qué sirve" },
	{ id: "como-crear", label: "Cómo crearla con Next.js" },
	{ id: "como-probar", label: "Cómo probarla" },
	{ id: "como-instalar", label: "Cómo se instala" },
	{ id: "push", label: "Notificaciones push" },
]

function C({ children }: { children: ReactNode }) {
	return <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{children}</code>
}

export default function QueEsUnaPwaPage() {
	return (
		<ContentShell meta={meta} seo={seo}>
			<Summary text={seo.summary} />
			<Toc items={sections} />

			<Section id="que-es" heading="Qué es una PWA">
				<p>
					Una PWA es un sitio web que se comporta como una app: se instala desde el navegador, tiene su propio ícono y abre
					en su propia ventana, sin barra de direcciones. No es una tecnología nueva, sino un conjunto de capacidades del
					navegador que, combinadas, dan esa experiencia.
				</p>
				<DataTable
					caption="Las tres piezas de una PWA y dónde viven en Next.js"
					columns={["Pieza", "Qué hace", "En Next.js"]}
					rows={[
						[
							"HTTPS",
							"El navegador solo habilita service workers en sitios seguros (localhost cuenta como seguro para desarrollar).",
							"Tu hosting",
						],
						["Web App Manifest", "Define el nombre, los íconos, los colores y cómo abre la app.", "app/manifest.ts"],
						["Service worker", "Script que corre aparte de la página y habilita el modo sin conexión y las notificaciones push.", "public/sw.js"],
					]}
				/>
				<Callout title="Una PWA no es una app nativa">
					<p>
						Corre dentro del navegador y accede a menos funciones del dispositivo que una app nativa. A cambio, tenés una sola
						base de código para web y celular, y se actualiza sola cada vez que desplegás.
					</p>
				</Callout>
			</Section>

			<Section id="para-que-sirve" heading="Para qué sirve">
				<ul className="list-disc space-y-2 pl-5">
					<li>Se instala en el celular o la compu, con su ícono, sin pasar por una tienda.</li>
					<li>Puede seguir respondiendo con mala conexión, si guardás en caché lo que necesita.</li>
					<li>Puede enviar notificaciones push, por ejemplo recordatorios.</li>
					<li>Es una sola base de código para todos los dispositivos.</li>
					<li>Se actualiza cuando desplegás, sin esperar la revisión de una tienda.</li>
				</ul>
			</Section>

			<Section id="como-crear" heading="Cómo crearla con Next.js">
				<p>
					Esta guía es para el App Router de Next.js 15. Son cuatro pasos obligatorios y uno opcional para iPhone.
				</p>

				<h3 className="text-lg font-bold text-foreground">Paso 1: el manifest</h3>
				<p>
					Creá <C>app/manifest.ts</C>. Next.js lo sirve en <C>/manifest.webmanifest</C> y agrega el enlace en el{" "}
					<C>&lt;head&gt;</C> por vos. Guardá los íconos en <C>public/</C>: los navegadores piden uno de 192 y otro de 512
					píxeles para ofrecer la instalación.
				</p>
				<CodeBlock code={MANIFEST} language="ts" filename="app/manifest.ts" />

				<h3 className="text-lg font-bold text-foreground">Paso 2: el service worker</h3>
				<p>
					Creá <C>public/sw.js</C>. Este ejemplo guarda una página de &ldquo;sin conexión&rdquo; y la muestra cuando falla la
					red al navegar. Necesitás también esa página.
				</p>
				<CodeBlock code={OFFLINE_PAGE} language="tsx" filename="app/offline/page.tsx" />
				<CodeBlock code={SERVICE_WORKER} language="js" filename="public/sw.js" />

				<h3 className="text-lg font-bold text-foreground">Paso 3: registrarlo</h3>
				<p>
					El registro tiene que correr en el navegador, así que va en un componente de cliente que montás una sola vez en el
					layout.
				</p>
				<CodeBlock code={REGISTER} language="tsx" filename="components/register-service-worker.tsx" />
				<CodeBlock code={LAYOUT} language="tsx" filename="app/layout.tsx" />

				<h3 className="text-lg font-bold text-foreground">Paso 4: cabeceras para el service worker</h3>
				<p>
					Conviene que el navegador nunca guarde en caché el propio <C>sw.js</C>, así las actualizaciones se detectan al
					instante. Lo configurás en <C>next.config</C>.
				</p>
				<CodeBlock code={HEADERS} language="js" filename="next.config.mjs" />

				<h3 className="text-lg font-bold text-foreground">Paso 5 (opcional): iPhone</h3>
				<p>
					Para que la app se vea bien al agregarla a la pantalla de inicio en iOS, sumá los metadatos de Apple y un{" "}
					<C>apple-touch-icon</C>.
				</p>
				<CodeBlock code={IOS_METADATA} language="tsx" filename="app/layout.tsx" />
			</Section>

			<Section id="como-probar" heading="Cómo probarla">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Abrí las herramientas de desarrollo del navegador y entrá a la pestaña <C>Application</C>. Ahí ves el manifest y
						el service worker registrado.
					</li>
					<li>Corré Lighthouse para ver si el navegador reconoce tu app como instalable.</li>
					<li>
						Probá con el build de producción (<C>next build</C> y <C>next start</C>): el comportamiento del caché en
						desarrollo puede confundirte.
					</li>
					<li>
						Para probar con HTTPS en tu máquina, Next.js ofrece <C>next dev --experimental-https</C>.
					</li>
				</ul>
				<Callout tone="warning" title="Cuidado al actualizar el service worker">
					<p>
						Si cambiás <C>sw.js</C>, subí el nombre de la versión del caché (por ejemplo de <C>mi-app-v1</C> a{" "}
						<C>mi-app-v2</C>) para que se borre el caché viejo.
					</p>
				</Callout>
			</Section>

			<Section id="como-instalar" heading="Cómo se instala">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						<strong>Chrome y Edge (compu y Android):</strong> ícono de instalar en la barra de direcciones, o el menú y la
						opción de instalar la app o agregarla a la pantalla de inicio.
					</li>
					<li>
						<strong>iPhone y iPad (Safari):</strong> botón Compartir y luego &ldquo;Agregar a inicio&rdquo;.
					</li>
				</ul>
			</Section>

			<Section id="push" heading="Notificaciones push">
				<p>
					El mismo service worker puede recibir eventos <C>push</C> y mostrar notificaciones aunque la app esté cerrada. En
					Next.js se suele combinar con la librería <C>web-push</C> y un par de claves VAPID. Apacheta usa estas mismas piezas:
					un manifest, un service worker y notificaciones push.
				</p>
			</Section>

			<Glossary
				terms={[
					{ term: "PWA", definition: "Progressive Web App: una app web instalable que puede funcionar con mala conexión." },
					{ term: "Web App Manifest", definition: "Archivo que describe la app (nombre, íconos, colores) para que el navegador la pueda instalar." },
					{ term: "Service worker", definition: "Script que el navegador ejecuta en segundo plano, separado de la página, para manejar caché y notificaciones." },
					{ term: "VAPID", definition: "Par de claves que identifica a tu servidor cuando envía notificaciones push." },
				]}
			/>
			<Faq items={seo.faq ?? []} />
		</ContentShell>
	)
}
