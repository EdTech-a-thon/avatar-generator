/**
 * Every part a Student can choose, in the order they are stored.
 *
 * ADR 0010: an Avatar is saved as positions in these lists, and Cutouts live in
 * Teachers' drives for years. So the lists only ever grow at the end. A part is
 * never removed, renamed out of its slot or reordered; a part we stop offering
 * is marked `retired`, which hides it from the Builder and keeps it rendering
 * for every file that already points at it. The Builder's order is the separate
 * `order` field, so the two can never be confused.
 */
import type { ArtPiece } from "./art/types";
import { accessoryArt } from "./art/generated/accessories";
import { faceArt } from "./art/generated/faces";
import { hairArt } from "./art/generated/hair";
import { poseArt } from "./art/generated/poses";

export interface PartEntry {
  /** The Open Peeps drawing this entry uses. Empty means "draw nothing". */
  readonly art: string;
  /** What a Student hears or reads. Also how tests pick the option. */
  readonly label: string;
  readonly retired?: boolean;
}

export interface ColorEntry {
  readonly hex: string;
  readonly label: string;
  readonly retired?: boolean;
}

export interface PartList<Entry> {
  /** Stored order. Positions in here are what Cutouts and Class Files hold. */
  readonly stored: readonly Entry[];
  /** Positions in the order the Builder shows them. Retired parts are absent. */
  readonly order: readonly number[];
  /** Where an unknown or out-of-range position lands. */
  readonly fallback: number;
}

function list<Entry extends { retired?: boolean }>(
  stored: readonly Entry[],
  options: { fallback?: number; order?: readonly number[] } = {},
): PartList<Entry> {
  const shown = stored
    .map((entry, position) => (entry.retired ? -1 : position))
    .filter((position) => position >= 0);
  return {
    stored,
    order: options.order ?? shown,
    fallback: options.fallback ?? 0,
  };
}

/** The entries the Builder shows, each with the position that gets stored. */
export function choices<Entry>(
  parts: PartList<Entry>,
): { position: number; entry: Entry }[] {
  return parts.order.map((position) => ({
    position,
    entry: parts.stored[position],
  }));
}

/** Any position that isn't a real slot in this list falls back to its default. */
export function settle<Entry>(
  parts: PartList<Entry>,
  position: unknown,
): number {
  return Number.isInteger(position) &&
    (position as number) >= 0 &&
    (position as number) < parts.stored.length
    ? (position as number)
    : parts.fallback;
}

export function entryAt<Entry>(
  parts: PartList<Entry>,
  position: number,
): Entry {
  return parts.stored[settle(parts, position)];
}

// --- Skin tones -------------------------------------------------------------
// The head is filled with this color (ADR 0006). They are numbered rather than
// named: a child picks the one that looks like them, and no name has to carry
// the weight of describing a person's skin.

export const skinTones = list<ColorEntry>(
  [
    { hex: "#fde3d0", label: "Skin tone 1" },
    { hex: "#f8d0b0", label: "Skin tone 2" },
    { hex: "#f0bb95", label: "Skin tone 3" },
    { hex: "#e0a377", label: "Skin tone 4" },
    { hex: "#c98a5e", label: "Skin tone 5" },
    { hex: "#ab6f47", label: "Skin tone 6" },
    { hex: "#8d5a38", label: "Skin tone 7" },
    { hex: "#6f4529", label: "Skin tone 8" },
    { hex: "#56341f", label: "Skin tone 9" },
    { hex: "#3d2616", label: "Skin tone 10" },
  ],
  { fallback: 4 },
);

// --- Hairstyles -------------------------------------------------------------
// Every Open Peeps hair piece except the three medical headwear pieces
// (DocBouffant, DocSurgery, DocShield), which a Student would never wear.

export const hairstyles = list<PartEntry>([
  { art: "Afro", label: "Afro" },
  { art: "Bald", label: "Bald" },
  { art: "BaldSides", label: "Bald with hair on the sides" },
  { art: "BaldTop", label: "Thinning on top" },
  { art: "Bangs", label: "Bangs" },
  { art: "BangsFilled", label: "Thick bangs" },
  { art: "Bear", label: "Bear hat" },
  { art: "Bun", label: "Bun" },
  { art: "BunCurly", label: "Curly bun" },
  { art: "Buns", label: "Two buns" },
  { art: "FlatTop", label: "Flat top" },
  { art: "FlatTopLong", label: "Tall flat top" },
  { art: "HatHip", label: "Beanie hat" },
  { art: "Long", label: "Long hair" },
  { art: "LongAfro", label: "Long afro" },
  { art: "LongBangs", label: "Long hair with bangs" },
  { art: "LongCurly", label: "Long curly hair" },
  { art: "Medium", label: "Medium hair" },
  { art: "MediumBangs", label: "Medium hair with bangs" },
  { art: "MediumBangsFilled", label: "Medium hair with thick bangs" },
  { art: "MediumLong", label: "Medium long hair" },
  { art: "MediumShort", label: "Medium short hair" },
  { art: "MediumStraight", label: "Straight hair" },
  { art: "Mohawk", label: "Mohawk" },
  { art: "MohawkDino", label: "Spiky mohawk" },
  { art: "Pomp", label: "Pompadour" },
  { art: "ShavedRight", label: "Shaved on one side" },
  { art: "ShavedSides", label: "Shaved sides" },
  { art: "ShavedWavy", label: "Wavy with shaved sides" },
  { art: "Short", label: "Short hair" },
  { art: "ShortCurly", label: "Short curly hair" },
  { art: "ShortMessy", label: "Short messy hair" },
  { art: "ShortScratch", label: "Short scruffy hair" },
  { art: "ShortVolumed", label: "Short thick hair" },
  { art: "ShortWavy", label: "Short wavy hair" },
  { art: "BantuKnots", label: "Bantu knots" },
  { art: "Beanie", label: "Winter beanie" },
  { art: "BunFancy", label: "Fancy bun" },
  { art: "CornRows", label: "Cornrows" },
  { art: "CornRowsFilled", label: "Thick cornrows" },
  { art: "GrayBun", label: "Bun with loose strands" },
  { art: "GrayMedium", label: "Medium hair, swept back" },
  { art: "GrayShort", label: "Short hair, swept back" },
  { art: "Hijab", label: "Hijab" },
  { art: "MediumShade", label: "Medium hair with a fringe" },
  { art: "Turban", label: "Turban" },
  { art: "Twists", label: "Twists" },
  { art: "TwistsVolumed", label: "Thick twists" },
]);

// --- Hair colors ------------------------------------------------------------
// Drawn as the hair piece's line color (ADR 0006). Six natural colors only.

export const hairColors = list<ColorEntry>([
  { hex: "#1b1b1b", label: "Black hair" },
  { hex: "#3b2414", label: "Dark brown hair" },
  { hex: "#7a4a24", label: "Brown hair" },
  { hex: "#a0401c", label: "Auburn hair" },
  { hex: "#c9a227", label: "Blonde hair" },
  { hex: "#8a8a8a", label: "Gray hair" },
]);

// --- Eyewear ----------------------------------------------------------------
// Position 0 is "nothing", which is what most Students wear.

export const eyewear = list<PartEntry>([
  { art: "", label: "No glasses" },
  { art: "GlassRound", label: "Round glasses" },
  { art: "GlassRoundThick", label: "Thick round glasses" },
  { art: "GlassAviator", label: "Aviator glasses" },
  { art: "GlassButterfly", label: "Butterfly glasses" },
  { art: "GlassButterflyOutline", label: "Thin butterfly glasses" },
  { art: "GlassClubmaster", label: "Browline glasses" },
  { art: "SunglassClubmaster", label: "Browline sunglasses" },
  { art: "SunglassWayfarer", label: "Sunglasses" },
  { art: "Eyepatch", label: "Eyepatch" },
]);

// --- Expressions ------------------------------------------------------------
// Friendly faces only. Nothing angry, scared, sad or unwell (ADR 0002).

export const expressions = list<PartEntry>([
  { art: "Smile", label: "Smiling" },
  { art: "SmileBig", label: "Big smile" },
  { art: "SmileLol", label: "Laughing" },
  { art: "SmileTeeth", label: "Toothy smile" },
  { art: "SmileNM", label: "Soft smile" },
  { art: "Calm", label: "Calm" },
  { art: "CalmNM", label: "Quiet and calm" },
  { art: "CheersNM", label: "Cheering" },
  { art: "Cute", label: "Cute" },
  { art: "Cheeky", label: "Cheeky" },
  { art: "Awe", label: "Amazed" },
  { art: "LoveGrin", label: "Happy grin" },
  { art: "LoveGrinTeeth", label: "Big happy grin" },
  { art: "EatingHappy", label: "Yum" },
  { art: "EyesClosed", label: "Eyes closed" },
  { art: "Explaining", label: "Explaining" },
  { art: "Driven", label: "Determined" },
  { art: "Blank", label: "Thinking" },
  { art: "Serious", label: "Serious" },
]);

// --- Clothing colors --------------------------------------------------------
// The body is filled with this color (ADR 0006). Head-only Cutouts never show
// it, which is why the Builder shows the color on the swatch itself.

export const clothingColors = list<ColorEntry>([
  { hex: "#e4572e", label: "Red clothes" },
  { hex: "#f4a259", label: "Orange clothes" },
  { hex: "#f2d857", label: "Yellow clothes" },
  { hex: "#79b473", label: "Green clothes" },
  { hex: "#4cb5ab", label: "Teal clothes" },
  { hex: "#4a7fd4", label: "Blue clothes" },
  { hex: "#8f6fd1", label: "Purple clothes" },
  { hex: "#f18fb0", label: "Pink clothes" },
  { hex: "#9aa5b1", label: "Gray clothes" },
  { hex: "#ffffff", label: "White clothes" },
]);

// --- Bust Poses -------------------------------------------------------------
// Head and shoulders only (ADR 0007). Killer, Selena, Device, Gaming and Coffee
// are left out: a knife, a phone and a coffee cup have no place on a chart.

export const poses = list<PartEntry>([
  { art: "Shirt", label: "Shirt" },
  { art: "ShirtFilled", label: "Plain shirt" },
  { art: "ButtonShirt", label: "Button shirt" },
  { art: "PocketShirt", label: "Pocket shirt" },
  { art: "StripedShirt", label: "Striped shirt" },
  { art: "SportyShirt", label: "Sporty shirt" },
  { art: "PoloSweater", label: "Polo sweater" },
  { art: "Sweater", label: "Sweater" },
  { art: "SweaterDots", label: "Spotty sweater" },
  { art: "Turtleneck", label: "Turtleneck" },
  { art: "Hoodie", label: "Hoodie" },
  { art: "Dress", label: "Dress" },
  { art: "BlazerBlackTee", label: "Blazer and t-shirt" },
  { art: "ShirtCoat", label: "Shirt and coat" },
  { art: "DotJacket", label: "Spotty jacket" },
  { art: "FurJacket", label: "Fluffy jacket" },
  { art: "Geek", label: "Shirt and tie" },
  { art: "Thunder", label: "Lightning shirt" },
  { art: "Whatever", label: "Shrugging" },
  { art: "ArmsCrossed", label: "Arms crossed" },
  { art: "PointingUp", label: "Pointing up" },
  { art: "Explaining", label: "Explaining" },
  { art: "Paper", label: "Holding a paper" },
]);

// --- The drawings each list points at ---------------------------------------

export function hairPiece(position: number): ArtPiece {
  return hairArt[entryAt(hairstyles, position).art];
}

export function facePiece(position: number): ArtPiece {
  return faceArt[entryAt(expressions, position).art];
}

export function eyewearPiece(position: number): ArtPiece | undefined {
  const { art } = entryAt(eyewear, position);
  return art ? accessoryArt[art] : undefined;
}

export function posePiece(position: number): ArtPiece {
  return poseArt[entryAt(poses, position).art];
}
