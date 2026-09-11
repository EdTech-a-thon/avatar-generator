# 11 — Privacy page and no outside requests

**What to build:** A principal or district tech reviewer opens a short, plain-language privacy page linked from the app. It says:

- nothing is stored on any server
- there are no accounts, ads, analytics or tracking
- student data is never sold
- everything lives in the Teacher's browser and in files the Teacher chooses to download
- Teachers can delete Students and Classes at any time

The app keeps that promise: it makes no requests to outside services, and fonts and every other asset are self-hosted. See the spec's Platform section and ADR 0008.

**Blocked by:** 01 — The Builder shows a live Avatar

**Status:** ready-for-agent

- [ ] A privacy page reachable from every main screen states each promise above in plain language that a Teacher can read to a principal.
- [ ] All fonts, art and scripts are served from the app itself. There are no hosted fonts, CDNs, analytics or ad scripts.
- [ ] An end-to-end test walks through every screen available at the time, including the Builder and the privacy page, and fails if any request goes to an origin other than the app's own.
- [ ] Later tickets that add screens extend this test to cover them.
