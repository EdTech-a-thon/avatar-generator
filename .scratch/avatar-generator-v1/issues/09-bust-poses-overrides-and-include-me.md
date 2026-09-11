# 09 — Bust Poses, overrides and "include me" in Cutout Sets

**What to build:** A Teacher making behavior chart pieces picks bust framing and one of the 23 bust Poses, such as pointing up or holding a paper, for the whole Class. By default each Student keeps their own favorite Expression and clothing color. For a matching look, the Teacher can switch everyone to one Expression, or to school colors for spirit week. They can add their own Cutout with an "include me" switch, preview the set, and download it. See the spec's Avatar renderer and Cutout Set export sections, and ADR 0006 and 0007.

**Blocked by:** 07 — The Teacher's own Avatar; 08 — Download a head-only Cutout Set

**Status:** resolved

- [x] The renderer draws bust framing: a head on any of the 23 allowed bust Poses. The body fill is the clothing color with black lines, per ADR 0006.
- [x] The Cutout Set options offer head-only or bust framing. Bust framing requires choosing a Pose, shown as pictures with accessible names.
- [x] Optional overrides: one Expression for everyone, and one clothing color for everyone. Without them, each Student's own values are used.
- [x] An "include me" switch starts off. When on, the Teacher's own Avatar is added to the set, and the switch is disabled when the Teacher has no Avatar.
- [x] A preview shows the set with the current framing, Pose, overrides and labels before downloading.
- [x] A bust Cutout Set zip is named after the Class and the Pose.
- [x] The hidden data in each PNG still holds the Avatar's own favorite Expression and clothing color, not the overrides.
- [x] End-to-end tests cover:
  - [x] a bust set in a chosen Pose
  - [x] each override
  - [x] include me on and off, including the file count
  - [x] the zip name with a Pose

## Comments

- The Teacher's own piece is called "Teacher.png" and labelled "Teacher", because the Teacher's Avatar has no Display Name (ticket 07 skips the name question). If that reads wrong in a classroom, the fix is a name on the Teacher's Avatar, not a name typed into the Cutout Set.
- The preview is deliberately not a list. The Class already has one list of Students, and a second would make "the students" ambiguous to a screen reader.
