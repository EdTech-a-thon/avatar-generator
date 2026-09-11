# 03 — A Class fills up from "Add a student" tabs

**What to build:** A Teacher opens the app and already has a Class, with no setup and no account. They click "Add a student", which opens the Builder in a new tab. A child builds their Avatar and types their first name. The child is added to the Class as a new Student, and the tab resets for the next child. The Teacher's Class tab shows each new Student without reloading, and everything is still there after a reload. See the spec's Classroom store, Import rules and Builder sections, and ADR 0008.

**Blocked by:** 01 — The Builder shows a live Avatar

**Status:** resolved

- [x] On first open, a default Class exists and the Class view shows it with no Students.
- [x] The Class view lists every Student with their head-only Avatar and Display Name.
- [x] "Add a student" opens the Builder in a new tab, tied to that Class.
- [x] Finishing in that tab adds exactly one new Student whose Display Name is the name exactly as typed, then resets the Builder to a fresh start.
- [x] Finishing never asks the child about duplicates or other Students, and never downloads a file.
- [x] The Class tab shows new Students without a reload.
- [x] Every change saves to browser local storage right away, and a reload keeps the Class and its Students.
- [x] The Teacher can use "Add a student" to build an Avatar for an absent child.
- [x] End-to-end tests cover:
  - [x] the two-tab flow (finish in the Builder tab, the Student appears in the Class tab)
  - [x] two Students added in a row, with the reset between them
  - [x] persistence across a reload
