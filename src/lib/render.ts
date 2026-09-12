/**
 * Turns an Avatar into SVG shapes, by the three coloring rules in ADR 0006:
 *
 *   1. the head (hair and face) is filled with the skin tone
 *   2. the body (the Pose) is filled with the clothing color
 *   3. the hair piece's lines are the hair color; every other line is black
 *
 * The result is plain data. `AvatarFigure.svelte` renders it as DOM elements on
 * screen, and the Cutout codec serializes the same data to rasterize a PNG, so
 * what a Student sees and what they download can't drift apart.
 *
 * Pieces are placed exactly where Open Peeps places them: the head sits 225 to
 * the right of the body, the face 159 right and 186 down from the head, and
 * eyewear 47 right and 241 down. Those offsets are part of the drawings.
 *
 * On top of that placement sits the Avatar's age (ADR 0011). Open Peeps only
 * drew grown-ups, so a young Avatar is the same drawings moved: the head grows
 * about the chin, the face slides down and shrinks inside it, the brows and
 * eyes grow back, and the shoulders narrow. A Grown-up Avatar adds no transform
 * at all, so everything saved before ages existed draws exactly as it did.
 */
import type { Avatar } from "./avatar";
import {
  ageShape,
  clothingColors,
  entryAt,
  eyewearPiece,
  facePiece,
  hairColors,
  hairPiece,
  posePiece,
  skinTones,
  type AgeEntry,
} from "./catalog";
import { framing } from "./art/generated/framing";
import type { ArtPiece } from "./art/types";

export type Framing = "head" | "bust";

export interface FigureGroup {
  transform?: string;
  paths: {
    d: string;
    transform?: string;
    fill: string;
    fillRule?: "evenodd" | "nonzero";
  }[];
}

export interface Figure {
  viewBox: string;
  width: number;
  height: number;
  groups: FigureGroup[];
}

export interface FigureOptions {
  avatar: Avatar;
  framing: Framing;
  /** Required for bust framing; ignored for head-only. */
  pose?: number;
  /** A Cutout Set can put one Expression on everybody. */
  expression?: number;
  /** A Cutout Set can put one clothing color on everybody. */
  clothingColor?: number;
}

const HEAD = "translate(225 0)";
const FACE = "translate(225 0) translate(159 186)";
const EYEWEAR = "translate(225 0) translate(47 241)";
const BLACK = "#000000";

/**
 * Where the drawings put a head, measured off every part with
 * `scripts/measure-framing.ts`. The chin is the pivot for both the head and the
 * shoulders, because a head that grows about its own middle leaves the neck.
 */
const SKULL_CENTRE_X = 461;
const CHIN_Y = 503;
/** The middle of the brows, eyes, nose and mouth taken together. */
const FACE_CENTRE_X = 529;
const FACE_CENTRE_Y = 334;

function joined(...parts: (string | undefined)[]): string | undefined {
  const kept = parts.filter(Boolean);
  return kept.length ? kept.join(" ") : undefined;
}

function about(cx: number, cy: number, sx: number, sy: number): string {
  return `translate(${cx} ${cy}) scale(${trim(sx)} ${trim(sy)}) translate(${-cx} ${-cy})`;
}

/** Keeps the transform strings short enough to read in the devtools. */
function trim(value: number): number {
  return Math.round(value * 10000) / 10000;
}

interface AgeTransforms {
  head?: string;
  face?: string;
  body?: string;
  eyeBoost: number;
}

/** A Grown-up gets no transforms, so its markup is what it always was. */
function ageTransforms(age: AgeEntry): AgeTransforms {
  if (age.headScale === 1 && age.bodyScaleX === 1 && age.bodyScaleY === 1)
    return { eyeBoost: 1 };
  const head = joined(
    age.neckSink ? `translate(0 ${age.neckSink})` : undefined,
    about(SKULL_CENTRE_X, CHIN_Y, age.headScale * age.headWiden, age.headScale),
  );
  return {
    head,
    // The face rides the head, then drops and shrinks inside it.
    face: joined(
      head,
      age.featureDrop ? `translate(0 ${age.featureDrop})` : undefined,
      about(FACE_CENTRE_X, FACE_CENTRE_Y, age.featureScale, age.featureScale),
    ),
    body: about(SKULL_CENTRE_X, CHIN_Y, age.bodyScaleX, age.bodyScaleY),
    eyeBoost: age.eyeBoost,
  };
}

function place(
  piece: ArtPiece,
  at: string | undefined,
  line: string,
  fill: string,
  eyeBoost = 1,
): FigureGroup {
  const transform = joined(at, piece.transform);
  return {
    ...(transform ? { transform } : {}),
    paths: piece.paths.map((path) => {
      // `eyes` is only ever set on a face's brows and eyes, and its point is in
      // the same coordinates as `d`, so the growth goes inside the path's own
      // transform rather than outside it.
      const grown =
        path.eyes && eyeBoost !== 1
          ? about(path.eyes.cx, path.eyes.cy, eyeBoost, eyeBoost)
          : undefined;
      const shifted = joined(path.transform, grown);
      return {
        d: path.d,
        ...(shifted ? { transform: shifted } : {}),
        fill:
          path.fill === "line" ? line : path.fill === "fill" ? fill : path.fill,
        ...(path.fillRule ? { fillRule: path.fillRule } : {}),
      };
    }),
  };
}

/** The pieces of one Avatar, in drawing order, already colored. */
export function figureGroups(options: FigureOptions): FigureGroup[] {
  const { avatar } = options;
  const skin = entryAt(skinTones, avatar.skinTone).hex;
  const hair = entryAt(hairColors, avatar.hairColor).hex;
  const clothes = entryAt(
    clothingColors,
    options.clothingColor ?? avatar.clothingColor,
  ).hex;
  const expression = options.expression ?? avatar.expression;
  const age = ageTransforms(ageShape(avatar.age));

  const groups: FigureGroup[] = [];
  if (options.framing === "bust") {
    groups.push(place(posePiece(options.pose ?? 0), age.body, BLACK, clothes));
  }
  groups.push(
    place(hairPiece(avatar.hairstyle), joined(age.head, HEAD), hair, skin),
  );
  groups.push(
    place(
      facePiece(expression),
      joined(age.face, FACE),
      BLACK,
      skin,
      age.eyeBoost,
    ),
  );
  const glasses = eyewearPiece(avatar.eyewear);
  if (glasses)
    groups.push(place(glasses, joined(age.face, EYEWEAR), BLACK, skin));
  return groups;
}

export function figure(options: FigureOptions): Figure {
  const box = framing[options.framing];
  return {
    viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
    width: box.width,
    height: box.height,
    groups: figureGroups(options),
  };
}
