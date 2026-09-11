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
 */
import type { Avatar } from "./avatar";
import {
  clothingColors,
  entryAt,
  eyewearPiece,
  facePiece,
  hairColors,
  hairPiece,
  posePiece,
  skinTones,
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

function place(
  piece: ArtPiece,
  at: string | undefined,
  line: string,
  fill: string,
): FigureGroup {
  const transform = [at, piece.transform].filter(Boolean).join(" ");
  return {
    ...(transform ? { transform } : {}),
    paths: piece.paths.map((path) => ({
      d: path.d,
      ...(path.transform ? { transform: path.transform } : {}),
      fill:
        path.fill === "line" ? line : path.fill === "fill" ? fill : path.fill,
      ...(path.fillRule ? { fillRule: path.fillRule } : {}),
    })),
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

  const groups: FigureGroup[] = [];
  if (options.framing === "bust") {
    groups.push(place(posePiece(options.pose ?? 0), undefined, BLACK, clothes));
  }
  groups.push(place(hairPiece(avatar.hairstyle), HEAD, hair, skin));
  groups.push(place(facePiece(expression), FACE, BLACK, skin));
  const glasses = eyewearPiece(avatar.eyewear);
  if (glasses) groups.push(place(glasses, EYEWEAR, BLACK, skin));
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
