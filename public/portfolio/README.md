# Portfolio images & video

One folder per project, named after its `slug` (see `lib/portfolio/projects.ts`):

```
public/portfolio/<slug>/<file>.webp
```

Wire a file into a project by setting the path (relative to `/public`) on the
data in `lib/portfolio/projects.ts`:

- `cover` on the project → grid card thumbnail, and the case-study banner
  when there's no `video` (also doubles as the `video`'s poster frame)
- `logo` on the project → small mark shown next to the title on the case study
- `video` on the project → replaces the gradient banner with a `<video>` player
- `image` on a `screenshots[]` entry → that screen in the case study gallery
- `video` on a `screenshots[]` entry → that screen plays as a video instead
  (takes priority over `image` on the same entry)

Example:

```ts
{
  slug: "cyberpsi",
  cover: "/portfolio/cyberpsi/cover.webp",
  logo: "/portfolio/cyberpsi/logo.png",
  video: "/portfolio/cyberpsi/demo.mp4",
  screenshots: [
    { title: "Videollamadas", description: "...", image: "/portfolio/cyberpsi/videollamadas.webp" },
    { title: "Turnos del Profesional", description: "...", video: "/portfolio/cyberpsi/recibir-turnos.mp4" },
  ],
}
```

Screens without an `image`/`video` render a gradient placeholder from
`appScreenColor`. Files are served as-is (`next.config.mjs` sets
`images.unoptimized`, and video has no processing at all) — export images
web-ready (~1600px wide, WebP, compressed) and keep video light; there's no
git-lfs here, so large video bloats the repo permanently. Videos use
`preload="none"` so they don't load until a visitor presses play.
