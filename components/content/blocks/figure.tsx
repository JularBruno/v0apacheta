import Image from "next/image"

/**
 * An image with a caption and credit. `alt` is required (an empty one fails the build) and `src` is a local
 * path under /public or an https URL: never javascript:, data: or http:.
 */
export default function Figure({
	src,
	alt,
	width,
	height,
	caption,
	credit,
}: {
	src: string
	alt: string
	width: number
	height: number
	caption?: string
	credit?: string
}) {
	if (alt.trim() === "") throw new Error(`Figure: meaningful alt text is required (src "${src}")`)
	if (!(src.startsWith("/") && !src.startsWith("//")) && !src.startsWith("https://")) {
		throw new Error(`Figure: src must be a local path starting with "/" or an https URL, got "${src}"`)
	}
	return (
		<figure className="overflow-hidden rounded-xl border border-border">
			<Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 768px) 100vw, 768px" className="h-auto w-full" />
			{(caption || credit) && (
				<figcaption className="border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
					{caption}
					{caption && credit && " · "}
					{credit}
				</figcaption>
			)}
		</figure>
	)
}
