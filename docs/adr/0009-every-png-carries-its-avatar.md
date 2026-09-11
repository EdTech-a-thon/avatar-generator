# Every PNG the app makes carries its Avatar

Every Cutout is a PNG with the Avatar's data and a name stored in a hidden text section inside the file. Pixels are unchanged, and nothing about the data is visible. A Student turns in a Cutout of themselves (the builder always asks their name) through the school's usual tool. The Teacher drops the Cutouts into a Class, and a Student can drop their own Cutout back into the builder to keep editing. We chose this over a separate data file or link because a Student only has to handle one thing, a picture, and every Cutout a Teacher has ever downloaded doubles as a way to recover Avatars. We chose PNG over JPEG because Cutouts need transparency, JPEG blurs line art, and apps re-save JPEGs more often.

## Consequences

- Anything that re-saves the image throws the data away: Seesaw's automatic resizing, screenshots, copying and pasting an image, and editing apps. A Cutout that went through any of these is just a picture. Importing one shows a message asking for the saved file instead of a screenshot.
- A Cutout shared anywhere carries the name inside it, even when no name is shown on the image. We accepted this because Cutouts aren't expected to be posted publicly.
- Files already out in the world lock in the data format.
