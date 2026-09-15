"use client"

import { useState, type ReactNode } from "react"
import { QrCode, Copy, Check } from "lucide-react"
import ApachetaCairn from "@/components/apacheta-cairn"
import DonationTrail from "@/components/donations/donation-trail"

const BINANCE_ALIAS = "User-6fcb1"

function PaymentCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
			<div>
				<h3 className="font-semibold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground mt-1">{description}</p>
			</div>
			{children}
		</div>
	)
}

/** The Binance Pay QR, cropped to just the code (no app chrome) — falls back to a
 *  placeholder if the file is ever missing instead of showing a broken image. */
function BinanceQr() {
	const [failed, setFailed] = useState(false)
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(BINANCE_ALIAS)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			// clipboard blocked (permissions, non-secure context) — nothing to fall back to
		}
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="w-full max-w-40 aspect-square rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
				{failed ? (
					<QrCode className="w-8 h-8 text-muted-foreground" />
				) : (
					<img
						src="/binance-pay-qr.png"
						alt="Binance Pay QR"
						className="w-full h-full object-contain"
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
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					{copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
				</button>
			</div>
		</div>
	)
}

export default function DonacionesPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 md:px-6 py-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col items-center text-center gap-3">
				<span className="grid place-items-center w-16 h-16 rounded-full bg-primary/15 border border-primary/30">
					<ApachetaCairn className="w-9 h-9 text-primary" />
				</span>
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground">Donaciones</h1>
					<p className="text-sm text-muted-foreground mt-1">Apoyá el desarrollo de Apacheta</p>
				</div>
			</div>

			{/* Trail: purpose station, then payment methods as the destination */}
			<DonationTrail
				stations={[
					{
						title: "Tu apoyo hace la diferencia",
						body: (
							<p className="text-sm text-muted-foreground text-balance">
								Apacheta es un proyecto desarrollado con dedicación para ayudarte a alcanzar tus metas financieras. Tu
								contribución cubre el hosting, el dominio y el tiempo que le dedico a seguir agregando funciones
								nuevas.
							</p>
						),
					},
					{
						title: "Formas de donar",
						content: (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
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
						),
						footnote: "Gracias por sumarte — cada contribución ayuda, sin importar el monto.",
					},
				]}
			/>
		</div>
	)
}
