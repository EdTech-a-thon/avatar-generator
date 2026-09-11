/**
 * The Open Peeps drawings, in a shape that has nothing to do with React.
 *
 * Every drawn part is a short list of filled paths. A part has exactly one line
 * color and one fill color (ADR 0005), which is why a path's fill is either
 * `line`, `fill`, or a literal color the drawing insists on (a few glasses
 * lenses). The renderer decides what `line` and `fill` mean for each part, and
 * that is the whole of the coloring rules in ADR 0006.
 */
export type ArtFill = "line" | "fill" | (string & {});

export interface ArtPath {
  d: string;
  transform?: string;
  fill: ArtFill;
  fillRule?: "evenodd" | "nonzero";
}

export interface ArtPiece {
  transform?: string;
  paths: ArtPath[];
}
