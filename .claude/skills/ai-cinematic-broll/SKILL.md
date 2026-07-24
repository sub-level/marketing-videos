---
name: ai-cinematic-broll
description: Generate cinematic AI footage for marketing videos using image + image-to-video models (Higgsfield MCP or equivalent). Use when a film needs filmed-looking shots - characters, places, product worlds - rather than pure motion graphics. Covers the look bible, character references, the stills-first approval gate, identity-preserving image-to-video, editing recipes, and cost discipline.
---

# Cinematic AI B-Roll

AI footage is cheap to generate and expensive to make good. The failure mode is a montage
of unrelated stock-looking clips; the fix is discipline: one story, one cast, one grade,
and a human approval gate before any video credit is spent.

## The iron rule: cohesion or nothing

Disconnected postcards (a coffee cup, a concert, a dog, a beach) read as generic stock
footage no matter how pretty each clip is. Before generating ANYTHING, lock:

1. **A STORY** - one protagonist (or pair), one place, one day/journey with a destination.
   Every shot is a beat in that story.
2. **A LOOK BIBLE** - grade (e.g. warm golden-hour, amber highlights / teal shadows), lens
   (anamorphic, shallow DOF), light, recurring wardrobe and props. Repeat this block
   verbatim in every prompt; it is the glue.

Favor evocative framings - silhouettes, backs, hands, details - over face-locked closeups.
Faces are where identity drift and uncanny artifacts show first.

A deliberately stylized world (claymation, miniature, paper-craft) is a power move: it
hides AI artifacts, gives every shot an automatic shared look, and adds charm that photoreal
AI footage rarely has. Prompt the medium's tells ("visible fingerprints in the clay,
stop-motion film still", "subtle handmade jitter, camera locked off").

## The pipeline (stills first, always)

```
1. Character reference   ->  2. Beat stills (cheap)   ->  3. HUMAN APPROVAL GATE
                                                                 |
        5. Assemble in Remotion  <-  4. Image-to-video (expensive, only approved stills)
```

### 1. Lock a character reference still

Generate ONE hero still that defines the cast, wardrobe, and grade. Iterate here until the
human loves it - this image is the contract for every later shot. Pass it as an image
reference to every subsequent people-shot.

Gotcha: a strong character reference pulls new scenes back to the REFERENCE'S SETTING.
Keep no-people cutaways (skylines, food, objects) reference-free.

### 2. Generate every beat as a STILL

One still per story beat, with the character reference attached and the look-bible block in
the prompt. Stills cost on the order of 2 credits; clips cost 20-45. Iterating at the still
stage is 10-20x cheaper than iterating on clips, and a still shows you 90% of what the clip
will look like (composition, grade, identity, wardrobe).

### 3. THE APPROVAL GATE - do not skip this

**Present the full still set to the human and get explicit approval BEFORE animating
anything.** This is a hard stop, not a courtesy: video generation is where the credits go,
and an unapproved still animated is money burned on a shot that will be rejected anyway.

- Show the stills as a set (contact-sheet style), named by beat.
- Re-roll individual rejects at the still stage until the set is approved.
- Only then spend on image-to-video, and only on approved stills.

This gate is also where continuity errors get caught (wrong wardrobe, wrong time of day,
a brand mark that slipped in) - all cheap to fix in a still, ruinous in a clip.

### 4. Animate with identity-preserving image-to-video

Drive i2v (e.g. Seedance) with `start_image` = the approved still. **i2v guarantees frame 0
equals the seed**, which is what preserves identity and grade. Keep the motion prompt about
CAMERA and PHYSICS, not content ("slow push-in", "she lifts the mug", "camera locked off") -
the still already IS the content.

Pin the technical specs (duration, resolution, fps) once and reuse them byte-identical for
every clip in the film, so replacements are drop-in. 5s at 720p/24fps is fine for clips that
composite into a 1080p master; re-generate at 1080p only if a 4K master matters.

### 5. Assemble in Remotion

- Apply a unified grade pass in code: film grain (feTurbulence), vignette, subtle handheld
  drift. Code-side grading is free cohesion on top of prompt-side grading.
- Weave UI into the negative space of shots; never paste it over the subject.
- Transition between footage and UI with a plain dark cross-dissolve, not colored gradients.

## Recipes that save money

- **Stills AS footage.** A still with code-side drift (slow scale/translate), especially
  blurred behind frosted UI, is indistinguishable from a clip and costs zero video credits.
  Spend clip credits only where real motion is the point.
- **Edit, never regenerate.** To change one element of an approved shot (wardrobe, prop,
  text), upload the EXISTING still to the image model with a prompt like "keep EVERYTHING
  identical - same people, same pose, same lighting - ONLY change X", then re-run i2v with
  the same pinned specs. The new clip is a drop-in replacement. Re-costuming 4 shots this
  way costs ~100 credits and 15 minutes vs. a full re-shoot.
- **The reverse trick** (for a flying object that must settle pixel-perfect into a UI pose):
  render the FINAL pose from your own composition as a still with the screen BLACK, i2v it
  as "lifts off, spins, floats away, screen stays black", then `ffmpeg -vf reverse`. The
  clip now ENDS at your exact pose; crossfade to the live CSS layer over the last frames and
  fade the real UI in on the screen. The black screen avoids all UI hallucination.
- **Frame extraction is free thumbnail art.** Crop stills from your own clips
  (`ffmpeg -vf "crop=...,scale=..."`) for card thumbnails and posters instead of generating
  new images.

## Prompt hygiene (each of these burned us once)

- **"plain, no logos or crests"** on any clothing/product - image models paint REAL brand
  marks (sportswear logos, team crests) unless told not to, and AI-rendered lettering is
  gibberish anyway. If you need lettering, verify the model can do it in that shot type.
- **"generic person, not resembling any real person"** - a bare "soccer fan portrait"
  produced a recognizable celebrity likeness. Always include it.
- **Never use a third party's trademarked name/domain in-shot.** Invent a truthful stand-in
  (we typed `match102.com` for match 102 instead of a governing body's real site).
- **Moderation false positives happen** - an innocent prompt can get flagged; reword the
  physical action ("having their morning coffee, lifting the mugs") and retry.
- Music, fonts, logos: only license-cleared assets ever ship in a public cut.

## Cost discipline

Track credits per shot as you go and report the total. Reference points from a real ~40s
film: 7 world stills + re-rolls + 1 hero clip ~45 credits; three 5s character interludes
~75 credits (stills approved first); a 4-shot re-costume pass ~100 credits. A whole film's
footage lands in the low hundreds of credits WHEN the approval gate is respected - and
multiples of that when it is not.

## MCP mechanics (Higgsfield)

- Unsure which model fits: `models_explore(action:'recommend')` with the goal + input.
- Reference images and seed stills go up via the media upload flow (presigned PUT +
  confirm), then are passed as `image` refs / `start_image`.
- Generation is async: poll job status; download results promptly and commit them to the
  project's `public/` so renders never depend on the provider staying up.
- The pipeline is provider-agnostic: any image model with image-reference support plus any
  i2v model with a start-image contract can run it.

See `references/prompt-templates.md` for copy-paste prompt skeletons.
