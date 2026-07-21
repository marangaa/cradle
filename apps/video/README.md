# Cradle product video

This isolated Remotion workspace renders the Cradle launch film without touching the product applications.

## Run

```bash
pnpm --filter @cradle/video dev
pnpm --filter @cradle/video render:preview
pnpm --filter @cradle/video render
```

The Studio runs on `http://localhost:3010`. Draft and production renders are written to `apps/video/out/`.

## Assets

The Remotion public directory is the repository-level `public/` directory. The composition works without screenshots by rendering faithful product-story UI scenes. To replace those scenes with captures, add the files below and set the corresponding composition props in Remotion Studio:

- `public/video/studio.png`
- `public/video/website.png`

No copying or sync process is required.

## Narration

The film renders silently by default. To create an ElevenLabs narration, add `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` to `apps/video/.env`, then run:

```bash
pnpm --filter @cradle/video voice
```

This writes `public/video/audio/cradle-narration.mp3`. In Remotion Studio, set `narrationSrc` to `video/audio/cradle-narration.mp3` for the `CradleLaunch` composition before rendering.

The API key remains local and is never included in a render or committed to git.
