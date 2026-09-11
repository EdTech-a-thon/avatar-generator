# Fixtures

Made by `bun run fixtures`, which drives the real Builder and saves what it
downloads. Don't edit them by hand, and don't regenerate them casually: the
point of `golden-cutout.png` is that it was saved by v1 and every later version
has to keep opening it with the same choices (ADR 0010).

| File                      | What it is                                                          |
| ------------------------- | ------------------------------------------------------------------- |
| `golden-cutout.png`       | Skin tone 8, Afro, blonde, round glasses, laughing, green, "José"   |
| `no-avatar-data.png`      | The same picture with the hidden text taken out, like a re-saved one |
| `out-of-range-cutout.png` | Names a hairstyle and an Expression this version doesn't have        |
| `not-a-cutout.txt`        | Not a picture at all                                                 |
