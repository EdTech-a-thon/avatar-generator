# 02 — A Student saves and reopens their own Cutout

**What to build:** A Student on their own device finishes the standalone Builder and downloads a head-only Cutout of themselves, ready to turn in. The picture shows no name, but the Avatar and the typed name are hidden inside the PNG. If they come back to the same device, the Builder remembers their last Avatar. If they drop their saved Cutout onto the Builder, it reopens for editing. See the spec's Cutout codec and Builder sections, and ADR 0009 and 0010.

**Blocked by:** 01 — The Builder shows a live Avatar

**Status:** ready-for-agent

- [ ] Finishing the standalone Builder downloads a PNG with a transparent background: head-only, favorite Expression, no visible name, under 2000px on its longest side.
- [ ] The PNG carries hidden data in a UTF-8 text section under the app's keyword: a format version (1), the Avatar's six positions, and the name. The pixels match the image without the data.
- [ ] Names with accented characters (for example "José") survive a save and reload.
- [ ] The last Avatar built on a device is restored when the standalone Builder is opened again.
- [ ] Dropping a Cutout onto the standalone Builder reopens it with the same choices selected and the name filled in.
- [ ] Reading a dropped file reports one of three outcomes: a valid Avatar (with or without a name), not a PNG, or a PNG with no Avatar data. The Builder shows a friendly message for the last two.
- [ ] An out-of-range position falls back to that list's default. A retired position still loads.
- [ ] A golden Cutout fixture produced by this ticket is checked in. A test loads it and checks the exact choices shown.
- [ ] Negative fixtures are checked in and tested: the same Cutout re-saved without hidden data, a non-PNG file, and a Cutout with out-of-range positions.
- [ ] End-to-end tests read the hidden data straight from the downloaded PNG and check its dimensions and transparent background.
