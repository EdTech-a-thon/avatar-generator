# Fixtures

Made by `bun run fixtures`, which drives the real app and saves what it
downloads. Don't edit them by hand, and don't regenerate them casually: the
point of the golden files is that v1 saved them, and every later version has to
keep opening them with the same choices (ADR 0010).

| File                                                  | What it is                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `golden-cutout.png`                                    | Skin tone 8, Afro, blonde, round glasses, laughing, green, "José"      |
| `cutout-maya.png`, `cutout-leo.png`, `cutout-ava.png`  | Three turned-in Cutouts, for importing a small class at once            |
| `no-name-cutout.png`                                   | A Cutout with no name inside, so the Teacher is asked for one           |
| `no-avatar-data.png`                                   | The golden picture with the hidden text taken out, like a re-saved one  |
| `out-of-range-cutout.png`                              | Names a hairstyle and an Expression this version doesn't have           |
| `not-a-cutout.txt`                                     | Not a picture at all                                                    |
| `golden-class-file.json`                               | A Class File with Maya, Leo and the Teacher's own Avatar                |
| `class-file-out-of-range.json`                         | The same file with Maya pointing at parts this version doesn't have     |
