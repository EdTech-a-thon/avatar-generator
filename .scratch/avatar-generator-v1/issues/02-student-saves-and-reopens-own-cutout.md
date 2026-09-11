# 02 — A Student saves and reopens their own Cutout

**What to build:** A Student on their own device finishes the standalone Builder and downloads a head-only Cutout of themselves, ready to turn in. The picture shows no name, but the Avatar and the typed name are hidden inside the PNG. If they come back to the same device, the Builder remembers their last Avatar. If they drop their saved Cutout onto the Builder, it reopens for editing. See the spec's Cutout codec and Builder sections, and ADR 0009 and 0010.

**Blocked by:** 01 — The Builder shows a live Avatar

**Status:** resolved

- [x] Finishing the standalone Builder downloads a PNG with a transparent background: head-only, favorite Expression, no visible name, under 2000px on its longest side.
- [x] The PNG carries hidden data in a UTF-8 text section under the app's keyword: a format version (1), the Avatar's six positions, and the name. The pixels match the image without the data.
- [x] Names with accented characters (for example "José") survive a save and reload.
- [x] The last Avatar built on a device is restored when the standalone Builder is opened again.
- [x] Dropping a Cutout onto the standalone Builder reopens it with the same choices selected and the name filled in.
- [x] Reading a dropped file reports one of three outcomes: a valid Avatar (with or without a name), not a PNG, or a PNG with no Avatar data. The Builder shows a friendly message for the last two.
- [x] An out-of-range position falls back to that list's default. A retired position still loads.
- [x] A golden Cutout fixture produced by this ticket is checked in. A test loads it and checks the exact choices shown.
- [x] Negative fixtures are checked in and tested: the same Cutout re-saved without hidden data, a non-PNG file, and a Cutout with out-of-range positions.
- [x] End-to-end tests read the hidden data straight from the downloaded PNG and check its dimensions and transparent background.

## Comments

- No part is retired in v1, so "a retired position still loads" is only carried by the code: `entryAt` ignores the flag and renders any position that is a real slot, while `choices` hides retired ones from the Builder. The first retirement should come with a test.
- The Cutout keyword inside the PNG is `AvatarGenerator`, and the hidden text is JSON: `{"version":1,"skinTone":…,"name":"José"}`. Files are already in the wild the moment this ships, so that shape is now fixed (ADR 0009).
