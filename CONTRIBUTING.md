# Contributing

This repo is a method, not a product. The most useful contributions are a technique that
worked on a real film and the failure that taught it, written down precisely enough that
someone else can repeat it.

## What belongs here

- **A skill** (`.claude/skills/<name>/SKILL.md`) when a technique is big enough to need
  its own instructions: it must carry `name` and `description` frontmatter, and the
  description must say when to load it.
- **A gotcha** (`docs/gotchas.md`) when something cost you real time or real money.
  State the failure first, then the fix. "Every entry here cost something" is the bar.
- **A primitive** (`src/lib/`) when the naive version of an effect looks wrong in a
  specific, measurable way. Say in the comment what the naive version does and why it
  reads badly. Primitives take explicit colours and sizes: they must not import any one
  film's tokens.
- **A case study** (`docs/case-studies/`) for a film that actually shipped, with a public
  link. No hypotheticals.

## House rules

1. `TOTAL_FRAMES` is computed from the `SCENE` table, never hardcoded.
2. Every `interpolate` over a time range clamps both sides.
3. Every composition ships 16:9 and 9:16 from the same scene tree via context, never a
   re-edit and never a scale-and-crop.
4. Any `transform: scale(N)` element gets its own composition-sized `overflow: hidden`
   viewport.
5. No em-dashes anywhere, including code comments. Use a period, a comma or a colon.
6. No unlicensed assets, ever: no proprietary fonts, no music, no third-party
   trademarks, no real person's likeness. The example films stay brand-neutral.
7. No secrets. MCP tokens come from the environment; `.mcp.json.example` is the shape.

## Before you open a PR

```bash
npm run typecheck
npm run still:grammar       # and LOOK at the frame
npm run render:grammar      # if you touched anything in src/
```

A change to motion gets a rendered frame or a short clip in the PR description. Prose
about what a scene will do is not reviewable; a frame is.

## What this repo will not take

Vendor-specific code paths that only work with one AI provider, a composition that needs
an asset nobody else has, or a technique nobody has shipped a film with yet.
