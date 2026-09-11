/**
 * What every Cutout carries inside it, and how a dropped file is read back.
 *
 * The hidden text is one small JSON object: a format version, the Avatar's six
 * positions and the name that was typed. Files made this year have to keep
 * loading in future versions (ADR 0009 and 0010), so the shape is spelled out
 * with names rather than packed, and a position that is out of range for a list
 * falls back to that list's default instead of failing the whole import.
 */
import { settleAvatar, type Avatar } from "../avatar";
import { hiddenText, looksLikePng, withHiddenText } from "./png";

/** Never changed. Older versions of this app look for exactly this keyword. */
export const CUTOUT_KEYWORD = "AvatarGenerator";

export const CUTOUT_FORMAT_VERSION = 1;

export interface CutoutData {
  avatar: Avatar;
  /** The Student's first name. Always stored, even when no label is shown. */
  name: string;
}

export type CutoutReading =
  | ({ kind: "cutout" } & CutoutData)
  | { kind: "not-a-png" }
  | { kind: "no-avatar-data" };

export function encodeCutoutData({ avatar, name }: CutoutData): string {
  return JSON.stringify({ version: CUTOUT_FORMAT_VERSION, ...avatar, name });
}

export function decodeCutoutData(text: string): CutoutData | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) return undefined;
  const held = parsed as Record<string, unknown>;
  // A Cutout saved by an older version still opens: part lists only ever grow
  // (ADR 0010), so the positions inside it still mean what they meant. Only a
  // version that doesn't exist yet is refused, because we can't read the
  // future. Teachers' drives are full of these files for years (ADR 0009).
  if (
    typeof held.version !== "number" ||
    held.version > CUTOUT_FORMAT_VERSION
  ) {
    return undefined;
  }
  return {
    avatar: settleAvatar(held),
    name: typeof held.name === "string" ? held.name.trim() : "",
  };
}

export function putCutoutData(png: Uint8Array, data: CutoutData): Uint8Array {
  return withHiddenText(png, CUTOUT_KEYWORD, encodeCutoutData(data));
}

/** Reads any file a Teacher or Student drops in. Never throws. */
export function readCutout(bytes: Uint8Array): CutoutReading {
  if (!looksLikePng(bytes)) return { kind: "not-a-png" };
  let text: string | undefined;
  try {
    text = hiddenText(bytes, CUTOUT_KEYWORD);
  } catch {
    return { kind: "not-a-png" };
  }
  if (text === undefined) return { kind: "no-avatar-data" };
  const data = decodeCutoutData(text);
  if (!data) return { kind: "no-avatar-data" };
  return { kind: "cutout", ...data };
}

/** What a Teacher or Student is told when a dropped file can't be used. */
export function cutoutProblem(reading: CutoutReading): string | undefined {
  switch (reading.kind) {
    case "no-avatar-data":
      return "This picture doesn't have avatar info inside. Ask the student to turn in the saved file, not a screenshot.";
    case "not-a-png":
      return "That file isn't a cutout from this app.";
    default:
      return undefined;
  }
}
