/**
 * An Avatar is seven positions and nothing else: no Pose, no name and no photo.
 *
 * The positions point into the lists in `catalog.ts`. Anything that arrives
 * from outside the app — a Cutout made by an older version, a hand-edited Class
 * File — is read through `settleAvatar`, which replaces a position that isn't a
 * real slot with that list's default. One odd value never blocks an import.
 */
import {
  ages,
  clothingColors,
  expressions,
  eyewear,
  hairColors,
  hairstyles,
  settle,
  skinTones,
  type PartList,
} from "./catalog";

export interface Avatar {
  age: number;
  skinTone: number;
  hairstyle: number;
  hairColor: number;
  eyewear: number;
  expression: number;
  clothingColor: number;
}

const lists: { [Part in keyof Avatar]: PartList<unknown> } = {
  age: ages,
  skinTone: skinTones,
  hairstyle: hairstyles,
  hairColor: hairColors,
  eyewear,
  expression: expressions,
  clothingColor: clothingColors,
};

export const avatarParts = Object.keys(lists) as (keyof Avatar)[];

export function defaultAvatar(): Avatar {
  return {
    age: ages.fallback,
    skinTone: skinTones.fallback,
    hairstyle: hairstyles.fallback,
    hairColor: hairColors.fallback,
    eyewear: eyewear.fallback,
    expression: expressions.fallback,
    clothingColor: clothingColors.fallback,
  };
}

export function settleAvatar(value: unknown): Avatar {
  const given = (value ?? {}) as Partial<Record<keyof Avatar, unknown>>;
  const settled = {} as Avatar;
  for (const part of avatarParts)
    settled[part] = settle(lists[part], given[part]);
  return settled;
}

export function sameAvatar(one: Avatar, other: Avatar): boolean {
  return avatarParts.every((part) => one[part] === other[part]);
}
