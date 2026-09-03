# Portfolio images

One folder per project, named after its `slug` (see `lib/portfolio/projects.ts`):

```
public/portfolio/<slug>/<file>.webp
```

Wire an image into a project by setting the path (relative to `/public`) on the
data in `lib/portfolio/projects.ts`:

- `cover` on the project → thumbnail on the `/portfolio` grid card
- `image` on a `screenshots[]` entry → that screen in the case study gallery

Example:

```ts
{
  slug: "cyberpsi",
  cover: "/portfolio/cyberpsi/cover.webp",
  screenshots: [
    { title: "Videollamadas", description: "...", image: "/portfolio/cyberpsi/videollamadas.webp" },
  ],
}
```

Screens without an `image` render a gradient placeholder from `appScreenColor`.
Images are served as-is (`next.config.mjs` sets `images.unoptimized`), so export
them web-ready — ~1600px wide, WebP, compressed.
