# Case study: the Agentic Payments launch film ("Match Day")

**Watch it: [youtu.be/z3gzPP1F_2g](https://youtu.be/z3gzPP1F_2g)** · ~40s · 16:9 master +
9:16 vertical + App Store cuts, all from one scene tree.

The launch film for an agentic-payments feature in a consumer browser. Concept: *it shops
while you live* - two friends live one day that ends at a World Cup semi-final while their
in-browser agent quietly buys the tickets, arms conditional "standing orders", and restocks
the pantry. Made entirely by Claude Code: the filmed world generated through the Higgsfield
MCP, the product UI rebuilt in Remotion, sound designed in code.

## What the film had to do

Show a real product truthfully (an agent that buys things in chat), carry emotion (a day
with friends, a stadium payoff), and never look like stock footage. Roughly 40 seconds,
watchable with sound off.

## How it was made

### The failure that shaped everything

The first attempt was a montage of unrelated AI clips - sparkling water, a concert, a dog,
a coffee. Verdict from the founder: among the worst visuals they had ever seen. The lesson
became the iron rule in the `ai-cinematic-broll` skill: disconnected postcards read as
stock. Cohesion comes from ONE story, ONE cast, ONE place, ONE grade. Everything below
exists to enforce that.

### Story and truthfulness

- Two friends, one day, ending at a real fixture: the 2026 World Cup semi-final in
  Atlanta. The browser types `match102.com` - the game really was match 102 of the
  tournament, which let the shot be TRUE without using the governing body's trademarked
  domain.
- Kits are rendered as COLORS only (a plain white kit, a sky-blue striped kit) - never
  official crests or sponsor logos. Image models paint real brand marks unless told
  "plain, no logos or crests", and trademark aside, AI lettering renders as gibberish.
- Copy checked against reality: "Atlanta. 3PM." - never "tonight" for a 3PM kickoff.

### The claymation world

The whole filmed world is stop-motion claymation. It began as three character interludes
(the mascot doing the agent's work), and the founder liked them enough that every filmed
shot went clay. Why it works: the style hides AI artifacts, gives automatic visual
cohesion, and has charm photoreal AI lacks. Prompts carry the medium's tells: "visible
fingerprints in the clay, stop-motion film still", i2v prompts add "subtle handmade
jitter, camera locked off".

### The stills-first approval gate (the budget saver)

Every shot went through the same pipeline:

1. A character-reference still locked the cast, wardrobe, and warm golden-hour grade.
2. Each story beat was generated as a still (~2 credits) with the reference attached.
3. **The founder approved the still set before a single clip was generated.**
4. Approved stills were animated with Seedance image-to-video (`start_image` = the still,
   5s, 720p, 24fps - pinned so every clip is drop-in replaceable).

Numbers from the build: the clay world cost ~45 credits (7 stills + re-rolls + 1 hero
clip); the three character interludes ~75 credits; and when the fixture changed and both
kits had to swap, the re-costume pass - edit the existing stills with "keep EVERYTHING
identical, ONLY change the kits", re-run i2v with identical specs - cost ~100 credits and
15 minutes instead of a re-shoot. Four backdrop "clips" are actually STILLS with code-side
drift, blurred behind frosted UI: zero clip credits.

### The product UI, in code

The hero of the back half is a chat conversation where the agent buys tickets and arms two
conditional orders. All of it is Remotion components mirroring the shipped product: chat
bubble rows, a confirmation card whose button visibly flips Pay → Paid under a camera
push-in, an options carousel with a tap-to-select animation, slim "Armed" receipt cards.
Product thumbnails came from openly-licensed sources or frames cropped from the film's own
footage with ffmpeg.

Two moves worth stealing:

- **The reverse trick.** The phone that flies in with a 360 spin and settles pixel-perfect
  was made by rendering the composition's own final pose as a still with the screen BLACK,
  animating it as "lifts off, spins, floats away, screen stays black", then reversing the
  clip with ffmpeg. It ends exactly on the CSS pose; the UI fades in after the settle. The
  black screen avoids all UI hallucination.
- **A pre-seeded room.** The chat opens onto a room already populated with aged, muted
  community messages (AI-generated stranger avatars, source badges, "3h ago" timestamps).
  Arriving to a full room is the feature; no populate animation needed.

### Pacing, sound, and review

- A friend literally could not finish reading the conversation. The fix was time, not
  cuts: every message got roughly its reading time plus a beat. The founder's rule:
  "just give more time".
- Purchases share one voice: the hero buy gets a bright ding; each armed order echoes a
  quieter, pitched version of the same sample.
- Three candidate music tracks were rejected by ffmpeg profiling before cutting: audible
  length is not file length, and one "46s" track died at 29s with no loop-splice region.
- Frame-stepping screen recordings caught animation snaps that realtime playback hid.

## What to copy

The approval gate, the look bible, edit-not-regenerate, stills-as-footage, the reverse
trick, reading-time pacing, and the discipline of one story/one grade. What NOT to copy:
generating clips before a human has approved the stills.
