# 01 — The Builder shows a live Avatar

**What to build:** A Student opens the app and builds an Avatar in the standalone Builder by tapping pictures: skin tone, then hairstyle, hair color, eyewear, favorite Expression and clothing color. They watch a head-only Avatar update live as they go, and finish by answering "What's your first name?". Nothing is saved yet.

This first slice also creates the app on the workspace default stack (static SvelteKit, Svelte, Tailwind, Bun) and sets up the end-to-end test harness that every later ticket uses. See the spec's Implementation Decisions (Platform, Part catalog, Avatar renderer, Builder) and ADR 0001, 0002, 0005, 0006 and 0010.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] The app builds as a static site, with no backend, and runs through the workspace's development-server port coordination script.
- [x] A Playwright end-to-end harness runs against the app in desktop and mobile projects, following the sibling `hall-pass-tracker` setup.
- [x] The part catalog holds the full v1 lists in a fixed stored order:
  - [x] 10 skin tones
  - [x] 48 hairstyles (every Open Peeps hair piece except the three medical headwear pieces)
  - [x] 6 natural hair colors
  - [x] eyewear (none, plus 9 pieces)
  - [x] the 19 allowed Expressions
  - [x] 10 clothing colors
  - [x] the 23 allowed bust Poses
- [x] Each catalog entry supports a "retired" flag, and the Builder's display order is kept separate from the stored order (ADR 0010).
- [x] All art is converted from Open Peeps (the `react-peeps` pieces) with no shapes added or changed.
- [x] The renderer draws a head-only Avatar as DOM SVG, following ADR 0006:
  - [x] the head fill is the skin tone
  - [x] the hair lines are the hair color
  - [x] the face lines are black
- [x] The Builder steps run in the spec's order. Every option is a picture with an accessible name, and the whole Builder works by keyboard.
- [x] The preview updates immediately on every choice, and earlier steps can be revisited without losing later choices.
- [x] The final step asks "What's your first name?" in a text input.
- [x] The Builder is usable at phone width.
- [x] End-to-end tests cover: building an Avatar by accessible names, changing an earlier choice, and reaching the name step, on both viewports.
