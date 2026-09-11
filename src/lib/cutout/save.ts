/**
 * Turning a rendered Avatar into a Cutout the Student can turn in.
 *
 * On screen an Avatar is DOM SVG. A Cutout has to be a PNG, because that is
 * what Google Classroom, Seesaw, Slides and a laminator all understand, so this
 * is the one place the app uses a canvas: it draws the same SVG into one and
 * reads the pixels back out. The hidden Avatar data goes in afterwards, so the
 * picture and the data can never disagree (ADR 0009).
 */
import { figure, type FigureOptions } from "../render";
import { putCutoutData, type CutoutData } from "./codec";

/** Seesaw resizes anything bigger, which would throw the hidden data away. */
export const STUDENT_CUTOUT_HEIGHT = 1400;

export function svgMarkup(options: FigureOptions): string {
  const drawn = figure(options);
  const shapes = drawn.groups
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${drawn.viewBox}">${shapes}</svg>`;
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

export interface CutoutOptions extends FigureOptions {
  /** How tall the finished PNG is. The width follows the drawing's shape. */
  height: number;
  data: CutoutData;
}

export async function cutoutPng(options: CutoutOptions): Promise<Blob> {
  const drawn = figure(options);
  const width = Math.round((drawn.width / drawn.height) * options.height);
  const png = await drawToPng(svgMarkup(options), width, options.height);
  return new Blob([putCutoutData(png, options.data) as BlobPart], {
    type: "image/png",
  });
}

/** A file name a Teacher can find in their downloads, from any name typed. */
export function cutoutFileName(name: string): string {
  const tidy = name.trim().replace(/[^\p{L}\p{N} '-]/gu, "");
  return `${tidy || "avatar"}.png`;
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
