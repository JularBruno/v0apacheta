"use client"

import { useEffect, useState } from "react"

const COLORS = [
	"#cb7352", // burnt peach
	"#aa4465", // berry crush
	"#7aafa7", // muted teal
	"#9db9b8", // ash grey
	// "#0d0709", // pitch black
]

const SIZES = {
	sm: { container: "w-10 h-10 rounded-lg p-1.5", shadow: "shadow-md" },
	md: { container: "w-16 h-16 rounded-xl p-2.5", shadow: "shadow-lg" },
	lg: { container: "w-24 h-24 rounded-2xl p-3", shadow: "shadow-xl" },
}

export default function SpinningLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const [colorIndex, setColorIndex] = useState(0)

	useEffect(() => {
		const id = setInterval(() => {
			setColorIndex((i) => (i + 1) % COLORS.length)
		}, 2000)
		return () => clearInterval(id)
	}, [])

	const { container, shadow } = SIZES[size]

	return (
		<div
			className={`${container} ${shadow} flex items-center justify-center`}
			style={{
				backgroundColor: COLORS[colorIndex],
				transition: "background-color 1s ease-in-out",
			}}
		>
			<img src="/logo.svg" alt="Apacheta" className="w-full h-full object-contain" />
		</div>
	)
}
