# 07 — The Teacher's own Avatar

**What to build:** A Teacher builds an Avatar of themselves in the same Builder their Students use, opened as "me". It skips the name question and is kept separately from every Class, so it doesn't need rebuilding for each Class. The Teacher can reopen and change it at any time. See the spec's Builder and Classroom store sections, and the Teacher term in `CONTEXT.md`.

**Blocked by:** 03 — A Class fills up from "Add a student" tabs

**Status:** ready-for-agent

- [ ] The app offers a way to build "my Avatar" that opens the Builder without the name step.
- [ ] Finishing saves the Teacher's Avatar separately from any Class. It never appears as a Student.
- [ ] The Teacher's Avatar appears somewhere visible in the app, and reopening it shows its current choices.
- [ ] Deleting or switching Classes doesn't affect the Teacher's Avatar.
- [ ] The Teacher's Avatar persists across a reload.
- [ ] End-to-end tests cover creating, reopening, changing and reloading the Teacher's Avatar, and check that it never shows up in a Class's Student list.
