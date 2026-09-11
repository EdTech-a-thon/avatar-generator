# 05 — Duplicate-name marker

**What to build:** When Maya turns in a second version of her Avatar, the Teacher's Class shows the new Student with the marker "There's already a Maya. Replace her Avatar instead?". One click moves the new Avatar onto the original Maya and removes the extra Student. Ignoring it keeps both, for when two children really do share a name. This works the same whether the new Student came from an imported Cutout or an "Add a student" tab. See the spec's Import rules section.

**Blocked by:** 04 — Import Cutouts into a Class

**Status:** resolved

- [x] A new Student whose Display Name exactly matches an existing Student's in the same Class shows the marker in the Class view.
- [x] The marker never appears in the Builder tab.
- [x] "Replace" gives the existing Student the new Avatar, removes the new Student, and clears the marker.
- [x] Dismissing the marker keeps both Students and clears the marker.
- [x] Markers survive a reload until they're resolved.
- [x] Matching is exact. Names that differ in capitalization or wording don't trigger a marker.
- [x] End-to-end tests cover:
  - [x] a second "Maya" arriving through import and through an "Add a student" tab
  - [x] Replace leaves one Maya with the new Avatar
  - [x] Dismiss leaves two

## Comments

- The marker reads "There's already a Maya. Replace their avatar instead?" rather than the "her" in the ticket. The app never knows a child's gender, and a Display Name doesn't tell it, so it doesn't guess.
- The two answers are "Replace" and "Keep both". Both buttons sit on the new Student's card, which is what makes them unambiguous when a Class has several markers at once.
- A third answer exists without a button: removing the Student a marker points at. That clears the marker too, because "Replace Maya's avatar" can't mean anything once Maya is gone. Code review caught this as a Replace button that silently did nothing.
