# 08 — Download a head-only Cutout Set

**What to build:** A Teacher downloads their whole Class as a Cutout Set in one click: a zip of head-only Cutouts, one per Student, each showing the Student's favorite Expression and labeled with their Display Name. The pieces are ready to print, laminate or drop into Slides. Every PNG in the zip carries its Avatar and name, so the zip also works as a recovery copy. The Teacher can also download a single Student's Cutout. See the spec's Cutout Set export and Cutout codec sections, and ADR 0009.

**Blocked by:** 02 — A Student saves and reopens their own Cutout; 03 — A Class fills up from "Add a student" tabs

**Status:** resolved

- [x] The Class view offers a Cutout Set download for the current Class.
- [x] The zip is named after the Class and holds one PNG per Student, named after their Display Name. Duplicate Display Names get a numeric suffix.
- [x] Each PNG is head-only with the Student's favorite Expression, has a transparent background, and is about 1500px tall.
- [x] A name label switch starts on and puts the Display Name below the figure in a large, friendly, self-hosted font. Turning it off removes the label.
- [x] Every PNG carries hidden data (format version, Avatar positions, name), whether or not the label is shown.
- [x] The Teacher can download one Student's Cutout on its own, with the same rules.
- [x] End-to-end tests download a Cutout Set and check: the zip name, the entry names including a duplicate suffix, PNG dimensions and transparency, and the hidden data in each entry, with the label on and off.

## Comments

- The numeric suffix counts up until the name is free rather than counting Mayas, because a Class can hold "Maya", another "Maya", and a child whose Display Name really is "Maya 2". They come out as `Maya.png`, `Maya 2.png` and `Maya 2 2.png`: ugly, but nobody is missing from the printed chart.
- A single Student's Download uses whatever the Chart pieces panel is set to, so a replacement for one lost clothespin matches the rest of the chart.
