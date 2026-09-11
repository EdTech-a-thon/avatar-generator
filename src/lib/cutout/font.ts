/**
 * The font a name label is drawn in, carried inside the picture.
 *
 * A PNG is made by drawing an SVG into a canvas, and a browser will not fetch
 * anything an SVG being drawn that way asks for. So the font has to travel
 * inside the SVG itself, as bytes. They come from the app's own files: a hosted
 * font would break the promise that nothing here talks to anyone else.
 */
import { base } from "$app/paths";

let carried: string | undefined;

/** Falls back to whatever the device has, rather than failing a download. */
export async function labelFontFace(): Promise<string> {
  if (carried !== undefined) return carried;
  try {
    const response = await fetch(`${base}/fonts/fredoka.woff2`);
    // A 404 resolves like any other response, and carrying its body into the
    // picture would make a broken font instead of an honest fallback.
    if (!response.ok) throw new Error("the font is not there");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    carried = `@font-face{font-family:'CutoutLabel';font-weight:400 600;src:url(data:font/woff2;base64,${btoa(binary)}) format('woff2');}`;
  } catch {
    carried = "";
  }
  return carried;
}

export const LABEL_FAMILY =
  "'CutoutLabel', ui-rounded, 'Segoe UI', system-ui, sans-serif";
