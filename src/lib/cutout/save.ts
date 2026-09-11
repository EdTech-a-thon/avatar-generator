/**
 * Turning a rendered Avatar into a Cutout: a picture that can be printed,
 * laminated, dropped into Slides, or turned in.
 *
 * On screen an Avatar is DOM SVG. A Cutout has to be a PNG, because that is
 * what Google Classroom, Seesaw, Slides and a laminator all understand, so this
 * is the one place the app uses a canvas: it draws the same SVG into one and
 * reads the pixels back out. The hidden Avatar data goes in afterwards, so the
 * picture and the data can never disagree (ADR 0009).
 */
import { figure, type FigureOptions } from "../render";
import { putCutoutData, type CutoutData } from "./codec";
import { LABEL_FAMILY, labelFontFace } from "./font";

/** Seesaw resizes anything bigger, which would throw the hidden data away. */
export const STUDENT_CUTOUT_HEIGHT = 1400;

/** Big enough to print a chart piece at about half a page. */
export const SET_CUTOUT_HEIGHT = 1500;

/** Room under the figure for a name, in the drawing's own units. */
const LABEL_SPACE = 260;

export interface Labelled extends FigureOptions {
  /** The Display Name written under the figure. Nothing is written without it. */
  label?: string;
  /** The `@font-face` to carry inside the picture, from `labelFontFace`. */
  fontFace?: string;
}

/** The box the finished picture covers, which grows when a name is written. */
function boxFor(options: Labelled) {
  const drawn = figure(options);
  const [x, y, width, height] = drawn.viewBox.split(" ").map(Number);
  return options.label
    ? { drawn, x, y, width, height: height + LABEL_SPACE }
    : { drawn, x, y, width, height };
}

export function svgMarkup(options: Labelled): string {
  const box = boxFor(options);
  const shapes = box.drawn.groups
    .map(
      (group) =>
        `<g${group.transform ? ` transform="${group.transform}"` : ""}>` +
        group.paths
          .map(
            (path) =>
              `<path d="${path.d}"` +
              (path.transform ? ` transform="${path.transform}"` : "") +
              ` fill="${path.fill}"` +
              (path.fillRule ? ` fill-rule="${path.fillRule}"` : "") +
              "/>",
          )
          .join("") +
        "</g>",
    )
    .join("");

  let label = "";
  if (options.label) {
    // A long name gets smaller rather than running off the edge of the piece.
    const size = Math.min(
      170,
      Math.round(1500 / Math.max(options.label.length, 1)),
    );
    label =
      `<text x="${box.x + box.width / 2}" y="${box.y + box.height - LABEL_SPACE / 3}"` +
      ` text-anchor="middle" font-family="${LABEL_FAMILY}" font-size="${size}"` +
      ` font-weight="600" fill="#0f172a">${escaped(options.label)}</text>`;
  }

  const style = options.fontFace ? `<style>${options.fontFace}</style>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}">` +
    `${style}${shapes}${label}</svg>`
  );
}

function escaped(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function drawToPng(
  markup: string,
  width: number,
  height: number,
): Promise<Uint8Array> {
  const source = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml" }),
  );
  try {
    const drawing = new Image();
    drawing.width = width;
    drawing.height = height;
    await new Promise<void>((done, failed) => {
      drawing.onload = () => done();
      drawing.onerror = () =>
        failed(new Error("the avatar could not be drawn"));
      drawing.src = source;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const surface = canvas.getContext("2d");
    if (!surface) throw new Error("this browser cannot make pictures");
    // Nothing is painted underneath, so the background stays transparent.
    surface.drawImage(drawing, 0, 0, width, height);

    const png = await new Promise<Blob | null>((done) =>
      canvas.toBlob(done, "image/png"),
    );
    if (!png) throw new Error("the picture could not be saved");
    return new Uint8Array(await png.arrayBuffer());
  } finally {
    URL.revokeObjectURL(source);
  }
}

export interface CutoutOptions extends Labelled {
  /** How tall the finished PNG is. The width follows the drawing's shape. */
  height: number;
  data: CutoutData;
}

/** The PNG bytes of one Cutout, Avatar and name already hidden inside. */
export async function cutoutBytes(options: CutoutOptions): Promise<Uint8Array> {
  const fontFace = options.label ? await labelFontFace() : undefined;
  const withFont = { ...options, fontFace };
  const box = boxFor(withFont);
  const width = Math.round((box.width / box.height) * options.height);
  const png = await drawToPng(svgMarkup(withFont), width, options.height);
  return putCutoutData(png, options.data);
}

export async function cutoutPng(options: CutoutOptions): Promise<Blob> {
  return new Blob([(await cutoutBytes(options)) as BlobPart], {
    type: "image/png",
  });
}

/** A file name a Teacher can find in their downloads, from any name typed. */
export function cutoutFileName(name: string): string {
  return `${tidyName(name) || "avatar"}.png`;
}

/** Keeps a name usable as a file name without mangling "José" or "Maya R.". */
export function tidyName(name: string): string {
  return name.trim().replace(/[^\p{L}\p{N} '-]/gu, "");
}

export function download(blob: Blob, fileName: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
}
