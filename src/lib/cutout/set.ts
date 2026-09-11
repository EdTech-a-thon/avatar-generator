/**
 * A whole Class of Cutouts in one zip: the behavior chart, in one click.
 *
 * The pieces are made the same way a Student's own Cutout is, so every PNG in
 * the zip carries its Avatar and name (ADR 0009). That makes a Cutout Set a
 * recovery copy as well as a set of chart pieces: dropping the files back into
 * a Class rebuilds the Students.
 */
import { zipSync } from "fflate";
import type { Student } from "../classroom.svelte";
import type { Framing } from "../render";
import { cutoutBytes, SET_CUTOUT_HEIGHT, tidyName } from "./save";

export interface CutoutSetOptions {
  className: string;
  students: Student[];
  framing: Framing;
  pose?: number;
  /** One Expression for everybody, instead of each Student's own. */
  expression?: number;
  /** One clothing color for everybody, for spirit week. */
  clothingColor?: number;
  /** The Display Name written under each figure. On by default. */
  label: boolean;
}

/**
 * "Maya", then "Maya 2": two children with one name still get one file each.
 *
 * It counts up until the name is free rather than counting how many Mayas it
 * has seen, because a Class can hold a Maya, another Maya, and a child whose
 * Display Name really is "Maya 2". Two entries with one name would mean a child
 * silently missing from the printed chart.
 */
export function entryNames(students: Student[]): string[] {
  const used = new Set<string>();
  return students.map((student) => {
    const name = tidyName(student.name) || "avatar";
    let entry = `${name}.png`;
    for (let seen = 2; used.has(entry); seen += 1)
      entry = `${name} ${seen}.png`;
    used.add(entry);
    return entry;
  });
}

export function cutoutSetFileName(
  className: string,
  poseLabel?: string,
): string {
  const room = tidyName(className) || "My class";
  return poseLabel
    ? `${room} ${tidyName(poseLabel)}.zip`
    : `${room} cutouts.zip`;
}

export async function cutoutSetZip(options: CutoutSetOptions): Promise<Blob> {
  const names = entryNames(options.students);
  const entries: Record<string, Uint8Array> = {};

  for (const [index, student] of options.students.entries()) {
    entries[names[index]] = await cutoutBytes({
      avatar: student.avatar,
      framing: options.framing,
      pose: options.pose,
      expression: options.expression,
      clothingColor: options.clothingColor,
      height: SET_CUTOUT_HEIGHT,
      ...(options.label ? { label: student.name } : {}),
      // The hidden data always holds the Student's own choices, never the
      // Teacher's overrides: the picture is for the chart, the data is theirs.
      data: { avatar: student.avatar, name: student.name },
    });
  }

  return new Blob([zipSync(entries, { level: 0 }) as BlobPart], {
    type: "application/zip",
  });
}
