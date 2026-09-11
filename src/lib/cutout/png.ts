/**
 * Reading and writing the hidden text inside a PNG.
 *
 * A PNG is a signature followed by a list of chunks. We add one chunk of our
 * own, an international text chunk (`iTXt`), which holds UTF-8 so a name like
 * "José" survives. Not one pixel changes: the picture a Student turns in is an
 * ordinary picture, and the Avatar rides along inside the file (ADR 0009).
 *
 * This file works the same in a browser and in a test, so the tests can read a
 * downloaded Cutout the same way the app does.
 */

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes)
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

export function looksLikePng(bytes: Uint8Array): boolean {
  return SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export interface PngChunk {
  type: string;
  data: Uint8Array;
}

export function readChunks(bytes: Uint8Array): PngChunk[] {
  if (!looksLikePng(bytes)) throw new Error("not a PNG");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: PngChunk[] = [];
  let at = SIGNATURE.length;
  while (at + 8 <= bytes.length) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + length);
    chunks.push({ type, data });
    at += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

export function writeChunks(chunks: PngChunk[]): Uint8Array {
  const size = chunks.reduce(
    (total, chunk) => total + 12 + chunk.data.length,
    SIGNATURE.length,
  );
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  bytes.set(SIGNATURE, 0);
  let at = SIGNATURE.length;
  for (const chunk of chunks) {
    view.setUint32(at, chunk.data.length);
    const typed = new Uint8Array(4);
    for (let index = 0; index < 4; index += 1)
      typed[index] = chunk.type.charCodeAt(index);
    bytes.set(typed, at + 4);
    bytes.set(chunk.data, at + 8);
    const checked = new Uint8Array(4 + chunk.data.length);
    checked.set(typed, 0);
    checked.set(chunk.data, 4);
    view.setUint32(at + 8 + chunk.data.length, crc32(checked));
    at += 12 + chunk.data.length;
  }
  return bytes;
}

/** An `iTXt` chunk: keyword, two compression bytes, two empty tags, UTF-8 text. */
function makeTextChunk(keyword: string, text: string): PngChunk {
  const name = new TextEncoder().encode(keyword);
  const body = new TextEncoder().encode(text);
  const data = new Uint8Array(name.length + 5 + body.length);
  data.set(name, 0);
  // keyword\0, compression flag 0, compression method 0, language\0, translated keyword\0
  data.set([0, 0, 0, 0, 0], name.length);
  data.set(body, name.length + 5);
  return { type: "iTXt", data };
}

function readTextChunk(chunk: PngChunk, keyword: string): string | undefined {
  const decoder = new TextDecoder();
  const end = chunk.data.indexOf(0);
  if (end < 0 || decoder.decode(chunk.data.subarray(0, end)) !== keyword)
    return undefined;
  // Skip the compression flag and method, then the language and translated tags.
  let at = end + 3;
  for (let tags = 0; tags < 2; tags += 1) {
    const next = chunk.data.indexOf(0, at);
    if (next < 0) return undefined;
    at = next + 1;
  }
  return decoder.decode(chunk.data.subarray(at));
}

/** Puts `text` into `png` under `keyword`, replacing anything already there. */
export function withHiddenText(
  png: Uint8Array,
  keyword: string,
  text: string,
): Uint8Array {
  const chunks = readChunks(png).filter(
    (chunk) =>
      !(chunk.type === "iTXt" && readTextChunk(chunk, keyword) !== undefined),
  );
  const end = chunks.findIndex((chunk) => chunk.type === "IEND");
  chunks.splice(end < 0 ? chunks.length : end, 0, makeTextChunk(keyword, text));
  return writeChunks(chunks);
}

export function hiddenText(
  png: Uint8Array,
  keyword: string,
): string | undefined {
  for (const chunk of readChunks(png)) {
    if (chunk.type !== "iTXt") continue;
    const text = readTextChunk(chunk, keyword);
    if (text !== undefined) return text;
  }
  return undefined;
}

/** The same PNG with our text taken out, which is what a re-saved file is like. */
export function withoutHiddenText(
  png: Uint8Array,
  keyword: string,
): Uint8Array {
  return writeChunks(
    readChunks(png).filter(
      (chunk) =>
        !(chunk.type === "iTXt" && readTextChunk(chunk, keyword) !== undefined),
    ),
  );
}
