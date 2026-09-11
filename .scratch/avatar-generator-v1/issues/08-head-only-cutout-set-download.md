# 08 — Download a head-only Cutout Set

**What to build:** A Teacher downloads their whole Class as a Cutout Set in one click: a zip of head-only Cutouts, one per Student, each showing the Student's favorite Expression and labeled with their Display Name. The pieces are ready to print, laminate or drop into Slides. Every PNG in the zip carries its Avatar and name, so the zip also works as a recovery copy. The Teacher can also download a single Student's Cutout. See the spec's Cutout Set export and Cutout codec sections, and ADR 0009.

**Blocked by:** 02 — A Student saves and reopens their own Cutout; 03 — A Class fills up from "Add a student" tabs

**Status:** ready-for-agent

- [ ] The Class view offers a Cutout Set download for the current Class.
- [ ] The zip is named after the Class and holds one PNG per Student, named after their Display Name. Duplicate Display Names get a numeric suffix.
- [ ] Each PNG is head-only with the Student's favorite Expression, has a transparent background, and is about 1500px tall.
- [ ] A name label switch starts on and puts the Display Name below the figure in a large, friendly, self-hosted font. Turning it off removes the label.
- [ ] Every PNG carries hidden data (format version, Avatar positions, name), whether or not the label is shown.
- [ ] The Teacher can download one Student's Cutout on its own, with the same rules.
- [ ] End-to-end tests download a Cutout Set and check: the zip name, the entry names including a duplicate suffix, PNG dimensions and transparency, and the hidden data in each entry, with the label on and off.
