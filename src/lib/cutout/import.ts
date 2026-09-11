/**
 * Reading a pile of files a Teacher just dropped on their Class.
 *
 * Each file is handled on its own: one screenshot in a drop of thirty never
 * stops the other twenty-nine from arriving. A Cutout always becomes a new
 * Student and is never matched against the Class, because two children really
 * can be called Maya; the only thing the app does about that is the marker in
 * ticket 05.
 */
import type { Avatar } from "../avatar";
import { cutoutProblem, readCutout } from "./codec";

export interface ReadFromFile {
  fileName: string;
  avatar: Avatar;
  /** Empty when the picture carries no name, which the Teacher then types. */
  name: string;
}

export interface ImportProblem {
  fileName: string;
  message: string;
}

export interface ImportReading {
  named: ReadFromFile[];
  unnamed: ReadFromFile[];
  problems: ImportProblem[];
}

export async function readCutoutFiles(files: File[]): Promise<ImportReading> {
  const reading: ImportReading = { named: [], unnamed: [], problems: [] };
  for (const file of files) {
    const outcome = readCutout(new Uint8Array(await file.arrayBuffer()));
    if (outcome.kind !== "cutout") {
      reading.problems.push({
        fileName: file.name,
        message: cutoutProblem(outcome)!,
      });
      continue;
    }
    const found = {
      fileName: file.name,
      avatar: outcome.avatar,
      name: outcome.name,
    };
    if (found.name) reading.named.push(found);
    else reading.unnamed.push(found);
  }
  return reading;
}

/** "Maya", "Maya and Leo", "Maya, Leo and Ava". */
export function nameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
