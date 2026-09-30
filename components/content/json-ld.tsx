import { serializeJsonLd, type JsonLd as JsonLdData } from "@/lib/content/seo"

export default function JsonLd({ data }: { data: JsonLdData[] }) {
	return (
		<>
			{data.map((item, index) => (
				<script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }} />
			))}
		</>
	)
}
