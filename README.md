# Avatar Generator

A free tool that lets K–5 teachers and their students make illustrated avatars
for behavior charts, labels and classroom decor, without photos.

There are no accounts and no server: classes live in the teacher's own browser,
and the only copy that leaves it is a file the teacher chooses to download. Every
picture the app makes carries the avatar that made it, hidden inside the PNG, so
a student can turn in a picture and the teacher can load it straight back in.

- Domain language: [`CONTEXT.md`](CONTEXT.md)
- Decisions: [`docs/adr/`](docs/adr)
- Spec and tickets: [`.scratch/avatar-generator-v1/`](.scratch/avatar-generator-v1)

## Running it

Start the dev server through the workspace port allocator, from the workspace
root:

```sh
./scripts/agent-dev.mjs avatar-generator --no-pocketbase
```

```sh
bun run build     # static site into dist/
bun run check     # types
bun run lint      # eslint + prettier
bun run test      # Playwright, desktop and mobile
```

## The art

The drawings are [Open Peeps](https://www.openpeeps.com/) (CC0), taken from
`react-peeps` (MIT) and converted to plain data by `bun run art`, which writes
`src/lib/art/generated/`. Those files are committed, so building needs neither
React nor a network. No shape is ever added or edited (ADR 0005); an avatar is
colored by rule instead (ADR 0006).

`bun run framing` re-measures how tightly a cutout crops around the drawings and
rewrites `src/lib/art/generated/framing.ts`. Run it after adding parts.
