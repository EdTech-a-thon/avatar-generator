# 06 — Manage Students and Classes

**What to build:** A Teacher tidies up their Class. They turn "MAYA!!!" into "Maya R.", reopen a Student's Avatar in the Builder when the Student gets glasses, and permanently remove a child who moved away. A Teacher with several groups creates, renames, switches between and deletes Classes. The app is still designed around a single Class. See the spec's user stories under Setting up and Managing a Class, and ADR 0008.

**Blocked by:** 03 — A Class fills up from "Add a student" tabs

**Status:** resolved

- [x] The Teacher can edit a Student's Display Name, and the change saves immediately.
- [x] The Teacher can open an existing Student's Avatar in the Builder with its current choices selected. Finishing replaces that Student's Avatar and keeps its Display Name.
- [x] The Teacher can permanently delete a Student after a confirmation.
- [x] The Teacher can create a new Class, rename any Class, and switch which Class is shown.
- [x] The Teacher can permanently delete a Class and all its Students after a confirmation.
- [x] With only one Class, managing Classes stays out of the way.
- [x] "Add a student" always adds to the Class it was opened from, even if the Teacher switches Classes in the other tab.
- [x] End-to-end tests cover each action above and check that the results persist across a reload.
