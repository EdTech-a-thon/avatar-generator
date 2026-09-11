# 04 — Import Cutouts into a Class

**What to build:** A Teacher downloads the Cutouts Students turned in and drops them all into their Class at once. Each Cutout becomes a new Student, named from the name hidden inside it. If a Cutout has no name, the Teacher is asked to type one. Screenshots, resized images and other files that aren't Cutouts get a clear message instead of silently doing nothing. See the spec's Import rules section and ADR 0009.

**Blocked by:** 02 — A Student saves and reopens their own Cutout; 03 — A Class fills up from "Add a student" tabs

**Status:** resolved

- [x] The Class view accepts several files at once, through dropping and through a file picker.
- [x] Each valid Cutout adds exactly one new Student with the hidden Avatar and the hidden name as its Display Name. The app never tries to match it to an existing Student.
- [x] For a valid Cutout with no name, the Teacher is asked to type a Display Name before that Student is added.
- [x] A PNG with no Avatar data shows: "This picture doesn't have avatar info inside. Ask the student to turn in the saved file, not a screenshot." A non-PNG file shows a "not a Cutout" message.
- [x] In a mixed drop, each file is handled on its own. Valid Cutouts are added and all messages are shown together.
- [x] Cutouts downloaded from a Cutout Set can be imported the same way.
- [x] End-to-end tests drop: three valid Cutouts at once, a Cutout with no name, and the checked-in negative fixtures from ticket 02. They check the resulting Students and messages.

## Comments

- "Cutouts downloaded from a Cutout Set can be imported the same way" is carried by the codec: a Cutout Set PNG is written by the same `putCutoutData`, so nothing about import needs to know where a picture came from. Ticket 08 adds the test that downloads a set and imports one of its files.
- Three more fixtures were added for this ticket (`cutout-maya.png`, `cutout-leo.png`, `cutout-ava.png`) plus `no-name-cutout.png`. Regenerating produced a byte-identical `golden-cutout.png`, so the guarantee in ticket 02 is intact.
