# An Avatar's age is a transform, not a drawing

Open Peeps only drew grown-ups, which ADR-0005 wrote down as a known cost: Students looked like grown-ups from the neck down. Rather than draw a second set of parts, a young Avatar is the same drawings placed differently: the head grows about the chin, the face slides down and shrinks inside it, the brows and eyes grow back, and the shoulders narrow. Those four moves are what "child" looks like, and none of them is a shape.

We chose this over drawing or warping child art because it costs no art at all and covers every combination the catalog can make — 48 hairstyles by 19 Expressions by 23 Poses, at every age, with nothing left to draw. A Student picks their age in the Builder as a picture, like every other choice, and it is stored on the Avatar, so it rides inside the Cutout PNG to the Teacher along with everything else about them.

This amends ADR-0005. We still add, remove and reshape nothing, but we no longer place every part exactly where Open Peeps places it.

## Consequences

- Age is position 0 of an append-only list (ADR-0010), and position 0 is Grown-up with every factor at 1. A Grown-up Avatar has no transform at all, so every Cutout and Class File saved before ages existed draws exactly as it always did, with no version bump anywhere.
- Scaling scales the line work with it, so a young Avatar's outlines are slightly heavier than a grown-up's. At the sizes a Cutout prints, this doesn't read.
- A silhouette can't change. The jaw is an adult jaw, smaller and lower. Only new art would fix that.
- Every age shares one framing box, because a Cutout Set has to print at one size whoever is in the Class. The box is measured across all ages, so a grown-up now sits in a slightly roomier frame than before.
- A young head is drawn physically larger than a grown-up's, which is how the proportion reads. On a chart mixing a Teacher with their Students, the children's faces are the bigger ones.
- Each Expression is one compound path whose brows and eyes have to be separated before they can grow. Even-odd fill is worked out per path, so subpaths whose boxes touch stay in one path and only whole groups clear of the rest are ever split. Four faces — including Amazed and Cheering — can't be separated at all and keep the eyes they were drawn with.
- Nothing stops a young Avatar choosing grey hair, a comb-over or a blazer. If that turns out to matter, the fix is a flag on those entries filtered out of the Builder's `order`, not a change here.
