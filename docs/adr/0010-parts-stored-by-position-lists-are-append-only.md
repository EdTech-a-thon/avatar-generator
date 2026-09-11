# Avatar parts are stored by list position, and the lists are append-only

Cutouts and Class Files store each Avatar part (hair, Pose, Expression, color and so on) as its position in that part's list, plus one format version number for the whole file. We chose positions over part names for simplicity. The cost is that the lists are append-only: a part is never removed or reordered, and a retired part stays in its place, hidden from the builder. New parts only go on the end. Removing or reordering a part wouldn't cause an error. It would silently show the wrong hair or Pose in every file already saved, and those files live in Teachers' drives for years.

## Consequences

"Tidying" a part list, such as deleting an unused Pose or sorting hair styles alphabetically, breaks every saved Avatar. The builder's display order must be kept separate from the stored order.
