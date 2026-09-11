# 10 — Class File download and load

**What to build:** A Teacher downloads a Class File whenever they like. It's one JSON file holding every Class, every Student and the Teacher's own Avatar. When their Chromebook wipes its storage, or they move to a new laptop, they load that file into any browser. After a confirmation showing what will be replaced, everything is back. The option is simply available, with no reminders or warnings. See the spec's Classroom store section, and ADR 0008 and 0010.

**Blocked by:** 06 — Manage Students and Classes; 07 — The Teacher's own Avatar

**Status:** ready-for-agent

- [ ] A "download Class File" action is always available and produces one JSON file: a format version (1), the Teacher's Avatar (if any), and all Classes with their Students' Display Names and Avatar positions.
- [ ] A "load Class File" action accepts a file and shows a confirmation summarizing what's currently in the browser (Classes, Student counts, Teacher's Avatar) that will be replaced.
- [ ] Confirming replaces the whole store with the file's contents. Cancelling changes nothing.
- [ ] Invalid or out-of-range Avatar positions fall back to defaults, as they do for Cutouts. A file that isn't a valid Class File shows a friendly message and changes nothing.
- [ ] The app never prompts, nags or auto-downloads a Class File.
- [ ] A golden Class File fixture produced by this ticket is checked in. A test loads it and checks the exact Classes, Students, choices and Teacher's Avatar.
- [ ] An end-to-end test builds several Classes and a Teacher's Avatar, downloads the Class File, loads it into a fresh browser context, confirms, and checks that everything matches.
