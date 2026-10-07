# Marketing Videos

**Make launch films with an agent, not an editor.**

This repo is the open-source version of how we make marketing videos: an AI coding agent
(Claude Code) writes the film as a [Remotion](https://www.remotion.dev) composition, AI
image/video models (via the [Higgsfield](https://higgsfield.ai) MCP server) generate the
cinematic footage, and the whole thing renders from code. No timeline editor, no keyframe
dragging, no editor on retainer.

It contains three things:

1. **Skills**: agent instructions (`.claude/skills/`) that teach a coding agent the whole
   method: composition grammar, deriving motion design from a reference film, putting a
   real 3D device on screen, the AI-footage pipeline, and sound design.
2. **Guidance**: the end-to-end process we follow (`docs/process.md`), case studies of real
   films made this way, and the gotchas we paid for so you don't have to.
3. **A working scaffold**: a minimal Remotion project (`src/`) with two brand-neutral
   example films and the reusable primitives behind them (typed lines, continuous
   geometry, living dust, music and SFX cues). Clone, `npm install`, `npm run dev`.

## Films made with this method

All of these were written, animated, and scored by Claude Code in Remotion, with AI-generated
footage from Higgsfield and music from Epidemic Sound. Every frame is code; nothing was
touched in a video editor.

### Collectors launch film: "Rebuilt for collectors."

[![Collectors launch film](https://img.youtube.com/vi/5LKApvTGNPg/maxresdefault.jpg)](https://www.youtube.com/watch?v=5LKApvTGNPg)

**▶ Watch: [youtube.com/watch?v=5LKApvTGNPg](https://www.youtube.com/watch?v=5LKApvTGNPg)**

A ~35 second film with almost no AI footage: type, line geometry, and a real 3D phone
running the actual shipped app on its screen. Its motion grammar was derived by extracting
every frame of a reference film and measuring it: cap heights, per-letter arrival frames,
the mechanics of a sweep-out. Not by impression. Ships as six editions (dark,
light and mixed, each 16:9 and 9:16) from one scene tree.
**Case study: [docs/case-studies/collectors-film.md](docs/case-studies/collectors-film.md)**

### Agentic Payments launch film: "Match Day"

[![Agentic Payments launch film](https://img.youtube.com/vi/z3gzPP1F_2g/maxresdefault.jpg)](https://www.youtube.com/watch?v=z3gzPP1F_2g)

**▶ Watch: [youtube.com/watch?v=z3gzPP1F_2g](https://www.youtube.com/watch?v=z3gzPP1F_2g)**

A ~40 second story-driven launch film: two friends live one day that ends at the World Cup
final while their agent quietly buys the tickets, arms conditional purchase rules, and
restocks the pantry. The entire filmed world is AI claymation (character-consistent stills animated with
image-to-video), cut against real product UI rebuilt in code. A second public edition,
["The Annotated Web"](https://www.youtube.com/watch?v=vsdSS4TPhCk), is the same scene
components under a different edition context: different story assets, copy and music bed,
with identical animation, layout and timing. That is what "variants are props" means in
practice.
**Case study: [docs/case-studies/agentic-payments-film.md](docs/case-studies/agentic-payments-film.md)**

### Launch film: "We're Building the Annotated Internet."

[![Launch film](https://img.youtube.com/vi/tUO-Oa_W4Zc/maxresdefault.jpg)](https://www.youtube.com/watch?v=tUO-Oa_W4Zc)

**▶ Watch: [youtube.com/watch?v=tUO-Oa_W4Zc](https://www.youtube.com/watch?v=tUO-Oa_W4Zc)**

A ~80 second launch film: a typographic timelapse through internet history into a live product
demo, with the real app's UI components running inside the Remotion render via a runtime shim.
Ships as 16:9, 9:16, and a partner edition from the same scene code.
**Case study: [docs/case-studies/launch-film.md](docs/case-studies/launch-film.md)**

## The method in one paragraph

Lock the **story** and a **look bible** before generating anything. If a reference film is
the brief, **measure it**: extract every frame and read the cap heights, the per-letter
arrival frames and the hold lengths, instead of building your impression of it. Write the
voiceover as frame-timed cues and render it as kinetic captions, so the film reads with the
sound off. Generate footage stills-first with a character reference so every shot shares one
protagonist and one grade, approve the cheap stills, then animate them with
identity-preserving image-to-video; when the hero is the product itself, put the real 3D
device on screen with the real recordings playing on its glass and let the camera narrate.
Assemble everything in Remotion where timing is data (`SCENE` constants, computed totals),
where geometry transforms instead of restarting (that is the whole difference between motion
design and a slideshow), and where the portrait edition and the light edition are React
context flags rather than re-edits. Score it in three layers (music bed with a frame-keyed
volume curve, transition impacts, tactile UI sounds) and treat silence as one of them.
Verify like an engineer: render stills at exact frames, pixel-probe layouts, frame-step the
motion. Deliver supersampled.

The long version is [docs/process.md](docs/process.md).

## Quick start

```bash
git clone https://github.com/sub-level/marketing-videos.git
cd marketing-videos
npm install
npm run dev        # Remotion Studio at http://localhost:3000
```

Two example films are registered. `Example` demonstrates kinetic captions, cards, counters
and global chrome; `Grammar` demonstrates the reference-derived motion grammar: a typed
line with a measured sweep-out, five words carried by one continuous piece of geometry, a
living dust field, and three themes from one scene tree.

```bash
npm run render               # 16:9 → out/example.mp4
npm run render:vertical      # 9:16 → out/example-vertical.mp4
npm run render:grammar       # the grammar film → out/grammar.mp4
npm run render:best          # 4K master with archival-quality encode settings
npm run render:masters       # all 8 editions, supersampled 2x then Lanczos-downscaled
npm run still                # one frame of the example film, to LOOK at
npm run still:grammar        # one frame of the grammar film
npm run typecheck            # run this before calling anything done
```

`npm run render:masters` needs `ffmpeg` on your PATH (`brew install ffmpeg`). Nothing else
here does.

## Your first film

Both example films need no AI provider, no MCP server and no credits: `Grammar` is pure
type, geometry and dust, `Example` is captions, cards and counters. Render one before you
connect anything.

Then open the repo in [Claude Code](https://claude.com/claude-code) and say what the film
is. The skills in `.claude/skills/` load automatically and carry the method:

```
Make a 30 second launch film for <product>. The one message is "<promise>".
Three beats: <a>, <b>, <c>. Dark, 16:9 and 9:16. No AI footage yet.
```

The agent writes `src/<your-film>/` with its own `tokens.ts` and `script.ts`, registers
both editions in `src/Root.tsx`, and renders stills for you to look at. Ask for a frame at
a specific number whenever you want to check something; that is the verification loop.

**To rebrand:** edit `COLORS` and `FONT` in `src/tokens.ts` (or your film's own
`tokens.ts`), change the `loadFont` calls in `src/Root.tsx` to your families and the
weights you actually use, and put assets in `public/<your-film>/`, loaded with
`staticFile()`.

**To add footage:** connect an image + image-to-video provider. Higgsfield installs as a
connector; `.mcp.json.example` shows the shape of an MCP entry, and the pipeline in
[`ai-cinematic-broll`](.claude/skills/ai-cinematic-broll/SKILL.md) is provider-agnostic.
For music, connect Epidemic Sound the same way, per the
[`video-audio-stack`](.claude/skills/video-audio-stack/SKILL.md) skill.

**What it costs:** the Remotion side is free, it is your own CPU. AI footage runs in the
low hundreds of provider credits for a 40 second film when the stills-first approval gate
is respected, and multiples of that when it is not. Licensed music is a subscription, and
it never gets committed here.

## Repo map

```
.claude/skills/
  remotion-marketing-video/   # Composition grammar: structure, timing, motion, editions, rendering
  motion-from-reference/      # Deriving a film's grammar by MEASURING a reference, frame by frame
  device-3d-stage/            # A real 3D device on screen, playing real product recordings
  ai-cinematic-broll/         # AI footage pipeline: look bible, character refs, stills → i2v, presenter ads
  video-audio-stack/          # Three-layer sound design, Epidemic Sound, music validation
docs/
  process.md                  # The end-to-end playbook, brief → published film
  gotchas.md                  # Hard-won failures, each with the fix
  case-studies/               # How the films above were actually made
src/
  index.ts                    # registerRoot: Remotion's entry point
  Root.tsx                    # Composition registry (every edition from one scene tree)
  tokens.ts                   # Design tokens: palette, fonts, scene durations (all timing is data)
  vertical-context.ts         # The one portrait flag every scene reads
  theme-context.ts            # The dark / light / mixed edition flag, per scene
  lib/                        # Primitives: KineticCaption, TypedLine, GeometryWords, DustField,
                              #   MusicBed, SfxCue
  example/                    # Kinetic captions, cards, counters, global chrome
  grammar/                    # The reference-derived grammar: typed lines, continuous geometry
public/
  audio/                      # Music beds. Bring your own; kept out of git
  sfx/                        # One-shot sound effects, same
scripts/
  render-supersampled.sh      # Deliverables: render at 2x, downscale with Lanczos
.mcp.json.example             # Shape of the MCP config, with tokens read from the env
```

## The stack

| Piece | Role |
| --- | --- |
| [Remotion](https://www.remotion.dev) | The film is a React app; every frame is a pure function of `useCurrentFrame()` |
| [Claude Code](https://claude.com/claude-code) | Writes the scenes, times the cues, runs the render + verification loop |
| [Higgsfield MCP](https://higgsfield.ai) | Image models for character-consistent stills, image-to-video for motion, direct-to-camera presenters |
| [Epidemic Sound](https://www.epidemicsound.com) | Licensed music beds and one-shot SFX. Ships an MCP server, so the agent can search the catalog and audition tracks itself. See the `video-audio-stack` skill for the config |
| [three.js](https://threejs.org) + [@remotion/three](https://www.remotion.dev/docs/three) | The 3D device stage: a real model, lit properly, with product recordings as its screen texture |
| [remotion-bits](https://github.com/av/remotion-bits) | Optional library of ready-made animation components + its own agent skill |
| ffmpeg | Audio truth-checking, frame extraction, clip surgery (reverse, crop, trim) |

## License

MIT. The example compositions and all committed assets are brand-neutral placeholders. Swap
in your own tokens, logos, and licensed music. The showcase films above are linked, not
vendored; their footage, product UI, and music are not part of this repository. Music from a
subscription library (Epidemic Sound and friends) is licensed to YOU while you subscribe:
keep tracks out of git and out of a public repo.
