"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, QrCode } from "lucide-react"
import ApachetaCairn from "@/components/apacheta-cairn"

export const BINANCE_ALIAS = "User-6fcb1"

function PaymentCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
			<div>
				<h2 className="font-semibold text-foreground">{title}</h2>
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			</div>
			{children}
		</div>
	)
}

function BinanceQr() {
	const [failed, setFailed] = useState(false)
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(BINANCE_ALIAS)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			// clipboard blocked (permissions, non-secure context), nothing to fall back to
		}
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex aspect-square w-full max-w-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
				{failed ? (
					<QrCode className="h-8 w-8 text-muted-foreground" />
				) : (
					<img
						src="/binance-pay-qr.png"
						alt="Binance Pay QR"
						className="h-full w-full object-contain"
						onError={() => setFailed(true)}
					/>
				)}
			</div>
			<div className="flex items-center gap-1.5">
				<p className="text-xs text-muted-foreground">Alias: {BINANCE_ALIAS}</p>
				<button
					type="button"
					onClick={handleCopy}
					aria-label="Copiar alias"
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					{copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
				</button>
			</div>
		</div>
	)
}

/** Public twin of the dashboard donations page, no auth or dashboard context. */
export default function PublicDonations() {
	return (
		<main className="mx-auto max-w-4xl space-y-8 px-5 py-10 sm:px-6">
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				Volver a Apacheta
			</Link>

			<header className="flex flex-col items-center gap-3 text-center">
				<span className="grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-primary/15">
					<ApachetaCairn className="h-9 w-9 text-primary" />
				</span>
				<h1 className="text-2xl font-bold text-foreground md:text-3xl">Apoyá el desarrollo de Apacheta</h1>
				<p className="max-w-xl text-balance text-sm text-muted-foreground">
					Apacheta es un proyecto desarrollado con dedicación para ayudarte a alcanzar tus metas financieras. Tu contribución
					cubre el hosting, el dominio y el tiempo que le dedico a seguir agregando funciones nuevas.
				</p>
			</header>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<PaymentCard title="Pesos (ARS)" description="Invitanos un cafecito desde Argentina">
					<a href="https://cafecito.app/apacheta" rel="noopener noreferrer" target="_blank">
						<img
							srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
							src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
							alt="Invitame un café en cafecito.app"
						/>
					</a>
				</PaymentCard>
				<PaymentCard title="Cripto" description="Escaneá con la app de Binance para enviar">
					<BinanceQr />
				</PaymentCard>
			</div>

			<p className="text-center text-sm text-muted-foreground">
				Gracias por sumarte, cada contribución ayuda, sin importar el monto.
			</p>
		</main>
	)
}
