/**
 * What the Teacher is making right now.
 *
 * The whole set and a single replacement piece have to come out the same, or a
 * Teacher who loses one clothespin ends up with one face on a chart of
 * head-and-shoulders. So the choices live here, next to nothing else, and both
 * the Chart pieces panel and a Student's own Download button read them.
 *
 * None of this is saved: it describes one download, not the Class.
 */
import type { Framing } from "./render";

export const chart = $state({
  framing: "head" as Framing,
  pose: 0,
  /** Give everyone the same face, instead of each Student's own. */
  sameFace: false,
  face: 0,
  /** School colors for spirit week. */
  sameClothes: false,
  clothes: 0,
  withNames: true,
  includeMe: false,
});

export function chartExpression(): number | undefined {
  return chart.sameFace ? chart.face : undefined;
}

export function chartClothingColor(): number | undefined {
  return chart.sameClothes ? chart.clothes : undefined;
}
