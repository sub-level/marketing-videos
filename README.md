# Marketing Videos

**Make launch films with an agent, not an editor.**

This repo is the open-source version of how we make marketing videos: an AI coding agent
(Claude Code) writes the film as a [Remotion](https://www.remotion.dev) composition, AI
image/video models (via the [Higgsfield](https://higgsfield.ai) MCP server) generate the
cinematic footage, and the whole thing renders from code. No timeline editor, no keyframe
dragging, no editor on retainer.

It contains three things:

1. **Skills** — agent instructions (`.claude/skills/`) that teach a coding agent the whole
   method: composition grammar, the AI-footage pipeline, and sound design.
2. **Guidance** — the end-to-end process we follow (`docs/process.md`), case studies of real
   films made this way, and the gotchas we paid for so you don't have to.
3. **A working scaffold** — a minimal Remotion project (`src/`) with a brand-neutral example
   composition demonstrating the grammar. Clone, `npm install`, `npm run dev`.

## Films made with this method

Both of these were written, animated, and scored by Claude Code in Remotion, with AI-generated
footage from Higgsfield. Every frame is code; nothing was touched in a video editor.

### Agentic Payments launch film — "Match Day"

[![Agentic Payments launch film](https://img.youtube.com/vi/z3gzPP1F_2g/maxresdefault.jpg)](https://youtu.be/z3gzPP1F_2g)

A ~40 second story-driven launch film: two friends live one day that ends at a World Cup
semi-final while their agent quietly buys the tickets, arms standing orders, and restocks the
pantry. The entire filmed world is AI claymation (character-consistent stills animated with
image-to-video), cut against real product UI rebuilt in code.
**Case study: [docs/case-studies/agentic-payments-film.md](docs/case-studies/agentic-payments-film.md)**

### Launch film — "We're Building the Annotated Internet."

[![Launch film](https://img.youtube.com/vi/tUO-Oa_W4Zc/maxresdefault.jpg)](https://youtu.be/tUO-Oa_W4Zc)

A ~80 second launch film: a typographic timelapse through internet history into a live product
demo, with the real app's UI components running inside the Remotion render via a runtime shim.
Ships as 16:9, 9:16, and a partner edition from the same scene code.
**Case study: [docs/case-studies/launch-film.md](docs/case-studies/launch-film.md)**

## The method in one paragraph

Lock the **story** and a **look bible** before generating anything. Write the voiceover as
frame-timed cues and render it as kinetic captions, so the film reads with the sound off.
Generate footage stills-first with a character reference so every shot shares one protagonist
and one grade, approve the cheap stills, then animate them with identity-preserving
image-to-video. Assemble everything in Remotion where timing is data (`SCENE` constants,
computed totals), the portrait edition is a React context flag rather than a re-edit, and sound
is a three-layer stack (music bed with a frame-keyed volume curve, transition impacts, tactile
UI sounds). Verify like an engineer: render stills at exact frames, pixel-probe layouts,
frame-step the motion.

The long version is [docs/process.md](docs/process.md).

## Quick start

```bash
git clone https://github.com/sub-level/marketing-videos.git
cd marketing-videos
npm install
npm run dev        # Remotion Studio at http://localhost:3000
```

Render the example:

```bash
npm run render               # 16:9 → out/example.mp4
npm run render:vertical      # 9:16 → out/example-vertical.mp4
npm run render:best          # 4K master with archival-quality encode settings
```

Then open the repo in [Claude Code](https://claude.com/claude-code) and ask for a video. The
skills in `.claude/skills/` load automatically and teach the agent the whole method. For AI
footage, connect the Higgsfield MCP server (or any image + image-to-video provider) — the
pipeline in [`ai-cinematic-broll`](.claude/skills/ai-cinematic-broll/SKILL.md) is
provider-agnostic.

## Repo map

```
.claude/skills/
  remotion-marketing-video/   # Composition grammar: structure, timing, motion, dual aspect, rendering
  ai-cinematic-broll/         # AI footage pipeline: look bible, character refs, stills → i2v, recipes
  video-audio-stack/          # Three-layer sound design + music validation
docs/
  process.md                  # The end-to-end playbook, brief → published film
  gotchas.md                  # Hard-won failures, each with the fix
  case-studies/               # How the two films above were actually made
src/
  Root.tsx                    # Composition registry (landscape + portrait from one scene tree)
  tokens.ts                   # Design tokens: palette, fonts, scene durations (all timing is data)
  vertical-context.ts         # The one portrait flag every scene reads
  lib/                        # Reusable primitives: KineticCaption, MusicBed, SfxCue
  example/                    # A short neutral film demonstrating the grammar
```

## The stack

| Piece | Role |
| --- | --- |
| [Remotion](https://www.remotion.dev) | The film is a React app; every frame is a pure function of `useCurrentFrame()` |
| [Claude Code](https://claude.com/claude-code) | Writes the scenes, times the cues, runs the render + verification loop |
| [Higgsfield MCP](https://higgsfield.ai) | Image models for character-consistent stills, image-to-video for motion |
| [remotion-bits](https://github.com/av/remotion-bits) | Optional library of ready-made animation components + its own agent skill |
| ffmpeg | Audio truth-checking, frame extraction, clip surgery (reverse, crop, trim) |

## License

MIT. The example composition and all committed assets are brand-neutral placeholders — swap in
your own tokens, logos, and licensed music. The showcase films above are linked, not vendored;
their footage, product UI, and music are not part of this repository.
