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
    // Reading can fail on its own, on a dropped folder or a file that has
    // moved. That is one more file with a problem, not a failed import.
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await file.arrayBuffer());
    } catch {
      reading.problems.push({
        fileName: file.name,
        message: "That file couldn't be read.",
      });
      continue;
    }

    const outcome = readCutout(bytes);
    if (outcome.kind !== "cutout") {
      reading.problems.push({
        fileName: file.name,
        // Dropping a class file on the Class is a reasonable mistake to make,
        // since the page offers to load one a little further down.
        message: file.name.toLowerCase().endsWith(".json")
          ? "That looks like a class file. Use “Load a class file” lower down the page."
          : cutoutProblem(outcome)!,
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
