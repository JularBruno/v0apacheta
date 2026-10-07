/**
 * A YouTube video embedded through youtube-nocookie.com (no tracking cookies until played), sandboxed, lazy and with a
 * plain link underneath for anyone who can't or won't load the frame. `videoId` must be a real 11-character id: the
 * only part of the URL that comes from the page, so nothing else can be injected. The one place an <iframe> is allowed.
 */
export default function VideoEmbed({ videoId, title, caption }: { videoId: string; title: string; caption?: string }) {
	if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error(`VideoEmbed: videoId must be an 11-character YouTube id, got "${videoId}"`)
	if (title.trim() === "") throw new Error(`VideoEmbed: a title is required (videoId "${videoId}")`)
	return (
		<figure className="overflow-hidden rounded-xl border border-border">
			<div className="aspect-video w-full bg-muted">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${videoId}`}
					title={title}
					sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
					allow="fullscreen; picture-in-picture"
					allowFullScreen
					loading="lazy"
					referrerPolicy="strict-origin-when-cross-origin"
					className="h-full w-full"
				/>
			</div>
			<figcaption className="border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
				{caption && (
					<>
						<span>{caption}</span>
						{" · "}
					</>
				)}
				<a
					href={`https://www.youtube.com/watch?v=${videoId}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary hover:underline"
				>
					Ver en YouTube
				</a>
			</figcaption>
		</figure>
	)
}
