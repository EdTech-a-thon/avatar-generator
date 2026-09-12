/**
 * Converts the Open Peeps drawings into plain data this app can render.
 *
 * `react-peeps` (MIT code, CC0 art) ships the drawings as React components. We
 * render each one once, with sentinel colors in place of its line and fill
 * color, and write the resulting paths into `src/lib/art/generated`. Nothing is
 * added, removed or reshaped (ADR 0005), and the app itself never touches React.
 *
 * Faces get one extra pass. Each Expression arrives as a single compound path
 * whose brows, eyes, nose and mouth are subpaths, and a young Avatar needs the
 * brows and eyes on their own so it can grow them (ADR 0011). Splitting a
 * compound path is not free: `fill-rule="evenodd"` is worked out per path, so
 * the hole inside an open mouth fills in solid the moment its subpath is moved
 * to a path of its own. Subpaths whose boxes touch therefore stay together, and
 * only whole groups clear of the others are ever separated.
 *
 * Run with `bun run art`. The generated files are committed, so a checkout
 * needs no network and no React to build.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Accessories } from "react-peeps/lib/peeps/accessories/z_options";
import { Face } from "react-peeps/lib/peeps/face/z_options";
import { Hair } from "react-peeps/lib/peeps/hair/z_options";
import { BustPose } from "react-peeps/lib/peeps/pose/bust/z_options";
import type { ArtPath, ArtPiece } from "../src/lib/art/types.ts";

const LINE = "__LINE__";
const FILL = "__FILL__";

const outputDirectory = path.join(
  import.meta.dirname,
  "..",
  "src",
  "lib",
  "art",
  "generated",
);

/** Reads the attributes of one SVG tag, which React writes as `name="value"`. */
function attributes(tag: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, value] of tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g))
    found[name] = value;
  return found;
}

function convert(name: string, markup: string): ArtPiece {
  // `None` is a real Open Peeps option that draws nothing at all.
  if (markup === "") return { paths: [] };

  const group = markup.match(/^<g(?<attributes>[^>]*)>/);
  if (!group)
    throw new Error(`${name}: the drawing does not start with a group`);
  if (markup.slice(1).includes("<g"))
    throw new Error(`${name}: nested groups are not supported`);

  const paths: ArtPath[] = [];
  for (const [tag] of markup.matchAll(/<path\b[^>]*>/g)) {
    const found = attributes(tag);
    if (!found.d) throw new Error(`${name}: a path has no outline`);
    const fill =
      found.fill === LINE ? "line" : found.fill === FILL ? "fill" : found.fill;
    if (!fill) throw new Error(`${name}: a path has no fill`);
    paths.push({
      d: found.d,
      ...(found.transform ? { transform: found.transform } : {}),
      fill,
      ...(found["fill-rule"] ? { fillRule: found["fill-rule"] } : {}),
    });
  }
  if (paths.length === 0) throw new Error(`${name}: the drawing has no paths`);

  const transform = attributes(group.groups!.attributes).transform;
  return { ...(transform ? { transform } : {}), paths };
}

/** How far down a face the brows and eyes stop. Below this line is nose and mouth. */
const EYE_BAND = 0.5;

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * A box around one subpath's control points.
 *
 * The drawings use only M, L, C, Q and Z, all absolute, so every number in a
 * `d` is a coordinate. A curve stays inside the hull of its control points, so
 * this box always contains the drawn shape. It can be a little large, which for
 * the grouping below is the safe direction to be wrong in: a box that is too
 * big only ever keeps subpaths together.
 */
function controlBox(d: string): Box {
  const numbers = d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let at = 0; at + 1 < numbers.length; at += 2) {
    xs.push(Number(numbers[at]));
    ys.push(Number(numbers[at + 1]));
  }
  if (xs.length === 0) throw new Error("a subpath has no coordinates");
  return {
    x0: Math.min(...xs),
    y0: Math.min(...ys),
    x1: Math.max(...xs),
    y1: Math.max(...ys),
  };
}

function touching(one: Box, other: Box): boolean {
  return (
    one.x0 <= other.x1 &&
    other.x0 <= one.x1 &&
    one.y0 <= other.y1 &&
    other.y0 <= one.y1
  );
}

/**
 * Splits one face path into the fewest paths that still draw the same face.
 *
 * Subpaths that overlap have to share a path or even-odd changes what is a hole
 * and what is solid, so this takes connected groups of the overlap graph. Every
 * group that sits entirely in the top band is a brow or an eye and gets tagged.
 * A face whose mouth reaches up into that band simply has nothing tagged, and
 * renders with the eyes it was drawn with.
 */
function splitFace(name: string, path: ArtPath): ArtPath[] {
  const subpaths = path.d.split(/(?=[Mm])/).filter((piece) => piece.trim());
  if (subpaths.length < 2) return [path];
  const boxes = subpaths.map(controlBox);

  const owner = subpaths.map((_, at) => at);
  const rootOf = (at: number): number =>
    owner[at] === at ? at : (owner[at] = rootOf(owner[at]));
  for (let one = 0; one < subpaths.length; one += 1)
    for (let other = one + 1; other < subpaths.length; other += 1)
      if (touching(boxes[one], boxes[other]))
        owner[rootOf(one)] = rootOf(other);

  const grouped = new Map<number, number[]>();
  for (let at = 0; at < subpaths.length; at += 1) {
    const root = rootOf(at);
    if (!grouped.has(root)) grouped.set(root, []);
    grouped.get(root)!.push(at);
  }
  if (grouped.size < 2) return [path];

  const groups = [...grouped.values()].map((members) => {
    const box = members
      .map((at) => boxes[at])
      .reduce((joined, next) => ({
        x0: Math.min(joined.x0, next.x0),
        y0: Math.min(joined.y0, next.y0),
        x1: Math.max(joined.x1, next.x1),
        y1: Math.max(joined.y1, next.y1),
      }));
    return { d: members.map((at) => subpaths[at]).join(""), box };
  });

  const top = Math.min(...groups.map((group) => group.box.y0));
  const bottom = Math.max(...groups.map((group) => group.box.y1));
  const band = top + (bottom - top) * EYE_BAND;

  const out = groups.map((group) => ({
    ...path,
    d: group.d,
    // Only a group clear of the band is a brow or an eye. A group that crosses
    // it is a mouth that opens high, and growing that would stretch the face.
    ...(group.box.y1 <= band
      ? {
          eyes: {
            cx: round((group.box.x0 + group.box.x1) / 2),
            cy: round((group.box.y0 + group.box.y1) / 2),
          },
        }
      : {}),
  }));
  if (!out.some((piece) => piece.eyes))
    console.warn(`  ${name}: no brows or eyes could be separated`);
  return out;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function write(
  file: string,
  exportName: string,
  pieces: Record<string, unknown>,
  /** A last pass over one drawing's paths, for the face split above. */
  refine?: (name: string, piece: ArtPiece) => ArtPiece,
) {
  const entries = Object.entries(pieces).map(([name, drawing]) => {
    const markup = renderToStaticMarkup(
      React.createElement(
        drawing as React.FC<{ strokeColor: string; backgroundColor: string }>,
        {
          strokeColor: LINE,
          backgroundColor: FILL,
        },
      ),
    );
    const piece = convert(name, markup);
    return [name, refine ? refine(name, piece) : piece] as const;
  });

  const body = entries
    .map(([name, piece]) => `  ${name}: ${JSON.stringify(piece)},`)
    .join("\n");
  const source = [
    "// Generated by scripts/generate-art.ts from the Open Peeps drawings in",
    "// react-peeps (MIT code, CC0 art). Do not edit by hand: run `bun run art`.",
    "import type { ArtPiece } from '../types';",
    "",
    `export const ${exportName}: Record<string, ArtPiece> = {`,
    body,
    "};",
    "",
  ].join("\n");

  await writeFile(path.join(outputDirectory, file), source);
  console.log(
    `${file}: ${entries.length} pieces, ${entries.reduce((total, [, piece]) => total + piece.paths.length, 0)} paths`,
  );
}

await mkdir(outputDirectory, { recursive: true });
await write("hair.ts", "hairArt", Hair);
await write("faces.ts", "faceArt", Face, (name, piece) => ({
  ...piece,
  paths: piece.paths.flatMap((path) => splitFace(name, path)),
}));
await write("accessories.ts", "accessoryArt", Accessories);
await write("poses.ts", "poseArt", BustPose);
