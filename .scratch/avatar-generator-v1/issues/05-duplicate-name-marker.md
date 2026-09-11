# 05 — Duplicate-name marker

**What to build:** When Maya turns in a second version of her Avatar, the Teacher's Class shows the new Student with the marker "There's already a Maya. Replace her Avatar instead?". One click moves the new Avatar onto the original Maya and removes the extra Student. Ignoring it keeps both, for when two children really do share a name. This works the same whether the new Student came from an imported Cutout or an "Add a student" tab. See the spec's Import rules section.

**Blocked by:** 04 — Import Cutouts into a Class

**Status:** ready-for-agent

- [ ] A new Student whose Display Name exactly matches an existing Student's in the same Class shows the marker in the Class view.
- [ ] The marker never appears in the Builder tab.
- [ ] "Replace" gives the existing Student the new Avatar, removes the new Student, and clears the marker.
- [ ] Dismissing the marker keeps both Students and clears the marker.
- [ ] Markers survive a reload until they're resolved.
- [ ] Matching is exact. Names that differ in capitalization or wording don't trigger a marker.
- [ ] End-to-end tests cover:
  - [ ] a second "Maya" arriving through import and through an "Add a student" tab
  - [ ] Replace leaves one Maya with the new Avatar
  - [ ] Dismiss leaves two
